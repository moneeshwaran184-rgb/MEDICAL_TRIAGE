import React, { useState, useEffect } from 'react';
import { PageTab, DepartmentId, UserProfile, AuthModalMode } from './types/index.ts';
import { authService } from './services/authService.ts';
import { Navigation } from './components/Navigation.tsx';
import { HomePage } from './components/HomePage.tsx';
import { BookAppointmentPage } from './components/BookAppointmentPage.tsx';
import { AvailableSlotsPage } from './components/AvailableSlotsPage.tsx';
import { AiTriagePage } from './components/AiTriagePage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { UserAccountModal } from './components/UserAccountModal.tsx';
import { DoctorPortalPage } from './components/DoctorPortalPage.tsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState<PageTab>('home');
  const [bookingDepartmentId, setBookingDepartmentId] = useState<DepartmentId | undefined>(undefined);
  const [bookingDate, setBookingDate] = useState<string | undefined>(undefined);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    authService.getCurrentUser()
  );
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>(null);

  // User Profile / Appointments Modal State
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountModalSubTab, setAccountModalSubTab] = useState<'profile' | 'appointments' | 'settings'>('appointments');

  // Dark Mode Theme State with LocalStorage Persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('aether_aurora_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aether_aurora_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aether_aurora_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Synchronize auth state changes across window events
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('aether_auth_updated', handleAuthChange);
    return () => window.removeEventListener('aether_auth_updated', handleAuthChange);
  }, []);

  // Restore the Supabase session (or demo cache) on load and listen for changes
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    authService
      .init((user) => {
        if (cancelled) return;
        setCurrentUser(user);
        if (user?.role === 'doctor') setCurrentTab('doctor');
      })
      .then((cleanup) => {
        if (cancelled) cleanup();
        else unsubscribe = cleanup;
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const handleSelectTab = (tab: PageTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookDepartment = (deptId: DepartmentId, date?: string) => {
    setBookingDepartmentId(deptId);
    if (date) setBookingDate(date);
    setCurrentTab('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriageRouteToBooking = (deptId: DepartmentId) => {
    setBookingDepartmentId(deptId);
    setCurrentTab('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setAuthModalMode(null);
    if (user.role === 'doctor') {
      setCurrentTab('doctor');
      setAccountModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setAccountModalOpen(false);
    if (currentTab === 'doctor') setCurrentTab('home');
  };

  const handleOpenAccountModal = (tab: 'profile' | 'appointments' | 'settings') => {
    setAccountModalSubTab(tab);
    setAccountModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-aurora-mesh text-[#171A3B] dark:text-slate-100 flex flex-col font-sans selection:bg-[#5145FF] selection:text-white transition-colors duration-300 relative">
      {/* Ambient Dynamic Colorful Lighting Elements (Fixed in Background) */}
      <div className="fixed inset-0 pointer-events-none -z-0 overflow-hidden" aria-hidden="true">
        {/* Subtle dot matrix grid for surgical high-tech precision */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(81,69,255,0.07)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(22,203,229,0.09)_1px,transparent_1px)] [background-size:28px_28px] opacity-80" />

        {/* Orb 1: Violet/Indigo upper-left glow */}
        <div className="absolute -top-24 -left-20 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#5145FF]/30 via-[#8957FF]/25 to-transparent blur-[120px] dark:from-[#5145FF]/40 dark:via-[#8957FF]/35 animate-aurora-pulse-slow" />

        {/* Orb 2: Tropical Cyan & Fresh Teal upper-right glow */}
        <div className="absolute top-1/4 -right-24 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[#16CBE5]/25 via-[#00CFA8]/20 to-transparent blur-[130px] dark:from-[#16CBE5]/35 dark:via-[#00CFA8]/30 animate-aurora-pulse-alt" />

        {/* Orb 3: Fuchsia center accent */}
        <div className="absolute top-1/2 left-1/3 w-[450px] h-[450px] rounded-full bg-[#E34AD7]/15 dark:bg-[#E34AD7]/22 blur-[140px] animate-aurora-pulse-slow" />

        {/* Orb 4: Sunset Coral & Tangerine lower-left glow */}
        <div className="absolute bottom-20 -left-20 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-[#FF745C]/20 via-[#FF9B54]/18 to-transparent blur-[120px] dark:from-[#FF745C]/25 dark:via-[#FF9B54]/22 animate-aurora-pulse-alt" />

        {/* Orb 5: Sunshine Yellow / Mint bottom-right glow */}
        <div className="absolute -bottom-20 right-10 w-[480px] h-[480px] rounded-full bg-gradient-to-tl from-[#FFC857]/20 via-[#B9F4D0]/25 to-transparent blur-[120px] dark:from-[#FFC857]/20 dark:via-[#B9F4D0]/18 animate-aurora-pulse-slow" />
      </div>

      {/* Aurora Care Top Navigation with Dark Mode & Auth Controls */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        onOpenAccountModal={handleOpenAccountModal}
        onSignOut={handleSignOut}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Landmark */}
      <main id="main-content" className="flex-1 w-full">
        {currentTab === 'home' && (
          <HomePage
            onSelectTab={handleSelectTab}
            onBookDepartment={handleBookDepartment}
          />
        )}

        {currentTab === 'book' && (
          <BookAppointmentPage
            initialDepartmentId={bookingDepartmentId}
            initialDate={bookingDate}
            currentUser={currentUser}
            onNavigateToSlots={() => handleSelectTab('slots')}
            onSelectTab={handleSelectTab}
            onRequireAuth={() => setAuthModalMode('signin')}
          />
        )}

        {currentTab === 'slots' && (
          <AvailableSlotsPage
            onBookDepartment={handleBookDepartment}
          />
        )}

        {currentTab === 'triage' && (
          <AiTriagePage
            onRouteToBooking={handleTriageRouteToBooking}
          />
        )}

        {currentTab === 'doctor' && (
          <DoctorPortalPage
            currentUser={currentUser}
            onAuthSuccess={handleAuthSuccess}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Authentication Dialog (Sign In / Create Account with Smooth Transitions) */}
      <AuthModal
        mode={authModalMode}
        onClose={() => setAuthModalMode(null)}
        onSuccess={handleAuthSuccess}
        onSwitchMode={(newMode) => setAuthModalMode(newMode)}
      />

      {/* Signed-in Patient Profile & My Appointments Modal */}
      {currentUser && currentUser.role === 'patient' && (
        <UserAccountModal
          isOpen={accountModalOpen}
          initialTab={accountModalSubTab}
          user={currentUser}
          onClose={() => setAccountModalOpen(false)}
          onSignOut={handleSignOut}
          onNavigateToBooking={() => handleSelectTab('book')}
        />
      )}
    </div>
  );
}
