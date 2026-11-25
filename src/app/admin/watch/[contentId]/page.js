/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import mongoose from 'mongoose';
import AdminWatchPage from '@/components/admin/watch/AdminWatchPage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import dbConnect from '@/lib/db';
import s3 from '@/lib/s3';
import AdminSetting from '@/models/AdminSetting';
import Content from '@/models/Content';
import Episode from '@/models/Episode';
import Season from '@/models/Season';

function formatDuration(seconds) {
  const value = Number(seconds || 0);
  if (!value) return 'Not set';
  const minutes = Math.floor(value / 60);
  const remaining = value % 60;
  if (minutes < 60) return `${minutes}m ${remaining}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function displayStatus(status) {
  if (!status || status === 'queued' || status === 'completed') return 'Uploaded';
  if (status === 'live') return 'Live';
  if (status === 'failed') return 'Failed';
  if (status === 'processing') return 'Processing';
  if (status === 'uploading') return 'Uploading';
  return status;
}

async function resolveVideoUrl(content) {
  if (!content) return null;

  if (content.videoUrl?.startsWith('http://') || content.videoUrl?.startsWith('https://')) {
    return content.videoUrl;
  }

  if (content.hlsManifestUrl) return content.hlsManifestUrl;
  if (content.hlsMasterUrl) return content.hlsMasterUrl;

  const key = content.videoSource?.key || content.videoKey_HD || content.videoKey_SD || content.videoUrl;
  if (!key) return null;

  if (key.startsWith('http://') || key.startsWith('https://')) return key;

  const settings = await AdminSetting.findOne({ key: 'master-app-settings' }).lean();
  const bucket = content.videoSource?.bucket || settings?.storage?.bucket || process.env.S3_BUCKET_NAME;
  const cdnUrl = settings?.storage?.cdnUrl?.trim() || process.env.CDN_URL || process.env.CLOUDFRONT_URL || '';

  if (cdnUrl) return `${cdnUrl.replace(/\/$/, '')}/${key}`;
  if (!bucket) return null;

  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(s3, command, { expiresIn: 60 * 60 });
  } catch (err) {
    console.error('[admin/watch] Error signing URL:', err);
    return null;
  }
}

function resolveUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = (process.env.CDN_URL || process.env.CLOUDFRONT_URL || '').replace(/\/$/, '');
  if (base) return `${base}/${raw}`;
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${raw}`;
}

async function loadWatchContent(contentId) {
  if (!mongoose.Types.ObjectId.isValid(contentId)) return null;

  let content = await Content.findById(contentId).lean();
  if (content) return { kind: content.type || 'video', item: content, series: null, season: null };

  const episode = await Episode.findById(contentId).lean();
  if (!episode) return null;

  const [series, season] = await Promise.all([
    episode.seriesId ? Content.findById(episode.seriesId).lean() : null,
    episode.seasonId ? Season.findById(episode.seasonId).lean() : null,
  ]);

  const resolvedLanguages = (episode.languages || []).map((lang) => ({
    ...lang,
    thumbnailUrl: resolveUrl(lang.thumbnailUrl) || resolveUrl(episode.thumbnailUrl) || null,
    audioFile: resolveUrl(lang.audioFile) || null,
    videoFiles: (lang.videoFiles || []).map((vf) => ({
      ...vf,
      videoUrl: resolveUrl(vf.videoUrl) || null,
    })),
  }));

  const resolvedEpisode = {
    ...episode,
    thumbnailUrl: resolveUrl(episode.thumbnailUrl),
    languages: resolvedLanguages,
  };

  return { kind: 'episode', item: resolvedEpisode, series, season };
}

function EmptyPanel({ title, description }) {
  return (
    <main className="min-h-screen bg-[#09111f] px-5 py-8 text-white">
      <section className="mx-auto max-w-4xl rounded-[8px] border border-white/10 bg-[#0d1628] p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">TVK OTT Admin Preview</p>
        <h1 className="mt-4 text-3xl font-bold">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
        <Link
          href="/admin/series"
          className="mt-6 inline-flex h-10 items-center rounded-[8px] bg-cyan-300 px-4 text-sm font-bold text-[#06111f]"
        >
          Back to episodes
        </Link>
      </section>
    </main>
  );
}

