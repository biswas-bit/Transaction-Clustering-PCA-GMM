// Customer Management JavaScript

// Customer Data Structure
let customersData = [];
let filteredCustomers = [];
let currentSegment = 'all';
let currentSort = 'recent';
let currentPage = 1;
const itemsPerPage = 10;
let selectedCustomers = new Set();

// Initialize Customer Management System
function initCustomerManagement() {
    // Load sample customer data
    loadSampleCustomers();
    
    // Initialize UI components
    initCustomerUI();
    
    // Setup event listeners
    setupCustomerEventListeners();
    
    // Initialize charts
    initCustomerCharts();
    
    // Update customer displays
    updateCustomerKPIs();
    updateCustomersTable();
    updateTodayInsights();
    updateCustomerInsights();
}

// Load sample customer data
function loadSampleCustomers() {
    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Mohammed', 'Dhruv', 'Kabir', 
                       'Ananya', 'Diya', 'Aadhya', 'Advika', 'Anika', 'Ishita', 'Myra', 'Pari', 'Sara', 'Tanvi'];
    
    const lastNames = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Kumar', 'Singh', 'Nair', 'Menon', 'Iyer', 'Pillai', 
                      'Mehta', 'Joshi', 'Desai', 'Choudhary', 'Gupta', 'Malhotra', 'Kapoor', 'Chopra', 'Khanna', 'Agarwal'];
    
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
    
    const interestsList = ['Fashion', 'Electronics', 'Food', 'Movies', 'Sports', 'Books', 'Music', 'Travel', 'Fitness', 'Gaming', 
                          'Photography', 'Art', 'Cooking', 'Technology', 'Shopping', 'Beauty', 'Home Decor', 'Cars', 'Pets', 'Outdoors'];
    
    const now = luxon.DateTime.now();
    customersData = [];

    for (let i = 0; i < 150; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const age = Math.floor(Math.random() * 50) + 18; // 18-68
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
        const phone = `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
        const city = cities[Math.floor(Math.random() * cities.length)];
        const daysAgo = Math.floor(Math.random() * 365); // Up to 1 year ago
        const joinDate = now.minus({ days: daysAgo });
        
        // Determine customer segment based on behavior
        const totalSpend = Math.floor(Math.random() * 100000) + 1000;
        const visits = Math.floor(Math.random() * 50) + 1;
        const avgSpend = totalSpend / visits;
        
        let segment = 'regular';
        if (avgSpend > 5000) segment = 'high-value';
        if (visits > 30 && avgSpend > 3000) segment = 'vip';
        if (visits > 10 && avgSpend > 2000) segment = 'loyal';
        if (visits <= 2) segment = 'new';
        if (now.diff(joinDate, 'days').days > 180 && visits < 3) segment = 'inactive';
        
        // Generate random interests (2-5 interests per customer)
        const numInterests = Math.floor(Math.random() * 4) + 2;
        const interests = [];
        for (let j = 0; j < numInterests; j++) {
            const interest = interestsList[Math.floor(Math.random() * interestsList.length)];
            if (!interests.includes(interest)) {
                interests.push(interest);
            }
        }
        
        // Calculate loyalty points (1 point per ₹100 spent, bonus for high spenders)
        const loyaltyPoints = Math.floor(totalSpend / 100) + (segment === 'vip' ? 500 : segment === 'loyal' ? 200 : 0);
        
        customersData.push({
            id: `CUST${1000 + i}`,
            name: name,
            gender: gender,
            age: age,
            dob: generateRandomDOB(age),
            email: email,
            phone: phone,
            address: `${Math.floor(Math.random() * 100) + 1} Street, ${city}`,
            city: city,
            joinDate: joinDate.toISODate(),
            joinTimestamp: joinDate.toISO(),
            segment: segment,
            source: ['walk-in', 'online', 'referral', 'campaign', 'event'][Math.floor(Math.random() * 5)],
            interests: interests,
            totalSpend: totalSpend,
            totalVisits: visits,
            avgSpend: avgSpend,
            lastVisit: now.minus({ days: Math.floor(Math.random() * 30) }).toISODate(),
            loyaltyPoints: loyaltyPoints,
            status: segment === 'inactive' ? 'inactive' : 'active',
            communication: {
                email: Math.random() > 0.1,
                sms: Math.random() > 0.2,
                whatsapp: Math.random() > 0.3,
                promotions: Math.random() > 0.15
            },
            satisfaction: (Math.random() * 2 + 3).toFixed(1) // 3-5 star rating
        });
    }

    // Sort by join date (newest first)
    customersData.sort((a, b) => new Date(b.joinTimestamp) - new Date(a.joinTimestamp));
    filteredCustomers = [...customersData];
}

// Initialize UI components
function initCustomerUI() {
    // Initialize search functionality
    const searchInput = document.getElementById('customerSearch');
    searchInput.addEventListener('input', handleCustomerSearch);
    
    // Initialize segment filter
    document.getElementById('customerSegmentFilter').addEventListener('change', handleSegmentFilter);
    
    // Initialize sort dropdown
    document.getElementById('customerSort').addEventListener('change', handleCustomerSort);
    
    // Initialize interests tags input
    initInterestsTags();
}

// Setup event listeners
function setupCustomerEventListeners() {
    // Add customer button
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    const addCustomerModal = document.getElementById('addCustomerModal');
    const closeCustomerModal = document.getElementById('closeCustomerModal');
    const cancelCustomerBtn = document.getElementById('cancelCustomerBtn');
    const addCustomerForm = document.getElementById('addCustomerForm');
    
    addCustomerBtn.addEventListener('click', () => {
        addCustomerModal.classList.add('active');
    });
    
    closeCustomerModal.addEventListener('click', () => {
        addCustomerModal.classList.remove('active');
    });
    
    cancelCustomerBtn.addEventListener('click', () => {
        addCustomerModal.classList.remove('active');
        resetCustomerForm();
    });
    
    addCustomerForm.addEventListener('submit', handleAddCustomer);
    
    // Bulk action button
    const bulkActionBtn = document.getElementById('bulkActionBtn');
    const campaignModal = document.getElementById('campaignModal');
    const closeCampaignModal = document.getElementById('closeCampaignModal');
    const cancelCampaignBtn = document.getElementById('cancelCampaignBtn');
    const campaignForm = document.getElementById('campaignForm');
    
    bulkActionBtn.addEventListener('click', () => {
        if (selectedCustomers.size === 0) {
            alert('Please select customers first by checking the boxes');
            return;
        }
        campaignModal.classList.add('active');
    });
    
    closeCampaignModal.addEventListener('click', () => {
        campaignModal.classList.remove('active');
    });
    
    cancelCampaignBtn.addEventListener('click', () => {
        campaignModal.classList.remove('active');
    });
    
    campaignForm.addEventListener('submit', handleCampaignSend);
    
    // Export customers
    document.getElementById('exportCustomersBtn').addEventListener('click', () => {
        exportCustomerData();
    });
    
    // Pagination
    document.getElementById('prevPageBtn').addEventListener('click', goToPrevPage);
    document.getElementById('nextPageBtn').addEventListener('click', goToNextPage);
    
    // Insights tabs
    document.querySelectorAll('.insights-tab').forEach(tab => {
        tab.addEventListener('click', handleInsightsTabChange);
    });
    
    // Acquisition chart period
    document.getElementById('acquisitionChartPeriod').addEventListener('change', updateAcquisitionChart);
    
    // Engagement tools
    document.getElementById('emailCampaignBtn').addEventListener('click', () => {
        alert('Email campaign feature will be implemented soon!');
    });
    
    document.getElementById('smsCampaignBtn').addEventListener('click', () => {
        alert('SMS campaign feature will be implemented soon!');
    });
    
    document.getElementById('loyaltyRewardsBtn').addEventListener('click', () => {
        alert('Loyalty rewards feature will be implemented soon!');
    });
    
    document.getElementById('feedbackSurveyBtn').addEventListener('click', () => {
        alert('Feedback survey feature will be implemented soon!');
    });
    
    // Select all checkbox
    document.getElementById('selectAllCustomers').addEventListener('change', handleSelectAll);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addCustomerModal) {
            addCustomerModal.classList.remove('active');
        }
        
        if (e.target === document.getElementById('customerDetailModal')) {
            document.getElementById('customerDetailModal').classList.remove('active');
        }
        
        if (e.target === campaignModal) {
            campaignModal.classList.remove('active');
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
}

// Initialize customer charts
function initCustomerCharts() {
    // Acquisition Chart
    const acquisitionCtx = document.getElementById('acquisitionChart').getContext('2d');
    window.acquisitionChart = new Chart(acquisitionCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'New Customers',
                data: [],
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#9b59b6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
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
    
    // Segments Chart
    const segmentsCtx = document.getElementById('segmentsChart').getContext('2d');
    window.segmentsChart = new Chart(segmentsCtx, {
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
    
    // Age Distribution Chart
    const ageCtx = document.getElementById('ageDistributionChart').getContext('2d');
    window.ageDistributionChart = new Chart(ageCtx, {
        type: 'bar',
        data: {
            labels: ['18-25', '26-35', '36-45', '46-55', '56+'],
            datasets: [{
                label: 'Customers',
                data: [],
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
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
                        precision: 0
                    }
                }
            }
        }
    });
    
    // Gender Distribution Chart
    const genderCtx = document.getElementById('genderDistributionChart').getContext('2d');
    window.genderDistributionChart = new Chart(genderCtx, {
        type: 'pie',
        data: {
            labels: ['Male', 'Female', 'Other'],
            datasets: [{
                data: [],
                backgroundColor: ['#3498db', '#e74c3c', '#95a5a6'],
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
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
    
    // Visit Frequency Chart
    const visitCtx = document.getElementById('visitFrequencyChart').getContext('2d');
    window.visitFrequencyChart = new Chart(visitCtx, {
        type: 'bar',
        data: {
            labels: ['1-5', '6-10', '11-20', '21-50', '50+'],
            datasets: [{
                label: 'Customers',
                data: [],
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderColor: '#2ecc71',
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
    
    // Preferred Time Chart
    const timeCtx = document.getElementById('preferredTimeChart').getContext('2d');
    window.preferredTimeChart = new Chart(timeCtx, {
        type: 'polarArea',
        data: {
            labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
            datasets: [{
                data: [],
                backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6'],
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
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
    
    // Loyalty Tier Chart
    const loyaltyCtx = document.getElementById('loyaltyTierChart').getContext('2d');
    window.loyaltyTierChart = new Chart(loyaltyCtx, {
        type: 'doughnut',
        data: {
            labels: ['Bronze', 'Silver', 'Gold', 'Platinum'],
            datasets: [{
                data: [],
                backgroundColor: ['#cd7f32', '#c0c0c0', '#ffd700', '#e5e4e2'],
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
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
    
    // Satisfaction Chart
    const satisfactionCtx = document.getElementById('satisfactionChart').getContext('2d');
    window.satisfactionChart = new Chart(satisfactionCtx, {
        type: 'radar',
        data: {
            labels: ['Service', 'Products', 'Pricing', 'Ambiance', 'Location', 'Cleanliness'],
            datasets: [{
                label: 'Satisfaction Score',
                data: [],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: '#3498db',
                borderWidth: 2,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Update all charts
    updateCustomerCharts();
}

// Update customer charts
function updateCustomerCharts() {
    updateAcquisitionChart();
    updateSegmentsChart();
    updateAgeDistributionChart();
    updateGenderDistributionChart();
    updateVisitFrequencyChart();
    updatePreferredTimeChart();
    updateLoyaltyTierChart();
    updateSatisfactionChart();
    updateTopLocations();
    updateShoppingPatterns();
    updateLoyaltyBenefits();
    updateRecentFeedback();
}

// Update acquisition chart
function updateAcquisitionChart() {
    const period = document.getElementById('acquisitionChartPeriod').value;
    const now = luxon.DateTime.now();
    let labels = [];
    let data = [];
    
    switch (period) {
        case 'daily':
            // Last 14 days
            labels = Array.from({ length: 14 }, (_, i) => {
                const date = now.minus({ days: 13 - i });
                return date.toFormat('dd/MM');
            });
            
            data = Array.from({ length: 14 }, (_, i) => {
                const date = now.minus({ days: 13 - i });
                return customersData.filter(c => c.joinDate === date.toISODate()).length;
            });
            break;
            
        case 'weekly':
            // Last 12 weeks
            labels = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
            
            data = Array.from({ length: 12 }, (_, i) => {
                const startDate = now.minus({ weeks: 11 - i });
                const endDate = startDate.plus({ days: 6 });
                return customersData.filter(c => {
                    const joinDate = luxon.DateTime.fromISO(c.joinTimestamp);
                    return joinDate >= startDate && joinDate <= endDate;
                }).length;
            });
            break;
            
        case 'monthly':
            // Last 6 months
            labels = Array.from({ length: 6 }, (_, i) => {
                const date = now.minus({ months: 5 - i });
                return date.toFormat('MMM');
            });
            
            data = Array.from({ length: 6 }, (_, i) => {
                const month = now.minus({ months: 5 - i });
                return customersData.filter(c => {
                    const joinDate = luxon.DateTime.fromISO(c.joinTimestamp);
                    return joinDate.month === month.month && joinDate.year === month.year;
                }).length;
            });
            break;
    }
    
    window.acquisitionChart.data.labels = labels;
    window.acquisitionChart.data.datasets[0].data = data;
    window.acquisitionChart.update();
}

// Update segments chart
function updateSegmentsChart() {
    const segments = {};
    
    customersData.forEach(customer => {
        if (!segments[customer.segment]) {
            segments[customer.segment] = 0;
        }
        segments[customer.segment] += 1;
    });
    
    const segmentLabels = {
        'new': 'New',
        'regular': 'Regular',
        'loyal': 'Loyal',
        'vip': 'VIP',
        'high-value': 'High Value',
        'inactive': 'Inactive'
    };
    
    const segmentColors = {
        'new': '#3498db',
        'regular': '#2ecc71',
        'loyal': '#9b59b6',
        'vip': '#f39c12',
        'high-value': '#e74c3c',
        'inactive': '#95a5a6'
    };
    
    const sortedSegments = Object.entries(segments).sort((a, b) => b[1] - a[1]);
    
    window.segmentsChart.data.labels = sortedSegments.map(s => segmentLabels[s[0]] || s[0]);
    window.segmentsChart.data.datasets[0].data = sortedSegments.map(s => s[1]);
    window.segmentsChart.data.datasets[0].backgroundColor = sortedSegments.map(s => 
        segmentColors[s[0]] || '#6c757d'
    );
    window.segmentsChart.update();
}

// Update age distribution chart
function updateAgeDistributionChart() {
    const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56+': 0
    };
    
    customersData.forEach(customer => {
        if (customer.age >= 18 && customer.age <= 25) ageGroups['18-25']++;
        else if (customer.age <= 35) ageGroups['26-35']++;
        else if (customer.age <= 45) ageGroups['36-45']++;
        else if (customer.age <= 55) ageGroups['46-55']++;
        else ageGroups['56+']++;
    });
    
    window.ageDistributionChart.data.datasets[0].data = Object.values(ageGroups);
    window.ageDistributionChart.update();
}

// Update gender distribution chart
function updateGenderDistributionChart() {
    const genders = {
        'male': 0,
        'female': 0,
        'other': 0
    };
    
    customersData.forEach(customer => {
        if (genders[customer.gender] !== undefined) {
            genders[customer.gender]++;
        } else {
            genders['other']++;
        }
    });
    
    window.genderDistributionChart.data.datasets[0].data = Object.values(genders);
    window.genderDistributionChart.update();
}

// Update visit frequency chart
function updateVisitFrequencyChart() {
    const visitGroups = {
        '1-5': 0,
        '6-10': 0,
        '11-20': 0,
        '21-50': 0,
        '50+': 0
    };
    
    customersData.forEach(customer => {
        const visits = customer.totalVisits;
        if (visits <= 5) visitGroups['1-5']++;
        else if (visits <= 10) visitGroups['6-10']++;
        else if (visits <= 20) visitGroups['11-20']++;
        else if (visits <= 50) visitGroups['21-50']++;
        else visitGroups['50+']++;
    });
    
    window.visitFrequencyChart.data.datasets[0].data = Object.values(visitGroups);
    window.visitFrequencyChart.update();
}

// Update preferred time chart
function updatePreferredTimeChart() {
    // Simulated data for preferred shopping times
    const timeData = [
        Math.floor(Math.random() * 30) + 20, // Morning
        Math.floor(Math.random() * 40) + 30, // Afternoon
        Math.floor(Math.random() * 50) + 40, // Evening
        Math.floor(Math.random() * 20) + 10  // Night
    ];
    
    window.preferredTimeChart.data.datasets[0].data = timeData;
    window.preferredTimeChart.update();
}

// Update loyalty tier chart
function updateLoyaltyTierChart() {
    // Simulated loyalty tier distribution
    const tierData = [
        Math.floor(customersData.length * 0.4), // Bronze
        Math.floor(customersData.length * 0.3), // Silver
        Math.floor(customersData.length * 0.2), // Gold
        Math.floor(customersData.length * 0.1)  // Platinum
    ];
    
    window.loyaltyTierChart.data.datasets[0].data = tierData;
    window.loyaltyTierChart.update();
}

// Update satisfaction chart
function updateSatisfactionChart() {
    // Simulated satisfaction scores across different categories
    const satisfactionData = [
        (Math.random() * 1.5 + 3.5).toFixed(1), // Service
        (Math.random() * 1.5 + 3.5).toFixed(1), // Products
        (Math.random() * 1.5 + 3.5).toFixed(1), // Pricing
        (Math.random() * 1.5 + 3.5).toFixed(1), // Ambiance
        (Math.random() * 1.5 + 3.5).toFixed(1), // Location
        (Math.random() * 1.5 + 3.5).toFixed(1)  // Cleanliness
    ];
    
    window.satisfactionChart.data.datasets[0].data = satisfactionData;
    window.satisfactionChart.update();
}

// Update top locations
function updateTopLocations() {
    const locations = {};
    
    customersData.forEach(customer => {
        if (!locations[customer.city]) {
            locations[customer.city] = 0;
        }
        locations[customer.city]++;
    });
    
    const topLocations = Object.entries(locations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const topLocationsList = document.getElementById('topLocationsList');
    let html = '';
    
    topLocations.forEach(([city, count]) => {
        html += `
            <div class="location-item">
                <div class="location-name">${city}</div>
                <div class="location-count">${count} customers</div>
            </div>
        `;
    });
    
    topLocationsList.innerHTML = html;
}

// Update shopping patterns
function updateShoppingPatterns() {
    const shoppingPatterns = document.getElementById('shoppingPatterns');
    
    const patterns = [
        { label: 'Avg. Visit Frequency', value: (customersData.reduce((sum, c) => sum + c.totalVisits, 0) / customersData.length).toFixed(1) + '/month' },
        { label: 'Peak Shopping Day', value: 'Saturday' },
        { label: 'Avg. Basket Size', value: '₹ ' + Math.floor(customersData.reduce((sum, c) => sum + c.avgSpend, 0) / customersData.length).toLocaleString('en-IN') },
        { label: 'Most Popular Category', value: 'Fashion' },
        { label: 'Online vs Offline', value: '70% Offline' },
        { label: 'Return Rate', value: '12%' }
    ];
    
    let html = '';
    patterns.forEach(pattern => {
        html += `
            <div class="stat-item">
                <div class="stat-value">${pattern.value}</div>
                <div class="stat-label">${pattern.label}</div>
            </div>
        `;
    });
    
    shoppingPatterns.innerHTML = html;
}

// Update loyalty benefits
function updateLoyaltyBenefits() {
    const loyaltyBenefits = document.getElementById('loyaltyBenefits');
    
    const benefits = [
        { icon: 'fas fa-percentage', title: 'Exclusive Discounts', description: 'Up to 30% off for loyal customers' },
        { icon: 'fas fa-gift', title: 'Birthday Rewards', description: 'Special gifts on birthdays' },
        { icon: 'fas fa-clock', title: 'Priority Service', description: 'Faster checkout and support' },
        { icon: 'fas fa-ticket-alt', title: 'Event Invitations', description: 'Exclusive mall event access' },
        { icon: 'fas fa-car', title: 'Free Parking', description: 'Complimentary parking hours' },
        { icon: 'fas fa-coffee', title: 'Lounge Access', description: 'Access to premium customer lounge' }
    ];
    
    let html = '';
    benefits.forEach(benefit => {
        html += `
            <div class="benefit-item">
                <div class="benefit-icon">
                    <i class="${benefit.icon}"></i>
                </div>
                <div class="benefit-details">
                    <h5>${benefit.title}</h5>
                    <p>${benefit.description}</p>
                </div>
            </div>
        `;
    });
    
    loyaltyBenefits.innerHTML = html;
}

// Update recent feedback
function updateRecentFeedback() {
    const recentFeedbackList = document.getElementById('recentFeedbackList');
    
    const recentCustomers = customersData
        .filter(c => Math.random() > 0.7) // Random selection
        .slice(0, 5);
    
    let html = '';
    recentCustomers.forEach(customer => {
        const rating = Math.floor(Math.random() * 2) + 3; // 3-5 stars
        const feedbacks = [
            'Great shopping experience! Will visit again.',
            'Loved the variety of stores. Food court was excellent.',
            'Customer service was very helpful.',
            'Clean and well-maintained mall.',
            'Parking could be improved, but overall good experience.'
        ];
        const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
        const timeAgo = ['2 hours ago', '1 day ago', '3 days ago', '1 week ago'][Math.floor(Math.random() * 4)];
        
        html += `
            <div class="feedback-item">
                <div class="feedback-header">
                    <div class="customer-name">${customer.name}</div>
                    <div class="feedback-rating">
                        ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
                    </div>
                </div>
                <div class="feedback-content">${feedback}</div>
                <div class="feedback-time">${timeAgo}</div>
            </div>
        `;
    });
    
    recentFeedbackList.innerHTML = html;
}

// Update customer KPIs
function updateCustomerKPIs() {
    const totalCustomers = customersData.length;
    
    // Customer growth (this month vs last month)
    const now = luxon.DateTime.now();
    const thisMonth = now.month;
    const lastMonth = now.minus({ months: 1 }).month;
    
    const thisMonthCustomers = customersData.filter(c => {
        const joinDate = luxon.DateTime.fromISO(c.joinTimestamp);
        return joinDate.month === thisMonth;
    }).length;
    
    const lastMonthCustomers = customersData.filter(c => {
        const joinDate = luxon.DateTime.fromISO(c.joinTimestamp);
        return joinDate.month === lastMonth;
    }).length;
    
    const growthRate = lastMonthCustomers > 0 ? 
        ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers * 100).toFixed(1) : 0;
    
    // Average spend
    const totalSpend = customersData.reduce((sum, c) => sum + c.totalSpend, 0);
    const avgSpend = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
    
    // Repeat rate (customers with > 1 visit)
    const repeatCustomers = customersData.filter(c => c.totalVisits > 1).length;
    const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers * 100).toFixed(1) : 0;
    
    // Average satisfaction
    const avgSatisfaction = customersData.length > 0 ? 
        (customersData.reduce((sum, c) => sum + parseFloat(c.satisfaction), 0) / customersData.length).toFixed(1) : 0;
    
    // Update KPI elements
    document.getElementById('totalCustomers').textContent = totalCustomers.toLocaleString('en-IN');
    document.getElementById('customerGrowth').textContent = `+${growthRate}%`;
    document.getElementById('customerGrowth').className = `change-${growthRate >= 0 ? 'positive' : 'negative'}`;
    
    document.getElementById('avgCustomerSpend').textContent = `₹ ${formatCurrency(avgSpend)}`;
    document.getElementById('spendGrowth').textContent = '+8.5%'; // Simulated growth
    
    document.getElementById('repeatRate').textContent = `${repeatRate}%`;
    document.getElementById('repeatRateChange').textContent = '+2.1%'; // Simulated change
    
    document.getElementById('satisfactionScore').textContent = avgSatisfaction;
    document.getElementById('satisfactionChange').textContent = '+0.3'; // Simulated change
}

// Update customers table
function updateCustomersTable() {
    const tableBody = document.getElementById('customersTable');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredCustomers.slice(startIndex, endIndex);
    
    let html = '';
    
    if (currentData.length === 0) {
        html = `
            <tr>
                <td colspan="10" class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No customers found</p>
                </td>
            </tr>
        `;
    } else {
        currentData.forEach(customer => {
            const joinDate = luxon.DateTime.fromISO(customer.joinTimestamp);
            const lastVisit = luxon.DateTime.fromISO(customer.lastVisit);
            const isSelected = selectedCustomers.has(customer.id);
            
            html += `
                <tr class="customer-row ${isSelected ? 'selected' : ''}" data-customer-id="${customer.id}">
                    <td>
                        <input type="checkbox" class="customer-checkbox" data-customer-id="${customer.id}" ${isSelected ? 'checked' : ''}>
                    </td>
                    <td>
                        <div class="customer-info">
                            <div class="customer-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="customer-details">
                                <h4>${customer.name}</h4>
                                <div class="email">${customer.email}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div>${customer.phone}</div>
                        <div class="text-small">${customer.city}</div>
                    </td>
                    <td>
                        <span class="segment-badge ${customer.segment}">
                            ${getSegmentLabel(customer.segment)}
                        </span>
                    </td>
                    <td><strong>₹ ${customer.totalSpend.toLocaleString('en-IN')}</strong></td>
                    <td>${customer.totalVisits}</td>
                    <td>
                        <div>${lastVisit.toFormat('dd/MM/yyyy')}</div>
                        <div class="text-small">${getDaysAgo(lastVisit)} days ago</div>
                    </td>
                    <td>
                        <span class="loyalty-points">${customer.loyaltyPoints}</span>
                    </td>
                    <td>
                        <span class="status-badge ${customer.status}">
                            ${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="action-icon-btn view" onclick="viewCustomer('${customer.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-icon-btn edit" onclick="editCustomer('${customer.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-icon-btn delete" onclick="deleteCustomer('${customer.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = html;
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.customer-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleCustomerCheckbox);
    });
    
    // Update pagination
    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const showingCountSpan = document.getElementById('showingCount');
    const totalCountSpan = document.getElementById('totalCount');
    
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    showingCountSpan.textContent = Math.min(filteredCustomers.length, currentPage * itemsPerPage);
    totalCountSpan.textContent = filteredCustomers.length;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Update today's insights
