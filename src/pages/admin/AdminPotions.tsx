// 运管后台 - 丹药配置
export const AdminPotions = () => (
  <section id="admin-potions" class="tab-pane">
    <h2 class="page-title"><span class="cn">丹药配置</span><span class="en">Potions</span></h2>

    <div class="admin-nav-back">
      <a href="/admin" data-route="/admin" class="ghost-btn"><i class="fas fa-arrow-left"></i> 返回总览</a>
    </div>

    <div class="card admin-potion-card">
      <h3><i class="fas fa-flask-vial"></i> 丹药配置</h3>
      <div id="admin-potion-list" class="admin-potion-list"></div>
      <div class="admin-potion-actions">
        <button id="admin-save-potions" class="oracle-btn"><i class="fas fa-save"></i> 保存丹药配置</button>
        <button id="admin-reset-potions" class="ghost-btn"><i class="fas fa-rotate-left"></i> 恢复默认</button>
      </div>
    </div>
  </section>
)
