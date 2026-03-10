// =============================================================
//  customers.js  —  Full version with ML Segment API
// =============================================================

'use strict';

// ── State ─────────────────────────────────────────────────────
var customersData     = [];
var filteredCustomers = [];
var currentSegment    = 'all';
var currentSort       = 'recent';
var currentPage       = 1;
var itemsPerPage      = 10;
var selectedCustomers = new Set();

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    initCustomerManagement();
});

function initCustomerManagement() {
    loadSampleCustomers();
    setupModalControls();
    setupTableControls();
    initCharts();
    updateKPIs();
    renderTable();
    updateSidebarInsights();
    fetchSegmentDistribution();   // ← ML API call
}

// =============================================================
//  ML API — Segment Distribution
// =============================================================
function fetchSegmentDistribution() {
    var statusEl    = document.getElementById('segmentStatus');
    var breakdownEl = document.getElementById('segmentBreakdown');

    // Show loading state
    if (statusEl) {
        statusEl.style.display = 'flex';
        statusEl.innerHTML =
            '<span class="loading-spinner"></span>' +
            '<span style="font-size:0.72rem;color:#9ca3af;margin-left:4px;">Loading ML…</span>';
    }
    if (breakdownEl) {
        breakdownEl.innerHTML =
            '<div style="text-align:center;padding:0.75rem;color:#9ca3af;font-size:0.8rem;">' +
            '<span class="loading-spinner"></span>&nbsp;Predicting segments…</div>';
    }

    fetch('/api/customers/segment-distribution/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    })
    .then(function (data) {
        if (!data.success || !data.segments) {
            throw new Error(data.error || 'API returned failure');
        }
        var seg = data.segments;

        // 1. Update doughnut chart
        if (window.segmentsChart) {
            window.segmentsChart.data.labels                          = seg.labels;
            window.segmentsChart.data.datasets[0].data               = seg.values;
            window.segmentsChart.data.datasets[0].backgroundColor    = seg.colors;
            window.segmentsChart.update();
        }

        // 2. Status badge
        if (statusEl) {
            var badge = data.model_used
                ? '<span class="ml-badge model">ML Model</span>'
                : '<span class="ml-badge heuristic">Heuristic</span>';
            statusEl.innerHTML =
                badge +
                '<span style="font-size:0.72rem;color:#6b7280;margin-left:4px;">' +
                data.total_processed + ' transactions</span>';
        }

        // 3. Per-segment breakdown list
        if (breakdownEl) {
            var total = seg.values.reduce(function (a, b) { return a + b; }, 0);
            breakdownEl.innerHTML = seg.labels.map(function (label, i) {
                var pct = seg.percentages
                    ? seg.percentages[label]
                    : (total > 0 ? ((seg.values[i] / total) * 100).toFixed(1) : '0.0');
                return '<div class="seg-row">' +
                    '<div style="display:flex;align-items:center;">' +
                        '<span class="seg-dot" style="background:' + seg.colors[i] + ';"></span>' +
                        '<span style="font-weight:500;color:#374151;">' + label + '</span>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:0.625rem;">' +
                        '<span style="font-weight:700;color:#111827;">' + seg.values[i] + '</span>' +
                        '<span style="color:#9ca3af;min-width:3rem;text-align:right;">' + pct + '%</span>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        // 4. Update sidebar Loyal+VIP counter
        var loyalIdx = seg.labels.indexOf('Loyal');
        var vipIdx   = seg.labels.indexOf('VIP');
        var loyalCount =
            (loyalIdx >= 0 ? seg.values[loyalIdx] : 0) +
            (vipIdx   >= 0 ? seg.values[vipIdx]   : 0);
        setElText('loyalCustomers', loyalCount);
    })
    .catch(function (err) {
        console.error('[Segment API]', err);
        if (statusEl) {
            statusEl.innerHTML =
                '<span style="color:#ef4444;font-size:0.72rem;">API unavailable — sample data</span>';
        }
        if (breakdownEl) {
            breakdownEl.innerHTML =
                '<div style="text-align:center;padding:0.75rem;color:#9ca3af;font-size:0.8rem;">' +
                'Could not load ML predictions</div>';
        }
    });
}

// Helper: predict a single transaction (optional)
function predictSegment(txData, cb) {
    fetch('/api/customers/predict-segment/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(txData)
    })
    .then(function (r) { return r.json(); })
    .then(function (d) { if (typeof cb === 'function') cb(d.success ? null : d.error, d); })
    .catch(function (e) { if (typeof cb === 'function') cb(e.message, null); });
}

// =============================================================
//  Sample Data
// =============================================================
function loadSampleCustomers() {
    var firstNames = [
        'Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Mohammed','Dhruv','Kabir',
        'Ananya','Diya','Aadhya','Advika','Anika','Ishita','Myra','Pari','Sara','Tanvi'
    ];
    var lastNames = [
        'Sharma','Verma','Patel','Reddy','Kumar','Singh','Nair','Menon','Iyer','Pillai',
        'Mehta','Joshi','Desai','Choudhary','Gupta','Malhotra','Kapoor','Chopra','Khanna','Agarwal'
    ];
    var cities = [
        'Mumbai','Delhi','Bangalore','Hyderabad','Chennai',
        'Kolkata','Pune','Ahmedabad','Jaipur','Lucknow'
    ];
    var interestsList = [
        'Fashion','Electronics','Food','Movies','Sports','Books','Music','Travel',
        'Fitness','Gaming','Photography','Art','Cooking','Technology','Shopping',
        'Beauty','Home Decor','Cars','Pets','Outdoors'
    ];
    var now = luxon.DateTime.now();
    customersData = [];

    for (var i = 0; i < 150; i++) {
        var fn  = firstNames[rnd(firstNames.length)];
        var ln  = lastNames[rnd(lastNames.length)];
        var city = cities[rnd(cities.length)];
        var daysAgo = Math.floor(Math.random() * 365);
        var joinDate = now.minus({ days: daysAgo });
        var spend  = Math.floor(Math.random() * 100000) + 1000;
        var visits = Math.floor(Math.random() * 50) + 1;
        var avg    = spend / visits;

        var seg = 'regular';
        if (avg > 5000)                                           seg = 'high-value';
        if (visits > 30 && avg > 3000)                           seg = 'vip';
        if (visits > 10 && avg > 2000)                           seg = 'loyal';
        if (visits <= 2)                                          seg = 'new';
        if (now.diff(joinDate,'days').days > 180 && visits < 3)  seg = 'inactive';

        var interests = [];
        var ni = Math.floor(Math.random() * 4) + 2;
        for (var j = 0; j < ni; j++) {
            var it = interestsList[rnd(interestsList.length)];
            if (interests.indexOf(it) === -1) interests.push(it);
        }

        customersData.push({
            id:            'CUST' + (1000 + i),
            name:          fn + ' ' + ln,
            gender:        Math.random() > 0.5 ? 'male' : 'female',
            age:           Math.floor(Math.random() * 50) + 18,
            dob:           genDOB(Math.floor(Math.random() * 50) + 18),
            email:         fn.toLowerCase() + '.' + ln.toLowerCase() + i + '@example.com',
            phone:         '+91 ' + (Math.floor(Math.random() * 9e9) + 1e9),
            address:       (Math.floor(Math.random() * 100) + 1) + ' Street, ' + city,
            city:          city,
            joinDate:      joinDate.toISODate(),
            joinTimestamp: joinDate.toISO(),
            segment:       seg,
            source:        ['walk-in','online','referral','campaign','event'][rnd(5)],
            interests:     interests,
            totalSpend:    spend,
            totalVisits:   visits,
            avgSpend:      avg,
            lastVisit:     now.minus({ days: Math.floor(Math.random() * 30) }).toISODate(),
            loyaltyPoints: Math.floor(spend / 100) + (seg === 'vip' ? 500 : seg === 'loyal' ? 200 : 0),
            status:        seg === 'inactive' ? 'inactive' : 'active',
            communication: {
                email: Math.random() > 0.1, sms: Math.random() > 0.2,
                whatsapp: Math.random() > 0.3, promotions: Math.random() > 0.15
            },
            satisfaction:  (Math.random() * 2 + 3).toFixed(1)
        });
    }
    customersData.sort(function (a, b) {
        return new Date(b.joinTimestamp) - new Date(a.joinTimestamp);
    });
    filteredCustomers = customersData.slice();
}

// =============================================================
//  Charts
// =============================================================
function initCharts() {
    // ── Acquisition line chart ────────────────────────────
    var acqEl = document.getElementById('acquisitionChart');
    if (acqEl) {
        // Try to use Django-provided data
        var djDates  = tryParse(acqEl.dataset.dates);
        var djCounts = tryParse(acqEl.dataset.counts);

        window.acquisitionChart = new Chart(acqEl.getContext('2d'), {
            type: 'line',
            data: {
                labels: djDates || [],
                datasets: [{
                    label: 'New Customers',
                    data: djCounts || [],
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124,58,237,0.08)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#7c3aed',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(0,0,0,0.04)' } },
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { precision: 0 } }
                }
            }
        });

        // If no Django data, generate from sample customers
        if (!djDates) buildAcquisitionData();
    }

    // ── Segments doughnut — starts empty; ML API fills it ──
    var segEl = document.getElementById('segmentsChart');
    if (segEl) {
        // Use Django fallback data if ML API is down
        var djLabels = tryParse(segEl.dataset.labels) || ['New','Regular','Loyal','VIP'];
        var djValues = tryParse(segEl.dataset.values) || [0,0,0,0];
        var djColors = tryParse(segEl.dataset.colors) || ['#2563eb','#10b981','#f59e0b','#8b5cf6'];

        window.segmentsChart = new Chart(segEl.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: djLabels,
                datasets: [{
                    data: djValues,
                    backgroundColor: djColors,
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { padding: 14, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                var tot = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                                var pct = tot > 0 ? ((ctx.raw / tot) * 100).toFixed(1) : 0;
                                return ctx.label + ': ' + ctx.raw + ' (' + pct + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
}

function buildAcquisitionData() {
    if (!window.acquisitionChart) return;
    var now = luxon.DateTime.now();
    var labels = [], data = [];
    for (var i = 0; i < 12; i++) {
        var wStart = now.minus({ weeks: 11 - i });
        var wEnd   = wStart.plus({ days: 6 });
        labels.push('W' + (i + 1));
        data.push(customersData.filter(function (c) {
            var jd = luxon.DateTime.fromISO(c.joinTimestamp);
            return jd >= wStart && jd <= wEnd;
        }).length);
    }
    window.acquisitionChart.data.labels = labels;
    window.acquisitionChart.data.datasets[0].data = data;
    window.acquisitionChart.update();
}

// =============================================================
//  KPIs
// =============================================================
function updateKPIs() {
    var n   = customersData.length;
    var now = luxon.DateTime.now();
    var thisMo = customersData.filter(function (c) {
        return luxon.DateTime.fromISO(c.joinTimestamp).month === now.month;
    }).length;
    var lastMo = customersData.filter(function (c) {
        return luxon.DateTime.fromISO(c.joinTimestamp).month === now.minus({ months: 1 }).month;
    }).length;
    var growth  = lastMo > 0 ? ((thisMo - lastMo) / lastMo * 100).toFixed(1) : 0;
    var avgSpend = n > 0
        ? customersData.reduce(function (s, c) { return s + c.totalSpend; }, 0) / n
        : 0;
    var repeatRate = n > 0
        ? (customersData.filter(function (c) { return c.totalVisits > 1; }).length / n * 100).toFixed(1)
        : 0;
    var avgSat = n > 0
        ? (customersData.reduce(function (s, c) { return s + parseFloat(c.satisfaction); }, 0) / n).toFixed(1)
        : 0;

    setElText('totalCustomers',    n.toLocaleString('en-IN'));
    setElText('avgCustomerSpend',  '\u20B9 ' + fmtCurrency(avgSpend));
    setElText('repeatRate',        repeatRate + '%');
    setElText('satisfactionScore', avgSat);

    var gEl = document.getElementById('customerGrowth');
    if (gEl) {
        gEl.textContent  = (growth >= 0 ? '+' : '') + growth + '%';
        gEl.className    = 'change-' + (growth >= 0 ? 'positive' : 'negative');
    }
}

// =============================================================
//  Table
// =============================================================
function renderTable() {
    var tbody = document.getElementById('customersTable');
    if (!tbody) return;

    var start = (currentPage - 1) * itemsPerPage;
    var page  = filteredCustomers.slice(start, start + itemsPerPage);

    if (page.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="10" style="text-align:center;padding:3rem;color:#9ca3af;">' +
            '<i class="fas fa-users" style="font-size:2.5rem;display:block;margin-bottom:0.5rem;opacity:0.3;"></i>' +
            'No customers found</td></tr>';
        updatePagination();
        return;
    }

    tbody.innerHTML = page.map(function (c) {
        var lv      = luxon.DateTime.fromISO(c.lastVisit);
        var daysAgo = Math.floor(luxon.DateTime.now().diff(lv, 'days').days);
        var chk     = selectedCustomers.has(c.id) ? 'checked' : '';
        var rowBg   = selectedCustomers.has(c.id) ? 'style="background:#eff6ff;"' : '';

        return '<tr ' + rowBg + ' data-id="' + c.id + '">' +
            '<td><input type="checkbox" class="customer-checkbox" data-customer-id="' + c.id + '" ' + chk + '></td>' +
            '<td>' +
                '<div style="display:flex;align-items:center;gap:0.5rem;">' +
                    '<div style="width:2rem;height:2rem;background:#e5e7eb;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                        '<i class="fas fa-user" style="color:#9ca3af;font-size:0.7rem;"></i>' +
                    '</div>' +
                    '<div>' +
                        '<div style="font-weight:600;">' + esc(c.name) + '</div>' +
                        '<div style="font-size:0.7rem;color:#9ca3af;">' + c.city + '</div>' +
                    '</div>' +
                '</div>' +
            '</td>' +
            '<td style="font-size:0.8rem;color:#6b7280;">' + esc(c.email) + '</td>' +
            '<td><span class="segment-badge ' + c.segment + '">' + segLabel(c.segment) + '</span></td>' +
            '<td><strong>\u20B9 ' + c.totalSpend.toLocaleString('en-IN') + '</strong></td>' +
            '<td>' + c.totalVisits + '</td>' +
            '<td>' +
                '<div style="font-size:0.8rem;">' + lv.toFormat('dd/MM/yyyy') + '</div>' +
                '<div style="font-size:0.7rem;color:#9ca3af;">' + daysAgo + 'd ago</div>' +
            '</td>' +
            '<td style="font-weight:600;color:#7c3aed;">' + c.loyaltyPoints + '</td>' +
            '<td><span class="status-badge ' + c.status + '">' + cap(c.status) + '</span></td>' +
            '<td>' +
                '<div style="display:flex;gap:0.25rem;">' +
                    '<button class="action-btn view"   onclick="viewCustomer(\'' + c.id + '\')"><i class="fas fa-eye"></i></button>' +
                    '<button class="action-btn edit"   onclick="editCustomer(\'' + c.id + '\')"><i class="fas fa-edit"></i></button>' +
                    '<button class="action-btn delete" onclick="deleteCustomer(\'' + c.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</td>' +
        '</tr>';
    }).join('');

    // Re-attach checkbox listeners
    tbody.querySelectorAll('.customer-checkbox').forEach(function (cb) {
        cb.addEventListener('change', onCheckbox);
    });

    updatePagination();
}

function updatePagination() {
    var total = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
    setElText('currentPage',  currentPage);
    setElText('totalPages',   total);
    setElText('showingCount', Math.min(filteredCustomers.length, currentPage * itemsPerPage));
    setElText('totalCount',   filteredCustomers.length);
    var prev = document.getElementById('prevPageBtn');
    var next = document.getElementById('nextPageBtn');
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= total;
}

function updateSidebarInsights() {
    var today    = luxon.DateTime.now().toISODate();
    var newToday = customersData.filter(function (c) { return c.joinDate === today; }).length;
    var loyal    = customersData.filter(function (c) {
        return c.totalVisits > 10 && c.totalSpend > 10000;
    }).length;
    setElText('newCustomersToday', newToday);
    // Only set as fallback — API will overwrite loyalCustomers
    var loyalEl = document.getElementById('loyalCustomers');
    if (loyalEl && (loyalEl.textContent === '0' || loyalEl.textContent === '')) {
        loyalEl.textContent = loyal;
    }
}

// =============================================================
//  Modal Controls
// =============================================================
function setupModalControls() {
    // ── Add Customer ──────────────────────────────────────
    var addModal  = document.getElementById('addCustomerModal');
    var addForm   = document.getElementById('addCustomerForm');

    on('addCustomerBtn',     'click',  function () { showModal('addCustomerModal'); });
    on('closeCustomerModal', 'click',  function () { hideModal('addCustomerModal'); });
    on('cancelCustomerBtn',  'click',  function () { hideModal('addCustomerModal'); resetAddForm(); });
    if (addForm) addForm.addEventListener('submit', onAddCustomer);

    // ── Campaign ──────────────────────────────────────────
    var campaignForm = document.getElementById('campaignForm');
    on('bulkActionBtn',      'click',  function () {
        if (selectedCustomers.size === 0) { toast('Please select at least one customer first.', 'error'); return; }
        showModal('campaignModal');
    });
    on('closeCampaignModal', 'click',  function () { hideModal('campaignModal'); });
    on('cancelCampaignBtn',  'click',  function () { hideModal('campaignModal'); });
    if (campaignForm) campaignForm.addEventListener('submit', onSendCampaign);

    // ── Export ────────────────────────────────────────────
    on('exportCustomersBtn', 'click',  exportCSV);

    // ── Close on overlay click ────────────────────────────
    ['addCustomerModal','campaignModal','customerDetailModal'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', function (e) {
            if (e.target === el) el.style.display = 'none';
        });
    });

    // ── Interests tag input ───────────────────────────────
    var intInput = document.getElementById('customerInterests');
    if (intInput) {
        intInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                var v = intInput.value.trim();
                if (v) { addTag(v); intInput.value = ''; }
            }
        });
    }
}

// =============================================================
//  Table Controls
// =============================================================
function setupTableControls() {
    on('customerSearch',        'input',  onSearch);
    on('customerSegmentFilter', 'change', onSegmentFilter);
    on('customerSort',          'change', onSort);
    on('selectAllCustomers',    'change', onSelectAll);
    on('prevPageBtn',           'click',  function () { if (currentPage > 1) { currentPage--; renderTable(); } });
    on('nextPageBtn',           'click',  function () {
        var total = Math.ceil(filteredCustomers.length / itemsPerPage);
        if (currentPage < total) { currentPage++; renderTable(); }
    });
}

// =============================================================
//  Handlers
// =============================================================
function onSearch(e) {
    var term = e.target.value.toLowerCase().trim();
    filteredCustomers = term === ''
        ? customersData.slice()
        : customersData.filter(function (c) {
            return c.name.toLowerCase().indexOf(term) >= 0 ||
                   c.email.toLowerCase().indexOf(term) >= 0 ||
                   c.city.toLowerCase().indexOf(term) >= 0 ||
                   c.phone.indexOf(term) >= 0;
        });
    currentPage = 1;
    renderTable();
}

function onSegmentFilter(e) {
    currentSegment = e.target.value;
    filteredCustomers = currentSegment === 'all'
        ? customersData.slice()
        : customersData.filter(function (c) { return c.segment === currentSegment; });
    currentPage = 1;
    renderTable();
}

function onSort(e) {
    currentSort = e.target.value;
    var fn = {
        recent:  function (a, b) { return new Date(b.joinTimestamp) - new Date(a.joinTimestamp); },
        name:    function (a, b) { return a.name.localeCompare(b.name); },
        spend:   function (a, b) { return b.totalSpend   - a.totalSpend; },
        visits:  function (a, b) { return b.totalVisits  - a.totalVisits; },
        loyalty: function (a, b) { return b.loyaltyPoints - a.loyaltyPoints; }
    }[currentSort];
    if (fn) filteredCustomers.sort(fn);
    renderTable();
}

function onAddCustomer(e) {
    e.preventDefault();
    var now = luxon.DateTime.now();
    var interests = Array.from(
        document.querySelectorAll('#interestsContainer .interest-tag span')
    ).map(function (s) { return s.textContent; });

    var c = {
        id:            'CUST' + (1000 + customersData.length + 1),
        name:          val('customerName'),
        gender:        val('customerGender') || 'other',
        age:           parseInt(val('customerAge')) || null,
        dob:           val('customerDOB') || null,
        email:         val('customerEmail'),
        phone:         val('customerPhone'),
        address:       val('customerAddress') || '',
        city:          val('customerCity') || '',
        joinDate:      now.toISODate(),
        joinTimestamp: now.toISO(),
        segment:       val('customerSegment'),
        source:        val('customerSource'),
        interests:     interests,
        totalSpend:    0, totalVisits: 0, avgSpend: 0,
        lastVisit:     now.toISODate(),
        loyaltyPoints: 0,
        status:        'active',
        communication: {
            email:      chk('prefEmail'),
            sms:        chk('prefSMS'),
            whatsapp:   chk('prefWhatsApp'),
            promotions: chk('prefPromotions')
        },
        satisfaction: '4.0'
    };

    customersData.unshift(c);
    filteredCustomers.unshift(c);
    hideModal('addCustomerModal');
    resetAddForm();
    updateKPIs();
    renderTable();
    updateSidebarInsights();
    toast('Customer "' + c.name + '" added successfully!');
}

function onSendCampaign(e) {
    e.preventDefault();
    var type     = val('campaignType');
    var audience = val('campaignAudience');
    var count    = audience === 'selected' ? selectedCustomers.size : filteredCustomers.length;
    var label    = { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp' }[type] || type;
    toast(label + ' campaign sent to ' + count + ' customers!');
    hideModal('campaignModal');
    document.getElementById('campaignForm').reset();
}

function onCheckbox(e) {
    var id = e.target.dataset.customerId;
    if (e.target.checked) selectedCustomers.add(id);
    else selectedCustomers.delete(id);
    syncSelectAll();
}

function onSelectAll(e) {
    var slice = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    document.querySelectorAll('.customer-checkbox').forEach(function (cb) {
        cb.checked = e.target.checked;
        if (e.target.checked) selectedCustomers.add(cb.dataset.customerId);
        else selectedCustomers.delete(cb.dataset.customerId);
    });
}

function syncSelectAll() {
    var cb    = document.getElementById('selectAllCustomers');
    if (!cb) return;
    var slice = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage, currentPage * itemsPerPage
    );
    var sel = slice.filter(function (c) { return selectedCustomers.has(c.id); }).length;
    cb.checked       = sel === slice.length && slice.length > 0;
    cb.indeterminate = sel > 0 && sel < slice.length;
}

// =============================================================
//  Customer CRUD
// =============================================================
function viewCustomer(id) {
    var c = find(id);
    if (!c) return;
    var modal   = document.getElementById('customerDetailModal');
    var content = document.getElementById('customerDetailContent');
    var jd = luxon.DateTime.fromISO(c.joinTimestamp);
    var lv = luxon.DateTime.fromISO(c.lastVisit);
    var daysAgo = Math.floor(luxon.DateTime.now().diff(lv, 'days').days);

    content.innerHTML =
        '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">' +
            '<div style="width:3.5rem;height:3.5rem;background:#eff6ff;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                '<i class="fas fa-user" style="font-size:1.5rem;color:#2563eb;"></i>' +
            '</div>' +
            '<div>' +
                '<h2 style="margin:0 0 0.25rem;font-size:1.2rem;font-weight:700;">' + esc(c.name) + '</h2>' +
                '<span class="segment-badge ' + c.segment + '">' + segLabel(c.segment) + '</span>' +
                '&nbsp;<span class="status-badge ' + c.status + '">' + cap(c.status) + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="detail-cards">' +
            dc('Email',        esc(c.email)) +
            dc('Phone',        c.phone) +
            dc('Gender',       cap(c.gender)) +
            dc('Age',          c.age || 'N/A') +
            dc('City',         c.city || 'N/A') +
            dc('Join Date',    jd.toFormat('dd MMM yyyy')) +
            dc('Total Spend',  '\u20B9 ' + c.totalSpend.toLocaleString('en-IN')) +
            dc('Visits',       c.totalVisits) +
            dc('Avg Spend',    '\u20B9 ' + Math.round(c.avgSpend).toLocaleString('en-IN')) +
            dc('Last Visit',   daysAgo + ' days ago') +
            dc('Loyalty Pts',  c.loyaltyPoints) +
            dc('Satisfaction', c.satisfaction + ' / 5.0') +
        '</div>' +
        (c.interests.length
            ? '<div style="margin-bottom:1.25rem;">' +
                '<p style="font-size:0.75rem;font-weight:600;color:#6b7280;text-transform:uppercase;margin-bottom:0.5rem;">Interests</p>' +
                '<div style="display:flex;flex-wrap:wrap;gap:0.375rem;">' +
                c.interests.map(function (it) {
                    return '<span style="padding:0.2rem 0.5rem;background:#f3f4f6;border-radius:20px;font-size:0.75rem;color:#374151;">' + esc(it) + '</span>';
                }).join('') +
                '</div></div>'
            : '') +
        '<div style="display:flex;gap:0.75rem;justify-content:flex-end;margin-top:1rem;">' +
            '<button class="btn-cancel" onclick="document.getElementById(\'customerDetailModal\').style.display=\'none\'">Close</button>' +
            '<button class="btn-submit" onclick="editCustomer(\'' + c.id + '\')"><i class="fas fa-edit"></i> Edit</button>' +
        '</div>';

    showModal('customerDetailModal');
}

function editCustomer(id) {
    var c = find(id);
    if (!c) return;

    setVal('customerName',    c.name);
    setVal('customerGender',  c.gender);
    setVal('customerAge',     c.age || '');
    setVal('customerDOB',     c.dob || '');
    setVal('customerEmail',   c.email);
    setVal('customerPhone',   c.phone);
    setVal('customerAddress', c.address || '');
    setVal('customerCity',    c.city || '');
    setVal('customerSegment', c.segment);
    setVal('customerSource',  c.source);

    var pref = c.communication || {};
    setCk('prefEmail',      pref.email     !== false);
    setCk('prefSMS',        pref.sms       !== false);
    setCk('prefWhatsApp',   pref.whatsapp  !== false);
    setCk('prefPromotions', pref.promotions !== false);

    var container = document.getElementById('interestsContainer');
    if (container) {
        container.innerHTML = '';
        (c.interests || []).forEach(addTag);
    }

    // Swap form submit handler for update
    var form    = document.getElementById('addCustomerForm');
    var newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    newForm.addEventListener('submit', function (e) { onUpdateCustomer(e, id); });

    // Re-wire interests input on the cloned form
    var intInput = document.getElementById('customerInterests');
    if (intInput) {
        intInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                var v = intInput.value.trim();
                if (v) { addTag(v); intInput.value = ''; }
            }
        });
    }

    var submitBtn = newForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Customer';
    var titleEl = document.querySelector('#addCustomerModal .modal-header h3');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-edit" style="color:#2563eb;margin-right:0.5rem;"></i>Edit Customer';

    hideModal('customerDetailModal');
    showModal('addCustomerModal');
}

