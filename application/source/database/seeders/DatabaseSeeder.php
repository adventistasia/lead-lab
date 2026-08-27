<?php

namespace Database\Seeders;

use App\Models\CalendarEvent;
use App\Models\LearningSession;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(['email' => 'admin@leadlab.test'], [
            'name' => 'Lead Lab Admin',
            'password' => 'password',
            'role' => 'admin',
            'is_active' => true,
            'access_status' => User::ACCESS_ACTIVE,
            'must_change_password' => false,
            'email_verified_at' => now(),
        ]);

        User::updateOrCreate(['email' => 'participant@leadlab.test'], [
            'name' => 'Lead Lab Participant',
            'password' => 'password',
            'role' => 'participant',
            'is_active' => true,
            'access_status' => User::ACCESS_ACTIVE,
            'must_change_password' => false,
            'email_verified_at' => now(),
        ]);

        $session = LearningSession::updateOrCreate(
            ['title' => 'Build your weekly lead engine'],
            [
                'category' => 'Lead generation systems',
                'session_date' => now()->addDays(2)->toDateString(),
                'description' => 'A practical session for building a repeatable weekly lead rhythm.',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'is_published' => true,
            ],
        );

        $path = 'lead-lab/resources/lead-lab-demo-notes.txt';
        Storage::disk('local')->put($path, "Lead Lab demo resource\n\nUse this file to validate protected downloads in the local vertical slice.\n");

        $session->resources()->updateOrCreate(
            ['title' => 'Lead Lab demo notes'],
            [
                'stored_path' => $path,
                'mime_type' => 'text/plain',
                'size' => Storage::disk('local')->size($path),
            ],
        );

        $eventStartsAt = now()->addDays(2)->setTime(10, 0);

        CalendarEvent::updateOrCreate(
            ['title' => 'Lead Lab office hours'],
            [
                'starts_at' => $eventStartsAt,
                'ends_at' => $eventStartsAt->addHour(),
                'description' => 'Bring one live question for the group.',
                'location' => 'Lead Lab studio and online',
                'live_broadcast_url' => 'https://example.com/lead-lab/office-hours',
            ],
        );
    }
}
