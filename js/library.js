// Library page behaviour: brand switching, icon injection, swatch grid,
// per-brand copy swaps, live countdown. Components themselves are pure CSS —
// this file only drives the demo page.
(function () {
  var BRANDS = {
    plt: { name: 'PrettyLittleThing', loyalty: 'Royalty', headline: 'Elevate Your Experience', pitch: false },
    debenhams: { name: 'Debenhams', loyalty: 'Unlimited', headline: null, pitch: false },
    boohoo: { name: 'boohoo', loyalty: 'Premier', headline: 'Elevate Your Experience', pitch: false },
    boohooman: { name: 'boohooMAN', loyalty: 'Premier', headline: null, pitch: false },
    karenmillen: { name: 'Karen Millen', loyalty: 'Premier', headline: null, pitch: true },
  };

  // DS colour collection, in the DS's own groups (matches tokens.css names)
  var SWATCHES = [
    'primary', 'cta', 'primary-dark', 'dark-1', 'dark-2', 'dark-3',
    'light-1', 'light-2', 'light-3', 'light-4', 'neutral', 'neutral-pressed',
    'black', 'soft-black', 'grey-6', 'grey-5', 'grey-4', 'grey-3',
    'grey-25', 'grey-2', 'grey-1', 'grey-05', 'background-white', 'white',
    'red', 'red-light', 'yellow', 'green',
  ];

  // Deliver+ lockups — the exact per-brand artwork (assets/), composed to the
  // frames' geometry.
  var LOCKUPS = {
    plt:
      '<span class="dp-lockup dp-lockup--plt" style="display:block">' +
      '<img src="assets/seel/plt-deliver-c.svg" style="left:0;top:0;width:34.5px;height:40px" alt="" />' +
      '<img src="assets/seel/plt-deliver-b.svg" style="left:6.4px;top:8.3px;width:21.9px;height:18.1px" alt="" />' +
      '<img src="assets/seel/plt-deliver-a.svg" style="left:40.8px;top:11.3px;width:72.3px;height:11.9px" alt="PLT Deliver+" />' +
      '</span>',
    debenhams:
      '<span class="dp-lockup dp-lockup--debenhams" style="display:block">' +
      '<img src="assets/seel/lockup-wordmark.svg" style="position:absolute;left:0;top:0;width:142px;height:20.3px" alt="Debenhams" />' +
      '<img src="assets/seel/lockup-deliverplus.svg" style="position:absolute;left:0;top:24.4px;width:64.7px;height:5.6px" alt="Deliver+" />' +
      '</span>',
    boohoo:
      '<span class="dp-lockup dp-lockup--boohoo" style="display:block"><img src="assets/seel/boohoo-deliver.png" alt="boohoo Deliver+" /></span>',
    boohooman:
      '<span class="dp-lockup dp-lockup--boohooman" style="display:block"><img src="assets/seel/man-deliver.svg" alt="Deliver Plus" /></span>',
    karenmillen:
      '<span class="dp-lockup dp-lockup--karenmillen" style="display:block">' +
      '<img src="assets/seel/km-wordmark.svg" style="width:134px;height:10.9px" alt="Karen Millen" />' +
      '<img src="assets/seel/km-deliver.svg" style="width:99.5px;height:18.5px;margin-top:5px" alt="Deliver+" />' +
      '</span>',
  };

  function injectIcons() {
    document.querySelectorAll('[data-icon]').forEach(function (el) {
      var xml = (window.DS_ICONS || {})[el.getAttribute('data-icon')];
      if (xml) {
        el.innerHTML = xml;
        var svg = el.querySelector('svg');
        if (svg) {
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          svg.style.display = 'block';
        }
        el.style.display = 'inline-block';
        if (!el.style.width) { el.style.width = '16px'; el.style.height = '16px'; }
        if (el.classList.contains('icon-24')) { el.style.width = '24px'; el.style.height = '24px'; }
        if (el.parentElement.classList.contains('usp-box__row') || el.parentElement.classList.contains('acc-row__icon') || el.parentElement.classList.contains('empty')) {
          el.style.width = '24px'; el.style.height = '24px';
        }
        if (el.parentElement.classList.contains('empty')) { el.style.width = '32px'; el.style.height = '32px'; }
      }
    });
  }

  function buildSwatches() {
    var grid = document.getElementById('swatches');
    grid.innerHTML = SWATCHES.map(function (name) {
      return (
        '<span class="swatch"><i style="background:var(--' + name + ')"></i>' + name + '</span>'
      );
    }).join('');
  }

  function setBrand(id) {
    document.documentElement.setAttribute('data-brand', id);
    var b = BRANDS[id];
    document.getElementById('brand-logo').src = 'assets/logos/' + id + '.svg';
    var cs = getComputedStyle(document.documentElement);
    var font = cs.getPropertyValue('--font').trim().split(',')[0].replace(/['"]/g, '');
    document.getElementById('brand-meta').innerHTML =
      '<span class="meta-chip"><b>' + b.name + '</b></span>' +
      '<span class="meta-chip">' + font + '</span>' +
      '<span class="meta-chip">radius ' + cs.getPropertyValue('--radius').trim() + '</span>';

    document.querySelectorAll('[data-brand-name]').forEach(function (el) { el.textContent = b.name; });
    document.querySelectorAll('[data-loyalty]').forEach(function (el) { el.textContent = b.loyalty; });
    document.querySelectorAll('[data-lockup]').forEach(function (el) { el.innerHTML = LOCKUPS[id]; });

    // SEEL banner content per brand: headline / tick list vs KM's pitch
    document.querySelectorAll('[data-seel-headline]').forEach(function (el) {
      el.hidden = !b.headline; if (b.headline) el.textContent = b.headline;
    });
    document.querySelectorAll('[data-seel-headline-priced]').forEach(function (el) {
      el.hidden = b.pitch;
      el.textContent = b.headline ? b.headline + ' for £2.99.' : 'Add Deliver+ for £2.99.';
    });
    document.querySelectorAll('[data-seel-ticks]').forEach(function (el) { el.hidden = b.pitch; });
    document.querySelectorAll('[data-seel-pitch]').forEach(function (el) { el.hidden = !b.pitch; });

    // Rewards band colour per Account-2026 (PLT garnet, Deb mint, boohoo pink,
    // MAN + KM black) with lightness-derived text
    var rewardsBg = { plt: 'var(--cta)', debenhams: 'var(--primary)', boohoo: 'var(--primary)', boohooman: '#000', karenmillen: '#000' }[id];
    var rewardsFg = { plt: '#FFF', debenhams: '#000', boohoo: '#000', boohooman: '#FFF', karenmillen: '#FFF' }[id];
    document.querySelectorAll('[data-rewards]').forEach(function (el) {
      el.style.background = rewardsBg; el.style.color = rewardsFg;
    });

    document.querySelectorAll('.brand-tab').forEach(function (t) {
      t.setAttribute('aria-selected', String(t.getAttribute('data-set-brand') === id));
    });
  }

  document.querySelectorAll('[data-set-brand]').forEach(function (t) {
    t.addEventListener('click', function () { setBrand(t.getAttribute('data-set-brand')); });
  });

  // interactive demos
  document.addEventListener('click', function (e) {
    var size = e.target.closest('.size');
    if (size && !size.classList.contains('size--oos')) {
      size.parentElement.querySelectorAll('.size--selected').forEach(function (s) { s.classList.remove('size--selected'); });
      size.classList.add('size--selected');
    }
    var check = e.target.closest('[role="checkbox"]');
    if (check) check.setAttribute('aria-checked', String(check.getAttribute('aria-checked') !== 'true'));
    var swatch = e.target.closest('.card__swatch');
    if (swatch) {
      swatch.parentElement.querySelectorAll('.card__swatch--selected').forEach(function (s) { s.classList.remove('card__swatch--selected'); });
      swatch.classList.add('card__swatch--selected');
    }
  });

  // live countdown to midnight — 00:HH:MM:SS, the USP banner format
  function tick() {
    var now = new Date();
    var midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
    var left = Math.max(0, Math.floor((midnight - now) / 1000));
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var s = '00:' + pad(Math.floor(left / 3600)) + ':' + pad(Math.floor((left % 3600) / 60)) + ':' + pad(left % 60);
    document.querySelectorAll('[data-countdown]').forEach(function (el) { el.textContent = s; });
  }
  setInterval(tick, 1000); tick();

  injectIcons();
  buildSwatches();
  // #debenhams etc deep-links a brand (also drives headless screenshots)
  var initial = (location.hash || '').slice(1);
  setBrand(BRANDS[initial] ? initial : 'plt');
  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1);
    if (BRANDS[id]) setBrand(id);
  });
})();
