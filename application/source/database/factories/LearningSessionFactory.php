<?php

namespace Database\Factories;

use App\Models\LearningSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<LearningSession> */
class LearningSessionFactory extends Factory
{
    protected $model = LearningSession::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(5),
            'category' => fake()->randomElement(['Lead generation systems', 'Conversation skills', 'Execution rhythm']),
            'session_date' => fake()->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'description' => fake()->paragraph(),
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'is_published' => true,
        ];
    }
}
