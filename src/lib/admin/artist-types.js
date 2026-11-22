import ArtistType from '@/models/ArtistType';

export async function initializeArtistTypes() {
  // Carry over the three values accepted by the old Artist schema.
  const legacy = [['actor', 'Actor'], ['director', 'Director'], ['writer', 'Writer']];
  if (await ArtistType.countDocuments({ key: { $in: legacy.map(([key]) => key) } }) === legacy.length) return;
  await ArtistType.init();
  for (const [key, name] of legacy) {
    try {
      await ArtistType.updateOne({ key }, { $setOnInsert: { key, name, nameKey: key, isActive: true } }, { upsert: true });
    } catch (error) {
      if (error.code !== 11000 || !(await ArtistType.exists({ key }))) throw error;
    }
  }
}

export function artistTypeFields(body) {
  const name = typeof body?.name === 'string' ? body.name.trim().normalize('NFKC') : '';
  if (!name || name.length > 80 || typeof body?.isActive !== 'boolean') return null;
  return { name, nameKey: name.toLowerCase(), isActive: body.isActive };
}

export function serializeArtistType(type) {
  return { key: type.key, name: type.name, isActive: type.isActive };
}

export async function canAssignArtistType(key, previousKey) {
  if (typeof key !== 'string' || !key) return false;
  if (key === previousKey) return true;
  await initializeArtistTypes();
  return Boolean(await ArtistType.exists({ key, isActive: true }));
}
