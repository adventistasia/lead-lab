<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['session_question_id', 'user_id'])]
class SessionQuestionVote extends Model
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
}
