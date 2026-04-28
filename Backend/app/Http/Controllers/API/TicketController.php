<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketLog;
use App\Models\Workspace;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Services\GeminiService;
use Carbon\Carbon;

class TicketController extends Controller
{
    protected $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    /**
     * Display a listing of tickets for a specific workspace.
     */
    public function index(Request $request, $workspaceId)
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

            $query = Ticket::where('workspace_id', $workspaceId);

            // Filtering
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            if ($request->has('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }
            if ($request->has('category')) {
                $query->where('category', 'like', '%' . $request->category . '%');
            }

            if ($isAdmin) {
                // Admin can see all filtered tickets in the workspace
                $tickets = $query->with(['creator', 'assignee'])->get();
            } else {
                // Regular member can only see tickets they created (with filters)
                $tickets = $query->where('created_by', $user->id)
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

            // Call AI Analysis
            $aiAnalysis = $this->gemini->analyzeTicket($request->title, $request->description);

            $ticket = Ticket::create([
                'workspace_id' => $workspaceId,
                'created_by' => $user->id,
                'assigned_to' => $request->assigned_to,
                'title' => $request->title,
                'description' => $request->description,
                'category' => $aiAnalysis['category'],
                'status' => 'pending',
                'ai_summary' => $aiAnalysis['summary'],
                'ai_suggestion' => $aiAnalysis['suggestion']
            ]);

            // Log initial creation
            TicketLog::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'Ticket Created',
                'details' => "Ticket created with status pending and category: {$ticket->category}"
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ticket created successfully with AI analysis',
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
     * Update the ticket status.
     */
    public function updateStatus(Request $request, $workspaceId, $ticketId)
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
            $ticket = Ticket::where('workspace_id', $workspaceId)->where('id', $ticketId)->first();

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found'
                ], 404);
            }

            // Authorization: Admin or Assigned User can update status
            if (!$isAdmin && $ticket->assigned_to !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only admins or the assigned user can update the status'
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

            $oldStatus = $ticket->status;
            $newStatus = $request->status;

            $updateData = ['status' => $newStatus];

            // If resolving, set resolved_at
            if ($newStatus === 'resolved' && $oldStatus !== 'resolved') {
                $updateData['resolved_at'] = now();
            }

            $ticket->update($updateData);

            // Log change
            TicketLog::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'Status Changed',
                'details' => "Status changed from {$oldStatus} to {$newStatus}"
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ticket status updated successfully',
                'ticket' => $ticket
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update ticket status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign ticket to a member (Admin only).
     */
    public function assign(Request $request, $workspaceId, $ticketId)
    {
        try {
            $user = JWTAuth::user();

            // Verify currentUser is an Admin
            $workspace = $user->adminWorkspaces()->where('workspaces.id', $workspaceId)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized or not an admin of this workspace'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'assigned_to' => 'required|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify target user belongs to the workspace
            $isMember = $workspace->members()->where('users.id', $request->assigned_to)->exists();
            if (!$isMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'Assigned user is not a member of this workspace'
                ], 422);
            }

            $ticket = Ticket::where('workspace_id', $workspaceId)->where('id', $ticketId)->first();
            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found'
                ], 404);
            }

            $oldAssigneeId = $ticket->assigned_to;
            $ticket->update(['assigned_to' => $request->assigned_to]);

            $newAssignee = $workspace->members()->where('users.id', $request->assigned_to)->first();

            // Log assignment
            TicketLog::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'Ticket Assigned',
                'details' => "Ticket assigned to {$newAssignee->name} ({$newAssignee->email})"
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ticket assigned successfully',
                'ticket' => $ticket
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign ticket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get logs for a specific ticket.
     */
    public function logs($workspaceId, $ticketId)
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

            $ticket = Ticket::where('workspace_id', $workspaceId)->where('id', $ticketId)->first();
            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found'
                ], 404);
            }

            $logs = $ticket->logs()->with('user:id,name,email')->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'logs' => $logs
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch logs: ' . $e->getMessage()
            ], 500);
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
