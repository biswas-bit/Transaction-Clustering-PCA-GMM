// Add these variables to the top of your existing script.js
let transactionsData = [];
let totalRevenue = 0;
let todayRevenue = 0;

// Add these functions to your existing script.js

// Initialize Transaction System
function initTransactionSystem() {
    // Load sample transactions
    loadSampleTransactions();
    
    // Initialize transaction form
    initTransactionForm();
    
    // Update current time display
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Update auto-captured features
    updateAutoFeatures();
    setInterval(updateAutoFeatures, 60000); // Update every minute
    
    // Setup event listeners for transaction system
    setupTransactionEventListeners();
    
    // Calculate initial totals
    updateTransactionTotals();
    
    // Update charts with transaction data
    updateChartsWithTransactionData();
}

// Load sample transactions for demo
function loadSampleTransactions() {
    const sampleTransactions = [
        {
            id: generateTransactionId(),
            product: "Wireless Headphones",
            quantity: 2,
            unitPrice: 2999,
            totalValue: 5998,
            category: "electronics",
            hour: 14,
            dayOfWeek: "Monday",
            month: 1,
            timestamp: new Date()
        },
        {
            id: generateTransactionId(),
            product: "Designer T-Shirt",
            quantity: 1,
            unitPrice: 2499,
            totalValue: 2499,
            category: "fashion",
            hour: 15,
            dayOfWeek: "Monday",
            month: 1,
            timestamp: new Date()
        },
        {
            id: generateTransactionId(),
            product: "Premium Coffee",
            quantity: 3,
            unitPrice: 350,
            totalValue: 1050,
            category: "food",
            hour: 16,
            dayOfWeek: "Monday",
            month: 1,
            timestamp: new Date()
        },
        {
            id: generateTransactionId(),
            product: "Yoga Mat",
            quantity: 1,
            unitPrice: 1899,
            totalValue: 1899,
            category: "sports",
            hour: 17,
            dayOfWeek: "Monday",
            month: 1,
            timestamp: new Date()
        }
    ];
    
    transactionsData = sampleTransactions;
    updateTransactionTotals();
    updateLiveTransactionsTable();
}

// Initialize Transaction Form
function initTransactionForm() {
    const form = document.getElementById('transactionForm');
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('unitPrice');
    
    // Calculate total when quantity or price changes
    quantityInput.addEventListener('input', updateTotalPreview);
    priceInput.addEventListener('input', updateTotalPreview);
    
    // Form submission
    form.addEventListener('submit', handleTransactionSubmit);
    
    // Quick add button
    document.getElementById('quickAddBtn').addEventListener('click', addSampleTransaction);
    
    // Clear transactions button
    document.getElementById('clearTransactionsBtn').addEventListener('click', clearAllTransactions);
    
    // Transaction tab click
    document.getElementById('transactionTab').addEventListener('click', scrollToTransactionSection);
}

// Update current time display
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    document.getElementById('timeDisplay').textContent = timeString;
}

// Update auto-captured ML features
function updateAutoFeatures() {
    const now = new Date();
    
    // Get hour (0-23)
    const hour = now.getHours();
    document.getElementById('autoHour').textContent = hour + ':00';
    
    // Get day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[now.getDay()];
    document.getElementById('autoDay').textContent = dayOfWeek;
    
    // Get month
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[now.getMonth()];
    const monthNumber = now.getMonth() + 1;
    document.getElementById('autoMonth').textContent = `${month} (${monthNumber})`;
}

