<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PersonnelController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\MealController;
use App\Http\Controllers\MealRequestController;
use App\Models\Area;

Route::get('/', function () {
    return redirect('/login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $areas = Area::query()
            ->where('active', true)
            ->withCount('personnels')
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('dashboard', [
            'areas' => $areas,
        ]);
    })->middleware(['auth', 'verified'])->name('dashboard');

    Route::resource('personnel', PersonnelController::class);
    Route::patch('/personnel/{personnel}/toggle-status', [PersonnelController::class, 'toggleStatus'])->name('personnel.toggle-status');
    
    Route::resource('positions', PositionController::class);
    Route::patch('/positions/{position}/toggle-status', [PositionController::class, 'toggleStatus'])->name('positions.toggle-status');

    Route::resource('permissions', PermissionController::class);
    Route::resource('roles', RoleController::class);

    Route::resource('users', UserController::class);
    Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');

    Route::resource('areas', AreaController::class);
    Route::patch('/areas/{area}/toggle-status', [AreaController::class, 'toggleStatus'])->name('areas.toggle-status');

    Route::resource('meals', MealController::class)->only(['index', 'create', 'store', 'edit', 'update']);
    Route::patch('/meals/{meal}/toggle-active', [MealController::class,'toggleActive',])->name('meals.toggle-active');

    Route::resource('meal-requests', MealRequestController::class)->only(['index', 'create', 'store', 'edit', 'update']);
    Route::get('/meal-requests/{meal_request}', [MealRequestController::class, 'show'])->name('meal-requests.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
