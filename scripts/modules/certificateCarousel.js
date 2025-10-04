// Handles certificate gallery carousel logic
document.querySelectorAll('.cert-gallery').forEach(gallery => {
  const wrappers = gallery.querySelectorAll('.cert-wrapper');
  let activeIndex = 0;

  function updateCarousel() {
    wrappers.forEach((wrap, i) => {
      wrap.classList.remove('active', 'prev', 'next', 'hidden');

      if (i === activeIndex) wrap.classList.add('active');
      else if (i === (activeIndex - 1 + wrappers.length) % wrappers.length) wrap.classList.add('prev');
      else if (i === (activeIndex + 1) % wrappers.length) wrap.classList.add('next');
      else wrap.classList.add('hidden'); // hide all other cards
    });
  }

  wrappers.forEach((wrap, index) => {
    wrap.addEventListener('click', () => {
      activeIndex = index;
      updateCarousel();
    });
  });

  updateCarousel();
});
