// Store Management JavaScript

// Store Data Structure
let storesData = [];
let filteredStores = [];
let currentCategory = 'all';
let currentView = 'grid';

// Initialize Store Management System
function initStoreManagement() {
    // Load sample store data
    loadSampleStores();
    
    // Initialize UI components
    initStoreUI();
    
    // Setup event listeners
    setupStoreEventListeners();
    
    // Initialize charts
    initStoreCharts();
    
    // Update store displays
    updateStoresDisplay();
    updateTopStoresList();
    updateLeaseTimeline();
}

// Load sample store data
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
        },
        {
            id: 'ST006',
            name: 'Home & Living',
            category: 'home',
            location: '2F-North',
            size: 1800,
            monthlyRent: 95000,
            manager: 'Vikram Singh',
            contact: 'vikram@homeandliving.com',
            description: 'Furniture and home decor items',
            hours: '10:00 AM - 9:00 PM',
            status: 'maintenance',
            revenue: 1100000,
            rating: 4.2,
            leaseEnd: '2024-09-30',
            performance: 'medium'
        },
        {
            id: 'ST007',
            name: 'Sports Zone',
            category: 'sports',
            location: '2F-East',
            size: 2200,
            monthlyRent: 110000,
            manager: 'Arjun Patel',
            contact: 'arjun@sportszone.com',
            description: 'Sports equipment and fitness gear',
            hours: '10:00 AM - 9:00 PM',
            status: 'open',
            revenue: 1350000,
            rating: 4.6,
            leaseEnd: '2024-07-15',
            performance: 'high'
        },
        {
            id: 'ST008',
            name: 'Book Haven',
            category: 'books',
            location: '1F-West',
            size: 900,
            monthlyRent: 40000,
            manager: 'Meera Iyer',
            contact: 'meera@bookhaven.com',
            description: 'Books, magazines, and stationery',
            hours: '10:00 AM - 8:00 PM',
            status: 'open',
            revenue: 650000,
            rating: 4.1,
            leaseEnd: '2024-04-18',
            performance: 'low'
        },
        {
            id: 'ST009',
            name: 'Jewel Palace',
            category: 'jewelry',
            location: 'GF-South',
            size: 1600,
            monthlyRent: 85000,
            manager: 'Rajesh Nair',
            contact: 'rajesh@jewelpalace.com',
            description: 'Fine jewelry and watches',
            hours: '10:30 AM - 8:30 PM',
            status: 'closed',
            revenue: 1850000,
            rating: 4.9,
            leaseEnd: '2024-11-05',
            performance: 'very-high'
        },
        {
            id: 'ST010',
            name: 'Coffee Brew',
            category: 'food',
            location: 'GF-East',
            size: 600,
            monthlyRent: 35000,
            manager: 'Alex Johnson',
            contact: 'alex@coffeebrew.com',
            description: 'Specialty coffee and baked goods',
            hours: '7:00 AM - 10:00 PM',
            status: 'open',
            revenue: 750000,
            rating: 4.7,
            leaseEnd: '2024-02-28',
            performance: 'medium'
        }
    ];
    
    filteredStores = [...storesData];
}

// Initialize UI components
function initStoreUI() {
    // Set current date
    updateCurrentDate();
    
    // Initialize search functionality
    const searchInput = document.getElementById('storeSearch');
    searchInput.addEventListener('input', handleStoreSearch);
    
    // Initialize category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleCategoryFilter);
    });
    
    // Initialize view toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', handleViewToggle);
    });
}

