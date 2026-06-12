import { Link } from 'react-router-dom';
import './StaticDoc.css';

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export default function PrivacyPage() {
  return (
    <main className="static-doc-page" role="main">
      <header className="static-doc-header">
        <div className="logo-bubble" aria-label="CodeCall logo">
          <TerminalIcon />
        </div>
        <span className="brand-label">CodeCall Security & Trust</span>
        <h1 className="static-doc-heading">Privacy Policy</h1>
        <p className="static-doc-subtitle">How we collect, protect, and handle your information.</p>
      </header>

      <div className="static-doc-card">
        <Link to="/login" className="static-doc-back-link" aria-label="Return to login page">
          ← Return to Sign In
        </Link>

        <section className="static-doc-content">
          <div className="static-doc-callout">
            <p>Last updated: June 12, 2026. This Privacy Policy details our practices regarding information collection, security, user rights, and data retention on the CodeCall platform.</p>
          </div>

          <h2>1. Data Collection</h2>
          <p>
            CodeCall collects only the minimal data necessary to provide a high-performance, real-time collaborative development workspace. The types of data collected include:
          </p>
          <ul>
            <li><strong>Workspace Activity:</strong> Collaboration session code keystrokes, whiteboard strokes, DSA canvas diagrams, and console execution commands are processed in real-time.</li>
            <li><strong>Technical Metadata:</strong> IP address, browser type, socket connection state, and system diagnostics are processed to ensure connection stability and troubleshoot latency.</li>
            <li><strong>Communication Data:</strong> Room-scoped chat messages sent during collaborative sessions are broadcasted to active room participants and stored temporarily in the database.</li>
          </ul>

          <h2>2. Authentication Information</h2>
          <p>
            We take account security seriously. Authentication credentials are collected and processed with the highest industry standards:
          </p>
          <ul>
            <li><strong>Credentials:</strong> Account registration requires a unique username, email address, and password. Passwords are never stored in plain text.</li>
            <li><strong>Federated Identity (OAuth):</strong> If you sign up or log in using third-party providers (GitHub or Google), we receive secure, scoped tokens (specifically email, profile name, and unique user identifier) to authenticate your session. We do not access, store, or modify your external repositories or credentials.</li>
            <li><strong>Session Management:</strong> Authentication states are secured using JSON Web Tokens (JWT). Access tokens expire quickly, while refresh tokens are rotated and stored securely to manage active sessions.</li>
          </ul>

          <h2>3. User Rights & Controls</h2>
          <p>
            You retain absolute ownership of your account and creative workspaces on CodeCall. We respect and enforce the following rights under privacy laws:
          </p>
          <ul>
            <li><strong>Right of Access & Portability:</strong> You can view all projects and rooms associated with your account from your personal dashboard.</li>
            <li><strong>Right to Rectification:</strong> You can update your user profile metadata, change your passwords, and modify your project parameters in the Settings console.</li>
            <li><strong>Right to Erasure (Deletion):</strong> You have the absolute right to delete your account. Initiating account deletion in your Settings panel completely and permanently purges your profile, projects, rooms, and invitations from our live databases.</li>
            <li><strong>Revocation of Consent:</strong> You can revoke pending invitations or end active collaboration rooms at any time to block third-party access.</li>
          </ul>

          <h2>4. Data Retention & Lifecycle</h2>
          <p>
            To prevent system bloat and safeguard privacy, CodeCall enforces strict lifecycle automation:
          </p>
          <div className="static-doc-table-wrapper">
            <table className="static-doc-table">
              <thead>
                <tr>
                  <th>Data Entity</th>
                  <th>Retention & Lifecycle Policy</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Active Rooms</strong></td>
                  <td>Automatically marked as <strong>ENDED</strong> after 3 consecutive hours of inactivity. Sockets are severed and future entries blocked.</td>
                </tr>
                <tr>
                  <td><strong>Room Metadata</strong></td>
                  <td>Retained to list room history in your dashboard; deleted permanently if the room owner deletes the room or their account.</td>
                </tr>
                <tr>
                  <td><strong>Invitations</strong></td>
                  <td>Pending invitations automatically expire and become invalid after 24 hours. Deleted permanently upon room closure.</td>
                </tr>
                <tr>
                  <td><strong>Account Profile</strong></td>
                  <td>Retained indefinitely while the account remains active, and immediately destroyed upon user-initiated account deletion.</td>
                </tr>
              </tbody>
            </table>
          </div>
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
