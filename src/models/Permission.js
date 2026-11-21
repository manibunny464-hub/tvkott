import mongoose from 'mongoose';

const PermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Permission || mongoose.model('Permission', PermissionSchema);
