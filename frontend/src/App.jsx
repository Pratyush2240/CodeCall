import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider }      from './context/UserContext';
import LoginPage             from './pages/Login';
import SignupPage            from './pages/Signup';
import ForgotPasswordPage    from './pages/ForgotPassword';
import ResetPasswordPage     from './pages/ResetPassword';
import DashboardPage         from './pages/Dashboard';
import ProjectsPage          from './pages/Projects';
import ProjectDetailPage     from './pages/ProjectDetail';
import RoomsPage             from './pages/Rooms';
import RoomSessionPage       from './pages/RoomSession';
import OAuthCallbackPage     from './pages/OAuthCallback';
import CompleteProfilePage   from './pages/CompleteProfile';
import SettingsPage          from './pages/Settings';
import ProtectedRoute        from './components/ProtectedRoute';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* ─── Public / Auth Routes ─────────────────────── */}
          <Route path="/"                      element={<Navigate to="/login" replace />} />
          <Route path="/login"                 element={<LoginPage />} />
          <Route path="/signup"                element={<SignupPage />} />
          <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/oauth/callback"        element={<OAuthCallbackPage />} />

          {/* ─── Onboarding (auth required, profile not yet complete) ── */}
          <Route path="/complete-profile"      element={<CompleteProfilePage />} />

          {/* ─── Protected Routes (auth + profile complete required) ── */}
          <Route path="/dashboard"             element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/projects"              element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId"   element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/rooms"                 element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />
          <Route path="/room/:roomId"          element={<ProtectedRoute><RoomSessionPage /></ProtectedRoute>} />
          <Route path="/settings"              element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
