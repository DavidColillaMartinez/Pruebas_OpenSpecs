/* Same-origin theme bootstrap. Runs before first paint, aligned with src/theme/preference.ts:
 * light and dark are the only values; anything else (or storage failing) resolves to light,
 * which is the default palette and needs no attribute. */
(function () {
  var value = null;
  try {
    value = window.localStorage.getItem('lrmq:theme:v1');
  } catch (error) {
    value = null;
  }
  if (value === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
