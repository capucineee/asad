document.querySelectorAll('[data-burger]').forEach((b) =>
  b.addEventListener('click', () => {
    const open = document.querySelector('[data-nav]').classList.toggle('open');
    b.setAttribute('aria-expanded', open);
  })
);
document.querySelectorAll('form[data-confirm]').forEach((f) =>
  f.addEventListener('submit', (e) => {
    if (!confirm(f.dataset.confirm)) e.preventDefault();
  })
);

// ---------- espace bénévoles ----------
// Aperçu immédiat de la photo choisie
document.querySelectorAll('[data-photo-field]').forEach((box) => {
  const input = box.querySelector('[data-file]');
  const img = box.querySelector('[data-preview]');
  const empty = box.querySelector('[data-empty]');
  const btn = box.querySelector('[data-btn-text]');
  input.addEventListener('change', () => {
    const f = input.files[0];
    if (!f) return;
    if (f.size > 12 * 1024 * 1024) {
      alert('Cette photo est trop lourde (12 Mo maximum). Choisissez-en une plus légère.');
      input.value = '';
      return;
    }
    // Les photos HEIC ne peuvent pas être affichées par tous les navigateurs : elles seront converties à l'envoi
    img.onerror = () => {
      img.hidden = true;
      if (empty) {
        empty.hidden = false;
        empty.querySelector('strong').textContent = 'Photo choisie : ' + f.name;
      }
    };
    img.src = URL.createObjectURL(f);
    img.hidden = false;
    if (empty) empty.hidden = true;
    btn.textContent = 'Changer la photo';
  });
});

// Boutons de mise en forme des articles
const insertions = { title: '\n\n## Mon sous-titre\n', list: '\n\n- Premier point\n- Deuxième point\n- Troisième point\n' };
document.querySelectorAll('[data-insert]').forEach((b) =>
  b.addEventListener('click', () => {
    const t = document.getElementById('content');
    const at = t.selectionEnd ?? t.value.length;
    const text = insertions[b.dataset.insert];
    t.value = t.value.slice(0, at) + text + t.value.slice(at);
    t.focus();
    t.selectionStart = t.selectionEnd = at + text.length;
    t.dispatchEvent(new Event('input', { bubbles: true }));
  })
);

// Recherche et filtres de la liste des animaux
const tools = document.querySelector('[data-list-tools]');
if (tools) {
  const items = [...document.querySelectorAll('[data-item]')];
  const search = tools.querySelector('[data-search]');
  const none = document.querySelector('[data-none]');
  let filter = 'all';
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    items.forEach((it) => {
      const ok = (filter === 'all' || it.dataset.tags.split(' ').includes(filter)) && it.dataset.name.includes(q);
      it.hidden = !ok;
      if (ok) shown++;
    });
    none.hidden = shown > 0;
  };
  search.addEventListener('input', apply);
  tools.querySelectorAll('[data-filter]').forEach((c) =>
    c.addEventListener('click', () => {
      filter = c.dataset.filter;
      tools.querySelectorAll('[data-filter]').forEach((x) => x.classList.toggle('on', x === c));
      apply();
    })
  );
}

// Formulaires : prévenir avant de quitter avec des modifications non enregistrées, et éviter le double clic
document.querySelectorAll('form[data-guard]').forEach((f) => {
  let dirty = false;
  let sending = false;
  f.addEventListener('input', () => (dirty = true));
  f.addEventListener('change', () => (dirty = true));
  window.addEventListener('beforeunload', (e) => {
    if (dirty && !sending) e.preventDefault();
  });
  f.addEventListener('submit', () => {
    sending = true;
    const b = f.querySelector('[data-busy]');
    if (b) {
      b.textContent = b.dataset.busy;
      b.disabled = true;
    }
  });
});
