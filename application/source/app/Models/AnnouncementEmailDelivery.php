<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $announcement_id
 * @property int $user_id
 * @property string $status
 * @property int $attempts
 * @property Carbon|null $queued_at
 * @property Carbon|null $sent_at
 * @property string|null $last_error
 * @property Announcement $announcement
 * @property User $user
 */
#[Fillable([
    'announcement_id',
    'user_id',
    'status',
    'attempts',
    'queued_at',
    'sent_at',
    'last_error',
])]
#[Hidden(['last_error'])]
class AnnouncementEmailDelivery extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_QUEUED = 'queued';

    public const STATUS_SENT = 'sent';

    public const STATUS_FAILED = 'failed';

    public const STATUS_CANCELLED = 'cancelled';

    protected function casts(): array
    {
        return [
            'attempts' => 'integer',
            'queued_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Announcement, $this> */
    public function announcement(): BelongsTo
    {
        return $this->belongsTo(Announcement::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
