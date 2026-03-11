// =============================================================
//  customers.js  —  MallX Customer Management
//  Chart.js 4 + Luxon 3  |  All DOM ops null-safe
// =============================================================
/* global luxon, Chart */
'use strict';

// ── State ─────────────────────────────────────────────────────
var customersData     = [];
var filteredCustomers = [];
var currentSegment    = 'all';
var currentSort       = 'recent';
var currentPage       = 1;
var ITEMS_PER_PAGE    = 10;
var selectedIds       = new Set();

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    try {
        loadSampleCustomers();
        initCharts();           // draw charts first (instant)
        updateKPIs();
        renderTable();
        updateSidebarInsights();
        wireModals();
        wireTableControls();
        fetchSegmentAPI();      // async — updates segment chart when ready
    } catch (err) {
        console.error('[customers.js] boot error:', err);
    }
});

// =============================================================
//  CHART INITIALISATION
// =============================================================
function initCharts() {
    initAcquisitionChart();
    initSegmentChart();
}

// ── Acquisition Line Chart ────────────────────────────────────
function initAcquisitionChart() {
    var el = g('acquisitionChart');
    if (!el) return;

    // Try Django-provided data first
    var labels = safeJSON(el.dataset.dates,  []);
    var data   = safeJSON(el.dataset.counts, []);

    // Fall back to sample-data if empty
    if (!labels.length) {
        var built = buildWeeklyAcquisition();
        labels = built.labels;
        data   = built.data;
    }

    window.acquisitionChart = new Chart(el, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'New Customers',
                data: data,
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124,58,237,0.07)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#7c3aed',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { font: { size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { font: { size: 11 }, precision: 0 }
                }
            }
        }
    });
}

function buildWeeklyAcquisition() {
    var now    = luxon.DateTime.now();
    var labels = [];
    var data   = [];
    for (var i = 0; i < 12; i++) {
        var wStart = now.minus({ weeks: 11 - i });
        var wEnd   = wStart.plus({ days: 6 });
        labels.push('W' + (i + 1));
        var count = customersData.filter(function (c) {
            var jd = luxon.DateTime.fromISO(c.joinTimestamp);
            return jd >= wStart && jd <= wEnd;
        }).length;
        data.push(count);
    }
    return { labels: labels, data: data };
}

// ── Segment Doughnut Chart ────────────────────────────────────
function initSegmentChart() {
    var el = g('segmentsChart');
    if (!el) return;

    // Use data-* attributes as the initial / fallback dataset.
    // These come from Django context; if Django sends empty the
    // attributes will be '[]' or absent — we supply defaults.
    var labels = safeJSON(el.dataset.labels, ['New','Regular','Loyal','VIP']);
    var values = safeJSON(el.dataset.values, [25, 40, 20, 15]);
    var colors = safeJSON(el.dataset.colors, ['#2563eb','#10b981','#f59e0b','#8b5cf6']);

    // Guard: if all values are 0 and it's the Django fallback,
    // keep the defaults so the chart renders visibly
    var allZero = values.every(function (v) { return v === 0; });
    if (allZero) { values = [25, 40, 20, 15]; }

    window.segmentsChart = new Chart(el, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 14,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            var tot = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                            var pct = tot > 0 ? ((ctx.raw / tot) * 100).toFixed(1) : 0;
                            return ' ' + ctx.label + ': ' + ctx.raw + ' (' + pct + '%)';
                        }
                    }
                }
            }
        }
    });

    // Build initial breakdown list from the starting data
    renderBreakdown(labels, values, colors);
}

