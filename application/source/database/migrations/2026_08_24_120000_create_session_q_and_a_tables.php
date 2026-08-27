<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_questions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('learning_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160);
            $table->text('details')->nullable();
            $table->timestamps();
        });

        Schema::create('session_answers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('session_question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
        });

        Schema::create('session_question_votes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('session_question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['session_question_id', 'user_id']);
        });

        Schema::create('session_answer_votes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('session_answer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['session_answer_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_answer_votes');
        Schema::dropIfExists('session_question_votes');
        Schema::dropIfExists('session_answers');
        Schema::dropIfExists('session_questions');
    }
};
