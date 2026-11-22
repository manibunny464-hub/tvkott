import { isLocalizationReady } from "@/lib/localization-readiness";
import mongoose from 'mongoose';
import Content from '@/models/Content';
import dbConnect from '@/lib/db';
import Language from '@/models/Language';
import { uploadFormFile } from '@/lib/admin/media';

async function selectedLanguages(data, savedCodes, existingCodes = []) {
  if (data.selectedLanguageCodes === undefined) return {};
  let codes;
  try {
    codes = typeof data.selectedLanguageCodes === 'string' ? JSON.parse(data.selectedLanguageCodes) : data.selectedLanguageCodes;
  } catch {
    return { error: 'Invalid language selection.' };
  }
  if (!Array.isArray(codes) || codes.some((code) => typeof code !== 'string' || !code) ||
      codes.length > 50 || new Set(codes).size !== codes.length || !codes.includes(data.selectedPrimaryLanguage) ||
      savedCodes.some((code) => !codes.includes(code))) {
    return { error: 'Select a primary language and keep all saved languages in the selection.' };
  }
  await dbConnect();
  const active = await Language.distinct('code', { code: { $in: codes }, isActive: true });
  if (codes.some((code) => !active.includes(code) && !existingCodes.includes(code))) {
    return { error: 'Select languages available in the Languages menu.' };
  }
  return { selectedLanguageCodes: codes, selectedPrimaryLanguage: data.selectedPrimaryLanguage };
}

export async function prepareLocalizations(data, formData, existing) {
  if (data.localizations === undefined) return {};
  let rows;
  try {
    rows = typeof data.localizations === 'string' ? JSON.parse(data.localizations) : data.localizations;
  } catch {
    return { error: 'Invalid language variations.' };
  }
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 50 ||
      rows.some((row) => !row || typeof row.language !== 'string')) {
    return { error: 'Select at least one language.' };
  }
  const codes = rows.map((row) => row.language);
  if (new Set(codes).size !== codes.length || !codes.includes(data.primaryLanguage)) {
    return { error: 'Select a primary language and remove duplicate languages.' };
  }
  const selection = await selectedLanguages(data, codes);
  if (selection.error) return selection;
  const saved = new Map((existing?.localizations ?? []).map((row) => [row.language, row]));
  await dbConnect();
  const languages = await Language.find({ code: { $in: codes } }).select('code englishName isActive').lean();
  const byCode = new Map(languages.map((language) => [language.code, language]));
  if (codes.some((code) => !byCode.has(code) || (!byCode.get(code).isActive && !saved.has(code)))) {
    return { error: 'Select languages available in the Languages menu.' };
  }

  const text = (value) => typeof value === 'string' ? value.trim() : '';
  if (!text(rows.find((row) => row.language === data.primaryLanguage).title)) {
    return { error: 'Enter a title for the primary language.' };
  }

  for (const index of rows.keys()) {
    for (const field of [`localePoster${index}`, `localeBanner${index}`]) {
      const artwork = formData?.get(field);
      if (artwork && (typeof artwork === 'string' ||
          !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(artwork.type) ||
          artwork.size <= 0 || artwork.size > 10 * 1024 * 1024)) {
        return { error: 'Choose a JPEG, PNG, WebP, or AVIF image under 10 MB.' };
      }
    }
  }

  const localizations = [];
  for (const [index, row] of rows.entries()) {
    const previous = saved.get(row.language);
    const poster = await uploadFormFile(formData?.get(`localePoster${index}`), 'posters');
    const banner = await uploadFormFile(formData?.get(`localeBanner${index}`), 'banners');
    localizations.push({
      language: row.language,
      title: text(row.title),
      description: text(row.description),
      posterUrl: poster.url || (row.removePoster === true ? '' : previous?.posterUrl || ''),
      bannerUrl: banner.url || (row.removeBanner === true ? '' : previous?.bannerUrl || ''),
      trailerUrl: previous?.trailerUrl,
    });
  }
  return {
    ...selection,
    primaryLanguage: data.primaryLanguage,
    localizations,
    names: codes.map((code) => byCode.get(code).englishName),
  };
}

