// 长生榜 Leaderboard 页面
export const Leaderboard = () => (
  <section id="leaderboard" class="tab-pane">
    <h2 class="page-title"><span class="cn">天榜 · The Pantheon</span><span class="en">Leaderboard</span></h2>

    <div class="board-tabs">
      <button class="board-tab active" data-board="longevity">长生榜（剩余寿命）</button>
      <button class="board-tab" data-board="merit">功德榜（养生延寿）</button>
    </div>

    <div class="board-list" id="board-list"></div>

    <div class="title-system">
      <h3 class="sub-title">— 称号体系 —</h3>
      <div class="titles">
        <div class="title-card"><span class="age-range">0-80岁</span><span class="title-name">凡胎肉身</span></div>
        <div class="title-card"><span class="age-range">80-120岁</span><span class="title-name">寿比南山</span></div>
        <div class="title-card"><span class="age-range">120-200岁</span><span class="title-name">地仙之姿</span></div>
        <div class="title-card legendary"><span class="age-range">200-500岁</span><span class="title-name">与天同寿</span></div>
      </div>
    </div>
  </section>
)
