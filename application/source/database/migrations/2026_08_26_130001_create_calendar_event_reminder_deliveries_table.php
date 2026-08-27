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

            $table->unique([
                'calendar_event_id',
                'user_id',
                'offset_minutes',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_event_reminder_deliveries');
    }
};
