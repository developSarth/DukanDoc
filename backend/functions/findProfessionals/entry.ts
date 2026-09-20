import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const PROFESSIONALS_SCHEMA = {
  type: 'object',
  properties: {
    professionals: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          profession_type: { type: 'string' },
          location: { type: 'string' },
          rating: { type: 'string' },
          contact_email: { type: 'string' },
          phone: { type: 'string' },
          pricing: { type: 'string' },
          source_url: { type: 'string' }
        },
        required: ['name']
      }
    }
  },
  required: ['professionals']
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    const requirementName = String(body.requirement_name || '').trim().slice(0, 200);
    const location = String(body.location || '').trim().slice(0, 200);
    const requirementDescription = String(body.requirement_description || '').trim().slice(0, 500);

    if (!requirementName || !location) {
      return Response.json({ error: 'Requirement name and location are required.' }, { status: 400 });
    }

    const prompt = `You are helping an entrepreneur in India find local professional help for a business setup requirement.

Requirement: ${requirementName}
What it is: ${requirementDescription || 'A business registration or license requirement.'}
Entrepreneur's location: ${location}

Use internet search (including maps, business directories and review sites) to find REAL local professionals who can help with this specific requirement near "${location}" in India — for example chartered accountants, company secretaries, tax consultants, licensing agents, or business setup consultants.

Rules:
- Only include professionals or firms with a real, publicly listed presence. Never invent businesses, names, emails, phone numbers or ratings.
- name: the professional's or firm's publicly listed name
- profession_type: what they are (e.g. "Chartered Accountant", "Business setup consultant")
- location: the area they serve or are based in
- rating: the publicly displayed rating including review count when available (e.g. "4.6 (120 reviews)"); empty string if none
- contact_email: a publicly listed email address; empty string if none is publicly listed
- phone: a publicly listed phone number; empty string if none
- pricing: publicly listed pricing for this kind of service if available; otherwise exactly "Pricing not publicly listed"
- source_url: the URL of the public listing where you found them

Return up to 5 professionals, best matches first. If you cannot find any real professionals, return an empty professionals list.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_8_flash',
      response_json_schema: PROFESSIONALS_SCHEMA
    });

    const professionals = Array.isArray(result && result.professionals) ? result.professionals.slice(0, 5) : [];
    return Response.json({ professionals });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
