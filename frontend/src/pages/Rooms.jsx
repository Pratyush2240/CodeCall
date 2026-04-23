import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';
import '../pages/Dashboard.css'; // Reuse dashboard layout classes

const allRooms = [
  { name: 'frontend-refactor', status: 'active',  lastUpdated: 'Updated 2 hours ago',  participants: 4 },
  { name: 'api-debug',         status: 'offline', lastUpdated: 'Updated yesterday',     participants: 2 },
  { name: 'auth-flow-review',  status: 'offline', lastUpdated: 'Updated 3 days ago',   participants: 8 },
  { name: 'payment-gateway',   status: 'active',  lastUpdated: 'Updated 5 mins ago',   participants: 3 },
  { name: 'design-sync',       status: 'offline', lastUpdated: 'Updated 1 week ago',   participants: 12 },
];

export default function RoomsPage() {
  return (
    <div className="dashboard-shell">
      <Navbar activePage="rooms" />

      <div className="dashboard-body">
        {/* ── Main Content ── */}
        <main className="dashboard-main">
          <div className="dashboard-heading" style={{ marginBottom: '24px' }}>
            <h1 className="dashboard-title">All Rooms</h1>
            <p className="dashboard-welcome">
              View and manage all your collaborative coding spaces.
            </p>
          </div>

          <div className="room-list">
            {allRooms.map((room, i) => (
              <RoomCard key={room.name} room={room} index={i} />
            ))}
          </div>
        </main>

        {/* ── Right Sidebar ── */}
        <Sidebar />
      </div>
    </div>
  );
}
