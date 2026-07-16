export const ua = navigator.userAgent;
export const isIPadOS = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;

export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

export const isMobile =
  /Android.*Mobile|iPhone|iPod/i.test(ua) ||
  window.innerWidth < MOBILE_BREAKPOINT;
export const isTablet =
  isIPadOS ||
  (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
  /iPad|Tablet/i.test(ua) ||
  (window.innerWidth >= MOBILE_BREAKPOINT &&
    window.innerWidth < TABLET_BREAKPOINT);

export const preferedLanguage = navigator.language;

export const isDarkTheme = window.matchMedia(
  '(prefers-color-scheme: dark)'
).matches;
