'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Download, Pencil, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { format, parseISO } from 'date-fns';

// Note interface
interface Note {
  id: string;
  title: string;
  content: string;
  noteType: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  createdBy: string;
  colorCode?: string;
}

// Mock notes data (same as in notes list page)
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Initial Consultation',
    content: 'Patient presented with persistent cough for 2 weeks. No fever. Prescribed cough suppressant.\n\nExamination findings:\n- Throat slightly red\n- No signs of infection\n- Lungs clear\n\nPlan:\n- Cough suppressant for 7 days\n- Return if symptoms persist or worsen\n- Avoid cold drinks',
    noteType: 'CONSULTATION',
    patientId: 'pat-001',
    patientName: 'Tapiwa Madziva',
    createdAt: '2026-02-01T10:30:00Z',
    createdBy: 'Dr. Tatenda Chikwanha',
    colorCode: '#03989E',
  },
  {
    id: '2',
    title: 'Follow-up Visit',
    content: 'Cough has improved significantly. Patient reports better sleep.\n\nProgress:\n- Symptoms reduced by 80%\n- No new complaints\n- Appetite normal\n\nRecommendation:\n- Continue current medication for 3 more days\n- No further follow-up needed unless new symptoms develop',
    noteType: 'FOLLOW_UP',
    patientId: 'pat-002',
    patientName: 'Nyasha Chikowore',
    createdAt: '2026-02-03T14:00:00Z',
    createdBy: 'Dr. Tatenda Chikwanha',
    colorCode: '#4CBD90',
  },
  {
    id: '3',
    title: 'Lab Results Review',
    content: 'Blood test results normal. Cholesterol levels within healthy range.\n\nResults Summary:\n- Total Cholesterol: 180 mg/dL (Normal)\n- HDL: 55 mg/dL (Good)\n- LDL: 100 mg/dL (Optimal)\n- Triglycerides: 125 mg/dL (Normal)\n\nConclusion:\n- Lipid profile is excellent\n- Continue current diet and exercise regimen\n- Repeat test in 12 months',
    noteType: 'LAB_REVIEW',
    patientId: 'pat-003',
    patientName: 'Farai Zvobgo',
    createdAt: '2026-01-28T09:15:00Z',
    createdBy: 'Nurse Rudo Mutasa',
    colorCode: '#F59E0B',
  },
];

const noteTypeColors: Record<string, string> = {
  CONSULTATION: 'bg-teal-100 text-teal-800',
  FOLLOW_UP: 'bg-emerald-100 text-emerald-800',
  LAB_REVIEW: 'bg-amber-100 text-amber-800',
  REFERRAL: 'bg-cyan-100 text-cyan-800',
  PHONE_CALL: 'bg-purple-100 text-purple-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Find note from mock data
    const noteId = params.id as string;
    const foundNote = mockNotes.find(n => n.id === noteId);
    setNote(foundNote || null);
    setIsLoading(false);
  }, [params.id]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!note) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => router.push('/notes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notes
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Note Not Found</h2>
            <p className="text-gray-500">The note you're looking for doesn't exist or has been deleted.</p>
            <Button className="mt-4" onClick={() => router.push('/notes')}>
              Return to Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDateTime = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM yyyy, HH:mm');
    } catch {
      return date;
    }
  };

  const handleDownloadPDF = () => {
    alert('PDF download feature is coming soon!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/notes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>
            <p className="text-gray-500">Clinical note details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Note
          </Button>
        </div>
      </div>

      {/* Note Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Note Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {note.content.split('\n').map((paragraph, index) => (
                <p key={index} className={paragraph.trim() === '' ? 'h-4' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Note Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Note Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <Badge className={noteTypeColors[note.noteType] || 'bg-gray-100'}>
                    {note.noteType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{note.patientName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="font-medium">{note.createdBy}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{formatDateTime(note.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push(`/patients/${note.patientId}`)}>
                <User className="h-4 w-4 mr-2" />
                View Patient Record
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/notes/new')}>
                <FileText className="h-4 w-4 mr-2" />
                Create Follow-up Note
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
