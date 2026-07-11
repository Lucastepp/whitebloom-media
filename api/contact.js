const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/hello@whitebloom.media';

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  if (body.website) {
    return res.status(200).json({ message: 'Thanks. Your project details were sent to White Bloom Media.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Referer: 'https://whitebloom.media/',
      },
      body: JSON.stringify({
        ...body,
        _subject: 'New White Bloom Media event inquiry',
        _template: 'table',
        _captcha: 'false',
      }),
      signal: controller.signal,
    });

    const result = await response.json().catch(() => ({}));
    const upstreamMessage = typeof result.message === 'string' ? result.message : '';

    const failed = result.success === false || result.success === 'false';

    if (!response.ok || failed) {
      const needsActivation = upstreamMessage.toLowerCase().includes('activation');

      return res.status(502).json({
        needsActivation,
        message: needsActivation
          ? 'The form is connected. Please open hello@whitebloom.media and click the FormSubmit activation link once to enable delivery.'
          : 'The contact form could not be delivered.',
      });
    }

    return res.status(200).json({ message: 'Thanks. Your project details were sent to White Bloom Media.' });
  } catch {
    return res.status(504).json({ message: 'The contact form timed out. Please try again or message us on WhatsApp.' });
  } finally {
    clearTimeout(timeout);
  }
};
