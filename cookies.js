// Cookie Management Utility
// Handles cookie consent

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
