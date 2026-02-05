
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellRing,
  BellOff
} from 'lucide-react';
import { LOGO_URL } from '../constants';
import { NotificationService } from '../services/notifications';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, activeTab, setActiveTab, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const handleNotificationClick = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      setNotificationStatus('granted');
      NotificationService.send(
        'System Link Established', 
        'Desktop notifications are now authorized for institutional alerts.'
      );
    } else {
      setNotificationStatus(Notification.permission);
      if (Notification.permission === 'denied') {
        alert("Institutional alert: Notifications are blocked by your browser settings. Please enable them to receive deadline updates.");
      }
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.FINANCE, UserRole.USER] },
    { id: 'users', label: 'Accounts', icon: Users, roles: [UserRole.SUPER_ADMIN] },
    { id: 'departments', label: 'Business Units', icon: Building2, roles: [UserRole.SUPER_ADMIN] },
    { id: 'projects', label: 'Budget Tracker', icon: Briefcase, roles: [UserRole.SUPER_ADMIN, UserRole.FINANCE, UserRole.USER] },
    { id: 'reports', label: 'Financial Intel', icon: BarChart3, roles: [UserRole.SUPER_ADMIN, UserRole.FINANCE] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const NotificationButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={handleNotificationClick}
      className={`relative p-2.5 rounded-xl transition-all duration-300 group ${className} ${
        notificationStatus === 'granted' 
          ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' 
          : notificationStatus === 'denied'
          ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
          : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white'
      }`}
      title={`Notifications: ${notificationStatus === 'granted' ? 'Authorized' : notificationStatus === 'denied' ? 'Blocked' : 'Request Access'}`}
    >
      {notificationStatus === 'granted' ? (
        <BellRing size={20} className="animate-pulse" />
      ) : notificationStatus === 'denied' ? (
        <BellOff size={20} />
      ) : (
        <Bell size={20} />
      )}
      {notificationStatus === 'default' && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-dark-red"></span>
      )}
    </button>
  );

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-dark-red text-white shadow-2xl transition-all duration-300`}>
      {/* Brand Section */}
      <div className={`p-6 flex flex-col items-center gap-4 border-b border-white/5 ${!mobile && isCollapsed ? 'px-2' : ''}`}>
        <div 
          className={`bg-white p-2 rounded-2xl shadow-lg shadow-black/20 transform hover:scale-105 transition-all cursor-pointer overflow-hidden ${!mobile && isCollapsed ? 'h-12 w-12 p-1.5' : 'h-24'}`} 
          onClick={() => setActiveTab('dashboard')}
        >
          <img src={LOGO_URL} alt="Logo" className="h-full w-auto object-contain mx-auto" />
        </div>
        {(!isCollapsed || mobile) && (
          <div className="text-center animate-in fade-in duration-500">
            <h1 className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Financial Control</h1>
            <p className="text-[9px] text-white/30 font-bold uppercase mt-1 tracking-widest">Institutional Portal</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 mt-8 space-y-2 px-3`}>
        {filteredMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (mobile) setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
              activeTab === item.id 
                ? 'bg-primary text-black font-black shadow-lg shadow-primary/20' 
                : 'hover:bg-white/5 text-white/60 hover:text-white'
            } ${!mobile && isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon size={22} className={activeTab === item.id ? 'text-black' : 'group-hover:text-primary transition-colors'} />
            {(!isCollapsed || mobile) && (
              <span className="text-xs tracking-wide uppercase font-bold whitespace-nowrap overflow-hidden">
                {item.label}
              </span>
            )}
            {activeTab === item.id && !mobile && isCollapsed && (
              <div className="absolute left-0 w-1 h-8 bg-black rounded-r-full"></div>
            )}
          </button>
        ))}
      </nav>

      {/* User & Footer Section */}
      <div className={`p-4 mt-auto bg-black/10 border-t border-white/5 ${!mobile && isCollapsed ? 'px-2' : ''}`}>
        
        {/* Quick Action: Notifications */}
        {(!isCollapsed || mobile) ? (
          <div className="flex items-center justify-between mb-4 px-3">
             <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">System Comms</span>
             <NotificationButton />
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <NotificationButton />
          </div>
        )}

        <div className={`flex items-center gap-3 px-3 py-3 mb-4 bg-white/5 rounded-2xl border border-white/5 ${!mobile && isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-primary flex items-center justify-center text-black shadow-inner">
            <UserCircle size={28} className="text-black/80" />
          </div>
          {(!isCollapsed || mobile) && (
            <div className="overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="text-[11px] font-black truncate tracking-tight">{user.name}</p>
              <div className="flex items-center gap-1.5">
                 <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                 <p className="text-[8px] text-white/40 font-black uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-black uppercase text-[10px] tracking-[0.2em] border border-red-500/20 ${!mobile && isCollapsed ? 'px-0' : ''}`}
        >
          <LogOut size={18} />
          {(!isCollapsed || mobile) && <span>Sign Out</span>}
        </button>

        {/* Collapse Toggle for Desktop */}
        {!mobile && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full mt-4 flex items-center justify-center py-2 text-white/20 hover:text-primary transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfdfd] font-sans selection:bg-primary selection:text-black">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-dark-red text-white shadow-xl z-20">
        <div className="flex items-center gap-3">
           <img src={LOGO_URL} alt="Logo" className="h-10 bg-white p-1 rounded-xl shadow-lg" />
           <div className="flex flex-col">
              <span className="text-xs font-black tracking-widest leading-none">FINANCE</span>
              <span className="text-[9px] text-primary font-bold">CONTROL</span>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationButton />
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:scale-95 transition-all"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar with Dynamic Width */}
      <aside className={`hidden md:block flex-shrink-0 z-30 transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}>
        <div className="h-screen sticky top-0">
          <NavContent />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-72 bg-dark-red shadow-2xl animate-in slide-in-from-left duration-300">
            <button 
              className="absolute top-6 right-[-48px] text-white p-2 bg-dark-red rounded-xl shadow-xl"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
            <NavContent mobile />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50/50 p-6 md:p-12 overflow-x-hidden transition-all duration-300">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
