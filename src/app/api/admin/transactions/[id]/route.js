import Razorpay from 'razorpay';
import { requireAdmin } from '@/lib/admin/auth';
import { serialize } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  await dbConnect();

  try {
    const tx = await Transaction.findById(id)
      .populate('userId', 'name email phone isPremium')
      .populate('planId', 'name price duration')
      .populate('subscriptionId')
      .lean();

    if (!tx) {
      return Response.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    let razorpayDetails = null;

    // Fetch details from Razorpay if it's a real transaction
    if (tx.razorpayPaymentId && !tx.razorpayPaymentId.startsWith('pay_mock_')) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const isMockKeys = !keyId || keyId === 'your_razorpay_key_id' || !keySecret || keySecret === 'REPLACE_WITH_ENVIRONMENT_VALUE';

      if (!isMockKeys) {
        try {
          const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
          });
          // Fetch payment and order info
          const [paymentInfo, orderInfo] = await Promise.all([
            razorpay.payments.fetch(tx.razorpayPaymentId).catch(() => null),
            tx.razorpayOrderId ? razorpay.orders.fetch(tx.razorpayOrderId).catch(() => null) : Promise.resolve(null),
          ]);

          razorpayDetails = {
            payment: paymentInfo,
            order: orderInfo,
          };
        } catch (err) {
          console.warn('[Razorpay API] Failed to fetch transaction details:', err);
        }
      }
    }

    return Response.json({
      success: true,
      transaction: {
        id: tx._id,
        razorpayPaymentId: tx.razorpayPaymentId || '',
        razorpayOrderId: tx.razorpayOrderId || '',
        userName: tx.userId?.name || 'Viewer',
        email: tx.userId?.email || `${tx.userId?.phone || 'viewer'}@phone.tvk`,
        phone: tx.userId?.phone || '',
        planName: tx.planId?.name || 'Subscription Plan',
        amount: tx.amount,
        currency: tx.currency || 'INR',
        paymentMethod: tx.paymentMethod || (tx.razorpayPaymentId ? 'Razorpay' : 'Mock'),
        status: tx.status,
        refundId: tx.refundId || '',
        refundedAmount: tx.refundedAmount || 0,
        date: tx.paidAt || tx.createdAt,
        couponCode: tx.couponCode || '',
        discountPercent: tx.discountPercent || 0,
        subscription: tx.subscriptionId ? {
          id: tx.subscriptionId._id,
          status: tx.subscriptionId.status,
          startDate: tx.subscriptionId.startDate,
          endDate: tx.subscriptionId.endDate,
        } : null,
      },
      razorpayDetails,
    });
  } catch (error) {
    console.error(`[admin/transactions/${id}] GET error:`, error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
