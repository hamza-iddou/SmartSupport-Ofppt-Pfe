<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Exception;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get statistics for a specific workspace.
     */
    public function stats($workspaceId)
    {
        try {
            $user = JWTAuth::user();

            // Verify currentUser is a member of this workspace
            $workspace = $user->workspaces()->where('workspaces.id', $workspaceId)->first();

            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found or unauthorized'
                ], 404);
            }

            $totalTickets = Ticket::where('workspace_id', $workspaceId)->count();
            $pendingTickets = Ticket::where('workspace_id', $workspaceId)->where('status', 'pending')->count();
            $inProgressTickets = Ticket::where('workspace_id', $workspaceId)->where('status', 'in_progress')->count();
            $resolvedTickets = Ticket::where('workspace_id', $workspaceId)->where('status', 'resolved')->count();

            // Calculate Average Resolution Time in hours
            $resolvedWithDates = Ticket::where('workspace_id', $workspaceId)
                ->where('status', 'resolved')
                ->whereNotNull('resolved_at')
                ->get();

            $totalHours = 0;
            foreach ($resolvedWithDates as $ticket) {
                $created = Carbon::parse($ticket->created_at);
                $resolved = Carbon::parse($ticket->resolved_at);
                $totalHours += $created->diffInHours($resolved);
            }

            $averageResolutionTime = $resolvedTickets > 0 ? round($totalHours / $resolvedTickets, 2) : 0;

            return response()->json([
                'success' => true,
                'stats' => [
                    'total_tickets' => $totalTickets,
                    'pending_tickets' => $pendingTickets,
                    'in_progress_tickets' => $inProgressTickets,
                    'resolved_tickets' => $resolvedTickets,
                    'average_resolution_time_hours' => $averageResolutionTime,
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
