import { Link } from 'react-router-dom';
import './StaticDoc.css';

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export default function TermsPage() {
  return (
    <main className="static-doc-page" role="main">
      <header className="static-doc-header">
        <div className="logo-bubble" aria-label="CodeCall logo">
          <TerminalIcon />
        </div>
        <span className="brand-label">CodeCall Terms & Rules</span>
        <h1 className="static-doc-heading">Terms of Service</h1>
        <p className="static-doc-subtitle">Please read these rules carefully before using our platform.</p>
      </header>

      <div className="static-doc-card">
        <Link to="/login" className="static-doc-back-link" aria-label="Return to login page">
          ← Return to Sign In
        </Link>

        <section className="static-doc-content">
          <div className="static-doc-callout">
            <p>Welcome to CodeCall. By creating an account or joining collaboration rooms, you agree to comply with these terms. Please ensure your utilization is within our guidelines.</p>
          </div>

          <h2>1. Acceptable Use Policy</h2>
          <p>
            CodeCall provides shared sandbox environments for real-time collaborative development and testing. To maintain platform health, the following behaviors are strictly prohibited:
          </p>
          <ul>
            <li><strong>Runtime Abuse:</strong> You may not use the code execution compiler runtime (powered by Judge0) to execute mining scripts, network crawlers, denial-of-service tools, or cpu-intensive loop scripts designed to exhaust server resource limits.</li>
            <li><strong>Malicious Code:</strong> Storing, transmitting, or running code that contains worms, viruses, malware, trojan horses, or any payloads intended to exploit vulnerability endpoints of the system is strictly prohibited.</li>
            <li><strong>Collaborator Abuse:</strong> You may not use room chat channels or draw boards to harass, intimidate, stalk, or send spam to other users on the platform.</li>
          </ul>

          <h2>2. Account Responsibilities</h2>
          <p>
            Your account credentials are confidential. You are fully responsible for maintaining secure access configurations:
          </p>
          <ul>
            <li><strong>Credential Confidentiality:</strong> You must not share your passwords or JWT keys with third-party extensions. You are fully responsible for all rooms and actions executed under your credentials.</li>
            <li><strong>Accurate Details:</strong> If onboarding requires supplementary details, you must provide valid profile parameters. Accounts using system-impersonating names will be deactivated.</li>
            <li><strong>Activity Logs:</strong> Active sessions are tracked by IP and unique identifiers. If you discover unauthorized entries into your projects, you must immediately change your password and revoke outstanding room invitations.</li>
          </ul>

          <h2>3. Service Parameters & Limitations</h2>
          <p>
            CodeCall is optimized for ephemeral collaboration and active pair programming. The platform enforces the following engineering limits:
          </p>
          <ul>
            <li><strong>Room Expiration:</strong> Rooms are not permanent. Any room that has no user activity for 3 hours will be automatically expired (marked as ended, database status updated, and socket connections terminated).</li>
            <li><strong>Sandbox Isolation:</strong> Code execution outputs and compiler states are isolated sandboxes. We make no guarantee of persistent local disk states within the execution sandbox; files must be saved in the repository interface.</li>
            <li><strong>Beta and Uptime SLAs:</strong> We strive for maximum uptime, but CodeCall services are provided "as-is" without direct warranties of absolute availability or data recovery for expired workspaces.</li>
          </ul>

          <h2>4. Termination Policy</h2>
          <p>
            We respect your freedom to manage your account status, and we reserve the right to secure the platform from abuse:
          </p>
          <ul>
            <li><strong>User Deletion:</strong> You can permanently delete your account at any time via the Settings dashboard. Deletion completely wipes your data and cancels outstanding projects.</li>
            <li><strong>Suspension for Abuse:</strong> If system telemetry detects violations of runtime limits or malicious payload executions, CodeCall reserves the right to immediately disconnect active socket streams and terminate the user account.</li>
          </ul>
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
