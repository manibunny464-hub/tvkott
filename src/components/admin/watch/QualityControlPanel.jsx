import React from 'react';
import { Copy } from 'lucide-react';

export default function QualityControlPanel({ qualities = [], activePlayingQuality = 'Auto', onToggleQuality, notify }) {
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleCopy = (path) => {
    if (!path) return;
    navigator.clipboard.writeText(path);
    notify('S3 path copied to clipboard!');
  };

  return (
    <div className="bg-white border border-[#f4c3d9] rounded-xl p-5 shadow-xl text-slate-900">
      <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#d61f7a] mb-4">
        Quality Control Center
      </h3>
      <div className="space-y-3">
        {/* Show all uploaded qualities first, then any standard tiers not yet uploaded */}
        {(() => {
          const standard = ['4k', '1080p', '720p', '480p', '360p'];
          const uploaded = qualities.map((q) => q.quality);
          const combined = [...new Set([...uploaded, ...standard])].sort(
            (a, b) => standard.indexOf(a) - standard.indexOf(b)
          );
          return combined;
        })().map((q) => {
          const qConfig = qualities.find((item) => item.quality === q) || {
            quality: q,
            enabled: true,
            status: 'pending',
            size: 0,
            s3Path: '',
          };

          const { enabled, status, size, s3Path } = qConfig;
          const isReady = status === 'ready' || status === 'completed' || status === 'live';
          const isProcessing = status === 'processing' || status === 'queued' || status === 'uploading';
          const isFailed = status === 'failed';
          const isActive = activePlayingQuality === q;

          let statusLabel = 'Pending';
          let barColor = 'bg-slate-200';
          let progressPercent = 0;

          if (!enabled) {
            statusLabel = 'Disabled';
            barColor = 'bg-slate-300';
            progressPercent = 100;
          } else if (isReady) {
            statusLabel = 'Ready';
            barColor = 'bg-[#ff4fa3]';
            progressPercent = 100;
          } else if (isProcessing) {
            statusLabel = 'Processing';
            barColor = 'bg-amber-500';
            progressPercent = 45;
          } else if (isFailed) {
            statusLabel = 'Failed';
            barColor = 'bg-rose-500';
            progressPercent = 100;
          } else {
            statusLabel = 'Pending';
            barColor = 'bg-slate-300';
          }

          return (
            <div
              key={q}
              className={`relative rounded-xl border p-4 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                !enabled
                  ? 'bg-slate-50 border-slate-200 opacity-70'
                  : isActive
                  ? 'bg-[#fff0f6] border-[#ff9ec6] shadow-inner'
                  : 'bg-white border-[#f4e1ea] hover:border-[#f4c3d9]'
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center flex-wrap gap-2.5">
                  <span
                    className={`font-display font-black text-lg select-none ${
                      !enabled ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {q}
                  </span>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-[4px] border uppercase ${
                      !enabled
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : isReady
                        ? 'bg-[#fff0f6] text-[#b31263] border-[#f4c3d9]'
                        : isProcessing
                        ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                        : isFailed
                        ? 'bg-rose-50 text-rose-500 border-rose-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {statusLabel}
                  </span>

                  {isActive && isReady && enabled && (
                    <span className="text-[9px] font-black bg-[#ff4fa3] text-white px-2 py-0.5 rounded-[4px]">
                      Now Playing
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${progressPercent}%` }} />
                  </div>
                  {isReady && size > 0 && (
                    <span className="text-[10px] text-slate-500 font-semibold font-mono shrink-0 select-none">
                      {formatBytes(size)}
                    </span>
                  )}
                </div>

                {s3Path && (
                  <div className="flex items-center gap-2 max-w-full">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider select-none shrink-0">
                      S3 Path:
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate select-all flex-1">{s3Path}</span>
                    <button
                      onClick={() => handleCopy(s3Path)}
                      className="p-1 text-slate-400 hover:text-[#d61f7a] rounded hover:bg-[#fff0f6] shrink-0 transition cursor-pointer border-0 bg-transparent"
                      title="Copy S3 Path"
                    >
                      <Copy size={11} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <span className="text-xs font-semibold text-slate-500">{enabled ? 'Enabled' : 'Disabled'}</span>
                <button
                  type="button"
                  onClick={() => onToggleQuality(q, !enabled)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    enabled ? 'bg-[#ff4fa3]' : 'bg-slate-300'
                  }`}
                  title={enabled ? `Disable ${q}` : `Enable ${q}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