function updateTodayInsights() {
    const today = luxon.DateTime.now().toISODate();
    const newToday = customersData.filter(customer => customer.joinDate === today).length;
    
    // Loyal customers (visited > 10 times and spent > ₹10,000)
    const loyalCustomers = customersData.filter(customer => 
        customer.totalVisits > 10 && customer.totalSpend > 10000
    ).length;
    
    document.getElementById('newCustomersToday').textContent = newToday;
    document.getElementById('loyalCustomers').textContent = loyalCustomers;
}

// Update customer insights tab
function updateCustomerInsights() {
    // This function is called when switching tabs
    // The charts are already updated in updateCustomerCharts()
}

// Handle customer search
function handleCustomerSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredCustomers = [...customersData];
    } else {
        filteredCustomers = customersData.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm) ||
            customer.phone.includes(searchTerm) ||
            customer.city.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    updateCustomersTable();
}

// Handle segment filter
function handleSegmentFilter(e) {
    const segment = e.target.value;
    
    currentSegment = segment;
    
    if (segment === 'all') {
        filteredCustomers = [...customersData];
    } else {
        filteredCustomers = customersData.filter(customer => customer.segment === segment);
    }
    
    currentPage = 1;
    updateCustomersTable();
}

// Handle customer sort
function handleCustomerSort(e) {
    const sortBy = e.target.value;
    currentSort = sortBy;
    
    switch (sortBy) {
        case 'recent':
            filteredCustomers.sort((a, b) => new Date(b.joinTimestamp) - new Date(a.joinTimestamp));
            break;
        case 'name':
            filteredCustomers.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'spend':
            filteredCustomers.sort((a, b) => b.totalSpend - a.totalSpend);
            break;
        case 'visits':
            filteredCustomers.sort((a, b) => b.totalVisits - a.totalVisits);
            break;
        case 'loyalty':
            filteredCustomers.sort((a, b) => b.loyaltyPoints - a.loyaltyPoints);
            break;
    }
    
    updateCustomersTable();
}

