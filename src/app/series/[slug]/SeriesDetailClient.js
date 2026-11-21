'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tv, 
  Play, 
  Calendar, 
  Globe, 
  ShieldAlert, 
  Tag, 
  Users, 
  ArrowLeft,
  Loader2,
  Clock,
  Sparkles
} from 'lucide-react';

export default function SeriesDetailClient({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSeasonId, setActiveSeasonId] = useState('');
  const [playTrailer, setPlayTrailer] = useState(false);



  useEffect(() => {
    setLoading(true);
    fetch(`/api/series/by-slug/${slug}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setData(payload.series);
          if (payload.series.seasons?.length > 0) {
            setActiveSeasonId(payload.series.seasons[0]._id || payload.series.seasons[0].id);
          }
        } else {
          setError(payload.message || 'Failed to load series details');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('An error occurred while fetching details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);



  if (loading) {
    return (
      <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF2D78]" />
        <p className="mt-4 text-sm font-semibold tracking-wider text-slate-400">Loading series details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-[#12152A] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
          <ShieldAlert className="h-12 w-12 text-[#FF2D78] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-400 mb-6">{error || 'Series not found'}</p>
          <Link 
            href="/admin/series" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF2D78] hover:bg-[#E02065] text-white rounded-xl text-xs font-bold transition duration-200"
          >
            <ArrowLeft size={16} /> Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const activeSeason = data.seasons?.find((s) => (s._id || s.id) === activeSeasonId);
  const coverUrl = data.bannerUrl || data.posterUrl || data.thumbnailUrl || '';

  return (
    <div className="min-h-screen bg-[#070913] text-white font-sans selection:bg-[#FF2D78] selection:text-white">
      {/* Dynamic styles */}
      <style jsx global>{`
        body {
          background-color: #070913;
        }
        .cast-avatar:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(255, 45, 120, 0.4);
          border-color: #FF2D78;
        }
        .episode-card:hover .play-overlay {
          opacity: 1;
        }
      `}</style>

      {/* Hero Banner Area */}
      <div className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden">
        {/* Background Image with Blurs and Gradients */}
        <div className="absolute inset-0 bg-black">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt="" 
              className="w-full h-full object-cover opacity-35 scale-105 filter blur-lg md:blur-none"
            />
          ) : (
            <div className="w-full h-full bg-[#12152A] flex items-center justify-center">
              <Tv size={80} className="text-slate-700" />
            </div>
          )}
          {/* Radial mask & linear bottom overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#070913]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070913] via-transparent to-transparent hidden md:block" />
        </div>

        {/* Back navigation */}
        <div className="absolute top-6 left-6 z-30">
          <Link 
            href="/admin/series" 
            className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-xl text-xs font-bold border border-white/10 backdrop-blur-md transition"
          >
            <ArrowLeft size={14} /> Back to Library
          </Link>
        </div>

        {/* Hero content details */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 pb-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            
            {/* Left Card Poster */}
            <div className="w-36 md:w-56 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#12152A] hidden sm:block transform hover:scale-[1.02] transition duration-300">
              {data.posterUrl ? (
                <img src={data.posterUrl} alt={data.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tv size={48} className="text-slate-600" />
                </div>
              )}
            </div>

            {/* Right Information Details */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {data.pricing === 'premium' ? (
                  <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-md">
                    Premium
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-md">
                    Free
                  </span>
                )}
                {data.isTrending && (
                  <span className="px-2.5 py-0.5 bg-[#FF2D78]/20 border border-[#FF2D78]/40 text-[#FF2D78] text-[10px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
                    <Sparkles size={10} /> Trending
                  </span>
                )}
                {data.isComingSoon && (
                  <span className="px-2.5 py-0.5 bg-violet-500/20 border border-violet-500/40 text-violet-400 text-[10px] font-black uppercase tracking-wider rounded-md">
                    Coming Soon
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight font-display drop-shadow-md text-white leading-tight">
                {data.title}
              </h1>

              {/* Specs line */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-[#FF2D78]" /> {data.releaseYear}
                </span>
                {data.ageRating && (
                  <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-white border border-white/10">
                    {data.ageRating}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Globe size={13} className="text-[#FF2D78]" /> {Array.isArray(data.language) ? data.language.join(', ') : data.language}
                </span>
                <span className="text-slate-400">
                  {data.seasons?.length || 0} Season(s)
                </span>
              </div>

              {/* Genre badges */}
              {Array.isArray(data.genres) && data.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {data.genres.map((g) => (
                    <span 
                      key={g} 
                      className="px-3 py-1 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-slate-200 transition"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="max-w-3xl text-sm md:text-base text-slate-300 leading-relaxed drop-shadow">
                {data.description || 'No description available for this series.'}
              </p>

              {/* Actions row */}
              {data.trailerUrl && (
                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setPlayTrailer(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF2D78] hover:bg-[#E02065] text-white font-bold rounded-xl text-sm transition transform hover:scale-[1.02] shadow-xl shadow-[#FF2D78]/20"
                  >
                    <Play size={16} fill="currentColor" /> Play Trailer
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16">
        
        {/* Cast & Crew Section */}
        {data.cast && data.cast.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="text-[#FF2D78] h-5 w-5" />
              <h2 className="text-xl font-bold tracking-wider uppercase text-white">Cast &amp; Crew</h2>
            </div>
            
            <div className="flex flex-wrap gap-6 md:gap-8">
              {data.cast.map((artist, idx) => (
                <div key={idx} className="flex flex-col items-center text-center shrink-0 w-24 md:w-28 group">
                  {/* Round circular portrait avatar image */}
                  <div className="cast-avatar w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/10 overflow-hidden bg-[#12152A] transition-all duration-300 transform">
                    {artist.imageUrl ? (
                      <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#1E2340] text-slate-400 font-bold text-lg">
                        {artist.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Text labels */}
                  <span className="mt-3 font-semibold text-xs text-white truncate w-full group-hover:text-[#FF2D78] transition">
                    {artist.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 truncate w-full">
                    {artist.role}
                  </span>


                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seasons & Episodes Grid Section */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Tv className="text-[#FF2D78] h-5 w-5" />
              <h2 className="text-xl font-bold tracking-wider uppercase text-white">Seasons &amp; Episodes</h2>
            </div>
            
            {/* Season select tabs */}
            {data.seasons && data.seasons.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {data.seasons.map((season) => {
                  const sId = season._id || season.id;
                  const isActive = sId === activeSeasonId;
                  return (
                    <button
                      key={sId}
                      onClick={() => setActiveSeasonId(sId)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition border whitespace-nowrap ${
                        isActive 
                          ? 'bg-[#FF2D78] border-[#FF2D78] text-white' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      Season {season.seasonNumber}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Episode items grid */}
          {activeSeason && activeSeason.episodes?.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeSeason.episodes.map((ep) => (
                <div 
                  key={ep.id} 
                  className="episode-card bg-[#12152A] border border-white/5 rounded-2xl overflow-hidden hover:border-[#FF2D78]/40 transition duration-300 flex flex-col group"
                >
                  {/* Thumbnail area */}
                  <div className="relative aspect-video bg-black overflow-hidden shrink-0">
                    {ep.thumbnailUrl ? (
                      <img src={ep.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Tv size={36} />
                      </div>
                    )}
                    
                    {/* Dark gradient and Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link 
                        href={`/admin/watch/${ep.id}`}
                        className="p-3 bg-[#FF2D78] hover:bg-[#E02065] text-white rounded-full transition transform hover:scale-110 shadow-lg"
                      >
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                      </Link>
                    </div>

                    {/* Free/Premium flag label */}
                    <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow ${
                      ep.isFree ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {ep.isFree ? 'Free' : 'Premium'}
                    </span>
                  </div>

                  {/* Body text details */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#FF2D78]">
                        Episode {ep.episodeNumber}
                      </div>
                      <h3 className="font-bold text-white text-base mt-1 line-clamp-1 group-hover:text-[#FF2D78] transition">
                        {ep.title || `Episode ${ep.episodeNumber}`}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {ep.description || 'No summary description details provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 mt-4 pt-3 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {ep.duration ? `${Math.round(ep.duration / 60)}m` : '0m'}
                      </span>
                      <Link 
                        href={`/admin/watch/${ep.id}`}
                        className="ml-auto text-[#FF2D78] hover:underline font-bold"
                      >
                        Play Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-[#12152A] rounded-2xl border border-white/5">
              <p className="text-slate-400 text-sm">No episodes configured for this season yet.</p>
            </div>
          )}

          {/* Season Cast & Crew subset if available */}
          {activeSeason && activeSeason.cast && activeSeason.cast.length > 0 && (
            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex items-center gap-2">
                <Users className="text-[#FF2D78] h-4 w-4" />
                <h3 className="text-base font-bold tracking-wider uppercase text-white">Season Cast &amp; Crew</h3>
              </div>
              <div className="flex flex-wrap gap-6 md:gap-8">
                {activeSeason.cast.map((artist, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center shrink-0 w-24 md:w-28 group">
                    <div className="cast-avatar w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/10 overflow-hidden bg-[#12152A] transition-all duration-300 transform">
                      {artist.imageUrl ? (
                        <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1E2340] text-slate-400 font-bold text-sm">
                          {artist.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <span className="mt-2 font-semibold text-[11px] text-white truncate w-full group-hover:text-[#FF2D78] transition">
                      {artist.name}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 truncate w-full">
                      {artist.role}
                    </span>


                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trailer Play Overlay Modal */}
      {playTrailer && data.trailerUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setPlayTrailer(false)}
              className="absolute top-4 right-4 text-white hover:text-[#FF2D78] bg-black/60 p-2 rounded-full border border-white/10 transition z-10"
              title="Close Trailer"
            >
              ✕
            </button>
            <div className="aspect-video w-full">
              <video 
                src={data.trailerUrl} 
                controls 
                autoPlay 
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div> 
  );
}