// Setup event listeners
function setupStoreEventListeners() {
    // Add store button
    const addStoreBtn = document.getElementById('addStoreBtn');
    const addStoreModal = document.getElementById('addStoreModal');
    const closeStoreModal = document.getElementById('closeStoreModal');
    const cancelStoreBtn = document.getElementById('cancelStoreBtn');
    const addStoreForm = document.getElementById('addStoreForm');
    
    addStoreBtn.addEventListener('click', () => {
        addStoreModal.classList.add('active');
    });
    
    closeStoreModal.addEventListener('click', () => {
        addStoreModal.classList.remove('active');
    });
    
    cancelStoreBtn.addEventListener('click', () => {
        addStoreModal.classList.remove('active');
    });
    
    addStoreForm.addEventListener('submit', handleAddStore);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addStoreModal) {
            addStoreModal.classList.remove('active');
        }
        
        const detailModal = document.getElementById('storeDetailModal');
        if (e.target === detailModal) {
            detailModal.classList.remove('active');
        }
    });
    
    // Quick action buttons
    document.getElementById('manageLeasesBtn').addEventListener('click', () => {
        alert('Lease management feature will be implemented soon!');
    });
    
    document.getElementById('maintenanceRequestsBtn').addEventListener('click', () => {
        alert('Maintenance management feature will be implemented soon!');
    });
    
    document.getElementById('rentCollectionBtn').addEventListener('click', () => {
        alert('Rent collection feature will be implemented soon!');
    });
    
    document.getElementById('storePerformanceBtn').addEventListener('click', () => {
        alert('Performance reports feature will be implemented soon!');
    });
    
    // Export button
    document.querySelector('.export-btn').addEventListener('click', () => {
        alert('Export feature will be implemented soon!');
    });
    
    // Analytics period change
    document.getElementById('analyticsPeriod').addEventListener('change', updateStoreCharts);
    
    // Notification panel
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotifications = document.getElementById('closeNotifications');
    
    notificationBtn.addEventListener('click', () => {
        notificationPanel.classList.toggle('active');
    });
    
    closeNotifications.addEventListener('click', () => {
        notificationPanel.classList.remove('active');
    });
    
    // Mark all as read
    document.querySelector('.mark-all-read').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        document.querySelector('.notification-badge').textContent = '0';
    });
}

