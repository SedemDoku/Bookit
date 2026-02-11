'use client';

export default function LoginPage() {
  return (
    <>
      <nav>
        <a href="/" className="logo">
          <img src="/logo.png" alt="BookIt Logo" style={{ height: '32px', width: 'auto' }} />
          <span>BookIt</span>
        </a>
      </nav>

      <div className="auth-card">
        <div className="brand">
          <img src="/logo.png" alt="BookIt Logo" className="brand-icon" style={{ height: '22px', width: 'auto' }} />
          <span className="auth-title">Welcome back</span>
        </div>
        <p className="auth-subtitle">Log in to access your bookmarks.</p>
        <div id="alert"></div>
        <form id="login-form">
          <div className="form-field">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input className="form-input" type="email" id="login-email" name="email" required placeholder="you@example.com" />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="password-wrapper">
              <input className="form-input password-input" type="password" id="login-password" name="password" required placeholder="At least 8 chars incl. special" />
              <button type="button" className="toggle-btn" data-target="login-password">Show</button>
            </div>
          </div>
          <div className="form-actions">
            <a className="link-btn" href="/signup">Create account</a>
            <button className="primary-btn" type="submit">Log in</button>
          </div>
        </form>
      </div>

      <div id="cookie-consent-dialog" className="cookie-consent-dialog">
        <div className="cookie-content">
          <h3>Cookie Notice</h3>
          <p>We use cookies to manage your session and keep you logged in. Cookies are essential for the app to function properly.</p>
          <div className="cookie-actions">
            <button id="cookie-decline-btn" className="cookie-btn cookie-btn-secondary">Decline</button>
            <button id="cookie-accept-btn" className="cookie-btn cookie-btn-primary">Accept</button>
          </div>
        </div>
      </div>

      <script src="/js/cookies.js"></script>
      <script src="/js/auth.js"></script>
    </>
  );
}
