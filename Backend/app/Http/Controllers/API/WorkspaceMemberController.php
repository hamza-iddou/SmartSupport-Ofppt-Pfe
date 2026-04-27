<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Exception;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;

class WorkspaceMemberController extends Controller
{
    /**
     * Invite a user to the workspace
     */
    public function store(Request $request, $workspaceId)
    {
        try {
            $currentUser = JWTAuth::user();

            // 1. Verify currentUser is an Admin of this workspace
            $workspace = $currentUser->adminWorkspaces()->where('workspaces.id', $workspaceId)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found or you are not authorized to invite members'
                ], 404);
            }

            // 2. Validate the request (expect an email of an existing user)
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
                'is_admin' => 'boolean' // Optional, defaults to false if not provided
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // 3. Find the user to invite
            $userToInvite = User::where('email', $request->email)->first();

            // 4. Check if the user is ALREADY a member
            if ($workspace->members()->where('user_id', $userToInvite->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is already a member of this workspace'
                ], 400); // Bad Request
            }

            // 5. Add them to the workspace
            $isAdmin = $request->input('is_admin', false);
            
            $workspace->members()->attach($userToInvite->id, ['is_admin' => $isAdmin]);

            return response()->json([
                'success' => true,
                'message' => 'User successfully added to workspace',
                'member' => [
                    'id' => $userToInvite->id,
                    'email' => $userToInvite->email,
                    'name' => $userToInvite->name,
                    'is_admin' => $isAdmin
                ]
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to invite user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a member's role (make them admin or remove admin)
     */
    public function update(Request $request, $workspaceId, $userId)
    {
        try {
            $currentUser = JWTAuth::user();

            // 1. Verify currentUser is an Admin
            $workspace = $currentUser->adminWorkspaces()->where('workspaces.id', $workspaceId)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found or unauthorized'
                ], 404);
            }

            // 2. Prevent the user from removing their own admin status by accident
            if ($currentUser->id == $userId && $request->input('is_admin') == false) {
                 return response()->json([
                    'success' => false,
                    'message' => 'You cannot remove your own admin privileges.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'is_admin' => 'required|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // 3. Confirm target user is actually in this workspace
            if (!$workspace->members()->where('user_id', $userId)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a member of this workspace'
                ], 404);
            }

            // 4. Update pivot
            $workspace->members()->updateExistingPivot($userId, [
                'is_admin' => $request->is_admin
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User role updated successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a member from the workspace
     */
    public function destroy($workspaceId, $userId)
    {
        try {
            $currentUser = JWTAuth::user();

            $workspace = $currentUser->adminWorkspaces()->where('workspaces.id', $workspaceId)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found or unauthorized'
                ], 404);
            }
            
            // Prevent removing yourself
            if ($currentUser->id == $userId) {
                return response()->json([
                   'success' => false,
                   'message' => 'You cannot kick yourself from the workspace.'
               ], 403);
           }

            // Target user check
            if (!$workspace->members()->where('user_id', $userId)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a member of this workspace'
                ], 404);
            }

            // Remove from pivot
            $workspace->members()->detach($userId);

            return response()->json([
                'success' => true,
                'message' => 'User removed from the workspace successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove user: ' . $e->getMessage()
            ], 500);
        }
    }
}
