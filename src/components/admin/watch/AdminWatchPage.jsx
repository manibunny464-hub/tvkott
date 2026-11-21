'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2, Film, Loader2, Menu, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import HLSPlayer from './HLSPlayer';
import QualityControlPanel from './QualityControlPanel';

export default function AdminWatchPage({ episodeId, initialEpisode, initialSeries, initialSeason }) {
  const [streamData, setStreamData] = useState(null);
  const [adjacent, setAdjacent] = useState({ previousEpisodeId: null, nextEpisodeId: null });
  const [activePlayingQuality, setActivePlayingQuality] = useState('Auto');
  const [loadingStream, setLoadingStream] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [initialSeekTime, setInitialSeekTime] = useState(0);



  // Selected language state
  const languages = initialEpisode.languages || [];
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]?.language || 'Default');

  // Find the selected language's files
  const currentLang = languages.find((l) => l.language === selectedLanguage) || languages[0];
  const videoFiles = currentLang?.videoFiles || [];

  // player qualities from the selected language's manual files
  const manualQualities = videoFiles.map((vf) => ({
    quality: vf.quality,
    enabled: true,
    status: 'ready'
  }));

  // pick highest quality by default if not set
  let manualPlaybackUrl = '';
  if (videoFiles.length > 0) {
    let target = videoFiles.find((vf) => vf.quality === activePlayingQuality);
    if (!target) {
      const order = ['4k', '1080p', '720p', '480p', '360p'];
      target = videoFiles.slice().sort((a, b) => {
        return order.indexOf(a.quality) - order.indexOf(b.quality);
      })[0];
    }
    if (target) {
      manualPlaybackUrl = target.videoUrl;
    }
  }

  const qualities = videoFiles.length > 0
    ? manualQualities
    : (streamData?.qualities || []);

  const playbackUrl = videoFiles.length > 0
    ? manualPlaybackUrl
    : (streamData?.playbackUrl || streamData?.manifestUrl || null);

  const isHls = videoFiles.length > 0
    ? false
    : (streamData?.streamType !== 'direct');

  const notify = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const parentId = initialSeries?._id || episodeId;
        const res = await fetch(`/api/user/progress?contentId=${parentId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.progress)) {
          const match = data.progress.find((p) => p.episodeId === episodeId || (!p.episodeId && parentId === episodeId));
          if (match && match.watchedSeconds > 0) {
            setInitialSeekTime(match.watchedSeconds);
          }
        }
      } catch (err) {
        console.error('Failed to load watch progress:', err);
      }
    };
    loadProgress();
  }, [episodeId, initialSeries?._id]);

  const handleProgressUpdate = async (watchedSeconds, totalSeconds) => {
    try {
      const parentId = initialSeries?._id || episodeId;
      await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: parentId,
          episodeId: parentId === episodeId ? null : episodeId,
          watchedSeconds: Math.round(watchedSeconds),
          totalSeconds: Math.round(totalSeconds),
        }),
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  useEffect(() => {
    if (!episodeId) return undefined;

    let active = true;
    const loadData = async () => {
      setLoadingStream(true);
      try {
        const streamRes = await fetch(`/api/episodes/${episodeId}/stream`);
        const streamData = await streamRes.json();
        if (active && streamData.success) {
          setStreamData(streamData);
        } else if (active) {
          // If we have manual videoFiles, we don't need to treat API failure as a complete block
          if (videoFiles.length === 0) {
            notify('Failed to load streaming details', 'error');
          }
        }

        const adjRes = await fetch(`/api/episodes/${episodeId}/adjacent`);
        const adjData = await adjRes.json();
        if (active && adjData.success) setAdjacent(adjData);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingStream(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [episodeId, videoFiles.length]);

  const handleToggleQuality = async (quality, enabled) => {
    try {
      const res = await fetch(`/api/episodes/${episodeId}/qualities/${quality}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setStreamData((prev) => ({ ...prev, qualities: data.qualities }));
        notify(`${quality} ${enabled ? 'enabled. Users can now select this quality.' : 'disabled. Users will not see this quality.'}`);
      } else {
        notify(data.message || 'Failed to toggle quality', 'error');
      }
    } catch {
      notify('Server error toggling quality', 'error');
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/admin/watch/${episodeId}`;
    navigator.clipboard.writeText(shareUrl);
    notify('Watch link copied to clipboard!');
  };

  const title = `Episode ${initialEpisode.episodeNumber}: ${initialEpisode.title}`;
  const subtitle = [
    initialSeries?.title,
    initialSeason?.title || (initialSeason?.seasonNumber ? `Season ${initialSeason.seasonNumber}` : null),
  ]
    .filter(Boolean)
    .join(' / ');
  const poster = initialEpisode.thumbnailUrl || initialSeries?.bannerUrl || '';

  return (
    <div className="min-h-screen bg-[#fff7fb] text-slate-900 flex flex-col font-sans select-none">
      <div className="fixed right-4 top-4 z-[90] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3.5 rounded-lg border text-xs font-bold shadow-xl transition-all duration-300 flex justify-between items-center ${
              t.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-[#f4c3d9] text-[#b31263]'
            }`}
          >
            <span>{t.message}</span>
            <button
              onClick={() => setToasts((current) => current.filter((x) => x.id !== t.id))}
              className="ml-2 text-slate-400 hover:text-[#d61f7a] cursor-pointer border-0 bg-transparent"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-30 border-b border-[#ffe0ee] bg-white/90 backdrop-blur-xl px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/series"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#d61f7a] transition"
          >
            <ArrowLeft size={14} /> Back to Series
          </Link>
          <div className="h-4 w-px bg-[#f4e1ea] hidden sm:block" />
          <span className="text-xs text-slate-500 font-semibold truncate max-w-[200px] sm:max-w-[400px] hidden sm:block">
            {subtitle} · {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[#ff4fa3] mr-2">Admin Watch Player</span>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 text-slate-400 hover:text-[#d61f7a] rounded hover:bg-[#fff0f6] transition border-0 bg-transparent cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* Language tab selector — always visible when episode has languages */}
      {languages.length > 0 && (
        <div className="flex border-b border-[#ffe0ee] bg-white px-5 py-2 gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 self-center mr-1">Language:</span>
          {languages.map((l) => (
            <button
              key={l.language}
              onClick={() => {
                setSelectedLanguage(l.language);
                setActivePlayingQuality('Auto'); // Reset quality on language switch
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer border-0 ${
                selectedLanguage === l.language
                  ? 'bg-[#ff4fa3] text-white'
                  : 'bg-transparent text-slate-500 hover:text-[#d61f7a] hover:bg-[#fff0f6]'
              }`}
            >
              {l.language}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 p-5">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl bg-white border border-[#f4c3d9] shadow-[0_20px_60px_rgba(255,79,163,0.10)]">
            {loadingStream && videoFiles.length === 0 ? (
              <div className="aspect-video w-full flex items-center justify-center bg-[#fff7fb]">
                <Loader2 className="animate-spin text-[#ff4fa3] w-10 h-10" />
              </div>
            ) : playbackUrl ? (
              <HLSPlayer
                src={playbackUrl}
                poster={poster}
                qualities={qualities}
                isHls={isHls}
                onPrevEpisode={() => {
                  if (adjacent.previousEpisodeId) window.location.href = `/admin/watch/${adjacent.previousEpisodeId}`;
                }}
                onNextEpisode={() => {
                  if (adjacent.nextEpisodeId) window.location.href = `/admin/watch/${adjacent.nextEpisodeId}`;
                }}
                hasPrev={Boolean(adjacent.previousEpisodeId)}
                hasNext={Boolean(adjacent.nextEpisodeId)}
                onQualityChange={setActivePlayingQuality}
                initialSeekTime={initialSeekTime}
                onProgressUpdate={handleProgressUpdate}
              />
            ) : (
              <div className="aspect-video w-full flex flex-col items-center justify-center bg-[#fff7fb] text-center p-6 space-y-3">
                <AlertCircle className="text-rose-500 w-12 h-12 animate-bounce" />
                <div>
                  <p className="text-xl font-bold text-slate-900">Playback source missing</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    This episode has no HLS transcoding completed and no quality video uploads configured yet.
                  </p>
                </div>
              </div>
            )}
          </div>

          <QualityControlPanel
            qualities={qualities}
            activePlayingQuality={activePlayingQuality}
            onToggleQuality={handleToggleQuality}
            notify={notify}
          />
        </div>

        {showSidebar && (
          <aside className="space-y-4">
            <div className="rounded-xl border border-[#f4c3d9] bg-white overflow-hidden shadow-xl">
              <div className="aspect-video w-full overflow-hidden bg-[#fff7fb] border-b border-[#f4e1ea] relative">
                {poster ? (
                  <img src={poster} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400 bg-[#fff7fb]">
                    <Film size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1324]/65 to-transparent" />
                <span className="absolute bottom-3 left-3 bg-[#ff4fa3] text-white font-black text-[10px] px-2 py-0.5 rounded-[4px]">
                  S{initialSeason?.seasonNumber || 1} E{initialEpisode.episodeNumber}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-display font-black text-slate-900 text-base leading-tight">{initialEpisode.title}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">{subtitle}</p>
                </div>
                {initialEpisode.description && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-[#f4e1ea]">
                    {initialEpisode.description}
                  </p>
                )}
              </div>
            </div>



            <div className="rounded-xl border border-[#f4c3d9] bg-white p-4 shadow-xl space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Share Preview URL</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Quickly copy this watch link for other admins.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/admin/watch/${episodeId}` : ''}
                  className="bg-white border border-[#f4c3d9] rounded h-8 px-2 text-[10px] text-slate-700 font-mono select-all flex-1 focus:outline-none"
                />
                <button
                  onClick={copyShareLink}
                  className="h-8 w-8 rounded bg-[#fff0f6] hover:bg-[#ffe4f0] text-[#d61f7a] flex items-center justify-center shrink-0 border-0 cursor-pointer transition"
                  title="Copy link"
                >
                  <Share2 size={13} />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
