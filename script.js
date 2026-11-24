if(document.querySelector('.brand-text')){
(()=>{

const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav-links');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? '✕' : '☰';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
    menuBtn.textContent = '☰';
  }));
}

document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lightboxImage = lightbox.querySelector('img');
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      lightboxImage.src = item.dataset.src;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden','false');
    });
  });
  const close = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    lightboxImage.src = '';
  };
  lightbox.querySelector('.lightbox-close').addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

})();
}else{
(()=>{
document.documentElement.classList.add('js');
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
const closeMenu = () => {
  navigation.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
};
menu.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menu.focus();
  }
});
window.matchMedia('(min-width: 941px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox = document.querySelector('#lightbox');
if (lightbox) {
  let currentPhoto = 0;
  const visibleItems = () => galleryItems.filter(item => !item.hidden);
  const showPhoto = index => {
    const items = visibleItems();
    currentPhoto = (index + items.length) % items.length;
    const item = items[currentPhoto];
    const img = lightbox.querySelector('img');
    img.src = item.dataset.image;
    img.alt = item.dataset.title;
    lightbox.querySelector('#lightbox-title').textContent = item.dataset.title;
    lightbox.querySelector('#lightbox-caption').textContent = item.dataset.caption;
    lightbox.querySelectorAll('.lightbox-controls button').forEach(button => button.disabled = items.length < 2);
  };
  galleryItems.forEach(item => item.addEventListener('click', () => {
    showPhoto(visibleItems().indexOf(item));
    lightbox.showModal();
    document.body.style.overflow = 'hidden';
  }));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('close', () => document.body.style.overflow = '');
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', () => showPhoto(currentPhoto - 1));
  lightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => showPhoto(currentPhoto + 1));
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(currentPhoto - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(currentPhoto + 1); }
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    galleryItems.forEach(item => item.hidden = button.dataset.filter !== 'All work' && item.dataset.category !== button.dataset.filter);
  }));
}

