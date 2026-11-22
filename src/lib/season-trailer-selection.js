export function seasonTrailersByLanguage(trailers, requestedLanguage, primaryLanguage) {
  const chosen = new Map();
  const priorities = new Map();
  for (const trailer of trailers) {
    if (!trailer.videoUrl && !trailer.languages?.some((row) => row.files?.[0]?.videoUrl)) continue;
    if (requestedLanguage && trailer.language !== requestedLanguage) continue;
    const id = String(trailer.seasonId);
    const priority = trailer.language && trailer.language === primaryLanguage ? 3 : !trailer.language ? 2 : 1;
    const previous = chosen.get(id);
    if ((priorities.get(id) ?? 0) > priority ||
        (priorities.get(id) === priority && previous.language <= trailer.language)) continue;
    priorities.set(id, priority);
    chosen.set(id, trailer);
  }
  return chosen;
}
