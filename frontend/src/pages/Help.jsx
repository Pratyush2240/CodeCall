import { Link } from 'react-router-dom';
import './StaticDoc.css';

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export default function HelpPage() {
  return (
    <main className="static-doc-page" role="main">
      <header className="static-doc-header">
        <div className="logo-bubble" aria-label="CodeCall logo">
          <TerminalIcon />
        </div>
        <span className="brand-label">CodeCall Support</span>
        <h1 className="static-doc-heading">Help Center</h1>
        <p className="static-doc-subtitle">Guides, FAQs, and troubleshooting for CodeCall workspaces.</p>
      </header>

      <div className="static-doc-card">
        <Link to="/dashboard" className="static-doc-back-link" aria-label="Return to dashboard">
          ← Return to Dashboard
        </Link>

        <section className="static-doc-content">
          <div className="static-doc-callout">
            <p>Need assistance with your development environment? Below you'll find comprehensive documentation on how CodeCall collaboration rooms, editor utilities, and network sockets operate.</p>
          </div>

          <h2>1. Getting Started</h2>
          <p>
            CodeCall allows you to spin up real-time collaboration rooms inside projects.
          </p>
          <ul>
            <li><strong>Creating a Room:</strong> From your Dashboard or Project Details screen, click <strong>New Room</strong>. This generates an active workspace with a unique invite code.</li>
            <li><strong>Joining a Room:</strong> If a teammate shares a room code (e.g. `A3F-9KZ`), enter it in the **Join Room** card on your dashboard.</li>
            <li><strong>Inviting Teammates:</strong> Room hosts can search for registered users directly by username or email and send an in-app invite, avoiding manual code sharing.</li>
          </ul>

          <h2>2. Real-Time Collaboration</h2>
          <p>
            Workspaces support multiple concurrent developers syncing automatically:
          </p>
          <ul>
            <li><strong>Code Editor:</strong> Shared editor syncs code edits, syntax highlighting, and cursor tracking. The editor shows typing indicators for active colleagues.</li>
            <li><strong>Whiteboard & DSA Board:</strong> Toggle the Whiteboard tab to brainstorm drawing concepts, or use the DSA Board for structured node/pointer visual syncs.</li>
            <li><strong>WebRTC Voice/Video:</strong> Click **Join Call** inside a room to share audio and video streams with collaborators. Stream settings can be toggled using the status bar mic/camera controls.</li>
          </ul>

          <h2>3. Room Lifecycle & Auto-Expiration</h2>
          <p>
            To conserve system resources and secure unused environments, rooms follow automated lifecycle rules:
          </p>
          <ul>
            <li><strong>Auto-Expiration:</strong> If a room is inactive for **3 consecutive hours** (no keystrokes, drawings, chat messages, or executions), the server automatically expires it.</li>
            <li><strong>Severance:</strong> Sockets are disconnected and future join requests are rejected. Expired rooms appear on the dashboard with a red `Auto Ended` label.</li>
            <li><strong>Manual End:</strong> Room admins can choose to terminate a room session instantly by clicking the **End Room** header button.</li>
          </ul>

          <h2>4. Troubleshooting & FAQs</h2>
          <p>
            <strong>Q: Why does my editor say "Connecting..."?</strong><br />
            A: The socket handshake failed or your access token expired. Try returning to the dashboard to refresh your session credentials and rejoin the room.
          </p>
          <p>
            <strong>Q: How do I enable my microphone or camera?</strong><br />
            A: Click the browser lock icon in your URL address bar, ensure Microphone and Camera permissions are set to "Allow", and then refresh the page.
          </p>
          <p>
            <strong>Q: Can I rejoin a room after it has ended?</strong><br />
            A: No. Ended rooms are read-only or closed. Rejoining an expired room returns a 410 error: `"This room has expired due to inactivity."`
          </p>
        </section>
      </div>

      <footer className="static-doc-footer">
        <p>
          © 2026 CodeCall Inc. &nbsp;·&nbsp;
          <Link to="/privacy">Privacy</Link> &nbsp;·&nbsp;
          <Link to="/terms">Terms</Link> &nbsp;·&nbsp;
          <Link to="/security">Security</Link>
        </p>
      </footer>
    </main>
  );
}
