/* script.js
   Handles:
   - theme toggle (saved to localStorage)
   - contact form save to localStorage (portfolio_responses)
   - admin login and response rendering + delete/clear/download
*/

document.addEventListener('DOMContentLoaded', () => {
  /* === Constants / Keys === */
  const RESP_KEY = 'portfolio_responses';
  const THEME_KEY = 'portfolio_theme';
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'Admin@123';

  /* === Elements === */
  const themeBtn = document.getElementById('theme-toggle');
  const body = document.body;
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  const loginBtn = document.getElementById('loginBtn');
  const loginSection = document.getElementById('loginSection');
  const responsesSection = document.getElementById('responsesSection');
  const responsesList = document.getElementById('responsesList');
  const adminFeedback = document.getElementById('adminFeedback');
  const logoutBtn = document.getElementById('logoutBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const noResponses = document.getElementById('noResponses');

  /* === Helpers === */
  const saveResponses = (arr) => localStorage.setItem(RESP_KEY, JSON.stringify(arr || []));
  const getResponses = () => JSON.parse(localStorage.getItem(RESP_KEY) || '[]');

  /* === Theme Init === */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') {
      body.classList.add('dark');
      themeBtn.textContent = '☀️';
      themeBtn.setAttribute('aria-pressed', 'true');
    } else {
      body.classList.remove('dark');
      themeBtn.textContent = '🌙';
      themeBtn.setAttribute('aria-pressed', 'false');
    }
  }
  initTheme();

  themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark');
    const nowDark = body.classList.contains('dark');
    localStorage.setItem(THEME_KEY, nowDark ? 'dark' : 'light');
    themeBtn.textContent = nowDark ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-pressed', nowDark ? 'true' : 'false');
  });

  /* === Contact Form === */
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('name').value || '').trim();
    const email = (document.getElementById('email').value || '').trim();
    const message = (document.getElementById('message').value || '').trim();

    if (!name || !email || !message) {
      formFeedback.textContent = 'Please fill all fields.';
      return;
    }

    const responses = getResponses();
    const entry = {
      id: Date.now(),
      name,
      email,
      message,
      timestamp: new Date().toISOString()
    };
    responses.unshift(entry); // newest first
    saveResponses(responses);

    formFeedback.textContent = 'Message saved — thank you!';
    contactForm.reset();

    setTimeout(() => formFeedback.textContent = '', 3500);
  });

  /* === Admin / Responses === */
  function renderResponses() {
    const arr = getResponses();
    responsesList.innerHTML = '';
    if (!arr.length) {
      noResponses.style.display = 'block';
      return;
    } else {
      noResponses.style.display = 'none';
    }

    arr.forEach((r) => {
      const li = document.createElement('li');
      li.className = 'response-item';

      const meta = document.createElement('div');
      meta.className = 'response-meta';
      const metaLeft = document.createElement('div');
      metaLeft.innerHTML = `<strong>${escapeHtml(r.name)}</strong> • <span class="muted">${escapeHtml(r.email)}</span>`;
      const metaRight = document.createElement('div');
      const time = new Date(r.timestamp);
      metaRight.textContent = time.toLocaleString();
      meta.appendChild(metaLeft);
      meta.appendChild(metaRight);

      const msg = document.createElement('div');
      msg.textContent = r.message;

      const actions = document.createElement('div');
      actions.className = 'response-actions';
      const del = document.createElement('button');
      del.className = 'btn ghost small';
      del.textContent = 'Delete';
      del.addEventListener('click', () => {
        deleteResponse(r.id);
      });

      actions.appendChild(del);

      li.appendChild(meta);
      li.appendChild(msg);
      li.appendChild(actions);

      responsesList.appendChild(li);
    });
  }

  function deleteResponse(id) {
    const arr = getResponses().filter(r => r.id !== id);
    saveResponses(arr);
    renderResponses();
  }

  loginBtn.addEventListener('click', () => {
    const user = (document.getElementById('adminUser').value || '').trim();
    const pass = (document.getElementById('adminPass').value || '').trim();
    adminFeedback.textContent = '';

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      loginSection.style.display = 'none';
      responsesSection.style.display = 'block';
      renderResponses();
    } else {
      adminFeedback.textContent = 'Invalid credentials.';
      setTimeout(() => adminFeedback.textContent = '', 3000);
    }
  });

  logoutBtn.addEventListener('click', () => {
    loginSection.style.display = 'block';
    responsesSection.style.display = 'none';
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
  });

  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear all saved responses? This cannot be undone.')) return;
    saveResponses([]);
    renderResponses();
  });

  downloadBtn.addEventListener('click', () => {
    const data = getResponses();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_responses.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  /* === Helpers & Sanitizers === */
  function escapeHtml(unsafe) {
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* === Misc UI updates === */
  document.getElementById('year').textContent = new Date().getFullYear();

  (function showNoResponsesIfEmpty(){
    const arr = getResponses();
    if (!arr.length){
      noResponses.style.display = 'block';
    } else {
      noResponses.style.display = 'none';
    }
  })();

});

