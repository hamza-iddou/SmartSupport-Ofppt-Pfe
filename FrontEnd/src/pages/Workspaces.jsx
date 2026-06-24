import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Building2, ArrowRight, Loader2 } from 'lucide-react';

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const { selectWorkspace } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workspaces');
      console.log('Workspaces API Response:', response.data);
      
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Try to find any property that is an array
        const possibleArray = Object.values(response.data).find(val => Array.isArray(val));
        if (possibleArray) data = possibleArray;
      }
      
      setWorkspaces(data);
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
      alert('Could not load workspaces. Please check your connection or login again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/workspaces', { name: newName });
      const createdWorkspace = response.data.workspace || response.data.data || response.data;
      setWorkspaces([...workspaces, createdWorkspace]);
      setIsCreating(false);
      setNewName('');
    } catch (err) {
      alert('Failed to create workspace');
    }
  };

  const handleSelect = (ws) => {
    selectWorkspace(ws);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Select Workspace</h1>
            <p className="text-gray-500">Choose a workspace to continue</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            New Workspace
          </button>
        </div>

        {isCreating && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-bold mb-4">Create New Workspace</h2>
            <form onSubmit={handleCreate} className="flex gap-4">
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Workspace Name (e.g. Acme Support)"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-6 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => handleSelect(ws)}
              className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{ws.name}</h3>
                  <p className="text-sm text-gray-500">{ws.role || 'Admin'}</p>
                </div>
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-blue-600 transition-colors" size={20} />
            </div>
          ))}

          {workspaces.length === 0 && !isCreating && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No workspaces found. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspaces;
