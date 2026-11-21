import { getMasterSettings } from '@/lib/admin/data';

/**
 * GET /api/mobile/config
 * Public endpoint consumed by Mobile App on launch to configure features,
 * theme, platform name, and player controls (like Subtitles enabled/disabled).
 */
export async function GET() {
  try {
    const settings = await getMasterSettings();

    const config = {
      platformName: settings.platformName || 'Chirpii Mini OTT',
      tagline: settings.tagline || '',
      logoUrl: settings.logoUrl || '',
      player: {
        enableSubtitles: settings.player?.enableSubtitles !== false,
      },
      features: {
        subtitlesEnabled: settings.player?.enableSubtitles !== false,
      },
      theme: settings.theme || {},
    };

    return Response.json({
      success: true,
      config,
    });
  } catch (err) {
    console.error('[/api/mobile/config] Error:', err);
    return Response.json(
      { success: false, message: 'Failed to fetch app configuration' },
      { status: 500 }
    );
  }
}
