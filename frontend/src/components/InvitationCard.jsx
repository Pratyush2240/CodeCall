import { useState } from 'react';
import './InvitationCard.css';

/**
 * InvitationCard component
 *
 * Props:
 *   invitation {Object}  - The invitation data (including sender, room details, createdAt, expiresAt)
 *   onAccept   {fn}      - Async handler for Accept button click (returns Promise)
 *   onDecline  {fn}      - Async handler for Decline button click (returns Promise)
 */
export default function InvitationCard({ invitation, onAccept, onDecline }) {
  const [loading, setLoading] = useState(false);
  const { room, sender, createdAt, expiresAt } = invitation;

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getExpiryTime = (expiresAtStr) => {
    const diffMs = new Date(expiresAtStr).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const diffMins = Math.ceil(diffMs / (1000 * 60));
    if (diffMins < 60) return `Expires in ${diffMins}m`;
    const diffHrs = Math.ceil(diffMins / 60);
    if (diffHrs === 1) return 'Expires in 1h';
    return `Expires in ${diffHrs}h`;
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept(invitation.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await onDecline(invitation.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-card" role="article" aria-labelledby={`invite-room-${room.id}`}>
      <div className="invite-card-body">
        <img
          src={sender?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
          alt={sender?.username}
          className="invite-card-avatar"
        />
        <div className="invite-card-info">
          <p className="invite-card-text">
            <span className="invite-card-sender">{sender?.username}</span> invited you to join
          </p>
          <h4 id={`invite-room-${room.id}`} className="invite-card-room-name">
            {room?.name}
          </h4>
          <div className="invite-card-meta">
            <span className="invite-card-time">{timeAgo(createdAt)}</span>
            <span className="invite-card-dot">•</span>
            <span className="invite-card-expiry">{getExpiryTime(expiresAt)}</span>
          </div>
        </div>
      </div>
      <div className="invite-card-actions">
        <button
          className="invite-btn-decline"
          onClick={handleDecline}
          disabled={loading}
          aria-label="Decline Invitation"
        >
          Decline
        </button>
        <button
          className="invite-btn-accept"
          onClick={handleAccept}
          disabled={loading}
          aria-label="Accept Invitation"
        >
          {loading ? 'Joining…' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
