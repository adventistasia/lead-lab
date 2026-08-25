<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('calendar_events', 'meeting_url')) {
            Schema::table('calendar_events', function (Blueprint $table): void {
                $table->dropColumn('meeting_url');
            });
        }
    }

    public function down(): void
    {
        Schema::table('calendar_events', function (Blueprint $table): void {
            $table->string('meeting_url', 2000)->nullable();
        });
    }
};
