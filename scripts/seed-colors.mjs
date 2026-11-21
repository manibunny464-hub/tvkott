import mongoose from 'mongoose';

const MONGODB_URI = 'REPLACE_WITH_ENVIRONMENT_VALUE';

const COLORS_BY_TITLE = {
  'Prem Kahaani':       '0xFFE91E63',
  'Namma Ooru':         '0xFF4CAF50',
  'Kalki':              '0xFFFF5722',
  'Theeram':            '0xFF2196F3',
  'Hosa Baalina Kathe': '0xFF9C27B0',
  'Raat Ke Raaste':     '0xFF607D8B',
  'Tujhse Zyada':       '0xFFFF4081',
  'Veera':              '0xFFF44336',
  'Manasu Maata':       '0xFF00BCD4',
  'Ek Pal':             '0xFFFF9800',
  'Kadal Kaatru':       '0xFF009688',
};

const ContentSchema = new mongoose.Schema({ title: String, color: String }, { strict: false });
const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);

await mongoose.connect(MONGODB_URI, { bufferCommands: false });
console.log('Connected.\n');

for (const [title, color] of Object.entries(COLORS_BY_TITLE)) {
  const result = await Content.updateOne({ title }, { $set: { color } });
  console.log(`${result.modifiedCount > 0 ? 'UPDATED' : 'NOT FOUND'} — ${title} → ${color}`);
}

console.log('\nDone.');
await mongoose.disconnect();
