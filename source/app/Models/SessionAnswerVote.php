<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['session_answer_id', 'user_id'])]
class SessionAnswerVote extends Model
{
    /** @return BelongsTo<SessionAnswer, $this> */
    public function answer(): BelongsTo
    {
        return $this->belongsTo(SessionAnswer::class, 'session_answer_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