function onUpdateCustomer(e, id) {
    e.preventDefault();
    var idx = customersData.findIndex(function (c) { return c.id === id; });
    if (idx === -1) return;

    var interests = Array.from(
        document.querySelectorAll('#interestsContainer .interest-tag span')
    ).map(function (s) { return s.textContent; });

    customersData[idx] = Object.assign({}, customersData[idx], {
        name:      val('customerName'),
        gender:    val('customerGender'),
        age:       parseInt(val('customerAge')) || null,
        email:     val('customerEmail'),
        phone:     val('customerPhone'),
        address:   val('customerAddress'),
        city:      val('customerCity'),
        segment:   val('customerSegment'),
        source:    val('customerSource'),
        interests: interests,
        communication: {
            email: chk('prefEmail'), sms: chk('prefSMS'),
            whatsapp: chk('prefWhatsApp'), promotions: chk('prefPromotions')
        }
    });

    var fi = filteredCustomers.findIndex(function (c) { return c.id === id; });
    if (fi !== -1) filteredCustomers[fi] = customersData[idx];

    hideModal('addCustomerModal');
    resetAddForm();
    updateKPIs();
    renderTable();
    toast('Customer updated successfully!');
}

function deleteCustomer(id) {
    var c = find(id);
    if (!confirm('Delete "' + (c ? c.name : id) + '"? This cannot be undone.')) return;
    customersData     = customersData.filter(function (x) { return x.id !== id; });
    filteredCustomers = filteredCustomers.filter(function (x) { return x.id !== id; });
    selectedCustomers.delete(id);
    updateKPIs();
    renderTable();
    updateSidebarInsights();
    toast('Customer deleted.');
}

