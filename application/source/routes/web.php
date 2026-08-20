<?php

use App\Http\Controllers\AdminLearningSessionController;
use App\Http\Controllers\AdminMemberController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LearningResourceController;
use App\Http\Controllers\LearningSessionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'active'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('classroom', [LearningSessionController::class, 'index'])->name('classroom.index');
    Route::get('sessions/{learningSession}', [LearningSessionController::class, 'show'])->name('sessions.show');
    Route::get('resources/{learningResource}/download', [LearningResourceController::class, 'download'])->name('resources.download');

    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('classroom', [AdminLearningSessionController::class, 'recordings'])->name('classroom.index');
        Route::get('sessions', [AdminLearningSessionController::class, 'index'])->name('sessions.index');
        Route::post('sessions', [AdminLearningSessionController::class, 'store'])->name('sessions.store');
        Route::get('members', [AdminMemberController::class, 'index'])->name('members.index');
        Route::patch('members/{user}/status', [AdminMemberController::class, 'updateStatus'])->name('members.status');
    });
});

require __DIR__.'/settings.php';
