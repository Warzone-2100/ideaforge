import { useState } from 'react';

export default function HomepagePreview({ homepage, onClose }) {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'html' | 'css' | 'js'
  const [copied, setCopied] = useState(false);

  // Create preview URL
  const createPreviewURL = () => {
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          ${homepage.css || ''}
        </style>
      </head>
      <body>
        ${homepage.html || ''}
        <script>${homepage.js || ''}</script>
      </body>
      </html>
    `;
    const blob = new Blob([fullHTML], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  const [previewURL] = useState(createPreviewURL());

  // Open in new tab
  const handleOpenInNewTab = () => {
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IdeaForge Homepage</title>
  <style>
${homepage.css || ''}
  </style>
</head>
<body>
${homepage.html || ''}
  <script>
${homepage.js || ''}
  </script>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Download as ZIP (for now, just download HTML)
  const handleDownload = () => {
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IdeaForge Homepage</title>
  <style>
${homepage.css || ''}
  </style>
</head>
<body>
${homepage.html || ''}
  <script>
${homepage.js || ''}
  </script>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'homepage.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy code to clipboard
  const handleCopy = () => {
    let textToCopy = '';
    switch (activeTab) {
      case 'html':
        textToCopy = homepage.html || '';
        break;
      case 'css':
        textToCopy = homepage.css || '';
        break;
      case 'js':
        textToCopy = homepage.js || '';
        break;
      default:
        textToCopy = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${homepage.css || ''}</style>
</head>
<body>
${homepage.html || ''}
  <script>${homepage.js || ''}</script>
</body>
</html>`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'preview', label: 'Preview', icon: '👁️' },
    { id: 'html', label: 'HTML', icon: '<>' },
    { id: 'css', label: 'CSS', icon: '🎨' },
    { id: 'js', label: 'JS', icon: '⚡' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-7xl h-[90vh] bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Homepage Preview</h2>
            <p className="text-sm text-zinc-400 mt-1">
              {homepage.sections?.length || 0} sections • {homepage.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenInNewTab}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in New Tab
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm font-medium"
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium"
            >
              Download HTML
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-t-lg font-medium text-sm transition-all
                ${activeTab === tab.id
                  ? 'bg-zinc-800 text-white border-b-2 border-indigo-500'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'preview' && (
            <iframe
              src={previewURL}
              className="w-full h-full border-0 bg-white"
              title="Homepage Preview"
            />
          )}

          {activeTab === 'html' && (
            <pre className="w-full h-full overflow-auto p-4 bg-zinc-950 text-zinc-300 text-sm font-mono">
              {homepage.html || ''}
            </pre>
          )}

          {activeTab === 'css' && (
            <pre className="w-full h-full overflow-auto p-4 bg-zinc-950 text-zinc-300 text-sm font-mono">
              {homepage.css || ''}
            </pre>
          )}

          {activeTab === 'js' && (
            <pre className="w-full h-full overflow-auto p-4 bg-zinc-950 text-zinc-300 text-sm font-mono">
              {homepage.js || '// No JavaScript'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
