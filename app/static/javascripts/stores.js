// Store Management JavaScript with API Integration

// Store Data Structure
let storesData = [];
let filteredStores = [];
let currentCategory = 'all';
let currentView = 'grid';

// API Base URL - adjust based on your Django setup
const API_BASE = '/api';

// Initialize Store Management System
async function initStoreManagement() {
    // Load stores from API
    await loadStoresFromAPI();
    
    // Initialize UI components
    initStoreUI();
    
    // Setup event listeners
    setupStoreEventListeners();
    
    // Initialize charts
    await initStoreCharts();
    
    // Update store displays
    updateStoresDisplay();
    await updateTopStoresList();
    await updateLeaseTimeline();
    await updateStoreKPIs();
}

// Load stores from API
async function loadStoresFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/stores/`);
        const data = await response.json();
        
        if (data.success) {
            storesData = data.stores;
            filteredStores = [...storesData];
            console.log('Loaded stores from API:', storesData.length);
        } else {
            console.error('Failed to load stores:', data.error);
            // Load sample data as fallback
            loadSampleStores();
        }
    } catch (error) {
        console.error('Error loading stores from API:', error);
        // Load sample data as fallback
        loadSampleStores();
    }
}

// Load sample store data (fallback)
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
    if (searchInput) {
        searchInput.addEventListener('input', handleStoreSearch);
    }
    
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
    
    if (addStoreBtn) {
        addStoreBtn.addEventListener('click', () => {
            resetAddStoreForm();
            addStoreModal.classList.add('active');
        });
    }
    
    if (closeStoreModal) {
        closeStoreModal.addEventListener('click', () => {
            addStoreModal.classList.remove('active');
        });
    }
    
    if (cancelStoreBtn) {
        cancelStoreBtn.addEventListener('click', () => {
            addStoreModal.classList.remove('active');
        });
    }
    
    if (addStoreForm) {
        addStoreForm.addEventListener('submit', handleAddStore);
    }
    
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
    const manageLeasesBtn = document.getElementById('manageLeasesBtn');
    const maintenanceRequestsBtn = document.getElementById('maintenanceRequestsBtn');
    const rentCollectionBtn = document.getElementById('rentCollectionBtn');
    const storePerformanceBtn = document.getElementById('storePerformanceBtn');
    
    if (manageLeasesBtn) {
        manageLeasesBtn.addEventListener('click', () => {
            alert('Lease management feature will be implemented soon!');
        });
    }
    
    if (maintenanceRequestsBtn) {
        maintenanceRequestsBtn.addEventListener('click', () => {
            alert('Maintenance management feature will be implemented soon!');
        });
    }
    
    if (rentCollectionBtn) {
        rentCollectionBtn.addEventListener('click', () => {
            alert('Rent collection feature will be implemented soon!');
        });
    }
    
    if (storePerformanceBtn) {
        storePerformanceBtn.addEventListener('click', () => {
            alert('Performance reports feature will be implemented soon!');
        });
    }
    
    // Export button
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('Export feature will be implemented soon!');
        });
    }
    
    // Analytics period change
    const analyticsPeriod = document.getElementById('analyticsPeriod');
    if (analyticsPeriod) {
        analyticsPeriod.addEventListener('change', updateStoreCharts);
    }
    
    // Notification panel
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotifications = document.getElementById('closeNotifications');
    
    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', () => {
            notificationPanel.classList.toggle('active');
        });
    }
    
    if (closeNotifications && notificationPanel) {
        closeNotifications.addEventListener('click', () => {
            notificationPanel.classList.remove('active');
        });
    }
    
    // Mark all as read
    const markAllRead = document.querySelector('.mark-all-read');
    if (markAllRead) {
        markAllRead.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
            });
            const badge = document.querySelector('.notification-badge');
            if (badge) badge.textContent = '0';
        });
    }
}

// Initialize store charts
async function initStoreCharts() {
    try {
        const response = await fetch(`${API_BASE}/store-stats/`);
        const data = await response.json();
        
        if (data.success && data.stats.category_revenue) {
            const categoryRevenue = data.stats.category_revenue;
            const labels = Object.keys(categoryRevenue);
            const values = Object.values(categoryRevenue);
            
            const ctx = document.getElementById('categoryRevenueChart');
            if (ctx) {
                window.categoryRevenueChart = new Chart(ctx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: values,
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
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Update store charts
function updateStoreCharts() {
    if (!window.categoryRevenueChart) return;
    
    const period = document.getElementById('analyticsPeriod').value;
    
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
    
    if (!storesGrid || !storesList) return;
    
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
    document.querySelectorAll('.store-card, .store-list-item').forEach(card => {
        const storeId = card.dataset.storeId;
        card.addEventListener('click', () => showStoreDetails(storeId));
    });
}

// Create store card HTML
function createStoreCardHTML(store) {
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
async function updateTopStoresList() {
    try {
        const response = await fetch(`${API_BASE}/top-stores/`);
        const data = await response.json();
        
        if (data.success) {
            const topStoresList = document.getElementById('topStoresList');
            if (!topStoresList) return;
            
            let html = '';
            data.top_stores.forEach((store, index) => {
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
    } catch (error) {
        console.error('Error updating top stores:', error);
    }
}

// Update lease timeline
async function updateLeaseTimeline() {
    try {
        const response = await fetch(`${API_BASE}/lease-timeline/`);
        const data = await response.json();
        
        if (data.success) {
            const leaseTimeline = document.getElementById('leaseTimeline');
            if (!leaseTimeline) return;
            
            let html = '';
            data.lease_timeline.forEach(lease => {
                const daysUntilLease = lease.days_until;
                let daysClass = 'normal';
                
                if (daysUntilLease <= 30) {
                    daysClass = 'danger';
                } else if (daysUntilLease <= 60) {
                    daysClass = 'warning';
                }
                
                html += `
                    <div class="lease-item">
                        <div class="lease-store">${lease.name}</div>
                        <div class="lease-days ${daysClass}">
                            ${daysUntilLease} days
                        </div>
                    </div>
                `;
            });
            
            leaseTimeline.innerHTML = html;
        }
    } catch (error) {
        console.error('Error updating lease timeline:', error);
    }
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
async function handleCategoryFilter(e) {
    const category = e.target.dataset.category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    currentCategory = category;
    
    // Reload data with filter
    try {
        const url = category === 'all' 
            ? `${API_BASE}/stores/` 
            : `${API_BASE}/stores/?category=${category}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            filteredStores = data.stores;
            updateStoresDisplay();
        }
    } catch (error) {
        console.error('Error filtering stores:', error);
        // Fallback to client-side filtering
        if (category === 'all') {
            filteredStores = [...storesData];
        } else {
            filteredStores = storesData.filter(store => store.category === category);
        }
        updateStoresDisplay();
    }
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
async function handleAddStore(e) {
    e.preventDefault();
    
    const formData = {
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
    
    try {
        const response = await fetch(`${API_BASE}/stores/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close modal
            document.getElementById('addStoreModal').classList.remove('active');
            
            // Reset form
            document.getElementById('addStoreForm').reset();
            
            // Reload stores
            await loadStoresFromAPI();
            
            // Update UI
            updateStoresDisplay();
            await updateTopStoresList();
            await updateLeaseTimeline();
            await updateStoreKPIs();
            await updateStoreCharts();
            
            // Show success message
            showStoreNotification(`Store "${formData.name}" added successfully!`, 'success');
        } else {
            showStoreNotification(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Error adding store:', error);
        showStoreNotification('Failed to add store. Please try again.', 'error');
    }
}

// Show store details
async function showStoreDetails(storeId) {
    try {
        const response = await fetch(`${API_BASE}/stores/${storeId}/`);
        const data = await response.json();
        
        if (data.success) {
            const modal = document.getElementById('storeDetailModal');
            const content = document.getElementById('storeDetailContent');
            
            // Populate store details
            content.innerHTML = createStoreDetailHTML(data.store);
            
            // Show modal
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading store details:', error);
        showStoreNotification('Failed to load store details', 'error');
    }
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
                    <span class="detail-value">${store.location_display || formatLocation(store.location)}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-label">Store Size</span>
                    <span class="detail-value">${store.size} sq.ft</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-label">Operating Hours</span>
                    <span class="detail-value">${store.hours || '10:00 AM - 9:00 PM'}</span>
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
                    <span class="detail-value">${store.owner || store.manager}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-label">Contact</span>
                    <span class="detail-value">${store.contact_email || store.contact}</span>
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
        
        ${store.description ? `
        <div class="store-description">
            <h4>Description</h4>
            <p>${store.description}</p>
        </div>
        ` : ''}
        
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
async function editStore(storeId) {
    try {
        const response = await fetch(`${API_BASE}/stores/${storeId}/`);
        const data = await response.json();
        
        if (data.success) {
            const store = data.store;
            
            // Fill the form with existing data
            document.getElementById('storeName').value = store.name;
            document.getElementById('storeCategory').value = store.category;
            document.getElementById('storeLocation').value = store.location;
            document.getElementById('storeSize').value = store.size;
            document.getElementById('monthlyRent').value = store.monthlyRent;
            document.getElementById('storeManager').value = store.owner || store.manager;
            document.getElementById('storeContact').value = store.contact_email || store.contact;
            document.getElementById('storeDescription').value = store.description || '';
            document.getElementById('storeHours').value = store.hours || '10:00 AM - 9:00 PM';
            
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
            
            // Close detail modal if open
            document.getElementById('storeDetailModal').classList.remove('active');
            
            // Show edit modal
            document.getElementById('addStoreModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading store for edit:', error);
        showStoreNotification('Failed to load store details', 'error');
    }
}

// Handle update store
async function handleUpdateStore(e, storeId) {
    e.preventDefault();
    
    const formData = {
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
    
    try {
        const response = await fetch(`${API_BASE}/stores/${storeId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close modal
            document.getElementById('addStoreModal').classList.remove('active');
            
            // Reset form to add mode
            resetAddStoreForm();
            
            // Reload stores
            await loadStoresFromAPI();
            
            // Update UI
            updateStoresDisplay();
            await updateTopStoresList();
            await updateLeaseTimeline();
            
            // Show success message
            showStoreNotification(`Store "${formData.name}" updated successfully!`, 'success');
        } else {
            showStoreNotification(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Error updating store:', error);
        showStoreNotification('Failed to update store. Please try again.', 'error');
    }
}

// Delete store
async function deleteStore(storeId) {
    const store = storesData.find(s => s.id === storeId);
    
    if (!confirm(`Are you sure you want to delete "${store?.name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/stores/${storeId}/`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload stores
            await loadStoresFromAPI();
            
            // Update UI
            updateStoresDisplay();
            await updateTopStoresList();
            await updateLeaseTimeline();
            await updateStoreKPIs();
            
            // Show success message
            showStoreNotification(data.message || `Store deleted successfully!`, 'success');
        } else {
            showStoreNotification(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Error deleting store:', error);
        showStoreNotification('Failed to delete store. Please try again.', 'error');
    }
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
async function resetFilters() {
    currentCategory = 'all';
    
    // Update UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        }
    });
    
    // Clear search
    document.getElementById('storeSearch').value = '';
    
    // Reload all stores
    await loadStoresFromAPI();
    updateStoresDisplay();
}

// Update store KPIs
async function updateStoreKPIs() {
    try {
        const response = await fetch(`${API_BASE}/store-stats/`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            
            // Update KPI values
            const kpiCards = document.querySelectorAll('.store-kpi-card');
            if (kpiCards[0]) {
                kpiCards[0].querySelector('.store-kpi-value').textContent = stats.total_stores;
            }
            if (kpiCards[1]) {
                kpiCards[1].querySelector('.store-kpi-value').textContent = `₹ ${formatRevenue(stats.avg_revenue)}`;
            }
            if (kpiCards[2]) {
                kpiCards[2].querySelector('.store-kpi-value').textContent = `${stats.occupancy_rate}%`;
            }
            if (kpiCards[3]) {
                kpiCards[3].querySelector('.store-kpi-value').textContent = stats.avg_rating.toFixed(1);
            }
            
            // Update status summary in sidebar
            const openCount = document.querySelector('.status-item.open .status-count');
            const closedCount = document.querySelector('.status-item.closed .status-count');
            
            if (openCount) openCount.textContent = stats.open_stores;
            if (closedCount) closedCount.textContent = stats.closed_stores;
        }
    } catch (error) {
        console.error('Error updating KPIs:', error);
    }
}

// Show store notification
function showStoreNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `store-notification-toast ${type}`;
    notification.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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
        '2F-West': 'Second Floor, West Wing',
        'ground_floor': 'Ground Floor',
        'first_floor': 'First Floor',
        'second_floor': 'Second Floor',
        'third_floor': 'Third Floor',
        'food_court': 'Food Court',
        'entertainment_zone': 'Entertainment Zone'
    };
    
    return mapping[locationCode] || locationCode;
}

function formatRevenue(revenue) {
    if (revenue >= 10000000) {
        return (revenue / 10000000).toFixed(1) + ' Cr';
    } else if (revenue >= 1000000) {
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

function updateCurrentDate() {
    const now = new Date();
    const dateRange = document.querySelector('.date-range');
    if (dateRange && dateRange.textContent.includes('Manage stores')) {
        // Keep the original subtitle
        return;
    }
}

// Initialize store management when page loads
document.addEventListener('DOMContentLoaded', initStoreManagement);