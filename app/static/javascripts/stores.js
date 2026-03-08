// Store Management JavaScript

// Store Data Structure
let storesData = [];
let filteredStores = [];
let currentCategory = 'all';
let currentView = 'grid';

// Initialize Store Management System
function initStoreManagement() {
    // Check if Django already provided store data
    const djangoStoreCount = document.getElementById('totalStores');
    
    if (djangoStoreCount && djangoStoreCount.textContent && djangoStoreCount.textContent !== "0") {
        // Data already provided by Django - just initialize UI
        console.log('Store data provided by Django');
        initStoreUI();
        setupStoreEventListeners();
    } else {
        // No data from Django - load sample data
        console.log('Loading sample store data');
        loadSampleStores();
        initStoreUI();
        setupStoreEventListeners();
        updateStoresDisplay();
    }
}

// Load sample store data (only used if no Django data)
function loadSampleStores() {
    storesData = [
        {
            id: 'ST001',
            name: 'Fashion Hub',
            category: 'fashion',
            location: 'GF-North',
            size: 1500,
            monthlyRent: 75000,
            manager: 'Priya Sharma',
            contact: 'priya@fashionhub.com',
            description: 'Premium fashion store offering latest trends',
            hours: '10:00 AM - 9:00 PM',
            status: 'open',
            revenue: 1250000,
            rating: 4.5,
            leaseEnd: '2024-06-15',
            performance: 'high'
        },
        {
            id: 'ST002',
            name: 'ElectroTech',
            category: 'electronics',
            location: '1F-East',
            size: 2000,
            monthlyRent: 120000,
            manager: 'Rahul Verma',
            contact: 'rahul@electrotech.com',
            description: 'Latest electronics and gadgets',
            hours: '10:00 AM - 10:00 PM',
            status: 'open',
            revenue: 2850000,
            rating: 4.8,
            leaseEnd: '2024-08-20',
            performance: 'very-high'
        },
        {
            id: 'ST003',
            name: 'Food Court - Italian Corner',
            category: 'food',
            location: 'GF-West',
            size: 800,
            monthlyRent: 45000,
            manager: 'Marco Rossi',
            contact: 'marco@italiancorner.com',
            description: 'Authentic Italian cuisine and desserts',
            hours: '11:00 AM - 11:00 PM',
            status: 'open',
            revenue: 850000,
            rating: 4.3,
            leaseEnd: '2024-03-10',
            performance: 'medium'
        },
        {
            id: 'ST004',
            name: 'CineMax',
            category: 'entertainment',
            location: '2F-South',
            size: 5000,
            monthlyRent: 250000,
            manager: 'Anil Kapoor',
            contact: 'anil@cinemax.com',
            description: 'Multiplex with 6 screens and premium seating',
            hours: '9:00 AM - 1:00 AM',
            status: 'open',
            revenue: 4200000,
            rating: 4.7,
            leaseEnd: '2024-12-01',
            performance: 'very-high'
        },
        {
            id: 'ST005',
            name: 'Beauty Glow',
            category: 'beauty',
            location: '1F-North',
            size: 1200,
            monthlyRent: 65000,
            manager: 'Sneha Reddy',
            contact: 'sneha@beautyglow.com',
            description: 'Premium beauty products and cosmetics',
            hours: '10:00 AM - 9:00 PM',
            status: 'open',
            revenue: 950000,
            rating: 4.4,
            leaseEnd: '2024-05-22',
            performance: 'high'
        }
    ];
    
    filteredStores = [...storesData];
    
    // Update KPIs with sample data
    updateStoreKPIsFromData();
}

// Update KPIs from sample data
function updateStoreKPIsFromData() {
    const totalStores = storesData.length;
    const openStores = storesData.filter(s => s.status === 'open').length;
    const totalSize = storesData.reduce((sum, s) => sum + s.size, 0);
    const avgSize = Math.round(totalSize / totalStores);
    const totalRent = storesData.reduce((sum, s) => sum + s.monthlyRent, 0);
    const avgRent = Math.round(totalRent / totalStores);
    const occupancyRate = Math.round((totalStores / 50) * 100);

    // Update KPI values using IDs
    const totalStoresEl = document.getElementById('totalStores');
    const activeStoresEl = document.getElementById('activeStores');
    const avgSizeEl = document.getElementById('avgSize');
    const avgRentEl = document.getElementById('avgRent');
    const occupancyRateEl = document.getElementById('occupancyRate');

    if (totalStoresEl) totalStoresEl.textContent = totalStores;
    if (activeStoresEl) activeStoresEl.textContent = openStores + ' active';
    if (avgSizeEl) avgSizeEl.textContent = avgSize + ' sq.ft';
    if (avgRentEl) avgRentEl.textContent = '₹' + avgRent.toLocaleString('en-IN');
    if (occupancyRateEl) occupancyRateEl.textContent = occupancyRate + '%';
}

// Initialize UI components
function initStoreUI() {
    // Set current date
    updateCurrentDate();
    
    // Initialize category filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', handleCategoryFilter);
        });
    }
    
    // Initialize view toggle if exists
    const viewBtns = document.querySelectorAll('.view-btn');
    if (viewBtns.length > 0) {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', handleViewToggle);
        });
    }
}

