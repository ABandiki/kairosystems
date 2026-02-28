'use client';

import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  FileText,
  CheckCircle,
  User,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormSubmission } from '@/hooks/use-api';
import { format, parseISO } from 'date-fns';

// ---- helpers ----

function formatDate(date: string | undefined | null): string {
  if (!date) return '—';
  try {
    return format(parseISO(date), 'dd MMM yyyy');
  } catch {
    return date;
  }
}

function formatDateTime(date: string | undefined | null): string {
  if (!date) return '—';
  try {
    return format(parseISO(date), 'dd MMM yyyy, HH:mm');
  } catch {
    return date;
  }
}

function getScoreColor(score: number): string {
  if (score <= 4) return 'green';
  if (score <= 9) return 'yellow';
  if (score <= 14) return 'orange';
  return 'red';
}

function getScoreInterpretation(score: number): { label: string; description: string } {
  if (score <= 4) return { label: 'Minimal', description: 'Symptoms are minimal. No treatment action required.' };
  if (score <= 9) return { label: 'Mild', description: 'Mild symptoms. Watchful waiting; repeat assessment at follow-up.' };
  if (score <= 14) return { label: 'Moderate', description: 'Moderate symptoms. Consider treatment plan, counselling, and follow-up.' };
  if (score <= 19) return { label: 'Moderately Severe', description: 'Active treatment with pharmacotherapy and/or psychotherapy recommended.' };
  return { label: 'Severe', description: 'Immediate initiation of pharmacotherapy; consider referral to mental health specialist.' };
}

const scoreColorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  green: { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  yellow: { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
  red: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
};

// ---- answer renderers ----

interface QuestionProps {
  question: any;
  answer: any;
}

function AnswerOpenText({ answer }: { answer: any }) {
  if (!answer && answer !== 0) return <p className="text-gray-400 italic">No answer provided</p>;
  return <p className="text-gray-800 whitespace-pre-wrap">{String(answer)}</p>;
}

function AnswerFieldGroup({ question, answer }: QuestionProps) {
  const fields: any[] = question.fields || [];
  if (fields.length === 0) return <p className="text-gray-400 italic">No fields</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {fields.map((field: any) => {
        const val = answer && typeof answer === 'object' ? answer[field.id] ?? answer[field.name] : undefined;
        return (
          <div key={field.id}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{field.name || field.label || field.id}</p>
            <p className="text-gray-800 mt-0.5">{val != null && val !== '' ? String(val) : <span className="text-gray-400 italic">—</span>}</p>
          </div>
        );
      })}
    </div>
  );
}

function AnswerSingleChoice({ answer }: { answer: any }) {
  if (!answer && answer !== 0) return <p className="text-gray-400 italic">No selection</p>;
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
      <span className="text-gray-800">{String(answer)}</span>
    </div>
  );
}

function AnswerMultipleChoice({ answer }: { answer: any }) {
  const items: any[] = Array.isArray(answer) ? answer : [];
  if (items.length === 0) return <p className="text-gray-400 italic">No selections</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <Badge key={idx} variant="info">
          {String(item)}
        </Badge>
      ))}
    </div>
  );
}

