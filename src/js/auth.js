/**
 * Authentication Module
 * Manages login validation with specified credentials:
 * ID: "admin"
 * Password: "123jesus"
 */

const AUTH_STORAGE_KEY = 'quotecard_auth_session';

export class AuthManager {
  constructor(onAuthSuccess) {
    this.onAuthSuccess = onAuthSuccess;
    this.loginModal = document.getElementById('loginModal');
    this.loginForm = document.getElementById('loginForm');
    this.loginIdInput = document.getElementById('loginId');
    this.loginPasswordInput = document.getElementById('loginPassword');
    this.loginError = document.getElementById('loginError');
    this.appContainer = document.getElementById('app');
    this.logoutBtn = document.getElementById('logoutBtn');

    this.init();
  }

  init() {
    // Check if already authenticated in this session
    if (this.isAuthenticated()) {
      this.showApp();
    } else {
      this.showLogin();
    }

    // Attach submit listener
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Attach logout listener
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }
  }

  isAuthenticated() {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  }

  handleLogin(e) {
    e.preventDefault();
    const id = this.loginIdInput.value.trim();
    const password = this.loginPasswordInput.value.trim();

    // Verify credentials: admin / 123jesus
    if (id === 'admin' && password === '123jesus') {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      this.loginError.classList.add('hidden');
      this.showApp();
    } else {
      this.loginError.classList.remove('hidden');
      this.loginPasswordInput.value = '';
      this.loginPasswordInput.focus();
    }
  }

  handleLogout() {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    this.showLogin();
  }

  showApp() {
    if (this.loginModal) this.loginModal.classList.add('hidden');
    if (this.appContainer) this.appContainer.classList.remove('hidden');
    if (typeof this.onAuthSuccess === 'function') {
      this.onAuthSuccess();
    }
  }

  showLogin() {
    if (this.appContainer) this.appContainer.classList.add('hidden');
    if (this.loginModal) this.loginModal.classList.remove('hidden');
    if (this.loginIdInput) this.loginIdInput.focus();
  }
}
