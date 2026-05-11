// 运管后台 - 操作日志
export const AdminLogs = () => (
  <section id="admin-logs" class="tab-pane">
    <h2 class="page-title"><span class="cn">操作日志</span><span class="en">Logs</span></h2>

    <div class="admin-nav-back">
      <a href="/admin" data-route="/admin" class="ghost-btn"><i class="fas fa-arrow-left"></i> 返回总览</a>
    </div>

    <div class="card admin-logs-card">
      <h3><i class="fas fa-clipboard-list"></i> 操作日志</h3>
      <div class="admin-table-wrap">
        <table class="admin-table" id="admin-log-table">
          <thead><tr><th>时间</th><th>管理员</th><th>操作</th><th>详情</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  </section>
)
