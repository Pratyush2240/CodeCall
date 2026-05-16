import { useState } from 'react';
import './CreateProjectModal.css';

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onCreate({ name: name.trim(), description: description.trim(), tags });

      // Reset & close
      setName('');
      setDescription('');
      setTagsInput('');
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="cpm-overlay" onClick={handleOverlayClick}>
      <div className="cpm-modal">
        <div className="cpm-header">
          <h2 className="cpm-title">New Project</h2>
          <button className="cpm-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form className="cpm-form" onSubmit={handleSubmit}>
          <div className="cpm-field">
            <label className="cpm-label" htmlFor="cpm-name">
              Project Name <span className="cpm-required">*</span>
            </label>
            <input
              id="cpm-name"
              className="cpm-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CloudStream Architecture"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="cpm-field">
            <label className="cpm-label" htmlFor="cpm-desc">
              Description
            </label>
            <textarea
              id="cpm-desc"
              className="cpm-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project…"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="cpm-field">
            <label className="cpm-label" htmlFor="cpm-tags">
              Tags <span className="cpm-hint">(comma-separated)</span>
            </label>
            <input
              id="cpm-tags"
              className="cpm-input"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Frontend, React, High Priority"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="cpm-error" role="alert">
              {error}
            </p>
          )}

          <div className="cpm-actions">
            <button
              type="button"
              className="cpm-btn cpm-btn--cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cpm-btn cpm-btn--create"
              disabled={!name.trim() || loading}
            >
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
