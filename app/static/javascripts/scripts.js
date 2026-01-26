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