import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  History
} from 'lucide-react';

const Tickets = () => {
  const { workspace } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    fetchTickets();
  }, [workspace, filters.status, filters.category]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let url = `/workspaces/${workspace.id}/tickets`;
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      
      const response = await api.get(`${url}?${params.toString()}`);
      console.log('Tickets API Response:', response.data);
      
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        const possibleArray = Object.values(response.data).find(val => Array.isArray(val));
        if (possibleArray) data = possibleArray;
      }
      
      // Sort by ID descending to show newest first
      const sortedData = [...data].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
      setTickets(sortedData);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm',
    resolved: 'bg-green-50 text-green-700 border-green-200 shadow-sm',
    closed: 'bg-gray-50 text-gray-700 border-gray-200 shadow-sm'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-gray-500">Manage and respond to customer requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            title="Refresh Tickets"
          >
            <History size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/tickets/new"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Ticket
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <select 
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select 
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Technical">Technical</option>
          <option value="Billing">Billing</option>
          <option value="General">General</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Ticket Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{ticket.id}</td>
                    <td className="px-6 py-4">
                      <Link to={`/tickets/${ticket.id}`} className="font-bold text-gray-900 hover:text-blue-600">
                        {ticket.title}
                      </Link>
                      <div className="text-xs text-gray-500 mt-0.5">{ticket.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 text-[10px] flex items-center justify-center font-bold uppercase">
                          {ticket.assignee?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm text-gray-700">{ticket.assignee?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-gray-500 italic">
                      No tickets match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {tickets.length} results</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-200 rounded-lg disabled:opacity-50" disabled><ChevronLeft size={18} /></button>
            <button className="p-2 border border-gray-200 rounded-lg disabled:opacity-50" disabled><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
