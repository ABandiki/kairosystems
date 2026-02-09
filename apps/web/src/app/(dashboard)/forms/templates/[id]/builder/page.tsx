"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Save,
  ChevronRight,
  Copy,
  Trash2,
  Plus,
  Users,
  CreditCard,
  CircleDot,
  AlertTriangle,
  AlignLeft,
  CheckSquare,
  Grid3X3,
  Type,
  Paperclip,
  PenTool,
  FileEdit,
  Pencil,
  HelpCircle,
  GripVertical,
} from "lucide-react";
import { formTemplatesApi } from "@/lib/api";

// Types
interface FormField {
  id: string;
  name: string;
  type: "text" | "dropdown" | "date" | "number" | "email" | "phone";
  required: boolean;
  options?: string[];
}

interface FormQuestion {
  id: string;
  order: number;
  type:
    | "open_answer"
    | "demographics"
    | "primary_insurance"
    | "secondary_insurance"
    | "allergies"
    | "multiple_choice_single"
    | "multiple_choice_multiple"
    | "matrix"
    | "matrix_single"
    | "section"
    | "file_attachment"
    | "signature"
    | "smart_editor"
    | "body_map"
    | "mixed_controls";
  title: string;
  required: boolean;
  instructions?: string;
  fields?: FormField[];
  options?: string[];
}

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  isActive: boolean;
  isPublic: boolean;
  questions: FormQuestion[];
}

// Question type menu items
const questionTypes = [
  {
    id: "allergies",
    label: "Add Allergies Question",
    icon: AlertTriangle,
    color: "text-orange-500",
  },
  {
    id: "mixed_controls",
    label: "Mixed Controls",
    icon: Grid3X3,
    color: "text-blue-500",
  },
  {
    id: "open_answer",
    label: "Open Answer",
    icon: AlignLeft,
    color: "text-teal-500",
  },
  {
    id: "multiple_choice_single",
    label: "Multiple Choice - Single Answer",
    icon: CheckSquare,
    color: "text-green-500",
  },
  {
    id: "multiple_choice_multiple",
    label: "Multiple Choice - Multiple Answer",
    icon: CheckSquare,
    color: "text-green-600",
  },
  {
    id: "matrix",
    label: "Matrix",
    icon: Grid3X3,
    color: "text-purple-500",
  },
  {
    id: "matrix_single",
    label: "Matrix - Single Answer per Line",
    icon: Grid3X3,
    color: "text-purple-600",
  },
  {
    id: "section",
    label: "Section Title / Note",
    icon: Type,
    color: "text-gray-500",
  },
  {
    id: "file_attachment",
    label: "File Attachment",
    icon: Paperclip,
    color: "text-blue-500",
  },
  {
    id: "signature",
    label: "e-Signature",
    icon: PenTool,
    color: "text-indigo-500",
  },
  {
    id: "smart_editor",
    label: "Smart Editor",
    icon: FileEdit,
    color: "text-cyan-500",
  },
  {
    id: "body_map",
    label: "Body Map / Drawing",
    icon: Pencil,
    color: "text-pink-500",
  },
];

// Default field sets
const defaultDemographicFields: FormField[] = [
  { id: "1", name: "First Name", type: "text", required: true },
  { id: "2", name: "Middle Initials", type: "text", required: false },
  { id: "3", name: "Last Name", type: "text", required: true },
  { id: "4", name: "Date of Birth", type: "date", required: true },
  {
    id: "5",
    name: "Gender",
    type: "dropdown",
    required: true,
    options: ["Male", "Female", "Other"],
  },
  {
    id: "6",
    name: "Marital Status",
    type: "dropdown",
    required: false,
    options: ["Single", "Married", "Divorced", "Widowed"],
  },
  { id: "7", name: "Street Address", type: "text", required: true },
  { id: "8", name: "Apt/Unit #", type: "text", required: false },
  { id: "9", name: "City", type: "text", required: true },
  { id: "10", name: "State", type: "text", required: true },
  { id: "11", name: "Zip Code", type: "text", required: true },
  { id: "12", name: "Mobile Phone", type: "phone", required: true },
  { id: "13", name: "Home Phone", type: "text", required: false },
  { id: "14", name: "Work Phone", type: "text", required: false },
  { id: "15", name: "Email", type: "email", required: true },
  {
    id: "16",
    name: "Preferred contact method",
    type: "dropdown",
    required: true,
    options: ["Phone", "Email", "SMS"],
  },
  { id: "17", name: "Occupation", type: "text", required: false },
  { id: "18", name: "Additional Information", type: "text", required: false },
];

