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
          className="relative w-full max-w-lg bg-white dark:bg-[#151838] rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden z-10 my-8"
        >
          {/* Decorative Aurora Top Bar Gradient */}
          <div className="h-2 w-full bg-gradient-to-r from-[#5145FF] via-[#E34AD7] via-[#16CBE5] to-[#FF745C]" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus-visible:outline-2"
            aria-label="Close authentication dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Lockup */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0E8FF] dark:bg-[#5145FF]/20 text-[#5145FF] dark:text-[#A594FD] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#8957FF]" />
                <span>Aurora Care Patient Portal</span>
              </div>

              <h2 id="auth-modal-title" className="text-2xl sm:text-3xl font-extrabold text-[#171A3B] dark:text-white">
                {mode === 'signin' ? 'Welcome back' : 'Create your patient account'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
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
                className="p-3.5 rounded-2xl bg-[#B9F4D0]/50 dark:bg-[#00CFA8]/15 border border-[#00CFA8]/40 text-[#065f46] dark:text-[#B9F4D0] text-xs flex items-center gap-2.5 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{infoMsg}</span>
              </motion.div>
            )}

            {/* Error banner */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* TAB SELECTOR / SWITCHER */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#FFFDF8] dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => onSwitchMode('signin')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-[#1E234F] text-[#5145FF] dark:text-[#A594FD] shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode('signup')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
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
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signin-id"
                      type="text"
                      placeholder="patient@example.com or 98765 43210"
                      value={signInIdentifier}
                      onChange={(e) => setSignInIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus:ring-2 focus:ring-[#5145FF]/20 focus-visible:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="signin-password"
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
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
                      className="text-xs text-[#5145FF] dark:text-[#A594FD] hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus:ring-2 focus:ring-[#5145FF]/20 focus-visible:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#5145FF] accent-[#5145FF]"
                    />
                    <span>Remember my session</span>
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {isSupabaseConfigured ? 'Secure Session' : 'Demo Environment'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#5145FF] to-[#8957FF] hover:from-[#4338ca] hover:to-[#7c3aed] text-white font-bold rounded-2xl text-sm shadow-aurora-indigo transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isLoading ? 'Verifying Session...' : 'Sign In to Portal'}
                  <ArrowRight className="w-4 h-4" />
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
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-name"
                      type="text"
                      required
                      placeholder="Aarav Patel"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus:ring-2 focus:ring-[#5145FF]/20 focus-visible:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-email"
                      type="email"
                      required
                      placeholder="aarav@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus:ring-2 focus:ring-[#5145FF]/20 focus-visible:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-phone"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
                  >
                    Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-24 px-2 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-xs font-semibold text-[#171A3B] dark:text-white focus:border-[#5145FF] focus-visible:outline-none"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-phone"
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus:ring-2 focus:ring-[#5145FF]/20 focus-visible:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="signup-age"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Age *
                    </label>
                    <div className="relative">
                      <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-age"
                        type="number"
                        required
                        min={1}
                        max={120}
                        placeholder="e.g. 34"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus-visible:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-gender"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Gender *
                    </label>
                    <div className="relative">
                      <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        id="signup-gender"
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus-visible:outline-none transition-all appearance-none"
                      >
                        <option value="">Select gender</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="signup-pwd"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Create Password *
                    </label>
                    <div className="relative">
                      <input
                        id="signup-pwd"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 chars"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus-visible:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirm-pwd"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id="signup-confirm-pwd"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus-visible:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="p-1 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-[#5145FF] accent-[#5145FF] mt-0.5"
                    />
                    <span>
                      I agree to the Terms of Care & Privacy Policy and consent to appointment notifications on my mobile number.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#5145FF] via-[#8957FF] to-[#E34AD7] hover:opacity-95 text-white font-bold rounded-2xl text-sm shadow-aurora-indigo transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isLoading ? 'Setting Up Account...' : 'Complete Registration'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {/* DIVIDER & QUICK EXPLORE DEMO BUTTON */}
            <div className="relative py-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#151838] text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Or Instant Preview
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#F0E8FF] via-[#FFFDF8] to-[#B9F4D0] dark:from-[#231B4D] dark:via-[#161B3D] dark:to-[#12362C] border border-[#8957FF]/30 hover:border-[#5145FF] text-[#5145FF] dark:text-[#A594FD] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 hover:shadow-xs active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-[#E34AD7]" />
              <span>Explore Demo Account (1-Click)</span>
            </button>

            {/* Privacy notice footer */}
            <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              {isSupabaseConfigured
                ? 'Your password is hashed by Supabase Auth. Your profile and appointments are protected by row-level security.'
                : 'Local demo mode is active. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect the real backend.'}
            </div>

            <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              Doctors: use the <strong className="text-[#5145FF] dark:text-[#A594FD]">Doctor Portal</strong> in the top
              navigation to sign in to your dashboard.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
