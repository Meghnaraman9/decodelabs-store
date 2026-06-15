/* =============================================
   DECODELABS STORE DASHBOARD — APP.JS
   No frameworks. Pure JavaScript.
   ============================================= */

// ===== COLOURS (match CSS vars) =====
const COLORS = {
  mocha:      '#A5856E',
  mochaDark:  '#7a5f4f',
  mochaLight: '#c4a48e',
  blue:       '#A0D4E0',
  blueDark:   '#6db8ca',
  blueLight:  '#d0edf4',
  grey:       '#F2F0EA',
  success:    '#4caf82',
  warning:    '#e8a838',
  danger:     '#e05c5c',
  pending:    '#7b92c7',
};

const PRODUCT_COLORS = [
  '#A5856E','#A0D4E0','#c4a48e','#6db8ca','#7b92c7','#4caf82','#e8a838'
];
const STATUS_COLORS = {
  'Delivered':  '#4caf82',
  'Shipped':    '#6db8ca',
  'Pending':    '#7b92c7',
  'Cancelled':  '#e05c5c',
  'Returned':   '#e8a838',
};

// ===== NAVBAR HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});

// Close nav on link click (mobile)
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== SMOOTH SCROLL + ACTIVE NAV =====
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
window.scrollToSection = scrollToSection;

const sections = document.querySelectorAll('.section, .hero');
const navItems = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(n => n.classList.remove('active'));
      const id = entry.target.id;
      const active = document.querySelector(`.nav-link[data-section="${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => observer.observe(s));

// ===== CHARTS =====
function initCharts() {
  Chart.defaults.font.family = "'Roboto', sans-serif";
  Chart.defaults.color = '#5a4a3a';

  // --- 1. Monthly Revenue Bar Chart ---
  const months = MONTHLY_REVENUE.map(d => d.month.slice(0,7));
  const revenues = MONTHLY_REVENUE.map(d => d.revenue);
  new Chart(document.getElementById('revenueChart'), {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Revenue ($)',
        data: revenues,
        backgroundColor: months.map((_, i) =>
          i === months.length - 1 ? COLORS.mocha : COLORS.blue
        ),
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` $${ctx.parsed.y.toLocaleString('en-US', {minimumFractionDigits:2})}`
          }
        }
      },
      scales: {
        y: {
          grid: { color: '#e8e4dc' },
          ticks: { callback: v => '$' + (v/1000).toFixed(0) + 'k', font: { size: 11 } }
        },
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } }
      }
    }
  });

  // --- 2. Order Status Doughnut ---
  const statusLabels = BY_STATUS.map(d => d.status);
  const statusCounts = BY_STATUS.map(d => d.count);
  const statusBg     = statusLabels.map(s => STATUS_COLORS[s] || COLORS.mocha);
  new Chart(document.getElementById('statusChart'), {
    type: 'doughnut',
    data: {
      labels: statusLabels,
      datasets: [{ data: statusCounts, backgroundColor: statusBg, borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` } }
      },
      cutout: '60%'
    }
  });

  // --- 3. Revenue by Product Horizontal Bar ---
  const prodLabels   = BY_PRODUCT.map(d => d.Product);
  const prodRevenues = BY_PRODUCT.map(d => d.TotalPrice);
  new Chart(document.getElementById('productChart'), {
    type: 'bar',
    data: {
      labels: prodLabels,
      datasets: [{
        label: 'Revenue ($)',
        data: prodRevenues,
        backgroundColor: PRODUCT_COLORS,
        borderRadius: 6, borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` $${ctx.parsed.x.toLocaleString()}` } }
      },
      scales: {
        x: {
          grid: { color: '#e8e4dc' },
          ticks: { callback: v => '$' + (v/1000).toFixed(0) + 'k', font: { size: 10 } }
        },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });

  // --- 4. Referral Source Polar Area ---
  const refLabels = BY_REFERRAL.map(d => d.ReferralSource);
  const refVals   = BY_REFERRAL.map(d => d.TotalPrice);
  new Chart(document.getElementById('referralChart'), {
    type: 'polarArea',
    data: {
      labels: refLabels,
      datasets: [{
        data: refVals,
        backgroundColor: ['#A5856E88','#A0D4E088','#c4a48e88','#6db8ca88','#7b92c788'],
        borderColor:     ['#A5856E',  '#A0D4E0',  '#c4a48e',  '#6db8ca',  '#7b92c7'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => ` $${ctx.parsed.r.toLocaleString()}` } }
      }
    }
  });

  // --- 5. Payment Methods Pie (in analytics) ---
  const payLabels = BY_PAYMENT.map(d => d.method);
  const payCounts = BY_PAYMENT.map(d => d.count);
  new Chart(document.getElementById('paymentChart'), {
    type: 'pie',
    data: {
      labels: payLabels,
      datasets: [{
        data: payCounts,
        backgroundColor: ['#A5856E','#A0D4E0','#c4a48e','#4caf82','#e8a838'],
        borderWidth: 2, borderColor: '#fff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 10 } } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` } }
      }
    }
  });
}

// ===== ANALYTICS BARS =====
function initAnalytics() {
  // Top Products
  const maxProd = Math.max(...BY_PRODUCT.map(d => d.TotalPrice));
  const prodEl  = document.getElementById('topProducts');
  const sorted  = [...BY_PRODUCT].sort((a, b) => b.TotalPrice - a.TotalPrice);
  sorted.forEach(item => {
    const pct = ((item.TotalPrice / maxProd) * 100).toFixed(1);
    prodEl.innerHTML += `
      <div class="analytics-row">
        <span class="analytics-name">${item.Product}</span>
        <div class="analytics-bar-wrap">
          <div class="analytics-bar-bg">
            <div class="analytics-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <span class="analytics-val">$${(item.TotalPrice/1000).toFixed(1)}k</span>
      </div>`;
  });

  // Traffic Sources
  const maxRef  = Math.max(...BY_REFERRAL.map(d => d.TotalPrice));
  const refEl   = document.getElementById('trafficSources');
  const sortedR = [...BY_REFERRAL].sort((a, b) => b.TotalPrice - a.TotalPrice);
  sortedR.forEach(item => {
    const pct = ((item.TotalPrice / maxRef) * 100).toFixed(1);
    refEl.innerHTML += `
      <div class="analytics-row">
        <span class="analytics-name">${item.ReferralSource}</span>
        <div class="analytics-bar-wrap">
          <div class="analytics-bar-bg">
            <div class="analytics-bar-fill" style="width:${pct}%; background: linear-gradient(90deg,#A0D4E0,#6db8ca)"></div>
          </div>
        </div>
        <span class="analytics-val">$${(item.TotalPrice/1000).toFixed(1)}k</span>
      </div>`;
  });

  // Status Summary
  const total   = BY_STATUS.reduce((s, d) => s + d.count, 0);
  const statEl  = document.getElementById('statusSummary');
  const sortedS = [...BY_STATUS].sort((a, b) => b.count - a.count);
  sortedS.forEach(item => {
    const pct = ((item.count / total) * 100).toFixed(1);
    statEl.innerHTML += `
      <div class="status-row">
        <span class="status-badge status-${item.status}">${item.status}</span>
        <span class="status-count">${item.count}</span>
        <span class="status-pct">${pct}%</span>
      </div>`;
  });
}

// ===== ORDER TABLE + FILTERS + PAGINATION =====
const ROWS_PER_PAGE = 15;
let currentPage    = 1;
let filteredOrders = [...ORDERS];
let sortKey        = 'Date';
let sortDir        = 'desc';

function fmt(val, key) {
  if (key === 'TotalPrice' || key === 'UnitPrice') return '$' + parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2 });
  if (key === 'OrderStatus') return `<span class="status-badge status-${val}">${val}</span>`;
  return val ?? '—';
}

