<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('calendar_events', function (Blueprint $table): void {
            $table->string('location', 255)->nullable()->after('description');
            $table->string('live_broadcast_url', 2000)->nullable()->after('location');
        });
    }

    public function down(): void
    {
        Schema::table('calendar_events', function (Blueprint $table): void {
            $table->dropColumn(['location', 'live_broadcast_url']);
        });
    }
};
