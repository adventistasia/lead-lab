<?php

namespace Database\Factories;

use App\Models\CalendarEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CalendarEvent> */
class CalendarEventFactory extends Factory
{
    protected $model = CalendarEvent::class;

    public function definition(): array
    {
        $startsAt = now()->addDays(2)->setTime(10, 0);

        return [
            'title' => fake()->sentence(4),
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->addHour(),
            'description' => fake()->paragraph(),
            'location' => null,
            'live_broadcast_url' => null,
            'remind_three_days_before' => true,
            'remind_one_day_before' => true,
            'remind_fifteen_minutes_before' => true,
        ];
    }
}
