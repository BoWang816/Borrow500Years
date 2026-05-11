// 运势 Fortune 页面
export const Fortune = () => (
  <section id="fortune" class="tab-pane">
    <h2 class="page-title"><span class="cn">运势天机</span><span class="en">Daily Fortune</span></h2>

    {/* 今日运势 */}
    <div class="card fortune-card">
      <div class="fortune-display" id="fortune-display">
        <div class="fortune-loading">正在推演天机...</div>
      </div>
      <button id="checkin-btn" class="oracle-btn hidden"><i class="fas fa-gift"></i> 签到领取运势奖励</button>
    </div>

    {/* 功法修炼 */}
    <div class="card manuals-card">
      <h3><i class="fas fa-book-open"></i> 功法修炼</h3>
      <div id="manuals-list" class="manuals-list"></div>
    </div>

    {/* 全服事件 */}
    <div class="card world-events-card">
      <h3><i class="fas fa-globe"></i> 全服事件</h3>
      <div id="world-events-list" class="world-events-list"></div>
    </div>

    {/* 修仙日志 */}
    <div class="card logs-card">
      <h3><i class="fas fa-feather"></i> 修仙日志</h3>
      <div class="log-form">
        <textarea id="log-content" placeholder="记录今日修炼感悟..." maxLength={500}></textarea>
        <div class="log-form-actions">
          <select id="log-mood">
            <option value="平静">平静</option>
            <option value="愉悦">愉悦</option>
            <option value="疲惫">疲惫</option>
            <option value="感悟">感悟</option>
            <option value="突破">突破</option>
          </select>
          <select id="log-type">
            <option value="note">修炼笔记</option>
            <option value="milestone">里程碑</option>
            <option value="reflection">感悟</option>
          </select>
          <button id="add-log-btn" class="oracle-btn"><i class="fas fa-pen"></i> 记录</button>
        </div>
      </div>
      <div id="cultivation-logs-list" class="cultivation-logs-list"></div>
    </div>
  </section>
)
