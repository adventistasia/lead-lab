<?php

namespace Database\Factories;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
            'title' => fake()->sentence(5),
            'summary' => fake()->sentence(16),
            'body' => "## Update\n\n".fake()->paragraph(),
            'status' => Announcement::STATUS_PUBLISHED,
            'is_pinned' => false,
            'published_at' => now(),
            'archived_at' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Announcement::STATUS_DRAFT,
            'published_at' => null,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Announcement::STATUS_ARCHIVED,
            'is_pinned' => false,
            'archived_at' => now(),
        ]);
    }
}
