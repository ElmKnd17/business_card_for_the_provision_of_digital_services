import expertPhoto from '../images/Expert.jpg';

const sectionTitle = 'Системный подход к вашему бизнесу';

function Expertise() {
  return (
    <section
      className="px-6 py-24 sm:px-8 lg:px-12 lg:py-32"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-14 lg:flex-row lg:gap-20">
        <div className="w-full max-w-3xl lg:w-1/2">
          <h2
            className="metallic-title text-3xl font-bold leading-tight text-[#f8fafc] sm:text-4xl lg:text-5xl"
            data-text={sectionTitle}
          >
            {sectionTitle}
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
            <img
              alt="Портрет специалиста"
              className="aspect-[4/5] w-full rounded-md object-cover grayscale transition duration-1000 ease-cinematic hover:grayscale-0"
              decoding="async"
              loading="lazy"
              src={expertPhoto}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Expertise;
