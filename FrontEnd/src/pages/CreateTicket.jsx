import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Loader2, FileText, Tag, UserPlus, Sparkles, Lightbulb, RefreshCw } from 'lucide-react';

const CreateTicket = () => {
  const { workspace } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
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

  const handleGetAiSuggestion = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in the Title and Description first.');
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      const response = await api.post(`/workspaces/${workspace.id}/ai-suggest`, {
        title: formData.title,
        description: formData.description,
      });
      const data = response.data;
      setAiResult(data);
      if (data.category) {
        setFormData(prev => ({ ...prev, category: data.category }));
      }
    } catch (err) {
      setAiResult({ error: err.response?.data?.message || 'AI suggestion failed. Please try again.' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!workspace?.id) throw new Error('No workspace selected');
      const payload = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assigned_to || null,
      };
      await api.post(`/workspaces/${workspace.id}/tickets`, payload);
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
          <p className="text-gray-500">Provide details about your issue and click the AI button to get an instant suggestion.</p>
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
                {aiResult && !aiResult.error && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold ml-1">AI Auto-filled</span>
                )}
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Technical">Technical Support</option>
                <option value="Billing">Billing &amp; Payments</option>
                <option value="General">General Inquiry</option>
                <option value="Feature">Feature Request</option>
                <option value="Network">Network</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Uncategorized">Uncategorized</option>
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
                    {member.name} {member.last_name || ''}
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

          {/* AI Suggestion Button */}
          <div>
            <button
              type="button"
              onClick={handleGetAiSuggestion}
              disabled={aiLoading || !formData.title || !formData.description}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              {aiLoading ? (
                <><Loader2 className="animate-spin" size={18} /> Analyzing with AI...</>
              ) : (
                <><Sparkles size={18} /> Get AI Suggestion</>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-2">Fill in the title and description first, then click to get an AI-powered suggestion.</p>
          </div>

          {/* AI Result Panel */}
          {aiResult && (
            <div className={`rounded-2xl border p-6 space-y-4 ${aiResult.error ? 'bg-red-50 border-red-200' : 'bg-gradient-to-br from-violet-50 to-indigo-50 border-indigo-100'}`}>
              {aiResult.error ? (
                <p className="text-red-600 text-sm font-medium">{aiResult.error}</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-indigo-600" size={20} />
                      <h3 className="font-bold text-indigo-900">AI Analysis Result</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleGetAiSuggestion}
                      disabled={aiLoading}
                      className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1 text-xs font-semibold"
                    >
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white/70 rounded-xl p-4 border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">🏷️ Category</p>
                      <p className="text-sm font-bold text-indigo-900">{aiResult.category}</p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 border border-indigo-100 md:col-span-2">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">📋 Summary</p>
                      <p className="text-sm text-indigo-800">{aiResult.summary}</p>
                    </div>
                  </div>

                  <div className="bg-white/70 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="text-amber-500" size={16} />
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">💡 Suggested Solution</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{aiResult.suggestion}</p>
                  </div>
                </>
              )}
            </div>
          )}

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
