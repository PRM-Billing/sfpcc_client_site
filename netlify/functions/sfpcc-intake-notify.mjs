const DEFAULT_TO = 'osanchez@prmbilling.net';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildHtmlEmail(payload) {
    const rows = (payload.fields || [])
        .map(function (item) {
            return (
                '<tr>' +
                '<td style="padding:10px 12px;border:1px solid #e2e8f0;vertical-align:top;font-weight:600;color:#1a365d;width:34%;">' +
                escapeHtml(item.question) +
                '</td>' +
                '<td style="padding:10px 12px;border:1px solid #e2e8f0;vertical-align:top;white-space:pre-wrap;">' +
                escapeHtml(item.answer || '—') +
                '</td>' +
                '</tr>'
            );
        })
        .join('');

    return (
        '<div style="font-family:Segoe UI,system-ui,sans-serif;color:#1e293b;max-width:760px;">' +
        '<h2 style="margin:0 0 8px;color:#0a2540;">SFPCC New Initiative Intake</h2>' +
        '<p style="margin:0 0 16px;color:#64748b;">Submitted ' +
        escapeHtml(payload.submitted_at || new Date().toISOString()) +
        '</p>' +
        '<table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.5;">' +
        rows +
        '</table>' +
        '</div>'
    );
}

async function sendViaResend({ to, from, subject, text, html }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { ok: false, error: 'RESEND_API_KEY is not configured' };

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject,
            text,
            html,
        }),
    });

    if (!response.ok) {
        const detail = await response.text();
        return { ok: false, error: 'Resend API error: ' + response.status + ' ' + detail };
    }

    return { ok: true };
}

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed' });
    }

    let payload;
    try {
        payload = await request.json();
    } catch (err) {
        return jsonResponse(400, { error: 'Invalid JSON body' });
    }

    if (!payload || !Array.isArray(payload.fields) || !payload.fields.length) {
        return jsonResponse(400, { error: 'Missing intake fields' });
    }

    const to = process.env.INTAKE_NOTIFY_TO || DEFAULT_TO;
    const from =
        process.env.INTAKE_FROM_EMAIL ||
        'SFPCC Intake <onboarding@resend.dev>';
    const title = payload.initiative_title || 'New initiative';
    const submitter = payload.submitter_name || 'Unknown submitter';
    const subject =
        process.env.INTAKE_EMAIL_SUBJECT_PREFIX !== undefined
            ? process.env.INTAKE_EMAIL_SUBJECT_PREFIX + title + ' — ' + submitter
            : 'SFPCC Intake: ' + title + ' — ' + submitter;

    const text = payload.plain_text || payload.fields
        .map(function (item) {
            return item.question + '\n' + (item.answer || '—');
        })
        .join('\n\n');

    const html = buildHtmlEmail(payload);
    const result = await sendViaResend({ to, from, subject, text, html });

    if (!result.ok) {
        return jsonResponse(503, {
            error: result.error,
            hint: 'Set RESEND_API_KEY (and INTAKE_FROM_EMAIL for your domain) in Netlify site environment variables.',
        });
    }

    return jsonResponse(200, { ok: true, message: 'Intake email sent' });
}
