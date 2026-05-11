// 历练 Adventure 页面
export const Adventure = () => (
  <section id="adventure" class="tab-pane">
    {/* 英雄横幅 */}
    <div class="adv-hero">
      <div class="adv-hero-bg"></div>
      <div class="adv-hero-content">
        <div class="adv-hero-icon"><i class="fas fa-mountain-sun"></i></div>
        <h2 class="adv-hero-title">仙途历练</h2>
        <p class="adv-hero-sub">闯秘境 · 渡天劫 · 铸成就</p>
      </div>
    </div>

    <div class="adv-container">
      {/* 上部：秘境探险 & 天劫挑战 并列 */}
      <div class="adv-top-row">
        {/* 秘境探险 */}
        <div class="card adv-card explore-card">
          <div class="adv-card-header">
            <div class="adv-icon-wrap explore-icon"><i class="fas fa-dungeon"></i></div>
            <div class="adv-title-wrap">
              <h3>秘境探险</h3>
              <span class="adv-subtitle">消耗功德 · 探寻机缘</span>
            </div>
          </div>
          <div class="adv-card-body">
            <p class="explore-desc">闯入未知秘境，随机获得寿命、碎片或奇遇</p>
            <div class="explore-rewards">
              <div class="reward-tag legendary"><i class="fas fa-crown"></i> +1年</div>
              <div class="reward-tag epic"><i class="fas fa-star"></i> +1天</div>
              <div class="reward-tag rare"><i class="fas fa-gem"></i> +12时</div>
              <div class="reward-tag common"><i class="fas fa-wind"></i> 灵气</div>
            </div>
            <div class="explore-cost"><i class="fas fa-yin-yang"></i> 20 功德</div>
          </div>
          <div class="adv-card-footer">
            <button id="explore-btn" class="adv-btn primary"><i class="fas fa-compass"></i> 闯入秘境</button>
          </div>
          <div id="explore-result" class="explore-result"></div>
        </div>

        {/* 天劫挑战 */}
        <div class="card adv-card tribulation-card">
          <div class="adv-card-header">
            <div class="adv-icon-wrap trib-icon"><i class="fas fa-bolt-lightning"></i></div>
            <div class="adv-title-wrap">
              <h3>天劫挑战</h3>
              <span class="adv-subtitle">每周一次 · 逆天改命</span>
            </div>
          </div>
          <div class="adv-card-body">
            <div class="trib-reward-preview">
              <div class="trib-reward win"><i class="fas fa-plus"></i> 7天</div>
              <div class="trib-divider">/</div>
              <div class="trib-reward lose"><i class="fas fa-minus"></i> 3时</div>
            </div>
            <p class="trib-desc">完成3项指定修炼渡劫成功</p>
            <div id="trib-status" class="trib-status">
              <div class="trib-loading">天劫推演中...</div>
            </div>
          </div>
          <div id="trib-actions" class="trib-actions hidden">
            <button id="trib-accept" class="adv-btn primary"><i class="fas fa-hand-fist"></i> 接下天劫</button>
            <div class="trib-btns-row">
              <button id="trib-complete" class="adv-btn success hidden"><i class="fas fa-check"></i> 完成</button>
              <button id="trib-fail" class="adv-btn danger hidden"><i class="fas fa-xmark"></i> 放弃</button>
            </div>
          </div>
        </div>
      </div>

      {/* 下部：成就墙 全宽 */}
      <div class="card adv-card achievements-card">
        <div class="adv-card-header compact">
          <div class="adv-icon-wrap ach-icon"><i class="fas fa-medal"></i></div>
          <div class="adv-title-wrap">
            <h3>成就墙 <span class="ach-count" id="ach-count">0/14</span></h3>
            <span class="adv-subtitle">修仙路上的里程碑</span>
          </div>
          <button id="check-ach-btn" class="adv-btn ghost sm"><i class="fas fa-rotate"></i> 检查</button>
        </div>
        <div id="achievements-list" class="achievements-list"></div>
      </div>
    </div>
  </section>
)
