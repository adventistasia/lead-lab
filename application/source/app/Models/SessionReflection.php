<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Visible;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $learning_session_id
 * @property int $user_id
 * @property string $body
 * @property Carbon|null $edited_at
 */
#[Fillable(['learning_session_id', 'user_id', 'body', 'edited_at'])]
#[Visible(['id', 'learning_session_id', 'user_id', 'body', 'edited_at', 'created_at', 'updated_at'])]
class SessionReflection extends Model
{
    protected function casts(): array
    {
        return [
            'edited_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<LearningSession, $this> */
    public function learningSession(): BelongsTo
    {
        return $this->belongsTo(LearningSession::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
