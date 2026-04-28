<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Workspace;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class TicketController extends Controller
{
    /**
     * Display a listing of tickets for a specific workspace.
     */
    public function index($workspaceId)
    {
        try {
            $user = JWTAuth::user();
            
            // Check if user is a member of the workspace
            $workspace = $user->workspaces()->where('workspaces.id', $workspaceId)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found or unauthorized'
                ], 404);
            }

            $isAdmin = $workspace->pivot->is_admin;

            if ($isAdmin) {
                // Admin can see all tickets in the workspace
                $tickets = Ticket::where('workspace_id', $workspaceId)->with(['creator', 'assignee'])->get();
            } else {
                // Regular member can only see tickets they created
                $tickets = Ticket::where('workspace_id', $workspaceId)
                    ->where('created_by', $user->id)
                    ->with(['creator', 'assignee'])
                    ->get();
            }

            return response()->json([
                'success' => true,
                'tickets' => $tickets
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tickets: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created ticket in storage.
     */
    public function store(Request $request, $workspaceId)
    {
        try {
            $user = JWTAuth::user();

            // Check if user is a member of the workspace
            $workspace = $user->workspaces()->where('workspaces.id', $workspaceId)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found or unauthorized'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'assigned_to' => 'nullable|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify assigned_to user is also a member of the workspace if provided
            if ($request->assigned_to) {
                $isAssignedMember = $workspace->members()->where('users.id', $request->assigned_to)->exists();
                if (!$isAssignedMember) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Assigned user is not a member of this workspace'
                    ], 422);
                }
            }

            $ticket = Ticket::create([
                'workspace_id' => $workspaceId,
                'created_by' => $user->id,
                'assigned_to' => $request->assigned_to,
                'title' => $request->title,
                'description' => $request->description,
                'status' => 'pending'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ticket created successfully',
                'ticket' => $ticket
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create ticket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified ticket.
     */
    public function show($workspaceId, $ticketId)
    {
        try {
            $user = JWTAuth::user();

            $workspace = $user->workspaces()->where('workspaces.id', $workspaceId)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found or unauthorized'
                ], 404);
            }

            $isAdmin = $workspace->pivot->is_admin;

            $ticket = Ticket::where('workspace_id', $workspaceId)
                ->where('id', $ticketId)
                ->with(['creator', 'assignee'])
                ->first();

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found'
                ], 404);
            }

            // Check if user is allowed to see this ticket
            if (!$isAdmin && $ticket->created_by !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this ticket'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'ticket' => $ticket
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch ticket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the ticket status (Admins only).
     */
    public function updateStatus(Request $request, $workspaceId, $ticketId)
    {
        try {
            $user = JWTAuth::user();

            // Verify currentUser is an Admin of this workspace
            $workspace = $user->adminWorkspaces()->where('workspaces.id', $workspaceId)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized or not an admin of this workspace'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,in_progress,resolved'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $ticket = Ticket::where('workspace_id', $workspaceId)->where('id', $ticketId)->first();

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found'
                ], 404);
            }

            $ticket->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Ticket status updated successfully',
                'ticket' => $ticket
            ]);

        }
    }

    /**
     * Remove the specified ticket (Admins only).
     */
    public function destroy($workspaceId, $ticketId)
    {
        try {
            $user = JWTAuth::user();

            // Verify currentUser is an Admin of this workspace
            $workspace = $user->adminWorkspaces()->where('workspaces.id', $workspaceId)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized or not an admin of this workspace'
                ], 403);
            }

            $ticket = Ticket::where('workspace_id', $workspaceId)->where('id', $ticketId)->first();

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found'
                ], 404);
            }

            $ticket->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ticket deleted successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete ticket: ' . $e->getMessage()
            ], 500);
        }
    }
}
