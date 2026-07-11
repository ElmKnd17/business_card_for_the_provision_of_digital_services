const { spawn } = require('child_process');
const { writeFileSync } = require('fs');

const subscriptionUrl = process.env.VPN_SUBSCRIPTION_URL;
const profileMatch = process.env.VPN_PROFILE_MATCH || '';
const socksPort = Number(process.env.SOCKS_PORT || 1080);
const configPath = process.env.XRAY_CONFIG_PATH || '/tmp/xray-config.json';

const padBase64 = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
  const padding = normalized.length % 4;

  return padding ? normalized + '='.repeat(4 - padding) : normalized;
};

const decodeBase64 = (value) => Buffer.from(padBase64(value), 'base64').toString('utf8');

const decodeSubscription = (content) => {
  const trimmed = content.trim();

  if (/((vless|vmess|trojan|ss):\/\/)/i.test(trimmed)) {
    return trimmed;
  }

  try {
    const decoded = decodeBase64(trimmed);

    if (/((vless|vmess|trojan|ss):\/\/)/i.test(decoded)) {
      return decoded;
    }
  } catch (_error) {
    // Fall through to returning the original content.
  }

  return trimmed;
};

const getLinks = (content) =>
  Array.from(content.matchAll(/(?:vless|vmess|trojan|ss):\/\/[^\s"'<>]+/gi)).map((match) => match[0]);

const getDisplayName = (link) => {
  try {
    const hash = link.split('#')[1] || '';
    return decodeURIComponent(hash);
  } catch (_error) {
    return '';
  }
};

const selectLink = (links) => {
  if (!links.length) {
    throw new Error('No supported VPN profiles found in subscription');
  }

  const matchers = profileMatch
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!matchers.length) {
    return links[0];
  }

  const matched = links.find((link) => {
    let decodedLink = link;

    try {
      decodedLink = decodeURIComponent(link);
    } catch (_error) {
      decodedLink = link;
    }

    const haystack = `${getDisplayName(link)} ${decodedLink}`.toLowerCase();
    return matchers.some((matcher) => haystack.includes(matcher));
  });

  return matched || links[0];
};

const addTlsSettings = (streamSettings, params, fallbackServerName) => {
  const security = params.get('security') || params.get('tls') || streamSettings.security;

  if (!security || security === 'none') {
    streamSettings.security = 'none';
    return;
  }

  streamSettings.security = security;

  if (security === 'tls') {
    const tlsSettings = {
      serverName: params.get('sni') || params.get('serverName') || params.get('host') || fallbackServerName,
    };
    const fingerprint = params.get('fp') || params.get('fingerprint');
    const alpn = params.get('alpn');

    if (fingerprint) {
      tlsSettings.fingerprint = fingerprint;
    }

    if (alpn) {
      tlsSettings.alpn = alpn.split(',').map((value) => value.trim()).filter(Boolean);
    }

    if (params.get('allowInsecure') === '1' || params.get('allowInsecure') === 'true') {
      tlsSettings.allowInsecure = true;
    }

    streamSettings.tlsSettings = tlsSettings;
  }

  if (security === 'reality') {
    streamSettings.realitySettings = {
      serverName: params.get('sni') || params.get('serverName') || fallbackServerName,
      fingerprint: params.get('fp') || params.get('fingerprint') || 'chrome',
      publicKey: params.get('pbk') || params.get('publicKey'),
      shortId: params.get('sid') || params.get('shortId') || '',
      spiderX: params.get('spx') || params.get('spiderX') || '/',
    };
  }
};

const addTransportSettings = (streamSettings, params) => {
  const network = streamSettings.network;

  if (network === 'ws') {
    streamSettings.wsSettings = {
      path: params.get('path') || '/',
    };

    const host = params.get('host');

    if (host) {
      streamSettings.wsSettings.headers = { Host: host };
    }
  }

  if (network === 'grpc') {
    streamSettings.grpcSettings = {
      serviceName: params.get('serviceName') || params.get('service_name') || '',
      multiMode: params.get('mode') === 'multi',
    };
  }

  if (network === 'tcp' && params.get('headerType') && params.get('headerType') !== 'none') {
    streamSettings.tcpSettings = {
      header: {
        type: params.get('headerType'),
      },
    };
  }
};

const parseVless = (link) => {
  const url = new URL(link);
  const params = url.searchParams;
  const user = {
    id: decodeURIComponent(url.username),
    encryption: params.get('encryption') || 'none',
  };
  const flow = params.get('flow');

  if (flow) {
    user.flow = flow;
  }

  const streamSettings = {
    network: params.get('type') || params.get('network') || 'tcp',
    security: params.get('security') || 'none',
  };

  addTlsSettings(streamSettings, params, url.hostname);
  addTransportSettings(streamSettings, params);

  return {
    protocol: 'vless',
    tag: 'telegram-proxy',
    settings: {
      vnext: [
        {
          address: url.hostname,
          port: Number(url.port),
          users: [user],
        },
      ],
    },
    streamSettings,
  };
};

const parseTrojan = (link) => {
  const url = new URL(link);
  const params = url.searchParams;
  const streamSettings = {
    network: params.get('type') || params.get('network') || 'tcp',
    security: params.get('security') || 'tls',
  };

  addTlsSettings(streamSettings, params, url.hostname);
  addTransportSettings(streamSettings, params);

  return {
    protocol: 'trojan',
    tag: 'telegram-proxy',
    settings: {
      servers: [
        {
          address: url.hostname,
          port: Number(url.port),
          password: decodeURIComponent(url.username),
        },
      ],
    },
    streamSettings,
  };
};

const parseVmess = (link) => {
  const profile = JSON.parse(decodeBase64(link.replace(/^vmess:\/\//i, '')));
  const params = new URLSearchParams();

  if (profile.sni) {
    params.set('sni', profile.sni);
  }

  if (profile.host) {
    params.set('host', profile.host);
  }

  if (profile.path) {
    params.set('path', profile.path);
  }

  if (profile.fp) {
    params.set('fp', profile.fp);
  }

  const streamSettings = {
    network: profile.net || 'tcp',
    security: profile.tls || 'none',
  };

  addTlsSettings(streamSettings, params, profile.add);
  addTransportSettings(streamSettings, params);

  return {
    protocol: 'vmess',
    tag: 'telegram-proxy',
    settings: {
      vnext: [
        {
          address: profile.add,
          port: Number(profile.port),
          users: [
            {
              id: profile.id,
              alterId: Number(profile.aid || 0),
              security: profile.scy || 'auto',
            },
          ],
        },
      ],
    },
    streamSettings,
  };
};

const parseShadowsocks = (link) => {
  const cleanLink = link.replace(/^ss:\/\//i, '').split('#')[0];
  const [mainPart] = cleanLink.split('?');
  let decoded = decodeURIComponent(mainPart);

  if (!decoded.includes('@')) {
    decoded = decodeBase64(decoded);
  } else {
    const [userinfo, server] = decoded.split('@');

    if (!userinfo.includes(':')) {
      decoded = `${decodeBase64(userinfo)}@${server}`;
    }
  }

  const [userinfo, server] = decoded.split('@');
  const separatorIndex = userinfo.indexOf(':');
  const method = userinfo.slice(0, separatorIndex);
  const password = userinfo.slice(separatorIndex + 1);
  const lastColonIndex = server.lastIndexOf(':');
  const address = server.slice(0, lastColonIndex);
  const port = Number(server.slice(lastColonIndex + 1));

  return {
    protocol: 'shadowsocks',
    tag: 'telegram-proxy',
    settings: {
      servers: [
        {
          address,
          port,
          method,
          password,
        },
      ],
    },
  };
};

const parseOutbound = (link) => {
  if (/^vless:\/\//i.test(link)) {
    return parseVless(link);
  }

  if (/^vmess:\/\//i.test(link)) {
    return parseVmess(link);
  }

  if (/^trojan:\/\//i.test(link)) {
    return parseTrojan(link);
  }

  if (/^ss:\/\//i.test(link)) {
    return parseShadowsocks(link);
  }

  throw new Error(`Unsupported VPN profile protocol: ${link.slice(0, 16)}`);
};

const createConfig = (outbound) => ({
  log: {
    loglevel: process.env.XRAY_LOG_LEVEL || 'warning',
  },
  inbounds: [
    {
      tag: 'socks-in',
      listen: '0.0.0.0',
      port: socksPort,
      protocol: 'socks',
      settings: {
        auth: 'noauth',
        udp: true,
      },
      sniffing: {
        enabled: true,
        destOverride: ['http', 'tls'],
      },
    },
  ],
  outbounds: [
    outbound,
    {
      protocol: 'freedom',
      tag: 'direct',
    },
    {
      protocol: 'blackhole',
      tag: 'block',
    },
  ],
});

const main = async () => {
  if (!subscriptionUrl) {
    throw new Error('VPN_SUBSCRIPTION_URL is required');
  }

  const response = await fetch(subscriptionUrl, {
    headers: {
      'User-Agent': 'lead-gateway-vpn-proxy/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Could not fetch VPN subscription: HTTP ${response.status}`);
  }

  const subscription = decodeSubscription(await response.text());
  const selectedLink = selectLink(getLinks(subscription));
  const outbound = parseOutbound(selectedLink);
  const config = createConfig(outbound);

  writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`Selected VPN profile: ${getDisplayName(selectedLink) || outbound.protocol}`);
  console.log(`Starting Xray SOCKS5 proxy on 0.0.0.0:${socksPort}`);

  const child = spawn('/usr/local/bin/xray', ['run', '-config', configPath], {
    stdio: 'inherit',
  });

  const stop = (signal) => {
    child.kill(signal);
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  child.on('exit', (code, signal) => {
    if (signal) {
      process.exit(0);
      return;
    }

    process.exit(code || 0);
  });
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
