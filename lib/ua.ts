export interface ParsedUA {
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  os_version: string | null;
}

export function parseUA(ua: string): ParsedUA {
  const tablet = /iPad|Tablet|PlayBook/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const mobile = !tablet && /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const device_type = tablet ? 'tablet' : mobile ? 'mobile' : 'desktop';

  let browser: string | null = null;
  let browser_version: string | null = null;
  const browserMatches: [RegExp, string][] = [
    [/Edg\/([0-9.]+)/i, 'Edge'],
    [/OPR\/([0-9.]+)/i, 'Opera'],
    [/SamsungBrowser\/([0-9.]+)/i, 'Samsung Browser'],
    [/UCBrowser\/([0-9.]+)/i, 'UC Browser'],
    [/CriOS\/([0-9.]+)/i, 'Chrome iOS'],
    [/FxiOS\/([0-9.]+)/i, 'Firefox iOS'],
    [/Firefox\/([0-9.]+)/i, 'Firefox'],
    [/Chrome\/([0-9.]+)/i, 'Chrome'],
    [/Safari\/([0-9.]+)/i, 'Safari'],
  ];
  for (const [re, name] of browserMatches) {
    const m = ua.match(re);
    if (m) { browser = name; browser_version = m[1].split('.')[0]; break; }
  }

  let os: string | null = null;
  let os_version: string | null = null;
  const osMatches: [RegExp, string, number][] = [
    [/Windows NT ([0-9.]+)/i, 'Windows', 1],
    [/iPhone OS ([0-9_]+)/i, 'iOS', 1],
    [/iPad.*OS ([0-9_]+)/i, 'iPadOS', 1],
    [/Android ([0-9.]+)/i, 'Android', 1],
    [/Mac OS X ([0-9_.]+)/i, 'macOS', 1],
    [/Linux/i, 'Linux', 0],
  ];
  for (const [re, name, group] of osMatches) {
    const m = ua.match(re);
    if (m) {
      os = name;
      os_version = group && m[group] ? m[group].replace(/_/g, '.').split('.').slice(0, 2).join('.') : null;
      break;
    }
  }

  return { device_type, browser, browser_version, os, os_version };
}
