import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, Send } from 'lucide-react';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telegramPattern = /^@?[A-Za-z0-9_]{5,32}$/;
const sectionTitle = 'Готовы оцифровать бизнес?';

const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  const normalizedDigits = digits.startsWith('8')
    ? digits.slice(1)
    : digits.startsWith('7')
      ? digits.slice(1)
      : digits;
  const phoneDigits = normalizedDigits.slice(0, 10);

  if (!phoneDigits) {
    return '+7 (';
  }

  let formattedValue = '+7';

  if (phoneDigits.length > 0) {
    formattedValue += ` (${phoneDigits.slice(0, 3)}`;
  }

  if (phoneDigits.length >= 3) {
    formattedValue += ')';
  }

  if (phoneDigits.length > 3) {
    formattedValue += ` ${phoneDigits.slice(3, 6)}`;
  }

  if (phoneDigits.length > 6) {
    formattedValue += `-${phoneDigits.slice(6, 8)}`;
  }

  if (phoneDigits.length > 8) {
    formattedValue += `-${phoneDigits.slice(8, 10)}`;
  }

  return formattedValue;
};

const getPhoneDigits = (value) => value.replace(/\D/g, '');

const sanitizeTelegram = (value) => {
  const withoutLink = value
    .replace(/https?:\/\/(t\.me|telegram\.me)\//gi, '')
    .replace(/(t\.me|telegram\.me)\//gi, '');
  const cleaned = withoutLink.replace(/\s/g, '').replace(/[^A-Za-z0-9_@]/g, '');
  const hasAtPrefix = cleaned.startsWith('@');
  const username = cleaned.replace(/@/g, '').slice(0, 32);

  return hasAtPrefix && username ? `@${username}` : username;
};

const getUtmParams = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const utm = {};

  params.forEach((value, key) => {
    if (key.startsWith('utm_') && value) {
      utm[key] = value;
    }
  });

  return utm;
};

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const formStartedAtRef = useRef(Date.now());

  const {
    clearErrors,
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      telegram: '',
      contactGroup: '',
      honeypot: '',
    },
  });

  const hasContact = () => {
    const { email, phone, telegram } = getValues();
    return Boolean(email?.trim() || phone?.trim() || telegram?.trim());
  };

  const nameField = register('name', { required: 'Введите имя' });
  const emailField = register('email', {
    validate: (value) =>
      !value || emailPattern.test(value) || 'Введите корректный email',
  });
  const phoneField = register('phone', {
    validate: (value) =>
      !value ||
      getPhoneDigits(value).length === 11 ||
      'Введите телефон в формате +7 (XXX) XXX-XX-XX',
  });
  const telegramField = register('telegram', {
    validate: (value) =>
      !value ||
      telegramPattern.test(value) ||
      'Введите никнейм Telegram, например @user',
  });
  const contactGroupField = register('contactGroup', {
    validate: () => hasContact() || 'Укажите хотя бы один контакт для связи',
  });
  const honeypotField = register('honeypot');

  const clearContactError = () => {
    clearErrors('contactGroup');
    setServerError('');
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          source: 'business-card-site',
          name: data.name,
          email: data.email,
          phone: data.phone,
          telegram: data.telegram,
          message: '',
          page: typeof window !== 'undefined' ? window.location.href : '',
          utm: getUtmParams(),
          honeypot: data.honeypot,
          formStartedAt: formStartedAtRef.current,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok === false) {
        throw new Error(result.message || 'Не удалось отправить заявку');
      }

      setIsSuccess(true);
      reset();
      formStartedAtRef.current = Date.now();
    } catch (error) {
      console.error(error);
      setServerError(
        'Не удалось отправить заявку. Напишите мне напрямую в Telegram, на почту или по телефону.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-[100svh] flex-col justify-between px-6 pt-24 sm:px-8 lg:min-h-screen lg:px-12 lg:pt-32">
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center py-16">
        <div
          className="mx-auto w-full max-w-3xl scroll-my-16 text-center"
          id="contact"
        >
          <h2
            className="metallic-title text-4xl font-bold leading-tight text-[#f8fafc] sm:text-5xl lg:text-6xl"
            data-text={sectionTitle}
          >
            {sectionTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#a1a1aa]">
            Оставьте контакт, и я предложу решение под ваши задачи.
          </p>

          {isSuccess ? (
            <div className="mx-auto mt-12 max-w-xl rounded-lg border border-white/10 bg-[#050505] p-8 text-lg leading-8 text-white shadow-[0_0_60px_rgba(139,92,246,0.12)]">
              Спасибо, заявка принята. Я свяжусь с вами в ближайшее время.
            </div>
          ) : (
            <form
              className="mx-auto mt-12 max-w-xl space-y-7"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              <input type="hidden" {...contactGroupField} />
              <input
                autoComplete="off"
                className="hidden"
                tabIndex="-1"
                type="text"
                {...honeypotField}
              />

              <div className="text-left">
                <input
                  className="w-full border-0 border-b border-white/10 bg-transparent px-0 py-4 text-lg text-white outline-none transition-colors duration-500 placeholder:text-[#71717a] focus:border-white"
                  placeholder="Имя"
                  type="text"
                  {...nameField}
                  onChange={(event) => {
                    setServerError('');
                    nameField.onChange(event);
                  }}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="text-left">
                <input
                  className="w-full border-0 border-b border-white/10 bg-transparent px-0 py-4 text-lg text-white outline-none transition-colors duration-500 placeholder:text-[#71717a] focus:border-white"
                  inputMode="email"
                  placeholder="Email"
                  type="email"
                  {...emailField}
                  onChange={(event) => {
                    clearContactError();
                    emailField.onChange(event);
                  }}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="text-left">
                <input
                  className="w-full border-0 border-b border-white/10 bg-transparent px-0 py-4 text-lg text-white outline-none transition-colors duration-500 placeholder:text-[#71717a] focus:border-white"
                  inputMode="numeric"
                  maxLength={18}
                  placeholder="Телефон"
                  type="tel"
                  {...phoneField}
                  onChange={(event) => {
                    const formattedValue = formatPhoneNumber(
                      event.target.value,
                    );
                    event.target.value = formattedValue;
                    setValue('phone', formattedValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    clearContactError();
                  }}
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="text-left">
                <input
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full border-0 border-b border-white/10 bg-transparent px-0 py-4 text-lg text-white outline-none transition-colors duration-500 placeholder:text-[#71717a] focus:border-white"
                  placeholder="Telegram"
                  type="text"
                  {...telegramField}
                  onChange={(event) => {
                    const telegram = sanitizeTelegram(event.target.value);
                    event.target.value = telegram;
                    setValue('telegram', telegram, { shouldValidate: true });
                    clearContactError();
                  }}
                />
                {errors.telegram && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.telegram.message}
                  </p>
                )}
              </div>

              {errors.contactGroup && (
                <p className="text-left text-sm text-red-400">
                  {errors.contactGroup.message}
                </p>
              )}

              {serverError && (
                <p className="text-left text-sm text-red-400">
                  {serverError}
                </p>
              )}

              <button
                className="group relative mt-4 overflow-hidden rounded-sm border border-[rgba(255,255,255,0.2)] bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-700 ease-cinematic hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                disabled={isSubmitting}
                type="submit"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-60 animate-shimmer" />
                <span className="relative z-10">
                  {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="mx-auto w-full max-w-7xl border-t border-white/10 py-8">
        <div className="flex flex-col gap-5 text-sm text-[#a1a1aa] md:flex-row md:items-center md:justify-between">
          <p>© 2026. Разработка сайтов и ботов.</p>

          <div className="flex flex-col gap-4 md:items-end">
            <p>Москва. Работаю официально по НПД.</p>
            <div className="flex items-center gap-3">
              <a
                aria-label="Telegram: @elm_knd_17"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#050505] text-white transition-colors duration-500 ease-cinematic hover:border-white/30 hover:text-accent"
                href="https://t.me/elm_knd_17"
                rel="noreferrer"
                target="_blank"
              >
                <Send aria-hidden="true" className="h-4 w-4" />
              </a>
              <a
                aria-label="Email: elmanmagerramov63@gmail.com"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#050505] text-white transition-colors duration-500 ease-cinematic hover:border-white/30 hover:text-accent"
                href="mailto:elmanmagerramov63@gmail.com"
              >
                <Mail aria-hidden="true" className="h-4 w-4" />
              </a>
              <a
                aria-label="Телефон: 89276145933"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#050505] text-white transition-colors duration-500 ease-cinematic hover:border-white/30 hover:text-accent"
                href="tel:+79276145933"
              >
                <Phone aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}

export default ContactForm;
