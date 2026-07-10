import { motion } from 'framer-motion';
import expertPhoto from '../images/Expert.jpg';

const photoVariants = {
  hidden: {
    scale: 1.2,
  },
  visible: {
    scale: 1,
    transition: {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function Expertise() {
  return (
    <motion.section
      className="bg-background px-6 py-24 sm:px-8 lg:px-12 lg:py-32"
      initial={{ opacity: 0, y: 60, filter: 'blur(8px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.15 }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-14 lg:flex-row lg:gap-20">
        <div className="w-full max-w-3xl lg:w-1/2">
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Системный подход к вашему бизнесу
          </h2>

          <div className="mt-7 space-y-5 text-lg leading-8 text-[#a1a1aa]">
            <p>
              Я системный аналитик. Моя задача — не просто написать код, а
              выстроить логику, которая избавит вас от рутины и не потеряет ни
              одного клиента.
            </p>
            <p>
              Мы встречаемся в Москве лично или созваниваемся, я провожу
              экспресс-анализ ваших процессов, и через 2-3 дня вы получаете
              готовый цифровой инструмент.
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-md lg:w-1/2 lg:max-w-lg">
          <div className="absolute -inset-6 rounded-lg bg-gradient-to-br from-accent/35 via-primary/25 to-transparent opacity-70 blur-3xl" />

          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#050505] p-2">
            <motion.img
              alt="Портрет специалиста"
              className="aspect-[4/5] w-full rounded-md object-cover grayscale transition duration-1000 ease-cinematic hover:grayscale-0"
              initial="hidden"
              src={expertPhoto}
              variants={photoVariants}
              viewport={{ once: true, amount: 0.35 }}
              whileInView="visible"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Expertise;
