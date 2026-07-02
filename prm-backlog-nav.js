/**
 * Sticky backlog shortcut nav — consolidated backlog + new initiative intake.
 * Each nav item shows an accordion list of US; expanding one shows its content inline.
 */
(function (global) {
    var BACKLOG = 'sfpcc-consolidated-user-stories.html';
    var INTAKE = 'SFPCC-Business-Case-Intake.html';
    var navEl = null;
    var storyEntries = [];

    var NAV_ITEMS = [
        { id: 'completed', label: 'Completed', hash: 'prm-nav-completed', tab: 'completed' },
        { id: 'estimated', label: 'Backlog Estimated', hash: 'prm-nav-estimated', tab: 'estimated' },
        { id: 'backlog', label: 'Backlog', hash: 'prm-nav-backlog', tab: 'backlog' },
        { id: 'intake', label: 'New initiative', hash: '', tab: null, href: INTAKE },
    ];

    var VIEW_META = {
        completed: {
            title: 'Completed',
            badgePrimary: '18 Stories – 337.7 h total spent',
            badgeSecondary: 'Live in production for SFPCC as agreed',
        },
        estimated: {
            title: 'Backlog Estimated',
            badgePrimary: '14 Stories – 595–606 h backlog estimated',
            badgeSecondary: 'BRD or estimate pack published',
        },
        backlog: {
            title: 'Backlog',
            badgePrimary: '8 Stories – Hours Pending',
            badgeSecondary: 'Scoped or proposed, not yet delivered',
        },
    };

    var CATEGORY_LABELS = {
        completed: 'Completed',
        estimated: 'Backlog Estimated',
        backlog: 'Backlog',
    };

    function isBacklogPage() {
        return /consolidated-user-stories/i.test(global.location.pathname) ||
            /consolidated-user-stories/i.test(global.location.href);
    }

    function isIntakePage() {
        return /Business-Case-Intake/i.test(global.location.pathname) ||
            /Business-Case-Intake/i.test(global.location.href);
    }

    function backlogUrl(hash) {
        return BACKLOG + (hash ? '#' + hash : '');
    }

    function docBarHeight() {
        var bar = document.querySelector('.prm-doc-updated-bar');
        return bar ? bar.offsetHeight : 0;
    }

    function setBodyOffset(nav) {
        if (!document.documentElement) return;
        var banner = document.querySelector('.prm-page-banner');
        var bannerH = banner ? banner.offsetHeight : 0;
        var navH = nav ? nav.offsetHeight : 56;
        document.documentElement.style.setProperty('--prm-banner-offset', bannerH + 'px');
        document.documentElement.style.setProperty('--prm-nav-offset', navH + 'px');
    }

    function categorizeFromStrip(strip) {
        if (!strip) return 'estimated';
        var text = strip.textContent.toLowerCase();
        if (strip.classList.contains('completed') || text.indexOf('completed') !== -1) {
            return 'completed';
        }
        if (
            text.indexOf('estimated') !== -1 ||
            text.indexOf('in progress') !== -1 ||
            strip.classList.contains('in-progress')
        ) {
            return 'estimated';
        }
        return 'backlog';
    }

    function categorizeStoryCard(card) {
        return categorizeFromStrip(card.querySelector('.status-strip'));
    }

    function usCodeFromId(id) {
        if (!id) return null;
        var m = id.match(/^us-(\d+(?:\.\d+)?)/i);
        return m ? 'US-' + m[1] : null;
    }

    function storyLabelFromNode(node) {
        var heading = node.querySelector('h3, h4');
        if (!heading) {
            var fallbackId = node.id || '';
            return fallbackId.replace(/-/g, ' ').toUpperCase();
        }

        var label = heading.textContent.replace(/\s+/g, ' ').trim();
        if (!/^US-\d/i.test(label)) {
            var code = usCodeFromId(node.id);
            if (!code) {
                var badge = node.querySelector('.badge');
                if (badge) {
                    var bm = badge.textContent.match(/US-\d+(?:\.\d+)?/);
                    if (bm) code = bm[0];
                }
            }
            if (code) {
                label = code + ': ' + label;
            }
        }
        return label;
    }

    function formatHoursValue(raw) {
        if (!raw) return null;
        raw = raw.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
        var hasTilde = raw.indexOf('~') !== -1;
        var m = raw.match(/~?\s*(\d+(?:\.\d+)?)/);
        if (!m) return null;
        var num = m[1];
        return (hasTilde ? '~' : '') + num + ' h';
    }

    function hoursFromTableRow(cells) {
        var totalCellIdx = -1;
        for (var ci = 0; ci < cells.length; ci++) {
            var lbl = cells[ci].textContent.replace(/\s+/g, ' ').trim().toLowerCase();
            if (lbl === 'total' || lbl.indexOf(' total') !== -1 || lbl.lastIndexOf('total') === lbl.length - 5) {
                totalCellIdx = ci;
                break;
            }
        }
        if (totalCellIdx < 0) return null;
        var valueCell = cells[totalCellIdx + 1] || cells[cells.length - 1];
        if (valueCell === cells[totalCellIdx] && cells.length > totalCellIdx + 1) {
            valueCell = cells[cells.length - 1];
        }
        return formatHoursValue(valueCell.textContent);
    }

    function storyHoursFromNode(node) {
        if (!node) return null;

        var tables = node.querySelectorAll('table.hours-table');
        for (var ti = 0; ti < tables.length; ti++) {
            var rows = tables[ti].querySelectorAll('tr');
            for (var ri = 0; ri < rows.length; ri++) {
                var cells = rows[ri].querySelectorAll('td');
                if (!cells.length) continue;
                var fromRow = hoursFromTableRow(cells);
                if (fromRow) return fromRow;
            }
        }

        var textBlocks = node.querySelectorAll('p, .context-label, td');
        for (var bi = 0; bi < textBlocks.length; bi++) {
            var txt = textBlocks[bi].textContent.replace(/\s+/g, ' ');
            if (/grand total/i.test(txt)) {
                var dual = txt.match(/(\d+(?:\.\d+)?)\s*h[^/]*\/\s*(\d+(?:\.\d+)?)\s*h/i);
                if (dual) return dual[1] + '–' + dual[2] + ' h';
            }
            if (/estimated hours/i.test(txt)) {
                var range = txt.match(/(\d+(?:\.\d+)?)\s*h\s*\([^)]*\)\s*\/\s*(\d+(?:\.\d+)?)\s*h/i);
                if (range) return range[1] + '–' + range[2] + ' h';
                var singleEst = txt.match(/~\s*(\d+(?:\.\d+)?)\s*h/i);
                if (singleEst) return '~' + singleEst[1] + ' h';
            }
        }

        for (var si = 0; si < textBlocks.length; si++) {
            var cell = textBlocks[si];
            if (!/^status$/i.test((cell.textContent || '').trim())) continue;
            var valueCell = cell.nextElementSibling;
            if (!valueCell) continue;
            var statusText = valueCell.textContent.replace(/\s+/g, ' ');
            var statusRange = statusText.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*h/i);
            if (statusRange) return statusRange[1] + '–' + statusRange[2] + ' h';
            var statusSingle = statusText.match(/(?:—|–|-)\s*\*?\*?(\d+(?:\.\d+)?)\s*h\b/i);
            if (statusSingle) return statusSingle[1] + ' h';
            var statusApprox = statusText.match(/~(\d+(?:\.\d+)?)\s*h/i);
            if (statusApprox) return '~' + statusApprox[1] + ' h';
        }

        return null;
    }

    function collectStoryEntries() {
        var entries = [];

        document.querySelectorAll('.story-card[id]').forEach(function (card) {
            var category = categorizeStoryCard(card);
            card.setAttribute('data-prm-category', category);
            entries.push({
                id: card.id,
                usCode: usCodeFromId(card.id),
                category: category,
                label: storyLabelFromNode(card),
                hours: storyHoursFromNode(card),
                source: card,
            });

            card.querySelectorAll('[id^="us-"]').forEach(function (nested) {
                if (nested === card || !nested.id) return;
                if (!nested.querySelector('.status-strip')) return;
                var nestedCategory = categorizeFromStrip(nested.querySelector('.status-strip'));
                nested.setAttribute('data-prm-category', nestedCategory);
                nested.classList.add('prm-story-nested');
                entries.push({
                    id: nested.id,
                    usCode: usCodeFromId(nested.id),
                    category: nestedCategory,
                    label: storyLabelFromNode(nested),
                    hours: storyHoursFromNode(nested),
                    source: nested,
                });
            });
        });

        entries.sort(function (a, b) {
            var am = a.id.match(/US-(\d+(?:\.\d+)?)/i);
            var bm = b.id.match(/US-(\d+(?:\.\d+)?)/i);
            var an = am ? parseFloat(am[1]) : 0;
            var bn = bm ? parseFloat(bm[1]) : 0;
            if (an !== bn) return an - bn;
            return a.label.localeCompare(b.label);
        });

        return entries;
    }

    function markGlobalSections() {
        var summary = document.getElementById('sec-estimate-summary');
        if (summary) {
            summary.classList.add('prm-page-global');
            var sib = summary.nextElementSibling;
            while (sib && !sib.matches('#prm-view-heading, #prm-story-browser, details.page-about-collapse, hr#sec-status')) {
                sib.classList.add('prm-page-global');
                sib = sib.nextElementSibling;
            }
        }

        document.querySelectorAll('.page-about-collapse, .totals, .toc, .footer-note').forEach(function (el) {
            el.classList.add('prm-page-global');
        });

        var statusTable = document.querySelector('.status-table');
        if (statusTable) statusTable.classList.add('prm-page-global');

        markLegacyCatalog();

        var hours = document.getElementById('sec-consolidated-hours');
        if (hours) {
            hours.classList.add('prm-page-global');
            var next = hours.nextElementSibling;
            while (next) {
                next.classList.add('prm-page-global');
                next = next.nextElementSibling;
            }
        }

        var start = document.getElementById('sec-backlog-apr');
        var end = document.getElementById('sec-consolidated-hours');
        var el = start;
        while (el && el !== end) {
            if (
                (el.tagName === 'H2' || el.tagName === 'H3') &&
                !el.closest('.story-card') &&
                el.id !== 'sec-estimate-summary'
            ) {
                el.classList.add('prm-story-section-heading');
            }
            if (el.tagName === 'P' && el.classList.contains('legend') && !el.closest('.story-card')) {
                el.classList.add('prm-story-section-heading');
            }
            if (el.classList && el.classList.contains('info-box')) {
                el.classList.add('prm-story-section-heading');
            }
            if (el.tagName === 'HR' && el.classList.contains('divider')) {
                el.classList.add('prm-story-section-heading');
            }
            el = el.nextElementSibling;
        }
    }

    function markLegacyCatalog() {
        var start = document.getElementById('sec-status');
        if (!start) return;
        var el = start;
        while (el) {
            el.classList.add('prm-legacy-catalog');
            el = el.nextElementSibling;
        }
    }

    function setActiveNavLink(activeId) {
        if (!navEl) return;
        navEl.querySelectorAll('a[data-nav-id]').forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('data-nav-id') === activeId);
        });
    }

    function updateViewHeading(viewId) {
        var heading = document.getElementById('prm-view-heading');
        var meta = VIEW_META[viewId];
        if (!heading || !meta) return;
        heading.hidden = false;
        heading.innerHTML =
            '<div class="prm-view-heading-row">' +
                '<h2>' + meta.title + '</h2>' +
                '<div class="prm-view-heading-badge">' +
                    '<strong>' + meta.badgePrimary + '</strong>' +
                    '<span>' + meta.badgeSecondary + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="prm-view-heading-rule" aria-hidden="true"></div>';
    }

    function cloneStoryContent(entry) {
        var clone = entry.source.cloneNode(true);
        if (entry.source.classList.contains('story-card')) {
            clone.querySelectorAll('[id^="us-"]').forEach(function (nested) {
                if (nested === clone || !nested.id) return;
                if (!nested.querySelector('.status-strip')) return;
                var listed = storyEntries.some(function (e) { return e.id === nested.id; });
                if (listed) nested.remove();
            });
        }
        var heading = clone.querySelector('h3, h4');
        if (heading) heading.remove();
        return clone;
    }

    function bindDropdownLinks(container) {
        container.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var id = (a.getAttribute('href') || '').replace(/^#/, '');
                if (!id) return;
                var listed = storyEntries.some(function (entry) { return entry.id === id; });
                if (listed) {
                    e.preventDefault();
                    navigateToStory(id);
                }
            });
        });
    }

    function usNumberFromCode(code) {
        return code ? String(code).replace(/^US-/i, '') : '';
    }

    function parseUsQuery(query) {
        var q = (query || '').trim();
        if (!q) return null;
        var m = q.match(/^(?:US[-\s]?)?(\d+(?:\.\d+)?)$/i);
        if (m) return m[1];
        m = q.match(/(\d+(?:\.\d+)?)/);
        return m ? m[1] : null;
    }

    function searchStories(query) {
        var num = parseUsQuery(query);
        if (!num) return [];

        return storyEntries.filter(function (entry) {
            var n = usNumberFromCode(entry.usCode);
            if (!n) return false;
            if (n === num) return true;
            if (num.indexOf('.') === -1 && n.indexOf(num + '.') === 0) return true;
            return false;
        });
    }

    function navigateToStory(storyId, options) {
        options = options || {};
        var entry = storyEntries.filter(function (e) { return e.id === storyId; })[0];

        if (!entry) {
            if (!isBacklogPage()) {
                global.location.href = backlogUrl('prm-search-' + encodeURIComponent(storyId));
            }
            return;
        }

        setView(entry.category, { skipScroll: true, skipHash: true });

        function finishNavigate() {
            openStory(storyId, {
                skipScroll: options.skipScroll === true,
                skipHash: true,
            });

            if (!options.skipHash && global.history && global.history.replaceState) {
                global.history.replaceState(null, '', '#' + storyId);
            }

            hideSearchResults();
        }

        global.setTimeout(function () {
            finishNavigate();
        }, 50);
    }

    function hideSearchResults() {
        var list = document.getElementById('prm-us-search-results');
        if (list) list.hidden = true;
    }

    function renderSearchResults(results) {
        var list = document.getElementById('prm-us-search-results');
        var input = document.getElementById('prm-us-search-input');
        if (!list || !input) return;

        list.innerHTML = '';
        if (!results.length) {
            var empty = document.createElement('li');
            empty.className = 'prm-us-search-empty';
            empty.textContent = 'No user story found for that number.';
            list.appendChild(empty);
            list.hidden = false;
            return;
        }

        results.forEach(function (entry) {
            var li = document.createElement('li');
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'prm-us-search-result';
            btn.setAttribute('data-story-id', entry.id);

            var code = document.createElement('span');
            code.className = 'prm-us-search-result-code';
            code.textContent = entry.usCode || usCodeFromId(entry.id) || entry.id;

            var title = document.createElement('span');
            title.className = 'prm-us-search-result-title';
            title.textContent = entry.label.replace(/^(US-\d+(?:\.\d+)?):\s*/i, '');

            var section = document.createElement('span');
            section.className = 'prm-us-search-result-section';
            section.textContent = CATEGORY_LABELS[entry.category] || entry.category;

            btn.appendChild(code);
            btn.appendChild(title);
            btn.appendChild(section);

            btn.addEventListener('click', function () {
                input.value = entry.usCode || '';
                navigateToStory(entry.id);
            });

            li.appendChild(btn);
            list.appendChild(li);
        });

        list.hidden = false;
    }

    function onSearchInput() {
        var input = document.getElementById('prm-us-search-input');
        if (!input) return;
        var q = input.value.trim();
        if (q.length < 1) {
            hideSearchResults();
            return;
        }
        if (!isBacklogPage()) {
            hideSearchResults();
            return;
        }
        renderSearchResults(searchStories(q));
    }

    function buildUsSearch() {
        var wrap = document.createElement('div');
        wrap.className = 'prm-us-search';

        var label = document.createElement('label');
        label.className = 'prm-us-search-label';
        label.setAttribute('for', 'prm-us-search-input');
        label.textContent = 'Search US';

        var input = document.createElement('input');
        input.type = 'search';
        input.id = 'prm-us-search-input';
        input.className = 'prm-us-search-input';
        input.placeholder = 'e.g. US-14';
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('enterkeyhint', 'search');

        var list = document.createElement('ul');
        list.id = 'prm-us-search-results';
        list.className = 'prm-us-search-results';
        list.hidden = true;

        input.addEventListener('input', onSearchInput);
        input.addEventListener('focus', onSearchInput);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                var results = searchStories(input.value);
                if (isBacklogPage()) {
                    if (results.length) navigateToStory(results[0].id);
                } else {
                    var num = parseUsQuery(input.value);
                    if (num) {
                        global.location.href = backlogUrl('prm-search-' + encodeURIComponent(num));
                    }
                }
            }
            if (e.key === 'Escape') {
                input.blur();
                hideSearchResults();
            }
        });

        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) hideSearchResults();
        });

        wrap.appendChild(label);
        wrap.appendChild(input);
        wrap.appendChild(list);
        return wrap;
    }

    function navOffsetPx() {
        var root = global.getComputedStyle(document.documentElement);
        var navVar = root.getPropertyValue('--prm-nav-offset').trim();
        return navVar ? parseFloat(navVar) || 56 : 56;
    }

    function scrollPageToTop() {
        function doScroll() {
            global.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }

        doScroll();
        global.requestAnimationFrame(function () {
            doScroll();
            global.setTimeout(doScroll, 50);
        });
    }

    function scrollStoryIntoView(details) {
        if (!details || !details.isConnected) return;

        var target = details.querySelector('.prm-us-dropdown-summary') || details;

        function scrollToTarget() {
            if (!target.isConnected) return;

            var rect = target.getBoundingClientRect();
            if (!rect.height && !rect.width) return;

            var scrollY = global.pageYOffset || document.documentElement.scrollTop || 0;
            var topInset = navOffsetPx();
            var usableH = global.innerHeight - topInset;
            var elementDocTop = rect.top + scrollY;
            var nextTop = elementDocTop - topInset - (usableH / 2) + (rect.height / 2);

            global.scrollTo({
                top: Math.max(0, nextTop),
                behavior: 'auto',
            });
        }

        [0, 60, 150, 300, 500, 800, 1200].forEach(function (delay) {
            global.setTimeout(scrollToTarget, delay);
        });
    }

    function openStory(storyId, options) {
        options = options || {};
        var details = document.querySelector('.prm-us-dropdown[data-story-id="' + storyId + '"]');
        if (!details) return;

        if (!options.keepOthersOpen) {
            document.querySelectorAll('.prm-us-dropdown[open]').forEach(function (other) {
                if (other !== details) other.open = false;
            });
        }

        if (!options.skipScroll) {
            scrollStoryIntoView(details);
        }

        details.open = true;

        if (!options.skipScroll) {
            scrollStoryIntoView(details);
        }

        if (!options.skipHash && global.history && global.history.replaceState) {
            global.history.replaceState(null, '', '#' + storyId);
        }
    }

    function renderStoryAccordion(viewId) {
        var list = document.getElementById('prm-us-accordion');
        if (!list) return;
        list.innerHTML = '';

        var items = storyEntries.filter(function (entry) {
            return entry.category === viewId;
        });

        items.forEach(function (entry) {
            var li = document.createElement('li');
            li.className = 'prm-us-accordion-item';

            var details = document.createElement('details');
            details.className = 'prm-us-dropdown';
            details.setAttribute('data-story-id', entry.id);

            var summary = document.createElement('summary');
            summary.className = 'prm-us-dropdown-summary';
            var titleSpan = document.createElement('span');
            titleSpan.className = 'prm-us-dropdown-title';
            titleSpan.textContent = entry.label;
            summary.appendChild(titleSpan);
            if (viewId === 'estimated' && entry.hours) {
                var hoursSpan = document.createElement('span');
                hoursSpan.className = 'prm-us-hours-badge';
                hoursSpan.textContent = entry.hours;
                summary.appendChild(hoursSpan);
            }
            details.appendChild(summary);

            var body = document.createElement('div');
            body.className = 'prm-us-dropdown-body';
            var wrap = document.createElement('div');
            wrap.className = entry.source.classList.contains('story-card')
                ? 'prm-us-dropdown-card'
                : 'prm-us-dropdown-card prm-us-dropdown-nested';
            wrap.appendChild(cloneStoryContent(entry));
            body.appendChild(wrap);
            details.appendChild(body);

            details.addEventListener('toggle', function () {
                if (!details.open) return;
                document.querySelectorAll('.prm-us-dropdown[open]').forEach(function (other) {
                    if (other !== details) other.open = false;
                });
                if (global.history && global.history.replaceState) {
                    global.history.replaceState(null, '', '#' + entry.id);
                }
            });

            bindDropdownLinks(body);
            li.appendChild(details);
            list.appendChild(li);
        });
    }

    function setView(viewId, options) {
        if (!isBacklogPage() || !viewId || !VIEW_META[viewId]) return;
        options = options || {};

        document.body.classList.remove('prm-view-completed', 'prm-view-estimated', 'prm-view-backlog');
        document.body.classList.add('prm-view-' + viewId);

        updateViewHeading(viewId);
        setActiveNavLink(viewId);

        var browser = document.getElementById('prm-story-browser');
        if (browser) browser.hidden = false;

        renderStoryAccordion(viewId);

        if (!options.skipScroll) {
            scrollPageToTop();
        }

        if (!options.skipHash) {
            var targetHash = 'prm-nav-' + viewId;
            if (global.location.hash.replace(/^#/, '') !== targetHash) {
                if (global.history && global.history.replaceState) {
                    global.history.replaceState(null, '', '#' + targetHash);
                } else {
                    global.location.hash = targetHash;
                }
            }
        }
    }

    function viewFromHash() {
        var hash = (global.location.hash || '').replace(/^#/, '');
        if (hash === 'prm-nav-estimated') return 'estimated';
        if (hash === 'prm-nav-backlog') return 'backlog';
        if (hash === 'prm-nav-completed') return 'completed';
        return null;
    }

    function storyIdFromHash() {
        var hash = (global.location.hash || '').replace(/^#/, '');
        if (!hash || hash.indexOf('prm-nav-') === 0) return null;
        if (hash.indexOf('prm-search-') === 0) return null;
        return storyEntries.some(function (e) { return e.id === hash; }) ? hash : null;
    }

    function searchNumFromHash() {
        var hash = (global.location.hash || '').replace(/^#/, '');
        var m = hash.match(/^prm-search-(.+)$/);
        return m ? decodeURIComponent(m[1]) : null;
    }

    function applyRoute(options) {
        options = options || { skipScroll: true, skipHash: true };

        var searchNum = searchNumFromHash();
        if (searchNum) {
            var searchMatches = searchStories(searchNum);
            if (searchMatches.length) {
                navigateToStory(searchMatches[0].id, {
                    skipScroll: options.skipScroll === true,
                    skipHash: true,
                });
                if (global.history && global.history.replaceState) {
                    global.history.replaceState(null, '', '#' + searchMatches[0].id);
                }
                return;
            }
        }

        var storyId = storyIdFromHash();

        if (storyId) {
            var entry = storyEntries.filter(function (e) { return e.id === storyId; })[0];
            if (entry) {
                navigateToStory(storyId, {
                    skipScroll: options.skipScroll === true,
                    skipHash: true,
                });
                return;
            }
        }

        var viewId = viewFromHash();
        if (viewId) {
            setView(viewId, options);
            return;
        }

        setView('completed', options);
    }

    function buildNav() {
        var nav = document.createElement('nav');
        nav.className = 'prm-backlog-nav';
        nav.setAttribute('aria-label', 'Backlog shortcuts');

        var inner = document.createElement('div');
        inner.className = 'prm-backlog-nav-inner';

        var brand = document.createElement('span');
        brand.className = 'prm-nav-brand';
        brand.setAttribute('aria-label', 'Professional Reimbursement Managers');
        var logo = document.createElement('img');
        logo.src = 'assets/prm-logo.png?v=20260625b';
        logo.alt = 'Professional Reimbursement Managers';
        logo.width = 280;
        logo.height = 44;
        logo.decoding = 'async';
        brand.appendChild(logo);
        inner.appendChild(brand);

        var menu = document.createElement('div');
        menu.className = 'prm-backlog-nav-menu';

        NAV_ITEMS.forEach(function (item, index) {
            if (index === 3) {
                var sep = document.createElement('span');
                sep.className = 'prm-nav-sep';
                sep.setAttribute('aria-hidden', 'true');
                menu.appendChild(sep);
            }

            var a = document.createElement('a');
            a.setAttribute('data-nav-id', item.id);
            a.textContent = item.label;

            if (item.id === 'intake') {
                a.className = 'prm-nav-intake';
                a.href = INTAKE;
                if (isIntakePage()) {
                    a.classList.add('is-active');
                    a.setAttribute('aria-current', 'page');
                }
            } else if (isBacklogPage()) {
                a.href = '#' + item.hash;
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    setView(item.tab);
                });
            } else {
                a.href = backlogUrl(item.hash);
            }

            menu.appendChild(a);
        });

        if (isBacklogPage()) {
            var searchSep = document.createElement('span');
            searchSep.className = 'prm-nav-sep';
            searchSep.setAttribute('aria-hidden', 'true');
            menu.appendChild(searchSep);
            menu.appendChild(buildUsSearch());
        } else {
            var intakeSearchSep = document.createElement('span');
            intakeSearchSep.className = 'prm-nav-sep';
            intakeSearchSep.setAttribute('aria-hidden', 'true');
            menu.appendChild(intakeSearchSep);
            menu.appendChild(buildUsSearch());
        }

        inner.appendChild(menu);
        nav.appendChild(inner);
        return nav;
    }

    function mountNavAfterBanner(nav) {
        var banner = document.querySelector('.prm-page-banner');
        if (banner && banner.parentNode) {
            if (banner.nextSibling) {
                banner.parentNode.insertBefore(nav, banner.nextSibling);
            } else {
                banner.parentNode.appendChild(nav);
            }
            return;
        }

        var container = document.querySelector('.container');
        if (container && container.parentNode) {
            container.parentNode.insertBefore(nav, container);
            return;
        }

        document.body.insertBefore(nav, document.body.firstChild);
    }

    function mount() {
        if (!isBacklogPage() && !isIntakePage()) return;

        navEl = buildNav();
        mountNavAfterBanner(navEl);
        document.body.classList.add('prm-backlog-nav-on');

        function refreshOffset() {
            setBodyOffset(navEl);
        }

        refreshOffset();
        global.addEventListener('resize', refreshOffset);
        global.setTimeout(refreshOffset, 0);
        global.setTimeout(refreshOffset, 100);

        if (isBacklogPage()) {
            storyEntries = collectStoryEntries();
            markGlobalSections();
            applyRoute({ skipScroll: true, skipHash: true });

            global.addEventListener('hashchange', function () {
                applyRoute({ skipScroll: false, skipHash: true });
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }

    global.PRM_BACKLOG_NAV = {
        setView: setView,
        openStory: openStory,
        navigateToStory: navigateToStory,
        searchStories: searchStories,
    };
})(typeof window !== 'undefined' ? window : this);
