"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Film, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeMovieSubtitles } from "@/lib/admin/movie-subtitles";

const panel = "rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]";
const muted = "text-[var(--admin-muted)]";
const selectStyle = "rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm";
const names = new Intl.DisplayNames(["en"], { type: "language", fallback: "code" });
const languageName = (code) => /^[a-z]{2,3}(-[a-z0-9]+)*$/i.test(code) ? names.of(code) : code;
const minutes = (seconds) => seconds > 0 ? `${Math.max(1, Math.round(seconds / 60))} min` : "";

export function Rail({ heading, children }) {
  const row = useRef(null);
  function scroll(direction) {
    row.current?.scrollBy({ left: row.current.clientWidth * direction * 0.85, behavior: "smooth" });
  }
  return <>
    <div className="mb-2 flex justify-end gap-2">
      <Button type="button" size="icon" variant="outline" aria-label={`Previous ${heading}`} onClick={() => scroll(-1)}><ChevronLeft size={17} /></Button>
      <Button type="button" size="icon" variant="outline" aria-label={`Next ${heading}`} onClick={() => scroll(1)}><ChevronRight size={17} /></Button>
    </div>
    <div ref={row} className="flex snap-x gap-4 overflow-x-auto pb-3">{children}</div>
  </>;
}

function videoVariants(episode) {
  const rows = (episode.languages || []).map((row) => ({
    ...row, videoFiles: (row.videoFiles || []).filter((file) => file.videoUrl),
  })).filter((row) => row.videoFiles.length);
  if (rows.length || !episode.videoUrl) return rows;
  return [{ language: "", videoFiles: [{ quality: "", videoUrl: episode.videoUrl }] }];
}

function EpisodePlayer({ episode, preferred }) {
  const variants = videoVariants(episode);
  const [language, setLanguage] = useState(variants.find((row) => languageName(row.language) === languageName(preferred))?.language ?? variants[0]?.language);
  const [quality, setQuality] = useState("");
  const player = useRef(null);
  const resume = useRef(null);
  const row = variants.find((item) => item.language === language);
  const file = row?.videoFiles.find((item) => item.quality === quality) || row?.videoFiles[0];
  const [subtitle, setSubtitle] = useState(null);
  const [subtitleError, setSubtitleError] = useState("");
  const subtitleFile = row?.subtitleFile;

  useEffect(() => {
    if (!subtitleFile) return;
    const controller = new AbortController();
    let objectUrl;
    fetch(subtitleFile, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Subtitle unavailable.");
      const text = await response.text();
      const filename = new URL(subtitleFile, window.location.href).pathname.split("/").at(-1);
      const vtt = normalizeMovieSubtitles(filename, text);
      if (!vtt) throw new Error("Subtitle format is invalid.");
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
      setSubtitle({ file: subtitleFile, url: objectUrl });
      setSubtitleError("");
    }).catch(() => { if (!controller.signal.aborted) setSubtitleError(subtitleFile); });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [subtitleFile]);

  function remember() {
    if (player.current) resume.current = { time: player.current.currentTime, playing: !player.current.paused };
  }
  return <section className={`${panel} mt-4 space-y-4 p-4 sm:p-5`} aria-label="Episode playback">
    <h3 className="text-lg font-semibold">{episode.episodeNumber}. {row?.title || episode.title}</h3>
    {!file ? <p className={muted}>No video has been uploaded for this episode.</p> : <>
      <div className="flex flex-wrap gap-4">
        {variants.some((variant) => variant.language) && <label className="grid gap-1 text-sm">Language
          <select className={selectStyle} value={language} onChange={(event) => { remember(); setLanguage(event.target.value); }}>
            {variants.map((variant) => <option key={variant.language} value={variant.language}>{languageName(variant.language)}</option>)}
          </select>
        </label>}
        {row.videoFiles.some((video) => video.quality) && <label className="grid gap-1 text-sm">Quality
          <select className={selectStyle} value={file.quality} onChange={(event) => { remember(); setQuality(event.target.value); }}>
            {row.videoFiles.map((video) => <option key={video.quality} value={video.quality}>{video.quality.toUpperCase()}</option>)}
          </select>
        </label>}
      </div>
      <video key={file.videoUrl} ref={player} src={file.videoUrl} controls playsInline preload="metadata"
        poster={row.thumbnailUrl || episode.thumbnailUrl} className="aspect-video max-h-[70vh] w-full rounded-xl bg-black"
        onLoadedMetadata={(event) => {
          const saved = resume.current;
          if (!saved) return;
          resume.current = null;
          event.currentTarget.currentTime = Math.min(saved.time, event.currentTarget.duration || saved.time);
          if (saved.playing) event.currentTarget.play().catch(() => {});
        }}>
        {subtitleFile && subtitle?.file === subtitleFile && <track kind="subtitles" label={languageName(row.language) || "Subtitles"} src={subtitle.url} />}
      </video>
      {subtitleFile && subtitleError === subtitleFile && <p role="status" className={muted}>Subtitles could not be loaded.</p>}
    </>}
  </section>;
}

