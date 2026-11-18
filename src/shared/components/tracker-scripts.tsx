/**
 * Route-aware tracker injector.
 *
 * Marketing trackers (GTM, Meta Pixel) are only loaded on public
 * routes. Authenticated routes (`/suite/*`, `/backoffice/*`) never inject
 * them, so customer and staff sessions stay tracker-free.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isDemoMode } from '@/shared/lib/dev-config';

const PUBLIC_PREFIXES = [
  '/',
  '/remittances',
  '/gig',
  '/login',
  '/register',
  '/forgot-password',
  '/platform',
  '/slides',
  '/network_deck',
  '/ventas',
  '/amazonas',
  '/docs',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function injectInlineScript(code: string): HTMLScriptElement {
  const script = document.createElement('script');
  script.textContent = code;
  document.head.appendChild(script);
  return script;
}

const GTM_ID = 'GTM-NG6ZDP2Q';
const META_PIXEL_ID = '1616231965389266';

const GTM_INLINE = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

const META_PIXEL_INLINE = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`;

let injected = false;

function injectAllTrackers(): HTMLScriptElement[] {
  if (injected) return [];
  injected = true;

  const scripts: HTMLScriptElement[] = [];
  scripts.push(injectInlineScript(GTM_INLINE));
  scripts.push(injectInlineScript(META_PIXEL_INLINE));
  return scripts;
}

function removeAllTrackers(scripts: HTMLScriptElement[]): void {
  for (const script of scripts) {
    script.remove();
  }
  injected = false;

  if (window.dataLayer) {
    window.dataLayer.length = 0;
  }
  if (typeof (window as unknown as { fbq?: unknown }).fbq !== 'undefined') {
    delete (window as unknown as { fbq?: unknown }).fbq;
  }
}

export function TrackerScripts() {
  const location = useLocation();

  useEffect(() => {
    // Public portfolio demo: never inject GTM/Meta trackers. The demo-redirect
    // from `/` to `/suite/dashboard` tears the scripts down mid-load (the Meta
    // snippet races its async `fbevents.js` and dies on a deleted `window.fbq`),
    // and a portfolio demo has no reason to track its visitors.
    if (isDemoMode()) return;
    if (!isPublicRoute(location.pathname)) return;

    const scripts = injectAllTrackers();
    return () => removeAllTrackers(scripts);
  }, [location.pathname]);

  return null;
}
