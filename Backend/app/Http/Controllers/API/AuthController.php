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
        'email' => 'string|email|unique:users|max:255',
        'password' => 'min:8|max:30|string'
    ];

    $validor = Validator::make($request->all(), $rules);
    if($validor->fails()){
        return response()->json(["errors" => $validor->errors()]);
    }

    $user = User::create([
        'email'=>$request->email,
        'name' => $request->name,
        'last_name'=> $request->last_name,
        'password' => Hash::make($request->password),
        'is_email_verified' => false
    ]);

    if($user){
        return response()->json(["success" => true, "msg" => "user has been succesfuly created pleas login"]);
    }
    
    return response()->json(["msg" => "error"]);
    

}


}
