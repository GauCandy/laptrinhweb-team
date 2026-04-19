// ============================================
// SIDEBAR COMPONENT — dùng chung toàn admin
// ============================================

function renderSidebar(activePage) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const navItems = [
        { page: 'dashboard', icon: '▦', label: 'Tổng quan',            href: 'dashboard.html' },
        { page: 'products',  icon: '⬛', label: 'Sản phẩm',             href: 'products.html' },
        { page: 'orders',    icon: '◈', label: 'Quản lý Đơn hàng',     href: 'orders.html' },
        { page: 'users',     icon: '◉', label: 'Quản lý Người dùng',   href: 'users.html' },
        { divider: true },
        { page: 'payment',   icon: '◇', label: 'Thanh toán',           href: 'payment.html' },
        { page: 'shipping',  icon: '▷', label: 'Vận chuyển',           href: 'shipping.html' },
        { page: 'cart',      icon: '◻', label: 'Giỏ hàng',             href: 'cart.html' },
        { page: 'reviews',   icon: '◆', label: 'Reviews',              href: 'reviews.html' },
        { page: 'marketing', icon: '◈', label: 'Giao diện & Marketing',href: 'marketing.html' },
    ];

    const navHTML = navItems.map(item => {
        if (item.divider) return `<div class="nav-divider"></div>`;
        const isActive = item.page === activePage ? 'active' : '';
        return `
            <a href="${item.href}" class="nav-item ${isActive}">
                <span class="nav-icon">${item.icon}</span>
                ${item.label}
            </a>
        `;
    }).join('');

    const avatarHTML = user.avatarUrl
        ? `<img src="${user.avatarUrl}" alt="avatar">`
        : (user.fullName || 'A')[0].toUpperCase();

    const el = document.getElementById('sidebar');
    if (!el) return;

    el.innerHTML = `
        <div class="sidebar-brand">
            <span class="brand-smart">Smart</span><span class="brand-cart">Cart</span>
            <span class="sidebar-label">Quản trị</span>
        </div>

        <div class="sidebar-user">
            <div class="user-avatar">${avatarHTML}</div>
            <div class="user-info">
                <p class="user-name">${user.fullName || user.email || 'Admin'}</p>
                <p class="user-role">${user.role || 'ADMIN'}</p>
            </div>
        </div>

        <nav class="sidebar-nav">
            ${navHTML}
            <div class="nav-divider"></div>
            <a href="#" class="nav-item nav-logout" id="logoutBtn">
                <span class="nav-icon">⏻</span> Đăng xuất
            </a>
        </nav>
    `;

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/frontend/views/auth/login.html';
    });

    // Sidebar toggle mobile
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        el.classList.toggle('open');
    });
}