<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_sessions', function (Blueprint $table): void {
            $table->string('season')->nullable()->change();
            $table->date('session_date')->nullable()->change();
            $table->text('description')->nullable()->change();
        });
    }

    /**
     * Re-tightening these columns fails on any draft that is still incomplete,
     * because MySQL and MariaDB reject NOT NULL against existing NULL rows.
     * DDL auto-commits, so a partially incomplete draft would revert the
     * earlier columns, fail on a later one, and leave the schema disagreeing
     * with the migrations table. Backfill first so the rollback is total or
     * refused, never half-applied.
     */
    public function down(): void
    {
        $undatedDrafts = DB::table('learning_sessions')
            ->whereNull('session_date')
            ->count();

        if ($undatedDrafts > 0) {
            throw new RuntimeException(
                "Cannot roll back: {$undatedDrafts} learning session(s) have no session_date "
                .'and there is no safe placeholder for a date. Set a date on those rows, or '
                .'delete them, before rolling back this migration.'
            );
        }

        DB::table('learning_sessions')->whereNull('season')->update(['season' => '']);
        DB::table('learning_sessions')->whereNull('description')->update(['description' => '']);

        Schema::table('learning_sessions', function (Blueprint $table): void {
            $table->string('season')->nullable(false)->change();
            $table->date('session_date')->nullable(false)->change();
            $table->text('description')->nullable(false)->change();
        });
    }
};
