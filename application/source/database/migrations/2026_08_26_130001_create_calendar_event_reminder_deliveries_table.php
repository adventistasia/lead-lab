<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_event_reminder_deliveries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('offset_minutes');
            $table->dateTime('scheduled_for')->index();
            $table->string('status', 20)->default('pending')->index();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->dateTime('queued_at')->nullable();
            $table->dateTime('sent_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();

            // Explicit short name: the auto-generated one
            // ("calendar_event_reminder_deliveries_calendar_event_id_user_id_offset_minutes_unique")
            // exceeds MySQL/MariaDB's 64-character identifier limit. SQLite
            // has no such limit, which is why this only surfaces there.
            $table->unique([
                'calendar_event_id',
                'user_id',
                'offset_minutes',
            ], 'reminder_deliveries_event_user_offset_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_event_reminder_deliveries');
    }
};
