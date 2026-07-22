const crypto = require('node:crypto');

const DEFAULT_PIXEL_ID = '1030487979387925';
const GRAPH_API_VERSION = 'v25.0';
const ALLOWED_EVENTS = new Set(['PageView', 'ViewContent', 'Lead']);

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function sha256(value) {
  const normalized = normalize(value);
  return normalized ? crypto.createHash('sha256').update(normalized).digest('hex') : undefined;
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket?.remoteAddress;
}

function cleanObject(input) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== ''));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed.' });
  }

  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(202).json({ ok: true, configured: false });
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const eventName = body.event_name;

  if (!ALLOWED_EVENTS.has(eventName)) {
    return res.status(400).json({ ok: false, message: 'Unsupported event name.' });
  }

  const userData = body.user_data || {};
  const event = cleanObject({
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: body.event_id,
    event_source_url: body.event_source_url,
    action_source: 'website',
    user_data: cleanObject({
      client_ip_address: getClientIp(req),
      client_user_agent: req.headers['user-agent'],
      fbp: userData.fbp,
      fbc: userData.fbc,
      em: sha256(userData.email),
      ph: sha256(userData.phone),
      fn: sha256(userData.first_name),
      ln: sha256(userData.last_name),
    }),
    custom_data: cleanObject(body.custom_data || {}),
  });

  const payload = {
    data: [event],
  };

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      access_token: accessToken,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    return res.status(502).json({
      ok: false,
      message: 'Meta CAPI request failed.',
      error: result?.error?.message || result,
    });
  }

  return res.status(200).json({ ok: true, configured: true, result });
};
