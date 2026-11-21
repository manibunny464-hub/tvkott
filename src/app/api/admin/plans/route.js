import { requireAdmin } from '@/lib/admin/auth';
import { serialize } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import Transaction from '@/models/Transaction';
import { getOrCreateRazorpayPlan } from '@/lib/subscription/razorpayService';

async function listPlans() {
  await dbConnect();
  const [plans, subscriberRows, revenueRows] = await Promise.all([
    SubscriptionPlan.find({}).sort({ displayOrder: 1, price: 1 }).lean(),
    Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$planId', subscribers: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: '$planId', revenue: { $sum: '$amount' } } },
    ]),
  ]);

  const subscriberMap = new Map(
    subscriberRows.map((row) => [String(row._id), row.subscribers])
  );

  const revenueMap = new Map(
    revenueRows.map((row) => [String(row._id), row.revenue])
  );

  return serialize(plans).map((plan) => ({
    ...plan,
    id: plan._id,
    subscribers: subscriberMap.get(String(plan._id)) || 0,
    revenue: revenueMap.get(String(plan._id)) || 0,
  }));
}

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const plans = await listPlans();
    return Response.json({ success: true, plans });
  } catch (err) {
    console.error('[GET /api/admin/plans] Error:', err);
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  try {
    const body = await request.json();
    await dbConnect();

    const plan = await SubscriptionPlan.create({
      name: body.name,
      price: Number(body.price || 0),
      originalPrice: Number(body.originalPrice || body.price || 0),
      duration: Number(body.duration || 30),
      label: body.label || '',
      tagline: body.tagline || '',
      isActive: body.isActive ?? true,
      autoRenew: body.autoRenew ?? true,
      razorpayPlanId: body.razorpayPlanId || '',
      displayOrder: Number(body.displayOrder || 0),
    });

    if (plan.autoRenew && plan.price > 0 && !plan.razorpayPlanId) {
      try {
        await getOrCreateRazorpayPlan(plan);
      } catch (rzpErr) {
        console.warn('[POST /api/admin/plans] Could not auto-sync Razorpay plan:', rzpErr.message);
      }
    }

    return Response.json({ success: true, plan: serialize(plan) });
  } catch (err) {
    console.error('[POST /api/admin/plans] Error:', err);
    return Response.json({ success: false, message: err.message }, { status: 400 });
  }
}

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  try {
    const body = await request.json();
    if (!body.id) {
      return Response.json({ success: false, message: 'Plan ID is required' }, { status: 400 });
    }

    await dbConnect();
    const existingPlan = await SubscriptionPlan.findById(body.id);
    if (!existingPlan) {
      return Response.json({ success: false, message: 'Plan not found' }, { status: 404 });
    }

    const updateFields = {
      name: body.name,
      price: Number(body.price || 0),
      originalPrice: Number(body.originalPrice || body.price || 0),
      duration: Number(body.duration || 30),
      label: body.label || '',
      tagline: body.tagline || '',
      isActive: body.isActive ?? true,
      autoRenew: body.autoRenew ?? true,
      displayOrder: Number(body.displayOrder || 0),
    };

    if (body.razorpayPlanId !== undefined) {
      updateFields.razorpayPlanId = body.razorpayPlanId;
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      body.id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true }
    );

    if (plan && plan.autoRenew && plan.price > 0 && !plan.razorpayPlanId) {
      try {
        await getOrCreateRazorpayPlan(plan);
      } catch (rzpErr) {
        console.warn('[PUT /api/admin/plans] Could not auto-sync Razorpay plan:', rzpErr.message);
      }
    }

    return Response.json({ success: true, plan: serialize(plan) });
  } catch (err) {
    console.error('[PUT /api/admin/plans] Error:', err);
    return Response.json({ success: false, message: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await request.json();
  await dbConnect();
  await SubscriptionPlan.findByIdAndDelete(id);
  return Response.json({ success: true });
}
