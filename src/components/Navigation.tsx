import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageTab, UserProfile } from '../types/index.ts';
import { NotificationBell } from './NotificationBell.tsx';
import {
  Calendar,
  Clock,
  Sparkles,
  Home,
  Menu,
  X,
  Plus,
  PhoneCall,
  User,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
  Sun,
  Moon,
  Stethoscope,
} from 'lucide-react';

interface NavigationProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenAccountModal: (tab: 'profile' | 'appointments' | 'settings') => void;
  onSignOut: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onOpenAccountModal,
  onSignOut,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const navItems: { tab: PageTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { tab: 'book', label: 'Book Appointment', icon: <Calendar className="w-4 h-4" /> },
    { tab: 'slots', label: 'Available Slots', icon: <Clock className="w-4 h-4" /> },
    { tab: 'triage', label: 'AI Triage', icon: <Sparkles className="w-4 h-4 text-[#8957FF]" /> },
    { tab: 'doctor', label: 'Doctor Portal', icon: <Stethoscope className="w-4 h-4 text-[#00CFA8]" /> },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tab: PageTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#5145FF] focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none font-bold"
      >
        Skip to main content
      </a>

      {/* Top Notification Bar: Aurora Gradient Ribbon */}
      <div className="w-full bg-gradient-to-r from-[#171A3B] via-[#211F4E] to-[#171A3B] text-white text-xs py-2 px-4 sm:px-8 border-b border-white/10 select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-[#B9F4D0]">
              <span className="w-2 h-2 rounded-full bg-[#00CFA8] animate-pulse inline-block" />
              24/7 Outpatient & Emergency Receiving
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="hidden md:inline text-white/80 font-medium">
              Aurora Care Campus: 400 Aether Health Blvd
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a
              href="tel:911"
              className="text-[#FF745C] hover:text-[#FF9B54] transition-colors flex items-center gap-1 font-bold"
              title="Immediate medical emergencies"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency: 911</span>
            </a>
            <span className="text-white/20">|</span>
            <span className="text-white/80">Appointments: (800) 555-0199</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header
        role="banner"
        className="sticky top-0 z-40 w-full bg-[#FFFDF8]/90 dark:bg-[#0B0C1E]/90 backdrop-blur-md border-b border-[#5145FF]/10 dark:border-white/10 transition-colors duration-200 shadow-aurora-card dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 text-left group focus-visible:outline-none"
            aria-label="Aether Hospital Homepage"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#5145FF] via-[#8957FF] to-[#E34AD7] flex items-center justify-center text-white shadow-aurora-indigo group-hover:scale-105 transition-transform duration-300">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#171A3B] dark:text-white block leading-tight font-sans">
                Aether<span className="text-[#5145FF] dark:text-[#16CBE5]">Hospital</span>
              </span>
              <span className="text-[11px] font-bold text-transparent bg-gradient-to-r from-[#8957FF] to-[#16CBE5] bg-clip-text block tracking-widest uppercase">
                Aurora Care
              </span>
            </div>
          </button>

          {/* Desktop Center Navigation with Gliding Active Pill */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center p-1.5 rounded-2xl bg-white/80 dark:bg-[#151838]/80 border border-slate-200/80 dark:border-white/10 shadow-xs relative"
          >
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => handleTabClick(item.tab)}
                  className={`relative px-4 py-2 text-sm font-bold rounded-xl transition-colors duration-200 flex items-center gap-2 whitespace-nowrap z-10 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#171A3B] dark:hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Sliding active pill indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                      className="absolute inset-0 bg-gradient-to-r from-[#5145FF] to-[#8957FF] rounded-xl shadow-aurora-indigo -z-10"
                    />
                  )}
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Area: Dark Mode Toggle + Sign In / Create Account OR Profile Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live appointment notifications */}
            {currentUser && <NotificationBell user={currentUser} />}

            {/* Desktop Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="relative p-2.5 rounded-2xl border transition-all duration-300 focus-visible:outline-none flex items-center justify-center bg-white/90 hover:bg-[#F0E8FF]/60 border-slate-200/80 text-[#171A3B] shadow-xs dark:bg-[#151838]/90 dark:border-white/10 dark:text-yellow-300 dark:hover:bg-white/10 dark:shadow-[0_0_20px_rgba(255,200,87,0.2)] cursor-pointer"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDarkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4 text-[#FFC857] drop-shadow-[0_0_6px_rgba(255,200,87,0.7)]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 text-[#5145FF] drop-shadow-[0_0_6px_rgba(81,69,255,0.4)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {currentUser ? (
              /* Signed-in User Dropdown */
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-white dark:bg-[#151838] border border-slate-200/80 dark:border-white/10 hover:border-[#8957FF]/40 shadow-xs transition-all focus-visible:outline-none cursor-pointer"
                  aria-expanded={profileDropdownOpen}
                >
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentUser.avatarGradient} flex items-center justify-center text-white text-xs font-black shadow-xs`}
                  >
                    {currentUser.avatarInitials}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-[#171A3B] dark:text-white">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
                </button>

                {/* Animated Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#151838] rounded-2xl shadow-xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-white/10 p-2 z-50 text-xs space-y-1 font-medium"
                    >
                      <div className="p-2.5 bg-[#FFFDF8] dark:bg-[#0B0C1E] rounded-xl border border-slate-100 dark:border-white/10 mb-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold block">
                          Signed in as
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#171A3B] dark:text-white truncate block">
                            {currentUser.name}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                              currentUser.role === 'doctor'
                                ? 'bg-[#B9F4D0]/60 dark:bg-[#00CFA8]/20 text-[#065f46] dark:text-[#B9F4D0]'
                                : 'bg-[#F0E8FF] dark:bg-[#5145FF]/20 text-[#5145FF] dark:text-[#A594FD]'
                            }`}
                          >
                            {currentUser.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#5145FF] dark:text-[#16CBE5] truncate block">
                          {currentUser.email}
                        </span>
                      </div>

                      {currentUser.role === 'doctor' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onSelectTab('doctor');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                        >
                          <Stethoscope className="w-4 h-4 text-[#00CFA8]" />
                          <span>Doctor Dashboard</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              onOpenAccountModal('appointments');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                          >
                            <Calendar className="w-4 h-4 text-[#5145FF] dark:text-[#16CBE5]" />
                            <span>My Appointments</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              onOpenAccountModal('profile');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                          >
                            <User className="w-4 h-4 text-[#8957FF] dark:text-[#E34AD7]" />
                            <span>My Profile</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              onOpenAccountModal('settings');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                          >
                            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>Account Settings</span>
                          </button>
                        </>
                      )}

                      <div className="pt-1 border-t border-slate-100 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onSignOut();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2.5 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Signed-out buttons: Sign In & Create Account */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#171A3B] dark:text-slate-200 hover:text-[#5145FF] dark:hover:text-[#16CBE5] hover:bg-[#F0E8FF]/60 dark:hover:bg-white/10 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="px-3.5 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5145FF] via-[#8957FF] to-[#E34AD7] hover:opacity-95 rounded-xl shadow-aurora-indigo transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#171A3B] dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors focus-visible:outline-2 cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden bg-[#FFFDF8] dark:bg-[#0B0C1E] border-b border-[#5145FF]/10 dark:border-white/10 px-4 pt-2 pb-6 space-y-3 overflow-hidden shadow-lg"
            >
              <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
                {navItems.map((item) => {
                  const isActive = currentTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => handleTabClick(item.tab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white shadow-aurora-indigo'
                          : 'text-[#171A3B] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Appearance Toggle */}
              <div className="pt-3 pb-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-[#FFC857]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#5145FF]" />
                  )}
                  <span>Theme</span>
                </span>
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#151838] border border-slate-200 dark:border-white/10 text-[#171A3B] dark:text-white flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-[#FFC857]' : 'bg-[#5145FF]'}`} />
                </button>
              </div>

              {!currentUser && (
                <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="py-3 px-4 bg-white dark:bg-[#151838] border border-slate-200 dark:border-white/10 text-[#171A3B] dark:text-white font-bold rounded-xl text-xs text-center shadow-xs cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="py-3 px-4 bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white font-bold rounded-xl text-xs text-center shadow-aurora-indigo cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
