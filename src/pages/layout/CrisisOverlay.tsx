// 危机/弥留状态遮罩 + Toast容器
export const CrisisOverlay = () => (
  <>
    {/* 危机/弥留状态遮罩 */}
    <div id="crisis-overlay" class="crisis-overlay hidden">
      <div class="crisis-text">命悬一线 · CRISIS</div>
    </div>
    <div id="dying-modal" class="modal hidden">
      <div class="modal-card dying">
        <h2><i class="fas fa-skull"></i> 弥留之际</h2>
        <p>阁下寿元已尽，现进入 24 小时弥留期</p>
        <p>消耗 <strong>1 枚复活币</strong> 可起死回生。</p>
        <div class="dying-actions">
          <button id="revive-btn" class="oracle-btn"><i class="fas fa-heart"></i> 消耗复活币 · 续命</button>
        </div>
      </div>
    </div>

    {/* Toast */}
    <div id="toast-wrap" class="toast-wrap"></div>
  </>
)
