// 命脉 Dashboard 页面
export const Dashboard = () => (
  <section id="dashboard" class="tab-pane active">
    <div class="pulse-wrap">
      <div class="pulse-rings">
        <div class="ring ring1"></div>
        <div class="ring ring2"></div>
        <div class="ring ring3"></div>
        <div class="ring-bagua"></div>
      </div>

      <div class="pulse-core">
        <div class="pulse-label">PULSE · 寿命倒计时</div>
        <div id="pulse-time" class="pulse-time">
          <span class="seg" data-k="years">000</span><em>年</em>
          <span class="seg" data-k="days">000</span><em>日</em>
          <span class="seg" data-k="hours">00</span><em>:</em>
          <span class="seg" data-k="minutes">00</span><em>:</em>
          <span class="seg" data-k="seconds">00</span>
        </div>
        <div id="pulse-seconds" class="pulse-seconds">— · — 秒</div>
        <div class="pulse-meta">
          <div class="meta-item">
            <span class="meta-label">衰减速率</span>
            <span id="decay-rate" class="meta-val">1.00x</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">境界</span>
            <span id="realm" class="meta-val realm">凡胎肉身</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">复活币</span>
            <span id="revive-coin" class="meta-val coin"><i class="fas fa-coins"></i> 0</span>
          </div>
        </div>
        <div class="pulse-toggle">
          <button class="t-btn active" data-mode="full">岁·日·时·分·秒</button>
          <button class="t-btn" data-mode="seconds">精确秒</button>
          <button class="t-btn" data-mode="days">总天数</button>
        </div>
      </div>
    </div>

    <div class="dash-cards">
      <div class="card flux-card">
        <h3><i class="fas fa-bolt"></i> 修正系数 (Modifier)</h3>
        <ul id="modifier-list" class="modifier-list">
          <li class="empty">暂无修正项</li>
        </ul>
      </div>
      <div class="card event-card">
        <h3><i class="fas fa-scroll"></i> 命运卷轴 · 事件日志</h3>
        <ul id="event-log" class="event-log"></ul>
        <button id="trigger-event" class="ghost-btn"><i class="fas fa-dice-d20"></i> 掷天骰 · 触发随机事件</button>
      </div>
    </div>
  </section>
)
