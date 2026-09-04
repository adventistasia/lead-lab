<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandlePostSize
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->isTooLarge($request)) {
            return $next($request);
        }

        if ($this->isAdminSessionUpload($request)) {
            return back()->withErrors([
                'resources' => 'The batch is too large for one request. Select fewer files and try again, even if each file is within the 10 MB limit.',
            ]);
        }

        throw new PostTooLargeException('The POST data is too large.');
    }

    private function isTooLarge(Request $request): bool
    {
        $contentLength = (int) $request->server('CONTENT_LENGTH', 0);
        $postMaxSize = $this->postMaxSize();

        return $contentLength > 0
            && $postMaxSize > 0
            && $contentLength > $postMaxSize;
    }

    private function isAdminSessionUpload(Request $request): bool
    {
        return in_array($request->getRealMethod(), ['POST', 'PATCH'], true) && (
            $request->is('admin/sessions')
            || $request->is('admin/sessions/*')
        );
    }

    private function postMaxSize(): int
    {
        $postMaxSize = (string) ini_get('post_max_size');

        if ($postMaxSize === '') {
            return 0;
        }

        if (is_numeric($postMaxSize)) {
            return (int) $postMaxSize;
        }

        $metric = strtoupper(substr($postMaxSize, -1));
        $postMaxSize = (int) $postMaxSize;

        return match ($metric) {
            'K' => $postMaxSize * 1024,
            'M' => $postMaxSize * 1048576,
            'G' => $postMaxSize * 1073741824,
            default => $postMaxSize,
        };
    }
}
