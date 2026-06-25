<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

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
        Log::error('Login error: ' . $e->getMessage());
        
        return response()->json([
            "success" => false,
            "msg" => "An error occurred during login"
        ], 500);
    }      
}

public function register(Request $request){
    $rules = [
        'name' => 'string|min:3|max:255|required',
        'last_name' => 'string|min:3|max:255|required',
        'email' => 'required|string|email|unique:users|max:255',
        'password' => 'required|min:8|max:30|string'
    ];

    $validator = Validator::make($request->all(), $rules);
    if($validator->fails()){
        return response()->json(["errors" => $validator->errors()], 422);
    }

    $user = User::create([
        'email'=>$request->email,
        'name' => $request->name,
        'last_name'=> $request->last_name,
        'password' => $request->password,
        'is_email_verified' => false
    ]);

    if($user){
        $token = Auth::guard('api')->login($user);
        return response()->json([
            "success" => true,
            "user" => $user,
            "token" => $token,
        ]);
    }
    
    return response()->json(["success" => false, "msg" => "Error creating user"], 500);
}

public function logout(Request $request){
    try {
       
        $token = JWTAuth::parseToken()->getToken();
        
        if(!$token) {
            return response()->json([
                "success" => false,
                "msg" => "Token not provided"
            ], 400);
        }

       
        JWTAuth::invalidate($token);
        
        return response()->json([
            "success" => true,
            "msg" => "Successfully logged out"
        ]);

    } catch (TokenExpiredException $e) {
        
        return response()->json([
            "success" => true,
            "msg" => "Already logged out (token expired)"
        ]);
        
    } catch (JWTException $e) {
        return response()->json([
            "success" => false,
            "msg" => "Failed to logout"
        ], 500);
    }
}

public function refresh(Request $request){
    try {
       
        $token = $request->token ?? JWTAuth::parseToken()->getToken();
        
        if(!$token) {
            return response()->json([
                "success" => false,
                "msg" => "Token not provided"
            ], 400);
        }

        
        $new_token = JWTAuth::refresh($token);
        
        
        $user = Auth::guard('api')->user();
        
        return response()->json([
            "success" => true,
            "user" => $user,
            "token" => $new_token,
            "token_type" => "bearer"
        ]);

    } catch (TokenExpiredException $e) {
        return response()->json([
            "success" => false,
            "msg" => "Token expired, please login again"
        ], 401);
        
    } catch (TokenInvalidException $e) {
        return response()->json([
            "success" => false,
            "msg" => "Invalid token"
        ], 401);
        
    } catch (JWTException $e) {
        return response()->json([
            "success" => false,
            "msg" => "Could not refresh token"
        ], 500);
    }
}



}
