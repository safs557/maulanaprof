// Global variables
let currentSection = 'dashboard';
let books = [];
let audio = [];
let videos = [];
let transactions = [];
let assistants = [];
let balance = 0;
let currentModalType = '';
let deleteItem = null;

// API configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : window.location.origin;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Initialize Lucide icons
    lucide.createIcons();
});

// Initialize application
async function initializeApp() {
    await checkAuth();
    setupEventListeners();
}

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/check-auth`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
                if (data.first_login) {
                    // First login, redirect to login page
                    window.location.href = '/admin-login.html';
                    return;
                }
                // User is authenticated, show dashboard
                showDashboard();
                await loadData();
            } else {
                showAccessDenied();
            }
        } else {
            showAccessDenied();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showAccessDenied();
    }
}

// Show dashboard
function showDashboard() {
    document.getElementById('auth-loading').classList.add('d-none');
    document.getElementById('access-denied').classList.add('d-none');
    document.getElementById('main-dashboard').classList.remove('d-none');
}

// Show access denied
function showAccessDenied() {
    document.getElementById('auth-loading').classList.add('d-none');
    document.getElementById('main-dashboard').classList.add('d-none');
    document.getElementById('access-denied').classList.remove('d-none');
    
    // Reinitialize Lucide icons
    lucide.createIcons();
}

// Go to login page
function goToLogin() {
    window.location.href = '/admin-login.html';
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            switchSection(section);
        });
    });
}

// Switch sections
function switchSection(section) {
    // Update active sidebar button
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('d-none');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.remove('d-none');
    
    currentSection = section;
}

// Load all data
async function loadData() {
    try {
        // Load all data in parallel
        const [booksRes, audioRes, videosRes, transactionsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/books`),
            fetch(`${API_BASE_URL}/api/audio`),
            fetch(`${API_BASE_URL}/api/videos`),
            fetch(`${API_BASE_URL}/api/transactions`)
        ]);
        
        if (booksRes.ok) {
            books = await booksRes.json();
            updateBooksTable();
            document.getElementById('total-books').textContent = books.length;
        }
        
        if (audioRes.ok) {
            audio = await audioRes.json();
            updateAudioTable();
            document.getElementById('total-audio').textContent = audio.length;
        }
        
        if (videosRes.ok) {
            videos = await videosRes.json();
            updateVideosTable();
            document.getElementById('total-videos').textContent = videos.length;
        }
        
        if (transactionsRes.ok) {
            transactions = await transactionsRes.json();
            updateTransactionsTable();
            calculateBalance();
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Calculate balance
function calculateBalance() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    balance = totalIncome - totalExpense;
    
    document.getElementById('current-balance').textContent = `₦${balance.toLocaleString()}`;
    document.getElementById('balance-display').textContent = `₦${balance.toLocaleString()}`;
}

// Update books table
function updateBooksTable() {
    const tbody = document.getElementById('books-table-body');
    tbody.innerHTML = '';
    
    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${book.cover_image ? `/uploads/covers/${book.cover_image}` : '/placeholder.svg?height=60&width=45&text=Book'}" 
                     alt="Cover" class="img-thumbnail" style="width: 45px; height: 60px; object-fit: cover;">
            </td>
            <td>${book.title_english}</td>
            <td class="arabic">${book.title_arabic}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="showDeleteModal('books', ${book.id}, '${book.title_english}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Reinitialize Lucide icons
    lucide.createIcons();
}

// Update audio table
function updateAudioTable() {
    const tbody = document.getElementById('audio-table-body');
    tbody.innerHTML = '';
    
    audio.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.title_english}</td>
            <td class="arabic">${item.title_arabic}</td>
            <td>${item.description_english ? item.description_english.substring(0, 50) + '...' : ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="showDeleteModal('audio', ${item.id}, '${item.title_english}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Reinitialize Lucide icons
    lucide.createIcons();
}

