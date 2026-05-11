// 运管后台 - 历练项目管理
export const AdminExplore = () => (
  <section id="admin-explore" class="tab-pane">
    <h2 class="page-title"><span class="cn">历练项目管理</span><span class="en">Explore Loot</span></h2>

    <div class="admin-nav-back">
      <a href="/admin" data-route="/admin" class="ghost-btn"><i class="fas fa-arrow-left"></i> 返回总览</a>
    </div>

    <div class="card admin-explore-card">
      <h3><i class="fas fa-mountain"></i> 历练项目管理</h3>
      <div class="admin-explore-form">
        <div class="form-row">
          <input type="text" id="explore-name" placeholder="物品名称" />
          <input type="number" id="explore-weight" placeholder="权重(概率)" value={10} step={0.5} />
          <input type="number" id="explore-sort" placeholder="排序" value={0} />
        </div>
        <input type="text" id="explore-msg" placeholder="探索描述信息" />
        <div class="form-row">
          <input type="number" id="explore-life" placeholder="寿命奖励(秒)" value={0} />
          <input type="number" id="explore-merit" placeholder="功德奖励" value={0} />
          <input type="number" id="explore-shard" placeholder="碎片奖励" value={0} />
        </div>
        <button id="admin-create-explore-btn" class="oracle-btn"><i class="fas fa-plus"></i> 添加历练项目</button>
      </div>
      <div id="admin-explore-list" class="admin-explore-list"></div>
    </div>
  </section>
)