function renderTable() {
  const tbody   = document.getElementById('tableBody');
  const start   = (currentPage - 1) * ROWS_PER_PAGE;
  const slice   = filteredOrders.slice(start, start + ROWS_PER_PAGE);
  const total   = filteredOrders.length;
  const totalPg = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));

  tbody.innerHTML = slice.map(o => `
    <tr>
      <td><strong>${o.OrderID}</strong></td>
      <td>${o.Date}</td>
      <td>${o.CustomerID}</td>
      <td>${o.Product}</td>
      <td style="text-align:center">${o.Quantity}</td>
      <td>${fmt(o.UnitPrice, 'UnitPrice')}</td>
      <td>${fmt(o.OrderStatus, 'OrderStatus')}</td>
      <td>${o.PaymentMethod}</td>
      <td><strong>${fmt(o.TotalPrice, 'TotalPrice')}</strong></td>
    </tr>`).join('');

  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPg}  (${total} orders)`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === totalPg;
}

function applyFilters() {
  const search  = document.getElementById('searchInput').value.toLowerCase().trim();
  const status  = document.getElementById('statusFilter').value;
  const product = document.getElementById('productFilter').value;
  const payment = document.getElementById('paymentFilter').value;

  filteredOrders = ORDERS.filter(o => {
    const matchSearch  = !search  || o.OrderID.toLowerCase().includes(search) || o.CustomerID.toLowerCase().includes(search) || o.Product.toLowerCase().includes(search);
    const matchStatus  = !status  || o.OrderStatus  === status;
    const matchProduct = !product || o.Product       === product;
    const matchPayment = !payment || o.PaymentMethod === payment;
    return matchSearch && matchStatus && matchProduct && matchPayment;
  });

  // Re-sort
  sortOrders(sortKey, false);
  currentPage = 1;
  renderTable();
}

function sortOrders(key, toggleDir = true) {
  if (toggleDir) {
    sortDir = (sortKey === key && sortDir === 'asc') ? 'desc' : 'asc';
    sortKey = key;
  }
  filteredOrders.sort((a, b) => {
    let av = a[key], bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
    av = String(av); bv = String(bv);
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });
}

// Bind filter buttons
document.getElementById('applyFilters').addEventListener('click', applyFilters);
document.getElementById('resetFilters').addEventListener('click', () => {
  document.getElementById('searchInput').value   = '';
  document.getElementById('statusFilter').value  = '';
  document.getElementById('productFilter').value = '';
  document.getElementById('paymentFilter').value = '';
  filteredOrders = [...ORDERS];
  sortKey = 'Date'; sortDir = 'desc';
  sortOrders(sortKey, false);
  currentPage = 1;
  renderTable();
});

// Live search on Enter
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') applyFilters();
});

// Sortable columns
document.querySelectorAll('.orders-table th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    sortOrders(th.dataset.sort, true);
    currentPage = 1;
    renderTable();
  });
});

// Pagination
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; renderTable(); }
});
document.getElementById('nextPage').addEventListener('click', () => {
  const totalPg = Math.ceil(filteredOrders.length / ROWS_PER_PAGE);
  if (currentPage < totalPg) { currentPage++; renderTable(); }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Initial sort by Date desc
  sortOrders('Date', false);
  renderTable();
  initCharts();
  initAnalytics();
});
