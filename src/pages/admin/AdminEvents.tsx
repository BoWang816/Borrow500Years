// 运管后台 - 全服事件管理
export const AdminEvents = () => (
  <section id="admin-events" class="tab-pane">
    <h2 class="page-title"><span class="cn">全服事件管理</span><span class="en">World Events</span></h2>

    <div class="admin-nav-back">
      <a href="/admin" data-route="/admin" class="ghost-btn"><i class="fas fa-arrow-left"></i> 返回总览</a>
    </div>

    <div class="card admin-world-events-card">
      <h3><i class="fas fa-globe"></i> 创建全服事件</h3>
      <div class="admin-we-form">
        <div class="form-row">
          <input type="text" id="we-key" placeholder="事件KEY" />
          <input type="text" id="we-name" placeholder="事件名称" />
          <input type="text" id="we-emoji" placeholder="📢" />
        </div>
        <input type="text" id="we-desc" placeholder="事件描述" />
        <div class="form-row">
          <select id="we-effect-type">
            <option value="global_merit">全服功德加成</option>
            <option value="global_decay">全服衰减调整</option>
            <option value="global_life">全服寿命加成</option>
            <option value="task_double">任务双倍</option>
          </select>
          <input type="number" id="we-effect-value" placeholder="效果值(如0.5)" step={0.1} />
          <input type="number" id="we-duration" placeholder="持续时间(秒)" value={86400} />
        </div>
        <button id="we-create-btn" class="oracle-btn"><i class="fas fa-plus"></i> 创建全服事件</button>
      </div>
      <div id="admin-we-list" class="admin-we-list"></div>
    </div>
  </section>
)
