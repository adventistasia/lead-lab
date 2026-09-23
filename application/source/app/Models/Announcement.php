<?php

namespace App\Models;

use App\Support\AnnouncementContent;
use Database\Factories\AnnouncementFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property string $title
 * @property string $summary
 * @property string $body
 * @property string $status
 * @property bool $is_pinned
 * @property Carbon|null $published_at
 * @property Carbon|null $archived_at
 * @property User|null $createdBy
 * @property User|null $updatedBy
 */
#[Fillable([
    'created_by',
    'updated_by',
    'title',
    'summary',
    'body',
    'status',
    'is_pinned',
    'published_at',
    'archived_at',
])]
class Announcement extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_ARCHIVED = 'archived';

    /** @use HasFactory<AnnouncementFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    /**
     * @param  Builder<Announcement>  $query
     * @return Builder<Announcement>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', self::STATUS_PUBLISHED)
            ->whereNotNull('published_at')
            ->whereNull('archived_at');
    }

    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED
            && $this->published_at !== null
            && $this->archived_at === null;
    }

    public function renderedBody(): string
    {
        return AnnouncementContent::render($this->body);
    }

    /** @return BelongsTo<User, $this> */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, $this> */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /** @return HasMany<AnnouncementEmailDelivery, $this> */
    public function emailDeliveries(): HasMany
    {
        return $this->hasMany(AnnouncementEmailDelivery::class);
    }
}