// =============================================================
//  ML API  —  GET /api/customers/segment-distribution/
// =============================================================
function fetchSegmentAPI() {
    var statusEl    = g('segmentStatus');
    var breakdownEl = g('segmentBreakdown');

    // Show loading state in status div
    if (statusEl) {
        statusEl.style.display = 'flex';
        statusEl.style.alignItems = 'center';
        statusEl.style.gap = '.4rem';
        statusEl.innerHTML =
            '<span class="spinner"></span>' +
            '<span style="font-size:.72rem;color:#9ca3af;">Loading ML…</span>';
    }

    fetch('/api/customers/segment-distribution/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    })
    .then(function (data) {
        if (!data.success || !data.segments) {
            throw new Error(data.error || 'API returned failure');
        }

        var seg    = data.segments;
        var labels = seg.labels || [];
        var values = seg.values || [];
        var colors = seg.colors || [];

        // 1 ── Update doughnut chart
        if (window.segmentsChart && labels.length) {
            window.segmentsChart.data.labels                      = labels;
            window.segmentsChart.data.datasets[0].data            = values;
            window.segmentsChart.data.datasets[0].backgroundColor = colors;
            window.segmentsChart.update('active');
        }

        // 2 ── Status badge
        if (statusEl) {
            var pillClass = data.model_used ? 'model' : 'heuristic';
            var pillText  = data.model_used ? 'ML Model' : 'Heuristic';
            statusEl.innerHTML =
                '<span class="ml-pill ' + pillClass + '">' + pillText + '</span>' +
                '<span style="font-size:.72rem;color:#6b7280;">' +
                (data.total_processed || 0) + ' transactions</span>';
        }

        // 3 ── Breakdown list
        renderBreakdown(labels, values, colors, seg.percentages);

        // 4 ── Sync sidebar Loyal+VIP
        var li = labels.indexOf('Loyal');
        var vi = labels.indexOf('VIP');
        var lv = (li >= 0 ? values[li] : 0) + (vi >= 0 ? values[vi] : 0);
        setText('loyalCustomers', lv);
    })
    .catch(function (err) {
        console.warn('[Segment API] ' + err.message);
        if (statusEl) {
            statusEl.innerHTML =
                '<span class="ml-pill error">Unavailable</span>' +
                '<span style="font-size:.72rem;color:#9ca3af;">showing defaults</span>';
        }
        // Leave breakdown showing the sample-data version — already rendered
    });
}

function renderBreakdown(labels, values, colors, percentages) {
    var el = g('segmentBreakdown');
    if (!el) return;
    var total = values.reduce(function (a, b) { return a + b; }, 0);
    if (!labels.length) {
        el.innerHTML = '<div style="text-align:center;padding:.625rem;color:#9ca3af;font-size:.8rem;">No data</div>';
        return;
    }
    el.innerHTML = labels.map(function (lbl, i) {
        var pct = percentages
            ? (percentages[lbl] || '0.0')
            : (total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0');
        return '<div class="seg-row">' +
            '<div style="display:flex;align-items:center;">' +
                '<span class="seg-dot" style="background:' + (colors[i] || '#ccc') + ';"></span>' +
                '<span style="font-weight:600;color:#374151;">' + lbl + '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:.625rem;">' +
                '<span style="font-weight:700;color:#111827;min-width:2rem;text-align:right;">' + values[i] + '</span>' +
                '<span style="color:#9ca3af;font-size:.75rem;min-width:3.5rem;text-align:right;">' + pct + '%</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

// =============================================================
//  SAMPLE DATA  (150 customers)
// =============================================================
function loadSampleCustomers() {
    var FN = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Mohammed','Dhruv','Kabir',
              'Ananya','Diya','Aadhya','Advika','Anika','Ishita','Myra','Pari','Sara','Tanvi'];
    var LN = ['Sharma','Verma','Patel','Reddy','Kumar','Singh','Nair','Menon','Iyer','Pillai',
              'Mehta','Joshi','Desai','Choudhary','Gupta','Malhotra','Kapoor','Chopra','Khanna','Agarwal'];
    var CT = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow'];
    var IP = ['Fashion','Electronics','Food','Movies','Sports','Books','Music','Travel',
              'Fitness','Gaming','Photography','Art','Cooking','Technology','Shopping','Beauty'];

    var now = luxon.DateTime.now();
    customersData = [];

    for (var i = 0; i < 150; i++) {
        var fn   = FN[ri(FN.length)];
        var ln   = LN[ri(LN.length)];
        var city = CT[ri(CT.length)];
        var joinDT = now.minus({ days: Math.floor(Math.random() * 365) });
        var spend  = Math.floor(Math.random() * 100000) + 1000;
        var visits = Math.floor(Math.random() * 50) + 1;
        var avg    = spend / visits;

        var seg = 'regular';
        if (avg > 5000)                                              seg = 'high-value';
        if (visits > 30 && avg > 3000)                              seg = 'vip';
        if (visits > 10 && avg > 2000)                              seg = 'loyal';
        if (visits <= 2)                                             seg = 'new';
        if (now.diff(joinDT,'days').days > 180 && visits < 3)       seg = 'inactive';

        var interests = [];
        for (var j = 0, ni = ri(4) + 2; j < ni; j++) {
            var it = IP[ri(IP.length)];
            if (interests.indexOf(it) < 0) interests.push(it);
        }

        customersData.push({
            id:            'CUST' + (1000 + i),
            name:          fn + ' ' + ln,
            gender:        Math.random() > 0.5 ? 'male' : 'female',
            age:           ri(50) + 18,
            email:         fn.toLowerCase() + '.' + ln.toLowerCase() + i + '@example.com',
            phone:         '+91 ' + (Math.floor(Math.random() * 9000000000) + 1000000000),
            city:          city,
            joinDate:      joinDT.toISODate(),
            joinTimestamp: joinDT.toISO(),
            segment:       seg,
            source:        ['walk-in','online','referral','campaign','event'][ri(5)],
            interests:     interests,
            totalSpend:    spend,
            totalVisits:   visits,
            avgSpend:      avg,
            lastVisit:     now.minus({ days: ri(30) }).toISODate(),
            loyaltyPoints: Math.floor(spend / 100) + (seg === 'vip' ? 500 : seg === 'loyal' ? 200 : 0),
            status:        seg === 'inactive' ? 'inactive' : 'active',
            satisfaction:  (Math.random() * 2 + 3).toFixed(1)
        });
    }

    customersData.sort(function (a, b) { return new Date(b.joinTimestamp) - new Date(a.joinTimestamp); });
    filteredCustomers = customersData.slice();
}

// =============================================================
//  KPIs
// =============================================================
function updateKPIs() {
    var n = customersData.length;
    if (!n) return;
    var now   = luxon.DateTime.now();
    var curM  = now.month, curY = now.year;
    var prevM = now.minus({ months: 1 }).month, prevY = now.minus({ months: 1 }).year;

    var thisMo = customersData.filter(function (c) {
        var d = luxon.DateTime.fromISO(c.joinTimestamp);
        return d.month === curM && d.year === curY;
    }).length;
    var lastMo = customersData.filter(function (c) {
        var d = luxon.DateTime.fromISO(c.joinTimestamp);
        return d.month === prevM && d.year === prevY;
    }).length;

    var growth   = lastMo > 0 ? ((thisMo - lastMo) / lastMo * 100).toFixed(1) : 0;
    var avgSpend = customersData.reduce(function (s, c) { return s + c.totalSpend; }, 0) / n;
    var repeatPct = (customersData.filter(function (c) { return c.totalVisits > 1; }).length / n * 100).toFixed(1);
    var avgSat   = (customersData.reduce(function (s, c) { return s + parseFloat(c.satisfaction); }, 0) / n).toFixed(1);

    setText('totalCustomers',    n.toLocaleString('en-IN'));
    setText('avgCustomerSpend',  '\u20B9 ' + fmtMoney(avgSpend));
    setText('repeatRate',        repeatPct + '%');
    setText('satisfactionScore', avgSat);

    var gEl = g('customerGrowth');
    if (gEl) {
        gEl.textContent = (growth >= 0 ? '+' : '') + growth + '%';
        gEl.className   = 'change-' + (growth >= 0 ? 'up' : 'down');
    }
}

// =============================================================
//  TABLE
// =============================================================
function renderTable() {
    var tbody = g('customersTableBody');
    if (!tbody) return;

    var start = (currentPage - 1) * ITEMS_PER_PAGE;
    var page  = filteredCustomers.slice(start, start + ITEMS_PER_PAGE);

    if (!page.length) {
        tbody.innerHTML =
            '<tr><td colspan="10" style="text-align:center;padding:3rem;color:#9ca3af;">' +
            '<i class="fas fa-users" style="font-size:2.5rem;display:block;margin-bottom:.5rem;opacity:.3;"></i>' +
            'No customers found</td></tr>';
        updatePagination();
        return;
    }

    tbody.innerHTML = page.map(function (c) {
        var lv      = luxon.DateTime.fromISO(c.lastVisit);
        var daysAgo = Math.floor(luxon.DateTime.now().diff(lv, 'days').days);
        var selBg   = selectedIds.has(c.id) ? ' style="background:#eff6ff;"' : '';
        var chkd    = selectedIds.has(c.id) ? ' checked' : '';

        return '<tr' + selBg + '>' +
            '<td><input type="checkbox" class="cust-cb" data-id="' + c.id + '"' + chkd + '></td>' +
            '<td>' +
                '<div style="display:flex;align-items:center;gap:.5rem;">' +
                    '<div style="width:2rem;height:2rem;background:#e5e7eb;border-radius:50%;' +
                         'display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                        '<i class="fas fa-user" style="color:#9ca3af;font-size:.7rem;"></i>' +
                    '</div>' +
                    '<div>' +
                        '<div style="font-weight:600;">' + xe(c.name) + '</div>' +
                        '<div style="font-size:.7rem;color:#9ca3af;">' + xe(c.city) + '</div>' +
                    '</div>' +
                '</div>' +
            '</td>' +
            '<td style="font-size:.8rem;color:#6b7280;">' + xe(c.email) + '</td>' +
            '<td><span class="badge badge-' + c.segment + '">' + segLbl(c.segment) + '</span></td>' +
            '<td><strong>\u20B9\u00a0' + c.totalSpend.toLocaleString('en-IN') + '</strong></td>' +
            '<td>' + c.totalVisits + '</td>' +
            '<td>' +
                '<div style="font-size:.8rem;">' + lv.toFormat('dd/MM/yyyy') + '</div>' +
                '<div style="font-size:.7rem;color:#9ca3af;">' + daysAgo + 'd ago</div>' +
            '</td>' +
            '<td style="font-weight:600;color:#7c3aed;">' + c.loyaltyPoints + '</td>' +
            '<td><span class="badge badge-' + c.status + '">' + cap(c.status) + '</span></td>' +
            '<td>' +
                '<div style="display:flex;gap:.25rem;">' +
                    '<button class="act-btn act-view"   onclick="viewCustomer(\'' + c.id + '\')"><i class="fas fa-eye"></i></button>' +
                    '<button class="act-btn act-edit"   onclick="editCustomer(\'' + c.id + '\')"><i class="fas fa-edit"></i></button>' +
                    '<button class="act-btn act-delete" onclick="deleteCustomer(\'' + c.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</td>' +
        '</tr>';
    }).join('');

    tbody.querySelectorAll('.cust-cb').forEach(function (cb) {
        cb.addEventListener('change', onRowCheck);
    });

    updatePagination();
}

function updatePagination() {
    var total = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
    setText('currentPage',  currentPage);
    setText('totalPages',   total);
    setText('showingCount', Math.min(filteredCustomers.length, currentPage * ITEMS_PER_PAGE));
    setText('totalCount',   filteredCustomers.length);
    var pb = g('prevPageBtn'), nb = g('nextPageBtn');
    if (pb) pb.disabled = currentPage <= 1;
    if (nb) nb.disabled = currentPage >= total;
}

function updateSidebarInsights() {
    var today = luxon.DateTime.now().toISODate();
    setText('newCustomersToday', customersData.filter(function (c) { return c.joinDate === today; }).length);
    var le = g('loyalCustomers');
    if (le && (le.textContent === '0' || !le.textContent.trim())) {
        le.textContent = customersData.filter(function (c) {
            return c.totalVisits > 10 && c.totalSpend > 10000;
        }).length;
    }
}

// =============================================================
//  TABLE EVENT HANDLERS
// =============================================================
function wireTableControls() {
    safe('customerSearch',        'input',  function (e) { onSearch(e.target.value); });
    safe('customerSegmentFilter', 'change', function (e) { onSegFilter(e.target.value); });
    safe('customerSort',          'change', function (e) { onSort(e.target.value); });
    safe('selectAllCustomers',    'change', onSelectAll);
    safe('prevPageBtn', 'click', function () { if (currentPage > 1) { currentPage--; renderTable(); } });
    safe('nextPageBtn', 'click', function () {
        var total = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
        if (currentPage < total) { currentPage++; renderTable(); }
    });
    safe('exportCustomersBtn', 'click', exportCSV);
}

function onSearch(term) {
    term = term.toLowerCase().trim();
    filteredCustomers = term
        ? customersData.filter(function (c) {
            return c.name.toLowerCase().indexOf(term)  >= 0 ||
                   c.email.toLowerCase().indexOf(term) >= 0 ||
                   c.city.toLowerCase().indexOf(term)  >= 0 ||
                   c.phone.indexOf(term) >= 0;
          })
        : customersData.slice();
    currentPage = 1;
    renderTable();
}

function onSegFilter(val) {
    currentSegment = val;
    filteredCustomers = val === 'all'
        ? customersData.slice()
        : customersData.filter(function (c) { return c.segment === val; });
    currentPage = 1;
    renderTable();
}

function onSort(val) {
    currentSort = val;
    var fn = {
        recent:  function (a, b) { return new Date(b.joinTimestamp) - new Date(a.joinTimestamp); },
        name:    function (a, b) { return a.name.localeCompare(b.name); },
        spend:   function (a, b) { return b.totalSpend    - a.totalSpend; },
        visits:  function (a, b) { return b.totalVisits   - a.totalVisits; },
        loyalty: function (a, b) { return b.loyaltyPoints - a.loyaltyPoints; }
    }[val];
    if (fn) { filteredCustomers.sort(fn); renderTable(); }
}

function onRowCheck(e) {
    var id = e.target.dataset.id;
    if (e.target.checked) selectedIds.add(id); else selectedIds.delete(id);
    syncSelectAll();
}

function onSelectAll(e) {
    var page = filteredCustomers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE
    );
    page.forEach(function (c) {
        if (e.target.checked) selectedIds.add(c.id); else selectedIds.delete(c.id);
    });
    document.querySelectorAll('.cust-cb').forEach(function (cb) {
        cb.checked = e.target.checked;
    });
}

function syncSelectAll() {
    var sa = g('selectAllCustomers'); if (!sa) return;
    var page = filteredCustomers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE
    );
    var sel = page.filter(function (c) { return selectedIds.has(c.id); }).length;
    sa.checked       = sel > 0 && sel === page.length;
    sa.indeterminate = sel > 0 && sel < page.length;
}

// =============================================================
//  MODAL WIRING
// =============================================================
function wireModals() {
    // Add Customer
    safe('addCustomerBtn',     'click', function () { openModal('addCustomerModal'); });
    safe('closeCustomerModal', 'click', function () { closeModal('addCustomerModal'); });
    safe('cancelCustomerBtn',  'click', function () { closeModal('addCustomerModal'); resetAddForm(); });
    var af = g('addCustomerForm');
    if (af) af.addEventListener('submit', onAddCustomer);

    // Campaign
    safe('bulkActionBtn', 'click', function () {
        if (!selectedIds.size) { toast('Select at least one customer first.', true); return; }
        openModal('campaignModal');
    });
    safe('closeCampaignModal', 'click', function () { closeModal('campaignModal'); });
    safe('cancelCampaignBtn',  'click', function () { closeModal('campaignModal'); });
    var cf = g('campaignForm');
    if (cf) cf.addEventListener('submit', onSendCampaign);

    // Close on backdrop click
    ['addCustomerModal','campaignModal','customerDetailModal'].forEach(function (id) {
        var el = g(id);
        if (el) el.addEventListener('click', function (e) { if (e.target === el) closeModal(id); });
    });

    // Interest tags input
    wireTagInput();
}

function wireTagInput() {
    var inp = g('customerInterests');
    if (!inp) return;
    var fresh = inp.cloneNode(true);
    inp.parentNode.replaceChild(fresh, inp);
    fresh.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            var v = fresh.value.trim();
            if (v) { addTag(v); fresh.value = ''; }
        }
    });
}

