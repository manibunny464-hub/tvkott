import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

// Load environment variables from .env.local
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    if (line.trim() && !line.startsWith('#')) {
      const eqIndex = line.indexOf('=');
      if (eqIndex > 0) {
        const key = line.substring(0, eqIndex).trim();
        const value = line.substring(eqIndex + 1).trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    }
  });
}

const GenreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  imageUrl: String,
  borderColor: { type: String, default: '#06b6d4' },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Genre = mongoose.model('Genre', GenreSchema);

async function addBorderColor() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    // Update all genres without borderColor
    const result = await Genre.updateMany(
      { borderColor: { $exists: false } },
      { $set: { borderColor: '#06b6d4' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} genres with default borderColor (#06b6d4)`);
    console.log(`ℹ️  ${result.matchedCount} genres matched`);

    // Show updated genres
    const genres = await Genre.find({}).select('name borderColor').lean();
    console.log('\n📋 All genres now have borderColor:');
    genres.forEach((g) => {
      console.log(`   - ${g.name}: ${g.borderColor}`);
    });

    await mongoose.disconnect();
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addBorderColor();
