import { Bot, Monitor } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const offers = [
  {
    icon: Monitor,
    title: 'Сайт-визитка',
    text: 'Современный лендинг с мощным визуалом, блоками услуг, контактами и базовой формой захвата лидов.',
  },
  {
    icon: Bot,
    title: 'Бот-ассистент',
    text: 'Telegram-бот с продуманной архитектурой меню, который рассказывает о компании, показывает прайс и собирает первичные контакты.',
  },
];

const sectionTitle = 'Фундамент (Точка входа) — 10 000 ₽';

function TiltOfferCard({ offer, scrollToContact }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 160, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 160, damping: 20, mass: 0.4 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-12deg', '12deg']);
  const glareX = useMotionValue('50%');
  const glareY = useMotionValue('50%');
  const Icon = offer.icon;

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = Math.min(
      Math.max((event.clientX - rect.left) / rect.width, 0),
      1
    );
    const pointerY = Math.min(
      Math.max((event.clientY - rect.top) / rect.height, 0),
      1
    );

    x.set(pointerX - 0.5);
    y.set(pointerY - 0.5);
    glareX.set(`${pointerX * 100}%`);
    glareY.set(`${pointerY * 100}%`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.article
      className="group relative cursor-pointer rounded-lg border border-white/5 bg-[#050505]/90 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 ease-cinematic hover:-translate-y-1 hover:border-white/20 lg:p-10"
      key={offer.title}
      onClick={scrollToContact}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          scrollToContact();
        }
      }}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseMove}
      onMouseMove={handleMouseMove}
      role="button"
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      tabIndex={0}
      transformTemplate={(_, generatedTransform) =>
        `translate3d(var(--tw-translate-x, 0), var(--tw-translate-y, 0), 0) ${generatedTransform}`
      }
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
        <motion.div
          className="absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.26)_0%,rgba(139,92,246,0.18)_34%,rgba(59,130,246,0.1)_55%,transparent_74%)] opacity-0 blur-2xl transition-opacity duration-200 ease-out group-hover:opacity-100"
          style={{ left: glareX, top: glareY }}
        />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-700 ease-cinematic group-hover:opacity-100" />
      </div>

      <div
        className="relative z-10"
        style={{
          transform: 'translateZ(46px)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-primary transition-colors duration-500 ease-cinematic group-hover:border-white/20 group-hover:text-accent"
          style={{ transform: 'translateZ(18px)' }}
        >
          <Icon aria-hidden="true" className="h-6 w-6" />
        </div>

        <h3 className="mt-8 text-2xl font-semibold text-white">
          {offer.title}
        </h3>
        <p className="mt-4 text-base leading-7 text-[#a1a1aa]">
          {offer.text}
        </p>
      </div>
    </motion.article>
  );
}

function BaseOffers() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <section
      className="px-6 py-24 sm:px-8 lg:px-12 lg:py-32"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <h2
            className="metallic-title text-3xl font-bold leading-tight text-[#f8fafc] sm:text-4xl lg:text-5xl"
            data-text={sectionTitle}
          >
            {sectionTitle}
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#a1a1aa]">
            Это то, с чего начинается любой проект. Вы получаете готовую,
            красиво упакованную базу за фиксированную сумму.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {offers.map((offer) => (
            <TiltOfferCard
              key={offer.title}
              offer={offer}
              scrollToContact={scrollToContact}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default BaseOffers;
