<?php

namespace App\Models;

use Database\Factories\LearningSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $season
 * @property Carbon $session_date
 * @property string $description
 * @property string|null $video_url
 * @property bool $is_published
 * @property Carbon|null $archived_at
 */
#[Fillable(['title', 'season', 'session_date', 'description', 'video_url', 'is_published', 'archived_at'])]
class LearningSession extends Model
{
    /** @use HasFactory<LearningSessionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'session_date' => 'date',
            'is_published' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }

    /**
     * @param  Builder<LearningSession>  $query
     * @return Builder<LearningSession>
     */
    public function scopeFilterForClassroom(
        Builder $query,
        string $search = '',
        string $season = '',
        ?string $dateFrom = null,
        ?string $dateTo = null,
    ): Builder {
        if ($search !== '') {
            $like = "%{$search}%";

            $query->where(function (Builder $query) use ($like): void {
                $query
                    ->where('title', 'like', $like)
                    ->orWhere('season', 'like', $like)
                    ->orWhere('description', 'like', $like)
                    ->orWhereHas(
                        'resources',
                        fn (Builder $resourceQuery) => $resourceQuery->where(
                            'title',
                            'like',
                            $like,
                        ),
                    );
            });
        }

        if ($season !== '') {
            $query->where('season', $season);
        }

        if ($dateFrom !== null) {
            $query->whereDate('session_date', '>=', $dateFrom);
        }

        if ($dateTo !== null) {
            $query->whereDate('session_date', '<=', $dateTo);
        }

        return $query;
    }

    /** @return HasMany<LearningResource, $this> */
    public function resources(): HasMany
    {
        return $this->hasMany(LearningResource::class);
    }

    /** @return HasMany<SessionQuestion, $this> */
    public function questions(): HasMany
    {
        return $this->hasMany(SessionQuestion::class);
    }
}
