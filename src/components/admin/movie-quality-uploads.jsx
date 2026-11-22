"use client";

import { isLocalizationReady } from "@/lib/localization-readiness";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, UploadCloud, Zap } from "lucide-react";
import VideoUploadProgress from "./video-upload-progress";

const qualityOptions = ["360p", "480p", "720p", "1080p", "2160p"];

async function fingerprint(file) {
  const block = 64 * 1024;
  const head = await file.slice(0, block).arrayBuffer();
  const tail = await file.slice(Math.max(0, file.size - block)).arrayBuffer();
  const bytes = await new Blob([JSON.stringify([file.name, file.size]), head, tail]).arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

function uploadPart(url, body, signal, onProgress) {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (event) => onProgress(event.loaded);
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("A video part failed to upload. Resume to retry."));
    xhr.onerror = () => reject(new Error("Upload connection interrupted. Resume to retry."));
    xhr.onabort = () => reject(signal.reason);
    xhr.onloadend = () => signal.removeEventListener("abort", abort);
    signal.addEventListener("abort", abort, { once: true });
    xhr.send(body);
  });
}

function MovieQualityUploads({ entries, ...props }) {
  return <section aria-label="Video quality matrix" className="space-y-3">
    <h3 className="font-semibold">Video quality matrix</h3>
    <div className="overflow-hidden rounded-xl border border-[var(--admin-border)]">
      <div className="grid grid-cols-[4rem_minmax(0,1fr)] bg-[var(--admin-soft)] px-3 py-2 text-sm font-semibold">
        <span>Quality</span><span>Upload / File details</span>
      </div>
      <ul className="divide-y divide-[var(--admin-border)]">
        {[...qualityOptions].reverse().map((quality) => <MovieQualityRow key={quality} quality={quality}
          current={entries.find((row) => row.quality === quality)} {...props} />)}
      </ul>
    </div>
  </section>;
}

