import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  MessageSquare, 
  History, 
  Sparkles, 
  UserPlus, 
  CheckCircle,
  Loader2,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const TicketDetails = () => {
  const { id: ticketId } = useParams();
  const { workspace } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [logs, setLogs] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchTicketData();
    fetchMembers();
  }, [ticketId]);

  const fetchTicketData = async () => {
    try {
      const [ticketRes, logsRes] = await Promise.all([
        api.get(`/workspaces/${workspace.id}/tickets/${ticketId}`),
        api.get(`/workspaces/${workspace.id}/tickets/${ticketId}/logs`)
      ]);
      const ticketData = ticketRes.data.data || ticketRes.data;
      const logsData = Array.isArray(logsRes.data) ? logsRes.data : logsRes.data.data || [];
      console.log('Full Ticket Data from API:', ticketData);
      setTicket(ticketData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to fetch ticket details', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/workspaces/${workspace.id}/members`);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/workspaces/${workspace.id}/tickets/${ticketId}/status`, { status: newStatus });
      setNotification({ type: 'success', message: `Status updated to ${newStatus.replace('_', ' ')}` });
      fetchTicketData();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update status' });
    } finally {
      setUpdating(false);
    }
  };

  const assignTicket = async (userId) => {
    setUpdating(true);
    try {
      await api.put(`/workspaces/${workspace.id}/tickets/${ticketId}/assign`, { assigned_to: userId });
      setNotification({ type: 'success', message: 'Ticket assigned successfully' });
      setShowAssignModal(false);
      fetchTicketData();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to assign ticket' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-4">
        <div className="text-4xl">🎫</div>
        <h2 className="text-2xl font-bold text-gray-900">Ticket Not Found</h2>
        <p className="text-gray-500">We couldn't find the ticket you're looking for or there was an error loading it.</p>
        <button 
          onClick={() => navigate('/tickets')}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`
          fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300
          ${notification.type === 'success' ? 'bg-green-600 text-white border-green-500' : 'bg-red-600 text-white border-red-500'}
        `}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      <button 
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Tickets
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Details & AI */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-gray-400 text-sm">#{ticket.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border
                    ${ticket.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 
                      ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      'bg-yellow-50 text-yellow-700 border-yellow-200'}
                  `}>
                    {ticket.status?.replace('_', ' ') || 'unknown'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
              </div>
              <div className="flex gap-2">
                {ticket.status !== 'resolved' && (
                  <button 
                    onClick={() => updateStatus('resolved')}
                    disabled={updating}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                  >
                    {updating ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                    Resolve
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                  "{ticket.description}"
                </p>
              </div>

              {/* AI Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-blue-100 relative overflow-hidden">
                  <Sparkles className="absolute right-4 top-4 text-blue-200" size={40} />
                  <h3 className="text-blue-900 font-bold flex items-center gap-2 mb-2">
                    AI Summary
                  </h3>
                  <p className="text-sm text-blue-800 leading-relaxed relative z-10">
                    {ticket.ai_summary || ticket.summary || "Analyzing ticket content..."}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-100 relative overflow-hidden">
                  <ShieldCheck className="absolute right-4 top-4 text-purple-200" size={40} />
                  <h3 className="text-purple-900 font-bold flex items-center gap-2 mb-2">
                    AI Suggestion
                  </h3>
                  <p className="text-sm text-purple-800 leading-relaxed relative z-10">
                    {ticket.ai_suggestion || ticket.suggestion || "Generating intelligent response..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <History size={20} className="text-gray-400" />
              <h3 className="font-bold text-gray-900">Ticket History</h3>
            </div>
            <div className="p-6 space-y-6">
              {logs.map((log, idx) => (
                <div key={log.id} className="flex gap-4 relative">
                  {idx !== logs.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-100"></div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 z-10">
                    <Clock size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-bold">{log.user?.name || 'System'}</span> {log.action}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                    {log.comment && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {log.comment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-center text-gray-400 py-4 italic">No history yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                <p className="text-sm font-medium text-gray-900">{ticket.category}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Priority</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{ticket.priority || 'Normal'}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <label className="text-xs font-bold text-gray-400 uppercase">Assignee</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {ticket.assignee?.name?.charAt(0) || <UserPlus size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{ticket.assignee?.name || 'Unassigned'}</p>
                    <button 
                      onClick={() => setShowAssignModal(!showAssignModal)}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      {showAssignModal ? 'Cancel' : 'Change Assignee'}
                    </button>
                  </div>
                </div>

                {showAssignModal && (
                  <div className="mt-4 p-2 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">Select Member</p>
                    {members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => assignTicket(member.id)}
                        disabled={updating}
                        className="w-full text-left px-2 py-1.5 text-sm rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center gap-2 group"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <span className="flex-1 truncate">{member.name}</span>
                        <UserPlus size={14} className="text-gray-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Requestor</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold uppercase">
                {ticket.creator?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{ticket.creator?.name}</p>
                <p className="text-xs text-gray-500">{ticket.creator?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
