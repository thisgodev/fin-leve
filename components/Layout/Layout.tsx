
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  ArrowLeftRight, 
  PieChart, 
  Menu, 
  X, 
  Sun, 
  Moon,
  ShieldCheck,
  LogOut,
  Database,
  Crown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isPro = storageService.getConfig().isPro;

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Contas', icon: Wallet, path: '/accounts' },
    { name: 'Cartões', icon: CreditCard, path: '/cards' },
    { name: 'Lançamentos', icon: ArrowLeftRight, path: '/transactions' },
    { name: 'Relatórios', icon: PieChart, path: '/reports' },
    { name: 'Backup', icon: Database, path: '/backup' },
  ];

  const ThemeToggle = () => (
    <button 
      onClick={toggleTheme}
      className="flex items-center w-full space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
    >
      <div className="p-1 rounded bg-slate-100 dark:bg-slate-900">
        {theme === 'light' ? <Moon size={18} className="text-slate-600" /> : <Sun size={18} className="text-amber-400" />}
      </div>
      <span className="font-medium text-sm">Modo {theme === 'light' ? 'Escuro' : 'Claro'}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-200 font-inter">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 shadow-sm transition-colors duration-200`}>
        <div className="p-8 flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100 dark:shadow-none">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight italic">FINAN<span className="text-indigo-600">LEVE</span></span>
        </div>
        
        <nav className="mt-2 px-4 space-y-1 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-bold shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600'
              }`}
            >
              <item.icon size={18} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
          
          {!isPro && (
            <Link 
              to="/purchase"
              className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 font-bold mt-4 hover:opacity-80 transition-opacity"
            >
               <Crown size={18} />
               <span className="text-sm">Assinar PRO</span>
            </Link>
          )}
        </nav>

        <div className="p-4 space-y-2">
          <ThemeToggle />
          <button 
            onClick={logout}
            className="flex items-center w-full space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-800 shadow-2xl md:hidden transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
                <ShieldCheck size={24} />
             </div>
             <span className="font-black dark:text-white italic">FINANLEVE</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400">
            <X size={24} />
          </button>
        </div>
        <nav className="mt-4 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-4 rounded-2xl ${
                location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
          {!isPro && (
            <Link 
              to="/purchase"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-4 rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 font-bold"
            >
               <Crown size={20} />
               <span>Assinar PRO</span>
            </Link>
          )}
        </nav>
        <div className="absolute bottom-8 left-4 right-4 space-y-2">
           <ThemeToggle />
           <button 
            onClick={logout}
            className="flex items-center w-full space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-8 transition-colors z-40">
          <button className="md:hidden p-2 -ml-2 text-slate-600 dark:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="flex-1 hidden md:block">
            <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
              {menuItems.find(m => m.path === location.pathname)?.name || 'Financeiro Leve'}
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end text-right hidden sm:flex">
              <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">{user?.name}</span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user?.email}</span>
            </div>
            <div className="h-10 w-10 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
              <img src={user?.avatar} alt="Profile" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
