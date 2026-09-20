import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const REQUIREMENT_SCHEMA = {
  type: 'object',
  properties: {
    profile_summary: { type: 'string' },
    requirements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          why_required: { type: 'string' },
          portal_name: { type: 'string' },
          portal_url: { type: 'string' },
          official_fees: { type: 'string' },
          required_documents: { type: 'array', items: { type: 'string' } },
          process_and_timeline: { type: 'string' },
          can_apply_self: { type: 'boolean' },
          difficulty: { type: 'string', enum: ['easy', 'moderate', 'complex'] },
          is_official: { type: 'boolean' },
          sources: { type: 'array', items: { type: 'string' } }
        },
        required: [
          'name',
          'category',
          'description',
          'why_required',
          'official_fees',
          'required_documents',
          'process_and_timeline',
          'can_apply_self',
          'difficulty',
          'is_official',
          'sources'
        ]
      }
    }
  },
  required: ['profile_summary', 'requirements']
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

    const businessType = String(body.business_type || '').trim().slice(0, 200);
    const location = String(body.location || '').trim().slice(0, 200);
    const businessStructure = String(body.business_structure || '').trim().slice(0, 100);
    const operationsNature = String(body.operations_nature || '').trim().slice(0, 1000);
    const details = String(body.details || '').trim().slice(0, 1000);

    if (!businessType || !location) {
      return Response.json({ error: 'Business type and location are required.' }, { status: 400 });
    }

    const prompt = `You are LegalDoc, an expert compliance advisor for starting businesses in India.

A user is starting this business:
- Business type: ${businessType}
- Location: ${location}
- Business structure: ${businessStructure || 'Not decided yet'}
- Nature of operations: ${operationsNature || 'Not specified'}
- Additional details: ${details || 'None'}

Use internet search to determine the actual registrations, licenses, permits and documents legally required to start this specific business in this specific location in India. Ground every answer in OFFICIAL government sources (for example fssai.gov.in, gst.gov.in, mca.gov.in, incometax.gov.in, the city's municipal corporation website, state labour department websites, msme.gov.in / udyamregistration.gov.in).

Consider what genuinely applies to this business — for example FSSAI registration or license (any food business), GST registration, Shop & Establishment Act registration, municipal trade license or vendor / hawker permit, Professional Tax, Udyam / MSME registration, fire safety NOC, signage license, weights & measures registration, labour department registration. Do NOT include generic optional advice that is not an actual requirement, and do not invent requirements that do not apply.

For every requirement:
- name: the official or commonly used name (e.g. "FSSAI Basic Registration")
- category: one of "Registration", "License", "Tax", "Permit", "Municipal", "Labour", "Other"
- description: what it is (1-3 sentences)
- why_required: why this specific business needs it (1-3 sentences)
- portal_name / portal_url: the official government application portal. NEVER invent a URL — include a URL only if you verified it via search; otherwise leave portal_url as an empty string and explain where to apply in process_and_timeline.
- official_fees: the official fees as stated by the government source (ranges allowed). If you cannot verify the fee, write exactly "Verify on the official portal".
- required_documents: the documents typically needed to apply
- process_and_timeline: how to apply, step by step, and a realistic expected time
- can_apply_self: true if an average person can reasonably complete this themselves online
- difficulty: "easy", "moderate" or "complex"
- is_official: true only if this is a genuine legal requirement confirmed from official government sources; false if based on secondary or unofficial sources
- sources: URLs of the sources you used (official government sources first)

Return 4 to 12 requirements, ordered by how soon the user needs them (mandatory registrations first, then licenses and permits, then recommended ones last). In profile_summary, write 2-3 sentences summarizing this business and its overall compliance picture.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_8_flash',
      response_json_schema: REQUIREMENT_SCHEMA
    });

    const requirements = Array.isArray(result && result.requirements) ? result.requirements.slice(0, 12) : [];
    if (!requirements.length) {
      return Response.json(
        { error: 'Could not determine requirements for this business. Please add more detail and try again.' },
        { status: 502 }
      );
    }

    return Response.json({ profile_summary: (result && result.profile_summary) || '', requirements });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
