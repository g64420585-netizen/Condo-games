(function () {
  'use strict';

  var LANG_KEY = 'rc2_lang';
  var NICK_KEY = 'rc_nick';

  /* ── Sound ─────────────────────────────────────────── */
  var audio = null;
  function playClick() {
    try {
      if (!audio) {
        audio = new Audio('/click-sound.mp3');
        audio.volume = 0.5;
      }
      audio.currentTime = 0;
      audio.play().catch(function () {});
    } catch (e) {}
  }

  /* ── Nick gate ──────────────────────────────────────── */
  function buildNickGate() {
    if (document.getElementById('rc-nick-gate')) return;

    var gate = document.createElement('div');
    gate.id = 'rc-nick-gate';

    var box = document.createElement('div');
    box.id = 'rc-nick-box';

    var title = document.createElement('h2');
    title.textContent = 'Roblox Condo';

    var sub = document.createElement('p');
    sub.textContent = 'Enter your Roblox username to continue';

    var input = document.createElement('input');
    input.id = 'rc-nick-input';
    input.type = 'text';
    input.placeholder = 'Your Roblox username';
    input.maxLength = 20;
    input.autocomplete = 'off';

    var error = document.createElement('div');
    error.id = 'rc-nick-error';

    var btn = document.createElement('button');
    btn.id = 'rc-nick-btn';
    btn.textContent = 'Enter Site';

    function submit() {
      var val = input.value.trim();
      if (!val || val.length < 3) {
        error.textContent = 'Username must be at least 3 characters.';
        return;
      }
      if (!/^[A-Za-z0-9_]+$/.test(val)) {
        error.textContent = 'Only letters, numbers and underscores.';
        return;
      }
      localStorage.setItem(NICK_KEY, val);
      gate.classList.add('rc-hidden');
      injectNav();
    }

    btn.addEventListener('click', function () { playClick(); submit(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submit();
      error.textContent = '';
    });

    box.appendChild(title);
    box.appendChild(sub);
    box.appendChild(input);
    box.appendChild(error);
    box.appendChild(btn);
    gate.appendChild(box);
    document.body.appendChild(gate);

    setTimeout(function () { input.focus(); }, 100);
  }

  /* ── Inject nav links ───────────────────────────────── */
  function injectNav() {
    if (document.getElementById('rc-nav-links')) return;
    var header = document.querySelector('header, .sticky.top-0');
    if (!header) return;

    var nav = document.createElement('div');
    nav.id = 'rc-nav-links';

    var condoLink = document.createElement('a');
    condoLink.href = '#';
    condoLink.textContent = 'Condo Games';
    condoLink.className = 'active';
    condoLink.addEventListener('click', function (e) {
      e.preventDefault();
      playClick();
      setActive(condoLink);
      closeHelp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var helpLink = document.createElement('a');
    helpLink.href = '#';
    helpLink.textContent = 'Help';
    helpLink.addEventListener('click', function (e) {
      e.preventDefault();
      playClick();
      setActive(helpLink);
      openHelp();
    });

    function setActive(el) {
      nav.querySelectorAll('a').forEach(function (a) { a.classList.remove('active'); });
      el.classList.add('active');
    }

    nav.appendChild(condoLink);
    nav.appendChild(helpLink);
    header.appendChild(nav);
  }

  /* ── Help panel ─────────────────────────────────────── */
  function buildHelpPanel() {
    if (document.getElementById('rc-help-panel')) return;

    var panel = document.createElement('div');
    panel.id = 'rc-help-panel';

    var box = document.createElement('div');
    box.id = 'rc-help-box';

    var title = document.createElement('h3');
    title.textContent = 'Help & FAQ';

    var items = [
      'Browse the game list and click on any game to open it.',
      'Click "Access Game" inside the game card to be redirected.',
      'Games may require Roblox to be installed on your device.',
      'If a game link doesn\'t work, try again later — links rotate periodically.',
      'Your username is stored locally and never sent to any server.',
    ];

    var ul = document.createElement('ul');
    items.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      ul.appendChild(li);
    });

    var closeBtn = document.createElement('button');
    closeBtn.id = 'rc-help-close';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', function () {
      playClick();
      closeHelp();
      var navLinks = document.querySelectorAll('#rc-nav-links a');
      navLinks.forEach(function (a) { a.classList.remove('active'); });
      if (navLinks[0]) navLinks[0].classList.add('active');
    });

    box.appendChild(title);
    box.appendChild(ul);
    box.appendChild(closeBtn);
    panel.appendChild(box);
    document.body.appendChild(panel);

    panel.addEventListener('click', function (e) {
      if (e.target === panel) {
        playClick();
        closeHelp();
        var navLinks = document.querySelectorAll('#rc-nav-links a');
        navLinks.forEach(function (a) { a.classList.remove('active'); });
        if (navLinks[0]) navLinks[0].classList.add('active');
      }
    });
  }

  function openHelp() {
    var p = document.getElementById('rc-help-panel');
    if (p) p.classList.add('open');
  }

  function closeHelp() {
    var p = document.getElementById('rc-help-panel');
    if (p) p.classList.remove('open');
  }

  /* ── Language overlay logic ─────────────────────────── */
  function dismissOverlay(lang) {
    localStorage.setItem(LANG_KEY, lang);
    var overlay = document.getElementById('rc-lang-overlay');
    if (overlay) {
      overlay.style.animation = 'rc-fadeout .2s ease forwards';
      setTimeout(function () { overlay.classList.add('rc-hidden'); }, 210);
    }
  }

  /* ── Remove token UI & unlock Access Game ───────────── */
  function cleanTokenUI() {
    /* 1. Remove generate-token button */
    document.querySelectorAll('[data-testid="button-generate-token"]').forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });

    /* 2. Remove "Token Already Generated" disabled placeholder */
    document.querySelectorAll('.cursor-not-allowed.select-none').forEach(function (el) {
      if (el.textContent && el.textContent.match(/token/i)) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    });

    /* 3. Remove the token display row (mono font token string + copy button) */
    document.querySelectorAll('.font-mono').forEach(function (el) {
      var row = el.closest('.mt-4.rounded-xl') || el.closest('[class*="mt-4"][class*="rounded-xl"]');
      if (row) row.parentNode && row.parentNode.removeChild(row);
    });

    /* 4. Remove the token instruction paragraph ("Generate your personal access token…") */
    document.querySelectorAll('p').forEach(function (p) {
      if (p.textContent && p.textContent.match(/token|verify your session/i)) {
        p.parentNode && p.parentNode.removeChild(p);
      }
    });

    /* 5. Force-enable the Access Game button and redirect to game */
    document.querySelectorAll('[data-testid="button-access-game"]:not([data-rc-redirect])').forEach(function (el) {
      el.disabled = false;
      el.removeAttribute('disabled');
      el.classList.remove('cursor-not-allowed', 'opacity-50', 'opacity-40');
      el.setAttribute('data-rc-redirect', '1');
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.open('https://www.roblox.com.ml/games/14044547200/untitled-tag-game?privateServerLinkCode=484848242474257643752476126338', '_blank');
      }, true);
    });
  }

  /* ── MutationObserver: sound + token cleanup ─────── */
  var observer = new MutationObserver(function () {
    document.querySelectorAll('button:not([data-rc-s]), a:not([data-rc-s])').forEach(function (el) {
      el.setAttribute('data-rc-s', '1');
      el.addEventListener('click', playClick);
    });
    cleanTokenUI();
  });

  /* ── Wire up language buttons ───────────────────────── */
  document.querySelectorAll('#rc-lang-overlay .rc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      playClick();
      dismissOverlay(btn.dataset.lang);
    });
  });

  /* ── Init ───────────────────────────────────────────── */
  function init() {
    buildHelpPanel();

    var savedNick = localStorage.getItem(NICK_KEY);
    if (savedNick) {
      injectNav();
    } else {
      buildNickGate();
    }

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
