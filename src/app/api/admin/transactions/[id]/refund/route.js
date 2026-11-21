import Razorpay from 'razorpay';
import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function POST(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const refundAmountInput = body.amount; // Optional partial refund in Rupees

  await dbConnect();

  try {
    const tx = await Transaction.findById(id);
    if (!tx) {
      return Response.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (tx.status !== 'success') {
      return Response.json(
        { success: false, message: 'Only successful transactions can be refunded' },
        { status: 400 }
      );
    }

    let refundId = `ref_mock_${Date.now()}`;
    const amountToRefund = refundAmountInput ? Number(refundAmountInput) : tx.amount;

    if (amountToRefund <= 0 || amountToRefund > tx.amount) {
      return Response.json(
        { success: false, message: 'Invalid refund amount' },
        { status: 400 }
      );
    }

    const razorpayPaymentId = tx.razorpayPaymentId;

    if (razorpayPaymentId && !razorpayPaymentId.startsWith('pay_mock_')) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const isMockKeys = !keyId || keyId === 'your_razorpay_key_id' || !keySecret || keySecret === 'REPLACE_WITH_ENVIRONMENT_VALUE';

      if (!isMockKeys) {
        try {
          const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
          });

          // Razorpay expects amount in paise (Rupees * 100)
          const refundOptions = {
            amount: Math.round(amountToRefund * 100),
          };

          const rf = await razorpay.payments.refund(razorpayPaymentId, refundOptions);
          refundId = rf.id;
        } catch (err) {
          console.error('[Razorpay Refund] API refund error:', err);
          return Response.json(
            { success: false, message: err.message || 'Razorpay refund failed' },
            { status: 400 }
          );
        }
      }
    }

    // Update in local DB
    tx.status = 'refunded';
    tx.refundId = refundId;
    tx.refundedAmount = amountToRefund;
    await tx.save();

    return Response.json({
      success: true,
      message: 'Transaction refunded successfully',
      transaction: tx,
    });
  } catch (error) {
    console.error(`[admin/transactions/${id}/refund] error:`, error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
