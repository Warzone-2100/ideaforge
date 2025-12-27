import { Upload, Plus, ImageIcon } from 'lucide-react';
import TemplateCard from './TemplateCard';

export default function TemplateLibraryGrid({
  templates = [],
  selectedTemplate = null,
  onSelectTemplate,
  onDeleteTemplate,
  onUploadClick,
}) {
  const handleSelectTemplate = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const handleDeleteTemplate = (id) => {
    if (onDeleteTemplate) {
      onDeleteTemplate(id);
    }
  };

  const handleUploadClick = () => {
    if (onUploadClick) {
      onUploadClick();
    }
  };

  return (
    <div className="template-library-section space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Templates & Inspiration</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Upload designs you love or use built-in templates
          </p>
        </div>
        <button
          onClick={handleUploadClick}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Template
        </button>
      </div>

      {/* Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Built-in templates (commented out for now - will add later) */}
          {/*
          <TemplateCard
            template={{
              id: 'builtin-linear',
              name: 'Linear',
              category: 'dashboard',
              thumbnail: '/templates/linear.png',
              source: 'built-in',
              uploadedAt: null,
              analysis: { ... }
            }}
            isBuiltIn={true}
            isSelected={selectedTemplate?.id === 'builtin-linear'}
            onSelect={handleSelectTemplate}
            onDelete={handleDeleteTemplate}
          />
          */}

          {/* All templates (built-in + user-uploaded) */}
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              isBuiltIn={template.source === 'built-in'}
              onSelect={handleSelectTemplate}
              onDelete={handleDeleteTemplate}
            />
          ))}

          {/* Add button */}
          <button
            onClick={handleUploadClick}
            className="template-add-card w-[200px] h-[160px] border-2 border-dashed border-zinc-700 hover:border-zinc-600 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:bg-zinc-900/30 group"
            aria-label="Add new template"
          >
            <Plus className="w-8 h-8 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
            <span className="text-sm text-zinc-400 group-hover:text-zinc-300 mt-2 transition-colors">
              Add Template
            </span>
          </button>
        </div>
      ) : (
        /* Empty state */
        <div className="empty-state flex flex-col items-center justify-center py-12 max-w-md mx-auto text-center">
          <div className="p-4 bg-zinc-900/50 rounded-full mb-4">
            <ImageIcon className="w-12 h-12 text-zinc-600" />
          </div>
          <p className="text-base text-zinc-400 mt-3 font-medium">No templates yet</p>
          <p className="text-sm text-zinc-500 mt-1">
            Upload screenshots from Figma, Dribbble, or any design you like
          </p>
          <button
            onClick={handleUploadClick}
            className="mt-4 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm font-medium"
          >
            Upload Your First Template
          </button>
        </div>
      )}
    </div>
  );
}
