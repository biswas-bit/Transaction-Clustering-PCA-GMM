// Sales Management JavaScript

// Sales Data Structure
let salesData = [];
let filteredSales = [];
let currentDateRange = 'week';
let currentAnalyticsTab = 'hourly';
let currentPage = 1;
const itemsPerPage = 10;

// Initialize Sales Management System
function initSalesManagement() {
    // Load sample sales data
    loadSampleSales();
    
    // Initialize UI components
    initSalesUI();
    
    // Setup event listeners
    setupSalesEventListeners();
    
    // Initialize charts
    initSalesCharts();
    
    // Update sales displays
    updateSalesKPIs();
    updateTopProductsList();
    updateSalesTransactionsTable();
    updateAnalyticsTab();
    updateTodaySales();
}

// Load sample sales data
function loadSampleSales() {
    const sampleProducts = [
        { id: 'P001', name: 'Wireless Headphones', category: 'electronics', price: 2999 },
        { id: 'P002', name: 'Designer T-Shirt', category: 'fashion', price: 2499 },
        { id: 'P003', name: 'Premium Coffee', category: 'food', price: 350 },
        { id: 'P004', name: 'Yoga Mat', category: 'sports', price: 1899 },
        { id: 'P005', name: 'LED Desk Lamp', category: 'home', price: 1299 },
        { id: 'P006', name: 'Face Cream', category: 'beauty', price: 2499 },
        { id: 'P007', name: 'Running Shoes', category: 'sports', price: 3999 },
        { id: 'P008', name: 'Novel Book', category: 'books', price: 499 },
        { id: 'P009', name: 'Smartphone Case', category: 'electronics', price: 899 },
        { id: 'P010', name: 'Leather Jacket', category: 'fashion', price: 5999 }
    ];

    const sampleStores = [
        { id: 'ST001', name: 'ElectroTech', category: 'electronics' },
        { id: 'ST002', name: 'Fashion Hub', category: 'fashion' },
        { id: 'ST003', name: 'Coffee Brew', category: 'food' },
        { id: 'ST004', name: 'Sports Zone', category: 'sports' },
        { id: 'ST005', name: 'Home & Living', category: 'home' },
        { id: 'ST006', name: 'Beauty Glow', category: 'beauty' },
        { id: 'ST007', name: 'Book Haven', category: 'books' }
    ];

    const paymentMethods = ['cash', 'card', 'upi', 'wallet', 'netbanking'];
    const statuses = ['completed', 'completed', 'completed', 'pending', 'refunded'];

    // Generate sample sales for the last 30 days
    const now = luxon.DateTime.now();
    salesData = [];

    for (let i = 0; i < 150; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const saleDate = now.minus({ days: daysAgo });
        const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
        const store = sampleStores[Math.floor(Math.random() * sampleStores.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0;
        const subtotal = product.price * quantity;
        const discountAmount = (subtotal * discount) / 100;
        const totalAmount = subtotal - discountAmount;
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        salesData.push({
            id: `TXN${1000 + i}`,
            timestamp: saleDate.toISO(),
            date: saleDate.toISODate(),
            time: saleDate.toFormat('hh:mm a'),
            storeId: store.id,
            storeName: store.name,
            storeCategory: store.category,
            productId: product.id,
            productName: product.name,
            productCategory: product.category,
            quantity: quantity,
            unitPrice: product.price,
            discount: discount,
            discountAmount: discountAmount,
            subtotal: subtotal,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            status: status,
            customerPhone: Math.random() > 0.5 ? generatePhoneNumber() : null
        });
    }

    // Sort by date (newest first)
    salesData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    filteredSales = [...salesData];
}

// Initialize UI components
function initSalesUI() {
    // Set current date range
    updateDateRangeDisplay();
    
    // Initialize search functionality
    const searchInput = document.getElementById('salesSearch');
    searchInput.addEventListener('input', handleSalesSearch);
    
    // Initialize date range buttons
    document.querySelectorAll('.date-range-btn').forEach(btn => {
        btn.addEventListener('click', handleDateRangeChange);
    });
    
    // Populate store dropdown in new sale modal
    populateStoreDropdown();
    
    // Initialize product search
    initProductSearch();
}

// Setup event listeners
function setupSalesEventListeners() {
    // New sale button
    const newSaleBtn = document.getElementById('newSaleBtn');
    const newSaleModal = document.getElementById('newSaleModal');
    const closeSaleModal = document.getElementById('closeSaleModal');
    const cancelSaleBtn = document.getElementById('cancelSaleBtn');
    const newSaleForm = document.getElementById('newSaleForm');
    
    newSaleBtn.addEventListener('click', () => {
        newSaleModal.classList.add('active');
    });
    
    closeSaleModal.addEventListener('click', () => {
        newSaleModal.classList.remove('active');
    });
    
    cancelSaleBtn.addEventListener('click', () => {
        newSaleModal.classList.remove('active');
        resetSaleForm();
    });
    
    newSaleForm.addEventListener('submit', handleNewSale);
    
    // Custom date range
    const customRangeBtn = document.getElementById('customRangeBtn');
    const customRangeModal = document.getElementById('customRangeModal');
    const closeRangeModal = document.getElementById('closeRangeModal');
    const cancelRangeBtn = document.getElementById('cancelRangeBtn');
    const customRangeForm = document.getElementById('customRangeForm');
    
    customRangeBtn.addEventListener('click', () => {
        customRangeModal.classList.add('active');
    });
    
    closeRangeModal.addEventListener('click', () => {
        customRangeModal.classList.remove('active');
    });
    
    cancelRangeBtn.addEventListener('click', () => {
        customRangeModal.classList.remove('active');
    });
    
    customRangeForm.addEventListener('submit', handleCustomRange);
    
    // Transaction filter
    document.getElementById('transactionFilter').addEventListener('change', handleTransactionFilter);
    
    // Export transactions
    document.getElementById('exportTransactionsBtn').addEventListener('click', () => {
        exportSalesData();
    });
    
    // Pagination
    document.getElementById('prevPageBtn').addEventListener('click', goToPrevPage);
    document.getElementById('nextPageBtn').addEventListener('click', goToNextPage);
    
    // Analytics tabs
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        tab.addEventListener('click', handleAnalyticsTabChange);
    });
    
    // Trend chart period
    document.getElementById('trendChartPeriod').addEventListener('change', updateRevenueTrendChart);
    
    // Quick action buttons
    document.getElementById('processRefundBtn').addEventListener('click', () => {
        alert('Refund processing feature will be implemented soon!');
    });
    
    document.getElementById('salesReportBtn').addEventListener('click', () => {
        generateSalesReport();
    });
    
    document.getElementById('inventoryCheckBtn').addEventListener('click', () => {
        alert('Inventory check feature will be implemented soon!');
    });
    
    document.getElementById('promotionsBtn').addEventListener('click', () => {
        alert('Promotions management feature will be implemented soon!');
    });
    
    // View products button
    document.getElementById('viewProductsBtn').addEventListener('click', () => {
        alert('Products page will be implemented soon!');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === newSaleModal) {
            newSaleModal.classList.remove('active');
        }
        
        if (e.target === document.getElementById('transactionDetailModal')) {
            document.getElementById('transactionDetailModal').classList.remove('active');
        }
        
        if (e.target === customRangeModal) {
            customRangeModal.classList.remove('active');
        }
        
        const notificationPanel = document.getElementById('notificationPanel');
        const notificationBtn = document.getElementById('notificationBtn');
        if (e.target === notificationPanel && !notificationBtn.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });
    
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
    
    // Real-time updates for sale form
    document.getElementById('productQuantity').addEventListener('input', updateSaleSummary);
    document.getElementById('productPrice').addEventListener('input', updateSaleSummary);
    document.getElementById('productDiscount').addEventListener('input', updateSaleSummary);
    
    // Store selection updates category
    document.getElementById('saleStore').addEventListener('change', updateStoreCategory);
}

