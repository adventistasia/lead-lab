<?php

namespace Tests\Unit;

use App\Support\YouTubeVideoReference;
use PHPUnit\Framework\TestCase;

class YouTubeVideoReferenceTest extends TestCase
{
    public function test_it_builds_a_thumbnail_url_from_a_youtube_url(): void
    {
        $this->assertSame(
            'https://i.ytimg.com/vi/abc123XYZ01/hqdefault.jpg',
            YouTubeVideoReference::thumbnailUrl(
                'https://www.youtube.com/watch?v=abc123XYZ01',
            ),
        );
    }

    public function test_it_returns_null_when_a_thumbnail_cannot_be_derived(): void
    {
        $this->assertNull(YouTubeVideoReference::thumbnailUrl(null));
        $this->assertNull(
            YouTubeVideoReference::thumbnailUrl('https://example.com/video'),
        );
    }
}
