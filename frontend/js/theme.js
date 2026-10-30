
(function () {
  function apply(choice) {
    var dark = choice === 'dark' ||
      (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
  window.getTheme = function () {
    try { return localStorage.getItem('theme') || 'light'; } catch (e) { return 'light'; }
  };
  window.setTheme = function (choice) {
    try { localStorage.setItem('theme', choice); } catch (e) {}
    apply(choice);
  };
  apply(window.getTheme());
})();