// Initialize sales charts
function initSalesCharts() {
    // Revenue Trend Chart
    const trendCtx = document.getElementById('revenueTrendChart').getContext('2d');
    window.revenueTrendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Current Period',
                    data: [],
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4361ee',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                },
                {
                    label: 'Previous Period',
                    data: [],
                    borderColor: '#4cc9f0',
                    backgroundColor: 'rgba(76, 201, 240, 0.05)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4cc9f0',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₹ ${context.parsed.y.toLocaleString('en-IN')}`;
                        }
                    }
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
                        callback: function(value) {
                            if (value >= 100000) {
                                return '₹ ' + (value / 100000).toFixed(0) + 'L';
                            }
                            return '₹ ' + value;
                        }
                    }
                }
            }
        }
    });
    
    // Hourly Sales Chart
    const hourlyCtx = document.getElementById('hourlySalesChart').getContext('2d');
    window.hourlySalesChart = new Chart(hourlyCtx, {
        type: 'bar',
        data: {
            labels: Array.from({ length: 12 }, (_, i) => `${i + 10}:00`), // 10 AM to 10 PM
            datasets: [{
                label: 'Sales',
                data: [],
                backgroundColor: Array(12).fill('rgba(67, 97, 238, 0.7)'),
                borderColor: '#4361ee',
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
                        callback: function(value) {
                            return '₹ ' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
    
    // Category Sales Chart
    const categoryCtx = document.getElementById('categorySalesChart').getContext('2d');
    window.categorySalesChart = new Chart(categoryCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue',
                data: [],
                backgroundColor: [],
                borderColor: '#4361ee',
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
                        callback: function(value) {
                            if (value >= 100000) {
                                return '₹ ' + (value / 100000).toFixed(0) + 'L';
                            }
                            return '₹ ' + value;
                        }
                    }
                }
            }
        }
    });
    
    // Update all charts
    updateSalesCharts();
}

// Update sales charts
function updateSalesCharts() {
    updateRevenueTrendChart();
    updateHourlySalesChart();
    updateCategorySalesChart();
    updateTopStoresSales();
    updatePaymentMethods();
}

// Update revenue trend chart
function updateRevenueTrendChart() {
    const period = document.getElementById('trendChartPeriod').value;
    let labels = [];
    let currentData = [];
    let previousData = [];
    
    const now = luxon.DateTime.now();
    
    switch (period) {
        case 'daily':
            // Last 7 days
            labels = Array.from({ length: 7 }, (_, i) => {
                const date = now.minus({ days: 6 - i });
                return date.toFormat('EEE');
            });
            
            currentData = Array.from({ length: 7 }, (_, i) => {
                const date = now.minus({ days: 6 - i });
                return salesData
                    .filter(s => s.date === date.toISODate())
                    .reduce((sum, s) => sum + s.totalAmount, 0);
            });
            
            previousData = Array.from({ length: 7 }, (_, i) => {
                const date = now.minus({ days: 13 - i });
                return salesData
                    .filter(s => s.date === date.toISODate())
                    .reduce((sum, s) => sum + s.totalAmount, 0);
            });
            break;
            
        case 'weekly':
            // Last 8 weeks
            labels = Array.from({ length: 8 }, (_, i) => `Week ${i + 1}`);
            
            currentData = Array.from({ length: 8 }, (_, i) => {
                const startDate = now.minus({ weeks: 7 - i });
                const endDate = startDate.plus({ days: 6 });
                return salesData
                    .filter(s => {
                        const saleDate = luxon.DateTime.fromISO(s.timestamp);
                        return saleDate >= startDate && saleDate <= endDate;
                    })
                    .reduce((sum, s) => sum + s.totalAmount, 0);
            });
            
            previousData = Array.from({ length: 8 }, (_, i) => {
                const startDate = now.minus({ weeks: 15 - i });
                const endDate = startDate.plus({ days: 6 });
                return salesData
                    .filter(s => {
                        const saleDate = luxon.DateTime.fromISO(s.timestamp);
                        return saleDate >= startDate && saleDate <= endDate;
                    })
                    .reduce((sum, s) => sum + s.totalAmount, 0);
            });
            break;
            
        case 'monthly':
            // Last 6 months
            labels = Array.from({ length: 6 }, (_, i) => {
                const date = now.minus({ months: 5 - i });
                return date.toFormat('MMM');
            });
            
            currentData = Array.from({ length: 6 }, (_, i) => {
                const month = now.minus({ months: 5 - i });
                return salesData
                    .filter(s => {
                        const saleDate = luxon.DateTime.fromISO(s.timestamp);
                        return saleDate.month === month.month && saleDate.year === month.year;
                    })
                    .reduce((sum, s) => sum + s.totalAmount, 0);
            });
            
            previousData = Array.from({ length: 6 }, (_, i) => {
                const month = now.minus({ months: 11 - i });
                return salesData
                    .filter(s => {
                        const saleDate = luxon.DateTime.fromISO(s.timestamp);
                        return saleDate.month === month.month && saleDate.year === month.year;
                    })
                    .reduce((sum, s) => sum + s.totalAmount, 0);
            });
            break;
    }
    
    window.revenueTrendChart.data.labels = labels;
    window.revenueTrendChart.data.datasets[0].data = currentData;
    window.revenueTrendChart.data.datasets[1].data = previousData;
    window.revenueTrendChart.update();
}

// Update hourly sales chart
function updateHourlySalesChart() {
    const hourlyData = Array(12).fill(0); // 10 AM to 10 PM
    
    salesData.forEach(sale => {
        const saleTime = luxon.DateTime.fromISO(sale.timestamp);
        const hour = saleTime.hour;
        if (hour >= 10 && hour <= 21) { // 10 AM to 10 PM
            hourlyData[hour - 10] += sale.totalAmount;
        }
    });
    
    window.hourlySalesChart.data.datasets[0].data = hourlyData;
    window.hourlySalesChart.update();
}

// Update category sales chart
function updateCategorySalesChart() {
    const categories = {};
    
    salesData.forEach(sale => {
        if (!categories[sale.productCategory]) {
            categories[sale.productCategory] = 0;
        }
        categories[sale.productCategory] += sale.totalAmount;
    });
    
    const sortedCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8); // Top 8 categories
    
    const categoryColors = {
        electronics: '#4361ee',
        fashion: '#7209b7',
        food: '#4cc9f0',
        sports: '#f72585',
        home: '#b5179e',
        beauty: '#3a0ca3',
        books: '#560bad',
        other: '#480ca8'
    };
    
    window.categorySalesChart.data.labels = sortedCategories.map(c => c[0].charAt(0).toUpperCase() + c[0].slice(1));
    window.categorySalesChart.data.datasets[0].data = sortedCategories.map(c => c[1]);
    window.categorySalesChart.data.datasets[0].backgroundColor = sortedCategories.map(c => 
        categoryColors[c[0]] || '#6c757d'
    );
    window.categorySalesChart.update();
}

// Update top products list
function updateTopProductsList() {
    const productSales = {};
    
    salesData.forEach(sale => {
        const productKey = `${sale.productId}|${sale.productName}`;
        if (!productSales[productKey]) {
            productSales[productKey] = {
                name: sale.productName,
                revenue: 0,
                quantity: 0
            };
        }
        productSales[productKey].revenue += sale.totalAmount;
        productSales[productKey].quantity += sale.quantity;
    });
    
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    const topProductsList = document.getElementById('topProductsList');
    let html = '';
    
    topProducts.forEach((product, index) => {
        html += `
            <div class="top-product-item">
                <div class="top-product-info">
                    <div class="product-rank">${index + 1}</div>
                    <div class="product-name">${product.name}</div>
                </div>
                <div class="product-revenue">₹ ${formatRevenue(product.revenue)}</div>
            </div>
        `;
    });
    
    topProductsList.innerHTML = html;
}

// Update top stores sales
function updateTopStoresSales() {
    const storeSales = {};
    
    salesData.forEach(sale => {
        if (!storeSales[sale.storeId]) {
            storeSales[sale.storeId] = {
                name: sale.storeName,
                category: sale.storeCategory,
                revenue: 0,
                transactions: 0
            };
        }
        storeSales[sale.storeId].revenue += sale.totalAmount;
        storeSales[sale.storeId].transactions += 1;
    });
    
    const topStores = Object.values(storeSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    const topStoresSales = document.getElementById('topStoresSales');
    let html = '';
    
    topStores.forEach(store => {
        const growth = Math.floor(Math.random() * 30) - 5; // Random growth between -5% and +25%
        const growthClass = growth >= 0 ? 'positive' : 'negative';
        const growthSymbol = growth >= 0 ? '+' : '';
        
        html += `
            <div class="store-sales-item">
                <div class="store-sales-info">
                    <div>
                        <div class="store-sales-name">${store.name}</div>
                        <div class="store-sales-category">${store.category}</div>
                    </div>
                </div>
                <div class="store-sales-stats">
                    <div class="store-sales-revenue">₹ ${formatRevenue(store.revenue)}</div>
                    <div class="store-sales-growth ${growthClass}">
                        ${growthSymbol}${growth}% this period
                    </div>
                </div>
            </div>
        `;
    });
    
    topStoresSales.innerHTML = html;
}

// Update payment methods
function updatePaymentMethods() {
    const paymentStats = {};
    
    salesData.forEach(sale => {
        if (!paymentStats[sale.paymentMethod]) {
            paymentStats[sale.paymentMethod] = {
                count: 0,
                amount: 0
            };
        }
        paymentStats[sale.paymentMethod].count += 1;
        paymentStats[sale.paymentMethod].amount += sale.totalAmount;
    });
    
    const paymentLabels = {
        cash: 'Cash',
        card: 'Card',
        upi: 'UPI',
        wallet: 'Mobile Wallet',
        netbanking: 'Net Banking'
    };
    
    const paymentMethodsGrid = document.getElementById('paymentMethodsGrid');
    let html = '';
    
    Object.entries(paymentStats).forEach(([method, stats]) => {
        const percentage = ((stats.amount / getTotalRevenue()) * 100).toFixed(1);
        
        html += `
            <div class="payment-method-card">
                <div class="payment-method-icon ${method}">
                    <i class="fas fa-${getPaymentMethodIcon(method)}"></i>
                </div>
                <div class="payment-method-name">${paymentLabels[method]}</div>
                <div class="payment-method-stats">${stats.count} transactions</div>
                <div class="payment-method-amount">₹ ${formatRevenue(stats.amount)}</div>
                <div class="payment-method-percentage">${percentage}%</div>
            </div>
        `;
    });
    
    paymentMethodsGrid.innerHTML = html;
}

// Update sales KPIs
function updateSalesKPIs() {
    const periodData = getCurrentPeriodData();
    const previousPeriodData = getPreviousPeriodData();
    
    // Total Revenue
    const totalRevenue = periodData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const previousRevenue = previousPeriodData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1) : 0;
    
    document.getElementById('totalRevenue').textContent = `₹ ${formatRevenue(totalRevenue)}`;
    document.getElementById('revenueChange').textContent = `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`;
    document.getElementById('revenueChange').className = `change-${revenueChange >= 0 ? 'positive' : 'negative'}`;
    
    // Total Transactions
    const totalTransactions = periodData.length;
    const previousTransactions = previousPeriodData.length;
    const transactionsChange = previousTransactions > 0 ? ((totalTransactions - previousTransactions) / previousTransactions * 100).toFixed(1) : 0;
    
    document.getElementById('totalTransactions').textContent = totalTransactions.toLocaleString('en-IN');
    document.getElementById('transactionsChange').textContent = `${transactionsChange >= 0 ? '+' : ''}${transactionsChange}%`;
    document.getElementById('transactionsChange').className = `change-${transactionsChange >= 0 ? 'positive' : 'negative'}`;
    
    // Average Order Value
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const previousAOV = previousTransactions > 0 ? previousRevenue / previousTransactions : 0;
    const aovChange = previousAOV > 0 ? ((avgOrderValue - previousAOV) / previousAOV * 100).toFixed(1) : 0;
    
    document.getElementById('avgOrderValue').textContent = `₹ ${Math.round(avgOrderValue).toLocaleString('en-IN')}`;
    document.getElementById('aovChange').textContent = `${aovChange >= 0 ? '+' : ''}${aovChange}%`;
    document.getElementById('aovChange').className = `change-${aovChange >= 0 ? 'positive' : 'negative'}`;
    
    // Conversion Rate (simulated)
    const conversionRate = (Math.random() * 5 + 2).toFixed(1); // Random between 2-7%
    const previousConversionRate = (parseFloat(conversionRate) - (Math.random() * 2 - 1)).toFixed(1);
    const conversionChange = ((parseFloat(conversionRate) - parseFloat(previousConversionRate)) / parseFloat(previousConversionRate) * 100).toFixed(1);
    
    document.getElementById('conversionRate').textContent = `${conversionRate}%`;
    document.getElementById('conversionChange').textContent = `${conversionChange >= 0 ? '+' : ''}${conversionChange}%`;
    document.getElementById('conversionChange').className = `change-${conversionChange >= 0 ? 'positive' : 'negative'}`;
}

// Update sales transactions table
function updateSalesTransactionsTable() {
    const tableBody = document.getElementById('salesTransactionsTable');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredSales.slice(startIndex, endIndex);
    
    let html = '';
    
    if (currentData.length === 0) {
        html = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No transactions found</p>
                </td>
            </tr>
        `;
    } else {
        currentData.forEach(sale => {
            const saleDate = luxon.DateTime.fromISO(sale.timestamp);
            const statusClass = sale.status === 'refunded' ? 'refunded' : 
                              sale.status === 'pending' ? 'pending' : 
                              sale.status === 'processing' ? 'processing' : 'completed';
            
            html += `
                <tr class="transaction-row" data-transaction-id="${sale.id}">
                    <td><strong>${sale.id}</strong></td>
                    <td>
                        <div>${saleDate.toFormat('dd/MM/yyyy')}</div>
                        <div class="text-small">${sale.time}</div>
                    </td>
                    <td>
                        <div class="store-name">${sale.storeName}</div>
                        <div class="text-small">${sale.storeCategory}</div>
                    </td>
                    <td>${sale.productName}</td>
                    <td>${sale.quantity}</td>
                    <td><strong>₹ ${sale.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                    <td>
                        <span class="payment-method ${sale.paymentMethod}">
                            ${getPaymentMethodLabel(sale.paymentMethod)}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="action-icon-btn view" onclick="viewTransaction('${sale.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-icon-btn refund" onclick="processRefund('${sale.id}')">
                                <i class="fas fa-undo"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = html;
    
    // Update pagination
    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const showingCountSpan = document.getElementById('showingCount');
    const totalCountSpan = document.getElementById('totalCount');
    
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    showingCountSpan.textContent = Math.min(filteredSales.length, currentPage * itemsPerPage);
    totalCountSpan.textContent = filteredSales.length;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Update today's sales
function updateTodaySales() {
    const today = luxon.DateTime.now().toISODate();
    const todaySales = salesData.filter(sale => sale.date === today);
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    document.getElementById('todaySalesValue').textContent = `₹ ${formatRevenue(todayRevenue)}`;
    document.getElementById('todayTransactionsCount').textContent = todaySales.length;
}

// Handle sales search
function handleSalesSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredSales = [...salesData];
    } else {
        filteredSales = salesData.filter(sale => 
            sale.id.toLowerCase().includes(searchTerm) ||
            sale.storeName.toLowerCase().includes(searchTerm) ||
            sale.productName.toLowerCase().includes(searchTerm) ||
            sale.productCategory.toLowerCase().includes(searchTerm) ||
            sale.paymentMethod.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    updateSalesTransactionsTable();
}

// Handle date range change
function handleDateRangeChange(e) {
    const range = e.target.id.replace('Btn', '');
    
    // Update active button
    document.querySelectorAll('.date-range-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    currentDateRange = range === 'customRange' ? 'custom' : range;
    updateDateRangeDisplay();
    updateSalesKPIs();
    updateSalesCharts();
}

// Handle custom range
function handleCustomRange(e) {
    e.preventDefault();
    
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    currentDateRange = 'custom';
    
    // Update active button
    document.querySelectorAll('.date-range-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('customRangeBtn').classList.add('active');
    
    updateDateRangeDisplay(startDate, endDate);
    updateSalesKPIs();
    updateSalesCharts();
    
    // Close modal
    document.getElementById('customRangeModal').classList.remove('active');
}

// Handle transaction filter
function handleTransactionFilter(e) {
    const filter = e.target.value;
    const now = luxon.DateTime.now();
    
    switch (filter) {
        case 'today':
            filteredSales = salesData.filter(sale => sale.date === now.toISODate());
            break;
        case 'week':
            const weekAgo = now.minus({ days: 7 });
            filteredSales = salesData.filter(sale => {
                const saleDate = luxon.DateTime.fromISO(sale.timestamp);
                return saleDate >= weekAgo;
            });
            break;
        case 'high-value':
            filteredSales = salesData.filter(sale => sale.totalAmount > 10000);
            break;
        case 'refunded':
            filteredSales = salesData.filter(sale => sale.status === 'refunded');
            break;
        default:
            filteredSales = [...salesData];
    }
    
    currentPage = 1;
    updateSalesTransactionsTable();
}

// Handle new sale
function handleNewSale(e) {
    e.preventDefault();
    
    const storeId = document.getElementById('saleStore').value;
    const productName = document.getElementById('productSearch').value;
    const unitPrice = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const discount = parseFloat(document.getElementById('productDiscount').value) || 0;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const customerPhone = document.getElementById('customerPhone').value;
    
    if (!storeId || !productName || !unitPrice || !quantity || !paymentMethod) {
        alert('Please fill all required fields');
        return;
    }
    
    const store = getStoreById(storeId);
    const subtotal = unitPrice * quantity;
    const discountAmount = (subtotal * discount) / 100;
    const totalAmount = subtotal - discountAmount;
    const now = luxon.DateTime.now();
    
    const newTransaction = {
        id: `TXN${1000 + salesData.length + 1}`,
        timestamp: now.toISO(),
        date: now.toISODate(),
        time: now.toFormat('hh:mm a'),
        storeId: store.id,
        storeName: store.name,
        storeCategory: store.category,
        productId: `P${100 + salesData.length + 1}`,
        productName: productName,
        productCategory: store.category,
        quantity: quantity,
        unitPrice: unitPrice,
        discount: discount,
        discountAmount: discountAmount,
        subtotal: subtotal,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        status: 'completed',
        customerPhone: customerPhone || null
    };
    
    // Add to sales data
    salesData.unshift(newTransaction);
    filteredSales.unshift(newTransaction);
    
    // Close modal
    document.getElementById('newSaleModal').classList.remove('active');
    
    // Reset form
    resetSaleForm();
    
    // Update UI
    updateSalesKPIs();
    updateTopProductsList();
    updateSalesTransactionsTable();
    updateSalesCharts();
    updateTodaySales();
    
    // Show success message
    showSalesNotification(`Sale recorded successfully! Transaction ID: ${newTransaction.id}`, 'success');
    
    console.log('New sale recorded:', newTransaction);
}

// Handle analytics tab change
function handleAnalyticsTabChange(e) {
    const tab = e.target.dataset.tab;
    
    // Update active tab
    document.querySelectorAll('.analytics-tab').forEach(t => {
        t.classList.remove('active');
    });
    e.target.classList.add('active');
    
    currentAnalyticsTab = tab;
    updateAnalyticsTab();
}

// Update analytics tab content
function updateAnalyticsTab() {
    // Hide all tab contents
    document.querySelectorAll('.analytics-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show active tab content
    document.getElementById(`${currentAnalyticsTab}Tab`).classList.add('active');
}

// Populate store dropdown
function populateStoreDropdown() {
    const stores = [
        { id: 'ST001', name: 'ElectroTech', category: 'electronics' },
        { id: 'ST002', name: 'Fashion Hub', category: 'fashion' },
        { id: 'ST003', name: 'Coffee Brew', category: 'food' },
        { id: 'ST004', name: 'Sports Zone', category: 'sports' },
        { id: 'ST005', name: 'Home & Living', category: 'home' },
        { id: 'ST006', name: 'Beauty Glow', category: 'beauty' },
        { id: 'ST007', name: 'Book Haven', category: 'books' },
        { id: 'ST008', name: 'Jewel Palace', category: 'jewelry' },
        { id: 'ST009', name: 'Food Court - Italian Corner', category: 'food' },
        { id: 'ST010', name: 'CineMax', category: 'entertainment' }
    ];
    
    const storeSelect = document.getElementById('saleStore');
    stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store.id;
        option.textContent = `${store.name} (${store.category})`;
        option.dataset.category = store.category;
        storeSelect.appendChild(option);
    });
}

// Initialize product search
function initProductSearch() {
    const productSearch = document.getElementById('productSearch');
    const suggestions = document.getElementById('productSuggestions');
    
    const sampleProducts = [
        'Wireless Headphones',
        'Designer T-Shirt',
        'Premium Coffee',
        'Yoga Mat',
        'LED Desk Lamp',
        'Face Cream',
        'Running Shoes',
        'Novel Book',
        'Smartphone Case',
        'Leather Jacket',
        'Gourmet Pizza',
        'Movie Ticket',
        'Face Wash',
        'Sofa Set',
        'Gaming Console'
    ];
    
    productSearch.addEventListener('input', () => {
        const searchTerm = productSearch.value.toLowerCase();
        
        if (searchTerm.length < 2) {
            suggestions.style.display = 'none';
            return;
        }
        
        const filteredProducts = sampleProducts.filter(product => 
            product.toLowerCase().includes(searchTerm)
        );
        
        if (filteredProducts.length > 0) {
            let html = '';
            filteredProducts.forEach(product => {
                const price = Math.floor(Math.random() * 5000) + 500;
                html += `
                    <div class="suggestion-item" data-product="${product}" data-price="${price}">
                        <div class="suggestion-name">${product}</div>
                        <div class="suggestion-details">
                            <span>₹ ${price.toLocaleString('en-IN')}</span>
                            <span>${getRandomCategory()}</span>
                        </div>
                    </div>
                `;
            });
            
            suggestions.innerHTML = html;
            suggestions.style.display = 'block';
            
            // Add click event to suggestions
            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const product = item.dataset.product;
                    const price = item.dataset.price;
                    productSearch.value = product;
                    document.getElementById('productPrice').value = price;
                    suggestions.style.display = 'none';
                    updateSaleSummary();
                });
            });
        } else {
            suggestions.style.display = 'none';
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!productSearch.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });
}

// Update store category when store is selected
function updateStoreCategory() {
    const storeSelect = document.getElementById('saleStore');
    const selectedOption = storeSelect.options[storeSelect.selectedIndex];
    const category = selectedOption.dataset.category || '';
    document.getElementById('saleCategory').value = category;
}

// Update sale summary
function updateSaleSummary() {
    const unitPrice = parseFloat(document.getElementById('productPrice').value) || 0;
    const quantity = parseInt(document.getElementById('productQuantity').value) || 0;
    const discount = parseFloat(document.getElementById('productDiscount').value) || 0;
    
    const subtotal = unitPrice * quantity;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;
    
    document.getElementById('summarySubtotal').textContent = `₹ ${subtotal.toFixed(2)}`;
    document.getElementById('summaryDiscount').textContent = `₹ ${discountAmount.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `₹ ${total.toFixed(2)}`;
}

// Reset sale form
function resetSaleForm() {
    document.getElementById('newSaleForm').reset();
    document.getElementById('productQuantity').value = 1;
    document.getElementById('productDiscount').value = 0;
    updateSaleSummary();
}

// View transaction details
function viewTransaction(transactionId) {
    const transaction = salesData.find(s => s.id === transactionId);
    if (!transaction) return;
    
    const modal = document.getElementById('transactionDetailModal');
    const content = document.getElementById('transactionDetailContent');
    
    const saleDate = luxon.DateTime.fromISO(transaction.timestamp);
    const statusClass = transaction.status === 'refunded' ? 'refunded' : 
                       transaction.status === 'pending' ? 'pending' : 
                       transaction.status === 'processing' ? 'processing' : 'completed';
    
    content.innerHTML = `
        <div class="transaction-header">
            <div class="transaction-id">${transaction.id}</div>
            <div class="transaction-time">${saleDate.toFormat('dd MMM yyyy, hh:mm a')}</div>
        </div>
        
        <div class="transaction-details-grid">
            <div class="detail-group">
                <h4>Store Information</h4>
                <div class="detail-item">
                    <span class="detail-label">Store Name</span>
                    <span class="detail-value">${transaction.storeName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Category</span>
                    <span class="detail-value">${transaction.storeCategory}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value status-badge ${statusClass}">
                        ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                </div>
            </div>
            
            <div class="detail-group">
                <h4>Customer & Payment</h4>
                <div class="detail-item">
                    <span class="detail-label">Payment Method</span>
                    <span class="detail-value">${getPaymentMethodLabel(transaction.paymentMethod)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Customer Phone</span>
                    <span class="detail-value">${transaction.customerPhone || 'Not provided'}</span>
                </div>
            </div>
        </div>
        
        <div class="transaction-items">
            <h4>Product Details</h4>
            <div class="transaction-item">
                <div class="item-info">
                    <div class="item-name">${transaction.productName}</div>
                    <div class="item-details">${transaction.productCategory} • Qty: ${transaction.quantity}</div>
                </div>
                <div class="item-amount">
                    <div>₹ ${transaction.unitPrice.toLocaleString('en-IN')} × ${transaction.quantity}</div>
                    <div class="item-total">₹ ${transaction.subtotal.toLocaleString('en-IN')}</div>
                </div>
            </div>
        </div>
        
        <div class="transaction-summary">
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹ ${transaction.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-row">
                <span>Discount (${transaction.discount}%):</span>
                <span>- ₹ ${transaction.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-row total">
                <span>Total Amount:</span>
                <span>₹ ${transaction.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
        </div>
        
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeTransactionDetail()">
                Close
            </button>
            <button class="btn-primary" onclick="printReceipt('${transaction.id}')">
                <i class="fas fa-print"></i> Print Receipt
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// Process refund
function processRefund(transactionId) {
    const transaction = salesData.find(s => s.id === transactionId);
    if (!transaction) return;
    
    if (transaction.status === 'refunded') {
        alert('This transaction has already been refunded.');
        return;
    }
    
    if (confirm(`Process refund for transaction ${transactionId}?\nAmount: ₹ ${transaction.totalAmount.toLocaleString('en-IN')}`)) {
        // Update transaction status
        transaction.status = 'refunded';
        
        // Update UI
        updateSalesTransactionsTable();
        updateSalesKPIs();
        
        // Show success message
        showSalesNotification(`Refund processed for transaction ${transactionId}`, 'success');
    }
}

// Generate sales report
function generateSalesReport() {
    const periodData = getCurrentPeriodData();
    const totalRevenue = periodData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalTransactions = periodData.length;
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    const report = `
        Sales Report - ${document.getElementById('currentDateRange').textContent}
        ============================================
        
        Summary:
        ----------
        Total Revenue: ₹ ${formatRevenue(totalRevenue)}
        Total Transactions: ${totalTransactions}
        Average Order Value: ₹ ${Math.round(avgOrderValue).toLocaleString('en-IN')}
        
        Top Products:
        ------------
        ${getTopProductsReport()}
        
        Store Performance:
        -----------------
        ${getStorePerformanceReport()}
        
        Generated on: ${luxon.DateTime.now().toFormat('dd MMM yyyy, hh:mm a')}
    `;
    
    // In a real app, this would generate and download a file
    alert('Report generated successfully!\n\n' + report);
    
    // Simulate download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${luxon.DateTime.now().toFormat('yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Export sales data
function exportSalesData() {
    const dataToExport = filteredSales.map(sale => ({
        'Transaction ID': sale.id,
        'Date': sale.date,
        'Time': sale.time,
        'Store': sale.storeName,
        'Product': sale.productName,
        'Quantity': sale.quantity,
        'Unit Price': sale.unitPrice,
        'Discount': `${sale.discount}%`,
        'Total Amount': sale.totalAmount,
        'Payment Method': getPaymentMethodLabel(sale.paymentMethod),
        'Status': sale.status
    }));
    
    // Convert to CSV
    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-data-${luxon.DateTime.now().toFormat('yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSalesNotification('Sales data exported successfully!', 'success');
}

// Pagination functions
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        updateSalesTransactionsTable();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateSalesTransactionsTable();
    }
}

// Helper functions
function getCurrentPeriodData() {
    const now = luxon.DateTime.now();
    let startDate, endDate;
    
    switch (currentDateRange) {
        case 'today':
            startDate = now.startOf('day');
            endDate = now.endOf('day');
            break;
        case 'week':
            startDate = now.startOf('week');
            endDate = now.endOf('week');
            break;
        case 'month':
            startDate = now.startOf('month');
            endDate = now.endOf('month');
            break;
        default:
            // For custom range or all data
            return salesData;
    }
    
    return salesData.filter(sale => {
        const saleDate = luxon.DateTime.fromISO(sale.timestamp);
        return saleDate >= startDate && saleDate <= endDate;
    });
}

function getPreviousPeriodData() {
    const now = luxon.DateTime.now();
    let startDate, endDate;
    
    switch (currentDateRange) {
        case 'today':
            startDate = now.minus({ days: 1 }).startOf('day');
            endDate = now.minus({ days: 1 }).endOf('day');
            break;
        case 'week':
            startDate = now.minus({ weeks: 1 }).startOf('week');
            endDate = now.minus({ weeks: 1 }).endOf('week');
            break;
        case 'month':
            startDate = now.minus({ months: 1 }).startOf('month');
            endDate = now.minus({ months: 1 }).endOf('month');
            break;
        default:
            return [];
    }
    
    return salesData.filter(sale => {
        const saleDate = luxon.DateTime.fromISO(sale.timestamp);
        return saleDate >= startDate && saleDate <= endDate;
    });
}

function getTotalRevenue() {
    return salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
}

function formatRevenue(amount) {
    if (amount >= 10000000) {
        return (amount / 10000000).toFixed(1) + 'Cr';
    } else if (amount >= 100000) {
        return (amount / 100000).toFixed(1) + 'L';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toLocaleString('en-IN');
}

function updateDateRangeDisplay(startDate = null, endDate = null) {
    const dateRangeElement = document.getElementById('currentDateRange');
    const now = luxon.DateTime.now();
    
    switch (currentDateRange) {
        case 'today':
            dateRangeElement.textContent = now.toFormat('dd MMM yyyy');
            break;
        case 'week':
            const weekStart = now.startOf('week');
            const weekEnd = now.endOf('week');
            dateRangeElement.textContent = `${weekStart.toFormat('dd MMM')} - ${weekEnd.toFormat('dd MMM yyyy')}`;
            break;
        case 'month':
            dateRangeElement.textContent = now.toFormat('MMMM yyyy');
            break;
        case 'custom':
            if (startDate && endDate) {
                const start = luxon.DateTime.fromISO(startDate);
                const end = luxon.DateTime.fromISO(endDate);
                dateRangeElement.textContent = `${start.toFormat('dd MMM')} - ${end.toFormat('dd MMM yyyy')}`;
            } else {
                dateRangeElement.textContent = 'Custom Date Range';
            }
            break;
        default:
            dateRangeElement.textContent = 'All Time';
    }
}

function getPaymentMethodLabel(method) {
    const labels = {
        cash: 'Cash',
        card: 'Card',
        upi: 'UPI',
        wallet: 'Mobile Wallet',
        netbanking: 'Net Banking'
    };
    return labels[method] || method;
}

function getPaymentMethodIcon(method) {
    const icons = {
        cash: 'money-bill-wave',
        card: 'credit-card',
        upi: 'mobile-alt',
        wallet: 'wallet',
        netbanking: 'university'
    };
    return icons[method] || 'money-bill-wave';
}

function getStoreById(storeId) {
    const stores = [
        { id: 'ST001', name: 'ElectroTech', category: 'electronics' },
        { id: 'ST002', name: 'Fashion Hub', category: 'fashion' },
        { id: 'ST003', name: 'Coffee Brew', category: 'food' },
        { id: 'ST004', name: 'Sports Zone', category: 'sports' },
        { id: 'ST005', name: 'Home & Living', category: 'home' },
        { id: 'ST006', name: 'Beauty Glow', category: 'beauty' },
        { id: 'ST007', name: 'Book Haven', category: 'books' },
        { id: 'ST008', name: 'Jewel Palace', category: 'jewelry' },
        { id: 'ST009', name: 'Food Court - Italian Corner', category: 'food' },
        { id: 'ST010', name: 'CineMax', category: 'entertainment' }
    ];
    return stores.find(store => store.id === storeId) || { id: storeId, name: 'Unknown Store', category: 'other' };
}

function generatePhoneNumber() {
    return `9${Math.floor(Math.random() * 900000000) + 100000000}`;
}

function getRandomCategory() {
    const categories = ['Electronics', 'Fashion', 'Food', 'Sports', 'Home', 'Beauty', 'Books', 'Entertainment'];
    return categories[Math.floor(Math.random() * categories.length)];
}

function getTopProductsReport() {
    const productSales = {};
    
    salesData.forEach(sale => {
        if (!productSales[sale.productName]) {
            productSales[sale.productName] = {
                revenue: 0,
                quantity: 0
            };
        }
        productSales[sale.productName].revenue += sale.totalAmount;
        productSales[sale.productName].quantity += sale.quantity;
    });
    
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5);
    
    return topProducts.map(([name, data], index) => 
        `${index + 1}. ${name}: ₹ ${formatRevenue(data.revenue)} (${data.quantity} units)`
    ).join('\n');
}

function getStorePerformanceReport() {
    const storeSales = {};
    
    salesData.forEach(sale => {
        if (!storeSales[sale.storeName]) {
            storeSales[sale.storeName] = {
                revenue: 0,
                transactions: 0
            };
        }
        storeSales[sale.storeName].revenue += sale.totalAmount;
        storeSales[sale.storeName].transactions += 1;
    });
    
    const topStores = Object.entries(storeSales)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5);
    
    return topStores.map(([name, data], index) => 
        `${index + 1}. ${name}: ₹ ${formatRevenue(data.revenue)} (${data.transactions} transactions)`
    ).join('\n');
}

function closeTransactionDetail() {
    document.getElementById('transactionDetailModal').classList.remove('active');
}

function printReceipt(transactionId) {
    const transaction = salesData.find(s => s.id === transactionId);
    if (!transaction) return;
    
    const receiptWindow = window.open('', '_blank');
    const saleDate = luxon.DateTime.fromISO(transaction.timestamp);
    
    receiptWindow.document.write(`
        <html>
        <head>
            <title>Receipt - ${transaction.id}</title>
            <style>
                body { font-family: monospace; margin: 20px; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .store-name { font-size: 18px; font-weight: bold; }
                .transaction-id { font-size: 14px; color: #666; }
                .item { display: flex; justify-content: space-between; margin: 10px 0; }
                .total { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <div class="store-name">MallX Shopping Mall</div>
                    <div>Receipt</div>
                    <div class="transaction-id">${transaction.id}</div>
                    <div>${saleDate.toFormat('dd MMM yyyy, hh:mm a')}</div>
                </div>
                
                <div class="item">
                    <span>${transaction.productName}</span>
                    <span>₹ ${transaction.unitPrice.toLocaleString('en-IN')} × ${transaction.quantity}</span>
                </div>
                
                <div class="item">
                    <span>Subtotal</span>
                    <span>₹ ${transaction.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div class="item">
                    <span>Discount (${transaction.discount}%)</span>
                    <span>- ₹ ${transaction.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div class="item total">
                    <span>TOTAL</span>
                    <span>₹ ${transaction.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div class="item">
                    <span>Payment Method</span>
                    <span>${getPaymentMethodLabel(transaction.paymentMethod)}</span>
                </div>
                
                <div class="footer">
                    <div>Thank you for shopping with us!</div>
                    <div>Visit again</div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    receiptWindow.document.close();
    receiptWindow.print();
}

function showSalesNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `sales-notification-toast ${type}`;
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

// Initialize sales management when page loads
document.addEventListener('DOMContentLoaded', initSalesManagement);