// Update total preview
function updateTotalPreview() {
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
    const total = quantity * unitPrice;
    
    document.getElementById('totalPreview').textContent = 
        `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Handle transaction submission
function handleTransactionSubmit(event) {
    event.preventDefault();
    
    const productName = document.getElementById('productName').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const category = document.getElementById('category').value;
    
    if (!productName || !quantity || !unitPrice || !category) {
        showErrorToast("Please fill all fields correctly");
        return;
    }
    
    // Get current timestamp and derive ML features
    const now = new Date();
    const hour = now.getHours();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[now.getDay()];
    const month = now.getMonth() + 1; // 1-12
    const totalValue = quantity * unitPrice;
    
    // Create transaction object
    const transaction = {
        id: generateTransactionId(),
        product: productName,
        quantity: quantity,
        unitPrice: unitPrice,
        totalValue: totalValue,
        category: category,
        hour: hour,
        dayOfWeek: dayOfWeek,
        month: month,
        timestamp: now
    };
    
    // Add to transactions array
    transactionsData.unshift(transaction); // Add to beginning
    
    // Update UI
    updateLiveTransactionsTable();
    updateTransactionTotals();
    updateChartsWithTransactionData();
    
    // Update dashboard KPIs
    updateDashboardKPIs();
    
    // Show success toast
    showSuccessToast(transaction);
    
    // Reset form
    resetTransactionForm();
    
    console.log('Transaction added:', transaction);
    console.log('All transactions:', transactionsData);
}

// Add sample transaction
function addSampleTransaction() {
    const sampleProducts = [
        { product: "Smartphone Case", price: 899, category: "electronics" },
        { product: "Leather Jacket", price: 5999, category: "fashion" },
        { product: "Gourmet Pizza", price: 599, category: "food" },
        { product: "LED Desk Lamp", price: 1299, category: "home" },
        { product: "Face Cream", price: 2499, category: "beauty" },
        { product: "Running Shoes", price: 3999, category: "sports" },
        { product: "Movie Ticket", price: 350, category: "entertainment" },
        { product: "Novel Book", price: 499, category: "books" }
    ];
    
    const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3
    
    // Fill form with sample data
    document.getElementById('productName').value = randomProduct.product;
    document.getElementById('quantity').value = quantity;
    document.getElementById('unitPrice').value = randomProduct.price;
    document.getElementById('category').value = randomProduct.category;
    
    // Update preview
    updateTotalPreview();
    updateAutoFeatures();
    
    // Submit the form
    const form = document.getElementById('transactionForm');
    form.dispatchEvent(new Event('submit'));
}

// Clear all transactions
function clearAllTransactions() {
    if (transactionsData.length === 0) return;
    
    if (confirm('Are you sure you want to clear all transactions? This action cannot be undone.')) {
        transactionsData = [];
        updateLiveTransactionsTable();
        updateTransactionTotals();
        updateChartsWithTransactionData();
        updateDashboardKPIs();
        
        showToast('All transactions cleared', 'info');
    }
}

// Update live transactions table
function updateLiveTransactionsTable() {
    const tableBody = document.getElementById('liveTransactionsTable');
    const emptyRow = tableBody.querySelector('.empty-row');
    
    if (transactionsData.length === 0) {
        if (!emptyRow) {
            tableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6" class="empty-message">
                        <i class="fas fa-shopping-cart"></i>
                        <p>No transactions yet. Add your first transaction!</p>
                    </td>
                </tr>
            `;
        }
        return;
    }
    
    // Remove empty row if it exists
    if (emptyRow) {
        emptyRow.remove();
    }
    
    // Add transactions (show latest 10)
    const transactionsToShow = transactionsData.slice(0, 10);
    let tableHTML = '';
    
    transactionsToShow.forEach((transaction, index) => {
        const timeString = transaction.timestamp.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        tableHTML += `
            <tr class="${index === 0 ? 'transaction-highlight' : ''}">
                <td>${timeString}</td>
                <td><strong>${transaction.product}</strong></td>
                <td>
                    <span class="category-badge ${transaction.category}">
                        ${transaction.category}
                    </span>
                </td>
                <td>${transaction.quantity}</td>
                <td>₹ ${transaction.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td><strong>₹ ${transaction.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    
    // Update transaction count
    document.getElementById('transactionCount').textContent = transactionsData.length;
}

// Update transaction totals
function updateTransactionTotals() {
    // Calculate today's revenue
    const today = new Date().toDateString();
    const todayTransactions = transactionsData.filter(t => 
        t.timestamp.toDateString() === today
    );
    
    todayRevenue = todayTransactions.reduce((sum, t) => sum + t.totalValue, 0);
    document.getElementById('todayTotal').textContent = 
        `₹ ${todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Calculate average transaction value
    const avgValue = transactionsData.length > 0 
        ? transactionsData.reduce((sum, t) => sum + t.totalValue, 0) / transactionsData.length
        : 0;
    
    document.getElementById('avgTransaction').textContent = 
        `₹ ${avgValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Update dashboard KPIs with transaction data
function updateDashboardKPIs() {
    // Update total sales
    const totalSales = transactionsData.reduce((sum, t) => sum + t.totalValue, 0);
    
    // Format as Indian Rupees with lakhs/crores
    let formattedTotal;
    if (totalSales >= 10000000) { // 1 crore
        formattedTotal = `₹ ${(totalSales / 10000000).toFixed(2)}Cr`;
    } else if (totalSales >= 100000) { // 1 lakh
        formattedTotal = `₹ ${(totalSales / 100000).toFixed(2)}L`;
    } else {
        formattedTotal = `₹ ${totalSales.toLocaleString('en-IN')}`;
    }
    
    document.getElementById('totalSales').textContent = formattedTotal;
    
    // Animate the update
    const kpiCard = document.querySelector('.kpi-card:first-child');
    kpiCard.style.transform = 'scale(1.05)';
    setTimeout(() => {
        kpiCard.style.transform = 'scale(1)';
    }, 300);
}

// Update charts with transaction data
function updateChartsWithTransactionData() {
    // Update category chart
    updateCategoryChart();
    
    // Update hourly chart
    updateHourlyChart();
}

// Update category contribution chart
function updateCategoryChart() {
    if (!sourceChart || transactionsData.length === 0) return;
    
    // Calculate category totals
    const categoryTotals = {};
    transactionsData.forEach(transaction => {
        if (!categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] = 0;
        }
        categoryTotals[transaction.category] += transaction.totalValue;
    });
    
    // Prepare data for chart
    const categories = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    
    // Update chart data
    sourceChart.data.labels = categories.map(cat => 
        cat.charAt(0).toUpperCase() + cat.slice(1)
    );
    sourceChart.data.datasets[0].data = values;
    
    // Generate colors for categories
    const categoryColors = {
        electronics: '#4361ee',
        fashion: '#7209b7',
        food: '#4cc9f0',
        home: '#f72585',
        beauty: '#b5179e',
        sports: '#3a0ca3',
        entertainment: '#560bad',
        books: '#480ca8',
        other: '#3f37c9'
    };
    
    sourceChart.data.datasets[0].backgroundColor = categories.map(cat => 
        categoryColors[cat] || '#6c757d'
    );
    
    sourceChart.update();
}

// Update hourly transaction volume chart
function updateHourlyChart() {
    if (!visitorsChart) return;
    
    // Calculate transactions per hour
    const hourlyCounts = Array(24).fill(0);
    transactionsData.forEach(transaction => {
        hourlyCounts[transaction.hour]++;
    });
    
    // Update chart data
    visitorsChart.data.datasets[0].data = hourlyCounts.slice(10, 22); // 10AM to 10PM
    
    visitorsChart.update();
}

// Reset transaction form
function resetTransactionForm() {
    document.getElementById('transactionForm').reset();
    document.getElementById('quantity').value = 1;
    updateTotalPreview();
    document.getElementById('productName').focus();
}

// Generate unique transaction ID
function generateTransactionId() {
    return 'TX' + Date.now() + Math.floor(Math.random() * 1000);
}

// Show success toast
function showSuccessToast(transaction) {
    const toast = document.getElementById('successToast');
    const toastContent = toast.querySelector('.toast-content p');
    
    toastContent.textContent = `Added ${transaction.product} - ₹${transaction.totalValue.toLocaleString('en-IN')}`;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show error toast
function showErrorToast(message) {
    const toast = document.getElementById('successToast');
    const toastIcon = toast.querySelector('.toast-icon i');
    const toastTitle = toast.querySelector('.toast-content h4');
    const toastContent = toast.querySelector('.toast-content p');
    
    toastIcon.className = 'fas fa-exclamation-circle';
    toastIcon.style.color = '#e74c3c';
    toastTitle.textContent = 'Error';
    toastContent.textContent = message;
    toast.style.borderLeftColor = '#e74c3c';
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        // Reset toast to success style
        toastIcon.className = 'fas fa-check-circle';
        toastIcon.style.color = '#2ecc71';
        toastTitle.textContent = 'Transaction Added!';
        toast.style.borderLeftColor = '#2ecc71';
    }, 3000);
}

// Show generic toast
function showToast(message, type = 'info') {
    const toast = document.getElementById('successToast');
    const toastIcon = toast.querySelector('.toast-icon i');
    const toastTitle = toast.querySelector('.toast-content h4');
    const toastContent = toast.querySelector('.toast-content p');
    
    const styles = {
        info: { icon: 'fas fa-info-circle', color: '#3498db', title: 'Info' },
        success: { icon: 'fas fa-check-circle', color: '#2ecc71', title: 'Success' },
        warning: { icon: 'fas fa-exclamation-triangle', color: '#f39c12', title: 'Warning' },
        error: { icon: 'fas fa-exclamation-circle', color: '#e74c3c', title: 'Error' }
    };
    
    const style = styles[type] || styles.info;
    
    toastIcon.className = style.icon;
    toastIcon.style.color = style.color;
    toastTitle.textContent = style.title;
    toastContent.textContent = message;
    toast.style.borderLeftColor = style.color;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        // Reset to default success style
        toastIcon.className = 'fas fa-check-circle';
        toastIcon.style.color = '#2ecc71';
        toastTitle.textContent = 'Transaction Added!';
        toast.style.borderLeftColor = '#2ecc71';
    }, 3000);
}

// Scroll to transaction section
function scrollToTransactionSection(event) {
    event.preventDefault();
    const transactionSection = document.querySelector('.transaction-entry-section');
    transactionSection.scrollIntoView({ behavior: 'smooth' });
    
    // Highlight the section
    transactionSection.style.boxShadow = '0 0 0 3px rgba(67, 97, 238, 0.3)';
    setTimeout(() => {
        transactionSection.style.boxShadow = 'none';
    }, 2000);
}

// Setup transaction event listeners
function setupTransactionEventListeners() {
    // Close toast
    document.querySelector('.toast-close').addEventListener('click', function() {
        document.getElementById('successToast').classList.remove('show');
    });
    
    // Refresh categories chart
    document.getElementById('refreshCategories').addEventListener('click', function() {
        updateCategoryChart();
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.style.transform = 'rotate(0deg)';
        }, 300);
    });
    
    // Update total on form changes
    document.getElementById('productName').addEventListener('input', updateAutoFeatures);
    document.getElementById('category').addEventListener('change', updateAutoFeatures);
}

// Add this to your existing document ready function
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    
    // Initialize transaction system
    initTransactionSystem();
    
    // ... rest of existing code ...
});

// Update your existing updateDashboardKPIs function to include transaction data
function updateDashboardKPIs() {
    // Existing code...
    
    // Add transaction-based updates
    const totalTransactions = transactionsData.length;
    const totalRevenueFromTransactions = transactionsData.reduce((sum, t) => sum + t.totalValue, 0);
    
    // Update conversion rate based on transactions
    const conversionRateElement = document.getElementById('conversionRate');
    const baseConversion = 4.8;
    const transactionImpact = Math.min(totalTransactions * 0.01, 2); // Max 2% increase
    const newConversionRate = (baseConversion + transactionImpact).toFixed(1);
    conversionRateElement.textContent = `${newConversionRate}%`;
    
    // Update profit margin based on transaction volume
    const profitMarginElement = document.getElementById('profitMargin');
    const baseMargin = 24.6;
    const marginImpact = Math.min(totalTransactions * 0.05, 5); // Max 5% increase
    const newProfitMargin = (baseMargin + marginImpact).toFixed(1);
    profitMarginElement.textContent = `${newProfitMargin}%`;
}

// Dashboard Data
const dashboardData = {
    kpis: {
        totalSales: 1284560,
        totalVisitors: 45820,
        conversionRate: 4.8,
        profitMargin: 24.6
    },
    
    salesTrend: {
        currentWeek: [42000, 51000, 68000, 81000, 92000, 105000, 124000],
        lastWeek: [38000, 45000, 59000, 72000, 85000, 97000, 110000],
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    
    purchaseSources: {
        labels: ['In-store', 'Online', 'Food Court', 'Entertainment'],
        data: [45, 25, 20, 10],
        colors: ['#4361ee', '#4cc9f0', '#7209b7', '#f72585']
    },
    
    visitorsPerDay: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        visitors: [5200, 6100, 7200, 6800, 8900, 11500, 10200]
    },
    
    heatmapData: {
        hours: ['10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'],
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [
            [120, 230, 340, 210, 180, 90, 40],
            [180, 290, 410, 320, 270, 160, 70],
            [210, 340, 520, 410, 390, 240, 120],
            [190, 310, 450, 380, 320, 210, 100],
            [240, 390, 580, 520, 480, 320, 180],
            [320, 510, 720, 680, 610, 450, 290],
            [280, 430, 610, 540, 490, 350, 210]
        ]
    },
    
    recentTransactions: [
        {
            customer: 'Rahul Sharma',
            store: 'ElectroHub',
            amount: '₹ 24,599',
            time: '10:24 AM',
            status: 'completed'
        },
        {
            customer: 'Priya Patel',
            store: 'Fashion Trends',
            amount: '₹ 12,850',
            time: '09:45 AM',
            status: 'completed'
        },
        {
            customer: 'Amit Kumar',
            store: 'Food Court - Burger King',
            amount: '₹ 1,250',
            time: '09:12 AM',
            status: 'pending'
        },
        {
            customer: 'Sneha Reddy',
            store: 'Home & Living',
            amount: '₹ 32,400',
            time: 'Yesterday',
            status: 'completed'
        },
        {
            customer: 'Vikram Singh',
            store: 'Sports Zone',
            amount: '₹ 8,750',
            time: 'Yesterday',
            status: 'completed'
        },
        {
            customer: 'Anjali Mehta',
            store: 'Book Haven',
            amount: '₹ 2,340',
            time: 'Jan 24',
            status: 'failed'
        },
        {
            customer: 'Rajesh Nair',
            store: 'Cinema Plex',
            amount: '₹ 1,800',
            time: 'Jan 24',
            status: 'completed'
        }
    ]
};

// DOM Elements
let salesChart, sourceChart, visitorsChart, heatmapChart;
const menuToggle = document.getElementById('menuToggle');
const notificationBtn = document.getElementById('notificationBtn');
const notificationPanel = document.getElementById('notificationPanel');
const closeNotifications = document.getElementById('closeNotifications');
const transactionsTable = document.getElementById('transactionsTable');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize KPI counters with animation
    initKPICounters();
    
    // Initialize charts
    initSalesChart();
    initSourceChart();
    initVisitorsChart();
    initHeatmapChart();
    
    // Initialize transactions table
    initTransactionsTable();
    
    // Setup event listeners
    setupEventListeners();
});

// Initialize KPI counters with animation
function initKPICounters() {
    animateCounter('totalSales', dashboardData.kpis.totalSales, '₹ ', '', 0);
    animateCounter('totalVisitors', dashboardData.kpis.totalVisitors, '', '', 0);
    animateCounter('conversionRate', dashboardData.kpis.conversionRate, '', '%', 1);
    animateCounter('profitMargin', dashboardData.kpis.profitMargin, '', '%', 1);
}

// Animate counter from 0 to target value
function animateCounter(elementId, targetValue, prefix = '', suffix = '', decimals = 0) {
    const element = document.getElementById(elementId);
    let currentValue = 0;
    const duration = 1500; // Animation duration in ms
    const increment = targetValue / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
        currentValue += increment;
        
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        // Format the number with commas
        let formattedValue;
        if (decimals > 0) {
            formattedValue = currentValue.toFixed(decimals);
        } else {
            formattedValue = Math.floor(currentValue).toLocaleString('en-IN');
        }
        
        element.textContent = prefix + formattedValue + suffix;
    }, 16);
}

// Initialize Sales Chart
function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dashboardData.salesTrend.days,
            datasets: [
                {
                    label: 'Current Week',
                    data: dashboardData.salesTrend.currentWeek,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4361ee',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Last Week',
                    data: dashboardData.salesTrend.lastWeek,
                    borderColor: '#4cc9f0',
                    backgroundColor: 'rgba(76, 201, 240, 0.05)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4cc9f0',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
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
                    titleFont: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    },
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
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        color: '#6c757d'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        color: '#6c757d',
                        callback: function(value) {
                            return '₹ ' + value.toLocaleString('en-IN');
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
}

// Initialize Source Chart (Donut)
function initSourceChart() {
    const ctx = document.getElementById('sourceChart').getContext('2d');
    
    sourceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: dashboardData.purchaseSources.labels,
            datasets: [{
                data: dashboardData.purchaseSources.data,
                backgroundColor: dashboardData.purchaseSources.colors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 13
                        },
                        color: '#343a40'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize Visitors Chart (Bar)
function initVisitorsChart() {
    const ctx = document.getElementById('visitorsChart').getContext('2d');
    
    visitorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dashboardData.visitorsPerDay.days,
            datasets: [{
                label: 'Visitors',
                data: dashboardData.visitorsPerDay.visitors,
                backgroundColor: [
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(115, 9, 183, 0.7)',
                    'rgba(115, 9, 183, 0.7)'
                ],
                borderColor: [
                    '#4361ee',
                    '#4361ee',
                    '#4361ee',
                    '#4361ee',
                    '#4361ee',
                    '#7209b7',
                    '#7209b7'
                ],
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false,
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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    },
                    callbacks: {
                        label: function(context) {
                            return `Visitors: ${context.parsed.y.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        color: '#6c757d'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        color: '#6c757d',
                        callback: function(value) {
                            return value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

// Initialize Heatmap Chart
function initHeatmapChart() {
    const ctx = document.getElementById('heatmapChart').getContext('2d');
    
    // Prepare data for heatmap
    const dataValues = dashboardData.heatmapData.values;
    const hours = dashboardData.heatmapData.hours;
    const days = dashboardData.heatmapData.days;
    
    // Create datasets for each day
    const datasets = days.map((day, dayIndex) => {
        return {
            label: day,
            data: dataValues[dayIndex],
            backgroundColor: dataValues[dayIndex].map(value => {
                // Color intensity based on value
                const intensity = value / 800; // Max value is 800
                return `rgba(67, 97, 238, ${intensity})`;
            }),
            borderColor: '#4361ee',
            borderWidth: 1
        };
    });
    
    heatmapChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'rect',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        color: '#343a40'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    },
                    callbacks: {
                        title: function(tooltipItems) {
                            const hour = tooltipItems[0].label;
                            const day = tooltipItems[0].dataset.label;
                            return `${day}, ${hour}`;
                        },
                        label: function(context) {
                            return `Sales: ₹ ${context.parsed.y.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        },
                        color: '#6c757d'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        color: '#6c757d',
                        callback: function(value) {
                            return '₹ ' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

// Initialize Transactions Table
function initTransactionsTable() {
    let tableHTML = '';
    
    dashboardData.recentTransactions.forEach(transaction => {
        tableHTML += `
            <tr>
                <td>
                    <div class="customer-info">
                        <strong>${transaction.customer}</strong>
                    </div>
                </td>
                <td>${transaction.store}</td>
                <td><strong>${transaction.amount}</strong></td>
                <td>${transaction.time}</td>
                <td><span class="status ${transaction.status}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span></td>
            </tr>
        `;
    });
    
    transactionsTable.innerHTML = tableHTML;
}

// Setup Event Listeners
function setupEventListeners() {
    // Menu toggle for mobile
    menuToggle.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // Notification panel toggle
    notificationBtn.addEventListener('click', function() {
        notificationPanel.classList.add('active');
    });
    
    // Close notification panel
    closeNotifications.addEventListener('click', function() {
        notificationPanel.classList.remove('active');
    });
    
    // Close notification panel when clicking outside
    document.addEventListener('click', function(event) {
        if (!notificationPanel.contains(event.target) && 
            !notificationBtn.contains(event.target) && 
            notificationPanel.classList.contains('active')) {
            notificationPanel.classList.remove('active');
        }
    });
    
    // Mark all notifications as read
    document.querySelector('.mark-all-read').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        document.querySelector('.notification-badge').textContent = '0';
    });
    
    // Update KPI values when date range changes
    document.getElementById('dateRange').addEventListener('change', function() {
        // Simulate data update based on selected range
        const range = this.value;
        let multiplier = 1;
        
        if (range === 'Last 7 days') multiplier = 0.25;
        if (range === 'Last quarter') multiplier = 3;
        if (range === 'Last year') multiplier = 12;
        
        // Update KPI values
        const updatedKPIs = {
            totalSales: Math.round(dashboardData.kpis.totalSales * multiplier),
            totalVisitors: Math.round(dashboardData.kpis.totalVisitors * multiplier),
            conversionRate: dashboardData.kpis.conversionRate + (Math.random() * 0.5 - 0.25),
            profitMargin: dashboardData.kpis.profitMargin + (Math.random() * 0.5 - 0.25)
        };
        
        // Animate to new values
        animateCounter('totalSales', updatedKPIs.totalSales, '₹ ', '', 0);
        animateCounter('totalVisitors', updatedKPIs.totalVisitors, '', '', 0);
        animateCounter('conversionRate', updatedKPIs.conversionRate, '', '%', 1);
        animateCounter('profitMargin', updatedKPIs.profitMargin, '', '%', 1);
        
        // Update date range subtitle
        const dateRangeText = document.querySelector('.date-range');
        const now = new Date();
        let fromDate = new Date();
        
        if (range === 'Last 7 days') {
            fromDate.setDate(now.getDate() - 7);
        } else if (range === 'Last 30 days') {
            fromDate.setDate(now.getDate() - 30);
        } else if (range === 'Last quarter') {
            fromDate.setMonth(now.getMonth() - 3);
        } else if (range === 'Last year') {
            fromDate.setFullYear(now.getFullYear() - 1);
        } else {
            fromDate.setDate(now.getDate() - 30); // Default
        }
        
        dateRangeText.textContent = `${formatDate(fromDate)} - ${formatDate(now)}`;
    });
}

// Helper function to format date
function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Update the current date in the calendar widget
function updateCalendarDate() {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const weekday = now.toLocaleString('default', { weekday: 'long' });
    
    document.querySelector('.date-display .day').textContent = day;
    document.querySelector('.month-year .month').textContent = month;
    document.querySelector('.month-year .year').textContent = year;
    document.querySelector('.weekday').textContent = weekday;
}

// Initialize calendar date
updateCalendarDate();

// Update date every minute (in case page stays open)
setInterval(updateCalendarDate, 60000);