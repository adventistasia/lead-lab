<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $session_question_id
 * @property int $user_id
 * @property string $body
 */
#[Fillable(['session_question_id', 'user_id', 'body'])]
class SessionAnswer extends Model
{
    /** @return BelongsTo<SessionQuestion, $this> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(SessionQuestion::class, 'session_question_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<SessionAnswerVote, $this> */
    public function votes(): HasMany
    {
        return $this->hasMany(SessionAnswerVote::class);
    }
}
