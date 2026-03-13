<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request){
    try{
        $rules = [
            "email" => "required|email|exists:users,email",
            "password" => "required|min:8"
        ];

        $validator = Validator::make($request->all(), $rules);
        
        if($validator->fails()){
            return response()->json([
                "success" => false,
                "errors" => $validator->errors()
            ], 422);
        }

        $credentials = $request->only(["email", "password"]);
        
        if(!$token = Auth::guard('api')->attempt($credentials)){
            return response()->json([
                "success" => false,
                "msg" => "Invalid email or password"
            ], 401);
        }

        $user = Auth::guard("api")->user();
        
        return response()->json([
            "success" => true,
            "user" => $user,
            "token" => $token,
            ]);

    } catch(Exception $e){
        // Log the error internally
        Log::error('Login error: ' . $e->getMessage());
        
        return response()->json([
            "success" => false,
            "msg" => "An error occurred during login"
        ], 500);
    }      
}
}
