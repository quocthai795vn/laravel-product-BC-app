<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\BigCommerceController;
use App\Http\Controllers\Api\CategoryController;

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

    // BigCommerce Store Connection routes
    Route::prefix('bc')->group(function () {
        Route::post('/connect', [BigCommerceController::class, 'connect']);
        Route::get('/stores', [BigCommerceController::class, 'index']);
        Route::get('/stores/{id}', [BigCommerceController::class, 'show']);
        Route::delete('/stores/{id}', [BigCommerceController::class, 'destroy']);
        Route::post('/stores/{id}/test', [BigCommerceController::class, 'testConnection']);
        Route::get('/stores/{id}/trees', [BigCommerceController::class, 'getCategoryTrees']);
        Route::post('/stores/test-and-get-trees', [BigCommerceController::class, 'testAndGetTrees']);
    });

    // Category Migration routes
    Route::prefix('categories')->group(function () {
        // Get categories from stores
        Route::get('/source/{storeId}', [CategoryController::class, 'getSourceCategories']);
        Route::get('/target/{storeId}', [CategoryController::class, 'getTargetCategories']);

        // Compare and migrate
        Route::post('/compare', [CategoryController::class, 'compare']);
        Route::post('/migrate', [CategoryController::class, 'migrate']);

        // Export and Import
        Route::post('/export', [CategoryController::class, 'export']);
        Route::post('/import', [CategoryController::class, 'import']);

        // Migration logs
        Route::get('/logs', [CategoryController::class, 'logs']);
        Route::get('/logs/{id}', [CategoryController::class, 'showLog']);
    });
});