function AnswerMatrix({ question, answer }: QuestionProps) {
  if (!answer || typeof answer !== 'object') return <p className="text-gray-400 italic">No data</p>;

  const rows = Object.entries(answer);
  if (rows.length === 0) return <p className="text-gray-400 italic">No data</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4 font-medium text-gray-600">Item</th>
            <th className="text-left py-2 font-medium text-gray-600">Response</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, val]) => (
            <tr key={key} className="border-b last:border-0">
              <td className="py-2 pr-4 text-gray-700">{key}</td>
              <td className="py-2 text-gray-800">{Array.isArray(val) ? val.join(', ') : String(val ?? '—')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnswerFileAttachment({ answer }: { answer: any }) {
  if (!answer) return <p className="text-gray-400 italic">No file attached</p>;
  const fileName = typeof answer === 'object' ? (answer.fileName || answer.name || 'File') : String(answer);
  return (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-teal-600" />
      <span className="text-gray-800">{fileName}</span>
    </div>
  );
}

function AnswerSignature({ answer }: { answer: any }) {
  if (!answer) return <p className="text-gray-400 italic">Not signed</p>;
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <span className="text-green-700 font-medium">Signed</span>
    </div>
  );
}

function AnswerGeneric({ answer }: { answer: any }) {
  if (answer == null || answer === '') return <p className="text-gray-400 italic">No data recorded</p>;
  if (typeof answer === 'object') {
    return <pre className="text-sm text-gray-800 bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(answer, null, 2)}</pre>;
  }
  return <p className="text-gray-800 whitespace-pre-wrap">{String(answer)}</p>;
}

function renderAnswer(question: any, answer: any) {
  switch (question.type) {
    case 'open_answer':
      return <AnswerOpenText answer={answer} />;
    case 'demographics':
    case 'primary_insurance':
    case 'secondary_insurance':
    case 'allergies':
      return <AnswerFieldGroup question={question} answer={answer} />;
    case 'multiple_choice_single':
      return <AnswerSingleChoice answer={answer} />;
    case 'multiple_choice_multiple':
      return <AnswerMultipleChoice answer={answer} />;
    case 'matrix':
    case 'matrix_single':
      return <AnswerMatrix question={question} answer={answer} />;
    case 'section':
      return null; // section headings have no answer
    case 'file_attachment':
      return <AnswerFileAttachment answer={answer} />;
    case 'signature':
      return <AnswerSignature answer={answer} />;
    case 'smart_editor':
    case 'body_map':
    case 'mixed_controls':
      return <AnswerGeneric answer={answer} />;
    default:
      return <AnswerGeneric answer={answer} />;
  }
}

// ---- loading skeleton ----

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

// ---- main page component ----

export default function FormSubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;
  const { data: submission, isLoading, error } = useFormSubmission(submissionId);

  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  // Error / not found state
  if (error || !submission) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[60vh]">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Submission Not Found</h2>
          <p className="text-gray-500 mb-4">
            {error ? error.message : 'The form submission you are looking for does not exist or has been removed.'}
          </p>
          <Button onClick={() => router.push('/forms/submissions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
        </div>
      </div>
    );
  }

  const patientName =
    submission.patient
      ? `${submission.patient.firstName} ${submission.patient.lastName}`
      : submission.patientName || 'Unknown Patient';

  const submittedByName =
    submission.submittedBy
      ? `${submission.submittedBy.firstName} ${submission.submittedBy.lastName}`
      : submission.submittedByName || null;

  const templateName = submission.template?.name || submission.templateName || 'Untitled Form';
  const questions: any[] = submission.template?.questions || [];
  const answers: Record<string, any> = submission.answers || {};

  const hasScore = submission.score != null;
  const scoreDetails = submission.scoreDetails;
  const totalScore = scoreDetails?.totalScore ?? submission.score ?? 0;
  const maxPossible = scoreDetails?.maxPossibleScore ?? null;
  const color = hasScore ? getScoreColor(totalScore) : 'green';
  const colorStyles = scoreColorMap[color];
  const interpretation = hasScore ? getScoreInterpretation(totalScore) : null;

  return (
    <div className="p-6 print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ---- HEADER ---- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/forms/submissions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{templateName}</h1>
              <p className="text-sm text-gray-500">
                {patientName} &middot; Submitted {formatDateTime(submission.createdAt)}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold">{templateName}</h1>
          <p className="text-gray-600">{patientName} &middot; {formatDateTime(submission.createdAt)}</p>
        </div>

        {/* ---- PATIENT INFO CARD ---- */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-teal-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patient Name</p>
                <p className="text-gray-900 font-medium mt-0.5">{patientName}</p>
              </div>
              {submission.patient?.dateOfBirth && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</p>
                  <p className="text-gray-900 mt-0.5">{formatDate(submission.patient.dateOfBirth)}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submission Date</p>
                <p className="text-gray-900 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {formatDateTime(submission.createdAt)}
                </p>
              </div>
              {submittedByName && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted By</p>
                  <p className="text-gray-900 mt-0.5">{submittedByName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ---- SCORE CARD (conditional) ---- */}
        {hasScore && (
          <Card className={`border-2 ${colorStyles.border} ${colorStyles.bg}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-5 w-5 text-teal-600" />
                Assessment Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-bold ${colorStyles.text}`}>
                    {totalScore}
                  </span>
                  {maxPossible != null && (
                    <span className="text-lg text-gray-500">/ {maxPossible}</span>
                  )}
                </div>
                {interpretation && (
                  <div className="flex-1">
                    <Badge className={colorStyles.badge}>{interpretation.label}</Badge>
                    <p className="text-sm text-gray-700 mt-1.5">{interpretation.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---- FORM ANSWERS SECTION ---- */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-teal-600" />
            Form Responses
          </h2>

          {questions.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No questions found for this template.</p>
              </CardContent>
            </Card>
          )}

          {questions.map((question: any, idx: number) => {
            const qId = question.id;
            const answer = answers[qId];
            const isSection = question.type === 'section';

            if (isSection) {
              return (
                <div key={qId} className="pt-4">
                  <h3 className="text-base font-semibold text-gray-800 border-b pb-2">
                    {question.title}
                  </h3>
                  {question.instructions && (
                    <p className="text-sm text-gray-500 mt-1">{question.instructions}</p>
                  )}
                </div>
              );
            }

            return (
              <Card key={qId}>
                <CardContent className="pt-5 pb-5">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-500 mr-2">{idx + 1}.</span>
                    <span className="font-medium text-gray-900">
                      {question.title}
                    </span>
                    {question.required && (
                      <span className="text-red-500 ml-1" aria-label="Required">*</span>
                    )}
                  </div>
                  {question.instructions && (
                    <p className="text-xs text-gray-500 mb-3">{question.instructions}</p>
                  )}
                  <div className="pl-5">
                    {renderAnswer(question, answer)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ---- FOOTER ---- */}
        <div className="flex items-center justify-between pt-4 pb-8 print:hidden">
          <Button variant="ghost" onClick={() => router.push('/forms/submissions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