export default async function WatchPage({ params }) {
  const { contentId } = await params;
  await dbConnect();

  const resolved = await loadWatchContent(contentId);
  if (!resolved) {
    return (
      <EmptyPanel
        title="Video not found"
        description="The requested admin preview does not exist, was deleted, or the link has an invalid ID."
      />
    );
  }

  const { item: content, kind, series, season } = resolved;

  if (kind === 'episode') {
    return (
      <AdminWatchPage
        episodeId={contentId}
        initialEpisode={JSON.parse(JSON.stringify(content))}
        initialSeries={series ? JSON.parse(JSON.stringify(series)) : null}
        initialSeason={season ? JSON.parse(JSON.stringify(season)) : null}
      />
    );
  }
  const videoUrl = await resolveVideoUrl(content);
  const poster = content.thumbnailUrl || content.posterUrl || content.bannerUrl || series?.bannerUrl || series?.posterUrl || '';
  const title = kind === 'episode' ? `Episode ${content.episodeNumber}: ${content.title}` : content.title;
  const subtitle = kind === 'episode'
    ? [series?.title, season?.title || (season?.seasonNumber ? `Season ${season.seasonNumber}` : null)].filter(Boolean).join(' / ')
    : [content.type, content.pricing].filter(Boolean).join(' / ');
  const status = displayStatus(content.transcodingStatus);
  const sourceLabel = content.videoSource?.key || content.videoKey_HD || content.videoKey_SD || content.videoUrl || content.hlsMasterUrl || 'No source configured';

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <div className="relative overflow-hidden border-b border-white/10 bg-[#0b1324]">
        {poster ? (
          <img
            src={poster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 blur-2xl"
          />
        ) : null}
        <div className="relative mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Admin Video Preview</p>
            <h1 className="mt-2 max-w-4xl text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm font-semibold text-slate-300">{subtitle}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={kind === 'episode' ? '/admin/series' : `/admin/movies/${contentId}/edit`}
              className="inline-flex h-10 items-center rounded-[8px] border border-white/15 px-4 text-sm font-bold text-slate-100 hover:bg-white/10"
            >
              Back to admin
            </Link>
            {videoUrl ? (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-[8px] bg-cyan-300 px-4 text-sm font-black text-[#06111f] hover:bg-cyan-200"
              >
                Open source
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-[8px] border border-white/10 bg-black shadow-2xl">
          {videoUrl ? (
            <video
              controls
              className="aspect-video w-full bg-black"
              controlsList="nodownload"
              poster={poster || undefined}
              preload="metadata"
            >
              <source src={videoUrl} type={content.videoSource?.contentType || 'video/mp4'} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="grid aspect-video place-items-center bg-[#020617] p-8 text-center">
              <div>
                <p className="text-2xl font-black">Playback source missing</p>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                  This item exists, but no video URL, HLS master URL, or raw storage key is configured yet.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[8px] border border-white/10 bg-[#0d1628] p-5 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Publishing</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[8px] bg-white/5 p-3">
                <p className="text-xs text-slate-400">Status</p>
                <p className="mt-1 font-black text-cyan-200">{status}</p>
              </div>
              <div className="rounded-[8px] bg-white/5 p-3">
                <p className="text-xs text-slate-400">Duration</p>
                <p className="mt-1 font-black">{formatDuration(content.duration)}</p>
              </div>
              <div className="rounded-[8px] bg-white/5 p-3">
                <p className="text-xs text-slate-400">Type</p>
                <p className="mt-1 font-black capitalize">{kind}</p>
              </div>
              <div className="rounded-[8px] bg-white/5 p-3">
                <p className="text-xs text-slate-400">Access</p>
                <p className="mt-1 font-black capitalize">{content.pricing || (content.isFree ? 'free' : 'standard')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[8px] border border-white/10 bg-[#0d1628] p-5 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Details</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {content.description || series?.description || 'No description has been added for this video yet.'}
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Content ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-200">{String(content._id)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Source</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-200">{sourceLabel}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>
    </main>
  );
}
