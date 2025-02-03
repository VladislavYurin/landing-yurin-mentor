document.addEventListener('DOMContentLoaded', function () {
  const animateElements = document.querySelectorAll('.animate-element');

  window.addEventListener('scroll', checkScroll);
  checkScroll();

  function checkScroll() {
    animateElements.forEach(function (element) {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      if (rect.top + rect.height <= viewportHeight) {
        element.classList.add('show');
      }
    });

    if (Array.from(animateElements).every(el => el.classList.contains('show'))) {
      window.removeEventListener('scroll', checkScroll);
    }
  }
});