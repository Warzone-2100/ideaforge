import { useState, useRef, useEffect } from 'react';
import { LogOut, FolderOpen, ChevronDown } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';

export default function UserMenu({ onOpenProjects }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, signOut, getUserDisplayName, getUserAvatar, getUserEmail } = useAuthStore();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const avatarUrl = getUserAvatar();
  const displayName = getUserDisplayName() || 'User';
  const email = getUserEmail();
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-7 h-7 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <span className="text-xs font-medium text-indigo-400">{initials}</span>
          </div>
        )}
        <span className="text-sm text-zinc-300 hidden sm:block max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm font-medium text-zinc-200 truncate">{displayName}</p>
            <p className="text-xs text-zinc-500 truncate">{email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => { onOpenProjects?.(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-zinc-500" />
              My Projects
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-zinc-800 py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
