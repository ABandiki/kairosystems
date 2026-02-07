'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, MoreVertical, Copy, Trash2, Edit, ClipboardList, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Form {
  id: string;
  name: string;
  type: 'assessment' | 'questionnaire' | 'template' | 'consent';
  description: string;
  lastModified: string;
  status: 'active' | 'draft' | 'archived';
  usageCount: number;
}

const mockForms: Form[] = [
  {
    id: '1',
    name: 'PHQ-9 Depression Questionnaire',
    type: 'questionnaire',
    description: 'Patient Health Questionnaire for depression screening',
    lastModified: '28/01/2026',
    status: 'active',
    usageCount: 156,
  },
  {
    id: '2',
    name: 'GAD-7 Anxiety Assessment',
    type: 'assessment',
    description: 'Generalized Anxiety Disorder 7-item scale',
    lastModified: '25/01/2026',
    status: 'active',
    usageCount: 142,
  },
  {
    id: '3',
    name: 'Asthma Control Questionnaire',
    type: 'questionnaire',
    description: 'Assessment tool for asthma control status',
    lastModified: '20/01/2026',
    status: 'active',
    usageCount: 89,
  },
  {
    id: '4',
    name: 'COPD Assessment Test (CAT)',
    type: 'assessment',
    description: 'COPD assessment test for symptom monitoring',
    lastModified: '15/01/2026',
    status: 'active',
    usageCount: 67,
  },
  {
    id: '5',
    name: 'New Patient Registration',
    type: 'template',
    description: 'Template for new patient registration',
    lastModified: '10/01/2026',
    status: 'active',
    usageCount: 234,
  },
  {
    id: '6',
    name: 'GDPR Consent Form',
    type: 'consent',
    description: 'Data protection and consent form',
    lastModified: '05/01/2026',
    status: 'active',
    usageCount: 198,
  },
  {
    id: '7',
    name: 'Diabetes Annual Review',
    type: 'template',
    description: 'Template for annual diabetes review consultations',
    lastModified: '01/01/2026',
    status: 'draft',
    usageCount: 0,
  },
];

const typeColors: Record<string, string> = {
  assessment: 'bg-teal-100 text-teal-800',
  questionnaire: 'bg-emerald-100 text-emerald-800',
  template: 'bg-cyan-100 text-cyan-800',
  consent: 'bg-amber-100 text-amber-800',
};

export default function FormsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredForms = mockForms.filter((form) => {
    const matchesSearch =
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && form.status === 'active') ||
      (activeTab === 'draft' && form.status === 'draft') ||
      form.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms & Templates</h1>
          <p className="text-gray-500">Manage clinical forms, questionnaires, and templates</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/forms/questionnaires')}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            My Forms
          </Button>
          <Button onClick={() => router.push('/forms/questionnaires')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Tabs and search */}
      <div className="bg-white rounded-lg border p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all">All Forms</TabsTrigger>
              <TabsTrigger value="questionnaire">Questionnaires</TabsTrigger>
              <TabsTrigger value="assessment">Assessments</TabsTrigger>
              <TabsTrigger value="template">Templates</TabsTrigger>
              <TabsTrigger value="consent">Consent</TabsTrigger>
            </TabsList>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search forms..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredForms.map((form) => (
                <Card
                  key={form.id}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/forms/view/${form.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-teal-100 transition-colors">
                          <FileText className="h-5 w-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
                        </div>
                        <div>
                          <CardTitle className="text-base line-clamp-1 group-hover:text-teal-600 transition-colors">
                            {form.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={typeColors[form.type]}
                              variant="secondary"
                            >
                              {form.type}
                            </Badge>
                            {form.status === 'draft' && (
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
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/forms/view/${form.id}`);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Form
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Form
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2 mb-4">
                      {form.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Used {form.usageCount} times</span>
                      <span>Modified {form.lastModified}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