// =============================================================
//  MODAL HANDLERS
// =============================================================
function onAddCustomer(e) {
    e.preventDefault();
    var now = luxon.DateTime.now();
    var interests = Array.from(
        document.querySelectorAll('#interestsContainer .itag span')
    ).map(function (s) { return s.textContent; });

    var c = {
        id:            'CUST' + (1000 + customersData.length + 1),
        name:          gv('customerName'),
        gender:        gv('customerGender') || 'other',
        age:           parseInt(gv('customerAge')) || null,
        email:         gv('customerEmail'),
        phone:         gv('customerPhone'),
        city:          gv('customerCity') || '',
        joinDate:      now.toISODate(),
        joinTimestamp: now.toISO(),
        segment:       gv('customerSegment') || 'new',
        source:        gv('customerSource') || 'walk-in',
        interests:     interests,
        totalSpend:    0, totalVisits: 0, avgSpend: 0,
        lastVisit:     now.toISODate(),
        loyaltyPoints: 0, status: 'active',
        satisfaction:  '4.0'
    };

    customersData.unshift(c);
    filteredCustomers.unshift(c);
    closeModal('addCustomerModal');
    resetAddForm();
    updateKPIs();
    renderTable();
    toast('Customer "' + c.name + '" added!');
}

function onSendCampaign(e) {
    e.preventDefault();
    var type  = gv('campaignType');
    var aud   = gv('campaignAudience');
    var count = aud === 'selected' ? selectedIds.size : filteredCustomers.length;
    var label = { email:'Email', sms:'SMS', whatsapp:'WhatsApp' }[type] || type;
    toast(label + ' campaign sent to ' + count + ' customers!');
    closeModal('campaignModal');
    var frm = g('campaignForm'); if (frm) frm.reset();
}