// Setup event listeners
function setupStoreEventListeners() {
    // View Details buttons - add null check to prevent error
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    if (viewDetailsBtns && viewDetailsBtns.length > 0) {
        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const storeId = btn.dataset.storeId;
                showStoreDetails(storeId);
            });
        });
    }
    
    // Add First Store button (if empty state exists)
    const addFirstStoreBtn = document.getElementById('addFirstStoreBtn');
    if (addFirstStoreBtn) {
        addFirstStoreBtn.addEventListener('click', () => {
            alert('Please add stores through the admin panel or API');
        });
    }
}

// Handle category filter
function handleCategoryFilter(e) {
    const category = e.target.dataset.category || e.target.closest('.filter-btn')?.dataset.category;
    if (!category) return;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    e.target.closest('.filter-btn')?.classList.add('active');
    
    currentCategory = category;
    
    // Filter stores
    const storeCards = document.querySelectorAll('.store-card');
    storeCards.forEach(card => {
        const cardCategory = card.dataset.category;
        if (category === 'all' || cardCategory === category) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Handle view toggle
function handleViewToggle(e) {
    const view = e.target.dataset.view;
    if (!view) return;
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    currentView = view;
    
    const storesGrid = document.getElementById('storesGrid');
    const storesList = document.getElementById('storesList');
    
    if (storesGrid && storesList) {
        if (view === 'grid') {
            storesGrid.style.display = 'grid';
            storesList.style.display = 'none';
        } else {
            storesGrid.style.display = 'none';
            storesList.style.display = 'block';
        }
    }
}

// Show store details (placeholder - would need modal)
function showStoreDetails(storeId) {
    alert('Store details for ID: ' + storeId + '\n\nFull details view would open here.');
}

// Update stores display
function updateStoresDisplay() {
    const storesGrid = document.getElementById('storesGrid');
    if (!storesGrid) return;
    
    if (filteredStores.length === 0) {
        storesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-store-slash"></i>
                <h4>No stores found</h4>
                <p>No stores match your current filters.</p>
            </div>
        `;
        return;
    }
    
    // If Django rendered the stores, don't override
    if (storesGrid.querySelector('.store-card')) {
        console.log('Stores already rendered by Django');
        return;
    }
    
    // Render stores from JavaScript (fallback)
    let gridHTML = '';
    filteredStores.forEach(store => {
        gridHTML += createStoreCardHTML(store);
    });
    storesGrid.innerHTML = gridHTML;
}

// Create store card HTML
function createStoreCardHTML(store) {
    const statusColors = {
        open: 'success',
        closed: 'danger',
        maintenance: 'warning'
    };
    
    return `
        <div class="store-card" data-store-id="${store.id}" data-category="${store.category}">
            <div class="store-card-header" style="position:relative;">
                <span class="store-category-badge">${store.category}</span>
                <span class="store-status">
                    <span class="status-dot ${store.status}"></span>
                    <span>${store.status}</span>
            </div>
            <div class="store-card-body">
                <h3 class="store-name">${store.name}</h3>
                <div class="store-details">
                    <div class="store-detail-item">
                        <span class="detail-label">Size</span>
                        <span class="detail-value">${store.size} sq.ft</span>
                    </div>
                    <div class="store-detail-item">
                        <span class="detail-label">Monthly Rent</span>
                        <span class="detail-value">₹ ${store.monthlyRent.toLocaleString('en-IN')}</span>
                    </div>
            </div>
            <div class="store-card-footer">
                <div class="store-hours"><i class="fas fa-clock"></i> ${store.hours}</div>
                <button class="btn-secondary view-details-btn" data-store-id="${store.id}">View Details</button>
            </div>
    `;
}

// Update current date
function updateCurrentDate() {
    const dateRangeEl = document.querySelector('.date-range');
    if (dateRangeEl) {
        const now = new Date();
        dateRangeEl.textContent = now.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Helper functions
function formatLocation(locationCode) {
    const mapping = {
        'GF-North': 'Ground Floor, North Wing',
        'GF-South': 'Ground Floor, South Wing',
        'GF-East': 'Ground Floor, East Wing',
        'GF-West': 'Ground Floor, West Wing',
        '1F-North': 'First Floor, North Wing',
        '1F-South': 'First Floor, South Wing',
        '1F-East': 'First Floor, East Wing',
        '1F-West': 'First Floor, West Wing',
        '2F-North': 'Second Floor, North Wing',
        '2F-South': 'Second Floor, South Wing',
        '2F-East': 'Second Floor, East Wing',
        '2F-West': 'Second Floor, West Wing'
    };
    
    return mapping[locationCode] || locationCode;
}

function formatRevenue(revenue) {
    if (revenue >= 1000000) {
        return (revenue / 1000000).toFixed(1) + 'M';
    } else if (revenue >= 100000) {
        return (revenue / 100000).toFixed(1) + 'L';
    } else {
        return revenue.toLocaleString('en-IN');
    }
}

// Initialize store management when page loads
document.addEventListener('DOMContentLoaded', initStoreManagement);
