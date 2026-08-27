<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $learning_session_id
 * @property int $user_id
 * @property string $title
 * @property string|null $details
 */
#[Fillable(['learning_session_id', 'user_id', 'title', 'details'])]
class SessionQuestion extends Model
{
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

    /** @return HasMany<SessionAnswer, $this> */
    public function answers(): HasMany
    {
        return $this->hasMany(SessionAnswer::class);
    }

    /** @return HasMany<SessionQuestionVote, $this> */
    public function votes(): HasMany
    {
        return $this->hasMany(SessionQuestionVote::class);
    }
}
