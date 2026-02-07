'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { usePatients } from '@/hooks/use-api';
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

// Mock notes data
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Initial Consultation',
    content: 'Patient presented with persistent cough for 2 weeks. No fever. Prescribed cough suppressant.',
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
    content: 'Cough has improved significantly. Patient reports better sleep.',
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
    content: 'Blood test results normal. Cholesterol levels within healthy range.',
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

export default function NotesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [notes, setNotes] = useState<Note[]>(mockNotes);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || note.noteType === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatDateTime = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM yyyy, HH:mm');
    } catch {
      return date;
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-500">Manage clinical notes and documentation</p>
        </div>
        <Button onClick={() => router.push('/notes/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Note
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes by title, patient, or content..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Note Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                <SelectItem value="LAB_REVIEW">Lab Review</SelectItem>
                <SelectItem value="REFERRAL">Referral</SelectItem>
                <SelectItem value="PHONE_CALL">Phone Call</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes Table */}
      <Card>
        {filteredNotes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.map((note) => (
                <TableRow key={note.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{note.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{note.content}</p>
                    </div>
                  </TableCell>
                  <TableCell>{note.patientName}</TableCell>
                  <TableCell>
                    <Badge className={noteTypeColors[note.noteType] || 'bg-gray-100'}>
                      {note.noteType.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{note.createdBy}</TableCell>
                  <TableCell>{formatDateTime(note.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/notes/${note.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notes found</p>
            <Button className="mt-4" onClick={() => router.push('/notes/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Note
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
