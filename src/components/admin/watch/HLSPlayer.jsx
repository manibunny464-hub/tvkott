/* eslint-disable react-hooks/set-state-in-effect */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, SkipBack, SkipForward, Settings, Maximize, Volume2, VolumeX, Loader2 } from 'lucide-react';

export default function HLSPlayer({
  src,
  poster,
  qualities = [],
  isHls = true,
  onPrevEpisode,
  onNextEpisode,
  hasPrev,
  hasNext,
  onQualityChange,
  initialSeekTime = 0,
  onProgressUpdate,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsInstanceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [activeQuality, setActiveQuality] = useState('Auto');
  const [loading, setLoading] = useState(true);

  // Available levels from HLS.js load
  const [hlsLevels, setHlsLevels] = useState([]);
  const hasSeekedRef = useRef(false);
  const lastPingRef = useRef(0);

  useEffect(() => {
    hasSeekedRef.current = false;
  }, [src]);

  const selectQuality = useCallback(
    (qualityLabel) => {
      const hlsInstance = hlsInstanceRef.current;

      // For non-HLS (manual uploaded video files) — just notify parent to swap src
      if (!hlsInstance) {
        setActiveQuality(qualityLabel);
        if (onQualityChange) onQualityChange(qualityLabel);
        setShowQualityMenu(false);
        return;
      }

      if (qualityLabel === 'Auto') {
        hlsInstance.currentLevel = -1;
        setActiveQuality('Auto');
        if (onQualityChange) onQualityChange('Auto');
      } else {
        const targetHeight = parseInt(qualityLabel, 10);
        const levelIdx = hlsInstance.levels.findIndex(
          (lvl) => lvl.height === targetHeight || (lvl.name && lvl.name.includes(qualityLabel))
        );
        if (levelIdx !== -1) {
          hlsInstance.currentLevel = levelIdx;
          setActiveQuality(qualityLabel);
          if (onQualityChange) onQualityChange(qualityLabel);
        }
      }
      setShowQualityMenu(false);
    },
    [onQualityChange]
  );

  useEffect(() => {
    if (!src || !videoRef.current) return;

    setLoading(true);
    const videoEl = videoRef.current;
    let hls;

    if (isHls && Hls.isSupported()) {
      hls = new Hls({
        autoStartLoad: true,
        startLevel: -1,
      });

      hls.loadSource(src);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setHlsLevels(hls.levels);
        setLoading(false);
        if (!hasSeekedRef.current && initialSeekTime > 0) {
          videoEl.currentTime = initialSeekTime;
          hasSeekedRef.current = true;
        }
        videoEl.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = hls.levels[data.level];
        if (level && hls.currentLevel === -1) {
          const q = level.height ? `${level.height}p` : 'Auto';
          if (onQualityChange) onQualityChange(q);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              break;
          }
        }
      });

      hlsInstanceRef.current = hls;
    } else {
      hlsInstanceRef.current = null;
      videoEl.src = src;
      const clearLoading = () => {
        setLoading(false);
        if (!hasSeekedRef.current && initialSeekTime > 0) {
          videoEl.currentTime = initialSeekTime;
          hasSeekedRef.current = true;
        }
      };
      videoEl.addEventListener('loadedmetadata', clearLoading, { once: true });
      videoEl.addEventListener('canplay', clearLoading, { once: true });
      videoEl.load();
      videoEl.play().catch(() => {});
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (hlsInstanceRef.current === hls) {
        hlsInstanceRef.current = null;
      }
    };
  }, [src, isHls, onQualityChange, initialSeekTime]);

  useEffect(() => {
    const hlsInstance = hlsInstanceRef.current;
    if (!hlsInstance || !hlsLevels.length) return;

    if (activeQuality !== 'Auto') {
      const qConfig = qualities.find((q) => q.quality === activeQuality);
      if (qConfig && !qConfig.enabled) {
        selectQuality('Auto');
      }
    }
  }, [qualities, hlsLevels, activeQuality, selectQuality]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    const now = Date.now();
    if (now - lastPingRef.current >= 5000) {
      lastPingRef.current = now;
      if (onProgressUpdate) {
        onProgressUpdate(time, videoRef.current.duration);
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (videoRef.current && onProgressUpdate) {
      onProgressUpdate(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && onProgressUpdate) {
        onProgressUpdate(videoRef.current.currentTime, videoRef.current.duration);
      }
    };
  }, [onProgressUpdate]);

  const handleDurationChange = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const val = Number(e.target.value);
    videoRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;
    const val = Number(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full bg-black rounded-xl overflow-hidden group shadow-2xl border border-[#f4c3d9]"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        className="w-full h-full cursor-pointer bg-black"
        preload="auto"
      />

      {/* Loading Spinner overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
          <Loader2 className="animate-spin text-[#ff4fa3] w-12 h-12" />
        </div>
      )}

      {/* Custom Video Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0b1324]/90 via-[#0b1324]/45 to-transparent p-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        
        {/* Seek bar */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/30 accent-[#ff4fa3] rounded-lg appearance-none cursor-pointer hover:h-2 transition-all"
          />
        </div>

        {/* Buttons and controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 text-white hover:text-[#ff4fa3] transition bg-transparent border-0 cursor-pointer"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>

            {/* Prev Episode */}
            <button
              disabled={!hasPrev}
              onClick={onPrevEpisode}
              className="p-1.5 text-white hover:text-[#ff4fa3] transition disabled:opacity-30 disabled:hover:text-white bg-transparent border-0 cursor-pointer"
              title="Previous Episode"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            {/* Next Episode */}
            <button
              disabled={!hasNext}
              onClick={onNextEpisode}
              className="p-1.5 text-white hover:text-[#ff4fa3] transition disabled:opacity-30 disabled:hover:text-white bg-transparent border-0 cursor-pointer"
              title="Next Episode"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1.5 text-white hover:text-[#ff4fa3] transition bg-transparent border-0 cursor-pointer"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/25 accent-[#ff4fa3] rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Time labels */}
            <span className="text-xs text-slate-300 font-mono select-none ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Quality Picker Button */}
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className={`p-1.5 text-white hover:text-[#ff4fa3] transition bg-transparent border-0 cursor-pointer ${
                showQualityMenu ? 'text-[#ff4fa3]' : ''
              }`}
              title="Playback Quality"
            >
              <Settings size={18} />
            </button>

            {/* Quality Menu Overlay */}
            {showQualityMenu && (
              <div className="absolute bottom-10 right-0 w-36 bg-white/98 border border-[#f4c3d9] rounded-lg py-1 shadow-2xl flex flex-col z-30 font-semibold text-xs text-slate-700">
                <p className="px-3 py-1.5 border-b border-[#f4e1ea] text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Quality
                </p>
                
                {/* Auto Mode */}
                <button
                  type="button"
                  onClick={() => selectQuality('Auto')}
                  className={`px-3 py-2 text-left hover:bg-white/5 transition flex items-center justify-between border-0 bg-transparent cursor-pointer ${
                    activeQuality === 'Auto' ? 'text-[#d61f7a]' : ''
                  }`}
                >
                  <span>Auto</span>
                  {activeQuality === 'Auto' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff4fa3]" />}
                </button>

                {/* Qualities resolution list — dynamic for manual files, fallback list for HLS */}
                {(
                  !isHls && qualities.length > 0
                    ? qualities.map((q) => q.quality)
                    : ['4k', '1080p', '720p', '480p', '360p']
                ).map((q) => {
                  const qConfig = qualities.find((item) => item.quality === q);
                  // For manual files every uploaded quality is immediately available
                  const isEnabled = qConfig ? qConfig.enabled !== false : true;
                  const isAvailable = !isHls
                    ? Boolean(qConfig)           // exists in the list → ready
                    : qConfig
                      ? qConfig.status === 'ready' || qConfig.status === 'completed' || qConfig.status === 'live'
                      : false;

                  const isSelectable = isEnabled && isAvailable;

                  return (
                    <button
                      key={q}
                      disabled={!isSelectable}
                      type="button"
                      onClick={() => selectQuality(q)}
                      className={`px-3 py-2 text-left hover:bg-[#fff0f6] transition flex items-center justify-between border-0 bg-transparent ${
                        !isSelectable ? 'opacity-30 cursor-not-allowed text-slate-400' : 'cursor-pointer'
                      } ${activeQuality === q ? 'text-[#d61f7a]' : ''}`}
                    >
                      <span className={!isEnabled ? 'line-through' : ''}>{q}</span>
                      {activeQuality === q && <span className="w-1.5 h-1.5 rounded-full bg-[#ff4fa3]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-white hover:text-[#ff4fa3] transition bg-transparent border-0 cursor-pointer"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
