<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Exception;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class WorkSpaceController extends Controller
{
    
    
    public function index(Request $request)
    {
        try{
            $user = JWTAuth::user();
            dd($user);

            
            

            


        }catch(Exception $e){
             return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }

        
    }

   
    public function create()
    {
        //
    }

    
    public function store(Request $request)
    {
        //
    }

   
    public function show($id)
    {
        //
    }

   
    public function edit($id)
    {
        //
    }

    
    public function update(Request $request, $id)
    {
        //
    }

   
    public function destroy($id)
    {
        //
    }
}
