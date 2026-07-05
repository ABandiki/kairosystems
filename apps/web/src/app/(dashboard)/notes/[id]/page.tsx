'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { notesApi, Note } from '@/lib/api';
import { format, parseISO } from 'date-fns';

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
  const [note, setNote] = useState<(Note & { createdByName?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const noteId = params.id as string;
    if (!user || !noteId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const data = await notesApi.getById(noteId);
        if (!cancelled) setNote(data as Note & { createdByName?: string });
      } catch {
        if (!cancelled) setNote(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, user]);

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
            <p className="text-gray-500">The note you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
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
            <div className="prose max-w-none whitespace-pre-wrap">
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
              {note.patientName && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Patient</p>
                    <p className="font-medium">{note.patientName}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="font-medium">{note.createdByName || note.createdBy}</p>
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
          {note.patientId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push(`/patients/${note.patientId}`)}>
                  <User className="h-4 w-4 mr-2" />
                  View Patient Record
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
