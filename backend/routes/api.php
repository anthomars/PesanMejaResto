<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TableController;
use Illuminate\Support\Facades\Route;

Route::get('/tables', [TableController::class, 'index']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth.token')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/menu-items', [MenuItemController::class, 'index']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/close', [OrderController::class, 'close'])->middleware('role:waiter,cashier');
    Route::get('/orders/{order}/receipt', [OrderController::class, 'receipt'])->middleware('role:cashier');

    Route::middleware('role:waiter')->group(function () {
        Route::post('/menu-items', [MenuItemController::class, 'store']);
        Route::put('/menu-items/{menuItem}', [MenuItemController::class, 'update']);
        Route::delete('/menu-items/{menuItem}', [MenuItemController::class, 'destroy']);

        Route::post('/orders', [OrderController::class, 'store']);
        Route::post('/orders/{order}/items', [OrderController::class, 'addItem']);
    });
});
