// Inventory Management JavaScript

// Inventory Data Structure
let inventoryData = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentStatus = 'all';
let currentSort = 'recent';
let currentPage = 1;
const itemsPerPage = 10;
let selectedProducts = new Set();

// Initialize Inventory Management System
function initInventoryManagement() {
    // Load sample inventory data
    loadSampleInventory();
    
    // Initialize UI components
    initInventoryUI();
    
    // Setup event listeners
    setupInventoryEventListeners();
    
    // Initialize charts
    initInventoryCharts();
    
    // Update inventory displays
    updateInventoryKPIs();
    updateProductsTable();
    updateStockAlerts();
    updateInventoryInsights();
}

// Load sample inventory data
function loadSampleInventory() {
    const productNames = [
        'Wireless Headphones', 'Smartphone Case', 'Laptop Bag', 'Bluetooth Speaker',
        'Designer T-Shirt', 'Jeans', 'Running Shoes', 'Leather Jacket',
        'Premium Coffee', 'Organic Tea', 'Gourmet Chocolate', 'Energy Bars',
        'LED Desk Lamp', 'Air Purifier', 'Smart Watch', 'Fitness Tracker',
        'Face Cream', 'Perfume', 'Hair Dryer', 'Electric Shaver',
        'Yoga Mat', 'Dumbbell Set', 'Sports Water Bottle', 'Running Shorts',
        'Novel Book', 'Journal', 'Pen Set', 'Backpack'
    ];
    
    const categories = ['electronics', 'fashion', 'food', 'home', 'beauty', 'sports', 'books'];
    const stores = ['ST001', 'ST002', 'ST003', 'ST004', 'ST005', 'ST006', 'ST007'];
    const storeNames = {
        'ST001': 'ElectroTech',
        'ST002': 'Fashion Hub',
        'ST003': 'Coffee Brew',
        'ST004': 'Sports Zone',
        'ST005': 'Home & Living',
        'ST006': 'Beauty Glow',
        'ST007': 'Book Haven'
    };
    
    const suppliers = ['TechSupplies Inc.', 'FashionDist Co.', 'FoodImport Ltd.', 'HomeGoods Corp.', 'BeautyGlow Suppliers', 'SportsGear Ltd.', 'BookWorld Distributors', 'ElectroParts Global', 'PremiumFashion Group', 'OrganicFoods Co.'];
    
    const now = luxon.DateTime.now();
    inventoryData = [];

    for (let i = 0; i < 150; i++) {
        const name = productNames[Math.floor(Math.random() * productNames.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const storeId = stores[Math.floor(Math.random() * stores.length)];
        const storeName = storeNames[storeId];
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        
        const unitCost = Math.floor(Math.random() * 5000) + 100;
        const unitPrice = Math.floor(unitCost * (1.3 + Math.random() * 0.5)); // 30-80% markup
        const currentStock = Math.floor(Math.random() * 200);
        const minStock = Math.floor(Math.random() * 20) + 5;
        const reorderLevel = minStock * 2;
        const maxStock = reorderLevel * 3;
        
        // Determine stock status
        let status = 'in-stock';
        if (currentStock === 0) {
            status = 'out-of-stock';
        } else if (currentStock <= minStock) {
            status = 'low-stock';
        } else if (currentStock <= reorderLevel) {
            status = 'medium-stock';
        }
        
        // Calculate stock value
        const stockValue = currentStock * unitCost;
        
        // Generate random movement data
        const lastMonthSales = Math.floor(Math.random() * 50);
        const thisMonthSales = Math.floor(lastMonthSales * (0.8 + Math.random() * 0.4)); // 80-120% of last month
        
        inventoryData.push({
            id: `PROD${1000 + i}`,
            sku: `SKU-${category.toUpperCase().substring(0, 3)}-${1000 + i}`,
            name: name,
            category: category,
            storeId: storeId,
            storeName: storeName,
            brand: getRandomBrand(category),
            supplier: supplier,
            unitCost: unitCost,
            unitPrice: unitPrice,
            currentStock: currentStock,
            minStock: minStock,
            reorderLevel: reorderLevel,
            maxStock: maxStock,
            stockValue: stockValue,
            status: status,
            location: `Aisle ${Math.floor(Math.random() * 10) + 1}, Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
            weight: (Math.random() * 5).toFixed(2),
            description: `${name} - High quality product for everyday use.`,
            lastUpdated: now.minus({ days: Math.floor(Math.random() * 30) }).toISODate(),
            settings: {
                trackInventory: true,
                allowBackorder: Math.random() > 0.3,
                autoReorder: Math.random() > 0.2
            },
            salesData: {
                lastMonth: lastMonthSales,
                thisMonth: thisMonthSales,
                totalSales: lastMonthSales + thisMonthSales + Math.floor(Math.random() * 100)
            },
            movementRate: (thisMonthSales / currentStock * 30).toFixed(2) // Sales per month per unit
        });
    }

    // Sort by last updated (newest first)
    inventoryData.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    filteredProducts = [...inventoryData];
}

// Initialize UI components
function initInventoryUI() {
    // Initialize search functionality
    const searchInput = document.getElementById('inventorySearch');
    searchInput.addEventListener('input', handleInventorySearch);
    
    // Initialize category filter
    document.getElementById('inventoryCategoryFilter').addEventListener('change', handleCategoryFilter);
    
    // Initialize status filter
    document.getElementById('inventoryStatusFilter').addEventListener('change', handleStatusFilter);
    
    // Initialize sort dropdown
    document.getElementById('productSort').addEventListener('change', handleProductSort);
    
    // Populate store dropdown in add product modal
    populateStoreDropdown();
    
    // Populate supplier dropdown in add product modal
    populateSupplierDropdown();
    
    // Populate stock in modal dropdowns
    populateStockInDropdowns();
}

// Setup event listeners
function setupInventoryEventListeners() {
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const addProductForm = document.getElementById('addProductForm');
    
    addProductBtn.addEventListener('click', () => {
        addProductModal.classList.add('active');
    });
    
    closeProductModal.addEventListener('click', () => {
        addProductModal.classList.remove('active');
        resetProductForm();
    });
    
    cancelProductBtn.addEventListener('click', () => {
        addProductModal.classList.remove('active');
        resetProductForm();
    });
    
    addProductForm.addEventListener('submit', handleAddProduct);
    
    // Bulk update button
    const bulkUpdateBtn = document.getElementById('bulkUpdateBtn');
    const bulkUpdateModal = document.getElementById('bulkUpdateModal');
    const closeBulkUpdateModal = document.getElementById('closeBulkUpdateModal');
    const cancelBulkUpdateBtn = document.getElementById('cancelBulkUpdateBtn');
    const bulkUpdateForm = document.getElementById('bulkUpdateForm');
    
    bulkUpdateBtn.addEventListener('click', () => {
        if (selectedProducts.size === 0) {
            showNotification('Please select products first by checking the boxes', 'warning');
            return;
        }
        bulkUpdateModal.classList.add('active');
        updateSelectedCount();
    });
    
    closeBulkUpdateModal.addEventListener('click', () => {
        bulkUpdateModal.classList.remove('active');
    });
    
    cancelBulkUpdateBtn.addEventListener('click', () => {
        bulkUpdateModal.classList.remove('active');
    });
    
    bulkUpdateForm.addEventListener('submit', handleBulkUpdate);
    
    // Stock operations
    document.getElementById('stockInBtn').addEventListener('click', () => {
        openStockInModal();
    });
    
    document.getElementById('stockOutBtn').addEventListener('click', () => {
        showNotification('Stock out feature will be implemented soon!', 'info');
    });
    
    document.getElementById('stockTransferBtn').addEventListener('click', () => {
        showNotification('Stock transfer feature will be implemented soon!', 'info');
    });
    
    document.getElementById('stockTakeBtn').addEventListener('click', () => {
        showNotification('Stock take feature will be implemented soon!', 'info');
    });
    
    // Export inventory
    document.getElementById('exportInventoryBtn').addEventListener('click', () => {
        exportInventoryData();
    });
    
    // Pagination
    document.getElementById('prevPageBtn').addEventListener('click', goToPrevPage);
    document.getElementById('nextPageBtn').addEventListener('click', goToNextPage);
    
    // Insights tabs
    document.querySelectorAll('.insights-tab').forEach(tab => {
        tab.addEventListener('click', handleInsightsTabChange);
    });
    
    // Stock chart store filter
    document.getElementById('stockChartStore').addEventListener('change', updateStockLevelChart);
    
    // Select all checkbox
    document.getElementById('selectAllProducts').addEventListener('change', handleSelectAll);
    
    // Product detail modal close
    document.getElementById('closeDetailModal').addEventListener('click', () => {
        document.getElementById('productDetailModal').classList.remove('active');
    });
    
    // Stock in modal close
    document.getElementById('closeStockInModal').addEventListener('click', () => {
        document.getElementById('stockInModal').classList.remove('active');
    });
    
    // Cancel stock in
    document.getElementById('cancelStockInBtn').addEventListener('click', () => {
        document.getElementById('stockInModal').classList.remove('active');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const modals = ['addProductModal', 'productDetailModal', 'stockInModal', 'bulkUpdateModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && e.target === modal) {
                modal.classList.remove('active');
                if (modalId === 'addProductModal') {
                    resetProductForm();
                }
            }
        });
    });
    
    // Notification panel
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotifications = document.getElementById('closeNotifications');
    
    if (notificationBtn && notificationPanel) {
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
    
    // View categories button
    document.getElementById('viewCategoriesBtn').addEventListener('click', () => {
        alert('Categories view will be implemented soon!');
    });
}

// Initialize inventory charts
function initInventoryCharts() {
    // Stock Level Chart
    const stockCtx = document.getElementById('stockLevelChart').getContext('2d');
    window.stockLevelChart = new Chart(stockCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Current Stock',
                    data: [],
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: 'Reorder Level',
                    data: [],
                    backgroundColor: 'rgba(243, 156, 18, 0.7)',
                    borderColor: '#f39c12',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
    
    // Category Distribution Chart
    const categoryCtx = document.getElementById('categoryDistributionChart').getContext('2d');
    window.categoryDistributionChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
    
    // Movement Trend Chart
    const movementCtx = document.getElementById('movementTrendChart').getContext('2d');
    window.movementTrendChart = new Chart(movementCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Stock In',
                    data: [],
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Stock Out',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
    
    // Slow Movers Chart
    const slowCtx = document.getElementById('slowMoversChart').getContext('2d');
    window.slowMoversChart = new Chart(slowCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Days in Stock',
                data: [],
                backgroundColor: 'rgba(243, 156, 18, 0.7)',
                borderColor: '#f39c12',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
    
    // Reorder Analysis Chart
    const reorderCtx = document.getElementById('reorderAnalysisChart').getContext('2d');
    window.reorderAnalysisChart = new Chart(reorderCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Products',
                data: [],
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: '#4361ee',
                borderWidth: 1,
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw.name}: ${context.raw.x} units, ${context.raw.y} days`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Current Stock'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Days of Supply'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
    
    // Supplier Performance Chart
    const supplierCtx = document.getElementById('supplierPerformanceChart').getContext('2d');
    window.supplierPerformanceChart = new Chart(supplierCtx, {
        type: 'radar',
        data: {
            labels: ['On-time Delivery', 'Quality', 'Price', 'Communication', 'Returns'],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
    
    // Update all charts
    updateInventoryCharts();
}

// Update inventory charts
function updateInventoryCharts() {
    updateStockLevelChart();
    updateCategoryDistributionChart();
    updateMovementTrendChart();
    updateSlowMoversChart();
    updateReorderAnalysisChart();
    updateSupplierPerformanceChart();
    updateTopMoversList();
    updateAttentionList();
    updateReorderAlerts();
    updateSupplierRatings();
}

// Update stock level chart
function updateStockLevelChart() {
    const storeFilter = document.getElementById('stockChartStore').value;
    let productsToShow = inventoryData;
    
    if (storeFilter !== 'all') {
        productsToShow = inventoryData.filter(product => product.storeId === storeFilter);
    }
    
    // Take top 10 products by stock value
    const topProducts = [...productsToShow]
        .sort((a, b) => b.stockValue - a.stockValue)
        .slice(0, 10);
    
    if (window.stockLevelChart) {
        window.stockLevelChart.data.labels = topProducts.map(p => p.name.substring(0, 15) + '...');
        window.stockLevelChart.data.datasets[0].data = topProducts.map(p => p.currentStock);
        window.stockLevelChart.data.datasets[1].data = topProducts.map(p => p.reorderLevel);
        window.stockLevelChart.update();
    }
}

// Update category distribution chart
function updateCategoryDistributionChart() {
    const categories = {};
    let totalValue = 0;
    
    inventoryData.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = {
                count: 0,
                value: 0
            };
        }
        categories[product.category].count++;
        categories[product.category].value += product.stockValue;
        totalValue += product.stockValue;
    });
    
    const categoryColors = {
        'electronics': '#3498db',
        'fashion': '#9b59b6',
        'food': '#2ecc71',
        'home': '#f39c12',
        'beauty': '#e74c3c',
        'sports': '#1abc9c',
        'books': '#95a5a6'
    };
    
    const sortedCategories = Object.entries(categories)
        .sort((a, b) => b[1].value - a[1].value);
    
    if (window.categoryDistributionChart) {
        window.categoryDistributionChart.data.labels = sortedCategories.map(c => 
            c[0].charAt(0).toUpperCase() + c[0].slice(1)
        );
        window.categoryDistributionChart.data.datasets[0].data = sortedCategories.map(c => c[1].value);
        window.categoryDistributionChart.data.datasets[0].backgroundColor = sortedCategories.map(c => 
            categoryColors[c[0]] || '#6c757d'
        );
        window.categoryDistributionChart.update();
    }
}

// Update movement trend chart
function updateMovementTrendChart() {
    // Generate last 7 days of data
    const now = luxon.DateTime.now();
    const labels = Array.from({ length: 7 }, (_, i) => {
        const date = now.minus({ days: 6 - i });
        return date.toFormat('EEE');
    });
    
    // Simulated stock movement data
    const stockInData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 20);
    const stockOutData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 15);
    
    if (window.movementTrendChart) {
        window.movementTrendChart.data.labels = labels;
        window.movementTrendChart.data.datasets[0].data = stockInData;
        window.movementTrendChart.data.datasets[1].data = stockOutData;
        window.movementTrendChart.update();
    }
}

// Update slow movers chart
function updateSlowMoversChart() {
    // Find slow moving products (movement rate < 0.5)
    const slowMovers = inventoryData
        .filter(product => parseFloat(product.movementRate) < 0.5)
        .sort((a, b) => parseFloat(a.movementRate) - parseFloat(b.movementRate))
        .slice(0, 8);
    
    if (window.slowMoversChart) {
        window.slowMoversChart.data.labels = slowMovers.map(p => p.name.substring(0, 12) + '...');
        window.slowMoversChart.data.datasets[0].data = slowMovers.map(p => 
            Math.floor(p.currentStock / parseFloat(p.movementRate))
        );
        window.slowMoversChart.update();
    }
}

// Update reorder analysis chart
function updateReorderAnalysisChart() {
    // Calculate days of supply for each product
    const reorderData = inventoryData.map(product => {
        const daysOfSupply = product.currentStock > 0 ? 
            Math.floor(product.currentStock / (parseFloat(product.movementRate) || 1)) : 
            0;
        
        return {
            x: product.currentStock,
            y: daysOfSupply,
            name: product.name
        };
    });
    
    if (window.reorderAnalysisChart) {
        window.reorderAnalysisChart.data.datasets[0].data = reorderData;
        window.reorderAnalysisChart.update();
    }
}

// Update supplier performance chart
function updateSupplierPerformanceChart() {
    const suppliers = {};
    
    // Group products by supplier
    inventoryData.forEach(product => {
        if (!suppliers[product.supplier]) {
            suppliers[product.supplier] = {
                products: [],
                ratings: []
            };
        }
        suppliers[product.supplier].products.push(product);
    });
    
    // Calculate performance metrics for each supplier
    const supplierDatasets = [];
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];
    let colorIndex = 0;
    
    for (const [supplierName, data] of Object.entries(suppliers)) {
        if (data.products.length >= 3) { // Only show suppliers with at least 3 products
            // Simulated performance metrics
            const metrics = [
                Math.floor(Math.random() * 30) + 70, // On-time delivery
                Math.floor(Math.random() * 30) + 70, // Quality
                Math.floor(Math.random() * 30) + 70, // Price
                Math.floor(Math.random() * 30) + 70, // Communication
                Math.floor(Math.random() * 30) + 70  // Returns
            ];
            
            supplierDatasets.push({
                label: supplierName,
                data: metrics,
                backgroundColor: `rgba(${hexToRgb(colors[colorIndex % colors.length])}, 0.2)`,
                borderColor: colors[colorIndex % colors.length],
                borderWidth: 2,
                pointBackgroundColor: colors[colorIndex % colors.length]
            });
            
            colorIndex++;
        }
    }
    
    if (window.supplierPerformanceChart) {
        window.supplierPerformanceChart.data.datasets = supplierDatasets.slice(0, 5); // Limit to 5 suppliers
        window.supplierPerformanceChart.update();
    }
}

// Update top movers list
function updateTopMoversList() {
    const topMovers = [...inventoryData]
        .filter(product => product.salesData.thisMonth > 0)
        .sort((a, b) => b.salesData.thisMonth - a.salesData.thisMonth)
        .slice(0, 5);
    
    const topMoversList = document.getElementById('topMoversList');
    if (topMoversList) {
        let html = '';
        
        topMovers.forEach(product => {
            const growth = ((product.salesData.thisMonth - product.salesData.lastMonth) / 
                          product.salesData.lastMonth * 100).toFixed(1);
            const growthClass = growth >= 0 ? 'positive' : 'negative';
            const growthSymbol = growth >= 0 ? '+' : '';
            
            html += `
                <div class="mover-item">
                    <div class="mover-info">
                        <div class="mover-name">${product.name}</div>
                    </div>
                    <div class="movement-change ${growthClass}">
                        ${growthSymbol}${growth}%
                    </div>
                </div>
            `;
        });
        
        topMoversList.innerHTML = html;
    }
}

// Update attention list
function updateAttentionList() {
    // Products that need attention (low stock or slow moving)
    const attentionProducts = inventoryData
        .filter(product => 
            product.status === 'low-stock' || 
            parseFloat(product.movementRate) < 0.3 ||
            product.currentStock === 0
        )
        .slice(0, 5);
    
    const attentionList = document.getElementById('attentionList');
    if (attentionList) {
        let html = '';
        
        attentionProducts.forEach(product => {
            let issue = '';
            let action = '';
            
            if (product.status === 'low-stock') {
                issue = `Low stock: ${product.currentStock} units`;
                action = 'Reorder now';
            } else if (product.currentStock === 0) {
                issue = 'Out of stock';
                action = 'Urgent reorder';
            } else if (parseFloat(product.movementRate) < 0.3) {
                issue = 'Slow moving';
                action = 'Review pricing';
            }
            
            html += `
                <div class="attention-item">
                    <div class="attention-product">${product.name}</div>
                    <div class="attention-details">
                        <span>${issue}</span>
                        <span>${product.movementRate} moves/day</span>
                    </div>
                    <div class="attention-action">
                        <a href="#" class="action-link" onclick="takeAction('${product.id}')">${action}</a>
                    </div>
                </div>
            `;
        });
        
        attentionList.innerHTML = html;
    }
}

// Update reorder alerts
function updateReorderAlerts() {
    // Products below reorder level
    const reorderProducts = inventoryData
        .filter(product => product.currentStock <= product.reorderLevel)
        .sort((a, b) => a.currentStock - b.currentStock)
        .slice(0, 5);
    
    const reorderAlerts = document.getElementById('reorderAlerts');
    if (reorderAlerts) {
        let html = '';
        
        reorderProducts.forEach(product => {
            const urgency = product.currentStock <= product.minStock ? 'critical' : 'high';
            const daysLeft = Math.floor(product.currentStock / (parseFloat(product.movementRate) || 1));
            
            html += `
                <div class="alert-item-card ${urgency}">
                    <div class="alert-product">${product.name}</div>
                    <div class="alert-details-card">
                        Current: ${product.currentStock} units | 
                        Reorder at: ${product.reorderLevel} units |
                        ~${daysLeft} days left
                    </div>
                    <span class="alert-urgency ${urgency}">
                        ${urgency === 'critical' ? 'Critical' : 'High Priority'}
                    </span>
                </div>
            `;
        });
        
        reorderAlerts.innerHTML = html;
    }
}

// Update supplier ratings
function updateSupplierRatings() {
    const suppliers = {};
    
    // Group products by supplier and calculate average metrics
    inventoryData.forEach(product => {
        if (!suppliers[product.supplier]) {
            suppliers[product.supplier] = {
                productCount: 0,
                totalValue: 0,
                rating: (Math.random() * 2 + 3).toFixed(1) // 3-5 star rating
            };
        }
        suppliers[product.supplier].productCount++;
        suppliers[product.supplier].totalValue += product.stockValue;
    });
    
    const topSuppliers = Object.entries(suppliers)
        .sort((a, b) => b[1].totalValue - a[1].totalValue)
        .slice(0, 5);
    
    const supplierRatings = document.getElementById('supplierRatings');
    if (supplierRatings) {
        let html = '';
        
        topSuppliers.forEach(([supplierName, data]) => {
            const stars = Math.floor(parseFloat(data.rating));
            const starHTML = '★'.repeat(stars) + '☆'.repeat(5 - stars);
            
            html += `
                <div class="rating-item">
                    <div class="supplier-name">${supplierName}</div>
                    <div class="supplier-rating">
                        ${starHTML}
                        <span>${data.rating}</span>
                    </div>
                    <div class="supplier-stats">
                        ${data.productCount} products<br>
                        ₹ ${formatCurrency(data.totalValue)}
                    </div>
                </div>
            `;
        });
        
        supplierRatings.innerHTML = html;
    }
}

// Update inventory KPIs
function updateInventoryKPIs() {
    const totalProducts = inventoryData.length;
    
    // Inventory value
    const inventoryValue = inventoryData.reduce((sum, product) => sum + product.stockValue, 0);
    
    // Turnover rate (cost of goods sold / average inventory)
    const totalSalesValue = inventoryData.reduce((sum, product) => 
        sum + (product.salesData.totalSales * product.unitCost), 0);
    const avgInventoryValue = inventoryValue / 2; // Simplified
    const turnoverRate = avgInventoryValue > 0 ? (totalSalesValue / avgInventoryValue * 100).toFixed(1) : 0;
    
    // Stock coverage (days of supply)
    const totalDailySales = inventoryData.reduce((sum, product) => 
        sum + (parseFloat(product.movementRate) || 0), 0);
    const stockCoverage = totalDailySales > 0 ? Math.floor(inventoryData.length / totalDailySales) : 0;
    
    // Update KPI elements
    const totalProductsEl = document.getElementById('totalProducts');
    const inventoryValueEl = document.getElementById('inventoryValue');
    const turnoverRateEl = document.getElementById('turnoverRate');
    const stockCoverageEl = document.getElementById('stockCoverage');
    
    if (totalProductsEl) totalProductsEl.textContent = totalProducts.toLocaleString('en-IN');
    if (inventoryValueEl) inventoryValueEl.textContent = `₹ ${formatCurrency(inventoryValue)}`;
    if (turnoverRateEl) turnoverRateEl.textContent = `${turnoverRate}%`;
    if (stockCoverageEl) stockCoverageEl.textContent = `${stockCoverage} days`;
}

// Update products table
function updateProductsTable() {
    const tableBody = document.getElementById('productsTable');
    if (!tableBody) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredProducts.slice(startIndex, endIndex);
    
    let html = '';
    
    if (currentData.length === 0) {
        html = `
            <tr>
                <td colspan="12" class="empty-state">
                    <i class="fas fa-boxes"></i>
                    <p>No products found</p>
                </td>
            </tr>
        `;
    } else {
        currentData.forEach(product => {
            const isSelected = selectedProducts.has(product.id);
            const stockClass = getStockClass(product.currentStock, product.minStock, product.reorderLevel);
            const stockPercentage = product.maxStock ? 
                Math.min(100, Math.round((product.currentStock / product.maxStock) * 100)) : 
                Math.round((product.currentStock / (product.reorderLevel * 2)) * 100);
            
            html += `
                <tr class="product-row ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
                    <td>
                        <input type="checkbox" class="product-checkbox" data-product-id="${product.id}" ${isSelected ? 'checked' : ''}>
                    </td>
                    <td>
                        <div class="product-info">
                            <div class="product-image">
                                <i class="fas fa-box"></i>
                            </div>
                            <div class="product-details">
                                <h4>${product.name}</h4>
                                <div class="sku">${product.brand || 'No brand'}</div>
                            </div>
                        </div>
                    </td>
                    <td>${product.sku}</td>
                    <td>
                        <span class="category-badge ${product.category}">
                            ${product.category}
                        </span>
                    </td>
                    <td>${product.storeName}</td>
                    <td>
                        <div class="stock-level">
                            <span class="stock-indicator ${stockClass}"></span>
                            <span class="stock-value ${stockClass}">${product.currentStock}</span>
                        </div>
                    </td>
                    <td>${product.minStock}</td>
                    <td>${product.reorderLevel}</td>
                    <td>₹ ${product.unitPrice.toLocaleString('en-IN')}</td>
                    <td><strong>₹ ${product.stockValue.toLocaleString('en-IN')}</strong></td>
                    <td>
                        <span class="status-badge ${product.status}">
                            ${getStatusLabel(product.status)}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="action-icon-btn view" onclick="viewProduct('${product.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-icon-btn edit" onclick="editProduct('${product.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-icon-btn restock" onclick="restockProduct('${product.id}')">
                                <i class="fas fa-arrow-down"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = html;
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.product-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleProductCheckbox);
    });
    
    // Update pagination
    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const showingCountSpan = document.getElementById('showingCount');
    const totalCountSpan = document.getElementById('totalCount');
    
    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
    if (showingCountSpan) showingCountSpan.textContent = Math.min(filteredProducts.length, currentPage * itemsPerPage);
    if (totalCountSpan) totalCountSpan.textContent = filteredProducts.length;
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Update stock alerts
function updateStockAlerts() {
    const lowStockCount = inventoryData.filter(product => product.status === 'low-stock').length;
    const outOfStockCount = inventoryData.filter(product => product.status === 'out-of-stock').length;
    
    const lowStockCountEl = document.getElementById('lowStockCount');
    const outOfStockCountEl = document.getElementById('outOfStockCount');
    
    if (lowStockCountEl) lowStockCountEl.textContent = lowStockCount;
    if (outOfStockCountEl) outOfStockCountEl.textContent = outOfStockCount;
}

// Update inventory insights tab
function updateInventoryInsights() {
    // This function is called when switching tabs
    // The charts are already updated in updateInventoryCharts()
}

// Handle inventory search
function handleInventorySearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredProducts = [...inventoryData];
    } else {
        filteredProducts = inventoryData.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.storeName.toLowerCase().includes(searchTerm) ||
            product.brand?.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    updateProductsTable();
}

// Handle category filter
function handleCategoryFilter(e) {
    const category = e.target.value;
    
    currentCategory = category;
    applyFilters();
}

// Handle status filter
function handleStatusFilter(e) {
    const status = e.target.value;
    
    currentStatus = status;
    applyFilters();
}

// Apply all filters
function applyFilters() {
    let filtered = [...inventoryData];
    
    if (currentCategory !== 'all') {
        filtered = filtered.filter(product => product.category === currentCategory);
    }
    
    if (currentStatus !== 'all') {
        if (currentStatus === 'in-stock') {
            filtered = filtered.filter(product => product.status === 'in-stock');
        } else if (currentStatus === 'low-stock') {
            filtered = filtered.filter(product => product.status === 'low-stock');
        } else if (currentStatus === 'out-of-stock') {
            filtered = filtered.filter(product => product.status === 'out-of-stock');
        } else if (currentStatus === 'discontinued') {
            filtered = filtered.filter(product => product.status === 'discontinued');
        }
    }
    
    filteredProducts = filtered;
    currentPage = 1;
    updateProductsTable();
}

// Handle product sort
function handleProductSort(e) {
    const sortBy = e.target.value;
    currentSort = sortBy;
    
    switch (sortBy) {
        case 'recent':
            filteredProducts.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'stock':
            filteredProducts.sort((a, b) => a.currentStock - b.currentStock);
            break;
        case 'value':
            filteredProducts.sort((a, b) => b.stockValue - a.stockValue);
            break;
        case 'sales':
            filteredProducts.sort((a, b) => b.salesData.totalSales - a.salesData.totalSales);
            break;
    }
    
    updateProductsTable();
}

// Handle add product
function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value;
    const sku = document.getElementById('productSKU').value;
    const category = document.getElementById('productCategory').value;
    const storeId = document.getElementById('productStore').value;
    const brand = document.getElementById('productBrand').value;
    const supplier = document.getElementById('productSupplier').value;
    const unitCost = parseFloat(document.getElementById('unitCost').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const currentStock = parseInt(document.getElementById('currentStock').value);
    const minStock = parseInt(document.getElementById('minStock').value);
    const reorderLevel = parseInt(document.getElementById('reorderLevel').value);
    const maxStock = document.getElementById('maxStock').value ? parseInt(document.getElementById('maxStock').value) : null;
    const description = document.getElementById('productDescription').value;
    const location = document.getElementById('productLocation').value;
    const weight = document.getElementById('productWeight').value ? parseFloat(document.getElementById('productWeight').value) : null;
    
    // Get store name from dropdown
    const storeSelect = document.getElementById('productStore');
    const selectedStoreOption = storeSelect.options[storeSelect.selectedIndex];
    const storeName = selectedStoreOption.textContent.split(' (')[0];
    
    // Determine stock status
    let status = 'in-stock';
    if (currentStock === 0) {
        status = 'out-of-stock';
    } else if (currentStock <= minStock) {
        status = 'low-stock';
    }
    
    const now = luxon.DateTime.now();
    const newProduct = {
        id: `PROD${1000 + inventoryData.length + 1}`,
        sku: sku,
        name: name,
        category: category,
        storeId: storeId,
        storeName: storeName,
        brand: brand,
        supplier: supplier,
        unitCost: unitCost,
        unitPrice: unitPrice,
        currentStock: currentStock,
        minStock: minStock,
        reorderLevel: reorderLevel,
        maxStock: maxStock,
        stockValue: currentStock * unitCost,
        status: status,
        location: location,
        weight: weight,
        description: description,
        lastUpdated: now.toISODate(),
        settings: {
            trackInventory: document.getElementById('trackInventory').checked,
            allowBackorder: document.getElementById('allowBackorder').checked,
            autoReorder: document.getElementById('autoReorder').checked
        },
        salesData: {
            lastMonth: 0,
            thisMonth: 0,
            totalSales: 0
        },
        movementRate: '0.00'
    };
    
    // Add to inventory data
    inventoryData.unshift(newProduct);
    
    // Reset form and close modal
    resetProductForm();
    document.getElementById('addProductModal').classList.remove('active');
    
    // Update UI
    filteredProducts = [...inventoryData];
    currentPage = 1;
    updateInventoryKPIs();
    updateProductsTable();
    updateStockAlerts();
    updateInventoryCharts();
    
    // Show success message
    showNotification('Product added successfully!', 'success');
}

// Handle bulk update
function handleBulkUpdate(e) {
    e.preventDefault();
    
    const field = document.getElementById('bulkUpdateField').value;
    const value = document.getElementById('bulkUpdateValue').value;
    
    if (!field || !value) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    // Update selected products
    selectedProducts.forEach(productId => {
        const product = inventoryData.find(p => p.id === productId);
        if (product) {
            switch (field) {
                case 'price':
                    const price = parseFloat(value);
                    if (!isNaN(price) && price > 0) {
                        product.unitPrice = price;
                    }
                    break;
                case 'category':
                    product.category = value;
                    break;
                case 'min_stock':
                    const minStock = parseInt(value);
                    if (!isNaN(minStock) && minStock >= 0) {
                        product.minStock = minStock;
                    }
                    break;
                case 'reorder_level':
                    const reorderLevel = parseInt(value);
                    if (!isNaN(reorderLevel) && reorderLevel >= 0) {
                        product.reorderLevel = reorderLevel;
                    }
                    break;
                case 'status':
                    if (['in-stock', 'low-stock', 'out-of-stock', 'discontinued'].includes(value)) {
                        product.status = value;
                    }
                    break;
            }
            
            // Update stock value
            product.stockValue = product.currentStock * product.unitCost;
            
            // Update status based on new stock levels
            if (field === 'status') {
                // Status was manually changed, don't auto-update
            } else {
                updateProductStatus(product);
            }
        }
    });
    
    // Close modal and reset
    document.getElementById('bulkUpdateModal').classList.remove('active');
    document.getElementById('bulkUpdateField').value = '';
    document.getElementById('bulkUpdateValue').value = '';
    
    // Clear selections
    selectedProducts.clear();
    document.getElementById('selectAllProducts').checked = false;
    
    // Update UI
    filteredProducts = [...inventoryData];
    updateProductsTable();
    updateInventoryKPIs();
    updateInventoryCharts();
    
    // Show success message
    showNotification(`${selectedProducts.size} products updated successfully!`, 'success');
}

// Update selected count display
function updateSelectedCount() {
    const selectedCountEl = document.getElementById('selectedProductsCount');
    if (selectedCountEl) {
        selectedCountEl.textContent = `${selectedProducts.size} products selected`;
    }
}

// View product details
function viewProduct(productId) {
    const product = inventoryData.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productDetailModal');
    const content = document.getElementById('productDetailContent');
    const title = document.getElementById('productDetailName');
    
    if (title) title.textContent = product.name;
    
    // Calculate stock progress
    const maxStockForProgress = product.maxStock || (product.reorderLevel * 2);
    const stockPercentage = Math.min(100, Math.round((product.currentStock / maxStockForProgress) * 100));
    const stockClass = getStockClass(product.currentStock, product.minStock, product.reorderLevel);
    
    // Calculate days of supply
    const dailySales = parseFloat(product.movementRate) || 0;
    const daysOfSupply = dailySales > 0 ? Math.floor(product.currentStock / dailySales) : '∞';
    
    const html = `
        <div class="product-detail-header">
            <div class="product-image-large">
                <i class="fas fa-box"></i>
            </div>
            <div class="product-detail-title">
                <h2>${product.name}</h2>
                <p class="product-detail-sku">${product.sku}</p>
                <span class="product-category-large ${product.category}">
                    ${product.category}
                </span>
            </div>
        </div>
        
        <div class="product-detail-grid">
            <div class="detail-group">
                <h4>Product Information</h4>
                <div class="detail-item">
                    <span class="detail-label">Brand</span>
                    <span class="detail-value">${product.brand || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Store</span>
                    <span class="detail-value">${product.storeName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Supplier</span>
                    <span class="detail-value">${product.supplier || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${product.location || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Weight</span>
                    <span class="detail-value">${product.weight ? `${product.weight} kg` : 'Not specified'}</span>
                </div>
            </div>
            
            <div class="detail-group">
                <h4>Pricing & Cost</h4>
                <div class="detail-item">
                    <span class="detail-label">Unit Cost</span>
                    <span class="detail-value">₹ ${product.unitCost.toLocaleString('en-IN')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Selling Price</span>
                    <span class="detail-value">₹ ${product.unitPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Margin</span>
                    <span class="detail-value">${((product.unitPrice - product.unitCost) / product.unitCost * 100).toFixed(1)}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Stock Value</span>
                    <span class="detail-value">₹ ${product.stockValue.toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>
        
        <div class="product-stats">
            <div class="stats-grid">
                <div class="stat-item-large">
                    <h5>Current Stock</h5>
                    <div class="stat-value-large">${product.currentStock}</div>
                </div>
                <div class="stat-item-large">
                    <h5>Minimum Level</h5>
                    <div class="stat-value-large">${product.minStock}</div>
                </div>
                <div class="stat-item-large">
                    <h5>Days of Supply</h5>
                    <div class="stat-value-large">${daysOfSupply}</div>
                </div>
            </div>
        </div>
        
        <div class="stock-status-card">
            <div class="stock-status-header">
                <h5>Stock Level</h5>
                <span class="status-badge ${product.status}">
                    ${getStatusLabel(product.status)}
                </span>
            </div>
            <div class="stock-progress">
                <div class="stock-progress-bar ${stockClass}" style="width: ${stockPercentage}%"></div>
            </div>
            <div class="stock-levels">
                <span>${product.minStock} min</span>
                <span>${product.reorderLevel} reorder</span>
                <span>${maxStockForProgress} max</span>
            </div>
        </div>
        
        <div class="detail-group">
            <h4>Product Description</h4>
            <p style="color: var(--text-color); font-size: 14px; line-height: 1.6;">
                ${product.description || 'No description available.'}
            </p>
        </div>
        
        <div class="form-actions" style="margin-top: 24px;">
            <button type="button" class="btn-secondary" onclick="closeProductDetail()">
                Close
            </button>
            <button type="button" class="btn-primary" onclick="editProduct('${product.id}')">
                <i class="fas fa-edit"></i> Edit Product
            </button>
        </div>
    `;
    
    if (content) content.innerHTML = html;
    if (modal) modal.classList.add('active');
}

// Edit product
function editProduct(productId) {
    const product = inventoryData.find(p => p.id === productId);
    if (!product) return;
    
    // Populate the add product form with existing data
    document.getElementById('productName').value = product.name;
    document.getElementById('productSKU').value = product.sku;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStore').value = product.storeId;
    document.getElementById('productBrand').value = product.brand || '';
    document.getElementById('productSupplier').value = product.supplier || '';
    document.getElementById('unitCost').value = product.unitCost;
    document.getElementById('unitPrice').value = product.unitPrice;
    document.getElementById('currentStock').value = product.currentStock;
    document.getElementById('minStock').value = product.minStock;
    document.getElementById('reorderLevel').value = product.reorderLevel;
    document.getElementById('maxStock').value = product.maxStock || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productLocation').value = product.location || '';
    document.getElementById('productWeight').value = product.weight || '';
    
    // Update settings checkboxes
    document.getElementById('trackInventory').checked = product.settings.trackInventory;
    document.getElementById('allowBackorder').checked = product.settings.allowBackorder;
    document.getElementById('autoReorder').checked = product.settings.autoReorder;
    
    // Change form to edit mode
    const form = document.getElementById('addProductForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const modalTitle = document.querySelector('#addProductModal .modal-header h3');
    
    if (modalTitle) modalTitle.textContent = 'Edit Product';
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Product';
        submitBtn.textContent = 'Update Product';
    }
    
    // Store the product ID being edited
    form.dataset.editingProductId = productId;
    
    // Remove existing submit event and add new one for editing
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleUpdateProduct(productId);
    });
    
    // Open modal
    document.getElementById('addProductModal').classList.add('active');
}

// Handle update product
function handleUpdateProduct(productId) {
    const productIndex = inventoryData.findIndex(p => p.id === productId);
    if (productIndex === -1) return;
    
    const name = document.getElementById('productName').value;
    const sku = document.getElementById('productSKU').value;
    const category = document.getElementById('productCategory').value;
    const storeId = document.getElementById('productStore').value;
    const brand = document.getElementById('productBrand').value;
    const supplier = document.getElementById('productSupplier').value;
    const unitCost = parseFloat(document.getElementById('unitCost').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const currentStock = parseInt(document.getElementById('currentStock').value);
    const minStock = parseInt(document.getElementById('minStock').value);
    const reorderLevel = parseInt(document.getElementById('reorderLevel').value);
    const maxStock = document.getElementById('maxStock').value ? parseInt(document.getElementById('maxStock').value) : null;
    const description = document.getElementById('productDescription').value;
    const location = document.getElementById('productLocation').value;
    const weight = document.getElementById('productWeight').value ? parseFloat(document.getElementById('productWeight').value) : null;
    
    // Get store name from dropdown
    const storeSelect = document.getElementById('productStore');
    const selectedStoreOption = storeSelect.options[storeSelect.selectedIndex];
    const storeName = selectedStoreOption.textContent.split(' (')[0];
    
    // Update product
    inventoryData[productIndex] = {
        ...inventoryData[productIndex],
        sku: sku,
        name: name,
        category: category,
        storeId: storeId,
        storeName: storeName,
        brand: brand,
        supplier: supplier,
        unitCost: unitCost,
        unitPrice: unitPrice,
        currentStock: currentStock,
        minStock: minStock,
        reorderLevel: reorderLevel,
        maxStock: maxStock,
        stockValue: currentStock * unitCost,
        location: location,
        weight: weight,
        description: description,
        lastUpdated: luxon.DateTime.now().toISODate(),
        settings: {
            trackInventory: document.getElementById('trackInventory').checked,
            allowBackorder: document.getElementById('allowBackorder').checked,
            autoReorder: document.getElementById('autoReorder').checked
        }
    };
    
    // Update status
    updateProductStatus(inventoryData[productIndex]);
    
    // Reset form and close modal
    resetProductForm();
    document.getElementById('addProductModal').classList.remove('active');
    
    // Update UI
    filteredProducts = [...inventoryData];
    updateProductsTable();
    updateInventoryKPIs();
    updateStockAlerts();
    updateInventoryCharts();
    
    // Close detail modal if open
    closeProductDetail();
    
    // Show success message
    showNotification('Product updated successfully!', 'success');
}

// Restock product
function restockProduct(productId) {
    openStockInModal(productId);
}

// Open stock in modal
function openStockInModal(productId = null) {
    const modal = document.getElementById('stockInModal');
    const productSelect = document.getElementById('stockInProduct');
    
    if (!modal || !productSelect) return;
    
    // Clear existing options except the first one
    while (productSelect.options.length > 1) {
        productSelect.remove(1);
    }
    
    // Populate product dropdown
    inventoryData.forEach(product => {
        if (product.status !== 'discontinued') {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (Current: ${product.currentStock})`;
            productSelect.appendChild(option);
        }
    });
    
    // Pre-select product if provided
    if (productId) {
        productSelect.value = productId;
        
        // Auto-fill cost
        const product = inventoryData.find(p => p.id === productId);
        if (product) {
            document.getElementById('stockInCost').value = product.unitCost;
        }
    }
    
    // Clear form
    document.getElementById('stockInQuantity').value = '1';
    document.getElementById('stockInCost').value = '';
    document.getElementById('stockInSupplier').value = '';
    document.getElementById('stockInNotes').value = '';
    
    // Open modal
    modal.classList.add('active');
}

// Handle stock in form
document.getElementById('stockInForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productId = document.getElementById('stockInProduct').value;
    const quantity = parseInt(document.getElementById('stockInQuantity').value);
    const cost = document.getElementById('stockInCost').value ? parseFloat(document.getElementById('stockInCost').value) : null;
    const supplier = document.getElementById('stockInSupplier').value;
    const notes = document.getElementById('stockInNotes').value;
    
    if (!productId || quantity <= 0) {
        showNotification('Please select a product and enter a valid quantity', 'warning');
        return;
    }
    
    const productIndex = inventoryData.findIndex(p => p.id === productId);
    if (productIndex === -1) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Update stock
    inventoryData[productIndex].currentStock += quantity;
    
    // Update unit cost if provided
    if (cost && cost > 0) {
        inventoryData[productIndex].unitCost = cost;
    }
    
    // Update supplier if provided
    if (supplier) {
        inventoryData[productIndex].supplier = supplier;
    }
    
    // Update stock value
    inventoryData[productIndex].stockValue = 
        inventoryData[productIndex].currentStock * inventoryData[productIndex].unitCost;
    
    // Update status
    updateProductStatus(inventoryData[productIndex]);
    
    // Record stock movement (in a real system, this would be saved to a database)
    recordStockMovement(productId, 'in', quantity, cost, supplier, notes);
    
    // Close modal
    document.getElementById('stockInModal').classList.remove('active');
    
    // Update UI
    filteredProducts = [...inventoryData];
    updateProductsTable();
    updateInventoryKPIs();
    updateStockAlerts();
    updateInventoryCharts();
    
    // Show success message
    showNotification(`Stock added: ${quantity} units`, 'success');
});

// Handle product checkbox selection
function handleProductCheckbox(e) {
    const productId = e.target.dataset.productId;
    
    if (e.target.checked) {
        selectedProducts.add(productId);
    } else {
        selectedProducts.delete(productId);
        const selectAllCheckbox = document.getElementById('selectAllProducts');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
    }
    
    // Update row selection styling
    const row = document.querySelector(`.product-row[data-product-id="${productId}"]`);
    if (row) {
        row.classList.toggle('selected', e.target.checked);
    }
}

// Handle select all checkbox
function handleSelectAll(e) {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll('.product-checkbox');
    
    if (isChecked) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentData = filteredProducts.slice(startIndex, endIndex);
        
        currentData.forEach(product => {
            selectedProducts.add(product.id);
        });
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            const row = checkbox.closest('.product-row');
            if (row) {
                row.classList.add('selected');
            }
        });
    } else {
        selectedProducts.clear();
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            const row = checkbox.closest('.product-row');
            if (row) {
                row.classList.remove('selected');
            }
        });
    }
}

// Handle insights tab change
function handleInsightsTabChange(e) {
    const tab = e.target;
    const tabName = tab.dataset.tab;
    
    // Update active tab
    document.querySelectorAll('.insights-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update active content
    document.querySelectorAll('.insights-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const activeTabContent = document.getElementById(`${tabName}Tab`);
    if (activeTabContent) {
        activeTabContent.classList.add('active');
    }
    
    // Update charts for the active tab
    switch (tabName) {
        case 'stock-movement':
            updateMovementTrendChart();
            updateTopMoversList();
            break;
        case 'slow-movers':
            updateSlowMoversChart();
            updateAttentionList();
            break;
        case 'reorder-analysis':
            updateReorderAnalysisChart();
            updateReorderAlerts();
            break;
        case 'supplier-performance':
            updateSupplierPerformanceChart();
            updateSupplierRatings();
            break;
    }
}

// Go to previous page
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        updateProductsTable();
    }
}

// Go to next page
function goToNextPage() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateProductsTable();
    }
}

// Export inventory data
function exportInventoryData() {
    // Create CSV content
    const headers = ['SKU', 'Name', 'Category', 'Store', 'Current Stock', 'Min Stock', 'Reorder Level', 'Unit Cost', 'Unit Price', 'Stock Value', 'Status'];
    const csvRows = [headers.join(',')];
    
    filteredProducts.forEach(product => {
        const row = [
            `"${product.sku}"`,
            `"${product.name}"`,
            `"${product.category}"`,
            `"${product.storeName}"`,
            product.currentStock,
            product.minStock,
            product.reorderLevel,
            product.unitCost,
            product.unitPrice,
            product.stockValue,
            `"${getStatusLabel(product.status)}"`
        ];
        csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${luxon.DateTime.now().toFormat('yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Show success message
    showNotification('Inventory exported successfully!', 'success');
}

// Reset product form
function resetProductForm() {
    const form = document.getElementById('addProductForm');
    if (form) {
        form.reset();
        
        // Reset form state
        const submitBtn = form.querySelector('button[type="submit"]');
        const modalTitle = document.querySelector('#addProductModal .modal-header h3');
        
        if (modalTitle) modalTitle.textContent = 'Add New Product';
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Product';
        }
        delete form.dataset.editingProductId;
        
        // Reset checkboxes to default
        document.getElementById('trackInventory').checked = true;
        document.getElementById('allowBackorder').checked = true;
        document.getElementById('autoReorder').checked = true;
    }
}

// Close product detail modal
function closeProductDetail() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Populate store dropdown
function populateStoreDropdown() {
    const storeSelect = document.getElementById('productStore');
    if (!storeSelect) return;
    
    const stores = [
        { id: 'ST001', name: 'ElectroTech', location: 'Ground Floor' },
        { id: 'ST002', name: 'Fashion Hub', location: 'First Floor' },
        { id: 'ST003', name: 'Coffee Brew', location: 'Food Court' },
        { id: 'ST004', name: 'Sports Zone', location: 'Second Floor' },
        { id: 'ST005', name: 'Home & Living', location: 'Third Floor' },
        { id: 'ST006', name: 'Beauty Glow', location: 'First Floor' },
        { id: 'ST007', name: 'Book Haven', location: 'Second Floor' }
    ];
    
    stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store.id;
        option.textContent = `${store.name} (${store.location})`;
        storeSelect.appendChild(option);
    });
}

// Populate supplier dropdown
function populateSupplierDropdown() {
    const supplierSelect = document.getElementById('productSupplier');
    const stockInSupplierSelect = document.getElementById('stockInSupplier');
    
    const suppliers = [
        'TechSupplies Inc.',
        'FashionDist Co.',
        'FoodImport Ltd.',
        'HomeGoods Corp.',
        'BeautyGlow Suppliers',
        'SportsGear Ltd.',
        'BookWorld Distributors',
        'ElectroParts Global',
        'PremiumFashion Group',
        'OrganicFoods Co.'
    ];
    
    suppliers.forEach(supplier => {
        // For add product modal
        if (supplierSelect) {
            const option = document.createElement('option');
            option.value = supplier;
            option.textContent = supplier;
            supplierSelect.appendChild(option);
        }
        
        // For stock in modal
        if (stockInSupplierSelect) {
            const option2 = document.createElement('option');
            option2.value = supplier;
            option2.textContent = supplier;
            stockInSupplierSelect.appendChild(option2);
        }
    });
}

// Populate stock in dropdowns
function populateStockInDropdowns() {
    const productSelect = document.getElementById('stockInProduct');
    if (!productSelect) return;
    
    // Will be populated when modal opens
}

// Helper functions
function getStockClass(currentStock, minStock, reorderLevel) {
    if (currentStock === 0) return 'out';
    if (currentStock <= minStock) return 'low';
    if (currentStock <= reorderLevel) return 'medium';
    return 'high';
}

function getStatusLabel(status) {
    const labels = {
        'in-stock': 'In Stock',
        'low-stock': 'Low Stock',
        'out-of-stock': 'Out of Stock',
        'discontinued': 'Discontinued',
        'medium-stock': 'Medium Stock'
    };
    return labels[status] || status;
}

function updateProductStatus(product) {
    if (product.currentStock === 0) {
        product.status = 'out-of-stock';
    } else if (product.currentStock <= product.minStock) {
        product.status = 'low-stock';
    } else if (product.currentStock <= product.reorderLevel) {
        product.status = 'medium-stock';
    } else {
        product.status = 'in-stock';
    }
}

function formatCurrency(amount) {
    return amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
        '67, 97, 238';
}

function getRandomBrand(category) {
    const brands = {
        electronics: ['Samsung', 'Apple', 'Sony', 'Bose', 'LG'],
        fashion: ['Nike', 'Adidas', 'Zara', 'Levi\'s', 'H&M'],
        food: ['Nestle', 'Cadbury', 'Tata', 'Britannia', 'Amul'],
        home: ['Ikea', 'Milton', 'Prestige', 'Bajaj', 'Havells'],
        beauty: ['L\'Oreal', 'Maybelline', 'Nivea', 'Lakme', 'Mac'],
        sports: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'],
        books: ['Penguin', 'HarperCollins', 'Random House', 'Simon & Schuster', 'Macmillan']
    };
    
    const categoryBrands = brands[category] || ['Generic'];
    return categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
}

function recordStockMovement(productId, type, quantity, cost, supplier, notes) {
    // In a real application, this would save to a database
    console.log(`Stock ${type}: ${quantity} units of ${productId}`);
}

function takeAction(productId) {
    // This function would handle actions like reorder, review pricing, etc.
    // For now, just open the product detail modal
    viewProduct(productId);
    return false; // Prevent default link behavior
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initInventoryManagement);