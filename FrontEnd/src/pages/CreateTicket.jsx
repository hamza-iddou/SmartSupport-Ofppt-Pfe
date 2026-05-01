import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Loader2, FileText, Tag, UserPlus } from 'lucide-react';

const CreateTicket = () => {
  const { workspace } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    assigned_to: ''
  });

  useEffect(() => {
    if (workspace?.id) {
      fetchMembers();
    }
  }, [workspace]);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/workspaces/${workspace.id}/members`);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!workspace?.id) throw new Error('No workspace selected');
      console.log('Submitting ticket:', formData);
      const response = await api.post(`/workspaces/${workspace.id}/tickets`, formData);
      console.log('Ticket created:', response.data);
      navigate('/tickets');
    } catch (err) {
      console.error('Ticket creation failed:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Tickets
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Open a Support Ticket</h1>
          <p className="text-gray-500">Provide details about your issue and our AI will help categorize and route it.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              Ticket Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cannot access the dashboard"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={16} className="text-gray-400" />
                Category
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Technical">Technical Support</option>
                <option value="Billing">Billing & Payments</option>
                <option value="General">General Inquiry</option>
                <option value="Feature">Feature Request</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <UserPlus size={16} className="text-gray-400" />
                Assign to Member (Optional)
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              >
                <option value="">Leave Unassigned</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows="6"
              placeholder="Describe your issue in detail..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="px-6 py-3 text-gray-600 font-semibold hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
