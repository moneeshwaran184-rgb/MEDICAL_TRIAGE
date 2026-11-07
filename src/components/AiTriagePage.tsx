import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TriageInput, TriageAssessment, DepartmentId } from '../types/index.ts';
import { triageService } from '../services/triageService.ts';
import {
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  FileQuestion,
  User,
  HeartPulse,
  Activity,
  PhoneCall,
  RefreshCw,
  HelpCircle,
  Heart,
  Check,
} from 'lucide-react';

interface AiTriagePageProps {
  onRouteToBooking: (departmentId: DepartmentId, reasonSummary: string) => void;
}

export const AiTriagePage: React.FC<AiTriagePageProps> = ({ onRouteToBooking }) => {
  // Wizard steps: 1 (Chief complaint & demographics) -> 2 (Duration & severity) -> 3 (Associated symptoms & history)
  const [triageStep, setTriageStep] = useState<number>(1);

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number | ''>(34);
  const [gender, setGender] = useState('female');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [duration, setDuration] = useState('2-3 days');
  const [severity, setSeverity] = useState(4);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);

  const [assessment, setAssessment] = useState<TriageAssessment | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const commonSymptoms = [
    'Fever or chills',
    'Mild shortness of breath',
    'Chest tightness / pressure',
    'Dizziness or lightheadedness',
    'Persistent headache',
    'Joint or muscular pain',
    'Nausea or abdominal pain',
    'Skin rash or itching',
    'Fatigue or generalized weakness',
    'Cough or sore throat',
    'Sudden numbness or tingling',
    'Swelling in extremities',
  ];

  const commonHistory = [
    'Hypertension (High blood pressure)',
    'Type 2 Diabetes',
    'Asthma or respiratory condition',
    'Previous cardiac history',
    'Known medication allergies',
    'No significant chronic history',
  ];

  const handleToggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleToggleHistory = (item: string) => {
    setSelectedHistory((prev) =>
      prev.includes(item) ? prev.filter((h) => h !== item) : [...prev, item]
    );
  };

  const handleQuickPreset = (preset: {
    complaint: string;
    dur: string;
    sev: number;
    symps: string[];
  }) => {
    setChiefComplaint(preset.complaint);
    setDuration(preset.dur);
    setSeverity(preset.sev);
    setSelectedSymptoms(preset.symps);
  };

  const handleNextStep = () => {
    setErrorMsg('');
    if (triageStep === 1) {
      if (!chiefComplaint.trim()) {
        setErrorMsg('Please describe your chief symptom or reason for evaluation.');
        return;
      }
      setTriageStep(2);
    } else if (triageStep === 2) {
      setTriageStep(3);
    }
  };

  const handlePreviousStep = () => {
    setErrorMsg('');
    if (triageStep > 1) {
      setTriageStep(triageStep - 1);
    }
  };

  const handleRunEvaluation = () => {
    setErrorMsg('');
    setIsEvaluating(true);

    const input: TriageInput = {
      patientName: patientName.trim() || undefined,
      patientAge: typeof age === 'number' ? age : undefined,
      gender,
      chiefComplaint: chiefComplaint.trim(),
      symptomDuration: duration,
      severityScale: severity,
      associatedSymptoms: selectedSymptoms,
      medicalHistory: selectedHistory,
    };

    setTimeout(() => {
      const result = triageService.assessSymptoms(input);
      setAssessment(result);
      setIsEvaluating(false);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }, 500);
  };

  const handleReset = () => {
    setAssessment(null);
    setTriageStep(1);
    setChiefComplaint('');
    setSelectedSymptoms([]);
    setSeverity(4);
    setErrorMsg('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Title & Safety Notice */}
      <div className="pb-8 border-b-2 border-black dark:border-white/20 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFCC24] text-black text-xs font-black border-2 border-black shadow-neo-sm">
          <Sparkles className="w-4 h-4 fill-black text-black" />
          <span>Aether AI Clinical Triage</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-black dark:text-white tracking-tight">
          AI-Assisted Patient Triage
        </h1>

        <p className="text-black/70 dark:text-slate-400 font-bold text-sm sm:text-base max-w-2xl leading-relaxed">
          Answer a few quick questions regarding what hurts or how long you&apos;ve felt unwell to get matched directly with the right medical department.
        </p>

        {/* Safety Notice */}
        <div className="p-4 rounded-2xl bg-[#FFCC24] text-black border-2 border-black text-xs font-black flex items-start gap-3 shadow-neo-sm mt-3">
          <AlertTriangle className="w-5 h-5 shrink-0 stroke-[2.5]" />
          <p className="leading-relaxed font-bold">
            <strong>Emergency Directive:</strong> AI Triage is an assistive pre-consultation tool and does <strong>not</strong> substitute for emergency response. In urgent crises (chest crushing pain, stroke symptoms, uncontrolled bleeding), call 999 or go directly to A&amp;E.
          </p>
        </div>
      </div>

      {assessment ? (
        /* ASSESSMENT RESULTS */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-6"
        >
          {assessment.isEmergency ? (
            /* CRITICAL EMERGENCY RED BANNER */
            <div className="p-8 rounded-3xl bg-[#FF6B8B] text-black border-2 border-black shadow-neo-xl space-y-5">
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-8 h-8 stroke-[2.5]" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    CRITICAL TRIAGE ALERT
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black">
                    Immediate Emergency Care Required
                  </h2>
                </div>
              </div>

              <p className="text-sm font-bold leading-relaxed max-w-xl">
                {assessment.summary} Routine outpatient booking is <strong>not safe</strong> for acute presentations of this nature.
              </p>

              <div className="p-4 bg-white rounded-2xl border-2 border-black space-y-2 text-xs font-bold">
                <span className="font-black uppercase tracking-wider block">Emergency Instructions:</span>
                <ul className="list-disc list-inside space-y-1">
                  {assessment.nextSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="tel:999"
                  className="px-6 py-3.5 bg-black text-white font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Emergency Services (999)</span>
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-3.5 bg-white text-black font-black rounded-full border-2 border-black text-sm hover:bg-[#FAF7EE] shadow-neo-sm cursor-pointer"
                >
                  Start New Evaluation
                </button>
              </div>
            </div>
          ) : (
            /* NON-EMERGENCY ACUITY CARD */
            <div className="bg-white dark:bg-[#182032] rounded-3xl p-6 sm:p-10 border-2 border-black shadow-neo space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-black/10 dark:border-white/10">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-black uppercase text-[#2154FE] dark:text-[#FFCC24]">
                    ASSESSMENT REPORT · SEVERITY {assessment.severityScore}/10
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                    Recommended Clinical Pathway
                  </h2>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide inline-flex items-center gap-1.5 border-2 border-black shadow-neo-sm ${
                    assessment.urgency === 'urgent'
                      ? 'bg-[#FF6B8B] text-black'
                      : assessment.urgency === 'routine'
                      ? 'bg-[#FFCC24] text-black'
                      : 'bg-[#00D09C] text-black'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>{assessment.urgencyLabel}</span>
                </span>
              </div>

              {/* Department Recommendation Card (Vibrant Sunshine Yellow) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC24] border-2 border-black text-black shadow-neo grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider block opacity-75">
                    Matched Clinic Specialty
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black">
                    Department of {assessment.recommendedDepartmentName}
                  </h3>
                  <p className="text-sm font-bold opacity-90 leading-relaxed">
                    {assessment.summary}
                  </p>
                </div>

                <div className="md:col-span-4 flex flex-col items-start md:items-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onRouteToBooking(
                        assessment.recommendedDepartmentId,
                        `AI Triage assessment: ${chiefComplaint} (Rated ${severity}/10)`
                      )
                    }
                    className="w-full sm:w-auto px-6 py-4 bg-[#2154FE] hover:bg-[#1946DF] text-white font-black rounded-full text-xs sm:text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book in {assessment.recommendedDepartmentName}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                  <span className="text-[10px] font-black opacity-75">
                    Pre-selects clinic & notes
                  </span>
                </div>
              </div>

              {/* Clinical Notes & Preparation Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black space-y-3">
                  <h4 className="text-sm font-black text-black dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#2154FE]" />
                    <span>Clinical Intake Observations</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-bold text-black/80 dark:text-slate-300">
                    {assessment.clinicalObservations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2154FE] mt-1 shrink-0" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black space-y-3">
                  <h4 className="text-sm font-black text-black dark:text-white flex items-center gap-2">
                    <FileQuestion className="w-4 h-4 text-[#00D09C]" />
                    <span>Preparation for Doctor</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-bold text-black/80 dark:text-slate-300">
                    {assessment.preparationQuestions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00D09C] mt-1 shrink-0" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reset */}
              <div className="pt-4 border-t-2 border-black/10 dark:border-white/10 flex justify-between items-center text-xs font-bold text-black/60 dark:text-slate-400">
                <span>Assessment simulated in demo engine.</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-black dark:text-white font-black hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start New Assessment</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* WIZARD FORM */
        <div className="mt-8 space-y-6">
          {/* Quick Presets */}
          <div className="p-5 bg-white dark:bg-[#182032] rounded-3xl border-2 border-black shadow-neo space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white block">
              Quick Test Cases (Click to populate demo clinical presentation):
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset({
                    complaint: 'Heart palpitations with fluttering feeling while walking up stairs',
                    dur: '1-2 weeks',
                    sev: 5,
                    symps: ['Mild shortness of breath', 'Dizziness or lightheadedness'],
                  })
                }
                className="px-3.5 py-2 bg-[#FFCC24] text-black border-2 border-black rounded-full text-xs font-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                Cardiology Case (Palpitations)
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset({
                    complaint: 'Severe throbbing migraine with aura and photophobia',
                    dur: '2-3 days',
                    sev: 7,
                    symps: ['Persistent headache', 'Dizziness or lightheadedness', 'Nausea or abdominal pain'],
                  })
                }
                className="px-3.5 py-2 bg-[#FF6B8B] text-black border-2 border-black rounded-full text-xs font-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                Neurology Case (Migraine)
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset({
                    complaint: 'Crushing central chest pain with left arm tightness and dyspnea',
                    dur: 'Less than 24 hours',
                    sev: 9,
                    symps: ['Chest tightness / pressure', 'Mild shortness of breath'],
                  })
                }
                className="px-3.5 py-2 bg-rose-200 text-black border-2 border-black rounded-full text-xs font-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                Emergency Red Flag Case
              </button>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div className="flex items-center justify-between text-xs font-black text-black dark:text-slate-300 pb-1">
            <span>Wizard Step {triageStep} of 3</span>
            <span className="text-[#2154FE] dark:text-[#FFCC24]">
              {triageStep === 1
                ? 'Chief Symptom & Profile'
                : triageStep === 2
                ? 'Duration & Pain Scale'
                : 'Associated Symptoms & History'}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black overflow-hidden p-0.5">
            <div
              className="h-full bg-[#FFCC24] rounded-full transition-all duration-300"
              style={{ width: `${(triageStep / 3) * 100}%` }}
            />
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-[#FF6B8B] text-black border-2 border-black shadow-neo-sm text-xs font-black flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 stroke-[2.5]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: CHIEF COMPLAINT */}
          {triageStep === 1 && (
            <div className="bg-white dark:bg-[#182032] rounded-3xl p-6 sm:p-8 border-2 border-black shadow-neo space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#2154FE] dark:text-[#FFCC24]">
                  Question 1
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white">
                  What primary symptom or concern brings you in today?
                </h3>
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Example: Frequent palpitations and fluttering sensations in my chest after light exertion..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full p-4 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-2xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label htmlFor="tr-name" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    id="tr-name"
                    type="text"
                    placeholder="Patient"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-xs font-bold text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="tr-age" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-1">
                    Patient Age
                  </label>
                  <input
                    id="tr-age"
                    type="number"
                    min="0"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-xs font-bold text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="tr-gender" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-1">
                    Biological Sex
                  </label>
                  <select
                    id="tr-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-xs font-bold text-black dark:text-white focus:outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-[#2154FE] hover:bg-[#1946DF] text-white font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Severity</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DURATION & SEVERITY */}
          {triageStep === 2 && (
            <div className="bg-white dark:bg-[#182032] rounded-3xl p-6 sm:p-8 border-2 border-black shadow-neo space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#2154FE] dark:text-[#FFCC24]">
                  Question 2
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white">
                  How long have these symptoms persisted, and how severe is the pain?
                </h3>
              </div>

              <div>
                <label className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-2">
                  Symptom Duration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['Less than 24 hours', '2-3 days', '1-2 weeks', 'More than 2 weeks'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`p-3 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
                        duration === d
                          ? 'bg-[#FFCC24] text-black shadow-neo translate-y-[-1px]'
                          : 'bg-[#FAF7EE] dark:bg-[#0E131F] text-black dark:text-slate-300 hover:bg-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="pain-scale" className="text-xs font-black text-black dark:text-slate-300 uppercase">
                    Discomfort / Pain Level: {severity}/10
                  </label>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full border border-black ${
                      severity <= 3
                        ? 'bg-[#00D09C] text-black'
                        : severity <= 6
                        ? 'bg-[#FFCC24] text-black'
                        : 'bg-[#FF6B8B] text-black'
                    }`}
                  >
                    {severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Severe'}
                  </span>
                </div>
                <input
                  id="pain-scale"
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-[#2154FE] cursor-pointer"
                />
              </div>

              <div className="pt-4 flex justify-between items-center border-t-2 border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="px-5 py-2.5 text-xs font-black text-black dark:text-slate-300 hover:text-black flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[3]" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-[#2154FE] hover:bg-[#1946DF] text-white font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Associated Signs</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SYMPTOMS & HISTORY */}
          {triageStep === 3 && (
            <div className="bg-white dark:bg-[#182032] rounded-3xl p-6 sm:p-8 border-2 border-black shadow-neo space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#2154FE] dark:text-[#FFCC24]">
                  Question 3
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white">
                  Select any accompanying symptoms or clinical history
                </h3>
              </div>

              <div>
                <label className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-2">
                  Associated Signs (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((sym) => {
                    const isChecked = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => handleToggleSymptom(sym)}
                        className={`px-3.5 py-2 rounded-full text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-[#FFCC24] text-black shadow-neo-sm translate-y-[-1px]'
                            : 'bg-[#FAF7EE] dark:bg-[#0E131F] text-black dark:text-slate-300 hover:bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{sym}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-2">
                  Known Medical Background
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonHistory.map((hist) => {
                    const isChecked = selectedHistory.includes(hist);
                    return (
                      <button
                        key={hist}
                        type="button"
                        onClick={() => handleToggleHistory(hist)}
                        className={`px-3.5 py-2 rounded-full text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-[#00D09C] text-black shadow-neo-sm translate-y-[-1px]'
                            : 'bg-[#FAF7EE] dark:bg-[#0E131F] text-black dark:text-slate-300 hover:bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{hist}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t-2 border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="px-5 py-2.5 text-xs font-black text-black dark:text-slate-300 hover:text-black flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[3]" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={handleRunEvaluation}
                  className="px-8 py-3.5 bg-[#FFCC24] hover:bg-[#F5C21B] text-black font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>{isEvaluating ? 'Evaluating Presentation…' : 'Generate Clinical Triage Report'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
