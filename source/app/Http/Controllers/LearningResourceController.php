<?php

namespace App\Http\Controllers;

use App\Models\LearningResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LearningResourceController
{
    public function download(Request $request, LearningResource $learningResource): StreamedResponse
    {
        $session = $learningResource->learningSession;

        abort_unless(
            $request->user()->isAdmin()
                || ($session->is_published && $session->archived_at === null),
            404,
        );
        abort_unless(Storage::disk('local')->exists($learningResource->stored_path), 404);

        return Storage::disk('local')->download(
            $learningResource->stored_path,
            $learningResource->title,
            ['Content-Type' => $learningResource->mime_type ?: 'application/octet-stream'],
        );
    }
}
