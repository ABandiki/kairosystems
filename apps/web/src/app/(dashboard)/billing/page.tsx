'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  Filter,
  MoreHorizontal,
  Eye,
  Printer,
  Send,
  Trash2,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

// Mock invoice data - in production this would come from API
const mockInvoices = [
  {
    id: 'INV-2026-001',
    patientName: 'Tapiwa Madziva',
    patientId: 'pat-001',
    issueDate: '2026-02-01',
    dueDate: '2026-03-01',
    amount: 150.00,
    status: 'PAID',
    paymentMethod: 'Card',
  },
  {
    id: 'INV-2026-002',
    patientName: 'Nyasha Chikowore',
    patientId: 'pat-002',
    issueDate: '2026-02-01',
    dueDate: '2026-03-01',
    amount: 85.00,
    status: 'PENDING',
    paymentMethod: null,
  },
  {
    id: 'INV-2026-003',
    patientName: 'Farai Zvobgo',
    patientId: 'pat-003',
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    amount: 220.00,
    status: 'OVERDUE',
    paymentMethod: null,
  },
  {
    id: 'INV-2026-004',
    patientName: 'Chiedza Mangwana',
    patientId: 'pat-004',
    issueDate: '2026-02-02',
    dueDate: '2026-03-02',
    amount: 95.00,
    status: 'DRAFT',
    paymentMethod: null,
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  PAID: { bg: 'bg-green-100', text: 'text-green-800' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  OVERDUE: { bg: 'bg-red-100', text: 'text-red-800' },
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function BillingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [showMonthlyStatement, setShowMonthlyStatement] = useState(false);

  // Calculate stats
  const billedThisMonth = mockInvoices
    .filter(inv => inv.issueDate.startsWith('2026-02'))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const collectedThisMonth = mockInvoices
    .filter(inv => inv.status === 'PAID' && inv.issueDate.startsWith('2026-02'))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstandingBalance = mockInvoices
    .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Monthly statement calculations
  const getMonthlyStatementData = (month: string) => {
    const monthInvoices = mockInvoices.filter(inv => inv.issueDate.startsWith(month));
    const totalBilled = monthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = monthInvoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0);
    const totalPending = monthInvoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.amount, 0);
    const totalOverdue = monthInvoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.amount, 0);
    const invoiceCount = monthInvoices.length;
    const paidCount = monthInvoices.filter(inv => inv.status === 'PAID').length;
    const pendingCount = monthInvoices.filter(inv => inv.status === 'PENDING').length;
    const overdueCount = monthInvoices.filter(inv => inv.status === 'OVERDUE').length;

    return {
      month,
      totalBilled,
      totalPaid,
      totalPending,
      totalOverdue,
      invoiceCount,
      paidCount,
      pendingCount,
      overdueCount,
      collectionRate: totalBilled > 0 ? ((totalPaid / totalBilled) * 100).toFixed(1) : '0',
      invoices: monthInvoices,
    };
  };

  const monthlyStatement = getMonthlyStatementData(selectedMonth);

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrintStatement = () => {
    window.print();
  };

  const handleDownloadStatement = () => {
    // In production, this would generate a PDF
    alert(`Downloading monthly statement for ${getMonthName(selectedMonth)}`);
  };

  // Filter invoices
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    const matchesDateRange =
      (!startDate || invoice.issueDate >= startDate) &&
      (!endDate || invoice.issueDate <= endDate);

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const handleCreateInvoice = () => {
    router.push('/billing/new');
  };

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/billing/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/billing/${invoiceId}/edit`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-500">Manage invoices, payments, and billing records</p>
        </div>
        <Button onClick={handleCreateInvoice}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Billed This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${billedThisMonth.toFixed(2)}
                </p>
              </div>
              <div className="text-teal-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Collected This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${collectedThisMonth.toFixed(2)}
                </p>
              </div>
              <div className="text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Outstanding Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${outstandingBalance.toFixed(2)}
                </p>
              </div>
              <div className="text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Statement Section */}
      <Card>
        <CardContent className="p-0">
          <button
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            onClick={() => setShowMonthlyStatement(!showMonthlyStatement)}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Monthly Statement</h3>
                <p className="text-sm text-gray-500">View and export monthly billing summary</p>
              </div>
            </div>
            {showMonthlyStatement ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showMonthlyStatement && (
            <div className="border-t px-6 pb-6">
              {/* Month Selector */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Select Month:</label>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-48"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrintStatement}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadStatement}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Statement Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Statement for {getMonthName(selectedMonth)}
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border">
                    <p className="text-sm text-gray-500">Total Billed</p>
                    <p className="text-2xl font-bold text-gray-900">${monthlyStatement.totalBilled.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{monthlyStatement.invoiceCount} invoices</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <p className="text-sm text-gray-500">Total Collected</p>
                    <p className="text-2xl font-bold text-green-600">${monthlyStatement.totalPaid.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{monthlyStatement.paidCount} paid</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">${monthlyStatement.totalPending.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{monthlyStatement.pendingCount} pending</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <p className="text-sm text-gray-500">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">${monthlyStatement.totalOverdue.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{monthlyStatement.overdueCount} overdue</p>
                  </div>
                </div>

                {/* Collection Rate */}
                <div className="bg-white rounded-lg p-4 border mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Collection Rate</span>
                    <span className="text-sm font-bold text-gray-900">{monthlyStatement.collectionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${monthlyStatement.collectionRate}%` }}
                    />
                  </div>
                </div>

                {/* Invoices in this month */}
                {monthlyStatement.invoices.length > 0 ? (
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b">
                      <h5 className="font-medium text-gray-700">Invoices This Month</h5>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyStatement.invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>{invoice.patientName}</TableCell>
                            <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${statusColors[invoice.status]?.bg} ${statusColors[invoice.status]?.text} border-0`}
                              >
                                {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No invoices for this month</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Filter & Search</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Invoices
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by invoice number, patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                &nbsp;
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">No invoices found</p>
              <p className="text-gray-500">Get started by creating your first invoice.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.patientName}</TableCell>
                    <TableCell>{format(new Date(invoice.issueDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="font-medium">${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusColors[invoice.status]?.bg} ${statusColors[invoice.status]?.text} border-0`}
                      >
                        {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditInvoice(invoice.id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" />
                            Send to Patient
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
