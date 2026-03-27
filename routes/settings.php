<?php

use App\Http\Controllers\Settings\ConfiguracionController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('settings', '/settings/profile');

Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
Route::put('settings/password', [PasswordController::class, 'update'])
    ->middleware('throttle:6,1')
    ->name('password.update');

Route::get('settings/appearance', function () {
    return Inertia::render('settings/appearance');
})->name('appearance');

Route::get('settings/company', [ConfiguracionController::class, 'edit'])->name('configuracion.edit');
Route::patch('settings/company', [ConfiguracionController::class, 'update'])->name('configuracion.update');
