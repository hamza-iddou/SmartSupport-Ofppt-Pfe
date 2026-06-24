import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  History,
  Sparkles,
  UserPlus,
  CheckCircle,
  Loader2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
  Tag,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

const TicketDetails = () => {
  const { id: ticketId } = useParams();
  const { workspace, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [logs, setLogs] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // AI Solution panel state
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (workspace?.id && ticketId) {
      fetchTicketData();
      fetchMembers();
    }
  }, [ticketId, workspace?.id]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      const [ticketRes, logsRes] = await Promise.all([
        api.get(`/workspaces/${workspace.id}/tickets/${ticketId}`),
        api.get(`/workspaces/${workspace.id}/tickets/${ticketId}/logs`),
      ]);

      // Backend wraps under .ticket key
      const ticketData =
        ticketRes.data.ticket || ticketRes.data.data || ticketRes.data;

      // Backend wraps logs under .logs key
      const rawLogs = logsRes.data.logs || logsRes.data.data || logsRes.data;
      const logsData = Array.isArray(rawLogs) ? rawLogs : [];

      setTicket(ticketData);
      setLogs(logsData);

      // Pre-populate AI result from saved ai_summary/ai_suggestion if they exist
      if (ticketData?.ai_summary || ticketData?.ai_suggestion) {
        setAiResult({
          summary: ticketData.ai_summary,
          suggestion: ticketData.ai_suggestion,
          category: ticketData.category,
        });
      }
    } catch (err) {
      console.error('Failed to fetch ticket details', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/workspaces/${workspace.id}/members`);
      const raw = response.data.members || response.data.data || response.data;
      setMembers(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.put(
        `/workspaces/${workspace.id}/tickets/${ticketId}/status`,
        { status: newStatus }
      );
      setNotification({
        type: 'success',
        message: `Status updated to "${newStatus.replace('_', ' ')}"`,
      });
      fetchTicketData();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to update status';
      setNotification({ type: 'error', message: msg });
    } finally {
      setUpdating(false);
    }
  };

  const assignTicket = async (userId) => {
    setUpdating(true);
    try {
      await api.put(
        `/workspaces/${workspace.id}/tickets/${ticketId}/assign`,
        { assigned_to: userId }
      );
      setNotification({ type: 'success', message: 'Ticket assigned successfully' });
      setShowAssignModal(false);
      fetchTicketData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign ticket';
      setNotification({ type: 'error', message: msg });
    } finally {
      setUpdating(false);
    }
  };

  const handleGetAiSolution = async () => {
    if (!ticket?.title || !ticket?.description) return;
    setAiLoading(true);
    setShowAI(true);
    try {
      const response = await api.post(
        `/workspaces/${workspace.id}/ai-suggest`,
        { title: ticket.title, description: ticket.description }
      );
      setAiResult(response.data);
    } catch (err) {
      setAiResult({ error: err.response?.data?.message || 'AI analysis failed. Please try again.' });
    } finally {
      setAiLoading(false);
    }
  };

  // ── Loading / Not Found ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-4">
        <div className="text-5xl">🎫</div>
        <h2 className="text-2xl font-bold text-gray-900">Ticket Not Found</h2>
        <p className="text-gray-500">
          We couldn't find the ticket you're looking for.
        </p>
        <button
          onClick={() => navigate('/tickets')}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Tickets
        </button>
      </div>
    );
  }

  const statusConfig = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 relative">

      {/* ── Toast ── */}
      {notification && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3
            ${notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-red-600 text-white border-red-500'}`}
        >
          {notification.type === 'success'
            ? <CheckCircle size={20} />
            : <AlertCircle size={20} />}
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* ── Back ── */}
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={18} />
        Back to Tickets
      </button>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ══ LEFT COLUMN ══════════════════════════════════════════════════════ */}
        <div className="flex-1 space-y-6 min-w-0">

          {/* ── Ticket Card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {/* Header */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div className="min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <span className="font-mono text-gray-400 text-sm">#{ticket.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      statusConfig[ticket.status] || 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {ticket.status?.replace('_', ' ') || 'unknown'}
                  </span>
                  {ticket.category && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
                      <Tag size={10} />
                      {ticket.category}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 break-words">{ticket.title}</h1>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {/* AI Solution Button */}
                <button
                  onClick={() => {
                    if (showAI) {
                      setShowAI(false);
                    } else if (aiResult) {
                      setShowAI(true);
                    } else {
                      handleGetAiSolution();
                    }
                  }}
                  disabled={aiLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/20 disabled:opacity-60"
                >
                  {aiLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {aiLoading ? 'Analyzing...' : showAI ? 'Hide AI' : 'AI Solution'}
                  {!aiLoading && (showAI ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </button>

                {/* Status buttons */}
                {ticket.status === 'pending' && (
                  <button
                    onClick={() => updateStatus('in_progress')}
                    disabled={updating}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
                  >
                    {updating ? <Loader2 className="animate-spin" size={15} /> : <Clock size={15} />}
                    In Progress
                  </button>
                )}
                {ticket.status !== 'resolved' && (
                  <button
                    onClick={() => updateStatus('resolved')}
                    disabled={updating}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
                  >
                    {updating ? <Loader2 className="animate-spin" size={15} /> : <CheckCircle size={15} />}
                    Resolve
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* ── AI Solution Panel ── */}
            {showAI && (
              <div className="mt-2 rounded-2xl border border-indigo-100 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles size={18} />
                    <span className="font-bold">AI Analysis</span>
                  </div>
                  <button
                    onClick={handleGetAiSolution}
                    disabled={aiLoading}
                    className="text-white/70 hover:text-white flex items-center gap-1 text-xs font-semibold transition-colors"
                  >
                    <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>

                {aiLoading ? (
                  <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-8 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                    <p className="text-indigo-600 text-sm font-medium">Analyzing your ticket with Gemini AI…</p>
                  </div>
                ) : aiResult?.error ? (
                  <div className="bg-red-50 p-6 flex items-center gap-3 text-red-700">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{aiResult.error}</p>
                  </div>
                ) : aiResult ? (
                  <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Category */}
                      <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-indigo-100">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Tag size={13} className="text-indigo-400" />
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Category</p>
                        </div>
                        <p className="text-sm font-bold text-indigo-900">{aiResult.category || '—'}</p>
                      </div>

                      {/* Summary */}
                      <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-indigo-100 md:col-span-2">
                        <div className="flex items-center gap-1.5 mb-2">
                          <ShieldCheck size={13} className="text-indigo-400" />
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">AI Summary</p>
                        </div>
                        <p className="text-sm text-indigo-800 leading-relaxed">{aiResult.summary || '—'}</p>
                      </div>
                    </div>

                    {/* Suggestion */}
                    <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-amber-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Lightbulb size={13} className="text-amber-500" />
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Suggested Solution</p>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{aiResult.suggestion || '—'}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* ── Ticket History ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <History size={18} className="text-gray-400" />
              <h3 className="font-bold text-gray-900">Ticket History</h3>
              <span className="ml-auto text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {logs.length} event{logs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-6 space-y-5">
              {logs.length === 0 ? (
                <p className="text-center text-gray-400 py-4 italic text-sm">No history yet.</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={log.id} className="flex gap-4 relative">
                    {idx !== logs.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-100" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 z-10">
                      <Clock size={14} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-bold">{log.user?.name || 'System'}</span>{' '}
                        <span className="text-gray-600">{log.action}</span>
                      </p>
                      {log.details && (
                        <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ═════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-72 space-y-5 shrink-0">

          {/* Properties Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Properties</h3>
            <div className="space-y-4 text-sm">

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                <div className="mt-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    statusConfig[ticket.status] || 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {ticket.status?.replace('_', ' ') || 'unknown'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                <p className="mt-1 font-medium text-gray-900">{ticket.category || '—'}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Created</label>
                <p className="mt-1 text-gray-600">{new Date(ticket.created_at).toLocaleString()}</p>
              </div>

              {ticket.resolved_at && (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resolved</label>
                  <p className="mt-1 text-gray-600">{new Date(ticket.resolved_at).toLocaleString()}</p>
                </div>
              )}

              {/* Assignee */}
              <div className="pt-3 border-t border-gray-50">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assignee</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {ticket.assignee?.name?.charAt(0) || <UserPlus size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {ticket.assignee?.name || 'Unassigned'}
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => setShowAssignModal(!showAssignModal)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        {showAssignModal ? 'Cancel' : 'Change Assignee'}
                      </button>
                    )}
                  </div>
                </div>

                {showAssignModal && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-200 space-y-1 max-h-48 overflow-y-auto">
                    <p className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">Select Member</p>
                    {members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => assignTicket(member.id)}
                        disabled={updating}
                        className="w-full text-left px-2 py-1.5 text-sm rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center gap-2 group"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="flex-1 truncate">{member.name} {member.last_name || ''}</span>
                        <UserPlus size={13} className="text-gray-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                    {members.length === 0 && (
                      <p className="text-xs text-gray-400 px-2 py-2">No members found.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Requestor Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Requestor</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold uppercase text-sm">
                {ticket.creator?.name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{ticket.creator?.name || '—'}</p>
                <p className="text-xs text-gray-500 truncate">{ticket.creator?.email || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
