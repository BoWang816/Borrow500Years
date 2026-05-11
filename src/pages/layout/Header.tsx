// 顶部导航组件 - 支持前端路由
export const Header = () => (
  <header class="topbar">
    <div class="brand">
      <span class="brand-seal">寿</span>
      <div class="brand-text">
        <h1 class="brand-cn">向天再借<span class="num">500</span>年</h1>
        <p class="brand-en">BORROW · 500 · YEARS</p>
      </div>
    </div>
    <nav class="nav">
      <a href="/" class="nav-item active" data-route="/" data-tab="dashboard"><i class="fas fa-heart-pulse"></i><span>命脉</span></a>
      <a href="/fortune" class="nav-item" data-route="/fortune" data-tab="fortune"><i class="fas fa-star"></i><span>运势</span></a>
      <a href="/cultivation" class="nav-item" data-route="/cultivation" data-tab="cultivation"><i class="fas fa-leaf"></i><span>修炼</span></a>
      <a href="/inventory" class="nav-item" data-route="/inventory" data-tab="inventory"><i class="fas fa-flask-vial"></i><span>丹房</span></a>
      <a href="/adventure" class="nav-item" data-route="/adventure" data-tab="adventure"><i class="fas fa-mountain-sun"></i><span>历练</span></a>
      <a href="/leaderboard" class="nav-item" data-route="/leaderboard" data-tab="leaderboard"><i class="fas fa-trophy"></i><span>长生榜</span></a>
      <a href="/profile" class="nav-item" data-route="/profile" data-tab="profile"><i class="fas fa-user-astronaut"></i><span>道号</span></a>
    </nav>
    <div class="topbar-actions">
      <a href="/admin" class="admin-link hidden" data-route="/admin" data-tab="admin" id="admin-nav" title="运管后台"><i class="fas fa-shield-halved"></i></a>
      <span id="user-tag" class="user-tag hidden"><i class="fas fa-user"></i> <span id="user-name">—</span></span>
      <span id="title-badge" class="title-badge">凡胎肉身</span>
      <button id="logout-btn" class="reset-btn hidden" title="登出"><i class="fas fa-right-from-bracket"></i></button>
    </div>
  </header>
)
