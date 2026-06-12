import { Link } from 'react-router-dom';
import './StaticDoc.css';

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export default function SecurityPage() {
  return (
    <main className="static-doc-page" role="main">
      <header className="static-doc-header">
        <div className="logo-bubble" aria-label="CodeCall logo">
          <TerminalIcon />
        </div>
        <span className="brand-label">CodeCall Infrastructure</span>
        <h1 className="static-doc-heading">Security Overview</h1>
        <p className="static-doc-subtitle">How we protect your code, identity, and connections.</p>
      </header>

      <div className="static-doc-card">
        <Link to="/login" className="static-doc-back-link" aria-label="Return to login page">
          ← Return to Sign In
        </Link>

        <section className="static-doc-content">
          <div className="static-doc-callout">
            <p>CodeCall utilizes industry-grade algorithms, secure token schemas, and real-time validation layers to keep your developer credentials and shared codes safe. Below is a detailed breakdown of our security measures.</p>
          </div>

          <h2>1. Password Hashing (Cryptographic Storage)</h2>
          <p>
            We enforce strict standards to ensure user credentials cannot be compromised:
          </p>
          <ul>
            <li><strong>Algorithm:</strong> We use **Bcrypt** for securing plain-text passwords before storing them in the Postgres database.</li>
            <li><strong>Salt Rounds:</strong> A work factor of **10 salt rounds** is applied to ensure resistance against brute-force attacks.</li>
            <li><strong>Zero Plain-text Storage:</strong> Plain-text passwords never touch our database disk or logging layers. Only hashed passwords are compared during credentials-based login.</li>
          </ul>

          <h2>2. JSON Web Token (JWT) Authentication</h2>
          <p>
            API session authorization is managed using secure token boundaries:
          </p>
          <ul>
            <li><strong>Access Tokens:</strong> Cryptographically signed tokens that expire after **15 minutes** are used to authenticate API and Socket.IO connection requests.</li>
            <li><strong>Refresh Tokens:</strong> Used to request new access tokens and expire after **7 days**.</li>
            <li><strong>Token Storage:</strong> Access and refresh tokens are stored securely on the client. On the backend, refresh token rotations and verification guard against unauthorized reuse.</li>
          </ul>

          <h2>3. OAuth Authentication Security</h2>
          <p>
            CodeCall integrates securely with GitHub and Google for passwordless login:
          </p>
          <ul>
            <li><strong>Protocol:</strong> standard **OAuth 2.0** flows are implemented.</li>
            <li><strong>State Verification:</strong> Session state parameters are validated to prevent Cross-Site Request Forgery (CSRF) attempts.</li>
            <li><strong>Minimal Scope Request:</strong> We request only basic identity credentials (`read:user` and email scopes) to prevent excessive permissions exposure. We do not request repository write access unless explicitly granted.</li>
          </ul>

          <h2>4. Room & Socket Security</h2>
          <p>
            Collaborative rooms are secured to ensure only authorized developers can view and edit code:
          </p>
          <ul>
            <li><strong>Unique Invite Codes:</strong> Rooms are generated with random, non-sequential short codes (e.g. `A3F-9KZ`) to block brute-force traversal.</li>
            <li><strong>Socket.IO Authentication:</strong> Real-time websocket connections must present a valid JWT access token during connection handshake. Anonymous connections are immediately closed.</li>
            <li><strong>Lazy Expiration severance:</strong> If a room is determined to be inactive (no activity for 3 hours), the socket namespace is closed, and existing participant connections are actively severed (`disconnectSockets(true)`).</li>
          </ul>

          <h2>5. Core Data Protection Measures</h2>
          <p>
            Our web servers enforce transport and parameter safety:
          </p>
          <ul>
            <li><strong>CORS Policy:</strong> Strict Cross-Origin Resource Sharing rules restrict API requests to approved client domains.</li>
            <li><strong>HTTP Headers:</strong> **Helmet.js** middleware is enabled on the Express server to prevent common vulnerabilities (e.g., Cross-Site Scripting, Clickjacking, MIME sniffing).</li>
            <li><strong>Rate Limiting:</strong> Endpoints like `/api/auth/login` and `/api/auth/register` utilize rate-limiting modules to prevent credential stuffing and denial-of-service abuse.</li>
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