// =============================================================
//  CUSTOMER CRUD
// =============================================================
function viewCustomer(id) {
    var c = findC(id); if (!c) return;
    var content = g('customerDetailContent'); if (!content) return;

    var jd = luxon.DateTime.fromISO(c.joinTimestamp);
    var lv = luxon.DateTime.fromISO(c.lastVisit);

    content.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem;">' +
            '<div style="display:flex;align-items:center;gap:1rem;">' +
                '<div style="width:3.5rem;height:3.5rem;background:#eff6ff;border-radius:50%;' +
                     'display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                    '<i class="fas fa-user" style="font-size:1.5rem;color:#2563eb;"></i>' +
                '</div>' +
                '<div>' +
                    '<h2 style="margin:0 0 .375rem;font-size:1.15rem;font-weight:700;">' + xe(c.name) + '</h2>' +
                    '<span class="badge badge-' + c.segment + '">' + segLbl(c.segment) + '</span>' +
                    '&nbsp;<span class="badge badge-' + c.status + '">' + cap(c.status) + '</span>' +
                '</div>' +
            '</div>' +
            '<button onclick="closeModal(\'customerDetailModal\')" class="modal-close">&times;</button>' +
        '</div>' +
        '<div class="detail-grid">' +
            dCard('Email',        xe(c.email)) +
            dCard('Phone',        c.phone) +
            dCard('Gender',       cap(c.gender)) +
            dCard('Age',          c.age || 'N/A') +
            dCard('City',         c.city || 'N/A') +
            dCard('Joined',       jd.toFormat('dd MMM yyyy')) +
            dCard('Total Spend',  '\u20B9 ' + c.totalSpend.toLocaleString('en-IN')) +
            dCard('Visits',       c.totalVisits) +
            dCard('Avg Spend',    '\u20B9 ' + Math.round(c.avgSpend).toLocaleString('en-IN')) +
            dCard('Last Visit',   lv.toFormat('dd MMM yyyy')) +
            dCard('Loyalty Pts',  c.loyaltyPoints) +
            dCard('Satisfaction', c.satisfaction + ' / 5.0') +
        '</div>' +
        (c.interests && c.interests.length
            ? '<div style="margin-bottom:1.25rem;">' +
              '<p style="font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.5rem;">Interests</p>' +
              '<div style="display:flex;flex-wrap:wrap;gap:.375rem;">' +
              c.interests.map(function (it) {
                  return '<span style="padding:.2rem .5rem;background:#f3f4f6;border-radius:20px;font-size:.75rem;color:#374151;">' + xe(it) + '</span>';
              }).join('') + '</div></div>'
            : '') +
        '<div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1rem;">' +
            '<button class="fbtn-cancel" onclick="closeModal(\'customerDetailModal\')">Close</button>' +
            '<button class="fbtn-submit" onclick="editCustomer(\'' + c.id + '\')"><i class="fas fa-edit"></i> Edit</button>' +
        '</div>';

    openModal('customerDetailModal');
}

