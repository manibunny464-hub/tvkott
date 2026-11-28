import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

const defaults = { enabled: false, pairingMinutes: 5, sessionDays: 7 };
const settings = () => mongoose.connection.collection('tvsettings');

export function validateTvSettings(data) {
  if (typeof data?.enabled !== 'boolean' ||
      !Number.isInteger(data.pairingMinutes) || data.pairingMinutes < 2 || data.pairingMinutes > 15 ||
      !Number.isInteger(data.sessionDays) || data.sessionDays < 1 || data.sessionDays > 30) return null;
  return { enabled: data.enabled, pairingMinutes: data.pairingMinutes, sessionDays: data.sessionDays };
}

export async function readTvSettings() {
  await dbConnect();
  const saved = await settings().findOne({ _id: 'tv' });
  return validateTvSettings(saved) || { ...defaults };
}

export async function writeTvSettings(data) {
  await dbConnect();
  await settings().updateOne({ _id: 'tv' }, { $set: data }, { upsert: true });
  return data;
}
