'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  FileText,
  FlaskConical,
  Forward,
  FolderOpen,
  Upload,
  Trash2,
  Eye,
  MoreVertical,
  LayoutGrid,
  List,
  File,
  X,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useDocuments } from '@/hooks/use-api';
import { documentsApi, patientsApi, Patient } from '@/lib/api';
import type { Document as KairoDocument } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { format, parseISO } from 'date-fns';

const DOCUMENT_TYPES = [
  { value: 'LAB_RESULT', label: 'Lab Result' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'SCAN', label: 'Scan' },
  { value: 'LETTER', label: 'Letter' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'CONSENT', label: 'Consent' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'REPORT', label: 'Report' },
  { value: 'OTHER', label: 'Other' },
];

const typeColors: Record<string, string> = {
  LAB_RESULT: 'bg-blue-100 text-blue-800',
  REFERRAL: 'bg-purple-100 text-purple-800',
  SCAN: 'bg-cyan-100 text-cyan-800',
  LETTER: 'bg-amber-100 text-amber-800',
  CERTIFICATE: 'bg-green-100 text-green-800',
  CONSENT: 'bg-teal-100 text-teal-800',
  IMAGE: 'bg-pink-100 text-pink-800',
  PRESCRIPTION: 'bg-indigo-100 text-indigo-800',
  REPORT: 'bg-orange-100 text-orange-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getTypeLabel(type: string): string {
  return DOCUMENT_TYPES.find(t => t.value === type)?.label || type.replace(/_/g, ' ');
}

