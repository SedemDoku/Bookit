'use client';

export default function SignupPage() {
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
          <span className="auth-title">Create account</span>
        </div>
        <p className="auth-subtitle">Sign up to start saving and syncing bookmarks.</p>
        <div id="alert"></div>
        <form id="signup-form">
          <div className="form-field">
            <label className="form-label" htmlFor="signup-username">Username</label>
            <input className="form-input" type="text" id="signup-username" name="username" required placeholder="yourname" />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="signup-email">Email</label>
            <input className="form-input" type="email" id="signup-email" name="email" required placeholder="you@example.com" />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <div className="password-wrapper">
              <input className="form-input password-input" type="password" id="signup-password" name="password" required placeholder="At least 8 chars incl. special" />
              <button type="button" className="toggle-btn" data-target="signup-password">Show</button>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
            <div className="password-wrapper">
              <input className="form-input password-input" type="password" id="signup-confirm" name="confirm" required placeholder="Re-enter password" />
              <button type="button" className="toggle-btn" data-target="signup-confirm">Show</button>
            </div>
          </div>
          <div className="form-actions">
            <a className="link-btn" href="/login">Have an account?</a>
            <button className="primary-btn" type="submit">Sign up</button>
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