// Handle add customer
function handleAddCustomer(e) {
    e.preventDefault();
    
    const name = document.getElementById('customerName').value;
    const gender = document.getElementById('customerGender').value;
    const age = parseInt(document.getElementById('customerAge').value) || null;
    const dob = document.getElementById('customerDOB').value;
    const email = document.getElementById('customerEmail').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const city = document.getElementById('customerCity').value;
    const segment = document.getElementById('customerSegment').value;
    const source = document.getElementById('customerSource').value;
    
    // Get interests from tags
    const interests = Array.from(document.querySelectorAll('.interest-tag')).map(tag => 
        tag.querySelector('span').textContent
    );
    
    // Get communication preferences
    const communication = {
        email: document.getElementById('prefEmail').checked,
        sms: document.getElementById('prefSMS').checked,
        whatsapp: document.getElementById('prefWhatsApp').checked,
        promotions: document.getElementById('prefPromotions').checked
    };
    
    const now = luxon.DateTime.now();
    const newCustomer = {
        id: `CUST${1000 + customersData.length + 1}`,
        name: name,
        gender: gender || 'prefer-not-to-say',
        age: age,
        dob: dob || null,
        email: email,
        phone: phone,
        address: address || '',
        city: city || '',
        joinDate: now.toISODate(),
        joinTimestamp: now.toISO(),
        segment: segment,
        source: source,
        interests: interests,
        totalSpend: 0,
        totalVisits: 0,
        avgSpend: 0,
        lastVisit: now.toISODate(),
        loyaltyPoints: 0,
        status: 'active',
        communication: communication,
        satisfaction: '4.0'
    };
    
    // Add to customers data
    customersData.unshift(newCustomer);
    filteredCustomers.unshift(newCustomer);
    
    // Close modal
    document.getElementById('addCustomerModal').classList.remove('active');
    
    // Reset form
    resetCustomerForm();
    
    // Update UI
    updateCustomerKPIs();
    updateCustomersTable();
    updateCustomerCharts();
    updateTodayInsights();
    
    // Show success message
    showCustomerNotification(`Customer "${name}" added successfully!`, 'success');
    
    console.log('New customer added:', newCustomer);
}

