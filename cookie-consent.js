(() => {
  'use strict';
  const key = 'portfolio-cookie-choice';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const measurementId = window.PORTFOLIO_ANALYTICS?.measurementId || '';
  const configured = /^G-[A-Z0-9]{5,20}$/.test(measurementId);
  let choice = readChoice(), tagStarted = false;
  const disabledKey = `ga-disable-${measurementId}`;
  if (configured) window[disabledKey] = true;

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved?.version === 1 && typeof saved.analytics === 'boolean' && Number.isFinite(saved.time) && Date.now() - saved.time < lifetime && saved.time <= Date.now()) return saved;
    } catch (_) { /* A visitor can still choose when storage is unavailable. */ }
    return null;
  }
  function pageName() { const name = location.pathname.split('/').pop()?.replace('.html', ''); return !name || name === 'index' ? 'home' : name; }
  function cleanUrl(value) {
    try { const url = new URL(value, location.href); return url.origin + url.pathname; } catch (_) { return ''; }
  }
  function track(name, parameters = {}) {
    if (!choice?.analytics || !configured || !tagStarted) return;
    window.gtag('event', name, { send_to: measurementId, page_name: pageName(), ...parameters });
  }
  function startAnalytics() {
    if (!configured || !choice?.analytics || tagStarted) return;
    tagStarted = true; window[disabledKey] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
    window.gtag('consent', 'default', denied);
    window.gtag('consent', 'update', { ...denied, analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 30 * 24 * 60 * 60,
      cookie_domain: location.hostname,
      cookie_path: '/',
      page_location: cleanUrl(location.href),
      page_referrer: document.referrer ? cleanUrl(document.referrer) : ''
    });
    const script = document.createElement('script');
    script.async = true; script.id = 'portfolio-google-analytics';
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
  }
  function clearAnalyticsCookies() {
    const domains = ['', location.hostname, `.${location.hostname}`];
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.trim().split('=')[0];
      if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) return;
      domains.forEach(domain => {
        document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
      });
    });
  }
  function save(analytics) {
    const wasRunning = tagStarted;
    choice = { version: 1, analytics, time: Date.now() };
    try { localStorage.setItem(key, JSON.stringify(choice)); } catch (_) {}
    hideBanner();
    if (analytics) startAnalytics();
    else {
      if (configured) window[disabledKey] = true;
      clearAnalyticsCookies();
      // Reload after withdrawal to unload the already accepted Google runtime.
      if (wasRunning) location.reload();
    }
  }

  const cookieIcon = '<svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M51 27C42 29 35 22 38 14C31 17 24 10 26 5C12 8 4 20 7 35C10 50 25 59 40 54C52 50 59 38 56 27C54 28 52 28 51 27Z" fill="#FFFF60" stroke="#19214B" stroke-width="1.8" stroke-linejoin="round"/><circle cx="20" cy="25" r="3" fill="#FC5698"/><circle cx="33" cy="38" r="3.5" fill="#546FFA"/><circle cx="19" cy="42" r="2.5" fill="#19214B"/><circle cx="44" cy="43" r="2.5" fill="#FC5698"/><path d="M44 5V11M41 8H47M55 12V18M52 15H58" stroke="#546FFA" stroke-width="2" stroke-linecap="round"/></svg>';
  const banner = document.createElement('section');
  banner.className = 'cookie-banner'; banner.id = 'cookie-banner'; banner.hidden = true;
  banner.setAttribute('data-drag-block', 'true');
  banner.setAttribute('aria-labelledby', 'cookie-banner-title');
  banner.innerHTML = `${cookieIcon}<div class="cookie-banner__content"><h2 id="cookie-banner-title">Cookies &amp; analytics</h2><p>Optional Google Analytics helps me understand which pages and projects visitors explore. You choose whether to allow it.</p><div class="cookie-banner__actions"><button type="button" data-cookie-choice="no">Essential only</button><button type="button" data-cookie-choice="yes">Accept analytics</button></div><button class="cookie-banner__details-toggle" type="button" aria-expanded="false" aria-controls="cookie-details">What gets stored?</button><div class="cookie-banner__details" id="cookie-details" hidden><p><strong>Essential:</strong> this website saves your cookie choice in this browser for six months.</p><p><strong>Optional analytics:</strong> Google Analytics uses cookies to measure visits, page views and clicks. Analytics cookies last up to 30 days. No advertising features are enabled. Names, email addresses and anything you type are not sent by this website.</p><p>You can change your choice anytime using Cookie settings. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google’s privacy policy ↗</a></p></div></div>`;
  const settings = document.createElement('button');
  settings.type = 'button'; settings.className = 'cookie-settings'; settings.hidden = true;
  settings.setAttribute('data-drag-block', 'true');
  settings.setAttribute('aria-controls', 'cookie-banner'); settings.setAttribute('aria-expanded', 'false');
  settings.innerHTML = cookieIcon + '<span>Cookie settings</span>';
  document.body.append(banner);
  const socialFooter = document.querySelector('.contact-bottom');
  if (socialFooter) socialFooter.prepend(settings);
  else {
    const footer = document.createElement('footer');
    footer.className = 'cookie-footer';
    footer.append(settings);
    const notebook = document.querySelector('.projects');
    if (notebook && document.body.dataset.page === 'about') notebook.before(footer);
    else (document.getElementById('portfolio') || document.body).append(footer);
  }
  function showBanner(focus = false) {
    banner.hidden = false; settings.setAttribute('aria-expanded', 'true');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) banner.animate([{ opacity: 0, translate: '0 10px', scale: .98 }, { opacity: 1, translate: '0 0', scale: 1 }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
    if (focus) banner.querySelector('button').focus({ preventScroll: true });
  }
  function hideBanner() {
    const hadFocus = banner.contains(document.activeElement);
    banner.hidden = true; settings.setAttribute('aria-expanded', 'false');
    // The settings button lives in the footer, so accepting must not jump there.
    if (hadFocus) document.activeElement.blur();
  }
  settings.addEventListener('click', () => { if (banner.hidden) showBanner(true); else if (choice) hideBanner(); });
  banner.querySelectorAll('[data-cookie-choice]').forEach(button => button.addEventListener('click', () => save(button.dataset.cookieChoice === 'yes')));
  const detailsToggle = banner.querySelector('.cookie-banner__details-toggle');
  detailsToggle.addEventListener('click', () => {
    const details = banner.querySelector('#cookie-details');
    details.hidden = !details.hidden; detailsToggle.setAttribute('aria-expanded', String(!details.hidden));
  });
  banner.addEventListener('keydown', event => { if (event.key === 'Escape' && choice) { hideBanner(); settings.focus({ preventScroll: true }); } });
  let ready = false;
  const readiness = new MutationObserver(revealUI);
  function revealUI() {
    if (ready || document.getElementById('portfolio')?.inert || document.documentElement.classList.contains('is-navigation-busy')) return;
    ready = true; settings.hidden = false;
    readiness.disconnect();
    if (!choice || new URLSearchParams(location.search).get('cookies') === 'settings') showBanner();
  }
  document.addEventListener('portfolio:intro-complete', revealUI);
  document.addEventListener('portfolio:ready', revealUI);
  document.addEventListener('portfolio:navigation-revealed', revealUI);
  window.addEventListener('load', revealUI, { once: true });
  readiness.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const portfolio = document.getElementById('portfolio');
  if (portfolio) readiness.observe(portfolio, { attributes: true, attributeFilter: ['inert'] });
  revealUI(); startAnalytics();
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    choice = readChoice();
    if (!choice?.analytics && tagStarted) { window[disabledKey] = true; clearAnalyticsCookies(); location.reload(); }
    else if (choice?.analytics) { hideBanner(); startAnalytics(); }
    else if (choice) hideBanner();
    else showBanner();
  });

  // Report only known interface actions, never arbitrary text, form values or URLs.
  const projects = { 'work.html': 'lush_scrubby', 'moonlight.html': 'moonlight', 'sncb.html': 'sncb', 'spotify.html': 'spotify', 'takoyaki.html': 'takoyaki', 'scroll-world.html': 'scroll_world' };
  document.addEventListener('click', event => {
    if (!choice?.analytics || !configured) return;
    const target = event.target.closest('a,button');
    if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true' || target.closest('.cookie-banner,.cookie-settings')) return;
    if (target.closest('#primary-navigation')) {
      const destination = target.textContent.trim().toLowerCase();
      if (['home','work','about','contact'].includes(destination)) track('navigation_click', { destination });
    } else if (target.matches('a.case-card[href]')) {
      if (target.closest('.is-falling,.is-empty,.is-returning') || (event.defaultPrevented && !document.documentElement.classList.contains('is-navigation-busy'))) return;
      const project = projects[new URL(target.href).pathname.split('/').pop()];
      if (project) track('case_study_open', { project });
    } else if (target.matches('[data-copy-email],a[href^="mailto:"]')) track('contact_click', { method: 'email' });
    else if (target.matches('a.contact-social--instagram')) track('contact_click', { method: 'instagram' });
    else if (target.matches('a.contact-social--linkedin')) track('contact_click', { method: 'linkedin' });
    else if (target.matches('a[download]')) track('file_download', { content_type: 'cv' });
    else if (target.matches('.contact-photo-reveal')) track('photo_toggle', { action: target.getAttribute('aria-pressed') === 'true' ? 'reveal' : 'replay' });
  });
  document.addEventListener('play', event => {
    if (event.target.id === 'world-film') track('video_start', { video_title: 'The Way Home' });
  }, true);
})();
