(function() {
  try {
    var saved = localStorage.getItem('interntrack-theme');
    var dark = false;
    if (saved === 'dark') {
      dark = true;
    } else if (saved === 'light') {
      dark = false;
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
