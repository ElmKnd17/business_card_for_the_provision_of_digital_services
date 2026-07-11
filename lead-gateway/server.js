const axios = require('axios');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { SocksProxyAgent } = require('socks-proxy-agent');

const app = express();
const port = Number(process.env.PORT || 3000);

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const telegramProxyUrl = process.env.TELEGRAM_PROXY_URL || 'socks5h://vpn-proxy:1080';
const minFormTimeMs = Number(process.env.MIN_FORM_TIME_MS || 1500);
const maxFormAgeMs = Number(process.env.MAX_FORM_AGE_MS || 24 * 60 * 60 * 1000);
const telegramTimeoutMs = Number(process.env.TELEGRAM_TIMEOUT_MS || 15000);
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '32kb' }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  }),
);

const leadLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  limit: Number(process.env.RATE_LIMIT_MAX || 5),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Too many requests. Please try again later.',
  },
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telegramPattern = /^@?[A-Za-z0-9_]{5,32}$/;

const trimText = (value, maxLength = 1000) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const normalizeTelegram = (value) => {
  const telegram = trimText(value, 64);

  if (!telegram) {
    return '';
  }

  const withoutLinks = telegram
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '')
    .replace(/^(t\.me|telegram\.me)\//i, '');
  const username = withoutLinks.replace(/^@/, '').trim();

  return username ? `@${username}` : '';
};

const getPhoneDigits = (value) => trimText(value, 64).replace(/\D/g, '');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const pickUtm = (utm) => {
  if (!utm || typeof utm !== 'object' || Array.isArray(utm)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(utm)
      .filter(([, value]) => typeof value === 'string' && value.trim())
      .slice(0, 12)
      .map(([key, value]) => [trimText(key, 40), trimText(value, 160)]),
  );
};

const validateLead = (body) => {
  const lead = {
    source: trimText(body.source, 120) || 'unknown-site',
    name: trimText(body.name, 120),
    phone: trimText(body.phone, 64),
    email: trimText(body.email, 160).toLowerCase(),
    telegram: normalizeTelegram(body.telegram),
    message: trimText(body.message, 2000),
    page: trimText(body.page, 500),
    utm: pickUtm(body.utm),
    honeypot: trimText(body.honeypot || body.website, 200),
    formStartedAt: Number(body.formStartedAt),
  };
  const errors = [];

  if (!lead.name) {
    errors.push('name is required');
  }

  if (!lead.phone && !lead.email && !lead.telegram) {
    errors.push('at least one contact field is required');
  }

  if (lead.email && !emailPattern.test(lead.email)) {
    errors.push('email is invalid');
  }

  if (lead.phone) {
    const phoneDigits = getPhoneDigits(lead.phone);

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      errors.push('phone is invalid');
    }
  }

  if (lead.telegram && !telegramPattern.test(lead.telegram)) {
    errors.push('telegram username is invalid');
  }

  if (!Number.isFinite(lead.formStartedAt) || lead.formStartedAt <= 0) {
    errors.push('formStartedAt is required');
  } else {
    const formAge = Date.now() - lead.formStartedAt;

    if (formAge < minFormTimeMs) {
      errors.push('form submitted too quickly');
    }

    if (formAge > maxFormAgeMs) {
      errors.push('form session expired');
    }
  }

  return { errors, lead };
};

const formatTelegramMessage = (lead, req) => {
  const lines = [
    '<b>Новая заявка с сайта</b>',
    '',
    `<b>Источник:</b> ${escapeHtml(lead.source)}`,
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
  ];

  if (lead.phone) {
    lines.push(`<b>Телефон:</b> ${escapeHtml(lead.phone)}`);
  }

  if (lead.email) {
    lines.push(`<b>Email:</b> ${escapeHtml(lead.email)}`);
  }

  if (lead.telegram) {
    lines.push(`<b>Telegram:</b> ${escapeHtml(lead.telegram)}`);
  }

  if (lead.message) {
    lines.push('', `<b>Комментарий:</b> ${escapeHtml(lead.message)}`);
  }

  if (lead.page) {
    lines.push('', `<b>Страница:</b> ${escapeHtml(lead.page)}`);
  }

  const utmEntries = Object.entries(lead.utm);

  if (utmEntries.length) {
    lines.push('', '<b>UTM:</b>');
    utmEntries.forEach(([key, value]) => {
      lines.push(`${escapeHtml(key)}: ${escapeHtml(value)}`);
    });
  }

  lines.push('', `<b>IP:</b> ${escapeHtml(req.ip || 'unknown')}`);

  return lines.join('\n');
};

const createTelegramAgent = () => {
  if (!telegramProxyUrl) {
    return undefined;
  }

  if (!telegramProxyUrl.startsWith('socks://') && !telegramProxyUrl.startsWith('socks5://') && !telegramProxyUrl.startsWith('socks5h://')) {
    throw new Error('Only SOCKS proxy URLs are supported for TELEGRAM_PROXY_URL');
  }

  return new SocksProxyAgent(telegramProxyUrl);
};

const telegramAgent = createTelegramAgent();

const sendTelegramMessage = async (text) => {
  if (!telegramBotToken || !telegramChatId) {
    throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required');
  }

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

  const response = await axios.post(
    url,
    {
      chat_id: telegramChatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    },
    {
      timeout: telegramTimeoutMs,
      proxy: false,
      httpAgent: telegramAgent,
      httpsAgent: telegramAgent,
    },
  );

  if (!response.data?.ok) {
    throw new Error(response.data?.description || 'Telegram returned a failed response');
  }
};

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/lead', leadLimiter, async (req, res) => {
  const { errors, lead } = validateLead(req.body || {});

  if (lead.honeypot) {
    res.json({ ok: true, accepted: true });
    return;
  }

  if (errors.length) {
    res.status(400).json({
      ok: false,
      message: 'Lead validation failed',
      errors,
    });
    return;
  }

  try {
    await sendTelegramMessage(formatTelegramMessage(lead, req));
    res.json({ ok: true, accepted: true });
  } catch (error) {
    console.error('Telegram delivery failed:', error.message);
    res.status(502).json({
      ok: false,
      message: 'Lead accepted but delivery failed. Please try again later.',
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Not found' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Lead gateway is listening on port ${port}`);
});
