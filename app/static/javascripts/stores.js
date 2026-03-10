// Store Management JavaScript
// ============================================================
// Initialize
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    initStoreManagement();
});

function initStoreManagement() {
    const totalStoresEl = document.getElementById('totalStores');
    const hasDjangoData = totalStoresEl && totalStoresEl.textContent.trim() !== "0";

    if (!hasDjangoData) {
        loadSampleStores();
    }

    setupCategoryFilters();
    setupViewDetailButtons();
    setupAddStoreButtons();
}

// ============================================================
// Sample Data
// ============================================================
function loadSampleStores() {
    const storesData = [
        {
            id: 'ST001', name: 'Fashion Hub', category: 'fashion',
            location: 'GF-North', size: 1500, monthlyRent: 75000,
            manager: 'Priya Sharma', contact: 'priya@fashionhub.com',
            hours: '10:00 AM - 9:00 PM', status: 'active'
        },
        {
            id: 'ST002', name: 'ElectroTech', category: 'electronics',
            location: '1F-East', size: 2000, monthlyRent: 120000,
            manager: 'Rahul Verma', contact: 'rahul@electrotech.com',
            hours: '10:00 AM - 10:00 PM', status: 'active'
        },
        {
            id: 'ST003', name: 'Italian Corner', category: 'food',
            location: 'GF-West', size: 800, monthlyRent: 45000,
            manager: 'Marco Rossi', contact: 'marco@italiancorner.com',
            hours: '11:00 AM - 11:00 PM', status: 'active'
        },
        {
            id: 'ST004', name: 'CineMax', category: 'entertainment',
            location: '2F-South', size: 5000, monthlyRent: 250000,
            manager: 'Anil Kapoor', contact: 'anil@cinemax.com',
            hours: '9:00 AM - 1:00 AM', status: 'active'
        },
        {
            id: 'ST005', name: 'Beauty Glow', category: 'beauty',
            location: '1F-North', size: 1200, monthlyRent: 65000,
            manager: 'Sneha Reddy', contact: 'sneha@beautyglow.com',
            hours: '10:00 AM - 9:00 PM', status: 'active'
        }
    ];

    const total    = storesData.length;
    const active   = storesData.filter(s => s.status === 'active').length;
    const avgSize  = Math.round(storesData.reduce((s, x) => s + x.size, 0) / total);
    const avgRent  = Math.round(storesData.reduce((s, x) => s + x.monthlyRent, 0) / total);
    const occupancy = Math.round((total / 50) * 100);

    setElText('totalStores',   total);
    setElText('activeStores',  active + ' active');
    setElText('avgSize',       avgSize + ' sq.ft');
    setElText('avgRent',       '\u20B9' + avgRent.toLocaleString('en-IN'));
    setElText('occupancyRate', occupancy + '%');

    const grid = document.getElementById('storesGrid');
    if (grid && !grid.querySelector('.store-card')) {
        grid.innerHTML = storesData.map(store => createStoreCardHTML(store)).join('');
        setupViewDetailButtons();
    }
}

function setElText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
}

function createStoreCardHTML(store) {
    return '<div class="store-card" data-store-id="' + store.id + '" data-category="' + store.category + '">' +
        '<div class="store-card-header" style="position:relative;">' +
            '<span class="store-category-badge">' + capitalize(store.category) + '</span>' +
            '<span class="store-status">' +
                '<span class="status-dot ' + store.status + '"></span>' +
                '<span>' + capitalize(store.status) + '</span>' +
            '</span>' +
        '</div>' +
        '<div class="store-card-body">' +
            '<h3 class="store-name">' + store.name + '</h3>' +
            '<div class="store-details">' +
                '<div class="store-detail-item"><span class="detail-label">Store ID</span><span class="detail-value">' + store.id + '</span></div>' +
                '<div class="store-detail-item"><span class="detail-label">Location</span><span class="detail-value">' + store.location + '</span></div>' +
                '<div class="store-detail-item"><span class="detail-label">Size</span><span class="detail-value">' + store.size + ' sq.ft</span></div>' +
                '<div class="store-detail-item"><span class="detail-label">Monthly Rent</span><span class="detail-value">\u20B9' + store.monthlyRent.toLocaleString('en-IN') + '</span></div>' +
                '<div class="store-detail-item"><span class="detail-label">Manager</span><span class="detail-value">' + store.manager + '</span></div>' +
                '<div class="store-detail-item"><span class="detail-label">Contact</span><span class="detail-value">' + store.contact + '</span></div>' +
            '</div>' +
        '</div>' +
        '<div class="store-card-footer">' +
            '<div class="store-hours"><i class="fas fa-clock"></i> ' + store.hours + '</div>' +
            '<button class="btn-secondary view-details-btn" data-store-id="' + store.id + '">View Details</button>' +
        '</div>' +
    '</div>';
}

