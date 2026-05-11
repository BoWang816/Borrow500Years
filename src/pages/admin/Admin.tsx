// 管理后台 Admin 页面 - 导航入口
export const Admin = () => (
  <section id="admin" class="tab-pane">
    <h2 class="page-title"><span class="cn">运管后台</span><span class="en">Operations</span></h2>

    {/* 权限检查遮罩 */}
    <div id="admin-gate" class="admin-gate">
      <div class="gate-card">
        <div class="gate-icon"><i class="fas fa-shield-halved"></i></div>
        <h3>管理后台 · 权限验证</h3>
        <p id="admin-gate-msg">正在检查管理员权限...</p>
        <button id="admin-gate-btn" class="oracle-btn hidden" onclick="window.location.reload()">
          <i class="fas fa-rotate"></i> 刷新重试
        </button>
      </div>
    </div>

    {/* 管理后台导航 - 仅管理员可见 */}
    <div id="admin-nav-content" class="admin-nav hidden">
      <div class="admin-nav-grid">
        <a href="/admin/overview" data-route="/admin/overview" class="admin-nav-card">
          <div class="admin-nav-icon"><i class="fas fa-chart-line"></i></div>
          <div class="admin-nav-text">
            <h4>平台概览</h4>
            <p>数据统计与用户分布</p>
          </div>
        </a>
        <a href="/admin/potions" data-route="/admin/potions" class="admin-nav-card">
          <div class="admin-nav-icon"><i class="fas fa-flask-vial"></i></div>
          <div class="admin-nav-text">
            <h4>丹药配置</h4>
            <p>管理延寿丹药参数</p>
          </div>
        </a>
        <a href="/admin/logs" data-route="/admin/logs" class="admin-nav-card">
          <div class="admin-nav-icon"><i class="fas fa-clipboard-list"></i></div>
          <div class="admin-nav-text">
            <h4>操作日志</h4>
            <p>查看管理员操作记录</p>
          </div>
        </a>
        <a href="/admin/events" data-route="/admin/events" class="admin-nav-card">
          <div class="admin-nav-icon"><i class="fas fa-globe"></i></div>
          <div class="admin-nav-text">
            <h4>全服事件</h4>
            <p>创建和管理全服活动</p>
          </div>
        </a>
        <a href="/admin/manuals" data-route="/admin/manuals" class="admin-nav-card">
          <div class="admin-nav-icon"><i class="fas fa-book-open"></i></div>
          <div class="admin-nav-text">
            <h4>功法管理</h4>
            <p>配置修仙功法系统</p>
          </div>
        </a>
        <a href="/admin/tasks" data-route="/admin/tasks" class="admin-nav-card">
          <div class="admin-nav-icon"><i class="fas fa-list-check"></i></div>
          <div class="admin-nav-text">
            <h4>修炼项目</h4>
            <p>管理日常修炼任务</p>
          </div>
        </a>
        <a href="/admin/explore" data-route="/admin/explore" class="admin-nav-card">
          <div class="admin-nav-icon"><i class="fas fa-mountain"></i></div>
          <div class="admin-nav-text">
            <h4>历练项目</h4>
            <p>配置秘境探险掉落</p>
          </div>
        </a>
        <a href="/admin/potions-config" data-route="/admin/potions-config" class="admin-nav-card">
          <div class="admin-nav-icon"><i class="fas fa-flask"></i></div>
          <div class="admin-nav-text">
            <h4>丹药项目</h4>
            <p>管理丹药基础配置</p>
          </div>
        </a>
      </div>
    </div>
  </section>
)
