import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
  },
  entityId: {
    type: String,
    required: false,
  },
  oldData: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  newData: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  device: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