// =============================================================
//  Interest Tags
// =============================================================
function addTag(text) {
    var container = document.getElementById('interestsContainer');
    if (!container) return;
    var uid = 'tag-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    var el  = document.createElement('div');
    el.className = 'interest-tag';
    el.id = uid;
    el.innerHTML =
        '<span>' + esc(text) + '</span>' +
        '<button type="button" onclick="removeTag(\'' + uid + '\')">&times;</button>';
    container.appendChild(el);
}
function removeTag(uid) {
    var el = document.getElementById(uid);
    if (el) el.remove();
}

// =============================================================
//  Export CSV
// =============================================================
function exportCSV() {
    var headers = 'ID,Name,Email,Phone,City,Segment,Total Spend,Visits,Loyalty Points,Status,Join Date,Last Visit';
    var rows = filteredCustomers.map(function (c) {
        return [c.id, c.name, c.email, c.phone, c.city, segLabel(c.segment),
                c.totalSpend, c.totalVisits, c.loyaltyPoints, c.status, c.joinDate, c.lastVisit]
               .map(function (v) { return '"' + String(v).replace(/"/g,'""') + '"'; }).join(',');
    });
    var a      = document.createElement('a');
    a.href     = 'data:text/csv,' + encodeURIComponent(headers + '\n' + rows.join('\n'));
    a.download = 'customers-' + luxon.DateTime.now().toFormat('yyyy-MM-dd') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('Exported ' + filteredCustomers.length + ' customers!');
}

// =============================================================
//  Form Reset
// =============================================================
function resetAddForm() {
    var form = document.getElementById('addCustomerForm');
    var newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    newForm.reset();
    newForm.addEventListener('submit', onAddCustomer);

    // Re-wire interests on fresh form
    var intInput = document.getElementById('customerInterests');
    if (intInput) {
        intInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                var v = intInput.value.trim();
                if (v) { addTag(v); intInput.value = ''; }
            }
        });
    }

    var container = document.getElementById('interestsContainer');
    if (container) container.innerHTML = '';

    ['prefEmail','prefSMS','prefWhatsApp','prefPromotions'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.checked = true;
    });

    var submitBtn = newForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Add Customer';
    var titleEl = document.querySelector('#addCustomerModal .modal-header h3');
    if (titleEl) titleEl.innerHTML =
        '<i class="fas fa-user-plus" style="color:#2563eb;margin-right:0.5rem;"></i>Add New Customer';
}

