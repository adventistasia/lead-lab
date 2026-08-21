<?php

use App\Http\Controllers\AdminLearningSessionController;
use App\Http\Controllers\AdminMemberController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LearningResourceController;
use App\Http\Controllers\LearningSessionController;
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
    Route::get('classroom', [LearningSessionController::class, 'index'])->name('classroom.index');
    Route::get('sessions/{learningSession}', [LearningSessionController::class, 'show'])->name('sessions.show');
    Route::get('resources/{learningResource}/download', [LearningResourceController::class, 'download'])->name('resources.download');

    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('classroom', [AdminLearningSessionController::class, 'recordings'])->name('classroom.index');
        Route::get('sessions', [AdminLearningSessionController::class, 'index'])->name('sessions.index');
        Route::get('sessions/{learningSession}/edit', [AdminLearningSessionController::class, 'edit'])->name('sessions.edit');
        Route::post('sessions', [AdminLearningSessionController::class, 'store'])->name('sessions.store');
        Route::patch('sessions/{learningSession}', [AdminLearningSessionController::class, 'update'])->name('sessions.update');
        Route::patch('sessions/{learningSession}/publish', [AdminLearningSessionController::class, 'publish'])->name('sessions.publish');
        Route::patch('sessions/{learningSession}/unpublish', [AdminLearningSessionController::class, 'unpublish'])->name('sessions.unpublish');
        Route::patch('sessions/{learningSession}/archive', [AdminLearningSessionController::class, 'archive'])->name('sessions.archive');
        Route::patch('sessions/{learningSession}/restore', [AdminLearningSessionController::class, 'restore'])->name('sessions.restore');
        Route::get('members', [AdminMemberController::class, 'index'])->name('members.index');
        Route::patch('members/{user}/status', [AdminMemberController::class, 'updateStatus'])->name('members.status');
    });
});

require __DIR__.'/settings.php';