// Handle customer checkbox
function handleCustomerCheckbox(e) {
    const customerId = e.target.dataset.customerId;
    const row = e.target.closest('.customer-row');
    
    if (e.target.checked) {
        selectedCustomers.add(customerId);
        row.classList.add('selected');
    } else {
        selectedCustomers.delete(customerId);
        row.classList.remove('selected');
    }
    
    // Update select all checkbox state
    updateSelectAllCheckbox();
}

// Handle select all
function handleSelectAll(e) {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll('.customer-checkbox');
    
    if (isChecked) {
        // Select all customers on current page
        const currentData = filteredCustomers.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        currentData.forEach(customer => {
            selectedCustomers.add(customer.id);
        });
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            const row = checkbox.closest('.customer-row');
            if (row) row.classList.add('selected');
        });
    } else {
        // Deselect all customers
        selectedCustomers.clear();
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            const row = checkbox.closest('.customer-row');
            if (row) row.classList.remove('selected');
        });
    }
}

// Handle campaign send
function handleCampaignSend(e) {
    e.preventDefault();
    
    const campaignType = document.getElementById('campaignType').value;
    const audience = document.getElementById('campaignAudience').value;
    const subject = document.getElementById('campaignSubject').value;
    const message = document.getElementById('campaignMessage').value;
    
    let targetCount = 0;
    if (audience === 'selected') {
        targetCount = selectedCustomers.size;
    } else {
        targetCount = filteredCustomers.length;
    }
    
    // Show success message
    const campaignLabels = {
        'email': 'Email',
        'sms': 'SMS',
        'whatsapp': 'WhatsApp'
    };
    
    showCustomerNotification(
        `${campaignLabels[campaignType]} campaign sent to ${targetCount} customers!`,
        'success'
    );
    
    // Close modal
    document.getElementById('campaignModal').classList.remove('active');
    
    // Reset form
    document.getElementById('campaignForm').reset();
}

