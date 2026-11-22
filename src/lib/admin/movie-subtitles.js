const MAX_SUBTITLE_BYTES = 512 * 1024;

export function normalizeMovieSubtitles(name, value) {
  if (typeof name !== 'string' || name.length > 255 || typeof value !== 'string' ||
      new TextEncoder().encode(value).byteLength > MAX_SUBTITLE_BYTES || value.includes('\0')) return null;
  const extension = name.toLowerCase().split('.').at(-1);
  const normalized = value.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
  const vtt = extension === 'srt'
    ? 'WEBVTT\n\n' + normalized.replace(/^(\d{1,3}:\d{2}:\d{2}),(\d{3})(\s+-->\s+\d{1,3}:\d{2}:\d{2}),(\d{3})/gm, '$1.$2$3.$4')
    : normalized;
  if (!['vtt', 'srt'].includes(extension) || !/^WEBVTT(?:[ \t][^\n]*)?\n/.test(vtt) ||
      !/^(?:\d{1,3}:)?[0-5]\d:[0-5]\d\.\d{3}\s+-->\s+(?:\d{1,3}:)?[0-5]\d:[0-5]\d\.\d{3}(?:\s|$)/m.test(vtt)) return null;
  return vtt + '\n';
}
