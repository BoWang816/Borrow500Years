// 登录/注册弹窗组件
export const AuthModal = () => (
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
        <label>道号 <input name="username" maxlength={24} placeholder="2~24 个字符" required /></label>
        <label>密令 <input name="password" type="password" minLength={4} maxLength={64} placeholder="至少 4 位" required /></label>
        <button type="submit" class="oracle-btn"><span id="auth-btn-text">入 · 仙 · 籍</span></button>
        <p id="auth-err" class="auth-err"></p>
      </form>
    </div>
  </section>
)
