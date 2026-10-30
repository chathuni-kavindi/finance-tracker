
function showToast(message, type) {
  var box = document.getElementById('toast');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toast';
    box.setAttribute('role', 'status');
    document.body.appendChild(box);
  }
  box.textContent = (type === 'error' ? '⚠ ' : '✔ ') + message;
  box.className = 'toast show ' + (type || 'success');
  clearTimeout(box._timer);
  box._timer = setTimeout(function () { box.classList.remove('show'); }, 3000);
}


function setFieldError(input, message) {
  var field = input.closest('.field');
  if (!field) return;
  field.classList.toggle('invalid', !!message);
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  var p = field.querySelector('.error-text');
  if (p) p.textContent = message ? '⚠ ' + message : '';
}

function validateField(field) {
  var input = field.querySelector('input, select, textarea');
  if (!input) return true;
  var isCheck = input.type === 'checkbox';
  var value = isCheck ? input.checked : input.value.trim();
  var msg = '';
  if (input.required && !value) {
    msg = input.dataset.error || 'This field is required.';
  } else if (value && !isCheck) {
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      msg = 'Enter a valid email address.';
    } else if ('positive' in input.dataset && !(parseFloat(value) > 0)) {
      msg = input.dataset.error || 'Enter a number greater than zero.';
    } else if (input.minLength > 0 && value.length < input.minLength) {
      msg = 'Use at least ' + input.minLength + ' characters.';
    } else if (input.dataset.match && value !== document.querySelector(input.dataset.match).value) {
      msg = 'Passwords do not match.';
    } else if (input.dataset.equals && value !== input.dataset.equals) {
      msg = 'Type ' + input.dataset.equals + ' to confirm.';
    }
  }
  setFieldError(input, msg);
  return !msg;
}

function validateForm(form) {
  var ok = true;
  form.querySelectorAll('.field').forEach(function (f) {
    if (!validateField(f)) ok = false;
  });
  return ok;
}

function resetForm(form) {
  form.reset();
  form.querySelectorAll('.field').forEach(function (f) {
    f.classList.remove('invalid');
    var p = f.querySelector('.error-text');
    if (p) p.textContent = '';
  });
}


document.addEventListener('input', function (e) {
  var f = e.target.closest('.field.invalid');
  if (f) validateField(f);
});


document.addEventListener('submit', function (e) {
  var form = e.target.closest('form[data-demo]');
  if (!form) return;
  e.preventDefault();
  if (!validateForm(form)) return;
  var btn = form.querySelector('[type="submit"]');
  if (btn.disabled) return;                 // stops double submit
  var label = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Saving...';
  setTimeout(function () {                  // later this will be a real fetch() to the backend
    btn.disabled = false;
    btn.textContent = label;
    var dlg = form.closest('dialog');
    if (dlg) { dlg.close(); resetForm(form); }
    showToast(form.dataset.success || 'Saved.');
  }, 700);
});


document.addEventListener('click', function (e) {
  var open = e.target.closest('[data-open]');
  if (open) {
    var dlg = document.getElementById(open.dataset.open);
    var form = dlg.querySelector('form');
    if (form) resetForm(form);
    if (form && open.dataset.fill) {        // pre-fill for "Edit"
      var data = JSON.parse(open.dataset.fill);
      Object.keys(data).forEach(function (k) { if (form.elements[k]) form.elements[k].value = data[k]; });
    }
    if (open.dataset.title) dlg.querySelector('h2').textContent = open.dataset.title;
    dlg.showModal();
  }
  var close = e.target.closest('[data-close]');
  if (close) close.closest('dialog').close();
  if (e.target.tagName === 'DIALOG') e.target.close();   // click on the dark backdrop

  var eye = e.target.closest('[data-toggle-password]');
  if (eye) {
    var input = eye.parentElement.querySelector('input');
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    eye.innerHTML = '<i class="fa-solid ' + (show ? 'fa-eye-slash' : 'fa-eye') + '"></i>';
  }
  var t = e.target.closest('[data-toast]');
  if (t) showToast(t.dataset.toast);
});


document.querySelectorAll('input[name="theme"]').forEach(function (radio) {
  radio.checked = radio.value === window.getTheme();
  radio.addEventListener('change', function () { window.setTheme(radio.value); });
});
