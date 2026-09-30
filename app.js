/* 모바일 청첩장 데모 — app.js */
(function () {
  'use strict';

  /* ============ 핀치줌 방지 (모청 관례: 사진 확대 기능적으로 차단) ============ */
  // iOS Safari: gesturestart를 막으면 핀치줌이 동작하지 않는다
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  // 더블탭 줌 방지 (구형 브라우저 대비)
  document.addEventListener('dblclick', function (e) { e.preventDefault(); }, { passive: false });
  // 데스크톱: Ctrl+휠 확대 방지
  document.addEventListener('wheel', function (e) {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });
  // 갤러리 길게 누르기 메뉴(저장) 방지
  document.getElementById('gallery').addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* ============ D-day ============ */
  var WEDDING = new Date('2027-09-25T14:00:00+09:00');
  function tickDday() {
    var now = new Date();
    var diff = Math.ceil((WEDDING - now) / 86400000);
    var el = document.getElementById('dday');
    if (diff > 0) el.textContent = '결혼까지 D-' + diff;
    else if (diff === 0) el.textContent = '오늘 결혼합니다 ♥';
    else el.textContent = '결혼 ' + Math.abs(diff) + '일째';
  }
  tickDday();

  /* ============ 스크롤 리빌 ============ */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ============ 토스트 ============ */
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 1800);
  }

  /* ============ 복사 버튼 ============ */
  function copyText(text, doneMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(doneMsg); })
        .catch(function () { fallbackCopy(text, doneMsg); });
    } else { fallbackCopy(text, doneMsg); }
  }
  function fallbackCopy(text, doneMsg) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(doneMsg); }
    catch (e) { toast('복사에 실패했어요'); }
    document.body.removeChild(ta);
  }
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-copy'), '계좌번호가 복사됐어요');
    });
  });

  /* ============ 갤러리: 확대 기능 없음 (그리드 그대로 감상) ============ */

  /* ============ 방명록 (Supabase REST) ============ */
  var cfg = window.INVITATION_CONFIG || {};
  var list = document.getElementById('guestbook-list');
  var form = document.getElementById('guestbook-form');

  function sb(path, opts) {
    opts = opts || {};
    return fetch(cfg.SUPABASE_URL + '/rest/v1' + path, {
      method: opts.method || 'GET',
      headers: {
        'apikey': cfg.SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + cfg.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
  }
  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }
  function loadGuestbook() {
    if (!cfg.SUPABASE_URL) { list.innerHTML = '<li class="gb-empty">방명록 설정 중이에요</li>'; return; }
    sb('/guestbook?select=name,message,created_at&order=created_at.desc&limit=50')
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (!rows.length) { list.innerHTML = '<li class="gb-empty">첫 축하 메시지의 주인공이 되어주세요 ♥</li>'; return; }
        list.innerHTML = rows.map(function (row) {
          return '<li><span class="gb-name">' + esc(row.name) + '</span>' +
            '<span class="gb-date">' + fmtDate(row.created_at) + '</span>' +
            '<p class="gb-msg">' + esc(row.message) + '</p></li>';
        }).join('');
      })
      .catch(function () { list.innerHTML = '<li class="gb-empty">방명록을 불러오지 못했어요</li>'; });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('gb-name').value.trim();
    var message = document.getElementById('gb-message').value.trim();
    if (!name || !message) { toast('이름과 메시지를 입력해주세요'); return; }
    sb('/guestbook', { method: 'POST', body: { name: name, message: message } })
      .then(function (r) {
        if (!r.ok) throw new Error('post failed');
        document.getElementById('gb-name').value = '';
        document.getElementById('gb-message').value = '';
        toast('소중한 메시지 감사합니다 ♥');
        loadGuestbook();
      })
      .catch(function () { toast('등록에 실패했어요. 다시 시도해주세요'); });
  });
  loadGuestbook();

  /* ============ 공유하기 ============ */
  document.getElementById('share-btn').addEventListener('click', function () {
    var data = { title: document.title, text: '박신랑 ♥ 김신부 결혼합니다', url: location.href };
    if (navigator.share) { navigator.share(data).catch(function () {}); }
    else { copyText(location.href, '청첩장 링크가 복사됐어요'); }
  });
  document.getElementById('copy-link-btn').addEventListener('click', function () {
    copyText(location.href, '청첩장 링크가 복사됐어요');
  });
})();
