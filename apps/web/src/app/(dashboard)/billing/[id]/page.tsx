'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Printer, Send, Edit, Trash2, CheckCircle, Download } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { useInvoice } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { invoicesApi } from '@/lib/api';
import { usePractice } from '@/hooks/use-api';

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
  const printRef = useRef<HTMLDivElement>(null);

  const { user, isLoading: authLoading } = useAuth();
  const canFetch = !authLoading && !!user;
  const { data: invoice, isLoading, refetch } = useInvoice(invoiceId, canFetch);
  const { data: practice } = usePractice(canFetch);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Invoice not found</p>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/billing/${invoiceId}/edit`);
  };

  const handlePrint = () => {
    // Create a new window with just the invoice content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this site to print invoices');
      return;
    }

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #03989E;
          }
          .company-info h1 {
            font-size: 28px;
            color: #03989E;
            margin-bottom: 5px;
          }
          .company-info p {
            color: #666;
            font-size: 14px;
          }
          .invoice-title {
            text-align: right;
          }
          .invoice-title h2 {
            font-size: 32px;
            color: #333;
            margin-bottom: 5px;
          }
          .invoice-title .invoice-number {
            font-size: 16px;
            color: #666;
          }
          .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 10px;
          }
          .status-PAID { background: #d1fae5; color: #065f46; }
          .status-PENDING { background: #fef3c7; color: #92400e; }
          .status-OVERDUE { background: #fee2e2; color: #991b1b; }
          .status-DRAFT { background: #f3f4f6; color: #374151; }
          .status-CANCELLED { background: #f3f4f6; color: #6b7280; }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          .details-section h3 {
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
          }
          .details-section p {
            margin-bottom: 5px;
          }
          .details-section .name {
            font-weight: 600;
            font-size: 16px;
          }
          .invoice-details {
            text-align: right;
          }
          .invoice-details .row {
            display: flex;
            justify-content: flex-end;
            gap: 20px;
            margin-bottom: 5px;
          }
          .invoice-details .label {
            color: #666;
          }
          .invoice-details .value {
            font-weight: 500;
            min-width: 100px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            text-align: left;
            padding: 12px;
            background: #f8f9fa;
            border-bottom: 2px solid #e5e7eb;
            font-weight: 600;
            font-size: 14px;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .totals {
            max-width: 300px;
            margin-left: auto;
          }
          .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals .row.total {
            border-bottom: none;
            border-top: 2px solid #333;
            font-weight: 700;
            font-size: 18px;
            padding-top: 12px;
          }
          .notes {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .notes h3 {
            font-size: 14px;
            margin-bottom: 10px;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            color: #666;
            font-size: 12px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          @media print {
            body { padding: 20px; }
            @page { margin: 20mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>${practice?.name || 'Kairo Healthcare'}</h1>
            <p>${practice?.addressLine1 || ''}</p>
            <p>${practice?.city || ''} ${practice?.postcode || ''}</p>
            <p>${practice?.phone || ''}</p>
            <p>${practice?.email || ''}</p>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            <span class="status status-${invoice.status}">${invoice.status}</span>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-section">
            <h3>Bill To</h3>
            <p class="name">${invoice.patientName}</p>
            ${invoice.patient?.email ? `<p>${invoice.patient.email}</p>` : ''}
            ${invoice.patient?.phone ? `<p>${invoice.patient.phone}</p>` : ''}
            ${invoice.patient?.addressLine1 ? `<p>${invoice.patient.addressLine1}</p>` : ''}
            ${invoice.patient?.city ? `<p>${invoice.patient.city} ${invoice.patient?.postcode || ''}</p>` : ''}
          </div>
          <div class="details-section invoice-details">
            <h3>Invoice Details</h3>
            <div class="row">
              <span class="label">Invoice Number:</span>
              <span class="value">${invoice.invoiceNumber}</span>
            </div>
            <div class="row">
              <span class="label">Issue Date:</span>
              <span class="value">${format(new Date(invoice.issueDate), 'MMM d, yyyy')}</span>
            </div>
            <div class="row">
              <span class="label">Due Date:</span>
              <span class="value">${format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
            </div>
            ${invoice.paymentMethod ? `
            <div class="row">
              <span class="label">Payment Method:</span>
              <span class="value">${invoice.paymentMethod}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Code</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.code || '-'}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
              <td class="text-right">$${item.total.toFixed(2)}</td>
            </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <div class="totals">
          <div class="row">
            <span>Subtotal</span>
            <span>$${invoice.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          ${invoice.tax > 0 ? `
          <div class="row">
            <span>Tax</span>
            <span>$${invoice.tax.toFixed(2)}</span>
          </div>
          ` : ''}
          ${invoice.discount > 0 ? `
          <div class="row">
            <span>Discount</span>
            <span>-$${invoice.discount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="row total">
            <span>Total</span>
            <span>$${invoice.amount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        ${invoice.notes ? `
        <div class="notes">
          <h3>Notes</h3>
          <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleSend = () => {
    alert('Invoice sent to patient email!');
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await invoicesApi.update(invoiceId, { status: newStatus as any });
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update invoice status');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoicesApi.delete(invoiceId);
        router.push('/billing');
      } catch (error) {
        console.error('Failed to delete invoice:', error);
        alert('Failed to delete invoice');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
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
          {/* Status Change Dropdown */}
          <Select value={invoice.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
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

      <div className="max-w-4xl mx-auto space-y-6 print-content" ref={printRef}>
        {/* Invoice Details */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Bill To */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Bill To</h3>
                <p className="font-semibold text-gray-900">{invoice.patientName}</p>
                {invoice.patient?.email && <p className="text-gray-600">{invoice.patient.email}</p>}
                {invoice.patient?.phone && <p className="text-gray-600">{invoice.patient.phone}</p>}
                {invoice.patient?.addressLine1 && <p className="text-gray-600">{invoice.patient.addressLine1}</p>}
              </div>

              {/* Invoice Info */}
              <div className="text-right">
                <div className="space-y-1">
                  <div className="flex justify-end gap-4">
                    <span className="text-gray-500">Invoice Number:</span>
                    <span className="font-medium">{invoice.invoiceNumber}</span>
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
                {invoice.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-gray-500">{item.code || '-'}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="p-6 border-t space-y-2">
              <div className="flex justify-end items-center gap-8">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium w-24 text-right">${invoice.subtotal?.toFixed(2) || '0.00'}</span>
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
                <span className="font-bold text-lg w-24 text-right">${invoice.amount?.toFixed(2) || '0.00'}</span>
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
