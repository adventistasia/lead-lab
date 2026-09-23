<?php

namespace App\Support;

use Illuminate\Support\Str;

class AnnouncementContent
{
    public const MAX_BODY_LENGTH = 20000;

    public const MAX_PREVIEW_LENGTH = 500;

    public static function render(string $body): string
    {
        return (string) Str::markdown($body, [
            'allow_unsafe_links' => false,
            'html_input' => 'strip',
        ]);
    }

    public static function preview(string $body): string
    {
        $html = self::render($body);
        $html = preg_replace(
            '/<\s*\/\s*(?:p|h[1-6]|li|blockquote|pre|div|tr|td|th)\s*>|<\s*br\s*\/?\s*>/i',
            ' ',
            $html,
        ) ?? $html;
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = Str::squish($text);

        if (mb_strlen($text, 'UTF-8') <= self::MAX_PREVIEW_LENGTH) {
            return $text;
        }

        $contentLength = self::MAX_PREVIEW_LENGTH - mb_strlen('...', 'UTF-8');

        return rtrim(mb_substr($text, 0, $contentLength, 'UTF-8')).'...';
    }

    public static function validationError(string $body): ?string
    {
        if (preg_match('/<\s*\/?\s*[a-z][^>]*>/i', $body) === 1) {
            return 'HTML tags are not supported. Use the formatting toolbar instead.';
        }

        if (preg_match('/!\[[^\]]*\]\([^)]*\)/', $body) === 1) {
            return 'Images are not supported in announcements.';
        }

        preg_match_all(
            '/\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/',
            $body,
            $matches,
        );

        foreach ($matches[1] as $url) {
            $scheme = parse_url($url, PHP_URL_SCHEME);

            if (! in_array($scheme, ['http', 'https'], true)) {
                return 'Announcement links must use HTTP or HTTPS.';
            }
        }

        return null;
    }
}
