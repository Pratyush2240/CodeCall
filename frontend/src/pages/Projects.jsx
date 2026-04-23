import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import './Projects.css';

const projectsList = [
  {
    name: 'CloudStream Architecture',
    description: 'A full-scale refactor of the real-time streaming engine using Rust and WebAssembly for low-latency processing.',
    tag: 'High Priority',
    activeRooms: 12,
    commits: 842,
    collaborators: 5
  },
  {
    name: 'Prism Design System',
    description: 'Standardizing our React components and Tailwind utilities across the core platform.',
    tag: 'Design',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop', // placeholder code image
    activeRooms: 3,
    collaborators: 2
  },
  {
    name: 'API Gateway V2',
    description: 'Scaling our public-facing endpoints to handle 10k requests per second during peak hours.',
    tag: 'Critical',
    activeRooms: 8
  },
  {
    name: 'Customer Insights',
    description: 'Machine learning pipeline for predicting user churn based on interaction frequency.',
    tag: 'Marketing',
    activeRooms: 2
  }
];

export default function ProjectsPage() {
  return (
    <div className="projects-shell">
      <Navbar activePage="projects" />

      <div className="projects-body">
        {/* ── Main Content ── */}
        <main className="projects-main">
          <div className="projects-header-row">
            <div className="projects-heading">
              <h1 className="projects-title">Projects</h1>
              <p className="projects-desc">
                Manage your collaborative workspaces and development workflows.
              </p>
            </div>
            <button className="btn-new-project">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Project
            </button>
          </div>

          <div className="projects-grid">
            {/* 1st project spans 2 columns usually, or just a masonry grid. Using grid here. */}
            <div className="project-grid-large">
               <ProjectCard project={projectsList[0]} large />
               <ProjectCard project={projectsList[1]} large />
            </div>

            <div className="project-grid-standard">
               <ProjectCard project={projectsList[2]} />
               <ProjectCard project={projectsList[3]} />
               <ProjectCard empty />
            </div>
          </div>
        </main>

        {/* ── Right Sidebar ── */}
        <Sidebar />
      </div>
    </div>
  );
}
