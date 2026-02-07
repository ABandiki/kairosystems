'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Download,
  Send,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Type,
  Subscript,
  Superscript,
  Upload,
  X,
  Palette,
  Highlighter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { usePatients } from '@/hooks/use-api';

export default function CreateNotePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const canFetch = !authLoading && !!user;
  const { data: patientsData } = usePatients({}, canFetch);
  const contentRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState('');
  const [noteType, setNoteType] = useState('');
  const [patientId, setPatientId] = useState('');
  const [relatedVisit, setRelatedVisit] = useState('none');
  const [colorCode, setColorCode] = useState('#FFFFFF');
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockType, setBlockType] = useState('Normal');

  const patients = patientsData?.data || [];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleFormatCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  const handleBlockTypeChange = (type: string) => {
    setBlockType(type);
    const tagMap: Record<string, string> = {
      'Normal': 'p',
      'Heading 1': 'h1',
      'Heading 2': 'h2',
      'Heading 3': 'h3',
      'Quote': 'blockquote',
    };
    handleFormatCommand('formatBlock', tagMap[type] || 'p');
  };

  const handleImageUpload = (type: 'header' | 'footer') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (type === 'header') {
            setHeaderImage(result);
          } else {
            setFooterImage(result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRemoveImage = (type: 'header' | 'footer') => {
    if (type === 'header') {
      setHeaderImage(null);
    } else {
      setFooterImage(null);
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      handleFormatCommand('insertImage', url);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      handleFormatCommand('createLink', url);
    }
  };

  const handleDownloadPDF = () => {
    // In production, this would generate a proper PDF
    const content = contentRef.current?.innerHTML || '';
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title || 'Note'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1 { color: #03989E; border-bottom: 2px solid #03989E; padding-bottom: 10px; }
              .header-image, .footer-image { max-width: 100%; margin: 20px 0; }
              .content { margin: 20px 0; line-height: 1.6; }
              .meta { color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; }
            </style>
          </head>
          <body>
            ${headerImage ? `<img src="${headerImage}" class="header-image" />` : ''}
            <h1>${title || 'Untitled Note'}</h1>
            <p><strong>Note Type:</strong> ${noteType || 'Not specified'}</p>
            <p><strong>Patient:</strong> ${patients.find(p => p.id === patientId)?.firstName || 'Not specified'} ${patients.find(p => p.id === patientId)?.lastName || ''}</p>
            <div class="content">${content}</div>
            ${footerImage ? `<img src="${footerImage}" class="footer-image" />` : ''}
            <div class="meta">
              <p>Created by: ${user?.firstName} ${user?.lastName}</p>
              <p>Date: ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSubmit = async () => {
    if (!title || !patientId || !contentRef.current?.innerHTML) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // In production, this would call an API to save the note
      const noteData = {
        title,
        noteType,
        patientId,
        relatedVisit,
        colorCode,
        content: contentRef.current?.innerHTML,
        headerImage,
        footerImage,
        createdBy: user?.id,
      };
      console.log('Saving note:', noteData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push('/notes');
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNote = () => {
    handleSubmit();
  };

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Note</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSubmit} disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleSaveNote} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Title and Note Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noteType">Note Type *</Label>
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Note Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                <SelectItem value="LAB_REVIEW">Lab Review</SelectItem>
                <SelectItem value="REFERRAL">Referral</SelectItem>
                <SelectItem value="PHONE_CALL">Phone Call</SelectItem>
                <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
                <SelectItem value="DISCHARGE">Discharge Summary</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Patient and Related Visit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-patients" disabled>
                    No patients found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {patients.length === 0 && (
              <p className="text-sm text-red-500">
                No patients found. Please check your connection or permissions.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="relatedVisit">Related Visit</Label>
            <Select value={relatedVisit} onValueChange={setRelatedVisit}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {/* In production, this would show actual visits for the selected patient */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Color Code */}
        <div className="space-y-2">
          <Label htmlFor="colorCode">Color Code</Label>
          <div className="flex items-center gap-2">
            <Input
              id="colorCode"
              type="color"
              className="w-12 h-10 p-1 cursor-pointer"
              value={colorCode}
              onChange={(e) => setColorCode(e.target.value)}
            />
            <Input
              value={colorCode}
              onChange={(e) => setColorCode(e.target.value)}
              placeholder="#FFFFFF"
              className="flex-1 max-w-[150px]"
            />
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="space-y-2">
          <Label>Note Content *</Label>
          <Card>
            <CardContent className="p-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
                {/* Block Type */}
                <Select value={blockType} onValueChange={handleBlockTypeChange}>
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Heading 1">Heading 1</SelectItem>
                    <SelectItem value="Heading 2">Heading 2</SelectItem>
                    <SelectItem value="Heading 3">Heading 3</SelectItem>
                    <SelectItem value="Quote">Quote</SelectItem>
                  </SelectContent>
                </Select>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Text Formatting */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('bold')}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('italic')}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('underline')}
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('strikethrough')}
                  title="Strikethrough"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Text Color */}
                <div className="relative">
                  <input
                    type="color"
                    className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                    onChange={(e) => handleFormatCommand('foreColor', e.target.value)}
                    title="Text Color"
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Type className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <input
                    type="color"
                    className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                    onChange={(e) => handleFormatCommand('hiliteColor', e.target.value)}
                    title="Highlight Color"
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Highlighter className="h-4 w-4" />
                  </Button>
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Lists */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('insertUnorderedList')}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('insertOrderedList')}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Subscript/Superscript */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('subscript')}
                  title="Subscript"
                >
                  <Subscript className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('superscript')}
                  title="Superscript"
                >
                  <Superscript className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Indentation */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('outdent')}
                  title="Decrease Indent"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('indent')}
                  title="Increase Indent"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Alignment */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('justifyLeft')}
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('justifyCenter')}
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('justifyRight')}
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Link and Image */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleInsertLink}
                  title="Insert Link"
                >
                  <Link className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleInsertImage}
                  title="Insert Image"
                >
                  <Image className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Clear Formatting */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand('removeFormat')}
                  title="Clear Formatting"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content Area */}
              <div
                ref={contentRef}
                contentEditable
                className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
                data-placeholder="Enter note content..."
                onFocus={() => {
                  if (contentRef.current && contentRef.current.innerHTML === '') {
                    contentRef.current.innerHTML = '<p></p>';
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Header and Footer Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Header Image */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label>Header Image:</Label>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => handleImageUpload('header')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {headerImage ? (
                <div className="relative">
                  <img
                    src={headerImage}
                    alt="Header"
                    className="w-full h-32 object-contain border rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => handleRemoveImage('header')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400">
                  No header image uploaded
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer Image */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label>Footer Image:</Label>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => handleImageUpload('footer')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {footerImage ? (
                <div className="relative">
                  <img
                    src={footerImage}
                    alt="Footer"
                    className="w-full h-32 object-contain border rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => handleRemoveImage('footer')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400">
                  No footer image uploaded
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
