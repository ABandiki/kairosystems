'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Printer, Send, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

// Mock invoice data - in production this would come from API
const mockInvoice = {
  id: 'INV-2026-001',
  patientName: 'Tapiwa Madziva',
  patientId: 'pat-001',
  patientEmail: 'tapiwa.madziva@email.co.zw',
  patientPhone: '+263 77 123 4567',
  patientAddress: '45 Samora Machel Avenue, Avondale, Harare',
  issueDate: '2026-02-01',
  dueDate: '2026-03-01',
  amount: 150.00,
  status: 'PAID',
  paymentMethod: 'Card',
  paymentDate: '2026-02-15',
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
  subtotal: 150.00,
  tax: 0,
  discount: 0,
  total: 150.00,
  notes: 'Thank you for your payment.',
  createdAt: '2026-02-01T10:30:00Z',
  updatedAt: '2026-02-15T14:22:00Z',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  PAID: { bg: 'bg-green-100', text: 'text-green-800' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  OVERDUE: { bg: 'bg-red-100', text: 'text-red-800' },
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function InvoiceViewPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  // In production, fetch invoice by ID
  const invoice = mockInvoice;

  const handleEdit = () => {
    router.push(`/billing/${invoiceId}/edit`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    // Send invoice to patient email
    alert('Invoice sent to patient email!');
  };

  const handleMarkPaid = () => {
    // Mark invoice as paid
    alert('Invoice marked as paid!');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      router.push('/billing');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{invoice.id}</h1>
              <Badge
                className={`${statusColors[invoice.status]?.bg} ${statusColors[invoice.status]?.text} border-0`}
              >
                {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
              </Badge>
            </div>
            <p className="text-gray-500">
              Created on {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status !== 'PAID' && (
            <Button variant="outline" onClick={handleMarkPaid}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          )}
          <Button variant="outline" onClick={handleSend}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Invoice Details */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Bill To */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Bill To</h3>
                <p className="font-semibold text-gray-900">{invoice.patientName}</p>
                <p className="text-gray-600">{invoice.patientEmail}</p>
                <p className="text-gray-600">{invoice.patientPhone}</p>
                <p className="text-gray-600">{invoice.patientAddress}</p>
              </div>

              {/* Invoice Info */}
              <div className="text-right">
                <div className="space-y-1">
                  <div className="flex justify-end gap-4">
                    <span className="text-gray-500">Invoice Number:</span>
                    <span className="font-medium">{invoice.id}</span>
                  </div>
                  <div className="flex justify-end gap-4">
                    <span className="text-gray-500">Issue Date:</span>
                    <span className="font-medium">
                      {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-end gap-4">
                    <span className="text-gray-500">Due Date:</span>
                    <span className="font-medium">
                      {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {invoice.paymentDate && (
                    <div className="flex justify-end gap-4">
                      <span className="text-gray-500">Payment Date:</span>
                      <span className="font-medium">
                        {format(new Date(invoice.paymentDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {invoice.paymentMethod && (
                    <div className="flex justify-end gap-4">
                      <span className="text-gray-500">Payment Method:</span>
                      <span className="font-medium">{invoice.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-gray-500">{item.code}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="p-6 border-t space-y-2">
              <div className="flex justify-end items-center gap-8">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium w-24 text-right">${invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-end items-center gap-8">
                  <span className="text-gray-600">Tax:</span>
                  <span className="w-24 text-right">${invoice.tax.toFixed(2)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-end items-center gap-8">
                  <span className="text-gray-600">Discount:</span>
                  <span className="w-24 text-right text-red-600">-${invoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-end items-center gap-8 pt-2 border-t">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-bold text-lg w-24 text-right">${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