export default function SeriesPreview({ data, canEdit }) {
  const { series, seasons = [], episodes = [], trailers = [], related = [] } = data;
  const locales = series.localizations || [];
  const [language, setLanguage] = useState(series.primaryLanguage || locales[0]?.language || "");
  const [seasonId, setSeasonId] = useState(seasons[0]?._id || "");
  const [episodeId, setEpisodeId] = useState("");
  const locale = locales.find((row) => row.language === language);
  const season = seasons.find((row) => row._id === seasonId);
  const seasonEpisodes = episodes.filter((episode) => episode.seasonId === seasonId);
  const episode = seasonEpisodes.find((row) => row._id === episodeId);
  const seasonTrailers = trailers.filter((row) => row.seasonId === seasonId && row.videoUrl);
  const trailer = seasonTrailers.find((row) => row.language === language) || (!language && seasonTrailers.find((row) => !row.language));
  const title = locale?.title || series.title;
  const artwork = locale?.bannerUrl || series.bannerUrl;
  const cast = Array.isArray(series.cast) ? { cast: series.cast } : series.cast || {};
  const languages = [...new Set(seasonEpisodes.flatMap((row) => videoVariants(row).map((variant) => variant.language).filter(Boolean)))];
  const subtitleLanguages = [...new Set(seasonEpisodes.flatMap((row) =>
    (row.languages || []).filter((variant) => variant.subtitleFile).map((variant) => variant.language)))];
  const recommendations = (season?.seriesIds || []).map((id) => related.find((item) => item._id === id)).filter(Boolean);

  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin/series" className="flex items-center gap-2 text-sm text-[var(--admin-primary)]"><ArrowLeft size={16} /> Series Library</Link>
      <div className="flex flex-wrap items-center gap-3">
        {locales.length > 0 && <label className="flex items-center gap-2 text-sm">Language
          <select value={language} className={selectStyle} onChange={(event) => { setLanguage(event.target.value); setEpisodeId(""); }}>
            {locales.map((row) => <option key={row.language} value={row.language}>{languageName(row.language)}</option>)}
          </select>
        </label>}
        {canEdit && <Button variant="outline" asChild><Link href={`/admin/series/${series._id}/edit`}>Edit series</Link></Button>}
      </div>
    </div>

    <section className={`${panel} overflow-hidden`} aria-label="Season trailer">
      {trailer ? <video key={trailer.videoUrl} src={trailer.videoUrl} poster={artwork} controls muted autoPlay playsInline preload="metadata"
        className="aspect-video max-h-[65vh] w-full bg-black" />
        : <div className="relative grid min-h-52 place-items-center overflow-hidden bg-black sm:min-h-72">
          {artwork && <img src={artwork} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
          <p className="relative flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm text-white"><Film size={17} /> No trailer uploaded for this season and language</p>
        </div>}
      <div className="flex items-center justify-between gap-2 px-5 py-3 text-sm">
        <span className="font-medium">Season trailer</span>
        <span className={muted}>{season ? `Season ${season.seasonNumber}` : ""}</span>
      </div>
    </section>

    <section className={`${panel} grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]`}>
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className={`mt-2 text-sm ${muted}`}>{[series.releaseYear, seasons.length ? `${seasons.length} ${seasons.length === 1 ? "season" : "seasons"}` : "", series.ageRating, ...(Array.isArray(series.genres) ? series.genres : [series.genres])].filter(Boolean).join(" · ")}</p>
        {(locale?.description || series.description) && <p className="mt-4 max-w-prose leading-relaxed">{locale?.description || series.description}</p>}
      </div>
      <div className="space-y-2 lg:border-l lg:border-[var(--admin-border)] lg:pl-6">
        <h2 className="font-semibold">Cast &amp; Crew</h2>
        {Object.entries(cast).filter(([, people]) => Array.isArray(people) && people.length).map(([role, people]) =>
          <p key={role} className={`text-sm ${muted}`}><span className="font-semibold capitalize text-[var(--admin-foreground)]">{role} </span>
            {people.map((person) => typeof person === "string" ? person : person.name).filter(Boolean).join(", ")}
          </p>)}
      </div>
    </section>

    <section aria-label="Episodes">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-2xl font-semibold">Episodes</h2>
        {seasons.length > 0 && <select aria-label="Season" className={selectStyle} value={seasonId}
          onChange={(event) => { setSeasonId(event.target.value); setEpisodeId(""); }}>
          {seasons.map((row) => <option key={row._id} value={row._id}>Season {row.seasonNumber}</option>)}
        </select>}
      </div>
      {seasonEpisodes.length ? <Rail heading="episodes">
        {seasonEpisodes.map((row) => {
          const localized = row.languages?.find((item) => item.language === language || item.language === languageName(language));
          const thumbnail = localized?.thumbnailUrl || row.thumbnailUrl;
          return <button key={row._id} type="button" aria-pressed={row._id === episodeId} onClick={() => setEpisodeId(row._id)}
            className={`${panel} w-[min(78vw,19rem)] shrink-0 snap-start overflow-hidden text-left transition hover:border-[var(--admin-primary)] aria-pressed:border-[var(--admin-primary)]`}>
            <div className="relative grid aspect-video place-items-center bg-[var(--admin-soft)]">
              {thumbnail && <img src={thumbnail} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
              <span className="relative rounded-full bg-black/65 p-2 text-white"><Play size={18} /></span>
              {minutes(row.duration) && <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs text-white">{minutes(row.duration)}</span>}
            </div>
            <div className="space-y-2 p-4">
              <h3 className="font-semibold">{row.episodeNumber}. {localized?.title || row.title}</h3>
              <p className={`line-clamp-3 text-sm ${muted}`}>{localized?.description || row.description}</p>
            </div>
          </button>;
        })}
      </Rail> : <p className={`mt-4 text-sm ${muted}`}>No episodes in this season.</p>}
      {episode && <EpisodePlayer key={episode._id} episode={episode} preferred={language} />}
    </section>

    <section aria-label="More Details">
      <h2 className="mb-3 text-2xl font-semibold">More Details</h2>
      <dl className="grid gap-4 sm:grid-cols-3">
        {[
          ["Audio", languages.map(languageName).join(", ") || "No audio languages available"],
          ["Subtitles", subtitleLanguages.map(languageName).join(", ") || "No subtitles uploaded"],
          ["Watch offline", seasonEpisodes.some((row) => row.isDownloadable) ? "Downloadable episodes available" : "Downloads unavailable"],
        ].map(([label, value]) => <div key={label} className={`${panel} p-5`}>
          <dt className="font-semibold">{label}</dt><dd className={`mt-1 text-sm ${muted}`}>{value}</dd>
        </div>)}
      </dl>
    </section>

    <section aria-label="More Like This">
      <h2 className="text-2xl font-semibold">More Like This</h2>
      {recommendations.length ? <Rail heading="recommendations">
        {recommendations.map((row) => {
          const primary = row.localizations?.find((item) => item.language === row.primaryLanguage);
          const poster = primary?.posterUrl || row.posterUrl;
          return <Link key={row._id} href={`/admin/series/${row._id}`}
            className={`${panel} w-36 shrink-0 snap-start overflow-hidden hover:border-[var(--admin-primary)] sm:w-44`}>
            <div className="grid aspect-[2/3] place-items-center bg-[var(--admin-soft)]">
              {poster ? <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Film size={22} />}
            </div>
            <p className="p-3 text-sm font-semibold">{primary?.title || row.title}</p>
          </Link>;
        })}
      </Rail> : <p className={`mt-3 text-sm ${muted}`}>No series selected for this season.</p>}
    </section>
  </div>;
}
