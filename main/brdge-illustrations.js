/* BRDGE illustrations in the brand color.
   Reads --illu-primary from :root, then recolors every BRDGE illustration on the page
   (card images and the dialog image). Light and dark tones are derived from it.
   If an illustration has no SVG version yet, the PNG stays as it is. */
(() => {
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--illu-primary').trim();
  if (!primary) return;
  const ILLU = /\/illustration\d?\.(?:svg|png)$/i;
  const cache = new Map();

  function recolored(url) {
    const svgUrl = url.replace(/\.png$/i, '.svg');
    if (!cache.has(svgUrl)) {
      cache.set(svgUrl, fetch(svgUrl)
        .then(r => (r.ok ? r.text() : Promise.reject()))
        .then(svg => {
          if (!svg.includes('illu-') || !svg.includes('<style>')) throw new Error('not a brandable SVG');
          svg = svg.replace('<style>', `<style>svg{--illu-primary:${primary}}`);
          return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        })
        .catch(() => null));
    }
    return cache.get(svgUrl);
  }

  async function fixImg(img) {
    const src = img.getAttribute('src') || '';
    if (img.dataset.illu || !ILLU.test(src)) return;
    img.dataset.illu = '1';
    const url = await recolored(src);
    if (url) img.src = url;
  }

  async function fixBackground(el) {
    const m = (el.style.backgroundImage || '').match(/url\(["']?([^"')]+)["']?\)/);
    if (el.dataset.illu || !m || !ILLU.test(m[1])) return;
    el.dataset.illu = '1';
    const url = await recolored(m[1]);
    if (url) el.style.backgroundImage = `url("${url}")`;
  }

  // Load an illustration only when it comes near the screen
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { io.unobserve(e.target); fixImg(e.target); }
  }), { rootMargin: '400px' });

  function scan(root) {
    if (root.matches?.('img')) io.observe(root);
    root.querySelectorAll?.('img').forEach(img => io.observe(img));
    if (root.matches?.('[style*="illustration"]')) fixBackground(root);
    root.querySelectorAll?.('[style*="illustration"]').forEach(fixBackground);
  }

  new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && scan(n))))
    .observe(document.body, { childList: true, subtree: true });
  scan(document);
})();
