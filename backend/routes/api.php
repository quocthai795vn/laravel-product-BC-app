<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;

// Test route
Route::get('/test', [TestController::class, 'index']);

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication with Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/pending', [AdminController::class, 'listPendingUsers']);
        Route::post('/approve/{id}', [AdminController::class, 'approveUser']);
        Route::get('/users', [AdminController::class, 'listAllUsers']);
        Route::post('/reject/{id}', [AdminController::class, 'rejectUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    });
});
