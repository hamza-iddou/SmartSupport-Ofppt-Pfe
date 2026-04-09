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
    public function index()
    {
        $user = JWTAuth::user();
        $workSpaces = $user->workspaces;
        
        return response()->json([
            'success' => true,
            'workspaces' => $workSpaces
        ]);
    }

    
    

   
    public function create()
    {
        
    }

    
    public function store(Request $request)
    {
       
    }

   
    public function show($id)
    {
        
    }

   
    public function edit($id)
    {
       
    }

    
    public function update(Request $request, $id)
    {
       
    }

   
    public function destroy($id)
    {
        
    }
}
