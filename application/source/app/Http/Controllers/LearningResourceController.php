<?php

namespace App\Http\Controllers;

use App\Models\LearningResource;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LearningResourceController
{
    public function download(LearningResource $learningResource): StreamedResponse
    {
        abort_unless($learningResource->learningSession->is_published, 404);
        abort_unless(Storage::disk('local')->exists($learningResource->stored_path), 404);

        return Storage::disk('local')->download(
            $learningResource->stored_path,
            $learningResource->title,
            ['Content-Type' => $learningResource->mime_type ?: 'application/octet-stream'],
        );
    }
}
