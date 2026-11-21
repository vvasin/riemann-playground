import { byId } from "./ui/dom";

const ACTIVE_THRESHOLD = 0.35;

export function mountNavigation(): void {
  const nav = document.querySelector<HTMLElement>(".chapter-nav");
  if (!nav) return;
  const links = [...nav.querySelectorAll("a")];
  const sections = links.map((link) => byId(link.hash.slice(1)));
  const progress = byId("readingProgress");
  let current = -1;

  function centerLink(link: HTMLElement) {
    nav?.scrollTo({
      left: Math.max(
        0,
        link.offsetLeft - nav.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
      ),
    });
  }

  function update() {
    const threshold = window.innerHeight * ACTIVE_THRESHOLD;
    const active = sections.findLastIndex(
      (section) => section.getBoundingClientRect().top <= threshold,
    );
    links.forEach((link, i) => link.classList.toggle("active", i === active));
    if (active !== current && active >= 0) {
      centerLink(links[active]);
      current = active;
    }
    const scrollable = document.documentElement.scrollHeight - window.innerHeight || 1;
    progress.style.width = `${Math.max(0, Math.min(100, (window.scrollY / scrollable) * 100))}%`;
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}
