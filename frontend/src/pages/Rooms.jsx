import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';
import { getRooms } from '../api/rooms';
import '../pages/Dashboard.css'; // Reuse dashboard layout classes

export default function RoomsPage() {
  const [rooms, setRooms]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRooms();
        if (!cancelled) setRooms(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ?? 'Failed to load rooms. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

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

          {loading && (
            <div className="rooms-state-msg">Loading rooms…</div>
          )}

          {error && !loading && (
            <div className="rooms-state-msg rooms-state-msg--error" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && rooms.length === 0 && (
            <div className="rooms-state-msg">
              No rooms found. Head to the dashboard to create one!
            </div>
          )}

          {!loading && !error && rooms.length > 0 && (
            <div className="room-list">
              {rooms.map((room, i) => (
                <RoomCard key={room.id ?? room._id ?? room.name} room={room} index={i} />
              ))}
            </div>
          )}
        </main>

        {/* ── Right Sidebar ── */}
        <Sidebar />
      </div>
    </div>
  );
}
