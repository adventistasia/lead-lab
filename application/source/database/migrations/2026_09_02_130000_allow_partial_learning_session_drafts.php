<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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

    public function down(): void
    {
        Schema::table('learning_sessions', function (Blueprint $table): void {
            $table->string('season')->nullable(false)->change();
            $table->date('session_date')->nullable(false)->change();
            $table->text('description')->nullable(false)->change();
        });
    }
};
