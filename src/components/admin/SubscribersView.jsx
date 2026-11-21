'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  Users,
  Calendar,
  CreditCard,
  User,
  X,
  Plus,
  RefreshCcw,
  Check,
  AlertTriangle,
  ChevronRight,
  Shield,
  HelpCircle
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
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  const tone =
    status === 'active' || status === 'Active' || status === 'success'
      ? 'green'
      : status === 'cancelled' || status === 'Cancelled' || status === 'failed' || status === 'Failed'
        ? 'red'
        : status === 'paused' || status === 'Paused' || status === 'pending'
          ? 'amber'
          : 'gray'; // expired

  return (
    <Badge tone={tone} className="capitalize font-semibold">
      {status === 'active' ? 'Active' : status === 'cancelled' ? 'Cancelled' : status === 'paused' ? 'Paused' : status === 'expired' ? 'Expired' : status}
    </Badge>
  );
}

export default function SubscribersView({ data, loading, filters, setFilters, setPage, refresh, notify }) {
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal Actions States
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendDays, setExtendDays] = useState('');
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [newPlanId, setNewPlanId] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const subscribers = data?.subscribers || [];
  const plansList = data?.plansList || [];

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }

  // Load subscriber details when drawer is opened
  async function openDetail(subId) {
    setSelectedSubId(subId);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/subscribers/${subId}`);
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load details');
      setDetailData(payload);
    } catch (err) {
      notify(err.message, 'error');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/subscribers/${selectedSubId}/cancel`, { method: 'POST' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Cancellation failed');
      notify('Subscription cancelled successfully');
      // Reload detail
      openDetail(selectedSubId);
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmittingAction(false);
    }
  }

  async function extendSubscription(e) {
    e.preventDefault();
    if (!extendDays || isNaN(extendDays) || Number(extendDays) <= 0) {
      return notify('Please enter a valid number of days', 'error');
    }
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/subscribers/${selectedSubId}/extend`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ days: Number(extendDays) }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Extension failed');
      notify(`Extended subscription by ${extendDays} days`);
      setExtendOpen(false);
      setExtendDays('');
      // Reload detail
      openDetail(selectedSubId);
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmittingAction(false);
    }
  }

  async function changePlan(e) {
    e.preventDefault();
    if (!newPlanId) return notify('Please select a plan', 'error');
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/subscribers/${selectedSubId}/change-plan`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ planId: newPlanId }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to change plan');
      notify('Plan changed successfully');
      setChangePlanOpen(false);
      setNewPlanId('');
      // Reload detail
      openDetail(selectedSubId);
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmittingAction(false);
    }
  }

  async function refundTransaction(txId, amount) {
    if (!confirm(`Refund transaction ${txId} (Amount: ${inr.format(amount)})?`)) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/refund`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Refund failed');
      notify('Transaction refunded successfully');
      // Reload detail
      openDetail(selectedSubId);
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmittingAction(false);
    }
  }

  function exportCsv() {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.planId) params.set('planId', filters.planId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    params.set('export', 'csv');
    window.open(`/api/admin/subscribers?${params.toString()}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="mx-auto w-full max-w-[1580px] px-4 py-6 pb-28 sm:px-6 lg:pb-8">
      {/* Page Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--admin-muted)]">
          Manage subscribers, view billing history, cancel, extend, or change subscription plans
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
              placeholder="Search subscriber name, email, phone..."
              className="pl-9"
            />
          </div>
          <Select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-44"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
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

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="w-40 text-xs"
              title="Start Date"
            />
            <span className="text-[var(--admin-muted)] text-xs">to</span>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="w-40 text-xs"
              title="End Date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="grid min-h-96 place-items-center">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-4 border-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)]" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[var(--admin-accent)] border-t-[var(--admin-accent)]" />
              </div>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="grid min-h-60 place-items-center text-center p-8">
              <div>
                <Users size={40} className="mx-auto text-[var(--admin-muted)] mb-3" />
                <h3 className="font-semibold text-lg">No subscribers found</h3>
                <p className="text-sm text-[var(--admin-muted)] mt-1">Try adjusting search query or filters</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-soft)]">
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Subscriber</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Plan</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Start Date</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Next Renewal / Expiry</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Status</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Paid Amt</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Payment Method</th>
                    <th className="border-b border-[var(--admin-border)] px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="group hover:bg-[var(--admin-soft)] transition-colors">
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--admin-accent)] text-white font-bold">
                            {sub.userName?.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate max-w-[180px]">{sub.userName}</p>
                            <p className="text-xs text-[var(--admin-muted)] truncate max-w-[180px]">{sub.email}</p>
                            <p className="text-xs text-[var(--admin-muted)]">{sub.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle font-medium">
                        {sub.planName}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle text-[var(--admin-muted)]">
                        {formatDate(sub.startDate)}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle text-[var(--admin-muted)]">
                        {formatDate(sub.nextRenewalDate)}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle font-semibold text-[var(--admin-foreground)]">
                        {inr.format(sub.amountPaid)}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle capitalize text-[var(--admin-muted)]">
                        {sub.paymentMethod}
                      </td>
                      <td className="border-b border-[var(--admin-border)] px-4 py-3.5 align-middle text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openDetail(sub.id)}
                          className="hover:border-[var(--admin-primary)] group-hover:text-[var(--admin-primary)] transition"
                        >
                          Manage <ChevronRight size={14} className="ml-1" />
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

      {/* Subscriber Detail Drawer / Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-5xl w-[min(1120px,calc(100vw-32px))]">
          {detailLoading ? (
            <div className="flex flex-col h-full min-h-[380px]">
              <DialogHeader>
                <DialogTitle>Subscriber Account Details</DialogTitle>
                <DialogDescription>Loading subscriber information and payment logs...</DialogDescription>
              </DialogHeader>
              <div className="flex-1 grid place-items-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)]" />
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[var(--admin-accent)] border-t-[var(--admin-accent)]" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--admin-muted)]">Loading subscriber account & transactions...</p>
                </div>
              </div>
            </div>
          ) : detailData ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--admin-primary)] text-[#031216] font-bold text-lg shadow-sm">
                      {detailData.subscriber?.name?.slice(0, 1)?.toUpperCase() || 'U'}
                    </span>
                    <div>
                      <DialogTitle className="font-display text-2xl font-bold flex items-center gap-3">
                        <span>{detailData.subscriber?.name}</span>
                        <Badge tone={detailData.subscriber?.isPremium ? 'pink' : 'gray'}>
                          {detailData.subscriber?.isPremium ? '★ Premium Member' : 'Free Tier'}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription className="text-xs mt-1">
                        Joined: <span className="text-[var(--admin-foreground)] font-medium">{formatDate(detailData.subscriber?.joinedAt)}</span> · User ID: <span className="font-mono">{detailData.subscriber?.userId}</span>
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <DialogBody className="space-y-6">
                {/* Grid Section */}
                <div className="grid gap-6 md:grid-cols-3">
                  {/* User Info & Subscription Plan details */}
                  <div className="md:col-span-2 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-[var(--admin-border)] bg-[var(--admin-surface)]">
                        <CardHeader className="py-3 px-4 bg-[var(--admin-soft)]/50 border-b border-[var(--admin-border)]">
                          <CardTitle className="text-xs uppercase tracking-wider text-[var(--admin-muted)] flex items-center gap-2">
                            <User size={14} className="text-[var(--admin-primary)]" /> Contact Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2.5 text-sm">
                          <div>
                            <p className="text-xs text-[var(--admin-muted)]">Email Address</p>
                            <p className="font-semibold text-[var(--admin-foreground)] mt-0.5">{detailData.subscriber?.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--admin-muted)]">Phone Number</p>
                            <p className="font-medium text-[var(--admin-foreground)] mt-0.5">{detailData.subscriber?.phone || 'Not provided'}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-[var(--admin-border)] bg-[var(--admin-surface)]">
                        <CardHeader className="py-3 px-4 bg-[var(--admin-soft)]/50 border-b border-[var(--admin-border)]">
                          <CardTitle className="text-xs uppercase tracking-wider text-[var(--admin-muted)] flex items-center gap-2">
                            <Calendar size={14} className="text-[var(--admin-primary)]" /> Subscription Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2.5 text-sm">
                          {detailData.activeSubscription ? (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-[var(--admin-muted)]">Auto-renewal:</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${detailData.activeSubscription.autoRenew ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                                  {detailData.activeSubscription.autoRenew ? 'Enabled (Razorpay)' : 'Disabled'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-[var(--admin-muted)]">Payment Gateway:</span>
                                <span className="text-xs font-semibold uppercase text-[var(--admin-foreground)]">{detailData.activeSubscription.paymentMethod || 'Manual'}</span>
                              </div>
                              {detailData.activeSubscription.razorpaySubscriptionId && (
                                <div>
                                  <p className="text-xs text-[var(--admin-muted)]">Subscription ID</p>
                                  <p className="font-mono text-xs mt-0.5 bg-[var(--admin-soft)] px-2 py-0.5 rounded border border-[var(--admin-border)] text-[var(--admin-foreground)] truncate max-w-[220px]">
                                    {detailData.activeSubscription.razorpaySubscriptionId}
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="py-3 text-center text-xs text-[var(--admin-muted)]">
                              No active subscription currently active.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Active Subscription Details */}
                    {detailData.activeSubscription ? (
                      <Card className="border border-emerald-500/30 shadow-lg shadow-emerald-500/5 bg-emerald-500/[0.03]">
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/15 text-emerald-500 px-3 py-1 rounded-full">
                                Active Plan
                              </span>
                              <h4 className="font-display text-2xl font-bold mt-2 text-[var(--admin-foreground)]">
                                {detailData.activeSubscription.planName}
                              </h4>
                              <p className="text-xs text-[var(--admin-muted)] mt-1">
                                Validity: <span className="text-[var(--admin-foreground)] font-medium">{detailData.activeSubscription.startDate ? formatDate(detailData.activeSubscription.startDate) : ''}</span> to <span className="text-[var(--admin-foreground)] font-medium">{detailData.activeSubscription.endDate ? formatDate(detailData.activeSubscription.endDate) : ''}</span>
                              </p>
                            </div>
                            <div className="text-right sm:border-l border-[var(--admin-border)] sm:pl-6 shrink-0">
                              <p className="text-2xl font-bold text-[var(--admin-foreground)]">{inr.format(detailData.activeSubscription.price || 0)}</p>
                              {detailData.activeSubscription.nextRenewalDate && (
                                <p className="text-xs text-[var(--admin-muted)] mt-1">
                                  Next renewal: {formatDate(detailData.activeSubscription.nextRenewalDate)}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[var(--admin-border)] p-6 text-center text-[var(--admin-muted)] bg-[var(--admin-soft)]/30">
                        <CreditCard className="mx-auto text-[var(--admin-muted)] mb-3" size={32} />
                        <p className="text-sm font-semibold text-[var(--admin-foreground)]">Subscriber is on the Free Tier</p>
                        <p className="text-xs mt-1">Use the actions panel on the right to manually assign or extend a plan.</p>
                      </div>
                    )}

                    {/* Transaction History */}
                    <div>
                      <h4 className="font-bold text-sm mb-3 text-[var(--admin-foreground)] flex items-center gap-2">
                        <CreditCard size={15} className="text-[var(--admin-primary)]" /> Transaction History
                      </h4>
                      <Card className="border-[var(--admin-border)] bg-[var(--admin-surface)] overflow-hidden">
                        <CardContent className="p-0">
                          {detailData.transactions?.length === 0 ? (
                            <p className="text-center text-xs text-[var(--admin-muted)] p-6">No previous billing transactions found</p>
                          ) : (
                            <div className="max-h-64 overflow-y-auto admin-modal-scroll">
                              <table className="w-full text-xs text-left">
                                <thead>
                                  <tr className="bg-[var(--admin-soft)]/60 border-b border-[var(--admin-border)]">
                                    <th className="px-3.5 py-2.5 text-[var(--admin-muted)] font-semibold">Date</th>
                                    <th className="px-3.5 py-2.5 text-[var(--admin-muted)] font-semibold">Plan</th>
                                    <th className="px-3.5 py-2.5 text-[var(--admin-muted)] font-semibold">Txn Reference</th>
                                    <th className="px-3.5 py-2.5 text-[var(--admin-muted)] font-semibold">Amount</th>
                                    <th className="px-3.5 py-2.5 text-[var(--admin-muted)] font-semibold">Status</th>
                                    <th className="px-3.5 py-2.5 text-[var(--admin-muted)] font-semibold text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {detailData.transactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-soft)]/40 transition-colors">
                                      <td className="px-3.5 py-3 font-medium text-[var(--admin-foreground)]">{formatDate(tx.date)}</td>
                                      <td className="px-3.5 py-3 font-semibold text-[var(--admin-foreground)]">{tx.planName}</td>
                                      <td className="px-3.5 py-3 font-mono text-[11px] text-[var(--admin-muted)]">{tx.razorpayPaymentId || 'Pending'}</td>
                                      <td className="px-3.5 py-3 font-bold text-[var(--admin-foreground)]">{inr.format(tx.amount)}</td>
                                      <td className="px-3.5 py-3"><StatusBadge status={tx.status} /></td>
                                      <td className="px-3.5 py-3 text-right">
                                        {tx.status === 'success' ? (
                                          <button
                                            type="button"
                                            disabled={submittingAction}
                                            onClick={() => refundTransaction(tx.id, tx.amount)}
                                            className="text-rose-500 hover:text-rose-400 font-bold hover:underline"
                                          >
                                            Refund
                                          </button>
                                        ) : tx.status === 'refunded' ? (
                                          <span className="text-[var(--admin-muted)] text-[11px]">Refunded {inr.format(tx.refundedAmount)}</span>
                                        ) : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Actions Panel */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--admin-muted)]">Administrative Actions</h4>

                    <Card className="border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                      <CardContent className="p-4 space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setExtendOpen(true)}
                          className="w-full justify-start border-[var(--admin-border)] text-left hover:border-[var(--admin-primary)] transition-all font-semibold"
                        >
                          <Plus size={16} className="mr-2 text-[var(--admin-primary)]" /> Extend Subscription (Days)
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setChangePlanOpen(true)}
                          className="w-full justify-start border-[var(--admin-border)] text-left hover:border-[var(--admin-primary)] transition-all font-semibold"
                        >
                          <RefreshCcw size={16} className="mr-2 text-[var(--admin-primary)]" /> Manually Change Plan
                        </Button>

                        {detailData.activeSubscription && detailData.activeSubscription.status === 'active' && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={submittingAction}
                            onClick={cancelSubscription}
                            className="w-full text-rose-500 hover:bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50 mt-2 font-semibold"
                          >
                            Cancel Active Subscription
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    {/* Plan History list */}
                    <div>
                      <h5 className="font-bold text-xs text-[var(--admin-muted)] uppercase tracking-wider mb-2.5">Subscription Timeline</h5>
                      <div className="space-y-2 max-h-56 overflow-y-auto admin-modal-scroll pr-1">
                        {detailData.history?.length === 0 ? (
                          <p className="text-xs text-[var(--admin-muted)] py-3 text-center">No previous plans</p>
                        ) : detailData.history?.map((h) => (
                          <div key={h.id} className="p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/50 text-xs flex items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-[var(--admin-foreground)]">{h.planName}</p>
                              <p className="text-[10px] text-[var(--admin-muted)] mt-0.5">
                                {formatDate(h.startDate)} - {formatDate(h.endDate)}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <StatusBadge status={h.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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

      {/* Action Dialogs */}
      {/* Extend Days Dialog */}
      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent className="max-w-lg w-[min(540px,calc(100vw-32px))]">
          <form onSubmit={extendSubscription} className="flex flex-col h-full">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                Extend Plan Manually
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Directly add duration days to the subscriber. This extends their expiration date and maintains premium access.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Days to Add <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g., 30"
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                  className="text-base font-semibold"
                />
              </div>

              {/* Quick Preset Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-[var(--admin-muted)] font-medium">Quick presets:</span>
                <div className="flex flex-wrap gap-2">
                  {[7, 30, 90, 180, 365].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setExtendDays(String(preset))}
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-[var(--admin-border)] bg-[var(--admin-soft)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] transition-colors"
                    >
                      +{preset} Days
                    </button>
                  ))}
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setExtendOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingAction || !extendDays}>
                {submittingAction ? 'Extending...' : 'Confirm Extension'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
        <DialogContent className="max-w-lg w-[min(560px,calc(100vw-32px))]">
          <form onSubmit={changePlan} className="flex flex-col h-full">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                Upgrade / Reassign Plan
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Select an active subscription plan to assign to this member. Subscription dates will recalculate starting today.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Choose New Plan <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newPlanId}
                  onChange={(e) => setNewPlanId(e.target.value)}
                  required
                  className="bg-[var(--admin-surface)] text-[var(--admin-foreground)] border-[var(--admin-border)] h-11 text-sm"
                >
                  <option value="">-- Select Subscription Plan --</option>
                  {detailData?.plansList?.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name} — {inr.format(p.price)} ({p.duration} days)
                    </option>
                  ))}
                </Select>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setChangePlanOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingAction || !newPlanId}>
                {submittingAction ? 'Updating...' : 'Confirm Plan Change'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
