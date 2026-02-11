// Cookie Management Utility
// Handles cookie consent and session management

const CookieManager = {
  // Cookie names
  CONSENT_COOKIE: 'cookieConsent',
  
  // Set a cookie
  set(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Strict`;
  },
  
  // Get a cookie
  get(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  },
  
  // Delete a cookie
  delete(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
  },
  
  // Check if user has accepted cookies
  hasConsentedToCookies() {
    const consent = this.get(this.CONSENT_COOKIE);
    return consent === 'accepted';
  },
  
  // Set cookie consent
  acceptCookies() {
    this.set(this.CONSENT_COOKIE, 'accepted', 365); // 1 year
    const dialog = document.getElementById('cookie-consent-dialog');
    if (dialog) {
      dialog.style.display = 'none';
    }
  },
  
  // Decline cookies (still set a cookie to remember the choice)
  declineCookies() {
    this.set(this.CONSENT_COOKIE, 'declined', 365); // 1 year
    const dialog = document.getElementById('cookie-consent-dialog');
    if (dialog) {
      dialog.style.display = 'none';
    }
  },
  
  // Show cookie consent dialog if not already decided
  showConsentDialogIfNeeded() {
    if (!this.hasConsentedToCookies() && this.get(this.CONSENT_COOKIE) !== 'declined') {
      const dialog = document.getElementById('cookie-consent-dialog');
      if (dialog) {
        dialog.style.display = 'flex';
      }
    }
  }
};

// Session Manager
// Manages user sessions using cookies and localStorage
const SessionManager = {
  // Session storage keys
  SESSION_USER_ID: 'session_user_id',
  SESSION_USER_EMAIL: 'session_user_email',
  SESSION_USER_NAME: 'session_user_name',
  SESSION_TOKEN: 'session_token',
  SESSION_EXPIRY: 'session_expiry',
  
  // Initialize session from stored data
  init() {
    // Check if session has expired
    const expiry = localStorage.getItem(this.SESSION_EXPIRY);
    if (expiry && new Date().getTime() > parseInt(expiry)) {
      this.clearSession();
      return false;
    }
    return this.isLoggedIn();
  },
  
  // Create a new session
  createSession(userData, rememberMe = false) {
    const { userId, email, name, token } = userData;
    
    // Store in localStorage for persistence
    localStorage.setItem(this.SESSION_USER_ID, userId);
    localStorage.setItem(this.SESSION_USER_EMAIL, email);
    if (name) localStorage.setItem(this.SESSION_USER_NAME, name);
    if (token) localStorage.setItem(this.SESSION_TOKEN, token);
    
    // Set session expiry (7 days if remember me, 1 day otherwise)
    const expiryDays = rememberMe ? 7 : 1;
    const expiryTime = new Date().getTime() + (expiryDays * 24 * 60 * 60 * 1000);
    localStorage.setItem(this.SESSION_EXPIRY, expiryTime.toString());
    
    // Also set cookies if consent was given
    if (CookieManager.hasConsentedToCookies()) {
      CookieManager.set(this.SESSION_USER_ID, userId, expiryDays);
      CookieManager.set(this.SESSION_USER_EMAIL, email, expiryDays);
      if (token) CookieManager.set(this.SESSION_TOKEN, token, expiryDays);
    }
    
    return true;
  },
  
  // Get current session data
  getSession() {
    if (!this.isLoggedIn()) {
      return null;
    }
    
    return {
      userId: localStorage.getItem(this.SESSION_USER_ID),
      email: localStorage.getItem(this.SESSION_USER_EMAIL),
      name: localStorage.getItem(this.SESSION_USER_NAME),
      token: localStorage.getItem(this.SESSION_TOKEN)
    };
  },
  
  // Get user ID from session
  getUserId() {
    return localStorage.getItem(this.SESSION_USER_ID);
  },
  
  // Get user email from session
  getUserEmail() {
    return localStorage.getItem(this.SESSION_USER_EMAIL);
  },
  
  // Get user name from session
  getUserName() {
    return localStorage.getItem(this.SESSION_USER_NAME);
  },
  
  // Get session token
  getToken() {
    return localStorage.getItem(this.SESSION_TOKEN);
  },
  
  // Check if user is logged in
  isLoggedIn() {
    const userId = localStorage.getItem(this.SESSION_USER_ID);
    const email = localStorage.getItem(this.SESSION_USER_EMAIL);
    return userId !== null && email !== null;
  },
  
  // Update session data
  updateSession(userData) {
    if (!this.isLoggedIn()) {
      return false;
    }
    
    const { name, email } = userData;
    if (name) localStorage.setItem(this.SESSION_USER_NAME, name);
    if (email) localStorage.setItem(this.SESSION_USER_EMAIL, email);
    
    // Update cookies if consent was given
    if (CookieManager.hasConsentedToCookies()) {
      const expiry = localStorage.getItem(this.SESSION_EXPIRY);
      const remainingDays = expiry ? Math.ceil((parseInt(expiry) - new Date().getTime()) / (24 * 60 * 60 * 1000)) : 1;
      if (email) CookieManager.set(this.SESSION_USER_EMAIL, email, remainingDays);
    }
    
    return true;
  },
  
  // Extend session expiry
  extendSession(days = 7) {
    if (!this.isLoggedIn()) {
      return false;
    }
    
    const expiryTime = new Date().getTime() + (days * 24 * 60 * 60 * 1000);
    localStorage.setItem(this.SESSION_EXPIRY, expiryTime.toString());
    
    // Update cookies if consent was given
    if (CookieManager.hasConsentedToCookies()) {
      const userId = this.getUserId();
      const email = this.getUserEmail();
      const token = this.getToken();
      
      if (userId) CookieManager.set(this.SESSION_USER_ID, userId, days);
      if (email) CookieManager.set(this.SESSION_USER_EMAIL, email, days);
      if (token) CookieManager.set(this.SESSION_TOKEN, token, days);
    }
    
    return true;
  },
  
  // Clear session (logout)
  clearSession() {
    // Clear localStorage
    localStorage.removeItem(this.SESSION_USER_ID);
    localStorage.removeItem(this.SESSION_USER_EMAIL);
    localStorage.removeItem(this.SESSION_USER_NAME);
    localStorage.removeItem(this.SESSION_TOKEN);
    localStorage.removeItem(this.SESSION_EXPIRY);
    
    // Clear cookies
    CookieManager.delete(this.SESSION_USER_ID);
    CookieManager.delete(this.SESSION_USER_EMAIL);
    CookieManager.delete(this.SESSION_TOKEN);
    
    return true;
  },
  
  // Get authentication headers for API requests
  getAuthHeaders() {
    if (!this.isLoggedIn()) {
      return {};
    }
    
    return {
      'X-User-ID': this.getUserId(),
      'X-User-Email': this.getUserEmail()
    };
  },
  
  // Check session validity and redirect if expired
  requireAuth(redirectUrl = 'login.html') {
    if (!this.init()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }
};
