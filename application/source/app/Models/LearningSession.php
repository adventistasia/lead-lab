<?php

namespace App\Models;

use Database\Factories\LearningSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $category
 * @property Carbon $session_date
 * @property string $description
 * @property string|null $video_url
 * @property bool $is_published
 */
#[Fillable(['title', 'category', 'session_date', 'description', 'video_url', 'is_published'])]
class LearningSession extends Model
{
    /** @use HasFactory<LearningSessionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'session_date' => 'date',
            'is_published' => 'boolean',
        ];
    }

    /** @return HasMany<LearningResource, $this> */
    public function resources(): HasMany
    {
        return $this->hasMany(LearningResource::class);
    }
}
