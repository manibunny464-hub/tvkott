import mongoose from 'mongoose';

const CmsPageSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['privacy', 'help', 'about'],
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  // Metadata fields particularly useful for Help & Support contact info
  metadata: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
  }
}, { timestamps: true });

if (mongoose.models.CmsPage) {
  delete mongoose.models.CmsPage;
}

export default mongoose.models.CmsPage || mongoose.model('CmsPage', CmsPageSchema);
