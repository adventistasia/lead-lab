<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_sessions', function (Blueprint $table): void {
            $table->dropIndex(['category']);
        });

        Schema::table('learning_sessions', function (Blueprint $table): void {
            $table->renameColumn('category', 'season');
        });

        Schema::table('learning_sessions', function (Blueprint $table): void {
            $table->index('season');
        });
    }

    public function down(): void
    {
        Schema::table('learning_sessions', function (Blueprint $table): void {
            $table->dropIndex(['season']);
        });

        Schema::table('learning_sessions', function (Blueprint $table): void {
            $table->renameColumn('season', 'category');
        });

        Schema::table('learning_sessions', function (Blueprint $table): void {
            $table->index('category');
        });
    }
};
