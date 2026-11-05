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
  const status = document.querySelector('#form-status');
  const email = form.querySelector('#email');
  const preference = form.querySelector('#preferred');
  const submit = form.querySelector('#submit-estimate');
  let step = 0;
  let sending = false;
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
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const syncEmail = () => {
    email.required = preference.value === 'Email';
    form.querySelector('label[for="email"]').firstChild.textContent = email.required ? 'Email address *' : 'Email address';
  };
  preference.addEventListener('change', syncEmail);
  syncEmail();
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
    syncEmail();
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

// Local events can be connected to the owner's analytics account later.
// No identifiers or customer contact fields are sent to an analytics service.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  let action;
  if (href.startsWith('tel:')) action = 'phone_click';
  else if (href.startsWith('mailto:')) action = 'email_click';
  else if (/^contact\.html(?:\?|$)/.test(href)) action = 'estimate_click';
  if (action) window.dispatchEvent(new CustomEvent('weaver:conversion', { detail: { action } }));
  const campaign = new URLSearchParams(window.location.search);
  const target = new URL(link.href);
  if (target.origin !== window.location.origin || !(target.pathname === '/' || target.pathname.endsWith('.html'))) return;
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = campaign.get(key);
    if (value && !target.searchParams.has(key)) target.searchParams.set(key, value.slice(0, 200));
  }
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

})();
}
