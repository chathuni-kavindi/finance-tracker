
(function () {
  
  var REQUIRE_LOGIN = true;
  try {
    if (REQUIRE_LOGIN && localStorage.getItem('loggedIn') !== 'true') {
      location.replace('login.html');
      return;
    }
  } catch (e) {}

  var NAV = [
    { id: 'dashboard',    label: 'Home',       icon: 'fa-house',       href: 'dashboard.html' },
    { id: 'transactions', label: 'Expenses',   icon: 'fa-receipt',     href: 'transactions.html' },
    { id: 'budgets',      label: 'Budgets',    icon: 'fa-wallet',      href: 'budgets.html' },
    { id: 'reports',      label: 'Reports',    icon: 'fa-chart-simple', href: 'reports.html' },
    { id: 'categories',   label: 'Categories', icon: 'fa-shapes',      href: 'categories.html' },
    { id: 'settings',     label: 'Settings',   icon: 'fa-gear',        href: 'settings.html' }
  ];
  var CATEGORIES = {
    income:  ['Salary', 'Freelance', 'Business', 'Scholarship', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Education', 'Housing', 'Bills', 'Healthcare', 'Shopping', 'Entertainment', 'Other']
  };
  var page = document.body.dataset.page;
  var title = document.body.dataset.title || '';

 
  var navLinks = NAV.map(function (n) {
    var active = n.id === page;
    return '<a href="' + n.href + '" class="nav-link' + (active ? ' active' : '') + '"' +
      (active ? ' aria-current="page"' : '') + '><i class="fa-solid ' + n.icon + '" aria-hidden="true"></i><span>' + n.label + '</span></a>';
  }).join('');

  var shell =
    '<header class="topbar">' +
      '<a class="brand" href="dashboard.html"><span class="brand-logo"><i class="fa-solid fa-wallet" aria-hidden="true"></i></span>' +
      '<span class="brand-text"><strong>Clarity Finance</strong><small>' + title + '</small></span></a>' +
      '<div class="topbar-actions">' +
        '<button class="btn btn-primary" data-add><i class="fa-solid fa-plus" aria-hidden="true"></i>' +
        '<span class="only-desktop">Add Transaction</span><span class="only-mobile">Add</span></button>' +
        '<div class="menu"><button class="avatar" data-menu aria-label="Account menu" aria-expanded="false">AL</button>' +
        '<div class="menu-list">' +
          '<a href="settings.html"><i class="fa-solid fa-user" aria-hidden="true"></i> Profile</a>' +
          '<a href="settings.html"><i class="fa-solid fa-gear" aria-hidden="true"></i> Settings</a>' +
          '<button data-logout><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Log out</button>' +
        '</div></div>' +
      '</div>' +
    '</header>' +
    '<nav class="nav" aria-label="Main navigation">' + navLinks + '</nav>';

  
  var dialogs =
    '<dialog id="tx-dialog" aria-labelledby="tx-title">' +
      '<form id="tx-form" data-demo data-success="Transaction saved." novalidate>' +
        '<div class="modal-head"><h2 id="tx-title">Add transaction</h2>' +
        '<button type="button" class="icon-btn" data-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>' +
        '<div class="modal-body">' +
          '<div class="field"><span class="label" id="tx-type-label">Transaction type</span>' +
            '<div class="segmented" role="radiogroup" aria-labelledby="tx-type-label">' +
              '<input type="radio" name="type" id="tx-expense" value="expense" checked><label for="tx-expense"><i class="fa-solid fa-arrow-down"></i> Expense</label>' +
              '<input type="radio" name="type" id="tx-income" value="income"><label for="tx-income"><i class="fa-solid fa-arrow-up"></i> Income</label>' +
            '</div></div>' +
          '<div class="field"><label for="tx-desc">Description <span class="req">*</span></label>' +
            '<input type="text" id="tx-desc" name="description" required data-error="Please enter a description."><p class="error-text" role="alert"></p></div>' +
          '<div class="field"><label for="tx-amount">Amount (Rs.) <span class="req">*</span></label>' +
            '<input type="number" id="tx-amount" name="amount" step="0.01" required data-positive data-error="Amount must be greater than zero."><p class="error-text" role="alert"></p></div>' +
          '<div class="field"><label for="tx-category">Category <span class="req">*</span></label>' +
            '<select id="tx-category" name="category" required data-error="Please select a category."></select><p class="error-text" role="alert"></p></div>' +
          '<div class="field"><label for="tx-date">Date <span class="req">*</span></label>' +
            '<input type="date" id="tx-date" name="date" required data-error="Please choose a date."><p class="error-text" role="alert"></p></div>' +
          '<div class="field"><label for="tx-method">Payment method</label>' +
            '<select id="tx-method" name="method"><option>Cash</option><option>Card</option><option>Bank Transfer</option><option>Online</option></select></div>' +
          '<div class="field"><label for="tx-notes">Notes (optional)</label><textarea id="tx-notes" name="notes" rows="2"></textarea></div>' +
        '</div>' +
        '<div class="modal-foot"><button type="button" class="btn btn-outline" data-close>Cancel</button>' +
        '<button type="submit" class="btn btn-primary">Save transaction</button></div>' +
      '</form>' +
    '</dialog>' +
    '<dialog id="delete-dialog" aria-labelledby="delete-title">' +
      '<div class="modal-body"><div class="confirm-icon"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></div>' +
      '<h2 id="delete-title">Delete this item?</h2><p class="muted" id="delete-text">This action cannot be undone.</p></div>' +
      '<div class="modal-foot"><button type="button" class="btn btn-outline" data-close>Cancel</button>' +
      '<button type="button" class="btn btn-danger" id="delete-confirm">Delete</button></div>' +
    '</dialog>';

  document.body.insertAdjacentHTML('afterbegin', shell);
  document.body.insertAdjacentHTML('beforeend', dialogs);

  
  var txDialog = document.getElementById('tx-dialog');
  var txForm = document.getElementById('tx-form');

  function fillCategories(type, selected) {
    var select = txForm.elements.category;
    select.innerHTML = '<option value="">Select a category</option>' +
      CATEGORIES[type].map(function (c) { return '<option>' + c + '</option>'; }).join('');
    select.value = selected || '';
  }
  function openTransaction(d) {              
    resetForm(txForm);
    document.getElementById('tx-title').textContent = d ? 'Edit transaction' : 'Add transaction';
    var type = d ? d.type : 'expense';
    txForm.elements.type.value = type;
    fillCategories(type, d && d.category);
    txForm.elements.description.value = d ? d.desc : '';
    txForm.elements.amount.value = d ? d.amount : '';
    txForm.elements.date.value = d ? d.date : new Date().toISOString().slice(0, 10);
    txForm.elements.method.value = d ? d.method : 'Cash';
    txDialog.showModal();
  }
  txForm.addEventListener('change', function (e) {
    if (e.target.name === 'type') fillCategories(e.target.value);   
  });

  
  var pendingRow = null, pendingKind = '';
  var deleteDialog = document.getElementById('delete-dialog');
  document.getElementById('delete-confirm').addEventListener('click', function () {
    if (pendingRow) pendingRow.remove();
    deleteDialog.close();
    var name = pendingKind.charAt(0).toUpperCase() + pendingKind.slice(1);
    showToast(name + ' deleted.');
    pendingRow = null;
  });

  
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-add]')) openTransaction();

    var edit = e.target.closest('[data-edit]');
    if (edit) openTransaction(edit.closest('[data-desc]').dataset);

    var del = e.target.closest('[data-delete]');
    if (del) {
      pendingRow = del.closest('[data-removable]');
      pendingKind = del.dataset.delete;
      document.getElementById('delete-title').textContent = 'Delete this ' + pendingKind + '?';
      document.getElementById('delete-text').textContent =
        '"' + pendingRow.dataset.name + '" will be removed. This action cannot be undone.';
      deleteDialog.showModal();
    }

    var menuBtn = e.target.closest('[data-menu]');
    var menu = document.querySelector('.menu');
    if (menuBtn) {
      var isOpen = menu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
    } else if (menu) {
      menu.classList.remove('open');
    }

    if (e.target.closest('[data-logout]')) {       
      try { localStorage.removeItem('loggedIn'); } catch (err) {}
      location.href = 'login.html';
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.querySelector('.menu').classList.remove('open');
  });
})();