const form = document.querySelector('#estimate-form');
if (form) {
  const panels = Array.from(form.querySelectorAll('[data-panel]'));
  const estimateCard = document.getElementById('estimate');
  const status = document.querySelector('#form-status');
  const email = form.querySelector('#email');
  const phone = form.querySelector('#phone');
  const preference = form.querySelector('#preferred');
  const submit = form.querySelector('#submit-estimate');
  let step = 0;
  let sending = false;
  const service = form.querySelector('#service');
  const requestedService = new URLSearchParams(window.location.search).get('service');
  if (requestedService && Array.from(service.options).some(option => option.value === requestedService)) {
    service.value = requestedService;
  }
  const campaign = new URLSearchParams(window.location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'area']) {
    const value = campaign.get(key);
    if (!value) continue;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key === 'area' ? 'requested_county' : key;
    input.value = value.slice(0, 200);
    form.append(input);
  }
  form.noValidate = true;
  const showStep = (index, focus = true) => {
    step = index;
    panels.forEach((panel, i) => panel.hidden = i !== step);
    form.querySelectorAll('[data-step-label]').forEach((label, i) => {
      label.classList.toggle('active', i === step);
      if (i === step) label.setAttribute('aria-current', 'step');
      else label.removeAttribute('aria-current');
    });
    if (focus) {
      panels[step].querySelector('input,select,textarea').focus({ preventScroll: true });
      estimateCard.scrollIntoView({ block: 'start' });
    }
  };
  const syncContactFields = () => {
    email.required = preference.value === 'Email';
    phone.required = !email.required;
    form.querySelector('#email-label').textContent = email.required ? 'Email address *' : 'Email address (optional)';
    form.querySelector('#phone-label').textContent = phone.required ? 'Phone number *' : 'Phone number (optional)';
  };
  form.querySelector('#reply-contact').disabled = true;
  form.querySelector('#reply-contact-label').hidden = true;
  form.querySelector('#estimate-contacts').hidden = false;
  preference.addEventListener('change', syncContactFields);
  window.addEventListener('pageshow', syncContactFields);
  syncContactFields();
  const validatePanel = panel => {
    for (const field of panel.querySelectorAll('input,select,textarea')) {
      if (!field.checkValidity()) {
        const disclosure = field.closest('details');
        if (disclosure) disclosure.open = true;
        field.reportValidity();
        return false;
      }
    }
    return true;
  };
  form.querySelector('[data-next]').addEventListener('click', () => {
    if (validatePanel(panels[0])) { status.textContent = ''; showStep(1); }
  });
  form.querySelector('[data-back]').addEventListener('click', () => {
    status.textContent = '';
    showStep(0);
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    if (step === 0) {
      if (validatePanel(panels[0])) showStep(1);
      return;
    }
    syncContactFields();
    for (let i = 0; i < panels.length; i++) {
      if (Array.from(panels[i].querySelectorAll('input,select,textarea')).some(field => !field.checkValidity())) {
        showStep(i, false);
        validatePanel(panels[i]);
        return;
      }
    }
    sending = true;
    submit.disabled = true;
    submit.textContent = 'Submitting…';
    status.textContent = '';
    try {
      const response = await fetch(form.action, {
        method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Submission was not accepted');
      window.dispatchEvent(new CustomEvent('weaver:conversion', { detail: { action: 'estimate_submitted' } }));
      form.hidden = true;
      const success = document.querySelector('#form-success');
      success.hidden = false;
      success.focus({ preventScroll: true });
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      status.replaceChildren();
      status.append('We couldn’t confirm your request. Your details are still here. Please try again, or call ');
      const phone = document.createElement('a');
      phone.href = 'tel:+16785888590';
      phone.textContent = '(678) 588-8590';
      phone.style.textDecoration = 'underline';
      status.append(phone, '.');
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = 'Submit estimate request →';
    }
  });
  showStep(0, false);
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  let action;
  if (href.startsWith('tel:')) action = 'phone_click';
  else if (href.startsWith('mailto:')) action = 'email_click';
  else if (/^contact\.html(?:[?#]|$)/.test(href)) action = 'estimate_click';
  if (action) window.dispatchEvent(new CustomEvent('weaver:conversion', { detail: { action } }));
  if (href.startsWith('#')) return;
  const campaign = new URLSearchParams(window.location.search);
  const target = new URL(link.href);
  if (target.origin !== window.location.origin || !(target.pathname === '/' || target.pathname.endsWith('.html'))) return;
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = campaign.get(key);
    if (value && !target.searchParams.has(key)) target.searchParams.set(key, value.slice(0, 200));
  }
  if (campaign.has('weaver_test')) target.searchParams.set('weaver_test', '1');
  if (target.search) link.href = target.href;
});

const areaHelper = document.querySelector('#area-helper');
if (areaHelper) {
  const length = areaHelper.querySelector('#lawn-length');
  const width = areaHelper.querySelector('#lawn-width');
  const output = areaHelper.querySelector('output');
  const apply = areaHelper.querySelector('button');
  function squareFeet() {
    const a = length.valueAsNumber, b = width.valueAsNumber;
    return a > 0 && b > 0 && Number.isFinite(a * b) ? Math.round(a * b) : 0;
  }
  function updateArea() {
    const sq = squareFeet();
    output.textContent = sq ? sq.toLocaleString('en-US') + ' sq ft · about ' + (sq / 43560).toLocaleString('en-US', { maximumFractionDigits: 3 }) + ' acres' : 'Enter a positive length and width.';
    apply.disabled = !sq;
  }
  areaHelper.addEventListener('input', updateArea);
  apply.addEventListener('click', () => {
    const sq = squareFeet(); if (!sq) return;
    const size = form.querySelector('#size');
    size.value = sq.toLocaleString('en-US') + ' sq ft (approx.)';
    areaHelper.open = false;
    size.focus();
  });
}

const application = document.getElementById('application-form');
if (application) {
  const attachment = document.getElementById('application-file');
  const fileStatus = document.getElementById('application-file-status');
  const validateAttachment = () => {
    const file = attachment.files[0];
    let message = '';
    if (file && !/\.pdf$/i.test(file.name)) message = 'Choose the completed application as a PDF.';
    else if (file && file.size === 0) message = 'This PDF is empty. Save your completed application and try again.';
    else if (file && file.size > 9_000_000) message = 'This PDF is larger than 9 MB. Choose a smaller PDF.';
    attachment.setCustomValidity(message);
    if (message) attachment.setAttribute('aria-invalid', 'true');
    else attachment.removeAttribute('aria-invalid');
    fileStatus.textContent = message;
  };
  attachment.addEventListener('change', validateAttachment);
  application.addEventListener('submit', event => {
    validateAttachment();
    if (!attachment.validity.valid) {
      event.preventDefault();
      attachment.reportValidity();
    }
  });
}

})();
}

