/* ====== auth.js ======
   Handles:
   - Signup (save user)
   - Login (session or persistent remember-me)
   - Forgot / Reset password (simulated)
   - Dashboard access and logout
   Notes: All data is stored in localStorage/sessionStorage for demo purposes only.
*/

(function () {
    // --- Helper functions ---
    const qs = (sel) => document.querySelector(sel);
    const randToken = (len = 24) =>
      [...crypto.getRandomValues(new Uint8Array(len))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
  
    // --- Storage Keys ---
    const USERS_KEY = "itt_users";
    const LOGGED_LOCAL = "itt_logged";
    const LOGGED_SESSION = "itt_logged_session";
    const RESET_KEY_PREFIX = "itt_reset_";
  
    // --- User Utilities ---
    function loadUsers() {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    }
    function saveUsers(users) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  
    // Simple obfuscation — demo only
    function pseudoHash(pw) {
      return btoa(pw.split("").reverse().join("") + "::itt");
    }
  
    // ---------------------- SIGNUP ----------------------
    const signupForm = qs("#signupForm");
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
  
        const name = qs("#signupName").value.trim();
        const email = qs("#signupEmail").value.trim().toLowerCase();
        const pw = qs("#signupPassword").value;
        const confirm = qs("#confirmPassword").value;
  
        if (!name || !email || !pw || !confirm) {
          alert("Please fill all fields.");
          return;
        }
        if (pw !== confirm) {
          alert("Passwords do not match.");
          return;
        }
  
        const users = loadUsers();
        if (users[email]) {
          alert("This email already exists. Please log in instead.");
          return;
        }
  
        users[email] = { name, email, passwordHash: pseudoHash(pw) };
        saveUsers(users);
  
        alert("Signup successful! Redirecting to login...");
        window.location.href = "/index.html";
      });
    }
  
    // ---------------------- LOGIN ----------------------
    const loginForm = qs("#loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
  
        const email = qs("#loginEmail").value.trim().toLowerCase();
        const pw = qs("#loginPassword").value;
        const remember = qs("#rememberMe")?.checked;
  
        const users = loadUsers();
        const user = users[email];
  
        if (!user || user.passwordHash !== pseudoHash(pw)) {
          const errEl = qs("#loginError");
          if (errEl) errEl.textContent = "Invalid email or password.";
          else alert("Invalid email or password.");
          return;
        }
  
        const payload = { name: user.name, email: user.email };
  
        if (remember) {
          localStorage.setItem(LOGGED_LOCAL, JSON.stringify(payload));
          sessionStorage.removeItem(LOGGED_SESSION);
        } else {
          sessionStorage.setItem(LOGGED_SESSION, JSON.stringify(payload));
          localStorage.removeItem(LOGGED_LOCAL);
        }
  
        alert(`Welcome, ${user.name}!`);
        window.location.href = "pages/dashboard.html";
      });
    }
  
    // ---------------------- AUTO-REDIRECT WHEN LOGGED ----------------------
    (function autoRedirectIfLogged() {
      const onAuthPage = !!(
        qs("#loginForm") ||
        qs("#signupForm") ||
        qs("#forgotPasswordForm") ||
        qs("#resetPasswordForm")
      );
      if (!onAuthPage) return;
  
      const local = JSON.parse(localStorage.getItem(LOGGED_LOCAL) || "null");
      const session = JSON.parse(sessionStorage.getItem(LOGGED_SESSION) || "null");
  
      if (local || session) {
        const path = window.location.pathname.split("/").pop();
        if (path === "index.html" || path === "login.html" || path === "") {
          window.location.href = "pages/dashboard.html";
        }
      }
    })();
  
    // ---------------------- FORGOT PASSWORD ----------------------
    const forgotForm = qs("#forgotPasswordForm");
    if (forgotForm) {
      forgotForm.addEventListener("submit", (e) => {
        e.preventDefault();
  
        const email = qs("#resetEmail").value.trim().toLowerCase();
        const users = loadUsers();
  
        if (!users[email]) {
          alert("If the email exists, we'll send a reset link (demo mode).");
        }
  
        const token = randToken(16);
        localStorage.setItem(RESET_KEY_PREFIX + token, email);
        localStorage.setItem("itt_last_reset_token", token);
  
        alert("Password reset link created (demo). Redirecting to reset page...");
        window.location.href = "./resetpassword.html";
      });
    }
  
    // ---------------------- RESET PASSWORD ----------------------
    const resetForm = qs("#resetPasswordForm");
    if (resetForm) {
      const demoToken = localStorage.getItem("itt_last_reset_token");
  
      resetForm.addEventListener("submit", (e) => {
        e.preventDefault();
  
        const newPw = qs("#newPassword").value;
        const confirmPw = qs("#confirmNewPassword").value;
  
        if (newPw.length < 6) {
          alert("Password must be at least 6 characters.");
          return;
        }
        if (newPw !== confirmPw) {
          alert("Passwords do not match.");
          return;
        }
  
        const token = demoToken;
        if (!token) {
          alert("Reset token not found. Use Forgot Password first.");
          return;
        }
  
        const email = localStorage.getItem(RESET_KEY_PREFIX + token);
        if (!email) {
          alert("Invalid or expired token.");
          return;
        }
  
        const users = loadUsers();
        if (!users[email]) {
          alert("User not found.");
          return;
        }
  
        users[email].passwordHash = pseudoHash(newPw);
        saveUsers(users);
  
        localStorage.removeItem(RESET_KEY_PREFIX + token);
        localStorage.removeItem("itt_last_reset_token");
  
        alert("Password reset successful. Please log in.");
        window.location.href = "/index.html";
      });
    }
  
    // ---------------------- EXPOSED AUTH UTILITIES ----------------------
    window.ittAuth = {
      currentUser() {
        const local = JSON.parse(localStorage.getItem(LOGGED_LOCAL) || "null");
        const session = JSON.parse(sessionStorage.getItem(LOGGED_SESSION) || "null");
        return local || session || null;
      },
      logout() {
        localStorage.removeItem(LOGGED_LOCAL);
        sessionStorage.removeItem(LOGGED_SESSION);
        window.location.href = "/index.html";
      },
    };
  })();
  