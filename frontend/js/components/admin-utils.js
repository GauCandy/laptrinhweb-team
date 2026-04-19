// ============================================
// ADMIN UTILS — dùng chung toàn admin
// ============================================

// ============ AUTH GUARD ============
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');

    if (!token || !user) {
        window.location.href = '/frontend/views/auth/login.html';
        return null;
    }

    const parsed = JSON.parse(user);
    if (parsed.role !== 'ADMIN') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = '/frontend/index.html';
        return null;
    }

    return parsed;
}

// ============ API FETCH ============
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

// ============ FORMAT HELPERS ============
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function statusBadge(status) {
    const map = {
        'PENDING':    ['badge-pending', 'Chờ xử lý'],
        'PROCESSING': ['badge-info',    'Đang xử lý'],
        'SHIPPED':    ['badge-info',    'Đang giao'],
        'DELIVERED':  ['badge-success', 'Đã giao'],
        'CANCELLED':  ['badge-danger',  'Đã huỷ'],
    };
    const [cls, label] = map[status] || ['badge-pending', status];
    return `<span class="badge ${cls}">${label}</span>`;
}

// ============ CLOCK ============
function startClock() {
    const el = document.getElementById('currentTime');
    if (!el) return;
    const update = () => {
        el.textContent = new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };
    update();
    setInterval(update, 1000);
}

// ============ TOPBAR TITLE ============
function setPageTitle(title) {
    const el = document.getElementById('pageTitle');
    if (el) el.textContent = title;
    document.title = `${title} — Quản trị SmartCart`;
}