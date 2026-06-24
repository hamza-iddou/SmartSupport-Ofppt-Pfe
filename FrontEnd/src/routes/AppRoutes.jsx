import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Tickets from '../pages/Tickets';
import TicketDetails from '../pages/TicketDetails';
import CreateTicket from '../pages/CreateTicket';
import Members from '../pages/Members';
import Settings from '../pages/Settings';
import Workspaces from '../pages/Workspaces';
import DashboardLayout from '../layouts/DashboardLayout';

const ProtectedRoute = ({ children, requireWorkspace = true }) => {
  const { token, workspace, loading } = useAuth();

  if (loading) return null;

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requireWorkspace && !workspace) {
    return <Navigate to="/workspaces" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/workspaces" element={
        <ProtectedRoute requireWorkspace={false}>
          <Workspaces />
        </ProtectedRoute>
      } />

      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        <Route path="/members" element={<Members />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