function editCustomer(id) {
    var c = findC(id); if (!c) return;

    sv('customerName',    c.name);
    sv('customerGender',  c.gender);
    sv('customerAge',     c.age || '');
    sv('customerEmail',   c.email);
    sv('customerPhone',   c.phone);
    sv('customerCity',    c.city || '');
    sv('customerSegment', c.segment);
    sv('customerSource',  c.source);

    var container = g('interestsContainer');
    if (container) {
        container.innerHTML = '';
        (c.interests || []).forEach(addTag);
    }

    // Swap form's submit handler for update
    var form    = g('addCustomerForm'); if (!form) return;
    var newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    newForm.addEventListener('submit', function (e) { onUpdate(e, id); });
    wireTagInput();

    var btn = g('addCustomerSubmitBtn');
    if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Update Customer';
    var htitle = document.querySelector('#addCustomerModal .modal-hdr h3');
    if (htitle) htitle.innerHTML =
        '<i class="fas fa-edit" style="color:#2563eb;margin-right:.5rem;"></i>Edit Customer';

    closeModal('customerDetailModal');
    openModal('addCustomerModal');
}

function onUpdate(e, id) {
    e.preventDefault();
    var idx = customersData.findIndex(function (c) { return c.id === id; });
    if (idx < 0) return;

    var interests = Array.from(
        document.querySelectorAll('#interestsContainer .itag span')
    ).map(function (s) { return s.textContent; });

    customersData[idx] = Object.assign({}, customersData[idx], {
        name:      gv('customerName'),
        gender:    gv('customerGender'),
        age:       parseInt(gv('customerAge')) || null,
        email:     gv('customerEmail'),
        phone:     gv('customerPhone'),
        city:      gv('customerCity'),
        segment:   gv('customerSegment'),
        source:    gv('customerSource'),
        interests: interests
    });

    var fi = filteredCustomers.findIndex(function (c) { return c.id === id; });
    if (fi >= 0) filteredCustomers[fi] = customersData[idx];

    closeModal('addCustomerModal');
    resetAddForm();
    updateKPIs(); renderTable();
    toast('Customer updated!');
}

