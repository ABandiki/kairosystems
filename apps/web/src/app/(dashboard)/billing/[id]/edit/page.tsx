'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePatients } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';

interface InvoiceItem {
  id: string;
  description: string;
  code: string;
  quantity: number;
  unitPrice: number;
}

// Mock invoice data - in production this would come from API
const mockInvoice = {
  id: 'INV-2026-001',
  patientId: 'pat-001',
  appointmentId: '',
  issueDate: '2026-02-01',
  dueDate: '2026-03-01',
  paymentMethod: 'Card',
  items: [
    {
      id: '1',
      description: 'GP Consultation',
      code: 'GP-CON',
      quantity: 1,
      unitPrice: 85.00,
    },
    {
      id: '2',
      description: 'Blood Test',
      code: 'LAB-001',
      quantity: 1,
      unitPrice: 45.00,
    },
    {
      id: '3',
      description: 'Prescription Fee',
      code: 'RX-001',
      quantity: 1,
      unitPrice: 20.00,
    },
  ],
  tax: 0,
  discount: 0,
  notes: 'Thank you for your payment.',
};

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  const canFetch = !authLoading && !!user;
  const { data: patientsData } = usePatients({}, canFetch);

  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Load invoice data on mount
  useEffect(() => {
    // In production, fetch invoice by ID
    const invoice = mockInvoice;
    setPatientId(invoice.patientId);
    setAppointmentId(invoice.appointmentId);
    setIssueDate(invoice.issueDate);
    setDueDate(invoice.dueDate);
    setPaymentMethod(invoice.paymentMethod);
    setInvoiceNumber(invoice.id);
    setNotes(invoice.notes);
    setTax(invoice.tax);
    setDiscount(invoice.discount);
    setItems(invoice.items);
  }, [invoiceId]);

  const patients = patientsData?.data || [];

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        code: '',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const total = subtotal + tax - discount;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In production, this would call an API to update the invoice
      console.log('Updating invoice:', {
        id: invoiceId,
        patientId,
        appointmentId,
        issueDate,
        dueDate,
        paymentMethod,
        invoiceNumber,
        notes,
        items,
        subtotal,
        tax,
        discount,
        total,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate back to invoice view
      router.push(`/billing/${invoiceId}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/billing/${invoiceId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
          <p className="text-gray-500">{invoiceNumber}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Patient & Appointment Selection */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="patient">Patient*</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger id="patient" className="mt-1">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="appointment">Related Appointment</Label>
                <Select value={appointmentId} onValueChange={setAppointmentId}>
                  <SelectTrigger id="appointment" className="mt-1">
                    <SelectValue placeholder="Select Appointment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No appointment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="issueDate">Issue Date*</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date*</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Payment Method & Invoice Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="paymentMethod">Payment Method*</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod" className="mt-1">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number*</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-1"
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Invoice Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 mb-2 text-sm font-medium text-gray-500 uppercase">
              <div className="col-span-4">Description*</div>
              <div className="col-span-2">Code</div>
              <div className="col-span-2">Quantity*</div>
              <div className="col-span-2">Unit Price*</div>
              <div className="col-span-1 text-right">Total</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, 'description', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Service code"
                      value={item.code}
                      onChange={(e) => updateItem(item.id, 'code', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-7"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="col-span-1 text-right font-medium">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                  <div className="col-span-1 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-end items-center gap-8">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium w-24 text-right">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-end items-center gap-8">
                <span className="text-gray-600">Tax:</span>
                <div className="w-24">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-6 h-8 text-right"
                      value={tax}
                      onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-8">
                <span className="text-gray-600">Discount:</span>
                <div className="w-24">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-6 h-8 text-right"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-8 pt-2 border-t">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-bold text-lg w-24 text-right">${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or special instructions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !patientId}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
