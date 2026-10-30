
(function () {
  var search = document.getElementById('f-search');
  var type = document.getElementById('f-type');
  var category = document.getElementById('f-category');
  var empty = document.getElementById('no-results');

  function apply() {
    var q = search.value.trim().toLowerCase();
    var shown = 0;
    document.querySelectorAll('#tx-body tr').forEach(function (row) {
      var ok = row.dataset.desc.toLowerCase().includes(q) &&
               (!type.value || row.dataset.type === type.value) &&
               (!category.value || row.dataset.category === category.value);
      row.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown > 0;
  }
  [search, type, category].forEach(function (el) { el.addEventListener('input', apply); });
  document.querySelectorAll('[data-clear-filters]').forEach(function (btn) {
    btn.addEventListener('click', function () { search.value = ''; type.value = ''; category.value = ''; apply(); });
  });
})();