function deleteCustomer(id) {
    var c = findC(id);
    if (!confirm('Delete "' + (c ? c.name : id) + '"? This cannot be undone.')) return;
    customersData     = customersData.filter(function (x) { return x.id !== id; });
    filteredCustomers = filteredCustomers.filter(function (x) { return x.id !== id; });
    selectedIds.delete(id);
    updateKPIs(); renderTable(); updateSidebarInsights();
    toast('Customer deleted.');
}

// =============================================================
//  INTEREST TAGS
// =============================================================
function addTag(text) {
    var c = g('interestsContainer'); if (!c) return;
    var uid = 'tag-' + Date.now() + ri(9999);
    var el  = document.createElement('div');
    el.className = 'itag'; el.id = uid;
    el.innerHTML = '<span>' + xe(text) + '</span>' +
        '<button type="button" onclick="document.getElementById(\'' + uid + '\').remove()">&times;</button>';
    c.appendChild(el);
}

// =============================================================
//  EXPORT CSV
// =============================================================
function exportCSV() {
    var hdr  = 'ID,Name,Email,Phone,City,Segment,"Total Spend",Visits,"Loyalty Pts",Status,"Join Date","Last Visit"';
    var rows = filteredCustomers.map(function (c) {
        return [c.id, c.name, c.email, c.phone, c.city, segLbl(c.segment),
                c.totalSpend, c.totalVisits, c.loyaltyPoints, c.status, c.joinDate, c.lastVisit]
               .map(function (v) { return '"' + String(v).replace(/"/g,'""') + '"'; }).join(',');
    });
    var a = document.createElement('a');
    a.href     = 'data:text/csv,' + encodeURIComponent(hdr + '\n' + rows.join('\n'));
    a.download = 'customers-' + luxon.DateTime.now().toFormat('yyyy-MM-dd') + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast('Exported ' + filteredCustomers.length + ' customers!');
}

// =============================================================
//  RESET ADD FORM
// =============================================================
function resetAddForm() {
    var form = g('addCustomerForm'); if (!form) return;
    var fresh = form.cloneNode(true);
    form.parentNode.replaceChild(fresh, form);
    fresh.reset();
    fresh.addEventListener('submit', onAddCustomer);
    wireTagInput();
    var c = g('interestsContainer'); if (c) c.innerHTML = '';
    var btn = g('addCustomerSubmitBtn');
    if (btn) btn.innerHTML = '<i class="fas fa-user-plus"></i> Add Customer';
    var ht = document.querySelector('#addCustomerModal .modal-hdr h3');
    if (ht) ht.innerHTML = '<i class="fas fa-user-plus" style="color:#2563eb;margin-right:.5rem;"></i>Add New Customer';
}

// =============================================================
//  TOAST
// =============================================================
function toast(msg, isErr) {
    var n   = document.createElement('div');
    n.className = 'toast-notif' + (isErr ? ' toast-err' : '');
    var col = isErr ? '#ef4444' : '#10b981';
    var ico = isErr ? 'exclamation-circle' : 'check-circle';
    n.innerHTML =
        '<i class="fas fa-' + ico + '" style="color:' + col + ';font-size:1rem;flex-shrink:0;"></i>' +
        '<span style="color:#374151;flex:1;">' + xe(String(msg)) + '</span>' +
        '<button onclick="this.parentNode.remove()" style="background:none;border:none;cursor:pointer;' +
        'color:#9ca3af;font-size:1.1rem;padding:0;line-height:1;">&times;</button>';
    document.body.appendChild(n);
    setTimeout(function () { n.classList.add('toast-show'); }, 10);
    setTimeout(function () {
        n.classList.remove('toast-show');
        setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 350);
    }, 5000);
}

// =============================================================
//  MODAL OPEN / CLOSE
// =============================================================
function openModal(id)  { var el = g(id); if (el) el.style.display = 'flex'; }
function closeModal(id) { var el = g(id); if (el) el.style.display = 'none'; }

// =============================================================
//  UTILITY HELPERS  — all null-safe
// =============================================================
function g(id)   { return document.getElementById(id); }

function safe(id, evt, fn) {
    var el = g(id);
    if (el) el.addEventListener(evt, fn);
}

function setText(id, v) {
    var el = g(id); if (el) el.textContent = v;
}

function gv(id) {
    var el = g(id); return el ? el.value.trim() : '';
}

function sv(id, v) {
    var el = g(id); if (el) el.value = v;
}

function findC(id) {
    return customersData.find(function (c) { return c.id === id; }) || null;
}

function ri(n)  { return Math.floor(Math.random() * n); }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function xe(s) {
    return String(s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function segLbl(s) {
    return ({'new':'New','regular':'Regular','loyal':'Loyal',
             'vip':'VIP','high-value':'High Value','inactive':'Inactive'})[s] || s;
}

function fmtMoney(v) {
    if (v >= 1e5) return (v / 1e5).toFixed(1) + 'L';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    return Math.round(v).toLocaleString('en-IN');
}

function safeJSON(str, fallback) {
    if (!str || str === 'None' || str === 'null' || str === '') return fallback;
    try { var r = JSON.parse(str); return (Array.isArray(r) && r.length) ? r : fallback; }
    catch (e) { return fallback; }
}

function dCard(label, value) {
    return '<div class="dcard"><div class="dcard-lbl">' + label + '</div>' +
           '<div class="dcard-val">' + value + '</div></div>';
}

function getCookie(name) {
    var p = document.cookie.split(';');
    for (var i = 0; i < p.length; i++) {
        var kv = p[i].trim().split('=');
        if (kv[0] === name) return decodeURIComponent(kv[1] || '');
    }
    return '';
}