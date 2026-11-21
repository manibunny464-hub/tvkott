import mongoose from 'mongoose';

const SupportTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issueType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  adminNotes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);
