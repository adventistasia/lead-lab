<?php

use App\Http\Controllers\AdminCalendarEventController;
use App\Http\Controllers\AdminLearningSessionController;
use App\Http\Controllers\AdminMemberController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LearningResourceController;
use App\Http\Controllers\LearningSessionController;
use App\Http\Controllers\SessionQnaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('auth')->get('registration/pending', function (Request $request) {
    if ($request->user()->canAccessLeadLab()) {
        return redirect()->route('dashboard');
    }

    abort_unless($request->user()->isPending(), 404);

    return Inertia::render('auth/registration-pending', [
        'emailVerified' => $request->user()->hasVerifiedEmail(),
        'emailVerificationRequired' => config('fortify.require_email_verification'),
    ]);
})->name('registration.pending');

Route::middleware(['auth', 'active'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('calendar', CalendarController::class)->name('calendar');
    Route::get('classroom', [LearningSessionController::class, 'index'])->name('classroom.index');
    Route::get('sessions/{learningSession}', [LearningSessionController::class, 'show'])->name('sessions.show');
    Route::get('resources/{learningResource}/download', [LearningResourceController::class, 'download'])->name('resources.download');
    Route::post('sessions/{learningSession}/questions', [SessionQnaController::class, 'storeQuestion'])->name('sessions.questions.store');
    Route::patch('sessions/{learningSession}/questions/{sessionQuestion}', [SessionQnaController::class, 'updateQuestion'])->name('sessions.questions.update');
    Route::delete('sessions/{learningSession}/questions/{sessionQuestion}', [SessionQnaController::class, 'destroyQuestion'])->name('sessions.questions.destroy');
    Route::post('questions/{sessionQuestion}/answers', [SessionQnaController::class, 'storeAnswer'])->name('questions.answers.store');
    Route::patch('questions/{sessionQuestion}/answers/{sessionAnswer}', [SessionQnaController::class, 'updateAnswer'])->name('questions.answers.update');
    Route::delete('questions/{sessionQuestion}/answers/{sessionAnswer}', [SessionQnaController::class, 'destroyAnswer'])->name('questions.answers.destroy');
    Route::post('questions/{sessionQuestion}/vote', [SessionQnaController::class, 'toggleQuestionVote'])->name('questions.vote');
    Route::post('answers/{sessionAnswer}/vote', [SessionQnaController::class, 'toggleAnswerVote'])->name('answers.vote');

    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('classroom', [AdminLearningSessionController::class, 'recordings'])->name('classroom.index');
        Route::get('sessions', [AdminLearningSessionController::class, 'index'])->name('sessions.index');
        Route::get('sessions/{learningSession}/edit', [AdminLearningSessionController::class, 'edit'])->name('sessions.edit');
        Route::post('sessions', [AdminLearningSessionController::class, 'store'])->name('sessions.store');
        Route::match(['post', 'patch'], 'sessions/{learningSession}', [AdminLearningSessionController::class, 'update'])->name('sessions.update');
        Route::delete('resources/{learningResource}', [AdminLearningSessionController::class, 'destroy'])->name('resources.destroy');
        Route::patch('sessions/{learningSession}/publish', [AdminLearningSessionController::class, 'publish'])->name('sessions.publish');
        Route::patch('sessions/{learningSession}/unpublish', [AdminLearningSessionController::class, 'unpublish'])->name('sessions.unpublish');
        Route::patch('sessions/{learningSession}/archive', [AdminLearningSessionController::class, 'archive'])->name('sessions.archive');
        Route::patch('sessions/{learningSession}/restore', [AdminLearningSessionController::class, 'restore'])->name('sessions.restore');
        Route::post('calendar-events', [AdminCalendarEventController::class, 'store'])->name('calendar-events.store');
        Route::patch('calendar-events/{calendarEvent}', [AdminCalendarEventController::class, 'update'])->name('calendar-events.update');
        Route::delete('calendar-events/{calendarEvent}', [AdminCalendarEventController::class, 'destroy'])->name('calendar-events.destroy');
        Route::get('members', [AdminMemberController::class, 'index'])->name('members.index');
        Route::patch('members/{user}/status', [AdminMemberController::class, 'updateStatus'])->name('members.status');
        Route::patch('members/{user}/role', [AdminMemberController::class, 'updateRole'])->name('members.role');
    });
});

require __DIR__.'/settings.php';
