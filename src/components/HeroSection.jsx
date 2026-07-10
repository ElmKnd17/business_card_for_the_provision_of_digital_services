import { motion } from 'framer-motion';

const cinematicEase = [0.16, 1, 0.3, 1];

const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeUpBlurVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.2,
      ease: cinematicEase,
    },
  },
};

const heroTitle = 'Оцифровка и автоматизация бизнеса в Москве';

function HeroSection() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-7xl items-center px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          className="w-full max-w-4xl text-left"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="metallic-title relative max-w-full break-words text-left text-[2.75rem] font-extrabold leading-[1.02] text-[#f8fafc] drop-shadow-[0_0_18px_rgba(255,255,255,0.06)] sm:text-5xl sm:leading-[1.06] lg:text-7xl"
            data-text={heroTitle}
            variants={fadeUpBlurVariants}
          >
            {heroTitle}
          </motion.h1>

          <motion.h2
            className="mt-6 max-w-2xl text-base font-medium leading-7 text-[#a1a1aa] sm:text-lg sm:leading-8"
            variants={fadeUpBlurVariants}
          >
            Разрабатываю быстрые сайты и Telegram-боты, которые приводят
            клиентов. От 10 000 ₽ за 2 дня.
          </motion.h2>

          <motion.button
            className="group relative mt-10 overflow-hidden rounded-sm border border-[rgba(255,255,255,0.2)] bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-700 ease-cinematic hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black sm:text-base"
            onClick={scrollToContact}
            type="button"
            variants={fadeUpBlurVariants}
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-60 animate-shimmer" />
            <span className="relative z-10">Обсудить проект</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
