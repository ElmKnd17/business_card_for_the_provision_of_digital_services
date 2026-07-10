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

function HeroSection() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="relative flex min-h-screen overflow-hidden bg-[#000000]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 sm:h-[42rem] sm:w-[42rem] lg:h-[56rem] lg:w-[56rem]">
          <motion.div
            className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.34)_0%,rgba(59,130,246,0.18)_42%,rgba(0,0,0,0)_72%)] blur-3xl"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.42)_52%,#000000_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-start px-4 pb-20 pt-[22vh] sm:items-center sm:px-8 sm:py-20 lg:px-12">
        <motion.div
          className="w-full max-w-4xl text-left"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_auto] bg-clip-text text-left text-4xl font-extrabold leading-[1.05] text-transparent animate-text-gradient sm:text-5xl lg:text-7xl"
            variants={fadeUpBlurVariants}
          >
            Оцифровка и автоматизация бизнеса в Москве
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
