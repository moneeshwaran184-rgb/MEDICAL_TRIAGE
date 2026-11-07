import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModalMode, UserProfile } from '../types/index.ts';
import { authService } from '../services/authService.ts';
import { isSupabaseConfigured } from '../lib/supabase.ts';
import {
  X,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  CalendarDays,
  UserCheck,
} from 'lucide-react';

interface AuthModalProps {
  mode: AuthModalMode;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onSwitchMode: (newMode: 'signin' | 'signup') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  onClose,
  onSuccess,
  onSwitchMode,
}) => {
  // Sign In fields
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset errors when mode changes
  useEffect(() => {
    setErrorMsg('');
    setInfoMsg('');
  }, [mode]);

  if (!mode) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!signInIdentifier.trim()) {
      setErrorMsg('Please enter your email or registered phone number.');
      return;
    }
    if (!signInPassword) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.signIn(signInIdentifier, signInPassword, rememberMe);
      if (result.user) {
        onSuccess(result.user);
      } else {
        setErrorMsg(result.error || 'Unable to sign in. Please try again.');
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      setErrorMsg('Please enter a valid mobile number for appointment notifications.');
      return;
    }
    const numericAge = Number(age);
    if (!age || Number.isNaN(numericAge) || numericAge < 1 || numericAge > 120) {
      setErrorMsg('Please enter a valid age between 1 and 120.');
      return;
    }
    if (!gender) {
      setErrorMsg('Please select your gender.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (signUpPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('Please accept the Terms of Care & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.signUpPatient({
        fullName,
        email: signUpEmail,
        password: signUpPassword,
        countryCode,
        phone,
        age: numericAge,
        gender,
      });

      if (result.user) {
        onSuccess(result.user);
      } else if (result.needsEmailConfirmation) {
        setInfoMsg(
          'Account created. Check your email inbox to confirm your address, then sign in with your new password.'
        );
      } else {
        setErrorMsg(result.error || 'Unable to create your account. Please try again.');
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to create your account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAccess = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(true);
    try {
      const result = await authService.signInQuickDemo();
      if (result.user) {
        onSuccess(result.user);
      } else {
        setErrorMsg(result.error || 'Demo account is unavailable. Please create an account.');
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Demo account is unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#171A3B]/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#182032] rounded-3xl shadow-neo-xl border-[2.5px] border-black overflow-hidden z-10 my-8"
        >
          {/* Decorative Sunshine Yellow Top Bar */}
          <div className="h-3 w-full bg-[#FFCC24] border-b-2 border-black" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-black dark:text-white bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
            aria-label="Close authentication dialog"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Lockup */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFCC24] text-black text-xs font-black border-2 border-black shadow-neo-sm">
                <Sparkles className="w-3.5 h-3.5 fill-black text-black" />
                <span>Aether Care Patient Portal</span>
              </div>

              <h2 id="auth-modal-title" className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                {mode === 'signin' ? 'Welcome back' : 'Create patient account'}
              </h2>

              <p className="text-xs sm:text-sm text-black/70 dark:text-slate-400 font-bold">
                {mode === 'signin'
                  ? 'Sign in with your email or registered mobile number. Doctors sign in here too.'
                  : 'Create your patient account with your own password, mobile number, age and gender.'}
              </p>
            </div>

            {/* Info banner */}
            {infoMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                role="status"
                className="p-3.5 rounded-2xl bg-[#00D09C] text-black border-2 border-black shadow-neo-sm text-xs flex items-center gap-2.5 font-black"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>{infoMsg}</span>
              </motion.div>
            )}

            {/* Error banner */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="p-3.5 rounded-2xl bg-[#FF6B8B] text-black border-2 border-black shadow-neo-sm text-xs flex items-center gap-2.5 font-black"
              >
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* TAB SELECTOR / SWITCHER */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black gap-1.5">
              <button
                type="button"
                onClick={() => onSwitchMode('signin')}
                className={`py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer ${mode === 'signin'
                    ? 'bg-[#FFCC24] text-black border-2 border-black shadow-neo-sm translate-y-[-1px]'
                    : 'text-black dark:text-slate-400 hover:text-black'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode('signup')}
                className={`py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer ${mode === 'signup'
                    ? 'bg-[#FFCC24] text-black border-2 border-black shadow-neo-sm translate-y-[-1px]'
                    : 'text-black dark:text-slate-400 hover:text-black'
                  }`}
              >
                Create Account
              </button>
            </div>

            {/* 1. SIGN IN FORM */}
            {mode === 'signin' && (
              <motion.form
                key="signin-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignInSubmit}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="signin-id"
                    className="block text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-black/60 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signin-id"
                      type="text"
                      placeholder="patient@example.com or 07123 456789"
                      value={signInIdentifier}
                      onChange={(e) => setSignInIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="signin-password"
                      className="text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setErrorMsg(
                          isSupabaseConfigured
                            ? 'Password reset is handled by Supabase Auth. Ask the clinic administrator to send a reset link for now.'
                            : 'Demo mode: In production, password reset instructions are dispatched via SMS/email.'
                        )
                      }
                      className="text-xs text-[#2154FE] dark:text-[#FFCC24] hover:underline font-black"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-black/60 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-black/60 dark:text-slate-400"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-black/80 dark:text-slate-400 pt-1 font-bold">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-black accent-[#2154FE] border-2 border-black"
                    />
                    <span>Remember my session</span>
                  </label>
                  <span className="text-[11px] font-black">
                    {isSupabaseConfigured ? 'Secure Session' : 'Demo Environment'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-4 bg-[#FFCC24] hover:bg-[#F5C21B] text-black font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? 'Verifying Session...' : 'Sign In to Portal'}
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </motion.form>
            )}

            {/* 2. CREATE ACCOUNT FORM */}
            {mode === 'signup' && (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignUpSubmit}
                className="space-y-3.5"
              >
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider mb-1"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-black/60 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-name"
                      type="text"
                      required
                      placeholder="Aarav Patel"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider mb-1"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-black/60 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-email"
                      type="email"
                      required
                      placeholder="aarav@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-phone"
                    className="block text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider mb-1"
                  >
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-black/60 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-phone"
                      type="tel"
                      required
                      placeholder="07123 456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="signup-age"
                      className="block text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Age *
                    </label>
                    <input
                      id="signup-age"
                      type="number"
                      required
                      min="1"
                      max="120"
                      placeholder="32"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="signup-gender"
                      className="block text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Gender *
                    </label>
                    <select
                      id="signup-gender"
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 chars"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 absolute right-2 top-1/2 -translate-y-1/2 text-black/60 dark:text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirm-pwd"
                      className="block text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id="signup-confirm-pwd"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="p-1 absolute right-2 top-1/2 -translate-y-1/2 text-black/60 dark:text-slate-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs font-bold text-black/80 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-black accent-[#2154FE] border-2 border-black mt-0.5"
                    />
                    <span>
                      I agree to the Terms of Care & Privacy Policy and consent to appointment SMS notifications.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-4 bg-[#FFCC24] hover:bg-[#F5C21B] text-black font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? 'Setting Up Account...' : 'Complete Registration'}
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                </button>
              </motion.form>
            )}

            {/* DIVIDER & QUICK EXPLORE DEMO BUTTON */}
            <div className="relative py-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black/10 dark:border-white/10" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#182032] text-[11px] font-black uppercase tracking-wider text-black/60 dark:text-slate-400">
                Or Instant Preview
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="w-full py-3.5 px-4 rounded-full bg-[#FAF7EE] hover:bg-white text-black font-black text-xs sm:text-sm border-2 border-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-black text-black" />
              <span>Explore Demo Account (1-Click)</span>
            </button>
            {/* Privacy notice footer */}
            <div className="text-[11px] text-black/60 dark:text-slate-400 text-center font-bold leading-relaxed">
              {isSupabaseConfigured
                ? 'Your password is encrypted. Your profile and appointments are protected.'
                : 'Local demo mode is active. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect live backend.'}
            </div>

            <div className="text-[11px] text-black/60 dark:text-slate-400 text-center font-bold leading-relaxed">
              Doctors: use the <strong className="text-[#2154FE] dark:text-[#FFCC24]">Doctor Portal</strong> in the top
              navigation to sign in to your dashboard.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
