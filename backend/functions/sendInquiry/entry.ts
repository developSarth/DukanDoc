import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>');
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    const to = String(body.to || '').trim().slice(0, 200);
    const professionalName = String(body.professional_name || '').trim().slice(0, 200);
    const requirementName = String(body.requirement_name || '').trim().slice(0, 200);
    const message = String(body.message || '').trim().slice(0, 1500);
    const userEmail = String(body.user_email || '').trim().slice(0, 200);

    if (!EMAIL_RE.test(to) || !EMAIL_RE.test(userEmail)) {
      return Response.json({ error: 'A valid professional contact email and your own email are required.' }, { status: 400 });
    }
    if (!professionalName || !requirementName || !message) {
      return Response.json({ error: 'Missing inquiry details.' }, { status: 400 });
    }

    const text = `Hi ${professionalName},

You have received a new business inquiry through LegalDoc, a free business setup guide for entrepreneurs in India.

Requirement: ${requirementName}

Message from the entrepreneur:
${message}

Please reply directly to the entrepreneur at ${userEmail}.

---
This inquiry was sent via LegalDoc. The entrepreneur found your listing through public sources. LegalDoc is not involved in any transaction between you.`;

    const html = `<div style="font-family: Arial, sans-serif; color: #222; max-width: 560px;">
      <p>Hi ${escapeHtml(professionalName)},</p>
      <p>You have received a new business inquiry through <strong>LegalDoc</strong>, a free business setup guide for entrepreneurs in India.</p>
      <p><strong>Requirement:</strong> ${escapeHtml(requirementName)}</p>
      <blockquote style="border-left: 3px solid #ddd; margin: 12px 0; padding: 8px 12px; background: #f9f9f9;">${escapeHtml(message)}</blockquote>
      <p>Please reply directly to the entrepreneur at <strong>${escapeHtml(userEmail)}</strong>.</p>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">This inquiry was sent via LegalDoc. The entrepreneur found your listing through public sources. LegalDoc is not involved in any transaction between you.</p>
    </div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject: `New business inquiry via LegalDoc — ${requirementName}`,
      from_name: 'LegalDoc',
      html,
      text
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
