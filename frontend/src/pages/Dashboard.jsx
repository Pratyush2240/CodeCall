import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';
import './Dashboard.css';

/* ── Icons ── */
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const DoorIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 4H6a2 2 0 00-2 2v12a2 2 0 002 2h7" />
    <path d="M17 8l4 4-4 4" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const VideoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

const recentRooms = [
  { name: 'frontend-refactor', status: 'active',  lastUpdated: 'Updated 2 hours ago',  participants: 4 },
  { name: 'api-debug',         status: 'offline', lastUpdated: 'Updated yesterday',     participants: 2 },
  { name: 'auth-flow-review',  status: 'offline', lastUpdated: 'Updated 3 days ago',   participants: 8 },
];

export default function DashboardPage() {
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="dashboard-shell">
      <Navbar activePage="dashboard" />

      <div className="dashboard-body">
        {/* ── Main Content ── */}
        <main className="dashboard-main">

          {/* Page title */}
          <div className="dashboard-heading">
            <h1 className="dashboard-title">Workspace Dashboard</h1>
            <p className="dashboard-welcome">
              Welcome back, Alex. You have{' '}
              <strong style={{ color: 'var(--color-accent)' }}>3 active rooms</strong> today.
            </p>
          </div>

          {/* Create / Join Cards */}
          <div className="action-cards">
            {/* Create Room */}
            <div className="action-card">
              <div className="action-card-icons">
                <div className="action-icon action-icon--blue">
                  <VideoIcon />
                </div>
                <div className="action-icon-ghost">
                  <PlusIcon />
                </div>
              </div>
              <h2 className="action-card-title">Create Room</h2>
              <p className="action-card-desc">
                Start a new instant session with voice, video, and shared code editor.
              </p>
              <button id="create-room-btn" className="btn-create">
                <PlusIcon /> New Session
              </button>
            </div>

            {/* Join Room */}
            <div className="action-card">
              <div className="action-card-icons">
                <div className="action-icon action-icon--neutral">
                  <DoorIcon />
                </div>
                <div className="action-icon-ghost action-icon-ghost--right">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
              </div>
              <h2 className="action-card-title">Join Room</h2>
              <p className="action-card-desc">
                Enter a room code or invite link to collaborate with your team members.
              </p>
              <div className="join-input-group">
                <input
                  id="room-code-input"
                  type="text"
                  className="join-input"
                  placeholder="Enter code…"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value)}
                  aria-label="Enter room code"
                />
                <button
                  id="enter-code-btn"
                  className="btn-join"
                  disabled={!roomCode.trim()}
                >
                  Enter Code
                </button>
              </div>
            </div>
          </div>

          {/* Recent Rooms */}
          <section className="recent-rooms-section" aria-label="Recent rooms">
            <div className="section-header">
              <h2 className="section-title">Recent Rooms</h2>
              <a href="#history" className="section-link">View History</a>
            </div>
            <div className="room-list">
              {recentRooms.map((room, i) => (
                <RoomCard key={room.name} room={room} index={i} />
              ))}
            </div>
          </section>

        </main>

        {/* ── Right Sidebar ── */}
        <Sidebar />
      </div>
    </div>
  );
}