// Update videos table
function updateVideosTable() {
    const tbody = document.getElementById('videos-table-body');
    tbody.innerHTML = '';
    
    videos.forEach(video => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${video.title_english}</td>
            <td class="arabic">${video.title_arabic}</td>
            <td>${video.description_english ? video.description_english.substring(0, 50) + '...' : ''}</td>
            <td>
                <a href="${video.youtube_url || video.video_url}" target="_blank" class="btn btn-sm btn-outline-primary">
                    <i data-lucide="eye"></i>
                </a>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="showDeleteModal('videos', ${video.id}, '${video.title_english}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Reinitialize Lucide icons
    lucide.createIcons();
}

// Update transactions table
function updateTransactionsTable() {
    const tbody = document.getElementById('transactions-table-body');
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        const date = new Date(transaction.created_at || transaction.date).toLocaleDateString();
        const isIncome = transaction.type === 'income';
        
        row.innerHTML = `
            <td>${date}</td>
            <td>
                <span class="badge ${isIncome ? 'bg-success' : 'bg-danger'}">
                    ${isIncome ? 'Income' : 'Expense'}
                </span>
            </td>
            <td>${transaction.description}</td>
            <td>${transaction.donor_name || transaction.reference || '-'}</td>
            <td class="fw-bold ${isIncome ? 'text-success' : 'text-danger'}">
                ${isIncome ? '+' : '-'}₦${parseFloat(transaction.amount).toLocaleString()}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show add modal
function showAddModal(type) {
    currentModalType = type;
    const modal = new bootstrap.Modal(document.getElementById('addModal'));
    const title = document.getElementById('add-modal-title');
    const formFields = document.getElementById('form-fields');
    const submitBtn = document.getElementById('add-submit-btn');
    
    title.textContent = `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    
    // Set button color based on type
    submitBtn.className = `btn btn-${getButtonColor(type)}`;
    
    // Generate form fields based on type
    formFields.innerHTML = generateFormFields(type);
    
    modal.show();
    
    // Reinitialize Lucide icons
    lucide.createIcons();
}

// Get button color for type
function getButtonColor(type) {
    const colors = {
        book: 'primary',
        audio: 'success',
        video: 'warning',
        expense: 'danger',
        assistant: 'info'
    };
    return colors[type] || 'primary';
}

// Generate form fields
function generateFormFields(type) {
    switch (type) {
        case 'book':
            return `
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Title (English)</label>
                        <input type="text" class="form-control" name="title_english" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Title (Arabic)</label>
                        <input type="text" class="form-control arabic" name="title_arabic" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Cover Image</label>
                        <input type="file" class="form-control" name="cover_image" accept="image/*" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">PDF File</label>
                        <input type="file" class="form-control" name="pdf_file" accept=".pdf" required>
                    </div>
                </div>
            `;
        case 'audio':
            return `
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Title (English)</label>
                        <input type="text" class="form-control" name="title_english" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Title (Arabic)</label>
                        <input type="text" class="form-control arabic" name="title_arabic" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Description (English)</label>
                        <textarea class="form-control" name="description_english" rows="3"></textarea>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Description (Arabic)</label>
                        <textarea class="form-control arabic" name="description_arabic" rows="3"></textarea>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Audio File</label>
                    <input type="file" class="form-control" name="audio_file" accept="audio/*" required>
                </div>
            `;
        case 'video':
            return `
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Title (English)</label>
                        <input type="text" class="form-control" name="title_english" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Title (Arabic)</label>
                        <input type="text" class="form-control arabic" name="title_arabic" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Description (English)</label>
                        <textarea class="form-control" name="description_english" rows="3"></textarea>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Description (Arabic)</label>
                        <textarea class="form-control arabic" name="description_arabic" rows="3"></textarea>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">YouTube Video URL</label>
                    <input type="url" class="form-control" name="youtube_url" placeholder="https://www.youtube.com/watch?v=..." required>
                </div>
            `;
        case 'expense':
            return `
                <div class="mb-3">
                    <label class="form-label">Amount (₦)</label>
                    <input type="number" class="form-control" name="amount" min="1" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="description" rows="3" placeholder="What was this expense for?" required></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
            `;
        case 'assistant':
            return `
                <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-control" name="username" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" name="password" minlength="6" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" name="email" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Phone</label>
                    <input type="tel" class="form-control" name="phone" required>
                </div>
            `;
        default:
            return '';
    }
}

// Handle add item
async function handleAddItem() {
    const form = document.getElementById('add-form');
    const formData = new FormData(form);
    
    try {
        let endpoint = '';
        let method = 'POST';
        let body;
        let headers = {};
        
        // Determine endpoint and prepare data
        switch (currentModalType) {
            case 'book':
                endpoint = '/api/admin/books';
                body = formData;
                break;
            case 'audio':
                endpoint = '/api/admin/audio';
                body = formData;
                break;
            case 'video':
                endpoint = '/api/admin/videos';
                body = JSON.stringify(Object.fromEntries(formData));
                headers['Content-Type'] = 'application/json';
                break;
            case 'expense':
                endpoint = '/api/admin/expenses';
                body = JSON.stringify(Object.fromEntries(formData));
                headers['Content-Type'] = 'application/json';
                break;
            case 'assistant':
                endpoint = '/api/admin/assistants';
                body = JSON.stringify(Object.fromEntries(formData));
                headers['Content-Type'] = 'application/json';
                break;
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            credentials: 'include',
            headers,
            body
        });
        
        if (response.ok) {
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
            
            // Reload data
            await loadData();
            
            alert(`${currentModalType.charAt(0).toUpperCase() + currentModalType.slice(1)} added successfully!`);
        } else {
            const error = await response.json();
            alert(error.error || `Failed to add ${currentModalType}`);
        }
    } catch (error) {
        console.error(`Error adding ${currentModalType}:`, error);
        alert(`Error adding ${currentModalType}`);
    }
}