// Send only an event name and a coarse traffic source to Weaver's private report.
(() => {
  const siteOrigins = ['https://weaverhydro.com', 'https://www.weaverhydro.com'];
  if (!siteOrigins.includes(location.origin)) return;
  const params = new URLSearchParams(location.search);
  const diagnostic = params.has('weaver_test');
  if (!diagnostic && (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1')) return;

  const sources = ['direct', 'search', 'social', 'referral', 'campaign'];
  const searchHost = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.[a-z.]+|ecosia\.org|brave\.com)$/i;
  const socialHost = /(^|\.)(facebook\.com|fb\.com|fb\.me|instagram\.com|nextdoor\.com|linkedin\.com|t\.co|x\.com|pinterest\.com|youtube\.com|tiktok\.com)$/i;
  function trafficSource() {
    const medium = (params.get('utm_medium') || '').toLowerCase();
    const sourceTag = (params.get('utm_source') || '').toLowerCase();
    if (medium === 'organic' || medium === 'organic_search') return 'search';
    if (medium === 'referral') return 'referral';
    if (/^(social|social-media|organic_social|social-network)$/.test(medium)) return 'social';
    if (!medium && /^(facebook|fb|instagram|nextdoor|linkedin|pinterest|tiktok)$/.test(sourceTag)) return 'social';
    if (medium || sourceTag || params.has('utm_campaign')) return 'campaign';
    const referrer = document.referrer ? new URL(document.referrer) : null;
    if (referrer && !siteOrigins.includes(referrer.origin)) {
      if (searchHost.test(referrer.hostname)) return 'search';
      if (socialHost.test(referrer.hostname)) return 'social';
      return 'referral';
    }
    if (referrer) {
      try {
        const prior = sessionStorage.getItem('weaver-traffic-source');
        if (sources.includes(prior)) return prior;
      } catch {}
    }
    return 'direct';
  }

  const source = trafficSource();
  const form = document.getElementById('estimate-form');
  if (!diagnostic) {
    try { sessionStorage.setItem('weaver-traffic-source', source); } catch {}
    if (form) {
      const field = document.createElement('input');
      field.type = 'hidden';
      field.name = 'traffic_source';
      field.value = source;
      form.append(field);
    }
  }
  const reportEndpoint = 'https://api-v2.appdeploy.ai/app/weaver-website-inquiry-report-4w09du/api/count/';
  const record = action => fetch(reportEndpoint + source + '/' + action, {
    method: 'POST',
    credentials: 'omit',
    keepalive: true,
    referrerPolicy: 'no-referrer'
  });

  if (diagnostic) {
    const result = document.createElement('p');
    result.id = 'reporting-check';
    result.setAttribute('role', 'status');
    result.textContent = 'Checking website reporting…';
    document.body.append(result);
    record('check').then(async response => {
      if (!response.ok || !(await response.json()).recorded) throw new Error('Reporting check failed');
      result.textContent = 'Website reporting verified.';
    }).catch(() => {
      result.textContent = 'Website reporting could not be verified.';
    });
    return;
  }

  const count = action => { record(action).catch(() => {}); };
  const phones = new Set(['16785888590', '17705848065']);
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href^="tel:"]');
    if (link && !link.closest('.partner-card') && phones.has(link.getAttribute('href').replace(/\D/g, ''))) count('phone_taps');
  });
  window.addEventListener('weaver:conversion', event => {
    if (event.detail?.action === 'estimate_submitted') count('estimates');
  });
  if (document.prerendering) document.addEventListener('prerenderingchange', () => count('page_views'), { once: true });
  else count('page_views');
})();
