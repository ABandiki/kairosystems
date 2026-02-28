"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Printer,
  Download,
  Send,
  Save,
  FileText,
  CheckCircle,
  Search,
  User,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formTemplatesApi, formSubmissionsApi, patientsApi } from "@/lib/api";
import type { Patient, FormTemplate } from "@/lib/api";

// ===================== MOCK TEMPLATES (Standard Clinical Forms) =====================

const PHQ9Template = {
  id: "1",
  name: "PHQ-9 Depression Questionnaire",
  type: "questionnaire",
  category: "ASSESSMENT",
  description: "Patient Health Questionnaire-9 for depression screening and monitoring",
  instructions: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  scoringGuide: {
    "0-4": { level: "Minimal", color: "green", action: "No treatment needed" },
    "5-9": { level: "Mild", color: "yellow", action: "Watchful waiting; repeat PHQ-9" },
    "10-14": { level: "Moderate", color: "orange", action: "Treatment plan, counseling, follow-up" },
    "15-19": { level: "Moderately Severe", color: "red", action: "Active treatment with pharmacotherapy and/or psychotherapy" },
    "20-27": { level: "Severe", color: "red", action: "Immediate initiation of pharmacotherapy; refer to mental health specialist" },
  },
  questions: [
    { id: 1, text: "Little interest or pleasure in doing things" },
    { id: 2, text: "Feeling down, depressed, or hopeless" },
    { id: 3, text: "Trouble falling or staying asleep, or sleeping too much" },
    { id: 4, text: "Feeling tired or having little energy" },
    { id: 5, text: "Poor appetite or overeating" },
    { id: 6, text: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down" },
    { id: 7, text: "Trouble concentrating on things, such as reading the newspaper or watching television" },
    { id: 8, text: "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual" },
    { id: 9, text: "Thoughts that you would be better off dead, or of hurting yourself in some way" },
  ],
  options: [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" },
  ],
  functionalQuestion: "If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?",
  functionalOptions: ["Not difficult at all", "Somewhat difficult", "Very difficult", "Extremely difficult"],
};

const GAD7Template = {
  id: "2",
  name: "GAD-7 Anxiety Assessment",
  type: "assessment",
  category: "ASSESSMENT",
  description: "Generalized Anxiety Disorder 7-item scale for anxiety screening",
  instructions: "Over the last 2 weeks, how often have you been bothered by the following problems?",
  scoringGuide: {
    "0-4": { level: "Minimal Anxiety", color: "green", action: "Monitor" },
    "5-9": { level: "Mild Anxiety", color: "yellow", action: "Watchful waiting" },
    "10-14": { level: "Moderate Anxiety", color: "orange", action: "Further evaluation; consider treatment" },
    "15-21": { level: "Severe Anxiety", color: "red", action: "Active treatment warranted" },
  },
  questions: [
    { id: 1, text: "Feeling nervous, anxious, or on edge" },
    { id: 2, text: "Not being able to stop or control worrying" },
    { id: 3, text: "Worrying too much about different things" },
    { id: 4, text: "Trouble relaxing" },
    { id: 5, text: "Being so restless that it's hard to sit still" },
    { id: 6, text: "Becoming easily annoyed or irritable" },
    { id: 7, text: "Feeling afraid as if something awful might happen" },
  ],
  options: [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" },
  ],
};

const AsthmaTemplate = {
  id: "3",
  name: "Asthma Control Questionnaire",
  type: "questionnaire",
  category: "QUESTIONNAIRE",
  description: "Assessment tool for asthma control status based on GINA guidelines",
  instructions: "Please answer the following questions about your asthma over the past 4 weeks:",
  questions: [
    { id: 1, text: "In the past 4 weeks, how often did your asthma symptoms wake you up at night?", type: "select", options: ["Not at all", "1-2 nights", "3-4 nights", "5 or more nights"] },
    { id: 2, text: "In the past 4 weeks, how often have you used your reliever inhaler?", type: "select", options: ["Not at all", "Once a week or less", "2-3 times a week", "1-2 times a day", "3 or more times a day"] },
    { id: 3, text: "In the past 4 weeks, how much has your asthma limited your activities?", type: "select", options: ["Not at all", "A little", "Moderately", "A lot", "Extremely"] },
    { id: 4, text: "In the past 4 weeks, how often did you experience daytime asthma symptoms?", type: "select", options: ["Not at all", "1-2 days/week", "3-4 days/week", "5-6 days/week", "Daily"] },
    { id: 5, text: "What is your current peak flow reading? (if known)", type: "input" },
    { id: 6, text: "Have you had any asthma attacks requiring emergency treatment in the past 12 months?", type: "yesno" },
    { id: 7, text: "Are you using your preventer inhaler regularly as prescribed?", type: "yesno" },
  ],
};

const COPDTemplate = {
  id: "4",
  name: "COPD Assessment Test (CAT)",
  type: "assessment",
  category: "ASSESSMENT",
  description: "COPD Assessment Test for symptom monitoring and disease impact",
  instructions: "Place a mark in the box that best describes you currently.",
  scoringGuide: {
    "0-10": { level: "Low Impact", color: "green" },
    "11-20": { level: "Medium Impact", color: "yellow" },
    "21-30": { level: "High Impact", color: "orange" },
    "31-40": { level: "Very High Impact", color: "red" },
  },
  questions: [
    { id: 1, leftLabel: "I never cough", rightLabel: "I cough all the time", scale: 5 },
    { id: 2, leftLabel: "I have no phlegm in my chest at all", rightLabel: "My chest is completely full of phlegm", scale: 5 },
    { id: 3, leftLabel: "My chest does not feel tight at all", rightLabel: "My chest feels very tight", scale: 5 },
    { id: 4, leftLabel: "When I walk up a hill I am not breathless", rightLabel: "When I walk up a hill I am very breathless", scale: 5 },
    { id: 5, leftLabel: "I am not limited doing any activities at home", rightLabel: "I am very limited doing activities at home", scale: 5 },
    { id: 6, leftLabel: "I am confident leaving my home", rightLabel: "I am not confident leaving my home", scale: 5 },
    { id: 7, leftLabel: "I sleep soundly", rightLabel: "I don't sleep soundly", scale: 5 },
    { id: 8, leftLabel: "I have lots of energy", rightLabel: "I have no energy at all", scale: 5 },
  ],
};

const PatientRegistrationTemplate = {
  id: "5",
  name: "New Patient Registration",
  type: "template",
  category: "INTAKE",
  description: "Comprehensive patient registration form for new patients",
  sections: [
    {
      title: "Personal Information",
      fields: [
        { id: "firstName", label: "First Name", type: "text", required: true },
        { id: "lastName", label: "Last Name", type: "text", required: true },
        { id: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
        { id: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other", "Prefer not to say"], required: true },
        { id: "nationalId", label: "National ID Number", type: "text", required: true, placeholder: "XX-XXXXXXX-X-XX" },
      ],
    },
    {
      title: "Contact Information",
      fields: [
        { id: "phone", label: "Mobile Phone", type: "tel", required: true, placeholder: "+263 7X XXX XXXX" },
        { id: "email", label: "Email Address", type: "email", required: false },
        { id: "address", label: "Street Address", type: "text", required: true },
        { id: "city", label: "City/Town", type: "text", required: true },
      ],
    },
    {
      title: "Emergency Contact",
      fields: [
        { id: "emergencyName", label: "Contact Name", type: "text", required: true },
        { id: "emergencyRelation", label: "Relationship", type: "text", required: true },
        { id: "emergencyPhone", label: "Contact Phone", type: "tel", required: true },
      ],
    },
    {
      title: "Medical History",
      fields: [
        { id: "allergies", label: "Known Allergies", type: "textarea", required: false },
        { id: "medications", label: "Current Medications", type: "textarea", required: false },
        { id: "conditions", label: "Chronic Conditions", type: "checkboxGroup", options: ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "HIV/AIDS", "Tuberculosis", "Epilepsy", "None"], required: false },
      ],
    },
  ],
};

const ConsentTemplate = {
  id: "6",
  name: "Data Protection Consent Form",
  type: "consent",
  category: "CONSENT",
  description: "Patient consent for data processing and treatment",
  sections: [
    {
      title: "Consent for Medical Treatment",
      content: "I hereby consent to receive medical examination, treatment, and care from the healthcare providers at this facility.",
      checkboxLabel: "I consent to receive medical treatment",
    },
    {
      title: "Consent for Data Processing",
      content: "My personal information will be collected and processed for providing healthcare services, billing, and legal compliance.",
      checkboxLabel: "I consent to the processing of my personal data as described above",
    },
    {
      title: "Communication Preferences",
      options: [
        { id: "smsReminders", label: "SMS appointment reminders" },
        { id: "emailUpdates", label: "Email health updates" },
        { id: "whatsapp", label: "WhatsApp communications" },
        { id: "phoneCall", label: "Phone calls for important matters" },
      ],
    },
  ],
  signatureRequired: true,
};

const DiabetesReviewTemplate = {
  id: "7",
  name: "Diabetes Annual Review",
  type: "template",
  category: "QUESTIONNAIRE",
  description: "Comprehensive annual review template for diabetic patients",
  sections: [
    {
      title: "Glycaemic Control",
      fields: [
        { id: "hba1c", label: "HbA1c (%)", type: "number", required: true },
        { id: "lastHba1cDate", label: "Date of Last HbA1c", type: "date", required: true },
        { id: "fastingGlucose", label: "Fasting Blood Glucose (mmol/L)", type: "number" },
      ],
    },
    {
      title: "Cardiovascular Risk",
      fields: [
        { id: "systolicBP", label: "Systolic BP (mmHg)", type: "number", required: true },
        { id: "diastolicBP", label: "Diastolic BP (mmHg)", type: "number", required: true },
        { id: "totalCholesterol", label: "Total Cholesterol (mmol/L)", type: "number" },
        { id: "smoking", label: "Smoking Status", type: "select", options: ["Never", "Ex-smoker", "Current smoker"] },
        { id: "bmi", label: "BMI (kg/m2)", type: "number" },
      ],
    },
    {
      title: "Complications Screening",
      fields: [
        { id: "retinopathy", label: "Retinopathy Screening", type: "select", options: ["Done - Normal", "Done - Abnormal", "Overdue", "Declined"], required: true },
        { id: "footExam", label: "Foot Examination", type: "select", options: ["Low Risk", "Moderate Risk", "High Risk", "Active Problem"], required: true },
        { id: "neuropathy", label: "Symptoms of Neuropathy", type: "yesno" },
      ],
    },
    {
      title: "Medication Review",
      fields: [
        { id: "currentMeds", label: "Current Diabetes Medications", type: "textarea", required: true },
        { id: "adherence", label: "Medication Adherence", type: "select", options: ["Good", "Moderate", "Poor"] },
        { id: "sideEffects", label: "Any Side Effects", type: "textarea" },
      ],
    },
  ],
};

const MOCK_TEMPLATES: Record<string, any> = {
  "1": PHQ9Template,
  "2": GAD7Template,
  "3": AsthmaTemplate,
  "4": COPDTemplate,
  "5": PatientRegistrationTemplate,
  "6": ConsentTemplate,
  "7": DiabetesReviewTemplate,
};

const MOCK_IDS = ["1", "2", "3", "4", "5", "6", "7"];

// ===================== MAIN COMPONENT =====================

export default function FormViewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const formId = params.id as string;

  const isMockTemplate = MOCK_IDS.includes(formId);
  const preSelectedPatientId = searchParams.get("patientId") || "";

  // State
  const [template, setTemplate] = useState<any>(isMockTemplate ? MOCK_TEMPLATES[formId] : null);
  const [loading, setLoading] = useState(!isMockTemplate);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Patient selection
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);

  // Fetch API template if not a mock
  useEffect(() => {
    if (!isMockTemplate) {
      setLoading(true);
      formTemplatesApi
        .getById(formId)
        .then((t) => {
          setTemplate(t);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [formId, isMockTemplate]);

  // Pre-select patient if ID in URL
  useEffect(() => {
    if (preSelectedPatientId) {
      patientsApi.getById(preSelectedPatientId).then((p) => {
        setSelectedPatient(p);
      }).catch(() => {});
    }
  }, [preSelectedPatientId]);

  // Patient search
  useEffect(() => {
    if (patientSearch.length < 2) {
      setPatientResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingPatients(true);
      try {
        const res = await patientsApi.getAll({ search: patientSearch, pageSize: 5 });
        setPatientResults(res.data);
      } catch {
        setPatientResults([]);
      }
      setSearchingPatients(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-3 text-gray-600">Loading form...</span>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <FileText className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Form Not Found</h2>
        <p className="text-gray-500 mb-4">The requested form template does not exist.</p>
        <Button onClick={() => router.push("/forms")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forms
        </Button>
      </div>
    );
  }

  const handleResponseChange = (questionId: string | number, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    if (template.questions && template.options) {
      const score = template.questions.reduce((sum: number, q: any) => {
        return sum + (parseInt(responses[q.id]) || 0);
      }, 0);
      return score;
    }
    // COPD-style (scale questions)
    if (template.questions && template.questions[0]?.scale !== undefined) {
      return template.questions.reduce((sum: number, q: any) => {
        return sum + (parseInt(responses[q.id]) || 0);
      }, 0);
    }
    return null;
  };

  const getScoreInterpretation = (score: number) => {
    if (!template.scoringGuide) return null;
    for (const [range, info] of Object.entries(template.scoringGuide)) {
      const [min, max] = range.split("-").map(Number);
      if (score >= min && score <= max) {
        return info as { level: string; color: string; action?: string };
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient before submitting");
      return;
    }

    setSubmitting(true);
    const score = calculateScore();
    if (score !== null) setTotalScore(score);

    try {
      // For mock templates, use the mock template name as a reference
      const templateId = isMockTemplate ? formId : formId;

      // Only submit to API if we have a real template ID (not mock)
      if (!isMockTemplate) {
        const scoreDetails = score !== null ? {
          totalScore: score,
          maxPossibleScore: template.questions?.length ? (template.questions.length - 1) * 3 : 0,
          questionScores: [],
        } : undefined;

        await formSubmissionsApi.create({
          templateId,
          patientId: selectedPatient.id,
          answers: responses,
          score: score ?? undefined,
          scoreDetails,
        });
      }

      setSubmitted(true);
      toast.success("Form submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }

    if (!isMockTemplate) {
      try {
        await formSubmissionsApi.create({
          templateId: formId,
          patientId: selectedPatient.id,
          answers: { ...responses, _isDraft: true },
        });
        toast.success("Draft saved!");
      } catch (err: any) {
        toast.error(err.message || "Failed to save draft");
      }
    } else {
      toast.info("Draft saving is available for custom form templates");
    }
  };

  // ===================== RENDERERS =====================

  const renderPatientSelector = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-5 w-5 text-teal-600" />
          Select Patient
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedPatient ? (
          <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
            <div>
              <p className="font-medium text-teal-900">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="text-sm text-teal-700">
                DOB: {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : "N/A"}
                {selectedPatient.patientNumber && ` | #${selectedPatient.patientNumber}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedPatient(null);
                setPatientSearch("");
              }}
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients by name..."
              className="pl-9"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setShowPatientDropdown(true);
              }}
              onFocus={() => setShowPatientDropdown(true)}
            />
            {showPatientDropdown && patientSearch.length >= 2 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
                {searchingPatients ? (
                  <div className="p-3 text-center text-gray-500 text-sm">Searching...</div>
                ) : patientResults.length === 0 ? (
                  <div className="p-3 text-center text-gray-500 text-sm">No patients found</div>
                ) : (
                  patientResults.map((p) => (
                    <button
                      key={p.id}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                      onClick={() => {
                        setSelectedPatient(p);
                        setShowPatientDropdown(false);
                        setPatientSearch("");
                      }}
                    >
                      <p className="font-medium text-sm">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        DOB: {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : "N/A"}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // PHQ-9 / GAD-7 style forms (Likert scale)
  const renderLikertForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800 font-medium">{template.instructions}</p>
      </div>
      <div className="space-y-4">
        {template.questions.map((q: any, idx: number) => (
          <Card key={q.id}>
            <CardContent className="pt-4">
              <div className="flex gap-4">
                <span className="font-bold text-gray-500">{idx + 1}.</span>
                <div className="flex-1">
                  <p className="font-medium mb-3">{q.text}</p>
                  <RadioGroup
                    value={responses[q.id]?.toString()}
                    onValueChange={(val) => handleResponseChange(q.id, parseInt(val))}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {template.options.map((opt: any) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.value.toString()} id={`q${q.id}-${opt.value}`} />
                          <Label htmlFor={`q${q.id}-${opt.value}`} className="text-sm">{opt.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {template.functionalQuestion && (
        <Card>
          <CardContent className="pt-4">
            <p className="font-medium mb-3">{template.functionalQuestion}</p>
            <RadioGroup value={responses["functional"]} onValueChange={(val) => handleResponseChange("functional", val)}>
              <div className="space-y-2">
                {template.functionalOptions.map((opt: string, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`functional-${idx}`} />
                    <Label htmlFor={`functional-${idx}`}>{opt}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // COPD-style (scale slider)
  const renderScaleForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800 font-medium">{template.instructions}</p>
      </div>
      <div className="space-y-4">
        {template.questions.map((q: any) => (
          <Card key={q.id}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 text-right text-sm text-gray-600">{q.leftLabel}</div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      className={`w-10 h-10 rounded-full border-2 font-bold transition-all ${responses[q.id] === val ? "bg-teal-500 text-white border-teal-500" : "border-gray-300 hover:border-teal-400"}`}
                      onClick={() => handleResponseChange(q.id, val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="flex-1 text-left text-sm text-gray-600">{q.rightLabel}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Asthma-style (mixed question types)
  const renderMixedQuestionsForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800 font-medium">{template.instructions}</p>
      </div>
      <div className="space-y-4">
        {template.questions.map((q: any, idx: number) => (
          <Card key={q.id}>
            <CardContent className="pt-4">
              <p className="font-medium mb-3">{idx + 1}. {q.text}</p>
              {q.type === "select" && (
                <Select value={responses[q.id]} onValueChange={(val) => handleResponseChange(q.id, val)}>
                  <SelectTrigger><SelectValue placeholder="Select an answer..." /></SelectTrigger>
                  <SelectContent>
                    {q.options.map((opt: string) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {q.type === "input" && (
                <Input placeholder="Enter value..." value={responses[q.id] || ""} onChange={(e) => handleResponseChange(q.id, e.target.value)} />
              )}
              {q.type === "yesno" && (
                <RadioGroup value={responses[q.id]} onValueChange={(val) => handleResponseChange(q.id, val)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                    <Label htmlFor={`${q.id}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`${q.id}-no`} />
                    <Label htmlFor={`${q.id}-no`}>No</Label>
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Section-based forms (Registration, Diabetes, etc.)
  const renderSectionForm = () => (
    <div className="space-y-8">
      {template.sections.map((section: any, sectionIdx: number) => (
        <Card key={sectionIdx}>
          <CardHeader><CardTitle className="text-lg">{section.title}</CardTitle></CardHeader>
          <CardContent>
            {section.content && (
              <div className="prose prose-sm max-w-none mb-4 whitespace-pre-line text-gray-700">{section.content}</div>
            )}
            {section.checkboxLabel && (
              <div className="flex items-start space-x-3 mt-4 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  id={`consent-${sectionIdx}`}
                  checked={responses[`consent-${sectionIdx}`]}
                  onCheckedChange={(checked) => handleResponseChange(`consent-${sectionIdx}`, checked)}
                />
                <Label htmlFor={`consent-${sectionIdx}`} className="font-medium">{section.checkboxLabel}</Label>
              </div>
            )}
            {section.options && !section.fields && (
              <div className="space-y-2 mt-4">
                {section.options.map((opt: any) => (
                  <div key={opt.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={opt.id}
                      checked={responses[opt.id]}
                      onCheckedChange={(checked) => handleResponseChange(opt.id, checked)}
                    />
                    <Label htmlFor={opt.id}>{opt.label}</Label>
                  </div>
                ))}
              </div>
            )}
            {section.fields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field: any) => (
                  <div key={field.id} className={field.type === "textarea" || field.type === "checkboxGroup" ? "col-span-2" : ""}>
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {(field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "number") && (
                      <Input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={responses[field.id] || ""}
                        onChange={(e) => handleResponseChange(field.id, e.target.value)}
                        className="mt-1"
                      />
                    )}
                    {field.type === "date" && (
                      <Input id={field.id} type="date" value={responses[field.id] || ""} onChange={(e) => handleResponseChange(field.id, e.target.value)} className="mt-1" />
                    )}
                    {field.type === "select" && (
                      <Select value={responses[field.id]} onValueChange={(val) => handleResponseChange(field.id, val)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.type === "textarea" && (
                      <Textarea id={field.id} placeholder={field.placeholder} value={responses[field.id] || ""} onChange={(e) => handleResponseChange(field.id, e.target.value)} className="mt-1" rows={3} />
                    )}
                    {field.type === "yesno" && (
                      <RadioGroup value={responses[field.id]} onValueChange={(val) => handleResponseChange(field.id, val)} className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id={`${field.id}-yes`} />
                          <Label htmlFor={`${field.id}-yes`}>Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`${field.id}-no`} />
                          <Label htmlFor={`${field.id}-no`}>No</Label>
                        </div>
                      </RadioGroup>
                    )}
                    {field.type === "checkboxGroup" && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {field.options.map((opt: string) => (
                          <div key={opt} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-${opt}`}
                              checked={responses[field.id]?.includes(opt)}
                              onCheckedChange={(checked) => {
                                const current = responses[field.id] || [];
                                handleResponseChange(field.id, checked ? [...current, opt] : current.filter((v: string) => v !== opt));
                              }}
                            />
                            <Label htmlFor={`${field.id}-${opt}`} className="text-sm">{opt}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {template.signatureRequired && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Signature</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input id="patientName" value={responses.patientName || ""} onChange={(e) => handleResponseChange("patientName", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="signatureDate">Date</Label>
                <Input id="signatureDate" type="date" value={responses.signatureDate || new Date().toISOString().split("T")[0]} onChange={(e) => handleResponseChange("signatureDate", e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">Signature area - Patient to sign here</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Dynamic renderer for API-created templates (from form builder)
  const renderDynamicForm = () => {
    if (!template.questions || !Array.isArray(template.questions)) {
      return <p className="text-gray-500">This form template has no questions.</p>;
    }

    return (
      <div className="space-y-4">
        {template.questions
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((q: any, idx: number) => {
            if (q.type === "section") {
              return (
                <div key={q.id} className="pt-4">
                  <h3 className="text-lg font-semibold text-gray-900">{q.title}</h3>
                  {q.instructions && <p className="text-sm text-gray-500 mt-1">{q.instructions}</p>}
                </div>
              );
            }

            return (
              <Card key={q.id}>
                <CardContent className="pt-4">
                  <div className="mb-3">
                    <p className="font-medium">
                      {idx + 1}. {q.title}
                      {q.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    {q.instructions && <p className="text-sm text-gray-500 mt-1">{q.instructions}</p>}
                  </div>

                  {/* Open answer */}
                  {q.type === "open_answer" && (
                    <Textarea
                      value={responses[q.id] || ""}
                      onChange={(e) => handleResponseChange(q.id, e.target.value)}
                      placeholder="Enter your answer..."
                      rows={3}
                    />
                  )}

                  {/* Demographics / Insurance / Allergies (field-based) */}
                  {(q.type === "demographics" || q.type === "primary_insurance" || q.type === "secondary_insurance" || q.type === "allergies") && q.fields && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.fields.map((field: any) => (
                        <div key={field.id}>
                          <Label className="text-sm">
                            {field.name}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.type === "dropdown" && field.options ? (
                            <Select value={responses[`${q.id}_${field.id}`]} onValueChange={(val) => handleResponseChange(`${q.id}_${field.id}`, val)}>
                              <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                              <SelectContent>
                                {field.options.map((opt: string) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type={field.type === "date" ? "date" : field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                              value={responses[`${q.id}_${field.id}`] || ""}
                              onChange={(e) => handleResponseChange(`${q.id}_${field.id}`, e.target.value)}
                              className="mt-1"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Multiple choice single */}
                  {q.type === "multiple_choice_single" && q.options && (
                    <RadioGroup
                      value={responses[q.id]?.toString()}
                      onValueChange={(val) => handleResponseChange(q.id, val)}
                    >
                      <div className="space-y-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div key={optIdx} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt} id={`q${q.id}-opt${optIdx}`} />
                            <Label htmlFor={`q${q.id}-opt${optIdx}`}>{opt}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {/* Multiple choice multiple */}
                  {q.type === "multiple_choice_multiple" && q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center space-x-2">
                          <Checkbox
                            id={`q${q.id}-opt${optIdx}`}
                            checked={(responses[q.id] || []).includes(opt)}
                            onCheckedChange={(checked) => {
                              const current = responses[q.id] || [];
                              handleResponseChange(q.id, checked ? [...current, opt] : current.filter((v: string) => v !== opt));
                            }}
                          />
                          <Label htmlFor={`q${q.id}-opt${optIdx}`}>{opt}</Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matrix / Matrix single */}
                  {(q.type === "matrix" || q.type === "matrix_single") && q.options && (
                    <div className="overflow-x-auto">
                      <p className="text-sm text-gray-500 mb-2">Rate each option:</p>
                      <div className="space-y-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div key={optIdx} className="flex items-center gap-3">
                            <span className="text-sm w-48 flex-shrink-0">{opt}</span>
                            <RadioGroup
                              value={responses[`${q.id}_${optIdx}`]?.toString()}
                              onValueChange={(val) => handleResponseChange(`${q.id}_${optIdx}`, val)}
                              className="flex gap-2"
                            >
                              {[1, 2, 3, 4, 5].map((val) => (
                                <div key={val} className="flex items-center space-x-1">
                                  <RadioGroupItem value={val.toString()} id={`q${q.id}-${optIdx}-${val}`} />
                                  <Label htmlFor={`q${q.id}-${optIdx}-${val}`} className="text-xs">{val}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File attachment */}
                  {q.type === "file_attachment" && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-gray-500 text-sm">File upload - Coming soon</p>
                    </div>
                  )}

                  {/* Signature */}
                  {q.type === "signature" && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <p className="text-gray-500">Signature area - Sign here</p>
                    </div>
                  )}

                  {/* Smart editor / Body map */}
                  {(q.type === "smart_editor" || q.type === "body_map" || q.type === "mixed_controls") && (
                    <Textarea
                      value={responses[q.id] || ""}
                      onChange={(e) => handleResponseChange(q.id, e.target.value)}
                      placeholder={q.type === "body_map" ? "Describe the affected area..." : "Enter your response..."}
                      rows={4}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    );
  };

  // Choose which renderer to use
  const renderForm = () => {
    if (!isMockTemplate) {
      return renderDynamicForm();
    }
    switch (template.id) {
      case "1":
      case "2":
        return renderLikertForm();
      case "3":
        return renderMixedQuestionsForm();
      case "4":
        return renderScaleForm();
      case "5":
      case "7":
        return renderSectionForm();
      case "6":
        return renderSectionForm();
      default:
        return renderDynamicForm();
    }
  };

  // Score result card
  const renderScoreResult = () => {
    if (!submitted || totalScore === null) return null;
    const interpretation = getScoreInterpretation(totalScore);
    if (!interpretation) return null;

    const colorMap: Record<string, string> = {
      green: "border-green-500 bg-green-50",
      yellow: "border-yellow-500 bg-yellow-50",
      orange: "border-orange-500 bg-orange-50",
      red: "border-red-500 bg-red-50",
    };

    return (
      <Card className={`border-2 mt-6 ${colorMap[interpretation.color] || "border-teal-500 bg-teal-50"}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Assessment Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-3xl font-bold">{totalScore}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Severity</p>
              <p className="text-xl font-semibold">{interpretation.level}</p>
            </div>
          </div>
          {interpretation.action && (
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm font-medium text-gray-700">Recommended Action:</p>
              <p className="text-sm">{interpretation.action}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.push("/forms")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <FileText className="h-8 w-8 text-teal-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-gray-600 mt-1">{template.description}</p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-teal-100 text-teal-800">
                  {template.category || template.type}
                </Badge>
                {!isMockTemplate && template.language && (
                  <Badge variant="outline">{template.language}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Selector */}
      {!submitted && renderPatientSelector()}

      {/* Form Content */}
      {submitted ? (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted Successfully</h2>
          <p className="text-gray-600 mb-6">
            The form has been submitted for {selectedPatient?.firstName} {selectedPatient?.lastName}.
          </p>
          {renderScoreResult()}
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="outline" onClick={() => router.push("/forms/submissions")}>
              View All Submissions
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => router.push("/forms")}>
              Back to Forms
            </Button>
          </div>
        </div>
      ) : (
        <>
          {renderForm()}

          {/* Submit Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {submitting ? "Submitting..." : "Submit Form"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