export default function DocumentsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Upload dialog
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [uploadForm, setUploadForm] = useState({
    patientId: '',
    type: 'OTHER',
    title: '',
    description: '',
    fileName: '',
    fileSize: 0,
    mimeType: 'application/pdf',
  });
  const [submitting, setSubmitting] = useState(false);

  // View dialog
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KairoDocument | null>(null);

  const canFetch = !authLoading && !!user;
  const { data: documentsData, isLoading: documentsLoading, refetch } = useDocuments(
    {
      search: searchQuery || undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
    },
    canFetch
  );

  const documents = documentsData?.data || [];

  // Stats
  const totalDocuments = documents.length;
  const labResults = documents.filter(d => d.type === 'LAB_RESULT').length;
  const referrals = documents.filter(d => d.type === 'REFERRAL').length;
  const otherDocs = documents.filter(d => !['LAB_RESULT', 'REFERRAL'].includes(d.type)).length;

  // Fetch patients when dialog opens
  useEffect(() => {
    if (showUploadDialog) {
      fetchPatients('');
    }
  }, [showUploadDialog]);

  const fetchPatients = async (search: string) => {
    setPatientsLoading(true);
    try {
      const result = await patientsApi.getAll({ search, pageSize: 20 });
      setPatients(result.data);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (patientSearch.length >= 2) {
      const timeout = setTimeout(() => fetchPatients(patientSearch), 300);
      return () => clearTimeout(timeout);
    }
  }, [patientSearch]);

  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM yyyy');
    } catch {
      return date;
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      patientId: '',
      type: 'OTHER',
      title: '',
      description: '',
      fileName: '',
      fileSize: 0,
      mimeType: 'application/pdf',
    });
    setPatientSearch('');
  };

  const handleUpload = async () => {
    if (!uploadForm.patientId) {
      toast.warning('Please select a patient');
      return;
    }
    if (!uploadForm.title) {
      toast.warning('Please enter a document title');
      return;
    }
    if (!uploadForm.fileName) {
      toast.warning('Please enter a file name');
      return;
    }

    setSubmitting(true);
    try {
      await documentsApi.create({
        patientId: uploadForm.patientId,
        type: uploadForm.type,
        title: uploadForm.title,
        description: uploadForm.description || undefined,
        fileName: uploadForm.fileName,
        fileSize: uploadForm.fileSize,
        mimeType: uploadForm.mimeType,
      });
      toast.success('Document created', 'Document metadata has been saved successfully.');
      setShowUploadDialog(false);
      resetUploadForm();
      refetch();
    } catch (error: any) {
      toast.error('Failed to create document', error.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await documentsApi.delete(id);
      toast.success('Document deleted');
      refetch();
    } catch (error: any) {
      toast.error('Failed to delete document', error.message || 'Please try again.');
    }
  };

  const handleViewDocument = (doc: KairoDocument) => {
    setSelectedDocument(doc);
    setShowViewDialog(true);
  };

  // Loading skeleton
  if (authLoading || documentsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-3" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500">Manage patient documents and files</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FlaskConical className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lab Results</p>
                <p className="text-2xl font-bold text-gray-900">{labResults}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Forward className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{referrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Other</p>
                <p className="text-2xl font-bold text-gray-900">{otherDocs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, patient name, or file name..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Content */}
      {documents.length > 0 ? (
        viewMode === 'list' ? (
          /* List View */
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>File Info</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewDocument(doc)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-gray-500">{doc.fileName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${typeColors[doc.type] || 'bg-gray-100 text-gray-800'} border-0`}>
                        {getTypeLabel(doc.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.patientName || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatFileSize(doc.fileSize)}</p>
                        <p className="text-gray-500 text-xs">{doc.mimeType}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                    <TableCell>{doc.uploadedByName || '-'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(doc);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id);
                            }}
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
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewDocument(doc)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <File className="h-5 w-5 text-gray-500" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleViewDocument(doc);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{doc.patientName || 'Unknown'}</p>

                  <div className="flex items-center justify-between">
                    <Badge className={`${typeColors[doc.type] || 'bg-gray-100 text-gray-800'} border-0 text-xs`}>
                      {getTypeLabel(doc.type)}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatFileSize(doc.fileSize)}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(doc.uploadedAt)}</span>
                    <span>{doc.uploadedByName || ''}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">No documents found</p>
            <p className="text-gray-500 mb-4">Upload documents to get started.</p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </Card>
      )}

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={(open) => {
        setShowUploadDialog(open);
        if (!open) resetUploadForm();
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document for a patient.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Patient Selector */}
            <div className="space-y-2">
              <Label>Patient *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for a patient..."
                  className="pl-9"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
              {uploadForm.patientId && (
                <div className="flex items-center gap-2 p-2 bg-teal-50 border border-teal-200 rounded-md">
                  <span className="text-sm font-medium text-teal-800">
                    {patients.find(p => p.id === uploadForm.patientId)
                      ? `${patients.find(p => p.id === uploadForm.patientId)!.firstName} ${patients.find(p => p.id === uploadForm.patientId)!.lastName}`
                      : 'Selected patient'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-auto"
                    onClick={() => setUploadForm(prev => ({ ...prev, patientId: '' }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {!uploadForm.patientId && patients.length > 0 && patientSearch.length >= 2 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {patientsLoading ? (
                    <div className="p-3 text-sm text-gray-500">Loading...</div>
                  ) : (
                    patients.map((patient) => (
                      <button
                        key={patient.id}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0"
                        onClick={() => {
                          setUploadForm(prev => ({ ...prev, patientId: patient.id }));
                          setPatientSearch('');
                        }}
                      >
                        <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                        <span className="text-gray-500 ml-2">
                          DOB: {formatDate(patient.dateOfBirth)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select
                value={uploadForm.type}
                onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="e.g. Blood Test Results - Feb 2026"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description of the document..."
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* File Info */}
            <div className="space-y-3">
              <Label>File Information</Label>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  File upload storage coming soon. Document metadata will be saved.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">File Name *</Label>
                  <Input
                    placeholder="e.g. blood-test.pdf"
                    value={uploadForm.fileName}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, fileName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">File Size (bytes)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 102400"
                    value={uploadForm.fileSize || ''}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, fileSize: Number(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">MIME Type</Label>
                <Select
                  value={uploadForm.mimeType}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, mimeType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="application/pdf">PDF</SelectItem>
                    <SelectItem value="image/jpeg">JPEG Image</SelectItem>
                    <SelectItem value="image/png">PNG Image</SelectItem>
                    <SelectItem value="application/msword">Word Document</SelectItem>
                    <SelectItem value="text/plain">Plain Text</SelectItem>
                    <SelectItem value="application/dicom">DICOM</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUploadDialog(false);
              resetUploadForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <File className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedDocument.title}</h3>
                  <p className="text-sm text-gray-500">{selectedDocument.fileName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <Badge className={`${typeColors[selectedDocument.type] || 'bg-gray-100 text-gray-800'} border-0 mt-1`}>
                    {getTypeLabel(selectedDocument.type)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{selectedDocument.patientName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">File Size</p>
                  <p className="font-medium">{formatFileSize(selectedDocument.fileSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">MIME Type</p>
                  <p className="font-medium">{selectedDocument.mimeType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Upload Date</p>
                  <p className="font-medium">{formatDate(selectedDocument.uploadedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uploaded By</p>
                  <p className="font-medium">{selectedDocument.uploadedByName || '-'}</p>
                </div>
              </div>

              {selectedDocument.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {selectedDocument.description}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
