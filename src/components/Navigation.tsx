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
  Sun,
  Moon,
  Stethoscope,
  Heart,
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
    { tab: 'triage', label: 'AI Triage', icon: <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" /> },
    { tab: 'doctor', label: 'Doctor Portal', icon: <Stethoscope className="w-4 h-4 text-blue-700 dark:text-blue-300" /> },
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

  const tickerItems = [
    'IN 7 DAYS SAME-DAY CARE',
    'ZERO BOOKING FEES',
    '15 MIN AVG WAIT TIME',
    'LOCALLY OPERATED CLINIC',
    '90+ DAILY SPECIALIST SLOTS',
    'AI PATIENT TRIAGE IN 60 SECS',
    'WALK-INS ALWAYS WELCOME IN CLINIC',
    'FREE CANCELLATION & RESCHEDULE',
    '400 AETHER HEALTH BLVD, BRISTOL BS3',
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FFCC24] focus:text-black focus:border-2 focus:border-black focus:rounded-full focus:shadow-neo font-black"
      >
        Skip to main content
      </a>

      {/* Top Notification Bar: Pop Royal Blue Marquee Ticker (Matching Image 5) */}
      <div className="w-full bg-[#2154FE] text-white text-xs font-black py-2.5 px-2 border-b-2 border-black overflow-hidden select-none relative z-50">
        <div className="flex animate-marquee-smooth items-center">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={idx} className="flex items-center gap-3 px-3 uppercase tracking-wider text-[11px] sm:text-xs">
              <span className="text-[#FFCC24] text-sm">✦</span>
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header
        role="banner"
        className="sticky top-0 z-40 w-full bg-[#FAF7EE] dark:bg-[#0E131F] border-b-2 border-black dark:border-white/20 transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo (Matching Image 3 & 5 Neo-Brutalist Stamp) */}
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 text-left group focus-visible:outline-none cursor-pointer"
            aria-label="Aether Health Co. Homepage"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFCC24] border-2 border-black flex items-center justify-center text-black shadow-neo-sm group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-neo transition-all">
              <Plus className="w-6 h-6 stroke-[3.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white block leading-tight">
                  Aether Health Co.
                </span>
              </div>
              <span className="text-[10px] font-black text-black/60 dark:text-white/60 tracking-wider uppercase block">
                Independent Hospital & Clinic
              </span>
            </div>
          </button>

          {/* Desktop Center Navigation with Chunky Neo-Brutalist Tabs */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full bg-white dark:bg-[#182032] border-2 border-black shadow-neo-sm"
          >
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => handleTabClick(item.tab)}
                  className={`px-4 py-2 text-xs font-black rounded-full transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#FFCC24] text-black border-2 border-black shadow-neo-sm translate-y-[-1px]'
                      : 'text-black dark:text-slate-200 hover:text-black hover:bg-[#FAF7EE] dark:hover:bg-white/10'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Area: Dark Mode Toggle + CTA Button / User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live appointment notifications */}
            {currentUser && <NotificationBell user={currentUser} />}

            {/* Neo-brutalist Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl border-2 border-black shadow-neo-sm bg-white dark:bg-[#182032] text-black dark:text-yellow-300 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
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
                    transition={{ duration: 0.15 }}
                  >
                    <Sun className="w-4 h-4 text-[#FFCC24]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Moon className="w-4 h-4 text-[#2154FE]" />
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
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-white dark:bg-[#182032] border-2 border-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo transition-all cursor-pointer"
                  aria-expanded={profileDropdownOpen}
                >
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentUser.avatarGradient} border-2 border-black flex items-center justify-center text-white text-xs font-black`}
                  >
                    {currentUser.avatarInitials}
                  </div>
                  <span className="hidden sm:inline text-xs font-black text-black dark:text-white">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-black dark:text-white" />
                </button>

                {/* Animated Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#182032] rounded-2xl border-2 border-black shadow-neo-lg p-2 z-50 text-xs space-y-1 font-bold"
                    >
                      <div className="p-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] rounded-xl border-2 border-black mb-1">
                        <span className="text-[10px] text-black/60 dark:text-slate-400 uppercase font-black block">
                          Signed in as
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-black dark:text-white truncate block">
                            {currentUser.name}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-black ${
                              currentUser.role === 'doctor'
                                ? 'bg-[#00D09C] text-black'
                                : 'bg-[#FFCC24] text-black'
                            }`}
                          >
                            {currentUser.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#2154FE] dark:text-[#16CBE5] truncate block">
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
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFCC24] text-black dark:text-white dark:hover:text-black font-extrabold flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Stethoscope className="w-4 h-4 text-black dark:text-white" />
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
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFCC24] text-black dark:text-white dark:hover:text-black font-extrabold flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>My Appointments</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              onOpenAccountModal('profile');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFCC24] text-black dark:text-white dark:hover:text-black font-extrabold flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              onOpenAccountModal('settings');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFCC24] text-black dark:text-white dark:hover:text-black font-extrabold flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Account Settings</span>
                          </button>
                        </>
                      )}

                      <div className="pt-1 border-t-2 border-black">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onSignOut();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FF6B8B] text-black dark:text-rose-300 dark:hover:text-black font-black flex items-center gap-2.5 transition-colors cursor-pointer"
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
              /* Signed-out buttons: Sign In & Neo-Brutalist "Shop treats" / "Book a slot" CTA */
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-black text-black dark:text-slate-200 hover:text-black hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors whitespace-nowrap cursor-pointer"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('book')}
                  className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black text-black bg-[#FFCC24] hover:bg-[#F5C21B] border-2 border-black rounded-full shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                >
                  <Heart className="w-4 h-4 fill-black text-black" />
                  <span>Book a slot</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-black dark:text-white bg-white dark:bg-[#182032] border-2 border-black rounded-xl shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Menu className="w-5 h-5 stroke-[3]" />}
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
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-[#FAF7EE] dark:bg-[#0E131F] border-b-2 border-black px-4 pt-2 pb-6 space-y-3 overflow-hidden"
            >
              <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
                {navItems.map((item) => {
                  const isActive = currentTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => handleTabClick(item.tab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-black transition-all cursor-pointer border-2 border-black ${
                        isActive
                          ? 'bg-[#FFCC24] text-black shadow-neo-sm'
                          : 'bg-white dark:bg-[#182032] text-black dark:text-slate-200'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 border-t-2 border-black flex items-center justify-between">
                <span className="text-xs font-black text-black dark:text-white">
                  24/7 Outpatient & Emergency: (800) 555-0199
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleTabClick('book');
                  }}
                  className="px-4 py-2 bg-[#FFCC24] border-2 border-black rounded-full font-black text-xs shadow-neo-sm text-black"
                >
                  Book now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
