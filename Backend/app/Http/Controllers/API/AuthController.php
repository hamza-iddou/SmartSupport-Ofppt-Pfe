<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request){
      try{
            $rules = [
                //"name" => "required|min:3",
                "email"=> "required|email",
                "password"=> "required|min:8",
                //"name" => "required|min:3",
               // "lastname" => "required|min:3"
            ];

            $validator = Validator::make($request->all(), $rules);
            if($validator->fails()){
                return response()->json(["msg"=>"error"]);
            }
            $credentials = $request->only(["email", "password"]);
            $token = Auth::guard('api')->attempt($credentials);

            if(!$token){
                return response()->json(["msg"=>"error"]);
            }
            $user = Auth::guard("api")->user();
            $user->token = $token;
            return response()->json(['msg' => $user]);




      } catch(Exception $e){
                return response()->json(["msg"=>"user not found $e"]);
            
      }      
    }
}
