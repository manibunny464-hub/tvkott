import mongoose from 'mongoose';

const AdminUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String, // Matches a role name like 'super_admin' or a custom role
    required: true,
    default: 'content_manager',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
