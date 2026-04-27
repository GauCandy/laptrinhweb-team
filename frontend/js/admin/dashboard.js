let revenueChartInstance = null;

// ============ STAT CARDS ============

async function loadStatCards() {
  try {
    // Gọi song song 2 API cùng lúc
    const [usersRes, productsRes] = await Promise.all([
      apiFetch("/users"),
      apiFetch("/products"),
    ]);

    // Vì backend trả về { success: true, data: [...] }
    // Nên phải lấy .data, nếu không có thì dùng mảng rỗng []
    const users = usersRes.data || [];
    const products = productsRes.data || [];

    // Điền số liệu vào html theo id
    document.getElementById("stat-users").textContent = formatNumber(
      users.length,
    );
    document.getElementById("stat-products").textContent = formatNumber(
      products.length,
    );

    // TODO: bổ sung khi có API orders và revenue
    // document.getElementById('stat-orders').textContent  = formatNumber(orders.length);
    // document.getElementById('stat-revenue').textContent = formatPrice(totalRevenue);
  } catch (err) {
    console.error("loadStatCards:", err);
  }
}

// ============ BIỂU ĐỒ DOANH THU ============

async function loadRevenueChart() {
  // Tạo nhãn 7 ngày gần nhất: ["13/04", "14/04", ... "19/04"]
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // Lùi ngày về quá khứ
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  });

  // TODO: thay bằng apiFetch('/revenue?days=7') khi có API
  // Tạm thời dùng data giả để biểu đồ không trống
  const data = [1200000, 3400000, 2800000, 4200000, 3100000, 5600000, 4800000];

  // Lấy thẻ canvas trong HTML để vẽ vào
  const ctx = document.getElementById("revenueCanvas");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar", //Biểu đồ cột
    data: {
      labels: last7Days, // trục X - ngày
      datasets: [
        {
          label: "Doanh thu",
          data: data, // trục Y - số tiền
          backgroundColor: "rgba(22, 163, 74, 0.8", // Màu xanh lá
          borderColer: "#16a34a",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      Plugin: {
        legend: { display: false }, // ẩn chú thích
        tooltip: {
          callbacks: {
            // Khi hover vào cột -> hiện số tiền
            label: (c) => formatPrice(c.raw),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          tricks: {
            callback: (v) => formatPrice(v), //format trụy Y
          },
        },
        x: {
          gird: { display: false }, // ẩn đường kẻ dọc
        },
      },
    },
  });
}

// ============ ĐƠN HÀNG GẦN ĐÂY ============

async function loadRecentOrders() {
  const tbody = document.getElementById("recentOrdersTable");

  try {
    // TODO: thay bằng apiFetch('/orders?limit=5') khi có API
    // Tạm thời hiện thông báo chờ
    tbody.innerHTML = `
        <tr>
                <td colspan="4" class="table-loading">
                    Chưa có API đơn hàng
                </td>
            </tr>
        `;

    /* Khi có API mở ra dùng:
        const res = await apiFetch('/orders?limit=5');
        const orders = res.data || [];

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
    tbody.innerHTML = `
            <tr>
                <td colspan="4" class="table-loading">Lỗi tải dữ liệu</td>
            </tr>
        `;
    console.error("loadRecentOrders:", err);
  }
}

// ============ SẢN PHẨM BÁN CHẠY ============

async function loadTopProducts() {
  const tbody = document.getElementById("topProductsTable");

  try {
    const res = await apiFetch("/products?limit=5&sort=sold");
    const products = res.data || [];

    if (!products.length) {
      tbody.innerHTML = `
            <tr>
                    <td colspan="3" class="table-loading">Không có dữ liệu</td>
                </tr>
            `;
      return;
    }

    tbody.innerHTML = products
      .map(
        (p) => `
            <tr>
                <td>${p.name}</td>
                <td>${formatNumber(p.sold || 0)}</td>
                <td>${formatPrice(p.price)}</td>
            </tr>
            `,
      )
      .join("");
  } catch (err) {
    (tbody,
      (innerHTML = `
             <tr>
                <td colspan="3" class="table-loading">Lỗi tải dữ liệu</td>
            </tr>
        `));
    console.error("topProductsTable:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Kiểm tra quyền - nếu không phải ADMIN thì dừng lại
  const user = checkAdminAuth();
  if (!user) return;

  // Render sidebar, highlight menu 'dashboard'
  renderSidebar("dashboard");

  // Chạy đồng hồ
  startClock();

  // Load tất cả data song song cho nhanh
  // Promise.all nghĩa là chạy cùng lúc, không cần phải chờ
  await Promise.all([
    // loadStatCards(),
    loadRevenueChart(),
    loadRecentOrders(),
    loadTopProducts(),
  ]);
});
