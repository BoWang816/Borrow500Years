// 修炼 Cultivation 页面 - 日常修炼任务
export const Cultivation = () => (
  <section id="cultivation" class="tab-pane">
    <h2 class="page-title"><span class="cn">养生修炼</span><span class="en">Daily Cultivation</span></h2>

    <div class="cultivation-grid">
      <div class="task-card" data-task="ziwu">
        <div class="task-icon"><i class="fas fa-moon"></i></div>
        <div class="task-body">
          <h4>子午流注</h4>
          <p>23:00 前入睡，次日衰减率降低 20%</p>
          <div class="task-reward">奖励：<span class="reward-life">+30 分钟</span> · <span class="reward-mod">-0.2x 衰减</span></div>
        </div>
        <button class="task-btn" data-task="ziwu">打卡</button>
      </div>

      <div class="task-card" data-task="steps">
        <div class="task-icon"><i class="fas fa-shoe-prints"></i></div>
        <div class="task-body">
          <h4>步步为营</h4>
          <p>每日步行修行，1000 步 = +12 分钟，达 10000 步 +2 小时</p>
          <div class="step-input">
            <input type="range" min={0} max={20000} step={500} value={0} id="steps-range" />
            <div class="step-num"><span id="steps-num">0</span> 步</div>
          </div>
          <div class="task-reward">折算：<span id="steps-life" class="reward-life">+0 分钟</span></div>
        </div>
        <button class="task-btn" data-task="steps">提交</button>
      </div>

      <div class="task-card" data-task="water">
        <div class="task-icon"><i class="fas fa-tint"></i></div>
        <div class="task-body">
          <h4>上善若水</h4>
          <p>每日 8 次饮水，单次 +5 分钟寿命</p>
          <div class="water-cups" id="water-cups"></div>
        </div>
        <button class="task-btn" data-task="water">饮一杯</button>
      </div>

      <div class="task-card" data-task="meditate">
        <div class="task-icon"><i class="fas fa-spa"></i></div>
        <div class="task-body">
          <h4>静坐冥想</h4>
          <p>静坐 10 分钟，心境清明，+15 分钟寿命</p>
          <div class="task-reward">连续打卡奖励：<span class="reward-coin">复活币碎片</span></div>
        </div>
        <button class="task-btn" data-task="meditate">入定</button>
      </div>

      <div class="task-card challenge" data-task="earlyrise">
        <div class="task-icon"><i class="fas fa-sun"></i></div>
        <div class="task-body">
          <h4>早起挑战 · 七日劫数</h4>
          <p>连续 7 天 7:00 前起床，奖励 1 枚复活币</p>
          <div class="streak-bar" id="streak-bar"></div>
          <div class="task-reward">当前进度：<span id="streak-num">0</span> / 7 天</div>
        </div>
        <button class="task-btn" data-task="earlyrise">今日已早起</button>
      </div>

      <div class="task-card challenge" data-task="diet">
        <div class="task-icon"><i class="fas fa-bowl-rice"></i></div>
        <div class="task-body">
          <h4>清淡饮食</h4>
          <p>记录三餐，少油少盐，+20 分钟寿命</p>
          <div class="task-reward">奖励：<span class="reward-life">+20 分钟</span> · 功德 +1</div>
        </div>
        <button class="task-btn" data-task="diet">今日清淡</button>
      </div>
    </div>

    {/* 扩展养生修炼任务 */}
    <div class="extra-tasks-section">
      <h3 class="section-title">📋 扩展养生修炼</h3>
      <div id="extra-tasks-grid" class="extra-tasks-grid"></div>
    </div>
  </section>
)
