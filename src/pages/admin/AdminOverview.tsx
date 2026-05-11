// 运管后台 - 平台概览 + 用户分布
export const AdminOverview = () => (
  <section id="admin-overview" class="tab-pane">
    <h2 class="page-title"><span class="cn">运管后台</span><span class="en">Operations</span></h2>

    <div class="admin-nav-back">
      <a href="/admin" data-route="/admin" class="ghost-btn"><i class="fas fa-arrow-left"></i> 返回后台首页</a>
    </div>

    {/* 管理后台内容 */}
    <div id="admin-overview-content" class="admin-content">
      {/* 平台概览 */}
      <div class="admin-stats" id="admin-stats">
        <div class="stat-card"><div class="stat-val" id="stat-total">—</div><div class="stat-label">注册用户</div></div>
        <div class="stat-card"><div class="stat-val" id="stat-active">—</div><div class="stat-label">开启命盘</div></div>
        <div class="stat-card"><div class="stat-val" id="stat-tasks">—</div><div class="stat-label">今日任务</div></div>
        <div class="stat-card"><div class="stat-val" id="stat-events">—</div><div class="stat-label">总事件</div></div>
        <div class="stat-card"><div class="stat-val" id="stat-potions">—</div><div class="stat-label">丹药服用</div></div>
        <div class="stat-card"><div class="stat-val" id="stat-ach">—</div><div class="stat-label">成就解锁</div></div>
      </div>

      {/* 用户分布 */}
      <div class="card admin-table-card">
        <h3><i class="fas fa-users"></i> 用户分布 · <span id="user-count">0</span> 人</h3>
        <div class="admin-table-wrap">
          <table class="admin-table" id="admin-user-table">
            <thead>
              <tr><th>ID</th><th>道号</th><th>姓名</th><th>年龄</th><th>BMI</th><th>境界</th><th>剩余寿命</th><th>功德</th><th>复活币</th><th> streak</th><th>状态</th></tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
)
