import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../api/users';
import { sendInvitation, getRoomInvitations, revokeInvitation } from '../api/invitations';
import { getRooms, getRoom } from '../api/rooms';
import './InviteModal.css';

/**
 * InviteModal component
 *
 * Props:
 *   isOpen       {boolean}  - Modal open state
 *   onClose      {fn}       - Called on close
 *   roomId       {string}   - ID of the current room
 *   participants {Array}    - List of current room participants (to check if user is in room)
 */
export default function InviteModal({ isOpen, onClose, roomId, participants = [] }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [roomInvites, setRoomInvites] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'

  // Global selection state (when roomId is not passed)
  const [activeRooms, setActiveRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(roomId || '');
  const [roomParticipants, setRoomParticipants] = useState([]);

  const activeRoomId = roomId || selectedRoomId;

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? payload.id ?? payload.sub ?? null;
    } catch { return null; }
  })();

  // Load active rooms on mount if no roomId is provided
  useEffect(() => {
    if (isOpen && !roomId) {
      loadActiveRooms();
    }
  }, [isOpen, roomId]);

  const loadActiveRooms = async () => {
    setRoomsLoading(true);
    try {
      const rooms = await getRooms();
      const ownedActive = (rooms || []).filter(
        (r) => (r.status === 'ACTIVE' || r.status === 'active') && r.createdBy === currentUserId
      );
      setActiveRooms(ownedActive);
      if (ownedActive.length === 1) {
        setSelectedRoomId(ownedActive[0].id);
      }
    } catch (err) {
      console.error('Failed to load active rooms:', err);
    } finally {
      setRoomsLoading(false);
    }
  };

  const loadRoomParticipants = async (rId) => {
    try {
      const rData = await getRoom(rId);
      setRoomParticipants(rData?.participants || []);
    } catch (err) {
      console.error('Failed to load room participants:', err);
    }
  };

  // Load room invitations and participants when room context is resolved
  useEffect(() => {
    if (isOpen && activeRoomId) {
      loadRoomInvitations(activeRoomId);
      if (!roomId) {
        loadRoomParticipants(activeRoomId);
      }
    } else {
      setRoomInvites([]);
      setRoomParticipants([]);
    }
  }, [isOpen, activeRoomId]);

  const loadRoomInvitations = async (rId) => {
    setInvitesLoading(true);
    try {
      const data = await getRoomInvitations(rId);
      setRoomInvites(data || []);
    } catch (err) {
      console.error('Failed to load room invitations:', err);
    } finally {
      setInvitesLoading(false);
    }
  };

  // Debounced search logic
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    const delayDebounce = setTimeout(async () => {
      try {
        const users = await searchUsers(searchQuery);
        setSearchResults(users || []);
      } catch (err) {
        setSearchError(err?.response?.data?.message || 'Error searching users.');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  if (!isOpen) return null;

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSendInvite = async (userId) => {
    try {
      await sendInvitation(activeRoomId, userId);
      showToast('Invitation sent successfully!', 'success');
      loadRoomInvitations(activeRoomId);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to send invitation.', 'error');
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    try {
      await revokeInvitation(inviteId);
      showToast('Invitation revoked.', 'success');
      loadRoomInvitations(activeRoomId);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to revoke invitation.', 'error');
    }
  };

  const isParticipant = (userId) => {
    const list = roomId ? participants : roomParticipants;
    return (list || []).some((p) => p.userId === userId || p.id === userId);
  };

  const getInviteStatus = (userId) => {
    const invite = roomInvites.find((i) => i.receiverId === userId);
    return invite ? invite.status : null;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };


  return (
    <div className="invite-overlay" onClick={handleOverlayClick}>
      <div className="invite-modal">
        <div className="invite-header">
          <h2 className="invite-title">Invite Collaborators</h2>
          <button className="invite-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {toastMessage && (
          <div className={`invite-toast invite-toast--${toastType}`} role="alert">
            {toastMessage}
          </div>
        )}

        <div className="invite-body">
          {/* Room Selection (Global context only) */}
          {!roomId && (
            <div className="invite-section invite-section--room-select">
              <h3 className="invite-section-title">Select Room</h3>
              {roomsLoading ? (
                <p className="invite-hint-state">Loading active rooms...</p>
              ) : activeRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <p className="invite-error" style={{ margin: 0 }}>You do not have any active rooms.</p>
                  <button
                    onClick={() => { onClose(); navigate('/dashboard'); }}
                    className="invite-action-btn"
                    style={{ marginTop: '12px', width: 'auto', padding: '0 16px', height: '36px' }}
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <select
                  className="invite-room-select"
                  value={selectedRoomId}
                  onChange={(e) => {
                    setSelectedRoomId(e.target.value);
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchError(null);
                  }}
                >
                  <option value="">-- Choose an active room --</option>
                  {activeRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {!activeRoomId ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
              <p>Please select an active room to invite teammates.</p>
            </div>
          ) : (
            <>
              {/* User Search Section */}
              <div className="invite-section">
                <h3 className="invite-section-title">Search Users</h3>
                <div className="invite-search-wrapper">
                  <input
                    type="text"
                    className="invite-search-input"
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searchLoading && <div className="invite-spinner"></div>}
                </div>

                {searchError && <p className="invite-error">{searchError}</p>}

                <div className="invite-results-list">
                  {searchQuery.trim().length >= 2 && !searchLoading && searchResults.length === 0 && (
                    <p className="invite-empty-state">No users found.</p>
                  )}
                  {searchQuery.trim().length < 2 && searchQuery.trim().length > 0 && (
                    <p className="invite-hint-state">Type at least 2 characters to search.</p>
                  )}

                  {searchResults.map((user) => {
                    const inRoom = isParticipant(user.id);
                    const inviteStatus = getInviteStatus(user.id);

                    return (
                      <div key={user.id} className="invite-user-row">
                        <img
                          src={user.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                          alt={user.username}
                          className="invite-user-avatar"
                        />
                        <div className="invite-user-info">
                          <p className="invite-user-name">{user.fullName || user.username}</p>
                          <p className="invite-user-meta">@{user.username}</p>
                        </div>

                        <div className="invite-user-action">
                          {inRoom ? (
                            <span className="invite-badge invite-badge--in-room">In Room</span>
                          ) : inviteStatus === 'PENDING' ? (
                            <span className="invite-badge invite-badge--pending">Pending</span>
                          ) : (
                            <button
                              className="invite-action-btn"
                              onClick={() => handleSendInvite(user.id)}
                            >
                              Invite
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pending Invitations Section */}
              <div className="invite-section invite-section--pending-invites">
                <h3 className="invite-section-title">Pending Invitations</h3>
                {invitesLoading ? (
                  <div className="invite-loading-state">Loading invitations...</div>
                ) : roomInvites.filter((i) => i.status === 'PENDING').length === 0 ? (
                  <p className="invite-empty-state">No pending invitations for this room.</p>
                ) : (
                  <div className="invite-pending-list">
                    {roomInvites
                      .filter((i) => i.status === 'PENDING')
                      .map((invite) => (
                        <div key={invite.id} className="invite-pending-row">
                          <img
                            src={invite.receiver?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                            alt={invite.receiver?.username}
                            className="invite-user-avatar"
                          />
                          <div className="invite-user-info">
                            <p className="invite-user-name">
                              {invite.receiver?.fullName || invite.receiver?.username}
                            </p>
                            <p className="invite-user-meta">@{invite.receiver?.username}</p>
                          </div>
                          <button
                            className="invite-revoke-btn"
                            onClick={() => handleRevokeInvite(invite.id)}
                            aria-label="Revoke Invitation"
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>

  );
}
