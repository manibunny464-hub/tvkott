import https from 'https';

function fetchHtmlWithRedirects(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        try {
          const nextUrl = new URL(res.headers.location, url).toString();
          const cookies = res.headers['set-cookie'];
          const nextHeaders = {};
          if (cookies) {
            nextHeaders['Cookie'] = cookies.map(c => c.split(';')[0]).join('; ');
          }
          resolve(fetchHtmlWithRedirects(nextUrl, nextHeaders));
        } catch (err) {
          reject(err);
        }
      } else {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => { resolve(data); });
      }
    }).on('error', (err) => { reject(err); });
  });
}

export async function resolveNetflixTrailerUrl(url) {
  if (!url || !url.includes('netflix.com/title/')) return url;
  try {
    const html = await fetchHtmlWithRedirects(url);
    const regex = /https:\/\/occ-0-[a-zA-Z0-9_\.\-\/]*?\.nflxso\.net\/so\/[a-zA-Z0-9_\.\-\/]*?\.mp4\?[a-zA-Z0-9_\&\=\-]+/g;
    const matches = html.match(regex);
    if (matches && matches.length > 0) {
      // Decode HTML-encoded entities like &amp; to &
      return matches[0].replaceAll('&amp;', '&');
    }
  } catch (error) {
    console.error("resolveNetflixTrailerUrl error:", error);
  }
  return url;
}
