
(function () {
  function busy(btn, text) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = text; }
  function idle(btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }

  
  var login = document.getElementById('login-form');
  if (login) {
    login.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('login-error').hidden = true;
      if (!validateForm(login)) return;
      var btn = login.querySelector('[type="submit"]');
      busy(btn, 'Logging in...');
      setTimeout(function () {
        idle(btn);
        // DEMO RULE: password with 6+ characters = success. The real check happens on the backend later.
        if (login.elements.password.value.length >= 6) {
          try { localStorage.setItem('loggedIn', 'true'); } catch (err) {}
          location.href = 'dashboard.html';
        } else {
          document.getElementById('login-error').hidden = false;
        }
      }, 700);
    });
  }

  
  var register = document.getElementById('register-form');
  if (register) {
    var pw = register.elements.password;
    var checks = {
      length: function (v) { return v.length >= 8; },
      upper: function (v) { return /[A-Z]/.test(v); },
      number: function (v) { return /\d/.test(v); }
    };
    pw.addEventListener('input', function () {    // live password checklist
      document.querySelectorAll('#rules li').forEach(function (li) {
        var ok = checks[li.dataset.rule](pw.value);
        li.classList.toggle('ok', ok);
        li.querySelector('i').className = 'fa-solid ' + (ok ? 'fa-circle-check' : 'fa-circle');
      });
    });
    register.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = validateForm(register);
      var allRules = Object.keys(checks).every(function (k) { return checks[k](pw.value); });
      if (ok && !allRules) { setFieldError(pw, 'Password must meet all the requirements below.'); ok = false; }
      if (!ok) return;
      var btn = register.querySelector('[type="submit"]');
      busy(btn, 'Creating account...');
      setTimeout(function () {
        register.hidden = true;
        document.getElementById('register-success').hidden = false;
        setTimeout(function () { location.href = 'login.html'; }, 1500);
      }, 700);
    });
  }

  
  var forgot = document.getElementById('forgot-form');
  if (forgot) {
    forgot.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(forgot)) return;
      forgot.hidden = true;
      document.getElementById('forgot-sent').hidden = false;
    });
  }
})();
