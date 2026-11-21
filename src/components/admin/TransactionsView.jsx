'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  CreditCard,
  Calendar,
  X,
  Plus,
  RefreshCcw,
  Check,
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Input, Select } from '@/components/ui/input';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function formatDate(value) {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  const tone =
    status === 'success' || status === 'Success'
      ? 'green'
      : status === 'failed' || status === 'Failed'
        ? 'red'
        : status === 'refunded' || status === 'Refunded'
          ? 'cyan'
          : 'amber'; // pending

  return (
    <Badge tone={tone} className="capitalize font-semibold">
      {status}
    </Badge>
  );
}

export default function TransactionsView({ data, loading, filters, setFilters, setPage, refresh, notify }) {
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const transactions = data?.transactions || [];
  const plansList = data?.plansList || [];

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }

  async function openDetail(txId) {
    setSelectedTxId(txId);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}`);
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load transaction details');
      setDetailData(payload);
    } catch (err) {
      notify(err.message, 'error');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  function exportCsv() {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.planId) params.set('planId', filters.planId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.minAmount) params.set('minAmount', filters.minAmount);
    if (filters.maxAmount) params.set('maxAmount', filters.maxAmount);
    params.set('export', 'csv');
    window.open(`/api/admin/transactions?${params.toString()}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="mx-auto w-full max-w-[1580px] px-4 py-6 pb-28 sm:px-6 lg:pb-8">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--admin-muted)]">
          Audit payments, track active gateways, view failed checkout states, and fetch Razorpay order details.
        </p>
        <Button type="button" variant="outline" onClick={exportCsv} className="border-[var(--admin-border)] hover:bg-[var(--admin-soft)]">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]" size={16} />
            <Input
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search Payment/Order ID, user details..."
              className="pl-9"
            />
          </div>

          <Select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-44"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </Select>

          <Select
            value={filters.planId}
            onChange={(e) => updateFilter('planId', e.target.value)}
            className="w-48"
          >
            <option value="">All Plans</option>
            {plansList.map((plan) => (
              <option key={plan._id || plan.id} value={plan._id || plan.id}>
                {plan.name}
              </option>
            ))}
          </Select>

          {/* Amount range filters */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min ₹"
              value={filters.minAmount}
              onChange={(e) => updateFilter('minAmount', e.target.value)}
              className="w-24 text-xs"
              title="Min Amount"
            />
            <span className="text-[var(--admin-muted)] text-xs">to</span>
            <Input
              type="number"
              placeholder="Max ₹"
              value={filters.maxAmount}
              onChange={(e) => updateFilter('maxAmount', e.target.value)}
              className="w-24 text-xs"
              title="Max Amount"
            />
          </div>

          {/* Date range filters */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="w-36 text-xs"
              title="Start Date"
            />
            <span className="text-[var(--admin-muted)] text-xs">to</span>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="w-36 text-xs"
              title="End Date"
            />
          </div>
        </CardContent>
      </Card>

      {/* List Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="grid min-h-96 place-items-center">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-4 border-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)]" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[var(--admin-accent)] border-t-[var(--admin-accent)]" />
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="grid min-h-60 place-items-center text-center p-8">
              <div>
                <CreditCard size={40} className="mx-auto text-[var(--admin-muted)] mb-3" />
                <h3 className="font-semibold text-lg">No transactions found</h3>
                <p className="text-sm text-[var(--admin-muted)] mt-1">Adjust filters or double check search queries</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-soft)]">
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Payment ID</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Order ID</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">User</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Plan</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Amount</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Payment Method</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Date & Time</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Status</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="group hover:bg-[var(--admin-soft)] transition-colors">
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle font-mono text-xs">
                        {tx.razorpayPaymentId || <span className="text-[var(--admin-muted)] text-[10px]">Pending Verification</span>}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle font-mono text-xs">
                        {tx.razorpayOrderId || 'N/A'}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle font-semibold text-[var(--admin-foreground)]">
                        <div>
                          <p>{tx.userName}</p>
                          <p className="text-[10px] text-[var(--admin-muted)] font-normal">{tx.email}</p>
                        </div>
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle text-[var(--admin-muted)] font-medium">
                        {tx.planName}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle font-semibold">
                        {inr.format(tx.amount)}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle capitalize text-[var(--admin-muted)]">
                        {tx.paymentMethod}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle text-[var(--admin-muted)] text-xs">
                        {formatDate(tx.date)}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetail(tx.id)}
                          className="hover:text-[var(--admin-primary)]"
                          title="View Info"
                        >
                          <Info size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="p-4 border-t border-[var(--admin-border)]">
            <div className="flex items-center justify-between gap-3 text-sm text-[var(--admin-muted)]">
              <span>
                Page {data?.pagination?.page} of {data?.pagination?.totalPages} · {data?.pagination?.total} records
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={data?.pagination?.page <= 1}
                  onClick={() => setPage(data.pagination.page - 1)}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={data?.pagination?.page >= data?.pagination?.totalPages}
                  onClick={() => setPage(data.pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction details modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl w-[min(900px,calc(100vw-32px))]">
          {detailLoading ? (
            <div className="flex flex-col h-full min-h-[320px]">
              <DialogHeader>
                <DialogTitle>Transaction Breakdown</DialogTitle>
                <DialogDescription>Loading billing breakdown and gateway responses...</DialogDescription>
              </DialogHeader>
              <div className="flex-1 grid place-items-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-11 w-11">
                    <div className="absolute inset-0 rounded-full border-4 border-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)]" />
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[var(--admin-accent)] border-t-[var(--admin-accent)]" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--admin-muted)]">Loading transaction breakdown...</p>
                </div>
              </div>
            </div>
          ) : detailData?.transaction ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="font-display text-xl font-bold flex items-center gap-3">
                      <span>Transaction Breakdown</span>
                      <StatusBadge status={detailData.transaction.status} />
                    </DialogTitle>
                    <DialogDescription className="text-xs pt-1">
                      Reference ID: <span className="font-mono text-[var(--admin-foreground)]">{detailData.transaction.id}</span> · Timestamp: {formatDate(detailData.transaction.date)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <DialogBody className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div className="rounded-xl border border-[var(--admin-border)] p-4 space-y-3 bg-[var(--admin-soft)]/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-primary)]">Customer Information</p>
                    <div>
                      <p className="text-xs text-[var(--admin-muted)]">Subscriber Name</p>
                      <p className="font-semibold text-sm text-[var(--admin-foreground)] mt-0.5">{detailData.transaction.userName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--admin-muted)]">Email & Phone</p>
                      <p className="font-medium text-sm text-[var(--admin-foreground)] mt-0.5">{detailData.transaction.email}</p>
                      {detailData.transaction.phone && (
                        <p className="text-xs text-[var(--admin-muted)] mt-0.5">{detailData.transaction.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--admin-border)] p-4 space-y-3 bg-[var(--admin-soft)]/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-primary)]">Billing & Plan Info</p>
                    <div>
                      <p className="text-xs text-[var(--admin-muted)]">Assigned Plan</p>
                      <p className="font-semibold text-sm text-[var(--admin-foreground)] mt-0.5">{detailData.transaction.planName}</p>
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <div>
                        <p className="text-xs text-[var(--admin-muted)]">Amount Charged</p>
                        <p className="text-xl font-bold text-[var(--admin-foreground)]">
                          {inr.format(detailData.transaction.amount)}
                        </p>
                      </div>
                      {detailData.transaction.discountPercent > 0 && (
                        <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          {detailData.transaction.discountPercent}% Saved
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {detailData.transaction.refundId && (
                  <div className="rounded-xl border border-cyan-500/30 p-4 bg-cyan-500/5 text-sm flex items-center justify-between">
                    <div>
                      <p className="font-bold text-cyan-400">Refund Active</p>
                      <p className="text-xs text-[var(--admin-muted)] mt-1 font-mono">Refund ID: {detailData.transaction.refundId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-cyan-400">{inr.format(detailData.transaction.refundedAmount)}</p>
                    </div>
                  </div>
                )}

                {/* Razorpay API Order details if available */}
                {detailData.razorpayDetails ? (
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--admin-muted)]">Live Gateway Response (Razorpay)</h4>
                    <div className="rounded-xl border border-[var(--admin-border)] overflow-hidden">
                      <pre className="bg-[#071217] text-cyan-200 text-[11px] p-4 overflow-x-auto max-h-60 rounded-xl font-mono leading-relaxed">
                        {JSON.stringify(detailData.razorpayDetails, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : detailData.transaction.razorpayPaymentId ? (
                  <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 flex items-start gap-2.5">
                    <span className="font-bold">✓ Payment Verified</span>
                    <span>Order and payment processed securely via Razorpay.</span>
                  </div>
                ) : null}
              </DialogBody>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
