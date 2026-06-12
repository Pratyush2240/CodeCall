import { Link } from 'react-router-dom';
import './StaticDoc.css';

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export default function ApiDocsPage() {
  return (
    <main className="static-doc-page" role="main">
      <header className="static-doc-header">
        <div className="logo-bubble" aria-label="CodeCall logo">
          <TerminalIcon />
        </div>
        <span className="brand-label">CodeCall REST API</span>
        <h1 className="static-doc-heading">API Reference Docs</h1>
        <p className="static-doc-subtitle">Endpoint reference for integrating with CodeCall services.</p>
      </header>

      <div className="static-doc-card">
        <Link to="/dashboard" className="static-doc-back-link" aria-label="Return to dashboard">
          ← Return to Dashboard
        </Link>

        <section className="static-doc-content">
          <div className="static-doc-callout">
            <p>The CodeCall REST API enables programmatic management of authentication tokens, rooms, workspace projects, and code compiler runs. Base URL: <code>http://localhost:5000/api</code>.</p>
          </div>

          <h2>1. Authentication Module</h2>
          <p>
            Endpoints to handle developer registrations, credentials-based login, token refresh, and clean session closures:
          </p>
          <div className="static-doc-table-wrapper">
            <table className="static-doc-table">
              <thead>
                <tr>
                  <th>Method & Route</th>
                  <th>Description</th>
                  <th>Auth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>POST /auth/register</code></td>
                  <td>Creates a new user profile with hashed credentials.</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><code>POST /auth/login</code></td>
                  <td>Validates credentials and issues short access/refresh JWTs.</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><code>POST /auth/refresh</code></td>
                  <td>Rotates refresh tokens and issues fresh access tokens.</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><code>POST /auth/logout</code></td>
                  <td>Blacklists active refresh tokens and clears client session.</td>
                  <td>No</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>2. Rooms Module</h2>
          <p>
            Endpoints to manage collaborative session configurations and invite credentials:
          </p>
          <div className="static-doc-table-wrapper">
            <table className="static-doc-table">
              <thead>
                <tr>
                  <th>Method & Route</th>
                  <th>Description</th>
                  <th>Auth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>GET /rooms</code></td>
                  <td>Fetches lists of collaborative rooms the user participates in.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><code>POST /rooms</code></td>
                  <td>Creates a new collaboration room. Supports optional project filtering.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><code>POST /rooms/join</code></td>
                  <td>Registers participant entry into a room using a unique code.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><code>PATCH /rooms/:id/end</code></td>
                  <td>Terminates room session, sets ended timestamp, and severing sockets.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><code>DELETE /rooms/:id</code></td>
                  <td>Permanently deletes collaboration room metadata and logs.</td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>3. Projects Module</h2>
          <p>
            Endpoints to structure repositories and group relevant rooms together:
          </p>
          <div className="static-doc-table-wrapper">
            <table className="static-doc-table">
              <thead>
                <tr>
                  <th>Method & Route</th>
                  <th>Description</th>
                  <th>Auth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>GET /projects</code></td>
                  <td>Lists all projects in the workspace.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><code>POST /projects</code></td>
                  <td>Creates a new workspace project.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><code>GET /projects/:id</code></td>
                  <td>Fetches details of a single project, its rooms, and members.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><code>PATCH /projects/:id</code></td>
                  <td>Updates name, descriptions, or tags of a project.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><code>DELETE /projects/:id</code></td>
                  <td>Permanently deletes project container and associated rooms.</td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>4. Code Execution Module</h2>
          <p>
            Endpoint to compile and execute raw user code in secure isolated compiler sandboxes:
          </p>
          <div className="static-doc-table-wrapper">
            <table className="static-doc-table">
              <thead>
                <tr>
                  <th>Method & Route</th>
                  <th>Description</th>
                  <th>Auth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>POST /execute</code></td>
                  <td>Submits code body, language tokens, and inputs to isolated sandbox.</td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>5. Users Module</h2>
          <p>
            Endpoints to query credentials details and resolve usernames for search invitations:
          </p>
          <div className="static-doc-table-wrapper">
            <table className="static-doc-table">
              <thead>
                <tr>
                  <th>Method & Route</th>
                  <th>Description</th>
                  <th>Auth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>GET /user/me</code></td>
                  <td>Resolves active user profile details (ID, email, name).</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><code>GET /user/search?q=...</code></td>
                  <td>Searches registered user pool by case-insensitive queries.</td>
                  <td>Yes</td>
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