export function applyPrimaryLanguage(data, localized) {
  if (!localized.localizations) return;
  const primary = localized.localizations.find((row) => row.language === localized.primaryLanguage);
  data.title = primary.title;
  data.description = primary.description;
  data.language = localized.names;
  if (primary.posterUrl) data.posterUrl = primary.posterUrl;
  if (primary.bannerUrl) data.bannerUrl = primary.bannerUrl;
  if (primary.trailerUrl !== undefined) data.trailerUrl = primary.trailerUrl;
}

export function applyLanguageDraft(payload, localized, existing) {
  if (!localized.localizations) return;
  payload.primaryLanguage = localized.selectedPrimaryLanguage || localized.primaryLanguage;
  if (localized.selectedLanguageCodes) payload.selectedLanguageCodes = localized.selectedLanguageCodes;
  payload.localizations = localized.localizations;
  if (!existing || existing.isActive === false) {
    payload.isActive = false;
    return;
  }
  for (const field of ['title', 'slug', 'description', 'language', 'languages', 'posterUrl', 'thumbnailUrl', 'bannerUrl']) {
    delete payload[field];
  }
}

export async function saveTitleLanguage({ id, type, data, formData }) {
  const fail = (message, status) => Response.json({ success: false, message }, { status });
  if (!mongoose.isObjectIdOrHexString(id)) return fail('Invalid title ID.', 400);
  if (typeof data.language !== 'string' || typeof data.title !== 'string' || !data.title.trim()) {
    return fail('Select a language and enter its title.', 400);
  }
  await dbConnect();
  const filter = { _id: id, type, isDeleted: { $ne: true } };
  const existing = await Content.findOne(filter).select('+localizations +primaryLanguage +selectedLanguageCodes').lean();
  if (!existing) return fail('Title not found.', 404);
  const language = data.language;
  const rows = existing.localizations || [];
  const existingCodes = existing.selectedLanguageCodes ?? rows.map((row) => row.language);
  const selection = await selectedLanguages(data, [...new Set([...rows.map((row) => row.language), language])], existingCodes);
  if (selection.error) return fail(selection.error, 400);
  const prepared = await prepareLocalizations({
    primaryLanguage: language,
    localizations: [{ language, title: data.title, description: data.description,
      removePoster: data.removePoster === 'true', removeBanner: data.removeBanner === 'true' }],
  }, formData, existing);
  if (prepared.error) return fail(prepared.error, 400);

  const localization = prepared.localizations[0];
  const localizations = rows.some((row) => row.language === language)
    ? rows.map((row) => row.language === language ? localization : row)
    : [...rows, localization];
  const primaryLanguage = selection.selectedPrimaryLanguage || existing.primaryLanguage || language;
  const selectedLanguageCodes = selection.selectedLanguageCodes || [...new Set([...existingCodes, language])];
  const result = await Content.updateOne({ ...filter, updatedAt: existing.updatedAt ?? { $exists: false } }, {
    $set: { localizations, primaryLanguage, selectedLanguageCodes },
  });
  if (!result.matchedCount) return fail('The title changed while saving. Reload and try again.', 409);
  return Response.json({ success: true, localization, primaryLanguage, selectedLanguageCodes });
}

export async function studioLanguageOptions(series) {
  const codes = [...new Set([...(series.selectedLanguageCodes || []), ...(series.localizations || []).map((row) => row.language)])];
  const languages = await Language.find({ code: { $in: codes } }).select('code englishName').lean();
  const existing = Array.isArray(series.language) ? series.language : typeof series.language === 'string'
    ? series.language.split(',').map((name) => name.trim()).filter(Boolean) : [];
  const nameForCode = (code) => languages.find((language) => language.code === code)?.englishName || code;
  return {
    studioLanguages: [...new Set([...existing, ...codes.map(nameForCode)])],
    uploadLanguages: (series.localizations || []).filter(isLocalizationReady).map(({ language }) => nameForCode(language)),
  };
}