// Show delete modal
function showDeleteModal(type, id, name) {
    deleteItem = { type, id, name };
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    document.getElementById('delete-item-name').textContent = name;
    document.getElementById('delete-password').value = '';
    
    modal.show();
}

// Confirm delete
async function confirmDelete() {
    if (!deleteItem) return;
    
    const password = document.getElementById('delete-password').value;
    if (!password) {
        alert('Please enter your password');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/${deleteItem.type}/${deleteItem.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        if (response.ok) {
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            
            // Reload data
            await loadData();
            
            alert(`${deleteItem.type.charAt(0).toUpperCase() + deleteItem.type.slice(1)} deleted successfully!`);
            deleteItem = null;
        } else {
            const error = await response.json();
            alert(error.error || `Failed to delete ${deleteItem.type}`);
        }
    } catch (error) {
        console.error(`Error deleting ${deleteItem.type}:`, error);
        alert(`Error deleting ${deleteItem.type}`);
    }
}

// Generate report
function generateReport() {
    const fromDate = document.getElementById('report-date-from').value;
    const toDate = document.getElementById('report-date-to').value;
    
    if (!fromDate || !toDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    const filteredTransactions = transactions.filter(t => {
        const transDate = new Date(t.created_at || t.date);
        const from = new Date(fromDate);
        const to = new Date(toDate);
        return transDate >= from && transDate <= to;
    });
    
    // Generate and open report in new window
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
        const totalIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const totalExpense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        reportWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Financial Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d6efd; padding-bottom: 20px; }
                    .logo { max-width: 100px; margin-bottom: 10px; }
                    .report-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .report-table th, .report-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    .report-table th { background-color: #f8f9fa; font-weight: bold; }
                    .summary { margin: 20px 0; padding: 15px; background-color: #e3f2fd; border-radius: 8px; }
                    .signature-section { margin-top: 50px; padding-top: 30px; border-top: 1px solid #ddd; }
                    .signature-line { border-bottom: 1px solid #000; width: 200px; margin: 20px 0; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/placeholder-logo.png" alt="Logo" class="logo">
                    <h1>Prof. Ibrahim Ahmad Maqari</h1>
                    <h2>Financial Report</h2>
                    <p><strong>Period:</strong> ${fromDate} to ${toDate}</p>
                    <p><strong>Email:</strong> 1440shamsusabo@gmail.com</p>
                    <p><strong>Phone:</strong> 08030909793</p>
                    <p><strong>Address:</strong> Nigeria</p>
                </div>
                <div class="summary">
                    <h3>Summary</h3>
                    <p><strong>Total Income:</strong> ₦${totalIncome.toLocaleString()}</p>
                    <p><strong>Total Expenses:</strong> ₦${totalExpense.toLocaleString()}</p>
                    <p><strong>Current Balance:</strong> ₦${balance.toLocaleString()}</p>
                </div>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Donor/Reference</th>
                            <th>Amount (₦)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredTransactions.map(t => `
                            <tr>
                                <td>${new Date(t.created_at || t.date).toLocaleDateString()}</td>
                                <td>${t.type === 'income' ? 'Income' : 'Expense'}</td>
                                <td>${t.description}</td>
                                <td>${t.donor_name || t.reference || '-'}</td>
                                <td>${t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="signature-section">
                    <p><strong>Secretary Signature:</strong></p>
                    <div class="signature-line"></div>
                    <p>Date: ________________</p>
                </div>
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="background: #0d6efd; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Print Report</button>
                </div>
            </body>
            </html>
        `);
        reportWindow.document.close();
    }
}

// Handle logout
async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/api/admin/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        window.location.href = '/admin-login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/admin-login.html';
    }
}
