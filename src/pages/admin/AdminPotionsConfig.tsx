// 运管后台 - 丹药项目管理
export const AdminPotionsConfig = () => (
  <section id="admin-potions-config" class="tab-pane">
    <h2 class="page-title"><span class="cn">丹药项目管理</span><span class="en">Potions Config</span></h2>

    <div class="admin-nav-back">
      <a href="/admin" data-route="/admin" class="ghost-btn"><i class="fas fa-arrow-left"></i> 返回总览</a>
    </div>

    <div class="card admin-potions-config-card">
      <h3><i class="fas fa-flask"></i> 丹药项目管理</h3>
      <div class="admin-potions-config-form">
        <div class="form-row">
          <input type="text" id="potion-config-id" placeholder="丹药ID(唯一)" />
          <input type="text" id="potion-config-name" placeholder="丹药名称" />
          <input type="text" id="potion-config-emoji" placeholder="💊" />
        </div>
        <input type="text" id="potion-config-desc" placeholder="丹药描述" />
        <div class="form-row">
          <input type="number" id="potion-config-cost" placeholder="功德消耗" value={30} />
          <input type="number" id="potion-config-instant-life" placeholder="立即增加寿命(秒)" value={0} />
          <input type="number" id="potion-config-dur" placeholder="持续时间(秒)" value={86400} />
          <input type="number" id="potion-config-decay" placeholder="衰减降低比例" value={0} step={0.01} />
        </div>
        <button id="admin-create-potion-btn" class="oracle-btn"><i class="fas fa-plus"></i> 添加丹药</button>
      </div>
      <div id="admin-potions-config-list" class="admin-potions-config-list"></div>
    </div>
  </section>
)
