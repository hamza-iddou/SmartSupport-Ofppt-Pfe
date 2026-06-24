import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { workspace } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspace?.id) {
      fetchDashboardData();
    }
  }, [workspace]);


  
  const fetchDashboardData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.get(`/workspaces/${workspace.id}/stats`),
        api.get(`/workspaces/${workspace.id}/tickets?limit=5`)
      ]);
      setStats(statsRes.data);
      // Handle potential Laravel data wrapping
      setRecentTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tickets', value: stats?.total_tickets || stats?.total || 0, icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: stats?.pending_tickets || stats?.pending || 0, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'In Progress', value: stats?.in_progress_tickets || stats?.in_progress || 0, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Resolved', value: stats?.resolved_tickets || stats?.resolved || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500">Welcome back to {workspace?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Tickets</h3>
            <button className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{ticket.title}</div>
                      <div className="text-xs text-gray-500">{ticket.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${ticket.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 
                          ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          'bg-yellow-50 text-yellow-700 border-yellow-200'}
                      `}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentTickets.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No tickets found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-blue-600" size={20} />
            <h3 className="font-bold text-gray-900">Performance</h3>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Avg. Resolution Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.average_resolution_time || stats?.avg_resolution_time || '0h'}</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-gray-400 italic">Target: Under 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
