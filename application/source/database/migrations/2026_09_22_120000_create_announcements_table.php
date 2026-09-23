<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title', 160);
            $table->string('summary', 500);
            $table->longText('body');
            $table->string('status', 20)->default('draft')->index();
            $table->boolean('is_pinned')->default(false)->index();
            $table->dateTime('published_at')->nullable()->index();
            $table->dateTime('archived_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'is_pinned', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
