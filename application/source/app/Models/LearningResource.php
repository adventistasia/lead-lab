<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['learning_session_id', 'title', 'stored_path', 'mime_type', 'size'])]
class LearningResource extends Model
{
    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    /** @return BelongsTo<LearningSession, $this> */
    public function learningSession(): BelongsTo
    {
        return $this->belongsTo(LearningSession::class);
    }
}
