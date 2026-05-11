// 丹房 Inventory 页面
export const Inventory = () => (
  <section id="inventory" class="tab-pane">
    <h2 class="page-title"><span class="cn">丹房 · 商城</span><span class="en">Apothecary</span></h2>

    <div class="merit-bar">
      <div class="merit-item">
        <i class="fas fa-coins"></i>
        <div>
          <div class="merit-label">复活币</div>
          <div class="merit-val" id="inv-coin">0</div>
        </div>
      </div>
      <div class="merit-item">
        <i class="fas fa-gem"></i>
        <div>
          <div class="merit-label">功德值</div>
          <div class="merit-val" id="inv-merit">0</div>
        </div>
      </div>
      <div class="merit-item">
        <i class="fas fa-puzzle-piece"></i>
        <div>
          <div class="merit-label">复活币碎片</div>
          <div class="merit-val" id="inv-shard">0 / 5</div>
        </div>
      </div>
    </div>

    <h3 class="sub-title">— 延寿补剂 —</h3>
    <div class="potion-grid" id="potion-grid"></div>

    <h3 class="sub-title">— 我的丹炉 · 已激活 —</h3>
    <div class="active-potions" id="active-potions">
      <p class="empty">尚无丹药生效</p>
    </div>
  </section>
)
