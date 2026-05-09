import { Hono } from 'hono'
import { renderer } from './renderer'
import api from './api'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

app.route('/api', api)

app.use(renderer)

app.get('/', (c) => {
  return c.render(
    <>
      {/* 背景层：星空 + 八卦 */}
      <div class="bg-stars"></div>
      <div class="bg-bagua"></div>
      <div class="bg-grid"></div>
      <div class="bg-glow"></div>

      {/* 顶部导航 */}
      <header class="topbar">
        <div class="brand">
          <span class="brand-seal">寿</span>
          <div class="brand-text">
            <h1 class="brand-cn">向天再借<span class="num">500</span>年</h1>
            <p class="brand-en">BORROW · 500 · YEARS</p>
          </div>
        </div>
        <nav class="nav">
          <a href="#dashboard" class="nav-item active" data-tab="dashboard"><i class="fas fa-heart-pulse"></i><span>命脉</span></a>
          <a href="#cultivation" class="nav-item" data-tab="cultivation"><i class="fas fa-leaf"></i><span>修炼</span></a>
          <a href="#inventory" class="nav-item" data-tab="inventory"><i class="fas fa-flask-vial"></i><span>丹房</span></a>
          <a href="#leaderboard" class="nav-item" data-tab="leaderboard"><i class="fas fa-trophy"></i><span>长生榜</span></a>
          <a href="#profile" class="nav-item" data-tab="profile"><i class="fas fa-user-astronaut"></i><span>道号</span></a>
        </nav>
        <div class="topbar-actions">
          <span id="user-tag" class="user-tag hidden"><i class="fas fa-user"></i> <span id="user-name">—</span></span>
          <span id="title-badge" class="title-badge">凡胎肉身</span>
          <button id="logout-btn" class="reset-btn hidden" title="登出"><i class="fas fa-right-from-bracket"></i></button>
          <button id="reset-btn" class="reset-btn" title="转世清档"><i class="fas fa-rotate"></i></button>
        </div>
      </header>

      {/* 登录/注册弹窗 */}
      <section id="auth-modal" class="modal hidden">
        <div class="modal-card oracle">
          <div class="oracle-glow"></div>
          <h2 class="oracle-title"><span class="cn">登仙籍</span><span class="en">Sign In</span></h2>
          <p class="oracle-sub">先入仙籍，方得开启命盘</p>
          <div class="auth-tabs">
            <button class="auth-tab active" data-mode="login">登录</button>
            <button class="auth-tab" data-mode="register">注册新道号</button>
          </div>
          <form id="auth-form" class="oracle-form">
            <label>道号 <input name="username" maxlength="24" placeholder="2~24 个字符" required /></label>
            <label>密令 <input name="password" type="password" minlength="4" maxlength="64" placeholder="至少 4 位" required /></label>
            <button type="submit" class="oracle-btn"><span id="auth-btn-text">入 · 仙 · 籍</span></button>
            <p id="auth-err" class="auth-err"></p>
          </form>
        </div>
      </section>

      {/* 注册测算弹窗 */}
      <section id="onboarding" class="modal hidden">
        <div class="modal-card oracle">
          <div class="oracle-glow"></div>
          <h2 class="oracle-title"><span class="cn">天命测算</span><span class="en">Oracle Of Fate</span></h2>
          <p class="oracle-sub">阁下，欲知天数几何，请先报上根骨</p>
          <form id="onboard-form" class="oracle-form">
            <label>道号 <input name="name" maxlength="12" placeholder="阁下尊姓大名" required /></label>
            <div class="row">
              <label>性别
                <select name="gender">
                  <option value="male">乾·男</option>
                  <option value="female">坤·女</option>
                </select>
              </label>
              <label>年龄 <input name="age" type="number" min="1" max="120" value="25" required /></label>
            </div>
            <div class="row">
              <label>身高(cm) <input name="height" type="number" min="50" max="250" value="170" required /></label>
              <label>体重(kg) <input name="weight" type="number" min="20" max="300" value="65" required /></label>
            </div>
            <label class="checkboxes">恶习/根骨
              <div class="chk-row">
                <label class="chk"><input type="checkbox" name="smoke" /><span>烟瘾深重</span></label>
                <label class="chk"><input type="checkbox" name="alcohol" /><span>嗜酒贪杯</span></label>
                <label class="chk"><input type="checkbox" name="stayup" /><span>长期熬夜</span></label>
                <label class="chk"><input type="checkbox" name="hereditary" /><span>家族病史</span></label>
                <label class="chk"><input type="checkbox" name="exercise" /><span>常年习武</span></label>
                <label class="chk"><input type="checkbox" name="meditate" /><span>静坐打坐</span></label>
              </div>
            </label>
            <button type="submit" class="oracle-btn"><span>开 · 启 · 命 · 盘</span></button>
          </form>
        </div>
      </section>

      {/* 主面板 */}
      <main class="main">
        {/* 命脉 Dashboard */}
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
                <span class="seg ms" data-k="ms">000</span>
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

        {/* 修炼 Cultivation */}
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
                  <input type="range" min="0" max="20000" step="500" value="0" id="steps-range" />
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
        </section>

        {/* 丹房 Inventory */}
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

        {/* 长生榜 */}
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

        {/* 道号 Profile */}
        <section id="profile" class="tab-pane">
          <h2 class="page-title"><span class="cn">道号印鉴</span><span class="en">Profile</span></h2>
          <div class="profile-card">
            <div class="avatar-wrap">
              <div class="avatar"><span id="avatar-char">道</span></div>
              <div class="avatar-ring"></div>
            </div>
            <div class="profile-info" id="profile-info"></div>
          </div>

          <div class="formula-card">
            <h3>核心寿命公式</h3>
            <pre class="formula">L_current = L_initial + Σ L_gain − (T_now − T_start) × R_decay</pre>
            <p class="formula-note">L_gain：养生行为增量 · R_decay：衰减系数（受作息、心情等加成影响）</p>
          </div>
        </section>
      </main>

      {/* 危机/弥留状态遮罩 */}
      <div id="crisis-overlay" class="crisis-overlay hidden">
        <div class="crisis-text">命悬一线 · CRISIS</div>
      </div>
      <div id="dying-modal" class="modal hidden">
        <div class="modal-card dying">
          <h2><i class="fas fa-skull"></i> 弥留之际</h2>
          <p>阁下寿元已尽，现进入 24 小时弥留期</p>
          <p>消耗 <strong>1 枚复活币</strong> 可起死回生，否则将转世清档。</p>
          <div class="dying-actions">
            <button id="revive-btn" class="oracle-btn"><i class="fas fa-heart"></i> 消耗复活币 · 续命</button>
            <button id="reborn-btn" class="ghost-btn">转世重修</button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div id="toast-wrap" class="toast-wrap"></div>
    </>
  )
})

export default app