function MovieQualityRow({ movieId, language, quality, current, onChange, readDuration, disabled, onPreview }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const [dragging, setDragging] = useState(false);
  const controllerRef = useRef(null);
  const cancelRequested = useRef(false);
  const inputRef = useRef(null);
  const checking = status === "Verifying uploaded video…";
  const displayQuality = quality === "2160p" ? "4K" : quality;
  const selected = file || current?.pending || current?.asset;

  useEffect(() => () => controllerRef.current?.abort(), []);

  function request(action, quality, body = {}, signal) {
    return mediaRequest(movieId, action, { ...body, language, quality }, signal);
  }

  async function upload(file) {
    if (!file || disabled || controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    const signal = controller.signal;
    setFile(file);
    setBusy(true);
    setError("");
    setProgress(null);
    setStatus("Checking video…");
    let startedUpload = Boolean(current?.pending);
    try {
      if (!["video/mp4", "video/webm"].includes(file.type)) throw new Error("Choose an MP4 or WebM video.");
      const [duration, identity] = await Promise.all([readDuration(file), fingerprint(file)]);
      signal.throwIfAborted();
      if (!Number.isSafeInteger(duration) || duration <= 0) throw new Error("Could not detect this video's duration.");
      const { partSize, completedParts } = await request("start", quality, {
        name: file.name, size: file.size, contentType: file.type, duration, fingerprint: identity,
      });
      startedUpload = true;
      onChange({ language, quality, asset: current?.asset ?? null, pending: { name: file.name, size: file.size } });
      signal.throwIfAborted();
      const parts = Array.from({ length: Math.ceil(file.size / partSize) }, (_, index) => index + 1);
      const sizeOf = (part) => Math.min(partSize, file.size - (part - 1) * partSize);
      const remaining = parts.filter((part) => !completedParts.includes(part));
      const initialBytes = completedParts.reduce((total, part) => total + sizeOf(part), 0);
      let uploaded = initialBytes;
      let cursor = 0;
      const started = performance.now();
      const inFlight = new Map();
      function report() {
        const bytes = uploaded + [...inFlight.values()].reduce((total, value) => total + value, 0);
        const speed = Math.max(0, (bytes - initialBytes) / Math.max((performance.now() - started) / 1000, 0.1));
        setProgress({
          percent: Math.min(99, Math.floor(bytes * 100 / file.size)),
          speed, eta: speed > 0 ? Math.ceil((file.size - bytes) / speed) : null,
        });
      }
      report();
      setStatus("Uploading…");
      async function sendParts() {
        while (cursor < remaining.length) {
          const partNumber = remaining[cursor++];
          signal.throwIfAborted();
          const offset = (partNumber - 1) * partSize;
          const { url } = await request("sign", quality, { partNumber }, signal);
          await uploadPart(url, file.slice(offset, offset + sizeOf(partNumber)), signal, (bytes) => {
            inFlight.set(partNumber, bytes);
            report();
          });
          inFlight.delete(partNumber);
          uploaded += sizeOf(partNumber);
          report();
        }
      }
      await Promise.all(Array.from({ length: Math.min(3, remaining.length) }, sendParts));
      setProgress((current) => current && { ...current, percent: 99 });
      setStatus("Verifying uploaded video…");
      const { asset } = await request("complete", quality);
      onChange({ language, quality, asset, pending: null });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setProgress((current) => current && { ...current, percent: 100 });
      setStatus("Video saved.");
      if (!signal.aborted) onPreview({ language, quality });
    } catch (error) {
      if (signal.aborted) setStatus("Upload paused.");
      else {
        controller.abort();
        setError(error.message);
        setStatus("");
      }
    } finally {
      controllerRef.current = null;
      if (cancelRequested.current) {
        cancelRequested.current = false;
        await cancel(startedUpload);
      }
      setBusy(false);
    }
  }

  async function cancel(hasPending) {
    setBusy(true);
    setError("");
    try {
      if (hasPending) await request("cancel", quality);
      onChange({ language, quality, asset: current?.asset ?? null, pending: null });
      setFile(null);
      setProgress(null);
      setStatus("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function selectFiles(files) {
    if (disabled || busy || !files?.length) return;
    if (files.length > 1) { setError("Choose one video for this quality."); return; }
    upload(files[0]);
  }

  return <li className="grid grid-cols-[4rem_minmax(0,1fr)] border-t border-[var(--admin-border)] px-3 py-2">
    <strong className="pt-2 text-sm">{displayQuality}</strong>
    <div className="min-w-0 space-y-2">
      <input ref={inputRef} hidden type="file" accept="video/mp4,video/webm" aria-label={`Select ${displayQuality} video`}
        onChange={(event) => { selectFiles(event.target.files); event.target.value = ""; }} />
      {selected && <div className="space-y-2 rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate font-medium" title={selected.name}>{selected.name}</span>
          <span className="shrink-0 text-xs text-[var(--admin-muted)]">{(selected.size / 1048576).toFixed(1)} MB</span>
        </div>
        {progress && progress.percent < 100 ? <>
          <VideoUploadProgress percent={progress.percent} paused={!busy}
            label={busy ? (checking ? "Verifying video" : "Uploading") : "Paused"} />
          {busy && !checking && <div className="flex items-center gap-3 text-[10px] text-[var(--admin-muted)]">
            <span className="flex items-center gap-1"><Zap size={10} className="text-yellow-500" />{(progress.speed / 1048576).toFixed(1)} MiB/s</span>
            <span className="flex items-center gap-1"><Clock size={10} /> ETA: {progress.eta === null ? "—" : `${progress.eta}s`}</span>
          </div>}
        </> : status && <p role="status" className="text-xs text-[var(--admin-primary)]">{status}</p>}
        <div className="flex flex-wrap gap-2">
          {busy && !checking && controllerRef.current && <Button type="button" size="sm" variant="outline" onClick={() => controllerRef.current?.abort()}>Pause</Button>}
          {!busy && file && <Button type="button" size="sm" disabled={disabled} onClick={() => upload(file)}>Resume</Button>}
          {(file || current?.pending) && !checking && <Button type="button" size="sm" variant="outline" disabled={disabled || (busy && !controllerRef.current)} onClick={() => {
            if (controllerRef.current) {
              cancelRequested.current = true;
              controllerRef.current.abort();
            } else cancel(Boolean(current?.pending));
          }}>Cancel</Button>}
          {!busy && current?.asset && !current.pending && !file && <Button type="button" size="sm" variant="outline" onClick={() => onPreview({ language, quality })}>Preview</Button>}
        </div>
      </div>}
      {!busy && !file && <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); selectFiles(event.dataTransfer.files); }}
        className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm transition disabled:opacity-50 ${dragging ? "border-[var(--admin-primary)] bg-[var(--admin-soft)]" : "border-[var(--admin-border)] hover:border-[var(--admin-primary)]"}`}>
        <UploadCloud size={16} aria-hidden="true" />
        {current?.pending ? "Choose the same file to resume" : current?.asset ? "Drop a replacement or choose file" : `Drop ${displayQuality} video or choose file`}
      </button>}
      {error && <p role="alert" className="tvk-validation text-sm">{error}</p>}
    </div>
  </li>;
}

async function mediaRequest(movieId, mediaAction, body, signal) {
  const response = await fetch("/api/admin/movies/" + movieId, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...body, mediaAction }),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.message || "Movie media request failed.");
  return data;
}

export function MoviePreview({ movieId, entries, tracks, nameForLanguage, requested, preferredLanguage }) {
  const [language, setLanguage] = useState("");
  const [quality, setQuality] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [source, setSource] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const video = useRef(null);
  const resume = useRef(null);
  const available = entries.filter((row) => row.asset);
  const languages = [...new Set(available.map((row) => row.language))];
  const chosenLanguage = languages.includes(language) ? language : languages.includes(preferredLanguage) ? preferredLanguage : languages[0];
  const videoOptions = available.filter((row) => row.language === chosenLanguage);
  const chosenQuality = videoOptions.some((row) => row.quality === quality) ? quality : videoOptions[0]?.quality;
  const assetName = videoOptions.find((row) => row.quality === chosenQuality)?.asset.name;
  const subtitleOptions = tracks.filter((track) => track.language === chosenLanguage);
  const requestedSource = requested?.language === chosenLanguage && requested?.quality === chosenQuality ? requested : null;
  const chosenSubtitle = subtitleOptions.some((track) => track.subtitleLanguage === subtitle) ? subtitle : "";

  useEffect(() => {
    if (requested) {
      setLanguage(requested.language);
      setQuality(requested.quality);
    }
  }, [requested]);

  useEffect(() => {
    if (!chosenLanguage || !chosenQuality) return;
    const aborter = new AbortController();
    const current = video.current;
    if (current && current.readyState > 0) resume.current = { seconds: current.currentTime, playing: !current.paused };
    current?.pause();
    setError("");
    setLoading(true);
    mediaRequest(movieId, "preview", { language: chosenLanguage, quality: chosenQuality }, aborter.signal).then((result) => {
      if (!aborter.signal.aborted) setSource(result.url);
    }).catch((error) => {
      if (!aborter.signal.aborted) {
        setSource("");
        setError(error.message);
      }
    }).finally(() => {
      if (!aborter.signal.aborted) setLoading(false);
    });
    return () => aborter.abort();
  }, [movieId, chosenLanguage, chosenQuality, assetName, requestedSource]);

  const subtitleName = subtitleOptions.find((track) => track.subtitleLanguage === chosenSubtitle)?.name;
  useEffect(() => {
    setTrackUrl("");
    if (!chosenSubtitle) return;
    const aborter = new AbortController();
    let url;
    mediaRequest(movieId, "subtitle-read", { language: chosenLanguage, subtitleLanguage: chosenSubtitle }, aborter.signal)
      .then((result) => {
        if (aborter.signal.aborted) return;
        url = URL.createObjectURL(new Blob([result.text], { type: "text/vtt" }));
        setTrackUrl(url);
      }).catch((error) => {
        if (!aborter.signal.aborted) setError(error.message);
      });
    return () => { aborter.abort(); if (url) URL.revokeObjectURL(url); };
  }, [movieId, chosenLanguage, chosenSubtitle, subtitleName]);

  function restorePlayback() {
    const previous = resume.current;
    if (!previous || !video.current) return;
    video.current.currentTime = Math.min(previous.seconds, video.current.duration || previous.seconds);
    if (previous.playing) video.current.play().catch(() => {});
  }

  return (
    <section className="space-y-3 rounded-xl border border-[var(--admin-border)] p-4">
      <h3 className="font-semibold">Playback preview</h3>
      {languages.length ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">Video language
              <select className="mt-1 block w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2"
                value={chosenLanguage} onChange={(event) => setLanguage(event.target.value)}>
                {languages.map((code) => <option key={code} value={code}>{nameForLanguage(code)}</option>)}
              </select>
            </label>
            <label className="text-sm">Quality
              <select className="mt-1 block w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2"
                value={chosenQuality} onChange={(event) => setQuality(event.target.value)}>
                {videoOptions.map((row) => <option key={row.quality}>{row.quality}</option>)}
              </select>
            </label>
            <label className="text-sm">Subtitles
              <select className="mt-1 block w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2"
                value={chosenSubtitle} onChange={(event) => setSubtitle(event.target.value)}>
                <option value="">Off</option>
                {subtitleOptions.map((track) => <option key={track.subtitleLanguage} value={track.subtitleLanguage}>{nameForLanguage(track.subtitleLanguage)}</option>)}
              </select>
            </label>
          </div>
          {loading && <p role="status" className="text-sm">Loading preview…</p>}
          {source && (
            <video ref={video} src={source} controls playsInline preload="metadata"
              onLoadedMetadata={restorePlayback} className="tvk-wide-preview block rounded-lg" onError={() => setError("The video could not be played.")}>
              {trackUrl && <track key={trackUrl} kind="subtitles" src={trackUrl} srcLang={chosenSubtitle}
                label={nameForLanguage(chosenSubtitle)} default onLoad={(event) => { event.currentTarget.track.mode = "showing"; }} />}
            </video>
          )}
        </>
      ) : <p className="text-sm text-[var(--admin-muted)]">Upload a video quality to preview it here.</p>}
      {error && <p role="alert" className="tvk-validation text-sm">{error}</p>}
    </section>
  );
}

function MovieSubtitleLibrary({ movieId, language, languages, tracks, onChange, disabled }) {
  const [subtitleLanguage, setSubtitleLanguage] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const input = useRef(null);
  const nameFor = (code) => languages.find((option) => option.code === code)?.englishName || code;

  async function change(action, track) {
    setBusy(true);
    setError("");
    setStatus("");
    try {
      if (action === "subtitle-save" && file.size > 524288) throw new Error("Subtitle files must be 512 KB or smaller.");
      const data = action === "subtitle-save" ? {
        language, subtitleLanguage, name: file.name, text: await file.text(),
      } : { language, subtitleLanguage: track.subtitleLanguage };
      const result = await mediaRequest(movieId, action, data);
      onChange(data.subtitleLanguage, result.subtitle);
      if (action === "subtitle-save") {
        setStatus("Subtitle track saved.");
        setFile(null);
        if (input.current) input.current.value = "";
      } else setStatus("Subtitle track removed.");
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-[var(--admin-border)] p-4">
      <h3 className="font-semibold">Subtitle tracks</h3>
      <p className="text-sm text-[var(--admin-muted)]">Tracks for this video language are shared by its saved qualities.</p>
      <ul className="divide-y divide-[var(--admin-border)]">
        {tracks.map((track) => (
          <li key={track.subtitleLanguage} className="flex flex-wrap items-center gap-3 py-2 text-sm">
            <span className="flex-1">{nameFor(track.subtitleLanguage)} · {track.name}</span>
            <Button type="button" variant="outline" size="sm" disabled={disabled || busy}
              onClick={() => { if (window.confirm("Remove this subtitle track?")) change("subtitle-remove", track); }}>Remove</Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">Subtitle language
          <select className="mt-1 block rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2"
            value={subtitleLanguage} onChange={(event) => setSubtitleLanguage(event.target.value)} disabled={disabled || busy}>
            <option value="">Select language</option>
            {languages.map((option) => <option key={option.code} value={option.code}>{option.englishName}</option>)}
          </select>
        </label>
        <label className="min-w-44 flex-1 text-sm">Subtitle file (.vtt or .srt)
          <Input ref={input} type="file" accept=".vtt,.srt" disabled={disabled || busy}
            onChange={(event) => setFile(event.target.files[0] ?? null)} />
        </label>
        <Button type="button" disabled={!file || !subtitleLanguage || disabled || busy}
          onClick={() => change("subtitle-save")}>{busy ? "Saving…" : tracks.some((track) => track.subtitleLanguage === subtitleLanguage) ? "Replace track" : "Save track"}</Button>
      </div>
      {status && <p role="status" className="text-sm">{status}</p>}
      {error && <p role="alert" className="tvk-validation text-sm">{error}</p>}
    </section>
  );
}

export default function MovieAssetWorkspace({ movie, section, entries, tracks, languages, onChange, onTrackChange, readDuration, disabled, subtitlesEnabled: enabled, onSubtitleToggle, onPublish, onSaveDraft, onLanguageAvailability, publishing }) {
  const [toggleError, setToggleError] = useState("");
  const [savingToggle, setSavingToggle] = useState(false);
  const saved = movie.localizations || [];
  const variants = (movie.selectedLanguageCodes || saved.map((row) => row.language))
    .map((language) => saved.find((row) => row.language === language) || { language });
  const [selection, setSelection] = useState("");
  const [previewRequest, setPreviewRequest] = useState(null);
  const previewAnchor = useRef(null);

  useEffect(() => {
    if (previewRequest) previewAnchor.current?.scrollIntoView({ block: "nearest" });
  }, [previewRequest]);
  const current = variants.find((row) => row.language === selection) || variants.find((row) => row.language === movie.primaryLanguage) || variants[0];
  const nameForLanguage = (code) => languages.find((option) => option.code === code)?.englishName || code;

  const ready = isLocalizationReady(current);
  const inactive = movie.inactiveMovieLanguages || [];
  const currentIsActive = !inactive.includes(current?.language);
  const primary = variants.find((row) => row.language === movie.primaryLanguage);
  const artwork = primary ? primary.bannerUrl || primary.posterUrl : movie.bannerUrl || movie.posterUrl;

  if (!current) return <p className="text-sm text-[var(--admin-muted)]">Save at least one language in Details to manage its video and subtitle files.</p>;

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="space-y-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
        {artwork && <img src={artwork}
          alt="" className="aspect-video w-full rounded-lg object-cover" />}
        <h2 className="font-semibold">Movie info</h2>
        <dl className="space-y-2 text-sm text-[var(--admin-muted)]">
          <div className="flex justify-between gap-2"><dt>Saved video files</dt><dd>{entries.filter((row) => row.asset).length}</dd></div>
          <div className="flex justify-between gap-2"><dt>Subtitle tracks</dt><dd>{tracks.length}</dd></div>
          <div className="flex justify-between gap-2"><dt>Languages</dt><dd>{variants.length}</dd></div>
        </dl>
      </aside>
      <div className="min-w-0 space-y-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 sm:p-5">
        <h2 className="font-semibold">{section === "video-assets" ? "Video Assets" : "Subtitles"}</h2>
        <div role="group" aria-label="Movie asset language" className="flex flex-wrap gap-2">
          {variants.map(({ language }) => <Button key={language} type="button" size="sm"
            variant={current.language === language ? "primary" : "outline"} aria-pressed={current.language === language}
            onClick={() => setSelection(language)}>{nameForLanguage(language)}{language === movie.primaryLanguage && " · Primary"}{inactive.includes(language) && " · Inactive"}</Button>)}
        </div>
        {section === "video-assets" && saved.some((row) => row.language === current.language) && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] p-3">
            <div>
              <p className="text-sm font-semibold">{nameForLanguage(current.language)} · {currentIsActive ? "Active" : "Inactive"}</p>
              <p className="text-sm text-[var(--admin-muted)]">Inactive languages are hidden in the app. Their files stay in the studio.</p>
            </div>
            {onLanguageAvailability && <Button type="button" variant="outline" disabled={publishing}
              onClick={() => onLanguageAvailability(current.language, !currentIsActive)}>
              {currentIsActive ? "Make inactive" : "Make active"}
            </Button>}
          </div>
        )}
        {section === "subtitles" && <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={enabled} disabled={disabled || savingToggle} onChange={async (event) => {
            const next = event.target.checked;
            setSavingToggle(true);
            setToggleError("");
            try {
              await mediaRequest(movie._id, "subtitle-toggle", { enabled: next });
              onSubtitleToggle(next);
            } catch (error) { setToggleError(error.message); }
            finally { setSavingToggle(false); }
          }} /> Enable subtitles
        </label>}
        {toggleError && <p role="alert" className="tvk-validation">{toggleError}</p>}
        {!ready ? <p role="alert" className="tvk-validation text-sm">
          Save {nameForLanguage(current.language)} title, description, poster, and banner in Details before uploading.
        </p> : section === "video-assets" ? <MovieQualityUploads key={current.language} movieId={movie._id} language={current.language}
          entries={entries.filter((row) => row.language === current.language)} onChange={onChange}
          onPreview={(row) => setPreviewRequest({ language: row.language, quality: row.quality })}
          readDuration={readDuration} disabled={disabled} /> : enabled ? (
          <MovieSubtitleLibrary key={current.language} movieId={movie._id} language={current.language} languages={languages}
            tracks={tracks.filter((track) => track.language === current.language)}
            onChange={(code, track) => onTrackChange(current.language, code, track)} disabled={disabled} />
        ) : <p className="text-sm">Subtitles are optional. Enable them to attach tracks.</p>}
        {onPublish && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] pt-3">
          <p className="text-sm">{nameForLanguage(current.language)} · {!currentIsActive ? "Inactive" : movie.isActive && movie.publishedLanguages?.includes(current.language) ? "Published" : "Draft"}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={publishing} onClick={onSaveDraft}>Save Draft</Button>
            <Button type="button" disabled={publishing || !currentIsActive || !ready || !entries.some((row) => row.language === current.language && row.asset)}
              onClick={() => onPublish(current.language)}>
              {publishing ? "Saving…" : `Publish ${nameForLanguage(current.language)}`}
            </Button>
          </div>
        </div>}
        <div ref={previewAnchor} className="scroll-mt-24">
          <MoviePreview movieId={movie._id} entries={entries} tracks={enabled ? tracks : []} nameForLanguage={nameForLanguage} requested={previewRequest} />
        </div>
      </div>
    </div>
  );
}
