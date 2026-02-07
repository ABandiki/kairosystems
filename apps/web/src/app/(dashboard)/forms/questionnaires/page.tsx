"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Plus,
  FileText,
  MoreVertical,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Mock data for forms
const mockForms = [
  {
    id: "1",
    name: "Patient Intake Form",
    language: "English",
    shared: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Detailed Form",
    language: "English",
    shared: true,
    createdAt: "2024-01-10",
  },
];

export default function MyFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState(mockForms);
  const [showNewFormDialog, setShowNewFormDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateForm = () => {
    if (newFormName.trim()) {
      const newForm = {
        id: Date.now().toString(),
        name: newFormName,
        language: "English",
        shared: false,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setForms([...forms, newForm]);
      setShowNewFormDialog(false);
      setNewFormName("");
      // Navigate to the form builder
      router.push(`/forms/templates/${newForm.id}/builder`);
    }
  };

  const handleFormClick = (formId: string) => {
    router.push(`/forms/templates/${formId}/builder`);
  };

  const handleUploadClick = () => {
    setShowUploadDialog(true);
    setUploadedFile(null);
    setUploadStatus('idle');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Accept JSON, XML, or PDF files
      const validTypes = ['application/json', 'application/xml', 'text/xml', 'application/pdf'];
      const validExtensions = ['.json', '.xml', '.pdf'];
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

      if (validTypes.includes(file.type) || hasValidExtension) {
        setUploadedFile(file);
        setUploadStatus('idle');
      } else {
        alert('Please upload a JSON, XML, or PDF file');
      }
    }
  };

  const handleUploadForm = async () => {
    if (!uploadedFile) return;

    setUploadStatus('uploading');

    // Simulate upload processing
    setTimeout(() => {
      // Create a new form from the uploaded file
      const formName = uploadedFile.name.replace(/\.(json|xml|pdf)$/i, '');
      const newForm = {
        id: Date.now().toString(),
        name: formName,
        language: "English",
        shared: false,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setForms([...forms, newForm]);
      setUploadStatus('success');

      // Close dialog after a short delay and navigate to builder
      setTimeout(() => {
        setShowUploadDialog(false);
        setUploadedFile(null);
        setUploadStatus('idle');
        router.push(`/forms/templates/${newForm.id}/builder`);
      }, 1500);
    }, 1000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validExtensions = ['.json', '.xml', '.pdf'];
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

      if (hasValidExtension) {
        setUploadedFile(file);
        setUploadStatus('idle');
      } else {
        alert('Please upload a JSON, XML, or PDF file');
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">MY FORMS</h1>
          <p className="text-muted-foreground">
            Manage and access all your custom forms and questionnaires
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleUploadClick}>
            <Upload className="h-4 w-4" />
            Upload Form
          </Button>
          <Button
            className="gap-2 bg-[#03989E] hover:bg-[#028a8f]"
            onClick={() => setShowNewFormDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>

      {/* Custom Forms Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Custom Forms</h2>
        <p className="text-muted-foreground mb-4">
          {forms.length} forms available
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Existing Forms */}
          {forms.map((form) => (
            <Card
              key={form.id}
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
              onClick={() => handleFormClick(form.id)}
            >
              {form.shared && (
                <div className="bg-red-500 text-white px-3 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Globe className="h-4 w-4" />
                    SHARED
                  </div>
                  <button
                    className="hover:bg-red-600 rounded p-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              )}
              <CardContent className="p-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-500" />
                </div>
                <p className="font-medium text-center">{form.name}</p>
                {form.language && (
                  <p className="text-sm text-muted-foreground">{form.language}</p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Upload Existing Form Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-yellow-400"
            onClick={handleUploadClick}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[180px]">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="font-medium text-yellow-600">Upload Existing Form</p>
              <p className="text-sm text-muted-foreground">Import from file</p>
            </CardContent>
          </Card>

          {/* Create New Form Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-[#03989E] bg-blue-50/30"
            onClick={() => setShowNewFormDialog(true)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[180px]">
              <div className="w-16 h-16 bg-[#03989E] rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <p className="font-medium text-[#03989E]">Create New Form</p>
              <p className="text-sm text-muted-foreground">Start from scratch</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Form Dialog */}
      <Dialog open={showNewFormDialog} onOpenChange={setShowNewFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="formName">Form Name</Label>
              <Input
                id="formName"
                placeholder="Enter form name"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFormDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#03989E] hover:bg-[#028a8f]"
              onClick={handleCreateForm}
            >
              Create Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Form Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Form</DialogTitle>
            <DialogDescription>
              Import an existing form from a JSON, XML, or PDF file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json,.xml,.pdf"
              className="hidden"
            />

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${uploadedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {uploadStatus === 'success' ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                  <p className="text-green-600 font-medium">Form uploaded successfully!</p>
                  <p className="text-sm text-gray-500">Redirecting to form builder...</p>
                </div>
              ) : uploadStatus === 'uploading' ? (
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-gray-600 font-medium">Processing form...</p>
                </div>
              ) : uploadedFile ? (
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-green-500 mb-3" />
                  <p className="text-gray-900 font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-blue-500 mt-2">Click to change file</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-gray-500 mb-3">or click to browse</p>
                  <p className="text-xs text-gray-400">
                    Supported formats: JSON, XML, PDF
                  </p>
                </div>
              )}
            </div>

            {uploadStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Failed to upload form. Please try again.</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadDialog(false);
                setUploadedFile(null);
                setUploadStatus('idle');
              }}
              disabled={uploadStatus === 'uploading'}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#03989E] hover:bg-[#028a8f]"
              onClick={handleUploadForm}
              disabled={!uploadedFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
