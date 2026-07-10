import { Calculator, CreditCard, GitBranch, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

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

const sectionVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function CustomModules() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <motion.section
      className="bg-background px-6 py-24 sm:px-8 lg:px-12 lg:py-32"
      initial="hidden"
      variants={sectionVariants}
      viewport={{ once: true, amount: 0.22 }}
      whileInView="visible"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Модули кастомной логики
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#a1a1aa]">
            Сборка функционала под ваши бизнес-процессы. Оценивается
            индивидуально после анализа задачи.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <article
                className="group relative cursor-pointer overflow-hidden rounded-lg border border-white/5 bg-[#050505] p-8 transition-all duration-500 ease-cinematic hover:-translate-y-1 hover:border-white/20 lg:p-10"
                key={module.title}
                onClick={scrollToContact}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    scrollToContact();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.2)_0%,rgba(59,130,246,0.09)_42%,transparent_70%)] opacity-0 transition-opacity duration-700 ease-cinematic group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-700 ease-cinematic group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-accent transition-colors duration-500 ease-cinematic group-hover:border-white/20 group-hover:text-primary">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </div>

                  <h3 className="mt-8 text-xl font-semibold leading-7 text-white sm:text-2xl">
                    {module.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-[#d4d4d8]">
                    {module.text}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

export default CustomModules;
