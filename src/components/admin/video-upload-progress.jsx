export default function VideoUploadProgress({ percent, paused, label = paused ? "⏸ Paused" : "Uploading" }) {
  return <div className="space-y-1">
    <div className={`text-[10px] font-black ${paused ? "text-amber-600" : "text-blue-600"}`}>
      {label} — {percent}%
    </div>
    <div role="progressbar" aria-label="Video upload progress" aria-valuenow={percent}
      className="h-2 w-full overflow-hidden rounded-full bg-[var(--admin-soft)]">
      <div className={`h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${paused ? "bg-amber-400" : "bg-gradient-to-r from-blue-500 to-cyan-400"}`}
        style={{ width: `${percent}%` }} />
    </div>
  </div>;
}
