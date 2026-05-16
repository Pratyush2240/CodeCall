import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage          from './pages/Login';
import DashboardPage      from './pages/Dashboard';
import ProjectsPage       from './pages/Projects';
import ProjectDetailPage  from './pages/ProjectDetail';
import RoomsPage          from './pages/Rooms';
import RoomSessionPage    from './pages/RoomSession';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                   element={<Navigate to="/login" replace />} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/dashboard"          element={<DashboardPage />} />
        <Route path="/projects"           element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/rooms"              element={<RoomsPage />} />
        <Route path="/room/:roomId"       element={<RoomSessionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
