// ============================================
// ADMIN DASHBOARD — admin.js
// ============================================

// ============ AUTH GUARD ============
// function checkAdminAuth() {
//     const token = localStorage.getItem('token');
//     const user = localStorage.getItem('user');

//     if (!token || !user) {
//         window.location.href = '/frontend/views/auth/login.html';
//         return null;
//     }

//     const parsedUser = JSON.parse(user);
//     if (parsedUser.role !== 'ADMIN') {
//         alert('Bạn không có quyền truy cập trang này!');
//         window.location.href = '/frontend/index.html';
//         return null;
//     }

//     return parsedUser;
// }

// ============ HEADER USER ============
function renderAdminUser(user) {
    const nameEl = document.getElementById('adminName');
    const avatarEl = document.getElementById('adminAvatar');
    const roleEl = document.getElementById('adminRole');

    if (nameEl) nameEl.textContent = user.fullName || user.email;
    if (roleEl) roleEl.textContent = user.role;

    if (avatarEl) {
        if (user.avatarUrl) {
            avatarEl.innerHTML = `<img src="${user.avatarUrl}" alt="avatar">`;
        } else {
            avatarEl.textContent = (user.fullName || user.email)[0].toUpperCase();
        }
    }
}

// ============ CLOCK ============
function startClock() {
    const el = document.getElementById('currentTime');
    if (!el) return;
    const update = () => {
        el.textContent = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    update();
    setInterval(update, 1000);
}

// ============ NAVIGATION ============
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const sectionLinks = document.querySelectorAll('.section-link[data-page]');

    function navigateTo(pageName) {
        // Ẩn tất cả pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        navItems.forEach(n => n.classList.remove('active'));

        // Hiện page được chọn
        const page = document.getElementById(`page-${pageName}`);
        if (page) page.classList.add('active');

        // Active nav item
        const navItem = document.querySelector(`.nav-item[data-page="${pageName}"]`);
        if (navItem) navItem.classList.add('active');

        // Cập nhật title
        const titles = {
            dashboard: 'Tổng quan', products: 'Sản phẩm',
            orders: 'Quản lý Đơn hàng', users: 'Quản lý Người dùng',
            payment: 'Thanh toán', shipping: 'Vận chuyển',
            cart: 'Giỏ hàng', reviews: 'Reviews', marketing: 'Giao diện & Marketing'
        };
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) titleEl.textContent = titles[pageName] || pageName;

        // Đóng sidebar trên mobile
        document.getElementById('sidebar')?.classList.remove('open');
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });

    sectionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    // Sidebar toggle mobile
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('open');
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/frontend/views/auth/login.html';
    });
}

// ============ FETCH HELPER ============
async function apiFetch(endpoint) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

// ============ STAT CARDS ============
async function loadStatCards() {
    try {
        // Gọi song song các API thống kê
        const [usersRes, productsRes] = await Promise.all([
            apiFetch('/users'),
            apiFetch('/products'),
        ]);

        const users    = Array.isArray(usersRes) ? usersRes : (usersRes.data || []);
        const products = Array.isArray(productsRes) ? productsRes : (productsRes.data || []);

        document.getElementById('stat-users').textContent    = formatNumber(users.length);
        document.getElementById('stat-products').textContent = formatNumber(products.length);

        // TODO: thêm API orders và revenue khi có
        // document.getElementById('stat-orders').textContent  = formatNumber(orders.length);
        // document.getElementById('stat-revenue').textContent = formatPrice(totalRevenue);
    } catch (err) {
        console.error('loadStatCards:', err);
    }
}

// ============ REVENUE CHART ============
function renderRevenueChart(labels, data) {
    const ctx = document.getElementById('revenueCanvas');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Doanh thu (VND)',
                data,
                backgroundColor: 'rgba(22, 163, 74, 0.8)',
                borderColor: '#16a34a',
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => formatPrice(ctx.raw)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        font: { size: 11 },
                        callback: (val) => formatPrice(val)
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });
}

async function loadRevenueChart() {
    // TODO: thay bằng API thực khi có endpoint /admin/revenue
    // Dữ liệu mẫu 7 ngày gần nhất
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    });

    const mockData = [1200000, 3400000, 2800000, 4200000, 3100000, 5600000, 4800000];
    renderRevenueChart(last7Days, mockData);
}

// ============ RECENT ORDERS ============
async function loadRecentOrders() {
    const tbody = document.getElementById('recentOrdersTable');
    try {
        // TODO: thay bằng /orders?limit=5 khi có API
        // const res = await apiFetch('/orders?limit=5');
        // const orders = Array.isArray(res) ? res : (res.data || []);

        // Placeholder cho đến khi có API orders
        tbody.innerHTML = `
            <tr><td colspan="4" class="table-loading" style="color:#94a3b8;">
                Chưa có API đơn hàng — sẽ cập nhật sau
            </td></tr>
        `;

        /* Khi có API, dùng đoạn này:
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.user?.fullName || '—'}</td>
                <td>${formatPrice(order.totalAmount)}</td>
                <td>${statusBadge(order.status)}</td>
            </tr>
        `).join('');
        */
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" class="table-loading">Lỗi tải dữ liệu</td></tr>`;
        console.error('loadRecentOrders:', err);
    }
}

// ============ TOP PRODUCTS ============
async function loadTopProducts() {
    const tbody = document.getElementById('topProductsTable');
    try {
        const res = await apiFetch('/products?limit=5&sort=sold');
        const products = Array.isArray(res) ? res : (res.data || []);

        if (!products.length) {
            tbody.innerHTML = `<tr><td colspan="3" class="table-loading">Không có dữ liệu</td></tr>`;
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${formatNumber(p.sold || 0)}</td>
                <td>${formatPrice(p.price)}</td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="3" class="table-loading">Lỗi tải dữ liệu</td></tr>`;
        console.error('loadTopProducts:', err);
    }
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAdminAuth();
    if (!user) return;

    renderAdminUser(user);
    startClock();
    initNavigation();

    // Load dashboard data song song
    await Promise.all([
        loadStatCards(),
        loadRevenueChart(),
        loadRecentOrders(),
        loadTopProducts(),
    ]);
});