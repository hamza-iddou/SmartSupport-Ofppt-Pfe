import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Shield, Trash2, Loader2, Search, CheckCircle, AlertCircle } from 'lucide-react';

const Members = () => {
  const { workspace } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchMembers();
  }, [workspace]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workspaces/${workspace.id}/members`);
      console.log('Members API Response:', response.data);
      
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        const possibleArray = Object.values(response.data).find(val => Array.isArray(val));
        if (possibleArray) data = possibleArray;
      }
      
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      const response = await api.post(`/workspaces/${workspace.id}/members`, { 
        email: inviteEmail,
        role: inviteRole 
      });
      console.log('Invite API Response:', response.data);
      setInviteEmail('');
      setNotification({ type: 'success', message: 'Invitation sent successfully!' });
      fetchMembers();
    } catch (err) {
      console.error('Invite failed:', err);
      setNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to send invite' 
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const removeMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/workspaces/${workspace.id}/members/${userId}`);
      setNotification({ type: 'success', message: 'Member removed successfully' });
      fetchMembers();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to remove member' });
    }
  };

  return (
    <div className="space-y-8 relative">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
          <p className="text-gray-500">Manage who has access to this workspace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search members..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center">
                      <Loader2 className="animate-spin inline text-blue-600" size={24} />
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 capitalize">
                          <Shield size={14} className="text-gray-400" />
                          {member.pivot?.role || 'Member'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeMember(member.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && members.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-blue-600" />
              Invite Member
            </h3>
            <p className="text-sm text-gray-500 mb-6">Send an invitation to join this workspace.</p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="teammate@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Assign Role</label>
                <select
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Member (View & Reply)</option>
                  <option value="admin">Admin (Full Control)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {inviteLoading ? <Loader2 className="animate-spin" size={18} /> : 'Send Invite'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members;