// Handle insights tab change
function handleInsightsTabChange(e) {
    const tab = e.target.dataset.tab;
    
    // Update active tab
    document.querySelectorAll('.insights-tab').forEach(t => {
        t.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Hide all tab contents
    document.querySelectorAll('.insights-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show active tab content
    document.getElementById(`${tab}Tab`).classList.add('active');
}

// Initialize interests tags
function initInterestsTags() {
    const interestsInput = document.getElementById('customerInterests');
    const interestsContainer = document.getElementById('interestsContainer');
    
    interestsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const interest = interestsInput.value.trim();
            if (interest) {
                addInterestTag(interest);
                interestsInput.value = '';
            }
        }
    });
}

// Add interest tag
function addInterestTag(interest) {
    const interestsContainer = document.getElementById('interestsContainer');
    const tagId = `interest-${Date.now()}`;
    
    const tagHTML = `
        <div class="interest-tag" id="${tagId}">
            <span>${interest}</span>
            <button type="button" class="interest-tag-remove" onclick="removeInterestTag('${tagId}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    interestsContainer.insertAdjacentHTML('beforeend', tagHTML);
}

// Remove interest tag
function removeInterestTag(tagId) {
    const tag = document.getElementById(tagId);
    if (tag) {
        tag.remove();
    }
}

// Reset customer form
function resetCustomerForm() {
    document.getElementById('addCustomerForm').reset();
    
    // Clear interests tags
    document.getElementById('interestsContainer').innerHTML = '';
    
    // Reset checkboxes to default
    document.getElementById('prefEmail').checked = true;
    document.getElementById('prefSMS').checked = true;
    document.getElementById('prefWhatsApp').checked = true;
    document.getElementById('prefPromotions').checked = true;
}

// View customer details
function viewCustomer(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (!customer) return;
    
    const modal = document.getElementById('customerDetailModal');
    const content = document.getElementById('customerDetailContent');
    
    const joinDate = luxon.DateTime.fromISO(customer.joinTimestamp);
    const lastVisit = luxon.DateTime.fromISO(customer.lastVisit);
    
    content.innerHTML = `
        <div class="customer-detail-header">
            <div class="customer-avatar-large">
                <i class="fas fa-user"></i>
            </div>
            <div class="customer-detail-title">
                <h2>${customer.name}</h2>
                <span class="customer-segment-large segment-badge ${customer.segment}">
                    ${getSegmentLabel(customer.segment)}
                </span>
            </div>
        </div>
        
        <div class="customer-detail-grid">
            <div class="detail-group">
                <h4>Personal Information</h4>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${customer.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${customer.phone}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Gender</span>
                    <span class="detail-value">${customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Age</span>
                    <span class="detail-value">${customer.age || 'Not specified'}</span>
                </div>
            </div>
            
            <div class="detail-group">
                <h4>Location</h4>
                <div class="detail-item">
                    <span class="detail-label">Address</span>
                    <span class="detail-value">${customer.address || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">City</span>
                    <span class="detail-value">${customer.city || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Join Date</span>
                    <span class="detail-value">${joinDate.toFormat('dd MMM yyyy')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Customer Source</span>
                    <span class="detail-value">${getSourceLabel(customer.source)}</span>
                </div>
            </div>
        </div>
        
        <div class="customer-stats">
            <h4>Shopping Statistics</h4>
            <div class="stats-grid">
                <div class="stat-item-large">
                    <h5>Total Spend</h5>
                    <div class="stat-value-large">₹ ${customer.totalSpend.toLocaleString('en-IN')}</div>
                </div>
                <div class="stat-item-large">
                    <h5>Total Visits</h5>
                    <div class="stat-value-large">${customer.totalVisits}</div>
                </div>
                <div class="stat-item-large">
                    <h5>Avg. Spend</h5>
                    <div class="stat-value-large">₹ ${Math.round(customer.avgSpend).toLocaleString('en-IN')}</div>
                </div>
                <div class="stat-item-large">
                    <h5>Last Visit</h5>
                    <div class="stat-value-large">${getDaysAgo(lastVisit)} days ago</div>
                </div>
                <div class="stat-item-large">
                    <h5>Loyalty Points</h5>
                    <div class="stat-value-large">${customer.loyaltyPoints}</div>
                </div>
                <div class="stat-item-large">
                    <h5>Satisfaction</h5>
                    <div class="stat-value-large">${customer.satisfaction}/5.0</div>
                </div>
            </div>
        </div>
        
        <div class="customer-interests">
            <h4>Interests</h4>
            <div class="interests-list">
                ${customer.interests.map(interest => `
                    <span class="interest-tag">
                        <span>${interest}</span>
                    </span>
                `).join('')}
                ${customer.interests.length === 0 ? '<p class="text-muted">No interests specified</p>' : ''}
            </div>
        </div>
        
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeCustomerDetail()">
                Close
            </button>
            <button class="btn-primary" onclick="editCustomer('${customer.id}')">
                <i class="fas fa-edit"></i> Edit Customer
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// Edit customer
function editCustomer(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (!customer) return;
    
    // Fill the add customer form with existing data
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerGender').value = customer.gender;
    document.getElementById('customerAge').value = customer.age || '';
    document.getElementById('customerDOB').value = customer.dob || '';
    document.getElementById('customerEmail').value = customer.email;
    document.getElementById('customerPhone').value = customer.phone;
    document.getElementById('customerAddress').value = customer.address || '';
    document.getElementById('customerCity').value = customer.city || '';
    document.getElementById('customerSegment').value = customer.segment;
    document.getElementById('customerSource').value = customer.source;
    
    // Fill interests
    const interestsContainer = document.getElementById('interestsContainer');
    interestsContainer.innerHTML = '';
    customer.interests.forEach(interest => {
        addInterestTag(interest);
    });
    
    // Fill communication preferences
    document.getElementById('prefEmail').checked = customer.communication.email;
    document.getElementById('prefSMS').checked = customer.communication.sms;
    document.getElementById('prefWhatsApp').checked = customer.communication.whatsapp;
    document.getElementById('prefPromotions').checked = customer.communication.promotions;
    
    // Change form to update mode
    const form = document.getElementById('addCustomerForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const modalTitle = document.querySelector('#addCustomerModal h3');
    
    modalTitle.textContent = 'Edit Customer';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Customer';
    
    // Remove existing submit listener
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add new submit listener for update
    newForm.addEventListener('submit', (e) => handleUpdateCustomer(e, customerId));
    
    // Show modal
    document.getElementById('addCustomerModal').classList.add('active');
}

// Handle update customer
function handleUpdateCustomer(e, customerId) {
    e.preventDefault();
    
    const form = e.target;
    const customerIndex = customersData.findIndex(c => c.id === customerId);
    
    if (customerIndex === -1) return;
    
    // Update customer data
    customersData[customerIndex] = {
        ...customersData[customerIndex],
        name: document.getElementById('customerName').value,
        gender: document.getElementById('customerGender').value,
        age: parseInt(document.getElementById('customerAge').value) || null,
        dob: document.getElementById('customerDOB').value || null,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value || '',
        city: document.getElementById('customerCity').value || '',
        segment: document.getElementById('customerSegment').value,
        source: document.getElementById('customerSource').value,
        interests: Array.from(document.querySelectorAll('.interest-tag')).map(tag => 
            tag.querySelector('span').textContent
        ),
        communication: {
            email: document.getElementById('prefEmail').checked,
            sms: document.getElementById('prefSMS').checked,
            whatsapp: document.getElementById('prefWhatsApp').checked,
            promotions: document.getElementById('prefPromotions').checked
        }
    };
    
    // Update filtered customers
    const filteredIndex = filteredCustomers.findIndex(c => c.id === customerId);
    if (filteredIndex !== -1) {
        filteredCustomers[filteredIndex] = customersData[customerIndex];
    }
    
    // Close modal
    document.getElementById('addCustomerModal').classList.remove('active');
    
    // Reset form to add mode
    resetAddCustomerForm();
    
    // Update UI
    updateCustomersTable();
    updateCustomerKPIs();
    updateCustomerCharts();
    
    // Show success message
    showCustomerNotification(`Customer "${customersData[customerIndex].name}" updated successfully!`, 'success');
}

// Delete customer
function deleteCustomer(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    
    if (!confirm(`Are you sure you want to delete customer "${customer?.name}"? This action cannot be undone.`)) {
        return;
    }
    
    // Remove from customers data
    customersData = customersData.filter(c => c.id !== customerId);
    filteredCustomers = filteredCustomers.filter(c => c.id !== customerId);
    selectedCustomers.delete(customerId);
    
    // Update UI
    updateCustomersTable();
    updateCustomerKPIs();
    updateCustomerCharts();
    updateTodayInsights();
    
    // Show success message
    showCustomerNotification(`Customer "${customer?.name}" deleted successfully!`, 'success');
}

// Reset add customer form to default
function resetAddCustomerForm() {
    const form = document.getElementById('addCustomerForm');
    form.reset();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const modalTitle = document.querySelector('#addCustomerModal h3');
    
    modalTitle.textContent = 'Add New Customer';
    submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Add Customer';
    
    // Remove any existing listeners and re-add the default one
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    newForm.addEventListener('submit', handleAddCustomer);
    
    // Clear interests tags
    document.getElementById('interestsContainer').innerHTML = '';
    
    // Reset checkboxes to default
    document.getElementById('prefEmail').checked = true;
    document.getElementById('prefSMS').checked = true;
    document.getElementById('prefWhatsApp').checked = true;
    document.getElementById('prefPromotions').checked = true;
}

// Close customer detail modal
function closeCustomerDetail() {
    document.getElementById('customerDetailModal').classList.remove('active');
}

// Export customer data
function exportCustomerData() {
    const dataToExport = filteredCustomers.map(customer => ({
        'Customer ID': customer.id,
        'Name': customer.name,
        'Email': customer.email,
        'Phone': customer.phone,
        'City': customer.city,
        'Segment': getSegmentLabel(customer.segment),
        'Total Spend': customer.totalSpend,
        'Total Visits': customer.totalVisits,
        'Loyalty Points': customer.loyaltyPoints,
        'Status': customer.status,
        'Join Date': customer.joinDate,
        'Last Visit': customer.lastVisit
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
    a.download = `customers-data-${luxon.DateTime.now().toFormat('yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomerNotification('Customer data exported successfully!', 'success');
}

// Pagination functions
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        updateCustomersTable();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateCustomersTable();
    }
}

// Update select all checkbox
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllCustomers');
    const currentData = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    if (currentData.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }
    
    const selectedCount = Array.from(selectedCustomers).filter(id => 
        currentData.some(c => c.id === id)
    ).length;
    
    if (selectedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedCount === currentData.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// Helper functions
function getSegmentLabel(segment) {
    const labels = {
        'new': 'New',
        'regular': 'Regular',
        'loyal': 'Loyal',
        'vip': 'VIP',
        'high-value': 'High Value',
        'inactive': 'Inactive'
    };
    return labels[segment] || segment;
}

function getSourceLabel(source) {
    const labels = {
        'walk-in': 'Walk-in',
        'online': 'Online Registration',
        'referral': 'Referral',
        'campaign': 'Marketing Campaign',
        'event': 'Mall Event',
        'other': 'Other'
    };
    return labels[source] || source;
}

function getDaysAgo(date) {
    const now = luxon.DateTime.now();
    const diff = now.diff(date, 'days');
    return Math.floor(diff.days);
}

function formatCurrency(amount) {
    if (amount >= 100000) {
        return (amount / 100000).toFixed(1) + 'L';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return Math.round(amount).toLocaleString('en-IN');
}

function generateRandomDOB(age) {
    const now = luxon.DateTime.now();
    const birthYear = now.year - age;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    return `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
}

function showCustomerNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `customer-notification-toast ${type}`;
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

// Initialize customer management when page loads
document.addEventListener('DOMContentLoaded', initCustomerManagement);