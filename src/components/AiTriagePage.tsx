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

  const handleRunAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);

    setTimeout(() => {
      const input: TriageInput = {
        patientName: patientName || 'Patient',
        age: Number(age) || 35,
        gender,
        chiefComplaint,
        duration,
        severity,
        symptoms: selectedSymptoms,
        medicalHistory: selectedHistory,
      };

      const result = triageService.assessSymptoms(input);
      setAssessment(result);
      setIsEvaluating(false);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }, 600);
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
      <div className="pb-8 border-b border-slate-200 dark:border-white/10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0E8FF] dark:bg-[#8957FF]/20 text-[#5145FF] dark:text-[#16CBE5] text-xs font-black tracking-wide">
          <Sparkles className="w-4 h-4 text-[#8957FF] dark:text-[#16CBE5]" />
          <span>Aurora Care · Clinical Triage Wizard</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#171A3B] dark:text-white">
          AI-Assisted Patient Triage
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl leading-relaxed">
          Answer a few clinical questions regarding your current symptoms to receive an intelligent acuity evaluation and recommended hospital clinic.
        </p>

        {/* Safety Notice */}
        <div className="p-4 rounded-2xl bg-[#FF745C]/15 dark:bg-[#FF745C]/20 border border-[#FF745C]/30 text-[#9f1239] dark:text-[#FF9B54] text-xs flex items-start gap-3 mt-3">
          <AlertTriangle className="w-5 h-5 text-[#FF745C] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Emergency Care Directive:</strong> AI Triage is an assistive pre-consultation tool and does <strong>not</strong> substitute for certified physician care. If you are experiencing severe chest pain, sudden numbness, or acute shortness of breath, call 911 or visit the nearest emergency room immediately.
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
            <div className="p-8 rounded-3xl bg-rose-600 text-white shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-8 h-8 text-rose-200" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-rose-200 block">
                    CRITICAL TRIAGE ALERT
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black">
                    Immediate Emergency Care Required
                  </h2>
                </div>
              </div>

              <p className="text-sm text-rose-100 leading-relaxed max-w-xl">
                {assessment.summary} Routine outpatient booking is <strong>not safe</strong> for acute presentations of this nature.
              </p>

              <div className="p-4 bg-rose-700/80 rounded-2xl space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider block">Emergency Instructions:</span>
                <ul className="list-disc list-inside space-y-1 text-rose-100">
                  {assessment.nextSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="tel:911"
                  className="px-6 py-3.5 bg-white text-rose-700 font-extrabold rounded-xl text-sm shadow-md hover:bg-rose-50 flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Emergency Services (911)</span>
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-3.5 bg-rose-700 text-white font-bold rounded-xl text-sm hover:bg-rose-800 cursor-pointer"
                >
                  Start New Evaluation
                </button>
              </div>
            </div>
          ) : (
            /* NON-EMERGENCY ACUITY CARD */
            <div className="bg-white/95 dark:bg-[#151838]/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-white/10 shadow-aurora-card space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold uppercase text-[#5145FF] dark:text-[#16CBE5]">
                    ASSESSMENT REPORT · SEVERITY {assessment.severityScore}/10
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#171A3B] dark:text-white">
                    Recommended Clinical Pathway
                  </h2>
                </div>

                <span
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wide inline-flex items-center gap-1.5 ${
                    assessment.urgency === 'urgent'
                      ? 'bg-[#FF9B54]/20 text-[#9a3412] dark:text-[#FFC857] border border-[#FF9B54]/40'
                      : assessment.urgency === 'routine'
                      ? 'bg-[#F0E8FF] dark:bg-[#8957FF]/20 text-[#5145FF] dark:text-[#16CBE5] border border-[#8957FF]/30'
                      : 'bg-[#B9F4D0] dark:bg-[#00CFA8]/20 text-[#065f46] dark:text-[#B9F4D0] border border-[#00CFA8]/40'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{assessment.urgencyLabel}</span>
                </span>
              </div>

              {/* Department Recommendation Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#F0E8FF] via-white to-[#B9F4D0]/30 dark:from-[#211F4E] dark:via-[#151838] dark:to-[#0c3140] border border-[#8957FF]/20 dark:border-white/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5]">
                    Matched Specialty Clinic
                  </span>
                  <h3 className="text-2xl font-black text-[#171A3B] dark:text-white">
                    Department of {assessment.recommendedDepartmentName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
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
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-aurora-indigo hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book in {assessment.recommendedDepartmentName}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                    Pre-selects clinic & consultation notes
                  </span>
                </div>
              </div>

              {/* Clinical Notes & Preparation Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 space-y-3">
                  <h4 className="text-sm font-bold text-[#171A3B] dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#5145FF] dark:text-[#16CBE5]" />
                    <span>Clinical Intake Observations</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {assessment.clinicalObservations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5145FF] dark:bg-[#16CBE5] mt-1.5 shrink-0" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 space-y-3">
                  <h4 className="text-sm font-bold text-[#171A3B] dark:text-white flex items-center gap-2">
                    <FileQuestion className="w-4 h-4 text-[#00CFA8]" />
                    <span>Recommended Preparation Questions</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {assessment.preparationQuestions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00CFA8] mt-1.5 shrink-0" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reset */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-xs text-slate-400 dark:text-slate-400">
                <span>Assessment generated in demo simulation.</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[#5145FF] dark:text-[#16CBE5] font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
          <div className="p-4 bg-gradient-to-r from-[#F0E8FF]/60 via-white to-[#B9F4D0]/30 dark:from-[#151838]/85 dark:via-[#1a1e45]/85 dark:to-[#0B0C1E]/85 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 backdrop-blur-md">
            <span className="text-xs font-bold text-[#171A3B] dark:text-white block">
              Quick Test Cases (Click to populate demo clinical presentation):
            </span>
            <div className="flex flex-wrap gap-2">
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
                className="px-3 py-1.5 bg-white dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 hover:border-[#FF745C] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
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
                className="px-3 py-1.5 bg-white dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 hover:border-[#8957FF] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
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
                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 hover:border-rose-400 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 transition-colors shadow-xs cursor-pointer"
              >
                Emergency Red Flag Case
              </button>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 pb-2">
            <span>Wizard Step {triageStep} of 3</span>
            <span className="text-[#5145FF] dark:text-[#16CBE5]">
              {triageStep === 1
                ? 'Chief Symptom & Profile'
                : triageStep === 2
                ? 'Duration & Pain Scale'
                : 'Associated Symptoms & History'}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5145FF] via-[#8957FF] to-[#E34AD7] transition-all duration-300"
              style={{ width: `${(triageStep / 3) * 100}%` }}
            />
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: CHIEF COMPLAINT */}
          {triageStep === 1 && (
            <div className="bg-white/95 dark:bg-[#151838]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 shadow-aurora-card space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5]">
                  Question 1
                </span>
                <h3 className="text-xl font-bold text-[#171A3B] dark:text-white">
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
                  className="w-full p-4 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0B0C1E] focus:border-[#5145FF] focus-visible:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label htmlFor="tr-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    id="tr-name"
                    type="text"
                    placeholder="Patient"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-[#171A3B] dark:text-white focus:border-[#5145FF]"
                  />
                </div>

                <div>
                  <label htmlFor="tr-age" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Patient Age
                  </label>
                  <input
                    id="tr-age"
                    type="number"
                    min="0"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-[#171A3B] dark:text-white focus:border-[#5145FF]"
                  />
                </div>

                <div>
                  <label htmlFor="tr-gender" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Biological Sex
                  </label>
                  <select
                    id="tr-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-[#171A3B] dark:text-white focus:border-[#5145FF]"
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
                  className="px-7 py-3.5 bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white font-bold rounded-xl text-sm shadow-aurora-indigo hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Severity</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DURATION & SEVERITY */}
          {triageStep === 2 && (
            <div className="bg-white/95 dark:bg-[#151838]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 shadow-aurora-card space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5]">
                  Question 2
                </span>
                <h3 className="text-xl font-bold text-[#171A3B] dark:text-white">
                  How long have these symptoms persisted, and how severe is the pain?
                </h3>
              </div>

              <div className="space-y-2">
                <label htmlFor="tr-duration" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Symptom Onset Timeline
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['Less than 24 hours', '2-3 days', '1-2 weeks', 'More than a month'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        duration === d
                          ? 'border-[#5145FF] bg-[#F0E8FF] dark:bg-[#5145FF]/30 text-[#5145FF] dark:text-[#16CBE5] shadow-xs'
                          : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0C1E] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="tr-sev" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Discomfort / Pain Severity Scale
                  </label>
                  <span className="text-sm font-black text-[#5145FF] dark:text-[#16CBE5] font-mono bg-[#F0E8FF] dark:bg-[#8957FF]/20 px-2.5 py-0.5 rounded-lg">
                    {severity} / 10
                  </span>
                </div>
                <input
                  id="tr-sev"
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-[#5145FF] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-400 font-bold">
                  <span>1 (Mild discomfort)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe & unbearable)</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setTriageStep(1)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#171A3B] dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-7 py-3.5 bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white font-bold rounded-xl text-sm shadow-aurora-indigo hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Checklist</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ASSOCIATED SYMPTOMS & HISTORY */}
          {triageStep === 3 && (
            <form
              onSubmit={handleRunAssessment}
              className="bg-white/95 dark:bg-[#151838]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 shadow-aurora-card space-y-6"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5]">
                  Question 3
                </span>
                <h3 className="text-xl font-bold text-[#171A3B] dark:text-white">
                  Select any accompanying symptoms or clinical history
                </h3>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block">
                  Associated Symptoms
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {commonSymptoms.map((symp) => {
                    const isSelected = selectedSymptoms.includes(symp);
                    return (
                      <button
                        key={symp}
                        type="button"
                        onClick={() => handleToggleSymptom(symp)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#5145FF] bg-[#F0E8FF] dark:bg-[#8957FF]/25 text-[#5145FF] dark:text-[#16CBE5]'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0B0C1E]'
                        }`}
                      >
                        <span>{symp}</span>
                        <span
                          className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
                            isSelected ? 'bg-[#5145FF] text-white' : 'border border-slate-300 dark:border-white/20'
                          }`}
                        >
                          {isSelected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block">
                  Relevant Pre-Existing History
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {commonHistory.map((h) => {
                    const isSelected = selectedHistory.includes(h);
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleToggleHistory(h)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#8957FF] bg-[#F0E8FF] dark:bg-[#8957FF]/25 text-[#5145FF] dark:text-[#16CBE5]'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0B0C1E]'
                        }`}
                      >
                        <span>{h}</span>
                        <span
                          className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
                            isSelected ? 'bg-[#8957FF] text-white' : 'border border-slate-300 dark:border-white/20'
                          }`}
                        >
                          {isSelected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setTriageStep(2)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#171A3B] dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#5145FF] via-[#8957FF] to-[#E34AD7] text-white font-extrabold rounded-xl text-sm shadow-aurora-indigo hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isEvaluating ? (
                    <span>Evaluating Clinical Pathway...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Triage Guidance</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
