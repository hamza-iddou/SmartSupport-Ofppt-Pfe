import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Save, AlertTriangle, Trash2, Loader2, Building } from 'lucide-react';

const Settings = () => {
  const { workspace, selectWorkspace } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(workspace?.name || '');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put(`/workspaces/${workspace.id}`, { name });
      selectWorkspace({ ...workspace, name: response.data.name });
      alert('Workspace updated successfully');
    } catch (err) {
      alert('Failed to update workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workspace? This action is permanent and will delete all tickets and data.')) return;
    setDeleting(true);
    try {
      await api.delete(`/workspaces/${workspace.id}`);
      localStorage.removeItem('workspace');
      navigate('/workspaces');
    } catch (err) {
      alert('Failed to delete workspace');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Workspace Settings</h2>
        <p className="text-gray-500">Manage your workspace configuration and data</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="p-8">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building size={20} className="text-blue-600" />
            General Information
          </h3>
          <form onSubmit={handleUpdate} className="max-w-md space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Workspace Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </form>
        </div>

        <div className="p-8 bg-red-50/30">
          <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Danger Zone
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-900">Delete this workspace</p>
              <p className="text-sm text-gray-500 mt-1">Once you delete a workspace, there is no going back. Please be certain.</p>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors disabled:opacity-70"
            >
              {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
              Delete Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
