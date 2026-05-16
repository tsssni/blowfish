(() => {
  let lastG = 0;
  const SCROLL = 100;
  const isInput = (el) =>
    /^(input|textarea|select)$/i.test(el?.tagName) || el?.isContentEditable;
  const pagLink = (idx) =>
    document.querySelectorAll('.flex.justify-between.pt-3 > span')[idx]?.querySelector('a');

  addEventListener('keydown', (e) => {
    if (e.altKey || e.metaKey) return;
    if (isInput(e.target)) return;

    if (e.ctrlKey) {
      const h = window.innerHeight;
      switch (e.key) {
        case 'd': scrollBy({ top: h / 2, behavior: 'smooth' }); break;
        case 'u': scrollBy({ top: -h / 2, behavior: 'smooth' }); break;
        case 'f': scrollBy({ top: h, behavior: 'smooth' }); break;
        case 'b': scrollBy({ top: -h, behavior: 'smooth' }); break;
        default: return;
      }
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case 'j': scrollBy({ top: SCROLL, behavior: 'smooth' }); break;
      case 'k': scrollBy({ top: -SCROLL, behavior: 'smooth' }); break;
      case 'h': pagLink(0)?.click(); break;
      case 'l': pagLink(1)?.click(); break;
      case 'g':
        if (Date.now() - lastG < 500) {
          scrollTo({ top: 0, behavior: 'smooth' });
          lastG = 0;
        } else {
          lastG = Date.now();
        }
        break;
      case 'G': scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); break;
      default: return;
    }
    e.preventDefault();
  });
})();
