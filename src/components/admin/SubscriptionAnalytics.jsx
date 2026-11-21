'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  BarChart3,
  Calendar,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const chartColors = ['#00BCD4', '#FF1F8F', '#FFB21F', '#16A34A', '#64748B'];
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function compactNumber(value) {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);
}

export default function SubscriptionAnalytics({ notify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/analytics/subscriptions');
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load subscription analytics');
        if (active) setData(payload.data);
      } catch (err) {
        if (active) notify(err.message, 'error');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [notify]);

  if (loading) {
    return (
      <div className="grid min-h-[400px] place-items-center">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)]" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[var(--admin-accent)] border-t-[var(--admin-accent)]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 border border-dashed border-[var(--admin-border)] rounded-xl">
        <ShieldAlert className="mx-auto text-rose-500 mb-2" size={32} />
        <p className="text-sm font-semibold">Failed to populate analytics</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Active Subscribers', value: compactNumber(data.activeSubscribersCount), icon: Users, desc: 'Currently active premium plans' },
    { label: 'Revenue This Month', value: inr.format(data.revenue.thisMonth), icon: CreditCard, desc: `Prev month: ${inr.format(data.revenue.lastMonth)}` },
    { label: 'Total Revenue', value: inr.format(data.revenue.total), icon: BarChart3, desc: 'Accumulated gateway billing' },
    { label: 'Churn Rate', value: `${data.churn.rate}%`, icon: ShieldAlert, desc: `${data.churn.cancellations} cancelled this month` },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--admin-muted)]">{kpi.label}</p>
                    <p className="mt-3 font-display text-3xl font-semibold">{kpi.value}</p>
                    <p className="text-[11px] text-[var(--admin-muted)] mt-1.5">{kpi.desc}</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-[8px] bg-[var(--admin-soft)] text-[var(--admin-primary)]">
                    <Icon size={21} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* New Signups breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriber Signups Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-3 text-center">
          <div className="p-4 rounded-lg bg-[var(--admin-soft)] border border-[var(--admin-border)]">
            <p className="text-xs uppercase tracking-wider text-[var(--admin-muted)]">Today</p>
            <p className="text-3xl font-bold mt-2 text-[var(--admin-primary)]">+{data.newSubscribers.today}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--admin-soft)] border border-[var(--admin-border)]">
            <p className="text-xs uppercase tracking-wider text-[var(--admin-muted)]">This Week</p>
            <p className="text-3xl font-bold mt-2 text-[var(--admin-accent)]">+{data.newSubscribers.thisWeek}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--admin-soft)] border border-[var(--admin-border)]">
            <p className="text-xs uppercase tracking-wider text-[var(--admin-muted)]">This Month</p>
            <p className="text-3xl font-bold mt-2 text-emerald-500">+{data.newSubscribers.thisMonth}</p>
          </div>
        </CardContent>
      </Card>

      {/* Charts section */}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        {/* Monthly Revenue Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full min-w-0">
              {data.monthlyRevenue?.length === 0 ? (
                <div className="h-full grid place-items-center text-xs text-[var(--admin-muted)]">No billing data found</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                    <XAxis dataKey="month" stroke="var(--admin-muted)" fontSize={12} />
                    <YAxis stroke="var(--admin-muted)" fontSize={12} />
                    <Tooltip formatter={(value) => inr.format(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="var(--admin-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Plan-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full min-w-0">
              {data.planDistribution?.length === 0 ? (
                <div className="h-full grid place-items-center text-xs text-[var(--admin-muted)]">No plans distributed yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.planDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={4}
                    >
                      {data.planDistribution.map((_, index) => (
                        <Cell key={index} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
