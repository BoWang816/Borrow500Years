// 注册测算弹窗组件 - 天命测算
export const OnboardingModal = () => (
  <section id="onboarding" class="modal hidden">
    <div class="modal-card oracle">
      <div class="oracle-glow"></div>
      <h2 class="oracle-title"><span class="cn">天命测算</span><span class="en">Oracle Of Fate</span></h2>
      <p class="oracle-sub">阁下，欲知天数几何，请先报上根骨</p>
      <form id="onboard-form" class="oracle-form">
        <label>道号 <input name="name" maxLength={12} placeholder="阁下尊姓大名" required /></label>
        <div class="row">
          <label>性别
            <select name="gender">
              <option value="male">乾·男</option>
              <option value="female">坤·女</option>
            </select>
          </label>
          <label>年龄 <input name="age" type="number" min={1} max={120} value={25} required /></label>
        </div>
        <div class="row">
          <label>身高(cm) <input name="height" type="number" min={50} max={250} value={170} required /></label>
          <label>体重(kg) <input name="weight" type="number" min={20} max={300} value={65} required /></label>
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
)
