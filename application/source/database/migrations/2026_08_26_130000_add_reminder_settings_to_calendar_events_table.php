<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('calendar_events', function (Blueprint $table): void {
            $table->boolean('remind_three_days_before')->default(true);
            $table->boolean('remind_one_day_before')->default(true);
            $table->boolean('remind_fifteen_minutes_before')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('calendar_events', function (Blueprint $table): void {
            $table->dropColumn([
                'remind_three_days_before',
                'remind_one_day_before',
                'remind_fifteen_minutes_before',
            ]);
        });
    }
};
