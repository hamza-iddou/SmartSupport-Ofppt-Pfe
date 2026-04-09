<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Exception;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;

class WorkSpaceController extends Controller
{
    public function index()
    {
        try {
            $user = JWTAuth::user();
            $workSpaces = $user->workspaces;
            
            return response()->json([
                'success' => true,
                'workspaces' => $workSpaces
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch workspaces: ' . $e->getMessage()
            ], 500);
        }
    }

    public function create()
    {
        // Not used in API
    }

    public function store(Request $request)
    {
        try {
            $user = JWTAuth::user();

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'image' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $workspace = Workspace::create([
                'name' => $request->name,
                'image' => $request->image,
                'created_by' => $user->id
            ]);

            // Add the creator as an admin member in the pivot table
            $workspace->members()->attach($user->id, ['is_admin' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Workspace created successfully',
                'workspace' => $workspace
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create workspace: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = JWTAuth::user();
            
            // Ensure the user is a member of this workspace
            $workspace = $user->workspaces()->where('workspaces.id', $id)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found or unauthorized'
                ], 404);
            }

            // Load members or other relations if needed
            $workspace->load('members');

            return response()->json([
                'success' => true,
                'workspace' => $workspace
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch workspace: ' . $e->getMessage()
            ], 500);
        }
    }

    public function edit($id)
    {
        // Not used in API
    }

    public function update(Request $request, $id)
    {
        try {
            $user = JWTAuth::user();

            // Check if user is a member and has admin rights to update
            $workspace = $user->adminWorkspaces()->where('workspaces.id', $id)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found or unauthorized to update'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'image' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $workspace->update($request->only(['name', 'image']));

            return response()->json([
                'success' => true,
                'message' => 'Workspace updated successfully',
                'workspace' => $workspace
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update workspace: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = JWTAuth::user();

            // Depending on rules, maybe only the creator or an admin can delete.
            // Let's assume any admin of the workspace can delete it.
            $workspace = $user->adminWorkspaces()->where('workspaces.id', $id)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found or unauthorized to delete'
                ], 404);
            }

            $workspace->delete();

            return response()->json([
                'success' => true,
                'message' => 'Workspace deleted successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete workspace: ' . $e->getMessage()
            ], 500);
        }
    }
}
