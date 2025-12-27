import { Home, LayoutDashboard, Settings, User, Check, Circle } from 'lucide-react';
import useAppStore from '../../stores/useAppStore';

const iconMap = {
  Home,
  LayoutDashboard,
  Settings,
  User,
};

const defaultPageTypes = [
  { id: 'landing', label: 'Landing Page', description: 'Marketing homepage', icon: 'Home' },
  { id: 'dashboard', label: 'Dashboard', description: 'Main app interface', icon: 'LayoutDashboard' },
  { id: 'settings', label: 'Settings', description: 'User preferences', icon: 'Settings' },
  { id: 'profile', label: 'Profile', description: 'User profile', icon: 'User' },
];

export default function PageSelector() {
  const { designVariations, setCurrentPage } = useAppStore();

  // Handle old localStorage state that may not have the new structure
  const currentPage = designVariations?.currentPage || 'landing';
  const pageTypes = designVariations?.pageTypes || defaultPageTypes;
  const pages = designVariations?.pages || {};

  const getPageStatus = (pageId) => {
    const page = pages[pageId];
    if (!page) return 'empty';
    if (page.fullPage) return 'complete';
    if (page.selected) return 'selected';
    if (page.variations?.length > 0) return 'has-variations';
    return 'empty';
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'complete':
        return <Check className="w-3 h-3 text-green-400" />;
      case 'selected':
        return <Check className="w-3 h-3 text-indigo-400" />;
      case 'has-variations':
        return <Circle className="w-3 h-3 text-yellow-400 fill-yellow-400" />;
      default:
        return <Circle className="w-3 h-3 text-zinc-600" />;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-medium text-zinc-400">Page Type</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pageTypes.map((pageType) => {
          const Icon = iconMap[pageType.icon];
          const isActive = currentPage === pageType.id;
          const status = getPageStatus(pageType.id);

          return (
            <button
              key={pageType.id}
              onClick={() => setCurrentPage(pageType.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <div className="flex items-center gap-1">
                  {getStatusIndicator(status)}
                </div>
              </div>
              <div className="font-medium text-white text-sm mb-1">{pageType.label}</div>
              <div className="text-xs text-zinc-400 line-clamp-2">{pageType.description}</div>

              {/* Status badge */}
              <div className="mt-2 text-xs">
                {status === 'complete' && (
                  <span className="text-green-400">Full page ready</span>
                )}
                {status === 'selected' && (
                  <span className="text-indigo-400">Variation selected</span>
                )}
                {status === 'has-variations' && (
                  <span className="text-yellow-400">Variations available</span>
                )}
                {status === 'empty' && (
                  <span className="text-zinc-600">Not started</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
