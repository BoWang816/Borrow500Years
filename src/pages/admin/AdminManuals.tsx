// 运管后台 - 功法管理
export const AdminManuals = () => (
  <section id="admin-manuals" class="tab-pane">
    <h2 class="page-title"><span class="cn">功法管理</span><span class="en">Manuals</span></h2>

    <div class="admin-nav-back">
      <a href="/admin" data-route="/admin" class="ghost-btn"><i class="fas fa-arrow-left"></i> 返回总览</a>
    </div>

    <div class="card admin-manuals-card">
      <h3><i class="fas fa-book-open"></i> 功法管理</h3>
      <div class="admin-manuals-form">
        <div class="form-row">
          <input type="text" id="manual-key" placeholder="功法KEY(唯一)" />
          <input type="text" id="manual-name" placeholder="功法名称" />
          <input type="text" id="manual-emoji" placeholder="📿" />
        </div>
        <input type="text" id="manual-desc" placeholder="功法描述" />
        <div class="form-row">
          <select id="manual-effect-type">
            <option value="decay_reduction">降低衰减</option>
            <option value="merit_boost">功德加成</option>
            <option value="life_boost">寿命加成</option>
            <option value="task_bonus">任务加成</option>
          </select>
          <input type="number" id="manual-effect-value" placeholder="效果值" step={0.01} />
          <input type="number" id="manual-max-level" placeholder="最高等级" value={10} />
          <input type="number" id="manual-cost" placeholder="功德消耗" value={100} />
        </div>
        <button id="admin-create-manual-btn" class="oracle-btn"><i class="fas fa-plus"></i> 添加功法</button>
      </div>
      <div id="admin-manuals-list" class="admin-manuals-list"></div>
    </div>
  </section>
)
