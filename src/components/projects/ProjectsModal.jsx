import { useState, useEffect } from 'react';
import { X, FolderOpen, Plus, Trash2, Copy, Loader2, AlertCircle, Cloud, HardDrive, Save } from 'lucide-react';
import { projectService } from '../../services/projectService';
import useAppStore from '../../stores/useAppStore';

export default function ProjectsModal({ isOpen, onClose }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingNew, setSavingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [savingCurrentId, setSavingCurrentId] = useState(null);

  const research = useAppStore((s) => s.research);
  const hasCurrentWork = research?.content?.length > 100;

  // Fetch projects on open
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await projectService.listProjects();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProjects(data || []);
    }

    setIsLoading(false);
  };

  const handleSaveNewProject = async () => {
    if (!newProjectName.trim()) return;

    setSavingNew(true);
    setError(null);

    const { data, error: saveError } = await projectService.createProject(
      newProjectName.trim(),
      ''
    );

    if (saveError) {
      setError(saveError.message);
    } else {
      setProjects([data, ...projects]);
      setNewProjectName('');
      setShowNewProjectForm(false);
      setCurrentProjectId(data.id);
    }

    setSavingNew(false);
  };

  const handleSaveExistingProject = async (projectId) => {
    setSavingCurrentId(projectId);
    setError(null);

    const { error: saveError } = await projectService.saveProject(projectId);

    if (saveError) {
      setError(saveError.message);
    } else {
      // Refresh the project list to get updated timestamps
      await fetchProjects();
    }

    setSavingCurrentId(null);
  };

  const handleLoadProject = async (projectId) => {
    if (hasCurrentWork && !window.confirm('Loading this project will replace your current work. Continue?')) {
      return;
    }

    setLoadingProjectId(projectId);
    setError(null);

    const { error: loadError } = await projectService.loadProject(projectId);

    if (loadError) {
      setError(loadError.message);
    } else {
      setCurrentProjectId(projectId);
      onClose();
    }

    setLoadingProjectId(null);
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Delete "${projectName}"? This cannot be undone.`)) {
      return;
    }

    setDeletingProjectId(projectId);
    setError(null);

    const { error: deleteError } = await projectService.deleteProject(projectId);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setProjects(projects.filter(p => p.id !== projectId));
      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
      }
    }

    setDeletingProjectId(null);
  };

  const handleDuplicateProject = async (projectId, projectName) => {
    setError(null);

    const { data, error: dupError } = await projectService.duplicateProject(
      projectId,
      `${projectName} (Copy)`
    );

    if (dupError) {
      setError(dupError.message);
    } else {
      setProjects([data, ...projects]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">My Projects</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Save Current Work */}
          {hasCurrentWork && (
            <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              {showNewProjectForm ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name..."
                    autoFocus
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNewProject()}
                  />
                  <button
                    onClick={handleSaveNewProject}
                    disabled={savingNew || !newProjectName.trim()}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {savingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                    Save
                  </button>
                  <button
                    onClick={() => setShowNewProjectForm(false)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm text-indigo-300">
                      {currentProjectId ? 'Current project has unsaved changes' : 'You have unsaved work'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {currentProjectId && (
                      <button
                        onClick={() => handleSaveExistingProject(currentProjectId)}
                        disabled={savingCurrentId === currentProjectId}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium text-sm transition-colors border border-green-500/30"
                      >
                        {savingCurrentId === currentProjectId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Changes
                      </button>
                    )}
                    <button
                      onClick={() => setShowNewProjectForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Save as New
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-2">No saved projects yet</p>
              <p className="text-sm text-zinc-500">
                Start working on a project and save it to the cloud
              </p>
            </div>
          ) : (
            /* Projects List */
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between p-4 bg-zinc-800/50 border rounded-xl hover:border-zinc-600 transition-colors group ${
                    currentProjectId === project.id
                      ? 'border-indigo-500/50 bg-indigo-500/5'
                      : 'border-zinc-700/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-zinc-200 truncate">{project.name}</h3>
                      {currentProjectId === project.id && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/20 text-indigo-400 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span>Updated {formatDate(project.updated_at)}</span>
                      <span className="text-zinc-600">|</span>
                      <span>{formatSize(project.size_bytes)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {currentProjectId === project.id ? (
                      <button
                        onClick={() => handleSaveExistingProject(project.id)}
                        disabled={savingCurrentId === project.id}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-green-400"
                        title="Save changes"
                      >
                        {savingCurrentId === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLoadProject(project.id)}
                        disabled={loadingProjectId === project.id}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-indigo-400"
                        title="Load project"
                      >
                        {loadingProjectId === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FolderOpen className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicateProject(project.id, project.name)}
                      className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                      title="Duplicate project"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      disabled={deletingProjectId === project.id}
                      className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-red-400"
                      title="Delete project"
                    >
                      {deletingProjectId === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