// =============================================================
//  Toast
// =============================================================
function toast(msg, type) {
    var n = document.createElement('div');
    n.className = 'toast' + (type === 'error' ? ' error' : '');
    n.innerHTML =
        '<i class="fas fa-' + (type === 'error' ? 'exclamation-circle' : 'check-circle') +
        '" style="color:' + (type === 'error' ? '#ef4444' : '#10b981') + ';font-size:1rem;flex-shrink:0;"></i>' +
        '<span style="color:#374151;flex:1;">' + esc(msg) + '</span>' +
        '<button onclick="this.parentNode.remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1rem;padding:0;">&times;</button>';
    document.body.appendChild(n);
    setTimeout(function () { n.classList.add('show'); }, 10);
    setTimeout(function () {
        n.classList.remove('show');
        setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 300);
    }, 5000);
}

// =============================================================
//  Utility Helpers
// =============================================================
function showModal(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}
function hideModal(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
}
function on(id, evt, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn);
}
function setElText(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
}
function find(id) {
    return customersData.find(function (c) { return c.id === id; });
}
function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
}
function setVal(id, v) {
    var el = document.getElementById(id);
    if (el) el.value = v;
}
function chk(id) {
    var el = document.getElementById(id);
    return el ? el.checked : false;
}
function setCk(id, v) {
    var el = document.getElementById(id);
    if (el) el.checked = v;
}
function rnd(n) { return Math.floor(Math.random() * n); }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function esc(s) {
    return String(s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function segLabel(s) {
    return { new:'New', regular:'Regular', loyal:'Loyal', vip:'VIP',
             'high-value':'High Value', inactive:'Inactive' }[s] || s;
}
function fmtCurrency(v) {
    if (v >= 1e5) return (v / 1e5).toFixed(1) + 'L';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    return Math.round(v).toLocaleString('en-IN');
}
function genDOB(age) {
    var now = luxon.DateTime.now();
    var y = now.year - age;
    var m = Math.floor(Math.random() * 12) + 1;
    var d = Math.floor(Math.random() * 28) + 1;
    return y + '-' + String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0');
}
function getCookie(name) {
    var parts = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].trim().split('=');
        if (kv[0] === name) return decodeURIComponent(kv[1] || '');
    }
    return '';
}
function tryParse(str) {
    try { return JSON.parse(str); } catch (e) { return null; }
}
// Detail card helper
function dc(label, value) {
    return '<div class="detail-card">' +
        '<div class="detail-card-label">' + label + '</div>' +
        '<div class="detail-card-value">' + value + '</div>' +
    '</div>';
}