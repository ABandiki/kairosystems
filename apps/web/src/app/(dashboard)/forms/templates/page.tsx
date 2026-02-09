"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  FileText,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFormTemplates } from "@/hooks/use-api";
import { formTemplatesApi, FormTemplate } from "@/lib/api";

const categoryColors: Record<string, string> = {
  INTAKE: "bg-blue-100 text-blue-800",
  ASSESSMENT: "bg-teal-100 text-teal-800",
  CONSENT: "bg-amber-100 text-amber-800",
  QUESTIONNAIRE: "bg-emerald-100 text-emerald-800",
  CUSTOM: "bg-purple-100 text-purple-800",
};

export default function FormTemplatesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canFetch = !authLoading && !!user;
  const { data: templatesData, isLoading: templatesLoading, refetch } = useFormTemplates(
    { search: searchQuery || undefined },
    canFetch
  );

  const templates = templatesData?.data || [];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleCreateTemplate = async () => {
    if (newFormName.trim()) {
      setIsSubmitting(true);
      try {
        const newTemplate = await formTemplatesApi.create({
          name: newFormName,
          description: newFormDescription,
          category: "CUSTOM",
          status: "DRAFT",
          questions: [],
        });
        setShowNewDialog(false);
        setNewFormName("");
        setNewFormDescription("");
        router.push(`/forms/templates/${newTemplate.id}/builder`);
      } catch (error) {
        console.error('Failed to create template:', error);
        alert('Failed to create template');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/forms/templates/${templateId}/builder`);
  };

  const handleDuplicateTemplate = async (template: FormTemplate) => {
    try {
      await formTemplatesApi.duplicate(template.id);
      refetch();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      alert('Failed to duplicate template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await formTemplatesApi.delete(templateId);
        refetch();
      } catch (error) {
        console.error('Failed to delete template:', error);
        alert('Failed to delete template');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-500">
            Create and manage form templates for your practice
          </p>
        </div>
        <Button
          className="bg-[#03989E] hover:bg-[#028a8f] gap-2"
          onClick={() => setShowNewDialog(true)}
        >
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search templates..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleEditTemplate(template.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-1">
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={categoryColors[template.category]}
                        variant="secondary"
                      >
                        {template.category}
                      </Badge>
                      {template.status === "DRAFT" && (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTemplate(template.id);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Template
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateTemplate(template);
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-2 mb-4">
                {template.description}
              </CardDescription>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{template.questionCount} questions</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{template.lastModified}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create New Card */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-[#03989E]"
          onClick={() => setShowNewDialog(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px]">
            <div className="w-12 h-12 bg-[#03989E]/10 rounded-full flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-[#03989E]" />
            </div>
            <p className="font-medium text-[#03989E]">Create New Template</p>
            <p className="text-sm text-gray-500">Start from scratch</p>
          </CardContent>
        </Card>
      </div>

      {/* New Template Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                placeholder="Enter template name"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description (optional)</Label>
              <Input
                id="templateDescription"
                placeholder="Enter a brief description"
                value={newFormDescription}
                onChange={(e) => setNewFormDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#03989E] hover:bg-[#028a8f]"
              onClick={handleCreateTemplate}
              disabled={!newFormName.trim()}
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
