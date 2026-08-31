import { useEffect, useState } from 'react';

export function useIsMac() {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    const userAgent = navigator.userAgent.toUpperCase();

    const _setIsMac = (userAgent: string) => {
      setIsMac(
        userAgent.includes('MAC') ||
          userAgent.includes('IPHONE') ||
          userAgent.includes('IPAD'),
      );
    };

    _setIsMac(userAgent);
  }, []);

  return isMac;
}

export type OperatingSystem =
  'Windows' | 'Android' | 'Unknown' | 'macOS' | 'Linux' | 'iOS';

export function useOS() {
  const [os, setOs] = useState<OperatingSystem>('Unknown');

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const platform =
      window.navigator.userAgentData?.platform || window.navigator.platform;
    const macosPlatforms = [
      'Macintosh',
      'MacIntel',
      'MacPPC',
      'Mac68K',
      'macOS',
    ];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'wince'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

    let detectedOS: OperatingSystem = 'Unknown';

    if (macosPlatforms.includes(platform)) {
      detectedOS = 'macOS';
    } else if (iosPlatforms.includes(platform)) {
      detectedOS = 'iOS';
    } else if (windowsPlatforms.includes(platform)) {
      detectedOS = 'Windows';
    } else if (/Android/.test(userAgent)) {
      detectedOS = 'Android';
    } else if (/Linux/.test(platform)) {
      detectedOS = 'Linux';
    }

    // Edge case: Modern iPads sometimes pretend to be MacIntel
    if (detectedOS === 'macOS' && navigator.maxTouchPoints > 1) {
      detectedOS = 'iOS';
    }

    const _setOS = (detectedOS: OperatingSystem) => {
      setOs(detectedOS);
    };

    _setOS(detectedOS);
  }, []);

  return os;
}