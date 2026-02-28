'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  ClipboardList,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useFormSubmissions } from '@/hooks/use-api';
import { FormSubmission } from '@/lib/api';
import { format, parseISO } from 'date-fns';

const CATEGORY_STYLES: Record<string, string> = {
  INTAKE: 'bg-blue-100 text-blue-800',
  ASSESSMENT: 'bg-teal-100 text-teal-800',
  CONSENT: 'bg-amber-100 text-amber-800',
  QUESTIONNAIRE: 'bg-emerald-100 text-emerald-800',
  CUSTOM: 'bg-gray-100 text-gray-800',
};

function getCategoryBadgeClass(category: string): string {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.CUSTOM;
}

function getScoreColor(score: number): string {
  if (score <= 4) return 'text-green-600';
  if (score <= 9) return 'text-yellow-600';
  if (score <= 14) return 'text-orange-600';
  return 'text-red-600';
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
}

function getPatientName(submission: FormSubmission): string {
  if (submission.patient) {
    return `${submission.patient.firstName} ${submission.patient.lastName}`;
  }
  return submission.patientName || 'Unknown Patient';
}

function getFormName(submission: FormSubmission): string {
  if (submission.template) {
    return submission.template.name;
  }
  return submission.templateName || 'Unknown Form';
}

function getCategory(submission: FormSubmission): string {
  return submission.template?.category || 'CUSTOM';
}

function getSubmittedBy(submission: FormSubmission): string {
  if (submission.submittedBy) {
    return `${submission.submittedBy.firstName} ${submission.submittedBy.lastName}`;
  }
  return submission.submittedByName || '-';
}

const PAGE_SIZE = 20;

export default function FormSubmissionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const { data: submissionsData, isLoading, error } = useFormSubmissions(
    {
      search: searchQuery || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      pageSize: PAGE_SIZE,
    },
    !!user
  );

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

  const submissions = submissionsData?.data || [];
  const totalSubmissions = submissionsData?.total || 0;
  const totalPages = submissionsData?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
          <p className="text-gray-500">View and manage completed form submissions</p>
        </div>
        <Button onClick={() => router.push('/forms')}>
          <FileText className="h-4 w-4 mr-2" />
          Fill New Form
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient name or form name..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <Input
              type="date"
              placeholder="Start date"
              className="w-[160px]"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
            <span className="text-gray-400 text-sm">to</span>
            <Input
              type="date"
              placeholder="End date"
              className="w-[160px]"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Submissions table */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading submissions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <ClipboardList className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Failed to load submissions</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">No form submissions yet</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || startDate || endDate
                ? 'No submissions match your filters'
                : 'Completed form submissions will appear here'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => router.push('/forms')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Fill a Form
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Form Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => {
                const category = getCategory(submission);
                return (
                  <TableRow
                    key={submission.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/forms/submissions/${submission.id}`)}
                  >
                    <TableCell>
                      <p className="font-medium text-gray-900">
                        {getPatientName(submission)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {getFormName(submission)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadgeClass(category)}>
                        {category.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {submission.score != null ? (
                        <span className={`font-semibold ${getScoreColor(submission.score)}`}>
                          {submission.score}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">
                        {getSubmittedBy(submission)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(submission.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/forms/submissions/${submission.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4 text-teal-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {!isLoading && !error && submissions.length > 0 && (
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
              {Math.min(page * PAGE_SIZE, totalSubmissions)} of {totalSubmissions} submissions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
