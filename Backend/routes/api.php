<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\WorkSpaceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\WorkspaceMemberController;
use App\Http\Controllers\API\TicketController;

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');

Route::group(['middleware' => 'verify.token'], function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
    
    // Workspaces CRUD
    Route::apiResource('/workspaces', WorkSpaceController::class);
    
    // Workspace Members Management
    Route::get('/workspaces/{workspace}/members', [WorkspaceMemberController::class, 'index']);
    Route::post('/workspaces/{workspace}/members', [WorkspaceMemberController::class, 'store']);
    Route::put('/workspaces/{workspace}/members/{user}', [WorkspaceMemberController::class, 'update']);
    Route::delete('/workspaces/{workspace}/members/{user}', [WorkspaceMemberController::class, 'destroy']);
    Route::post('/workspaces/{workspace}/leave', [WorkspaceMemberController::class, 'leave']);

    // Ticket Management
    Route::get('/workspaces/{workspace}/tickets', [TicketController::class, 'index']);
    Route::post('/workspaces/{workspace}/tickets', [TicketController::class, 'store']);
    Route::get('/workspaces/{workspace}/tickets/{ticket}', [TicketController::class, 'show']);
    // Only admins should use this, but authorization is handled in the controller
    Route::put('/workspaces/{workspace}/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
});
