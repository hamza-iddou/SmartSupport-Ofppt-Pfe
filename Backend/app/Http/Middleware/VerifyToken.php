<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class VerifyToken
{
    
    public function handle(Request $request, Closure $next)
    {
        
        $token = $this->getTokenFromRequest($request);
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token not provided'
            ], 401);
        }
        
        try {
            
            $user = JWTAuth::setToken($token)->authenticate();
            
            if ($user) { 
                $request->merge(['auth_user' => $user]);
                return $next($request);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 401);
            
        } catch (TokenExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token has expired'
            ], 401);
            
        } catch (TokenInvalidException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token is invalid'
            ], 401);
            
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token error: ' . $e->getMessage()
            ], 401);
        }
    }

    public function getTokenFromRequest($request)
    {
        $headerToken = $request->bearerToken();
        if ($headerToken) {
            return $headerToken;
        }
        $urlToken = $request->query('token');
        if ($urlToken) {
            return $urlToken;
        }

        
        $bodyToken = $request->input('token');
        if ($bodyToken) {
            return $bodyToken;
        }

        
        $cookieToken = $request->cookie('token');
        if ($cookieToken) {
            return $cookieToken;
        }

        return null;
    }
}