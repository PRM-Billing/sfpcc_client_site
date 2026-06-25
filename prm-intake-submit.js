/**
 * SFPCC Business Case Intake — collect Q&A and submit to Netlify function for email.
 */
(function (global) {
    var VALUE_LABELS = {
        req_type: {
            new_initiative: 'New initiative',
            enhancement: 'Enhancement to existing module',
            fix: 'Fix / something broken',
            process: 'Process / workflow change',
        },
        erp_area: {
            sleep: 'Sleep Study module',
            pft: 'PFT module',
            pst: 'PST module',
            xray: 'X-Ray module',
            medical_records: 'Medical records portal',
            pcp_portal: 'PCP portal',
            dashboard: 'Dashboard / reporting',
            curemd: 'CureMD integration / bot',
            demographics: 'Demographics / scheduling',
            other: 'Other / not sure',
        },
        rollout: {
            pilot: 'Pilot at one site first',
            phased: 'Phased rollout',
            full: 'Full rollout day one',
        },
        locations: {
            sleep_labs: 'Sleep labs (3 sites)',
            pulmonary: 'Pulmonary clinic',
            xray: 'X-Ray / imaging',
            med_records: 'Medical records',
            pcp: 'PCP / referring physicians',
            admin: 'Admin / leadership',
        },
        priority: {
            critical: 'Critical — blocking operations or revenue now',
            high: 'High — important and getting worse',
            standard: 'Standard — improvement, not urgent',
        },
        start_timing: {
            immediate: 'As soon as scoped & approved',
            '30d': 'Within 30 days',
            next_quarter: 'Next planning quarter',
        },
    };

    var INTAKE_QUESTIONS = [
        { section: '1 · Contact', question: 'Your name', name: 'submitter_name', type: 'text', id: 'f_name' },
        { section: '1 · Contact', question: 'Role / title', name: 'submitter_role', type: 'text', id: 'f_role' },
        { section: '1 · Contact', question: 'Email or phone', name: 'contact_channels', type: 'text', id: 'f_contact' },
        { section: '2 · Initiative overview', question: 'Working title for this request', name: 'initiative_title', type: 'text', id: 'f_title' },
        { section: '2 · Initiative overview', question: 'Request type', name: 'req_type', type: 'radio' },
        { section: '2 · Initiative overview', question: 'Which ERP area does this touch?', name: 'erp_area', type: 'checkbox' },
        { section: '2 · Initiative overview', question: 'ERP area — if other, describe', name: 'erp_area_other', type: 'text', id: 'f_erp_other' },
        { section: '3 · The problem', question: 'Describe the problem in plain language', name: 'problem_statement', type: 'text', id: 'f_problem' },
        { section: '3 · The problem', question: 'Who feels this problem?', name: 'who_affected', type: 'text', id: 'f_affected' },
        { section: '3 · The problem', question: 'A specific recent example', name: 'recent_example', type: 'text', id: 'f_example' },
        { section: '3 · The problem', question: 'Key quote (optional)', name: 'stakeholder_quote', type: 'text', id: 'f_quote' },
        { section: '4 · Why now', question: 'Why is this coming up now?', name: 'why_now_trigger', type: 'text', id: 'f_trigger' },
        { section: '4 · Why now', question: 'What happens if nothing changes in the next 90 days?', name: 'cost_of_inaction_90', type: 'text', id: 'f_inaction_90' },
        { section: '4 · Why now', question: 'External deadline (if any)', name: 'external_deadline', type: 'text', id: 'f_deadline' },
        { section: '5 · Impact today', question: 'Operational impact', name: 'operational_impact', type: 'text', id: 'f_ops_impact' },
        { section: '5 · Impact today', question: 'Financial impact — revenue at risk / lost (current state)', name: 'fin_rev_state', type: 'text' },
        { section: '5 · Impact today', question: 'Financial impact — revenue at risk / lost (estimated annual $)', name: 'fin_rev_annual', type: 'text' },
        { section: '5 · Impact today', question: 'Financial impact — rework / wasted staff time (current state)', name: 'fin_time_state', type: 'text' },
        { section: '5 · Impact today', question: 'Financial impact — rework / wasted staff time (estimated annual $)', name: 'fin_time_annual', type: 'text' },
        { section: '5 · Impact today', question: 'Financial impact — other (current state)', name: 'fin_other_state', type: 'text' },
        { section: '5 · Impact today', question: 'Financial impact — other (estimated annual $)', name: 'fin_other_annual', type: 'text' },
        { section: '6 · Solution & success', question: 'Future state — when this is done, what is different?', name: 'future_state_vision', type: 'text', id: 'f_vision' },
        { section: '6 · Solution & success', question: 'Concrete deliverables (3–5 items)', name: 'deliverables', type: 'text', id: 'f_deliverables' },
        { section: '6 · Solution & success', question: 'Success metric #1 — name', name: 'metric_1_name', type: 'text', id: 'f_metric1_name' },
        { section: '6 · Solution & success', question: 'Success metric #1 — baseline today', name: 'metric_1_baseline', type: 'text', id: 'f_metric1_base' },
        { section: '6 · Solution & success', question: 'Success metric #1 — target', name: 'metric_1_target', type: 'text', id: 'f_metric1_target' },
        { section: '6 · Solution & success', question: 'Success metric #1 — by when', name: 'metric_1_by_when', type: 'text', id: 'f_metric1_when' },
        { section: '6 · Solution & success', question: 'Success metric #2 — name (optional)', name: 'metric_2_name', type: 'text' },
        { section: '6 · Solution & success', question: 'Success metric #2 — baseline (optional)', name: 'metric_2_baseline', type: 'text' },
        { section: '6 · Solution & success', question: 'Success metric #2 — target (optional)', name: 'metric_2_target', type: 'text' },
        { section: '6 · Solution & success', question: 'Success metric #2 — by when (optional)', name: 'metric_2_by_when', type: 'text' },
        { section: '6 · Solution & success', question: 'Have you tried to solve this before?', name: 'previous_attempts', type: 'text', id: 'f_previous' },
        { section: '6 · Solution & success', question: 'Similar product or feature you are aware of?', name: 'similar_products', type: 'text', id: 'f_market' },
        { section: '7 · Scope boundaries', question: 'What should we not change or include?', name: 'out_of_scope', type: 'text', id: 'f_out_scope' },
        { section: '7 · Scope boundaries', question: 'Rollout preference', name: 'rollout', type: 'radio' },
        { section: '7 · Scope boundaries', question: 'Rollout detail', name: 'rollout_detail', type: 'text', id: 'f_rollout_detail' },
        { section: '8 · People & approvals', question: 'Single person accountable for success', name: 'accountable_owner', type: 'text', id: 'f_owner' },
        { section: '8 · People & approvals', question: 'Subject matter expert for day-to-day questions', name: 'sme_contact', type: 'text', id: 'f_sme' },
        { section: '8 · People & approvals', question: 'Who must approve before work begins?', name: 'approvers', type: 'text', id: 'f_approvers' },
        { section: '8 · People & approvals', question: 'SFPCC locations / teams involved', name: 'locations', type: 'checkbox' },
        { section: '9 · Risks & constraints', question: 'Biggest risk or concern', name: 'top_risk', type: 'text', id: 'f_risk' },
        { section: '9 · Risks & constraints', question: 'Constraint — budget guidance', name: 'constraint_budget', type: 'text' },
        { section: '9 · Risks & constraints', question: 'Constraint — regulatory / compliance', name: 'constraint_compliance', type: 'text' },
        { section: '9 · Risks & constraints', question: 'Constraint — technical / vendor', name: 'constraint_technical', type: 'text' },
        { section: '10 · Priority & timing', question: 'Priority level', name: 'priority', type: 'radio' },
        { section: '10 · Priority & timing', question: 'Ideal start timing', name: 'start_timing', type: 'radio' },
        { section: '10 · Priority & timing', question: 'Anything else we should know?', name: 'additional_notes', type: 'text', id: 'f_notes' },
    ];

    function val(id) {
        var el = document.getElementById(id);
        return el && el.value ? el.value.trim() : '';
    }

    function fieldValue(form, def) {
        if (def.type === 'radio') {
            var selected = form.querySelector('input[name="' + def.name + '"]:checked');
            if (!selected) return 'Not specified';
            var labels = VALUE_LABELS[def.name];
            return (labels && labels[selected.value]) || selected.value;
        }

        if (def.type === 'checkbox') {
            var checked = Array.prototype.slice.call(
                form.querySelectorAll('input[name="' + def.name + '"]:checked')
            );
            if (!checked.length) return 'None selected';
            var map = VALUE_LABELS[def.name] || {};
            return checked.map(function (el) {
                return map[el.value] || el.value;
            }).join('; ');
        }

        if (def.id) return val(def.id) || '—';

        var input = form.querySelector('[name="' + def.name + '"]');
        if (!input) return '—';
        return (input.value || '').trim() || '—';
    }

    function collectIntakeFields(form) {
        return INTAKE_QUESTIONS.map(function (def) {
            return {
                section: def.section,
                question: def.question,
                name: def.name,
                answer: fieldValue(form, def),
            };
        });
    }

    function formatPlainText(fields, meta) {
        var lines = [
            '═══════════════════════════════════════════════════',
            'SFPCC NEW INITIATIVE INTAKE',
            '═══════════════════════════════════════════════════',
            '',
            'Submitted: ' + (meta.submitted_at || ''),
            '',
        ];

        var currentSection = '';
        fields.forEach(function (item) {
            if (item.section !== currentSection) {
                currentSection = item.section;
                lines.push('───────────────────────────────────────────────────');
                lines.push(currentSection.toUpperCase());
                lines.push('───────────────────────────────────────────────────');
                lines.push('');
            }
            lines.push(item.question);
            lines.push(item.answer);
            lines.push('');
        });

        lines.push('═══════════════════════════════════════════════════');
        return lines.join('\n');
    }

    function buildPayload(form) {
        var fields = collectIntakeFields(form);
        var submittedAt = new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'America/New_York',
        });

        var titleField = fields.filter(function (f) { return f.name === 'initiative_title'; })[0];
        var nameField = fields.filter(function (f) { return f.name === 'submitter_name'; })[0];

        var payload = {
            submitted_at: submittedAt,
            initiative_title: titleField ? titleField.answer : 'New initiative',
            submitter_name: nameField ? nameField.answer : 'Unknown',
            fields: fields,
            plain_text: formatPlainText(fields, { submitted_at: submittedAt }),
        };

        return payload;
    }

    function validateErpSelection(form) {
        var erpChecked = form.querySelectorAll('input[name="erp_area"]:checked').length;
        var other = val('f_erp_other');
        return erpChecked > 0 || !!other;
    }

    function backupNetlifyFormSubmit(form, payload) {
        try {
            var summaryInput = document.getElementById('generated_summary');
            if (summaryInput) summaryInput.value = payload.plain_text;
            var pathname = window.location.pathname;
            if (!pathname || pathname === '/' || pathname === '/index.html') {
                pathname = '/SFPCC-Business-Case-Intake.html';
            }
            fetch(window.location.origin + pathname, {
                method: 'POST',
                body: new FormData(form),
            }).catch(function () { /* backup only */ });
        } catch (err) { /* ignore */ }
    }

    function submitIntake(form, options) {
        options = options || {};
        var endpoint = options.endpoint || '/.netlify/functions/sfpcc-intake-notify';

        if (!validateErpSelection(form)) {
            return Promise.reject(new Error('ERP_AREA_REQUIRED'));
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return Promise.reject(new Error('VALIDATION_FAILED'));
        }

        var payload = buildPayload(form);
        backupNetlifyFormSubmit(form, payload);

        return fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
        }).then(function (res) {
            return res.json().catch(function () {
                return { error: 'HTTP ' + res.status };
            }).then(function (body) {
                if (!res.ok) {
                    var message = body.error || body.hint || ('HTTP ' + res.status);
                    throw new Error(message);
                }
                return { payload: payload, response: body };
            });
        });
    }

    function generateSummaryFromForm(form) {
        var payload = buildPayload(form);
        return payload.plain_text;
    }

    global.PRM_INTAKE_SUBMIT = {
        buildPayload: buildPayload,
        collectIntakeFields: collectIntakeFields,
        formatPlainText: formatPlainText,
        generateSummaryFromForm: generateSummaryFromForm,
        submitIntake: submitIntake,
        validateErpSelection: validateErpSelection,
    };
})(typeof window !== 'undefined' ? window : this);
