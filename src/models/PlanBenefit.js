import mongoose from 'mongoose';

const PlanBenefitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.PlanBenefit || mongoose.model('PlanBenefit', PlanBenefitSchema);
