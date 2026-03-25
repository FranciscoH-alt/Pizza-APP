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
}

export async function getClientGeo(req: NextRequest): Promise<GeoData> {
  const ip = getClientIp(req);

  // Vercel sets these headers automatically on every request — free, instant, no API call
  const city = req.headers.get('x-vercel-ip-city')
    ? decodeURIComponent(req.headers.get('x-vercel-ip-city')!)
    : null;
  const region = req.headers.get('x-vercel-ip-country-region');
  const country = req.headers.get('x-vercel-ip-country');

  if (city || country) {
    return { ip, city, region, country };
  }

  // Fallback for local dev / non-Vercel: ip-api.com (free, no key, 45 req/min)
  const isLoopback = !ip || ip === '::1' || ip === '127.0.0.1';
  if (!isLoopback) {
    try {
      const res = await fetch(
        `http://ip-api.com/json/${ip}?fields=city,regionName,country`,
        { signal: AbortSignal.timeout(2000) }
      );
      if (res.ok) {
        const data = await res.json();
        return {
          ip,
          city: data.city ?? null,
          region: data.regionName ?? null,
          country: data.country ?? null,
        };
      }
    } catch {
      // Geo lookup failed — return IP only
    }
  }

  return { ip, city: null, region: null, country: null };
}
