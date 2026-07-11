const heroTitle = 'Оцифровка и автоматизация бизнеса в Москве';

function HeroSection() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-4 py-16 sm:px-8 sm:py-20 lg:min-h-screen lg:px-12 lg:py-24">
        <div
          className="w-full max-w-4xl text-left"
        >
          <h1
            className="hero-reveal hero-reveal-1 metallic-title relative max-w-full break-words text-left text-[2.75rem] font-extrabold leading-[1.02] text-[#f8fafc] drop-shadow-[0_0_18px_rgba(255,255,255,0.06)] sm:text-5xl sm:leading-[1.06] lg:text-7xl"
            data-text={heroTitle}
          >
            {heroTitle}
          </h1>

          <h2
            className="hero-reveal hero-reveal-2 mt-6 max-w-2xl text-base font-medium leading-7 text-[#a1a1aa] sm:text-lg sm:leading-8"
          >
            Разрабатываю быстрые сайты и Telegram-боты, которые приводят
            клиентов. От 10 000 ₽ за 2 дня.
          </h2>

          <button
            className="hero-reveal hero-reveal-3 group relative mt-10 overflow-hidden rounded-sm border border-[rgba(255,255,255,0.2)] bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-700 ease-cinematic hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black sm:text-base"
            onClick={scrollToContact}
            type="button"
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-60 animate-shimmer" />
            <span className="relative z-10">Обсудить проект</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