// Initialize store charts
function initStoreCharts() {
    // Category Revenue Chart
    const ctx = document.getElementById('categoryRevenueChart').getContext('2d');
    window.categoryRevenueChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Fashion', 'Electronics', 'Food', 'Entertainment', 'Beauty', 'Home', 'Sports', 'Books', 'Jewelry'],
            datasets: [{
                data: [1250000, 2850000, 1600000, 4200000, 950000, 1100000, 1350000, 650000, 1850000],
                backgroundColor: [
                    '#4361ee', '#4cc9f0', '#7209b7', '#f72585', '#b5179e',
                    '#3a0ca3', '#560bad', '#480ca8', '#3f37c9'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = context.parsed;
                            if (value >= 1000000) {
                                label += '₹ ' + (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 100000) {
                                label += '₹ ' + (value / 100000).toFixed(1) + 'L';
                            } else {
                                label += '₹ ' + value.toLocaleString('en-IN');
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Update store charts
function updateStoreCharts() {
    const period = document.getElementById('analyticsPeriod').value;
    
    // In a real app, this would fetch new data based on period
    // For now, we'll simulate data changes
    const multipliers = {
        week: 0.25,
        month: 1,
        quarter: 3,
        year: 12
    };
    
    const multiplier = multipliers[period] || 1;
    
    // Update chart data
    const newData = window.categoryRevenueChart.data.datasets[0].data.map(value => 
        Math.round(value * multiplier)
    );
    
    window.categoryRevenueChart.data.datasets[0].data = newData;
    window.categoryRevenueChart.update();
}

// Update stores display based on filters and view
function updateStoresDisplay() {
    const storesGrid = document.getElementById('storesGrid');
    const storesList = document.getElementById('storesList');
    
    if (filteredStores.length === 0) {
        const emptyHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-store-slash"></i>
                <h4>No stores found</h4>
                <p>No stores match your current filters. Try changing the category or search term.</p>
                <button class="btn-primary" id="resetFiltersBtn">
                    <i class="fas fa-redo"></i> Reset Filters
                </button>
            </div>
        `;
        storesGrid.innerHTML = emptyHTML;
        storesList.innerHTML = emptyHTML;
        
        document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters);
        return;
    }
    
    // Update grid view
    let gridHTML = '';
    filteredStores.forEach(store => {
        gridHTML += createStoreCardHTML(store);
    });
    storesGrid.innerHTML = gridHTML;
    
    // Update list view
    let listHTML = '';
    filteredStores.forEach(store => {
        listHTML += createStoreListHTML(store);
    });
    storesList.innerHTML = listHTML;
    
    // Add event listeners to store cards
    document.querySelectorAll('.store-card').forEach(card => {
        const storeId = card.dataset.storeId;
        card.addEventListener('click', () => showStoreDetails(storeId));
    });
}

// Create store card HTML
function createStoreCardHTML(store) {
    const statusColors = {
        open: 'success',
        closed: 'danger',
        maintenance: 'warning'
    };
    
    const statusIcons = {
        open: 'door-open',
        closed: 'door-closed',
        maintenance: 'tools'
    };
    
    const performanceColors = {
        'very-high': '#2ecc71',
        'high': '#3498db',
        'medium': '#f39c12',
        'low': '#e74c3c'
    };
    
    const performanceLabels = {
        'very-high': 'Excellent',
        'high': 'Good',
        'medium': 'Average',
        'low': 'Low'
    };
    
    return `
        <div class="store-card" data-store-id="${store.id}">
            <div class="store-card-header">
                <span class="store-category-badge category-badge ${store.category}">
                    ${store.category}
                </span>
                <span class="store-status">
                    <span class="status-dot ${store.status}"></span>
                    <span>${store.status.charAt(0).toUpperCase() + store.status.slice(1)}</span>
                </span>
            </div>
            <div class="store-card-body">
                <h3 class="store-name">${store.name}</h3>
                <div class="store-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${formatLocation(store.location)}</span>
                </div>
                <div class="store-details">
                    <div class="store-detail-item">
                        <span class="detail-label">Size</span>
                        <span class="detail-value">${store.size} sq.ft</span>
                    </div>
                    <div class="store-detail-item">
                        <span class="detail-label">Monthly Rent</span>
                        <span class="detail-value">₹ ${store.monthlyRent.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="store-detail-item">
                        <span class="detail-label">Revenue</span>
                        <span class="detail-value">₹ ${formatRevenue(store.revenue)}</span>
                    </div>
                    <div class="store-detail-item">
                        <span class="detail-label">Performance</span>
                        <span class="detail-value" style="color: ${performanceColors[store.performance]}">
                            ${performanceLabels[store.performance]}
                        </span>
                    </div>
                </div>
            </div>
            <div class="store-card-footer">
                <div class="store-info">
                    <div class="store-manager">
                        <span class="detail-label">Manager</span>
                        <span class="detail-value">${store.manager}</span>
                    </div>
                </div>
                <div class="store-actions">
                    <button class="store-action-btn" onclick="event.stopPropagation(); editStore('${store.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="store-action-btn" onclick="event.stopPropagation(); deleteStore('${store.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create store list HTML
function createStoreListHTML(store) {
    const statusColors = {
        open: 'success',
        closed: 'danger',
        maintenance: 'warning'
    };
    
    return `
        <div class="store-list-item" data-store-id="${store.id}">
            <div class="list-item-main">
                <div class="list-store-name">
                    <h4>${store.name}</h4>
                    <span class="store-category-badge category-badge ${store.category}">
                        ${store.category}
                    </span>
                </div>
                <div class="list-store-info">
                    <span><i class="fas fa-map-marker-alt"></i> ${formatLocation(store.location)}</span>
                    <span><i class="fas fa-user-tie"></i> ${store.manager}</span>
                    <span><i class="fas fa-rupee-sign"></i> ₹ ${formatRevenue(store.revenue)}</span>
                </div>
            </div>
            <div class="list-item-actions">
                <span class="store-status">
                    <span class="status-dot ${store.status}"></span>
                    <span>${store.status.charAt(0).toUpperCase() + store.status.slice(1)}</span>
                </span>
                <div class="store-actions">
                    <button class="store-action-btn" onclick="event.stopPropagation(); editStore('${store.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="store-action-btn" onclick="event.stopPropagation(); deleteStore('${store.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update top stores list
function updateTopStoresList() {
    const topStoresList = document.getElementById('topStoresList');
    
    // Sort stores by revenue and take top 5
    const topStores = [...storesData]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    let html = '';
    topStores.forEach((store, index) => {
        html += `
            <div class="top-store-item">
                <div class="top-store-info">
                    <div class="top-store-rank">${index + 1}</div>
                    <div class="top-store-name">${store.name}</div>
                </div>
                <div class="top-store-revenue">₹ ${formatRevenue(store.revenue)}</div>
            </div>
        `;
    });
    
    topStoresList.innerHTML = html;
}

// Update lease timeline
function updateLeaseTimeline() {
    const leaseTimeline = document.getElementById('leaseTimeline');
    
    // Sort stores by lease end date
    const upcomingLeases = [...storesData]
        .filter(store => {
            const daysUntilLease = daysBetween(new Date(), new Date(store.leaseEnd));
            return daysUntilLease <= 90; // Show leases expiring in next 90 days
        })
        .sort((a, b) => new Date(a.leaseEnd) - new Date(b.leaseEnd))
        .slice(0, 5);
    
    let html = '';
    upcomingLeases.forEach(store => {
        const daysUntilLease = daysBetween(new Date(), new Date(store.leaseEnd));
        let daysClass = 'normal';
        
        if (daysUntilLease <= 30) {
            daysClass = 'danger';
        } else if (daysUntilLease <= 60) {
            daysClass = 'warning';
        }
        
        html += `
            <div class="lease-item">
                <div class="lease-store">${store.name}</div>
                <div class="lease-days ${daysClass}">
                    ${daysUntilLease} days
                </div>
            </div>
        `;
    });
    
    leaseTimeline.innerHTML = html;
}

// Handle store search
function handleStoreSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredStores = [...storesData];
    } else {
        filteredStores = storesData.filter(store => 
            store.name.toLowerCase().includes(searchTerm) ||
            store.category.toLowerCase().includes(searchTerm) ||
            store.location.toLowerCase().includes(searchTerm) ||
            store.manager.toLowerCase().includes(searchTerm)
        );
    }
    
    updateStoresDisplay();
}

// Handle category filter
function handleCategoryFilter(e) {
    const category = e.target.dataset.category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    currentCategory = category;
    
    if (category === 'all') {
        filteredStores = [...storesData];
    } else {
        filteredStores = storesData.filter(store => store.category === category);
    }
    
    updateStoresDisplay();
}

// Handle view toggle
function handleViewToggle(e) {
    const view = e.target.dataset.view;
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    currentView = view;
    
    const storesGrid = document.getElementById('storesGrid');
    const storesList = document.getElementById('storesList');
    
    if (view === 'grid') {
        storesGrid.style.display = 'grid';
        storesList.style.display = 'none';
    } else {
        storesGrid.style.display = 'none';
        storesList.style.display = 'block';
    }
}

// Handle add store form submission
function handleAddStore(e) {
    e.preventDefault();
    
    const form = e.target;
    const storeData = {
        id: 'ST' + (100 + storesData.length + 1),
        name: document.getElementById('storeName').value,
        category: document.getElementById('storeCategory').value,
        location: document.getElementById('storeLocation').value,
        size: parseInt(document.getElementById('storeSize').value),
        monthlyRent: parseInt(document.getElementById('monthlyRent').value),
        manager: document.getElementById('storeManager').value,
        contact: document.getElementById('storeContact').value,
        description: document.getElementById('storeDescription').value,
        hours: document.getElementById('storeHours').value,
        status: 'open',
        revenue: Math.floor(Math.random() * 2000000) + 300000, // Random revenue for demo
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating 3.5-5.0
        leaseEnd: generateLeaseEndDate(),
        performance: ['low', 'medium', 'high', 'very-high'][Math.floor(Math.random() * 4)]
    };
    
    // Add to stores data
    storesData.unshift(storeData);
    filteredStores.unshift(storeData);
    
    // Close modal
    document.getElementById('addStoreModal').classList.remove('active');
    
    // Reset form
    form.reset();
    
    // Update UI
    updateStoresDisplay();
    updateTopStoresList();
    updateLeaseTimeline();
    updateStoreKPIs();
    updateStoreCharts();
    
    // Show success message
    showStoreNotification(`Store "${storeData.name}" added successfully!`, 'success');
    
    console.log('New store added:', storeData);
}

// Show store details
function showStoreDetails(storeId) {
    const store = storesData.find(s => s.id === storeId);
    if (!store) return;
    
    const modal = document.getElementById('storeDetailModal');
    const content = document.getElementById('storeDetailContent');
    
    // Populate store details
    content.innerHTML = createStoreDetailHTML(store);
    
    // Show modal
    modal.classList.add('active');
    
    // Add close button event listener
    document.getElementById('closeDetailModal').addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// Create store detail HTML
function createStoreDetailHTML(store) {
    const statusColors = {
        open: '#2ecc71',
        closed: '#e74c3c',
        maintenance: '#f39c12'
    };
    
    const performanceColors = {
        'very-high': '#2ecc71',
        'high': '#3498db',
        'medium': '#f39c12',
        'low': '#e74c3c'
    };
    
    const performanceLabels = {
        'very-high': 'Excellent',
        'high': 'Good',
        'medium': 'Average',
        'low': 'Low'
    };
    
    const daysUntilLease = daysBetween(new Date(), new Date(store.leaseEnd));
    let leaseStatus = 'Normal';
    if (daysUntilLease <= 30) leaseStatus = 'Expiring Soon';
    if (daysUntilLease <= 15) leaseStatus = 'Urgent';
    
    return `
        <div class="store-detail-header">
            <div class="store-detail-icon">
                <i class="fas fa-store"></i>
            </div>
            <div class="store-detail-title">
                <h2>${store.name}</h2>
                <span class="store-detail-category category-badge ${store.category}">
                    ${store.category}
                </span>
            </div>
        </div>
        
        <div class="store-detail-info">
            <div class="detail-info-group">
                <h4>Store Information</h4>
                <div class="detail-info-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${formatLocation(store.location)}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-label">Store Size</span>
                    <span class="detail-value">${store.size} sq.ft</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-label">Operating Hours</span>
                    <span class="detail-value">${store.hours}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value" style="color: ${statusColors[store.status]}">
                        ${store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                    </span>
                </div>
            </div>
            
            <div class="detail-info-group">
                <h4>Management</h4>
                <div class="detail-info-item">
                    <span class="detail-label">Manager</span>
                    <span class="detail-value">${store.manager}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-label">Contact</span>
                    <span class="detail-value">${store.contact}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-label">Monthly Rent</span>
                    <span class="detail-value">₹ ${store.monthlyRent.toLocaleString('en-IN')}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-label">Lease End</span>
                    <span class="detail-value">${formatDate(new Date(store.leaseEnd))} (${leaseStatus})</span>
                </div>
            </div>
        </div>
        
        <div class="store-performance">
            <h4>Performance Metrics</h4>
            <div class="performance-metrics">
                <div class="performance-metric">
                    <h5>Monthly Revenue</h5>
                    <div class="performance-value">₹ ${formatRevenue(store.revenue)}</div>
                </div>
                <div class="performance-metric">
                    <h5>Customer Rating</h5>
                    <div class="performance-value">${store.rating}/5.0</div>
                </div>
                <div class="performance-metric">
                    <h5>Performance</h5>
                    <div class="performance-value" style="color: ${performanceColors[store.performance]}">
                        ${performanceLabels[store.performance]}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="store-description">
            <h4>Description</h4>
            <p>${store.description}</p>
        </div>
        
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeStoreDetail()">
                Close
            </button>
            <button class="btn-primary" onclick="editStore('${store.id}')">
                <i class="fas fa-edit"></i> Edit Store
            </button>
        </div>
    `;
}

// Edit store
function editStore(storeId) {
    const store = storesData.find(s => s.id === storeId);
    if (!store) return;
    
    // Fill the add store form with existing data
    document.getElementById('storeName').value = store.name;
    document.getElementById('storeCategory').value = store.category;
    document.getElementById('storeLocation').value = store.location;
    document.getElementById('storeSize').value = store.size;
    document.getElementById('monthlyRent').value = store.monthlyRent;
    document.getElementById('storeManager').value = store.manager;
    document.getElementById('storeContact').value = store.contact;
    document.getElementById('storeDescription').value = store.description;
    document.getElementById('storeHours').value = store.hours;
    
    // Change form to update mode
    const form = document.getElementById('addStoreForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const modalTitle = document.querySelector('#addStoreModal h3');
    
    modalTitle.textContent = 'Edit Store';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Store';
    
    // Remove existing submit listener
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add new submit listener for update
    newForm.addEventListener('submit', (e) => handleUpdateStore(e, storeId));
    
    // Show modal
    document.getElementById('addStoreModal').classList.add('active');
}

// Handle update store
function handleUpdateStore(e, storeId) {
    e.preventDefault();
    
    const form = e.target;
    const storeIndex = storesData.findIndex(s => s.id === storeId);
    
    if (storeIndex === -1) return;
    
    // Update store data
    storesData[storeIndex] = {
        ...storesData[storeIndex],
        name: document.getElementById('storeName').value,
        category: document.getElementById('storeCategory').value,
        location: document.getElementById('storeLocation').value,
        size: parseInt(document.getElementById('storeSize').value),
        monthlyRent: parseInt(document.getElementById('monthlyRent').value),
        manager: document.getElementById('storeManager').value,
        contact: document.getElementById('storeContact').value,
        description: document.getElementById('storeDescription').value,
        hours: document.getElementById('storeHours').value
    };
    
    // Update filtered stores
    const filteredIndex = filteredStores.findIndex(s => s.id === storeId);
    if (filteredIndex !== -1) {
        filteredStores[filteredIndex] = storesData[storeIndex];
    }
    
    // Close modal
    document.getElementById('addStoreModal').classList.remove('active');
    
    // Reset form to add mode
    resetAddStoreForm();
    
    // Update UI
    updateStoresDisplay();
    updateTopStoresList();
    updateLeaseTimeline();
    
    // Show success message
    showStoreNotification(`Store "${storesData[storeIndex].name}" updated successfully!`, 'success');
}

// Delete store
function deleteStore(storeId) {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
        return;
    }
    
    const store = storesData.find(s => s.id === storeId);
    
    // Remove from stores data
    storesData = storesData.filter(s => s.id !== storeId);
    filteredStores = filteredStores.filter(s => s.id !== storeId);
    
    // Update UI
    updateStoresDisplay();
    updateTopStoresList();
    updateLeaseTimeline();
    updateStoreKPIs();
    
    // Show success message
    showStoreNotification(`Store "${store?.name}" deleted successfully!`, 'success');
}

// Reset add store form to default
function resetAddStoreForm() {
    const form = document.getElementById('addStoreForm');
    form.reset();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const modalTitle = document.querySelector('#addStoreModal h3');
    
    modalTitle.textContent = 'Add New Store';
    submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Store';
    
    // Remove any existing listeners and re-add the default one
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    newForm.addEventListener('submit', handleAddStore);
}

// Close store detail modal
function closeStoreDetail() {
    document.getElementById('storeDetailModal').classList.remove('active');
}

// Reset all filters
function resetFilters() {
    currentCategory = 'all';
    filteredStores = [...storesData];
    
    // Update UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        }
    });
    
    // Clear search
    document.getElementById('storeSearch').value = '';
    
    updateStoresDisplay();
}

// Update store KPIs
function updateStoreKPIs() {
    const totalStores = storesData.length;
    const openStores = storesData.filter(s => s.status === 'open').length;
    const closedStores = storesData.filter(s => s.status === 'closed').length;
    
    // Update KPI values
    document.querySelector('.store-kpi-card:first-child .store-kpi-value').textContent = totalStores;
    
    // Update status summary in sidebar
    document.querySelector('.status-item.open .status-count').textContent = openStores;
    document.querySelector('.status-item.closed .status-count').textContent = closedStores;
    
    // Update occupancy rate
    const occupancyRate = Math.round((totalStores / 50) * 100); // Assuming 50 is max capacity
    document.querySelector('.store-kpi-card:nth-child(3) .store-kpi-value').textContent = `${occupancyRate}%`;
}

// Show store notification
function showStoreNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `store-notification-toast ${type}`;
    notification.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        </div>
        <div class="toast-content">
            <p>${message}</p>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.toast-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
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

function formatDate(date) {
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function daysBetween(date1, date2) {
    const diff = date2.getTime() - date1.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function generateLeaseEndDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + Math.floor(Math.random() * 24) + 3); // 3-27 months from now
    return date.toISOString().split('T')[0];
}

function updateCurrentDate() {
    const now = new Date();
    const dateRange = document.querySelector('.date-range');
    dateRange.textContent = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialize store management when page loads
document.addEventListener('DOMContentLoaded', initStoreManagement);