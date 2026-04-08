import { NextRequest } from 'next/server';

export function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim() || null;
  return req.headers.get('x-real-ip') ?? null;
}

export interface GeoData extends Record<string, unknown> {
  ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  isp: string | null;
  zip: string | null;
}

export async function getClientGeo(req: NextRequest): Promise<GeoData> {
  const ip = getClientIp(req);

  // Vercel sets these headers automatically on every request — free, instant, no API call
  const city = req.headers.get('x-vercel-ip-city')
    ? decodeURIComponent(req.headers.get('x-vercel-ip-city')!)
    : null;
  const region = req.headers.get('x-vercel-ip-country-region');
  const country = req.headers.get('x-vercel-ip-country');
  const latRaw = req.headers.get('x-vercel-ip-latitude');
  const lonRaw = req.headers.get('x-vercel-ip-longitude');
  const timezone = req.headers.get('x-vercel-ip-timezone');

  if (city || country) {
    return {
      ip, city, region, country,
      lat: latRaw ? parseFloat(latRaw) : null,
      lon: lonRaw ? parseFloat(lonRaw) : null,
      timezone,
      isp: null,
      zip: null,
    };
  }

  // Fallback for local dev / non-Vercel: ip-api.com (free, no key, 45 req/min)
  const isLoopback = !ip || ip === '::1' || ip === '127.0.0.1';
  if (!isLoopback) {
    try {
      const res = await fetch(
        `http://ip-api.com/json/${ip}?fields=city,regionName,country,lat,lon,timezone,isp,zip`,
        { signal: AbortSignal.timeout(2000) }
      );
      if (res.ok) {
        const data = await res.json();
        return {
          ip,
          city: data.city ?? null,
          region: data.regionName ?? null,
          country: data.country ?? null,
          lat: data.lat ?? null,
          lon: data.lon ?? null,
          timezone: data.timezone ?? null,
          isp: data.isp ?? null,
          zip: data.zip ?? null,
        };
      }
    } catch {
      // Geo lookup failed — return IP only
    }
  }

  return { ip, city: null, region: null, country: null, lat: null, lon: null, timezone: null, isp: null, zip: null };
}