const defaultInsuranceFields: FormField[] = [
  { id: "1", name: "Insurance Company", type: "text", required: true },
  { id: "2", name: "Policy Number", type: "text", required: true },
  { id: "3", name: "Group Number", type: "text", required: false },
  { id: "4", name: "Policy Holder Name", type: "text", required: true },
  { id: "5", name: "Policy Holder DOB", type: "date", required: true },
  {
    id: "6",
    name: "Relationship to Patient",
    type: "dropdown",
    required: true,
    options: ["Self", "Spouse", "Child", "Other"],
  },
];

const defaultAllergiesFields: FormField[] = [
  { id: "1", name: "Allergy Name", type: "text", required: true },
  {
    id: "2",
    name: "Reaction Type",
    type: "dropdown",
    required: true,
    options: ["Mild", "Moderate", "Severe"],
  },
  { id: "3", name: "Notes", type: "text", required: false },
];

const questionTypeLabels: Record<string, string> = {
  open_answer: "Open Answer",
  demographics: "Demographics",
  primary_insurance: "Primary Insurance",
  secondary_insurance: "Secondary Insurance",
  allergies: "Allergies",
  multiple_choice_single: "Multiple Choice - Single",
  multiple_choice_multiple: "Multiple Choice - Multiple",
  matrix: "Matrix",
  matrix_single: "Matrix - Single per Row",
  section: "Section Title",
  file_attachment: "File Attachment",
  signature: "e-Signature",
  smart_editor: "Smart Editor",
  body_map: "Body Map",
  mixed_controls: "Mixed Controls",
};