// ============================================================
// Event Listeners
// ============================================================
function setupCategoryFilters() {
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            var category = this.dataset.category;
            document.querySelectorAll('.store-card').forEach(function(card) {
                card.style.display =
                    (category === 'all' || card.dataset.category === category) ? '' : 'none';
            });
        });
    });
}

function setupViewDetailButtons() {
    document.querySelectorAll('.view-details-btn').forEach(function(btn) {
        var clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
    });
    document.querySelectorAll('.view-details-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            showStoreDetails(this.dataset.storeId);
        });
    });
}

function setupAddStoreButtons() {
    // Event delegation — catches clicks on any add-store trigger
    document.body.addEventListener('click', function(e) {
        var btn = e.target.closest('#addStoreBtn, #addFirstStoreBtn, .add-store-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            openAddStoreModal();
        }
    });
}

// ============================================================
// Add Store Modal
// ============================================================
function openAddStoreModal() {
    var existing = document.getElementById('addStoreModal');
    if (existing) existing.remove();

    var LS = 'display:block;font-size:0.875rem;font-weight:500;margin-bottom:0.375rem;color:#374151;';
    var IS = 'width:100%;padding:0.625rem 0.875rem;border:1px solid #d1d5db;border-radius:8px;font-size:0.9375rem;outline:none;box-sizing:border-box;';

    var modal = document.createElement('div');
    modal.id = 'addStoreModal';
    modal.setAttribute('style',
        'position:fixed;top:0;left:0;width:100%;height:100%;' +
        'background:rgba(0,0,0,0.55);display:flex;align-items:center;' +
        'justify-content:center;z-index:99999;padding:1rem;box-sizing:border-box;'
    );

    modal.innerHTML =
        '<div id="modalBox" style="background:white;border-radius:12px;padding:2rem;' +
            'width:100%;max-width:520px;max-height:90vh;overflow-y:auto;' +
            'box-shadow:0 25px 60px rgba(0,0,0,0.35);">' +

            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">' +
                '<h2 style="font-size:1.2rem;font-weight:700;color:#111827;margin:0;">' +
                    '<i class="fas fa-plus-circle" style="color:#2563eb;margin-right:0.5rem;"></i>Add New Store' +
                '</h2>' +
                '<button id="closeModalBtn" type="button" ' +
                    'style="background:#f3f4f6;border:none;width:2rem;height:2rem;border-radius:50%;' +
                    'cursor:pointer;font-size:1.2rem;color:#6b7280;line-height:1;">&times;</button>' +
            '</div>' +

            '<div id="modalError" style="display:none;background:#fef2f2;border:1px solid #fecaca;' +
                'color:#dc2626;padding:0.75rem 1rem;border-radius:8px;margin-bottom:1rem;font-size:0.875rem;"></div>' +

            '<div id="modalSuccess" style="display:none;background:#f0fdf4;border:1px solid #bbf7d0;' +
                'color:#16a34a;padding:0.75rem 1rem;border-radius:8px;margin-bottom:1rem;font-size:0.875rem;"></div>' +

            '<form id="addStoreForm" novalidate>' +

                '<div style="margin-bottom:1rem;">' +
                    '<label style="' + LS + '">Store Name <span style="color:#ef4444">*</span></label>' +
                    '<input type="text" name="name" placeholder="e.g. Fashion Hub" required ' +
                        'style="' + IS + '" ' +
                        'onfocus="this.style.borderColor=\'#2563eb\'" onblur="this.style.borderColor=\'#d1d5db\'">' +
                '</div>' +

                '<div style="margin-bottom:1rem;">' +
                    '<label style="' + LS + '">Category <span style="color:#ef4444">*</span></label>' +
                    '<select name="category" required style="' + IS + 'background:white;" ' +
                        'onfocus="this.style.borderColor=\'#2563eb\'" onblur="this.style.borderColor=\'#d1d5db\'">' +
                        '<option value="">Select Category</option>' +
                        '<option value="electronics">Electronics</option>' +
                        '<option value="fashion">Fashion</option>' +
                        '<option value="food">Food &amp; Beverage</option>' +
                        '<option value="beauty">Beauty</option>' +
                        '<option value="entertainment">Entertainment</option>' +
                        '<option value="sports">Sports</option>' +
                        '<option value="home">Home &amp; Living</option>' +
                        '<option value="books">Books &amp; Stationery</option>' +
                        '<option value="other">Other</option>' +
                    '</select>' +
                '</div>' +

                '<div style="margin-bottom:1rem;">' +
                    '<label style="' + LS + '">Location <span style="color:#ef4444">*</span></label>' +
                    '<select name="location" required style="' + IS + 'background:white;" ' +
                        'onfocus="this.style.borderColor=\'#2563eb\'" onblur="this.style.borderColor=\'#d1d5db\'">' +
                        '<option value="">Select Location</option>' +
                        '<option value="GF-North">Ground Floor - North</option>' +
                        '<option value="GF-South">Ground Floor - South</option>' +
                        '<option value="GF-East">Ground Floor - East</option>' +
                        '<option value="GF-West">Ground Floor - West</option>' +
                        '<option value="1F-North">First Floor - North</option>' +
                        '<option value="1F-South">First Floor - South</option>' +
                        '<option value="1F-East">First Floor - East</option>' +
                        '<option value="1F-West">First Floor - West</option>' +
                        '<option value="2F-North">Second Floor - North</option>' +
                        '<option value="2F-South">Second Floor - South</option>' +
                    '</select>' +
                '</div>' +

                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">' +
                    '<div>' +
                        '<label style="' + LS + '">Size (sq.ft) <span style="color:#ef4444">*</span></label>' +
                        '<input type="number" name="size" placeholder="e.g. 1500" min="1" required ' +
                            'style="' + IS + '" ' +
                            'onfocus="this.style.borderColor=\'#2563eb\'" onblur="this.style.borderColor=\'#d1d5db\'">' +
                    '</div>' +
                    '<div>' +
                        '<label style="' + LS + '">Monthly Rent (\u20B9) <span style="color:#ef4444">*</span></label>' +
                        '<input type="number" name="monthly_rent" placeholder="e.g. 75000" min="0" required ' +
                            'style="' + IS + '" ' +
                            'onfocus="this.style.borderColor=\'#2563eb\'" onblur="this.style.borderColor=\'#d1d5db\'">' +
                    '</div>' +
                '</div>' +

                '<div style="margin-bottom:1rem;">' +
                    '<label style="' + LS + '">Manager Name <span style="color:#ef4444">*</span></label>' +
                    '<input type="text" name="manager" placeholder="e.g. Priya Sharma" required ' +
                        'style="' + IS + '" ' +
                        'onfocus="this.style.borderColor=\'#2563eb\'" onblur="this.style.borderColor=\'#d1d5db\'">' +
                '</div>' +

                '<div style="margin-bottom:1rem;">' +
                    '<label style="' + LS + '">Contact Info <span style="color:#ef4444">*</span></label>' +
                    '<input type="text" name="contact_info" placeholder="Phone or email" required ' +
                        'style="' + IS + '" ' +
                        'onfocus="this.style.borderColor=\'#2563eb\'" onblur="this.style.borderColor=\'#d1d5db\'">' +
                '</div>' +

                '<div style="margin-bottom:1.5rem;">' +
                    '<label style="' + LS + '">Operating Hours <span style="color:#ef4444">*</span></label>' +
                    '<input type="text" name="operating_hours" value="10:00 AM - 9:00 PM" required ' +
                        'style="' + IS + '" ' +
                        'onfocus="this.style.borderColor=\'#2563eb\'" onblur="this.style.borderColor=\'#d1d5db\'">' +
                '</div>' +

                '<div style="display:flex;gap:0.75rem;justify-content:flex-end;">' +
                    '<button type="button" id="cancelAddStore" ' +
                        'style="padding:0.625rem 1.25rem;border:1px solid #d1d5db;background:white;' +
                        'border-radius:8px;cursor:pointer;font-size:0.875rem;color:#374151;font-weight:500;">' +
                        'Cancel' +
                    '</button>' +
                    '<button type="submit" id="submitStoreBtn" ' +
                        'style="padding:0.625rem 1.5rem;background:#2563eb;color:white;border:none;' +
                        'border-radius:8px;cursor:pointer;font-size:0.875rem;font-weight:600;">' +
                        '<i class="fas fa-plus"></i> Add Store' +
                    '</button>' +
                '</div>' +

            '</form>' +
        '</div>';

    document.body.appendChild(modal);

    // ── Close helpers ────────────────────────────────────────
    function closeModal() {
        var m = document.getElementById('addStoreModal');
        if (m) m.remove();
    }

    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelAddStore').addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });

    // ── Form Submit ──────────────────────────────────────────
    document.getElementById('addStoreForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var errorBox   = document.getElementById('modalError');
        var successBox = document.getElementById('modalSuccess');
        var submitBtn  = document.getElementById('submitStoreBtn');
        var form       = this;

        errorBox.style.display   = 'none';
        successBox.style.display = 'none';

        var name     = form.elements['name'].value.trim();
        var category = form.elements['category'].value;
        var location = form.elements['location'].value;
        var size     = form.elements['size'].value;
        var rent     = form.elements['monthly_rent'].value;
        var manager  = form.elements['manager'].value.trim();
        var contact  = form.elements['contact_info'].value.trim();
        var hours    = form.elements['operating_hours'].value.trim();

        if (!name || !category || !location || !size || !rent || !manager || !contact || !hours) {
            errorBox.textContent = 'Please fill in all required fields.';
            errorBox.style.display = 'block';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        fetch('/api/stores/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                name: name,
                category: category,
                location: location,
                size: parseInt(size),
                monthly_rent: parseInt(rent),
                manager: manager,
                contact_info: contact,
                operating_hours: hours
            })
        })
        .then(function(response) {
            return response.json().then(function(data) {
                return { ok: response.ok, data: data };
            });
        })
        .then(function(result) {
            if (result.ok && result.data.success) {
                successBox.textContent = '"' + name + '" added successfully! Refreshing...';
                successBox.style.display = 'block';
                setTimeout(function() { window.location.reload(); }, 1200);
            } else {
                var msg = result.data.errors
                    ? Object.values(result.data.errors).flat().join(' ')
                    : (result.data.error || 'Failed to add store.');
                errorBox.textContent = msg;
                errorBox.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Store';
            }
        })
        .catch(function() {
            errorBox.textContent = 'Network error. Please try again.';
            errorBox.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Store';
        });
    });
}

