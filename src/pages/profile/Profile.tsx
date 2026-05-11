// 道号 Profile 页面
export const Profile = () => (
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
)