// Get default form for new templates
const getDefaultForm = (id: string): FormTemplate => ({
  id,
  name: "",
  description: "",
  language: "English",
  isActive: true,
  isPublic: false,
  questions: [
    {
      id: "q1",
      order: 1,
      type: "demographics",
      title: "[EN] Client Information",
      required: true,
      instructions: "Please enter your information.",
      fields: [...defaultDemographicFields],
    },
  ],
});

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const isNewForm = formId === "new";

  const [form, setForm] = useState<FormTemplate | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(
    new Set()
  );
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [editingFieldOptions, setEditingFieldOptions] = useState<{
    fieldId: string;
    options: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (isNewForm) {
        setForm(getDefaultForm(formId));
        setSelectedQuestionId("q1");
      } else {
        try {
          const existingForm = await formTemplatesApi.getById(formId);
          setForm({
            id: existingForm.id,
            name: existingForm.name,
            description: existingForm.description || "",
            language: existingForm.language || "English",
            isActive: existingForm.status === "ACTIVE",
            isPublic: existingForm.isPublic || false,
            questions: existingForm.questions || [],
          });
          if (existingForm.questions?.length > 0) {
            setSelectedQuestionId(existingForm.questions[0].id);
          }
        } catch (error) {
          console.error('Failed to load template:', error);
          setForm(getDefaultForm(formId));
          setSelectedQuestionId("q1");
        }
      }
    };
    loadForm();
  }, [formId, isNewForm]);

  const selectedQuestion = form?.questions.find(
    (q) => q.id === selectedQuestionId
  );

  // Handler functions
  const handleFormMetaChange = (
    field: keyof FormTemplate,
    value: string | boolean
  ) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
  };

  const handleAddQuestion = (type: FormQuestion["type"]) => {
    if (!form) return;

    let fields: FormField[] | undefined;
    let title = "";

    switch (type) {
      case "demographics":
        fields = defaultDemographicFields.map((f) => ({
          ...f,
          id: `f${Date.now()}_${f.id}`,
        }));
        title = "[EN] Client Information";
        break;
      case "primary_insurance":
        fields = defaultInsuranceFields.map((f) => ({
          ...f,
          id: `f${Date.now()}_${f.id}`,
        }));
        title = "[EN] Primary Insurance Information";
        break;
      case "secondary_insurance":
        fields = defaultInsuranceFields.map((f) => ({
          ...f,
          id: `f${Date.now()}_${f.id}`,
        }));
        title = "[EN] Secondary Insurance Information";
        break;
      case "allergies":
        fields = defaultAllergiesFields.map((f) => ({
          ...f,
          id: `f${Date.now()}_${f.id}`,
        }));
        title = "[EN] Allergies";
        break;
      default:
        title = `[EN] New ${questionTypeLabels[type] || "Question"}`;
    }

    const newQuestion: FormQuestion = {
      id: `q${Date.now()}`,
      order: form.questions.length + 1,
      type,
      title,
      required: false,
      fields,
      options:
        type.includes("multiple_choice") || type.includes("matrix")
          ? ["Option 1", "Option 2", "Option 3"]
          : undefined,
    };

    setForm({ ...form, questions: [...form.questions, newQuestion] });
    setSelectedQuestionId(newQuestion.id);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!form) return;

    const newQuestions = form.questions
      .filter((q) => q.id !== questionId)
      .map((q, i) => ({ ...q, order: i + 1 }));

    setForm({ ...form, questions: newQuestions });

    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(newQuestions[0]?.id || null);
    }
  };

  const handleDuplicateQuestion = (questionId: string) => {
    if (!form) return;

    const question = form.questions.find((q) => q.id === questionId);
    if (!question) return;

    const newQuestion: FormQuestion = {
      ...question,
      id: `q${Date.now()}`,
      order: form.questions.length + 1,
      title: `${question.title} (Copy)`,
      fields: question.fields
        ? question.fields.map((f) => ({ ...f, id: `f${Date.now()}_${f.id}` }))
        : undefined,
    };

    setForm({ ...form, questions: [...form.questions, newQuestion] });
    setSelectedQuestionId(newQuestion.id);
  };

  const handleQuestionChange = (field: keyof FormQuestion, value: unknown) => {
    if (!form || !selectedQuestionId) return;

    const newQuestions = form.questions.map((q) =>
      q.id === selectedQuestionId ? { ...q, [field]: value } : q
    );

    setForm({ ...form, questions: newQuestions });
  };

  const handleFieldChange = (
    fieldId: string,
    fieldKey: keyof FormField,
    value: unknown
  ) => {
    if (!form || !selectedQuestionId) return;

    const newQuestions = form.questions.map((q) => {
      if (q.id === selectedQuestionId && q.fields) {
        return {
          ...q,
          fields: q.fields.map((f) =>
            f.id === fieldId ? { ...f, [fieldKey]: value } : f
          ),
        };
      }
      return q;
    });

    setForm({ ...form, questions: newQuestions });
  };

  const handleDeleteField = (fieldId: string) => {
    if (!form || !selectedQuestionId) return;

    const newQuestions = form.questions.map((q) => {
      if (q.id === selectedQuestionId && q.fields) {
        return {
          ...q,
          fields: q.fields.filter((f) => f.id !== fieldId),
        };
      }
      return q;
    });

    setForm({ ...form, questions: newQuestions });
  };

  const handleAddField = () => {
    if (!form || !selectedQuestionId) return;

    const newField: FormField = {
      id: `f${Date.now()}`,
      name: "New Field",
      type: "text",
      required: false,
    };

    const newQuestions = form.questions.map((q) => {
      if (q.id === selectedQuestionId) {
        return {
          ...q,
          fields: [...(q.fields || []), newField],
        };
      }
      return q;
    });

    setForm({ ...form, questions: newQuestions });
  };

  const handleShowOptions = (fieldId: string, options: string[]) => {
    setEditingFieldOptions({ fieldId, options: [...options] });
    setShowOptionsDialog(true);
  };

  const handleSaveFieldOptions = () => {
    if (!editingFieldOptions || !form || !selectedQuestionId) return;

    const newQuestions = form.questions.map((q) => {
      if (q.id === selectedQuestionId && q.fields) {
        return {
          ...q,
          fields: q.fields.map((f) =>
            f.id === editingFieldOptions.fieldId
              ? { ...f, options: editingFieldOptions.options }
              : f
          ),
        };
      }
      return q;
    });

    setForm({ ...form, questions: newQuestions });
    setShowOptionsDialog(false);
    setEditingFieldOptions(null);
  };

  const handleSaveTemplate = async () => {
    if (!form) return;

    setIsSaving(true);
    try {
      const saveData = {
        name: form.name,
        description: form.description,
        language: form.language,
        isPublic: form.isPublic,
        status: form.isActive ? "ACTIVE" : "DRAFT",
        questions: form.questions,
      };

      if (isNewForm) {
        const created = await formTemplatesApi.create(saveData);
        router.push(`/forms/templates/${created.id}/builder`);
      } else {
        await formTemplatesApi.update(formId, saveData);
      }
      alert("Template saved successfully!");
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleOptionsExpanded = (fieldId: string) => {
    const newExpanded = new Set(expandedOptions);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedOptions(newExpanded);
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading form...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col -m-6">
      {/* Header with Form Metadata */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/forms/templates")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">
              {isNewForm ? "Create Form Template" : "Edit Form Template"}
            </h1>
          </div>
          <Button
            className="bg-[#03989E] hover:bg-[#028a8f] gap-2"
            onClick={handleSaveTemplate}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>

        {/* Form Metadata Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="formTitle">
              Form Title<span className="text-red-500">*</span>
            </Label>
            <Input
              id="formTitle"
              placeholder="Enter form title"
              value={form.name}
              onChange={(e) => handleFormMetaChange("name", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="language">Language</Label>
            <Select
              value={form.language}
              onValueChange={(value) => handleFormMetaChange("language", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter form description"
            value={form.description}
            onChange={(e) => handleFormMetaChange("description", e.target.value)}
            className="mt-1"
            rows={2}
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(checked) =>
                handleFormMetaChange("isActive", checked as boolean)
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPublic"
              checked={form.isPublic}
              onCheckedChange={(checked) =>
                handleFormMetaChange("isPublic", checked as boolean)
              }
            />
            <Label htmlFor="isPublic">Public (visible to all users)</Label>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Question Types */}
        <div className="w-[280px] border-r bg-white overflow-y-auto">
          {/* Add Question Types */}
          <div className="p-2">
            {/* Demographics & Insurance Section */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 text-left text-sm font-medium text-orange-600 hover:bg-orange-50 rounded">
                <AlertTriangle className="h-4 w-4" />
                <span>Add Allergies Question</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </CollapsibleTrigger>
            </Collapsible>

            {/* Question Type Buttons */}
            {questionTypes.map((qType) => (
              <button
                key={qType.id}
                className="flex items-center gap-2 w-full p-2 text-left text-sm hover:bg-gray-50 rounded"
                onClick={() =>
                  handleAddQuestion(qType.id as FormQuestion["type"])
                }
              >
                <qType.icon className={`h-4 w-4 ${qType.color}`} />
                <span className={qType.color}>{qType.label}</span>
                <Plus className="h-4 w-4 ml-auto text-gray-400" />
              </button>
            ))}

            {/* Special Question Types with Submenu */}
            <Collapsible>
              <CollapsibleTrigger
                className="flex items-center gap-2 w-full p-2 text-left text-sm hover:bg-gray-50 rounded"
                onClick={() => handleAddQuestion("demographics")}
              >
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-blue-500">Add Demographics Question</span>
                <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
              </CollapsibleTrigger>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger
                className="flex items-center gap-2 w-full p-2 text-left text-sm hover:bg-gray-50 rounded"
                onClick={() => handleAddQuestion("primary_insurance")}
              >
                <CreditCard className="h-4 w-4 text-green-500" />
                <span className="text-green-500">
                  Add Primary Insurance Question
                </span>
                <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
              </CollapsibleTrigger>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger
                className="flex items-center gap-2 w-full p-2 text-left text-sm hover:bg-gray-50 rounded"
                onClick={() => handleAddQuestion("secondary_insurance")}
              >
                <CircleDot className="h-4 w-4 text-purple-500" />
                <span className="text-purple-500">
                  Add Secondary Insurance Question
                </span>
                <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
              </CollapsibleTrigger>
            </Collapsible>
          </div>

          {/* Divider */}
          <div className="border-t my-2" />

          {/* Questions List */}
          <div className="p-2">
            {form.questions.map((question) => (
              <div
                key={question.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                  selectedQuestionId === question.id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedQuestionId(question.id)}
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{question.title}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {questionTypeLabels[question.type]}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateQuestion(question.id);
                    }}
                  >
                    <Copy className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuestion(question.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Question Editor */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedQuestion ? (
            <div className="p-6">
              {/* Question Header */}
              <div className="bg-white rounded-lg border p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#03989E]" />
                    <h2 className="text-lg font-semibold">
                      {questionTypeLabels[selectedQuestion.type]} Question
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Question Options
                    </Button>
                    <Select defaultValue="English">
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Mixed Controls Type Selector */}
                {selectedQuestion.type === "demographics" && (
                  <div className="mb-4">
                    <Label className="text-sm text-gray-600">Mixed Controls</Label>
                    <Select defaultValue="mixed">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mixed">Mixed Controls</SelectItem>
                        <SelectItem value="text">Text Only</SelectItem>
                        <SelectItem value="dropdown">Dropdowns Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Block Instructions */}
                <div className="mb-4">
                  <Label className="text-sm text-gray-600">
                    Block Instructions (optional)
                  </Label>
                  <Input
                    className="mt-1"
                    placeholder="Please enter your information."
                    value={selectedQuestion.instructions || ""}
                    onChange={(e) =>
                      handleQuestionChange("instructions", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Demographics Fields */}
              {selectedQuestion.fields && selectedQuestion.fields.length > 0 && (
                <div className="bg-white rounded-lg border">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Demographics Fields</h3>
                    <button className="text-[#03989E] text-sm flex items-center gap-1">
                      <HelpCircle className="h-4 w-4" />
                      help
                    </button>
                  </div>

                  <div className="divide-y">
                    {selectedQuestion.fields.map((field) => (
                      <div key={field.id} className="p-4">
                        <div className="grid grid-cols-12 gap-4 items-start">
                          {/* Field Name */}
                          <div className="col-span-5">
                            <Label className="text-xs text-gray-500">
                              Field Name
                            </Label>
                            <Input
                              value={field.name}
                              onChange={(e) =>
                                handleFieldChange(field.id, "name", e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Field Type */}
                          <div className="col-span-3">
                            <Label className="text-xs text-gray-500">
                              Field Type
                            </Label>
                            <Select
                              value={field.type}
                              onValueChange={(value) =>
                                handleFieldChange(field.id, "type", value)
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="dropdown">Dropdown</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Required Checkbox */}
                          <div className="col-span-2 pt-6">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={field.required}
                                onCheckedChange={(checked) =>
                                  handleFieldChange(field.id, "required", checked)
                                }
                              />
                              <Label className="text-sm">Required</Label>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <div className="col-span-2 pt-6 flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteField(field.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        {/* Show Options link for dropdown */}
                        {field.type === "dropdown" && (
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-gray-500">Options</span>
                            <button
                              className="text-[#03989E] text-sm hover:underline"
                              onClick={() =>
                                handleShowOptions(field.id, field.options || [])
                              }
                            >
                              Show Options
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Field Button */}
                  <div className="p-4 border-t">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleAddField}
                    >
                      <Plus className="h-4 w-4" />
                      Add Field
                    </Button>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleDuplicateQuestion(selectedQuestion.id)}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <p className="mb-4">Select a question to edit or add a new question</p>
              <Button
                className="bg-[#03989E] hover:bg-[#028a8f] gap-2"
                onClick={() => handleAddQuestion("demographics")}
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Options Dialog */}
      <Dialog open={showOptionsDialog} onOpenChange={setShowOptionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dropdown Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingFieldOptions?.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...editingFieldOptions.options];
                    newOptions[index] = e.target.value;
                    setEditingFieldOptions({
                      ...editingFieldOptions,
                      options: newOptions,
                    });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newOptions = editingFieldOptions.options.filter(
                      (_, i) => i !== index
                    );
                    setEditingFieldOptions({
                      ...editingFieldOptions,
                      options: newOptions,
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                if (editingFieldOptions) {
                  setEditingFieldOptions({
                    ...editingFieldOptions,
                    options: [...editingFieldOptions.options, "New Option"],
                  });
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Add Option
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptionsDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#03989E] hover:bg-[#028a8f]"
              onClick={handleSaveFieldOptions}
            >
              Save Options
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
