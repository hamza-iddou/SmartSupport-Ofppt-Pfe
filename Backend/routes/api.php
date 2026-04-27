<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\WorkSpaceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\WorkspaceMemberController;

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');

Route::group(['middleware' => 'verify.token'], function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
    
    // Workspaces CRUD
    Route::apiResource('/workspaces', WorkSpaceController::class);
    
    // Workspace Members Management
    Route::post('/workspaces/{workspace}/members', [WorkspaceMemberController::class, 'store']);
    Route::put('/workspaces/{workspace}/members/{user}', [WorkspaceMemberController::class, 'update']);
    Route::delete('/workspaces/{workspace}/members/{user}', [WorkspaceMemberController::class, 'destroy']);
});
