import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage          from './pages/Login';
import SignupPage         from './pages/Signup';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage  from './pages/ResetPassword';
import DashboardPage      from './pages/Dashboard';
import ProjectsPage       from './pages/Projects';
import ProjectDetailPage  from './pages/ProjectDetail';
import RoomsPage          from './pages/Rooms';
import RoomSessionPage    from './pages/RoomSession';
import OAuthCallbackPage  from './pages/OAuthCallback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                       element={<Navigate to="/login" replace />} />
        <Route path="/login"                  element={<LoginPage />} />
        <Route path="/signup"                 element={<SignupPage />} />
        <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token"  element={<ResetPasswordPage />} />
        <Route path="/oauth/callback"         element={<OAuthCallbackPage />} />
        <Route path="/dashboard"              element={<DashboardPage />} />
        <Route path="/projects"               element={<ProjectsPage />} />
        <Route path="/projects/:projectId"    element={<ProjectDetailPage />} />
        <Route path="/rooms"                  element={<RoomsPage />} />
        <Route path="/room/:roomId"           element={<RoomSessionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
