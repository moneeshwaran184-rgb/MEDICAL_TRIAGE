import { TriageInput, TriageAssessment, DepartmentId } from '../types/index.ts';

const EMERGENCY_KEYWORDS = [
  'chest pain',
  'chest pressure',
  'crushing chest',
  'heart attack',
  'cannot breathe',
  'can\'t breathe',
  'severe shortness of breath',
  'gasping for air',
  'facial drooping',
  'arm weakness',
  'slurred speech',
  'stroke',
  'loss of consciousness',
  'unconscious',
  'passed out',
  'coughing blood',
  'severe bleeding',
  'anaphylaxis',
  'throat closing',
  'blue lips',
  'sudden severe headache thunderclap',
];

export const triageService = {
  assessSymptoms(input: TriageInput): TriageAssessment {
    const textToCheck = `${input.chiefComplaint} ${input.symptoms.join(' ')}`.toLowerCase();

    // 1. Emergency Safety Check
    const isEmergency = EMERGENCY_KEYWORDS.some((kw) => textToCheck.includes(kw)) || input.severity >= 9;

    if (isEmergency) {
      return {
        urgency: 'emergency',
        isEmergency: true,
        urgencyLabel: 'EMERGENCY — Immediate Medical Attention Required',
        severityScore: input.severity,
        recommendedDepartmentId: 'cardiology',
        recommendedDepartmentName: 'Emergency Medicine / Acute Cardiology',
        summary: 'Your described symptoms indicate potentially critical or life-threatening physiological distress that requires immediate in-person evaluation.',
        clinicalObservations: [
          'High-acuity red flag indicators identified (e.g. acute respiratory, cardiac, or neurovascular risk).',
          'Delaying evaluation by scheduling a routine outpatient appointment poses significant medical danger.',
        ],
        nextSteps: [
          'Call 911 or your local emergency dispatch immediately.',
          'Do NOT drive yourself; request emergency ambulance transport.',
          'If conscious and instructed by emergency dispatchers, rest quietly in an upright or comfortable position.',
        ],
        preparationQuestions: [
          'Time of exact symptom onset',
          'Current medications and known cardiovascular history',
          'Emergency contact telephone number',
        ],
      };
    }

    // 2. Department routing logic
    let recommendedDepartmentId: DepartmentId = 'general-medicine';
    let recommendedDepartmentName = 'General Medicine';

    if (input.age < 16) {
      recommendedDepartmentId = 'pediatrics';
      recommendedDepartmentName = 'Pediatrics';
    } else if (
      textToCheck.includes('heart') ||
      textToCheck.includes('palpitation') ||
      textToCheck.includes('blood pressure') ||
      textToCheck.includes('hypertension') ||
      textToCheck.includes('pulse')
    ) {
      recommendedDepartmentId = 'cardiology';
      recommendedDepartmentName = 'Cardiology';
    } else if (
      textToCheck.includes('headache') ||
      textToCheck.includes('migraine') ||
      textToCheck.includes('dizzy') ||
      textToCheck.includes('dizziness') ||
      textToCheck.includes('numbness') ||
      textToCheck.includes('tingling') ||
      textToCheck.includes('tremor') ||
      textToCheck.includes('seizure') ||
      textToCheck.includes('memory')
    ) {
      recommendedDepartmentId = 'neurology';
      recommendedDepartmentName = 'Neurology';
    } else if (
      textToCheck.includes('knee') ||
      textToCheck.includes('joint') ||
      textToCheck.includes('bone') ||
      textToCheck.includes('ankle') ||
      textToCheck.includes('sprain') ||
      textToCheck.includes('fracture') ||
      textToCheck.includes('back pain') ||
      textToCheck.includes('shoulder') ||
      textToCheck.includes('spine')
    ) {
      recommendedDepartmentId = 'orthopedics';
      recommendedDepartmentName = 'Orthopedics';
    } else if (
      textToCheck.includes('skin') ||
      textToCheck.includes('rash') ||
      textToCheck.includes('mole') ||
      textToCheck.includes('eczema') ||
      textToCheck.includes('itching') ||
      textToCheck.includes('acne') ||
      textToCheck.includes('dermatitis')
    ) {
      recommendedDepartmentId = 'dermatology';
      recommendedDepartmentName = 'Dermatology';
    }

    // 3. Urgency classification
    let urgency: 'urgent' | 'routine' | 'self-care' = 'routine';
    let urgencyLabel = 'Routine Clinical Consultation';

    if (input.severity >= 6 || textToCheck.includes('high fever') || textToCheck.includes('sudden')) {
      urgency = 'urgent';
      urgencyLabel = 'Urgent Clinical Evaluation (Within 24-48 Hours)';
    } else if (input.severity <= 2 && input.duration.includes('day') && !input.medicalHistory.length) {
      urgency = 'self-care';
      urgencyLabel = 'Low Acuity / Supportive Care & Consultation';
    }

    return {
      urgency,
      isEmergency: false,
      urgencyLabel,
      severityScore: input.severity,
      recommendedDepartmentId,
      recommendedDepartmentName,
      summary: `Based on your reported ${input.chiefComplaint.toLowerCase()} (rated ${input.severity}/10 for ${input.duration}), consultation with our ${recommendedDepartmentName} team is recommended.`,
      clinicalObservations: [
        `Target clinical domain: ${recommendedDepartmentName} based on symptomatic presentation.`,
        input.medicalHistory.length > 0
          ? `Pre-existing conditions noted (${input.medicalHistory.join(', ')}) which will be reviewed during clinical intake.`
          : 'No major pre-existing chronic risk factors recorded in preliminary intake.',
        `Assessed triage acuity: ${urgencyLabel}.`,
      ],
      nextSteps: [
        `Book an outpatient consultation with our ${recommendedDepartmentName} department using the button below.`,
        'Keep a daily log of when symptoms worsen or improve.',
        'If symptoms sharply escalate or new emergency signs arise (chest tightness, severe shortness of breath), seek immediate emergency care.',
      ],
      preparationQuestions: [
        'When did you first notice these symptoms, and have they occurred before?',
        'What remedies or medications have you tried, and did they bring relief?',
        'Do you have any recent laboratory or diagnostic test results to bring to your consultation?',
      ],
    };
  },
};
