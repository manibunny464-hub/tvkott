import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import PlanBenefit from '@/models/PlanBenefit';
import SubscriptionPlan from '@/models/SubscriptionPlan';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    await dbConnect();
    const benefits = await PlanBenefit.find({}).sort({ createdAt: -1 });
    return Response.json({ success: true, benefits });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  try {
    const { name, icon } = await request.json();
    if (!name || !icon) {
      return Response.json({ success: false, message: 'Name and Icon are required' }, { status: 400 });
    }

    await dbConnect();
    const benefit = await PlanBenefit.create({ name, icon });
    return Response.json({ success: true, benefit });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  try {
    const { id, name, icon } = await request.json();
    if (!id || !name || !icon) {
      return Response.json({ success: false, message: 'ID, Name and Icon are required' }, { status: 400 });
    }

    await dbConnect();
    const benefit = await PlanBenefit.findByIdAndUpdate(
      id,
      { $set: { name, icon } },
      { new: true }
    );

    if (!benefit) {
      return Response.json({ success: false, message: 'Benefit not found' }, { status: 404 });
    }

    // Synchronize matching iconFeatures in SubscriptionPlan
    const plansToUpdate = await SubscriptionPlan.find({ benefits: id });
    for (const plan of plansToUpdate) {
      const populated = await SubscriptionPlan.findById(plan._id).populate('benefits');
      plan.iconFeatures = populated.benefits
        .filter((b) => b) // Filter out any null references
        .map((b) => ({
          icon: b.icon,
          label: b.name,
        }));
      await plan.save();
    }

    return Response.json({ success: true, benefit });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  try {
    const { id } = await request.json();
    if (!id) {
      return Response.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    await dbConnect();
    await PlanBenefit.findByIdAndDelete(id);

    // Pull from plan benefits list and synchronize legacy iconFeatures
    const plansToUpdate = await SubscriptionPlan.find({ benefits: id });
    for (const plan of plansToUpdate) {
      plan.benefits = plan.benefits.filter((bId) => String(bId) !== String(id));
      const populated = await SubscriptionPlan.findById(plan._id).populate('benefits');
      plan.iconFeatures = populated.benefits
        .filter((b) => b && String(b._id) !== String(id))
        .map((b) => ({
          icon: b.icon,
          label: b.name,
        }));
      await plan.save();
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