// ============================================================
// Store Details Modal
// ============================================================
function showStoreDetails(storeId) {
    var card = document.querySelector('.store-card[data-store-id="' + storeId + '"]');
    if (!card) return;

    var name    = (card.querySelector('.store-name') || {}).textContent || storeId;
    var hoursEl = card.querySelector('.store-hours');
    var hours   = hoursEl ? hoursEl.textContent.trim() : '—';
    var statusDot = card.querySelector('.status-dot');
    var status  = 'unknown';
    if (statusDot) {
        statusDot.classList.forEach(function(c) {
            if (c !== 'status-dot') status = c;
        });
    }

    var detailItems = [];
    card.querySelectorAll('.store-detail-item').forEach(function(item) {
        var label = (item.querySelector('.detail-label') || {}).textContent || '';
        var value = (item.querySelector('.detail-value') || {}).textContent || '—';
        if (label.trim()) detailItems.push({ label: label.trim(), value: value.trim() });
    });

    var existing = document.getElementById('storeDetailsModal');
    if (existing) existing.remove();

    var detailsHTML = detailItems.map(function(d) {
        return '<div style="padding:0.75rem;background:#f9fafb;border-radius:8px;">' +
            '<div style="font-size:0.625rem;color:#9ca3af;text-transform:uppercase;margin-bottom:0.25rem;">' + d.label + '</div>' +
            '<div style="font-size:0.875rem;font-weight:600;color:#111827;">' + d.value + '</div>' +
        '</div>';
    }).join('');

    var modal = document.createElement('div');
    modal.id = 'storeDetailsModal';
    modal.setAttribute('style',
        'position:fixed;top:0;left:0;width:100%;height:100%;' +
        'background:rgba(0,0,0,0.55);display:flex;align-items:center;' +
        'justify-content:center;z-index:99999;padding:1rem;box-sizing:border-box;'
    );

    modal.innerHTML =
        '<div style="background:white;border-radius:12px;padding:2rem;' +
            'width:100%;max-width:480px;box-shadow:0 25px 60px rgba(0,0,0,0.35);">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">' +
                '<h2 style="font-size:1.2rem;font-weight:700;color:#111827;margin:0;">' +
                    '<i class="fas fa-store" style="color:#2563eb;margin-right:0.5rem;"></i>' + name +
                '</h2>' +
                '<button id="closeDetailsModal" type="button" ' +
                    'style="background:#f3f4f6;border:none;width:2rem;height:2rem;border-radius:50%;' +
                    'cursor:pointer;font-size:1.2rem;color:#6b7280;line-height:1;">&times;</button>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">' +
                detailsHTML +
                '<div style="padding:0.75rem;background:#f9fafb;border-radius:8px;">' +
                    '<div style="font-size:0.625rem;color:#9ca3af;text-transform:uppercase;margin-bottom:0.25rem;">Hours</div>' +
                    '<div style="font-size:0.875rem;font-weight:600;color:#111827;">' + hours + '</div>' +
                '</div>' +
                '<div style="padding:0.75rem;background:#f9fafb;border-radius:8px;">' +
                    '<div style="font-size:0.625rem;color:#9ca3af;text-transform:uppercase;margin-bottom:0.25rem;">Status</div>' +
                    '<div style="font-size:0.875rem;font-weight:600;text-transform:capitalize;' +
                        'color:' + (status === 'active' ? '#10b981' : '#ef4444') + ';">' + status + '</div>' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;justify-content:flex-end;">' +
                '<button id="closeDetailsBtn" type="button" ' +
                    'style="padding:0.625rem 1.25rem;background:#2563eb;color:white;' +
                    'border:none;border-radius:8px;cursor:pointer;font-size:0.875rem;font-weight:600;">Close</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);

    function closeDetails() {
        var m = document.getElementById('storeDetailsModal');
        if (m) m.remove();
    }

    document.getElementById('closeDetailsModal').addEventListener('click', closeDetails);
    document.getElementById('closeDetailsBtn').addEventListener('click', closeDetails);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeDetails(); });
}

// ============================================================
// Utilities
// ============================================================
function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].trim().split('=');
        if (parts[0] === name) return decodeURIComponent(parts[1] || '');
    }
    return '';
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}