// 运管后台 - 修炼项目管理
export const AdminTasks = () => (
  <section id="admin-tasks" class="tab-pane">
    <h2 class="page-title"><span class="cn">修炼项目管理</span><span class="en">Extra Tasks</span></h2>

    <div class="admin-nav-back">
      <a href="/admin" data-route="/admin" class="ghost-btn"><i class="fas fa-arrow-left"></i> 返回总览</a>
    </div>

    <div class="card admin-extra-tasks-card">
      <h3><i class="fas fa-list-check"></i> 修炼项目管理</h3>
      <div class="admin-extra-tasks-form">
        <div class="form-row">
          <input type="text" id="extra-task-key" placeholder="任务KEY(唯一)" />
          <input type="text" id="extra-task-name" placeholder="任务名称" />
          <input type="text" id="extra-task-emoji" placeholder="🧘" />
        </div>
        <input type="text" id="extra-task-desc" placeholder="任务描述" />
        <div class="form-row">
          <input type="number" id="extra-task-life" placeholder="寿命奖励(秒)" value={600} />
          <input type="number" id="extra-task-merit" placeholder="功德奖励" value={1} />
          <input type="number" id="extra-task-shard" placeholder="碎片奖励" value={0} />
          <input type="number" id="extra-task-sort" placeholder="排序" value={0} />
        </div>
        <button id="admin-create-extra-task-btn" class="oracle-btn"><i class="fas fa-plus"></i> 添加修炼项目</button>
      </div>
      <div id="admin-extra-tasks-list" class="admin-extra-tasks-list"></div>
    </div>
  </section>
)
