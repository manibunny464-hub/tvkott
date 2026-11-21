import { requireAdmin } from '@/lib/admin/auth';
import { getRevenueData } from '@/lib/admin/data';

function toCsv(transactions) {
  const rows = [
    ['User', 'Plan', 'Amount', 'Payment Method', 'Date', 'Status'],
    ...transactions.map((item) => [
      item.user,
      item.plan,
      item.amount,
      item.paymentMethod,
      item.date,
      item.status,
    ]),
  ];

  return rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const data = await getRevenueData({
    page: Number(searchParams.get('page') || 1),
    limit: Number(searchParams.get('limit') || 10),
    status: searchParams.get('status') || '',
    method: searchParams.get('method') || '',
  });

  if (searchParams.get('export') === 'csv') {
    return new Response(toCsv(data.transactions), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="chirpii-transactions.csv"',
      },
    });
  }

  return Response.json({ success: true, ...data });
}
