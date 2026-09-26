// Travel through the first zero in each 100 mark, using its rendered position.
async function enterHome() {
  const login = document.querySelector('#loginPage');
  const home = document.querySelector('#homePage');
  const animations = [];
  document.activeElement?.blur();
  document.body.classList.remove('tracker-open', 'panel-open');
  document.body.classList.add('entering-home');
  login.inert = true;
  home.inert = true;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  const play = (element, frames, options) => {
    const animation = element.animate(frames, { fill: 'both', ...options });
    animations.push(animation);
    return animation.finished;
  };
  const portal = element => {
    const circle = element.querySelector('.brand-mark circle');
    const rect = circle.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    element.style.transformOrigin = `${x - bounds.left}px ${y - bounds.top}px`;
    const scale = Math.max(window.innerWidth, window.innerHeight) * 2 / Math.max(rect.width, 1);
    return `translate(${window.innerWidth / 2 - x}px, ${window.innerHeight / 2 - y}px) scale(${scale})`;
  };

  try {
    // Let blur dismiss mobile keyboards before measuring the logo positions.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (!login.animate) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await play(login, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 });
    } else {
      const loginZoom = portal(login);
      const homeZoom = portal(home);
      await play(login, [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: loginZoom, opacity: 1 }
      ], { duration: 720, easing: 'cubic-bezier(.65, 0, .35, 1)' });
      await Promise.all([
        play(login, [{ opacity: 1 }, { opacity: 0 }], { duration: 240 }),
        play(home, [
          { transform: homeZoom },
          { transform: 'translate(0, 0) scale(1)' }
        ], { duration: 900, easing: 'cubic-bezier(.16, 1, .3, 1)' })
      ]);
    }
  } catch (error) {
    // A cancelled animation must still finish the navigation.
    console.warn('Home transition interrupted:', error.name);
  } finally {
    login.classList.remove('show');
    login.setAttribute('aria-hidden', 'true');
    home.setAttribute('aria-hidden', 'false');
    animations.forEach(animation => animation.cancel());
    login.style.removeProperty('transform-origin');
    home.style.removeProperty('transform-origin');
    document.body.classList.remove('entering-home');
    login.inert = false;
    home.inert = false;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    home.querySelector('.brand').focus({ preventScroll: true });
  }
}