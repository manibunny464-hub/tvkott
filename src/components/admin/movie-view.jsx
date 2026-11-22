"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoviePreview } from "./movie-quality-uploads";
import { Rail } from "./series-preview";

const panel = "rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]";
const muted = "text-[var(--admin-muted)]";
const languageNames = new Intl.DisplayNames(["en"], { type: "language", fallback: "code" });
const languageName = (code) => /^[a-z]{2,3}(-[a-z0-9]+)*$/i.test(code) ? languageNames.of(code) : code;

export default function MovieView({ data, canEdit }) {
  const { movie, media = [], subtitles = [], related = [] } = data;
  const locales = movie.localizations || [];
  const [language, setLanguage] = useState(movie.primaryLanguage || locales[0]?.language || "");
  const selected = locales.find((row) => row.language === language);
  const artwork = selected?.bannerUrl || movie.bannerUrl;
  const trailer = selected?.trailerUrl ?? (language === movie.primaryLanguage || !language ? movie.trailerUrl : "");
  const cast = Array.isArray(movie.cast) ? { cast: movie.cast } : movie.cast || {};
  const selectedAssets = media.filter((row) => row.language === language && row.asset);
  const selectedTracks = movie.subtitlesEnabled === false ? [] : subtitles.filter((row) => row.language === language);
  const recommendations = (movie.movieIds || []).map((id) => related.find((item) => item._id === id)).filter(Boolean);

  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin/movies" className="flex items-center gap-2 text-sm text-[var(--admin-primary)]"><ArrowLeft size={16} /> Movies Library</Link>
      <div className="flex flex-wrap items-center gap-3">
        {locales.length > 0 && <label className="flex items-center gap-2 text-sm">Language
          <select value={language} onChange={(event) => setLanguage(event.target.value)}
            className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm">
            {locales.map((row) => <option key={row.language} value={row.language}>{languageName(row.language)}</option>)}
          </select>
        </label>}
        {canEdit && <Button asChild variant="outline"><Link href={`/admin/movies/${movie._id}/edit`}>Edit movie</Link></Button>}
      </div>
    </div>

    <section className={`${panel} overflow-hidden`} aria-label="Movie trailer">
      {trailer ? <video key={trailer} src={trailer} poster={artwork} controls playsInline muted autoPlay
        preload="metadata" className="aspect-video max-h-[65vh] w-full bg-black" />
        : <div className="relative grid min-h-52 place-items-center overflow-hidden bg-black sm:min-h-72">
          {artwork && <img src={artwork} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
          <p className="relative flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm text-white"><Film size={17} /> No trailer uploaded for this language</p>
        </div>}
      <p className="px-5 py-3 text-sm font-medium">Movie trailer</p>
    </section>

    <section className={`${panel} grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]`}>
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{selected?.title || movie.title}</h1>
        <p className={`mt-2 text-sm ${muted}`}>{[movie.releaseYear, movie.ageRating,
          ...(Array.isArray(movie.genres) ? movie.genres : [movie.genres])].filter(Boolean).join(" · ")}</p>
        {(selected?.description || movie.description) && <p className="mt-4 max-w-prose leading-relaxed">{selected?.description || movie.description}</p>}
      </div>
      <div className="space-y-2 lg:border-l lg:border-[var(--admin-border)] lg:pl-6">
        <h2 className="font-semibold">Cast &amp; Crew</h2>
        {Object.entries(cast).filter(([, people]) => Array.isArray(people) && people.length).map(([role, people]) =>
          <p key={role} className={`text-sm ${muted}`}><span className="font-semibold capitalize text-[var(--admin-foreground)]">{role} </span>
            {people.map((person) => typeof person === "string" ? person : person.name).filter(Boolean).join(", ")}
          </p>)}
      </div>
    </section>

    <section aria-label="Full movie">
      <h2 className="mb-3 text-2xl font-semibold">Full Movie</h2>
      <MoviePreview key={language} movieId={movie._id} entries={media} preferredLanguage={language}
        tracks={movie.subtitlesEnabled === false ? [] : subtitles} nameForLanguage={languageName} />
    </section>

    <section aria-label="More Details">
      <h2 className="mb-3 text-2xl font-semibold">More Details</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className={`${panel} p-5`}>
          <dt className="font-semibold">Video qualities</dt>
          <dd className={`mt-1 text-sm ${muted}`}>{selectedAssets.map((row) => row.quality.toUpperCase()).join(", ") || "No video uploaded for this language"}</dd>
        </div>
        <div className={`${panel} p-5`}>
          <dt className="font-semibold">Subtitles</dt>
          <dd className={`mt-1 text-sm ${muted}`}>{selectedTracks.map((row) => languageName(row.subtitleLanguage)).join(", ") || "No subtitles for this language"}</dd>
        </div>
      </dl>
    </section>

    <section aria-label="More Like This">
      <h2 className="text-2xl font-semibold">More Like This</h2>
      {recommendations.length ? <Rail heading="recommendations">
        {recommendations.map((row) => {
          const primary = row.localizations?.find((item) => item.language === row.primaryLanguage);
          const poster = primary?.posterUrl || row.posterUrl;
          return <Link key={row._id} href={`/admin/movies/${row._id}`}
            className={`${panel} w-36 shrink-0 snap-start overflow-hidden hover:border-[var(--admin-primary)] sm:w-44`}>
            <div className="grid aspect-[2/3] place-items-center bg-[var(--admin-soft)]">
              {poster ? <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Film size={22} />}
            </div>
            <p className="p-3 text-sm font-semibold">{primary?.title || row.title}</p>
          </Link>;
        })}
      </Rail> : <p className={`mt-3 text-sm ${muted}`}>No movies selected.</p>}
    </section>
  </div>;
}
