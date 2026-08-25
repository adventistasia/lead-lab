<?php

namespace App\Support;

use InvalidArgumentException;

final class YouTubeVideoReference
{
    /**
     * @var list<string>
     */
    private const ALLOWED_HOSTS = [
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtube-nocookie.com',
        'www.youtube-nocookie.com',
        'youtu.be',
    ];

    public static function normalize(?string $input): ?string
    {
        if ($input === null || trim($input) === '') {
            return null;
        }

        $videoId = self::videoIdFromInput($input);

        if ($videoId === null) {
            throw new InvalidArgumentException('Enter a valid YouTube URL or embed code.');
        }

        return 'https://www.youtube.com/watch?v='.$videoId;
    }

    public static function embedUrl(?string $url, string $origin): ?string
    {
        $videoId = $url === null ? null : self::videoIdFromUrl($url);

        if ($videoId === null) {
            return null;
        }

        $query = http_build_query([
            'controls' => 0,
            'rel' => 0,
            'playsinline' => 1,
            'iv_load_policy' => 3,
            'enablejsapi' => 1,
            'origin' => $origin,
        ], '', '&', PHP_QUERY_RFC3986);

        return 'https://www.youtube-nocookie.com/embed/'.rawurlencode($videoId).'?'.$query;
    }

    public static function thumbnailUrl(?string $url): ?string
    {
        $videoId = $url === null ? null : self::videoIdFromUrl($url);

        if ($videoId === null) {
            return null;
        }

        return 'https://i.ytimg.com/vi/'.rawurlencode($videoId).'/hqdefault.jpg';
    }

    private static function videoIdFromInput(string $input): ?string
    {
        $decoded = html_entity_decode(trim($input), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $candidate = $decoded;

        if (str_contains($decoded, '<')) {
            $candidate = self::iframeSource($decoded);
        }

        if ($candidate === null) {
            return null;
        }

        return self::videoIdFromUrl($candidate);
    }

    private static function iframeSource(string $input): ?string
    {
        $matched = preg_match(
            '/<iframe\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|\'([^\']+)\'|([^\s>]+))/i',
            $input,
            $matches,
        );

        if ($matched !== 1) {
            return null;
        }

        foreach (array_slice($matches, 1) as $match) {
            if ($match !== '') {
                return $match;
            }
        }

        return null;
    }

    private static function videoIdFromUrl(string $input): ?string
    {
        $candidate = trim($input);

        if (str_starts_with($candidate, '//')) {
            $candidate = 'https:'.$candidate;
        } elseif (! preg_match('#^[a-z][a-z0-9+.-]*://#i', $candidate)) {
            $candidate = 'https://'.$candidate;
        }

        $parsed = parse_url($candidate);

        if (! is_array($parsed)) {
            return null;
        }

        $host = strtolower(rtrim($parsed['host'] ?? '', '.'));

        if (! in_array($host, self::ALLOWED_HOSTS, true)) {
            return null;
        }

        $path = trim($parsed['path'] ?? '', '/');
        $segments = $path === '' ? [] : explode('/', $path);
        $firstSegment = strtolower($segments[0] ?? '');
        $videoId = null;

        if ($host === 'youtu.be') {
            $videoId = $segments[0] ?? null;
        } elseif ($firstSegment === 'watch') {
            parse_str($parsed['query'] ?? '', $query);
            $videoId = is_string($query['v'] ?? null) ? $query['v'] : null;
        } elseif (in_array($firstSegment, ['embed', 'live', 'shorts', 'v'], true)) {
            $videoId = $segments[1] ?? null;
        }

        return is_string($videoId) && preg_match('/^[A-Za-z0-9_-]{11}$/', $videoId) === 1
            ? $videoId
            : null;
    }
}
