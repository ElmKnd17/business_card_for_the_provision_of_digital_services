import { Calculator, CreditCard, GitBranch, RefreshCw } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const modules = [
  {
    icon: GitBranch,
    title: 'Маршрутизация и учет заявок',
    text: 'Настрою передачу заявок туда, где вам удобно с ними работать: в защищенный Telegram-канал для администраторов, в вашу внутреннюю систему учета, на почту или в любой удобный вам формат.',
  },
  {
    icon: Calculator,
    title: 'Интерактивные виджеты и сбор данных',
    text: 'Калькуляторы стоимости под специфику бизнеса, квизы для подбора услуг, многошаговые формы бронирования или записи.',
  },
  {
    icon: CreditCard,
    title: 'Интеграция платежных решений',
    text: 'Подключение эквайринга для приема оплат прямо на сайте или в боте.',
  },
  {
    icon: RefreshCw,
    title: 'Динамический контент',
    text: 'Автоматическое обновление прайс-листов, генерация индивидуальных предложений для клиентов в боте или создание закрытых разделов.',
  },
];

const sectionTitle = 'Модули кастомной логики';

function TiltModuleCard({ module, scrollToContact }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 160, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 160, damping: 20, mass: 0.4 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-12deg', '12deg']);
  const glareX = useMotionValue('50%');
  const glareY = useMotionValue('50%');
  const Icon = module.icon;

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
      key={module.title}
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
          className="absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.24)_0%,rgba(139,92,246,0.17)_34%,rgba(59,130,246,0.1)_55%,transparent_74%)] opacity-0 blur-2xl transition-opacity duration-200 ease-out group-hover:opacity-100"
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
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-accent transition-colors duration-500 ease-cinematic group-hover:border-white/20 group-hover:text-primary"
          style={{ transform: 'translateZ(18px)' }}
        >
          <Icon aria-hidden="true" className="h-6 w-6" />
        </div>

        <h3 className="mt-8 text-xl font-semibold leading-7 text-white sm:text-2xl">
          {module.title}
        </h3>
        <p className="mt-4 text-base leading-7 text-[#d4d4d8]">
          {module.text}
        </p>
      </div>
    </motion.article>
  );
}

function CustomModules() {
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
            Сборка функционала под ваши бизнес-процессы. Оценивается
            индивидуально после анализа задачи.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {modules.map((module) => (
            <TiltModuleCard
              key={module.title}
              module={module}
              scrollToContact={scrollToContact}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CustomModules;
