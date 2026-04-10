// dp.js
(function () {

  function $(id) {
    return document.getElementById(id);
  }

  function showDP() {
    const dp = $('dp');
    if (dp) dp.style.display = 'block';
  }

  function hideDP() {
    const dp = $('dp');
    if (dp) dp.style.display = 'none';
  }

  function setDPField(id, value) {
    const el = $(id);
    if (el) el.textContent = value ?? '—';
  }

  function setPeriod(d) {
    if (!d || !('per' in d)) {
      setDPField('dper', '—');
      return;
    }

    const val = d.per > 365
      ? (d.per / 365.25).toFixed(3) + ' yr'
      : d.per.toFixed(2) + ' d';

    setDPField('dper', val);
  }

  function initDP() {
    const closeBtn = $('cs');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideDP);
    }
  }

  // Expose controlled API
 function setField(id, value, formatter) {
  const el = document.getElementById(id);
  if (!el) return;

  if (value == null) {
    el.textContent = '—';
    return;
  }

  el.textContent = formatter ? formatter(value) : value;
}

function formatPeriod(v) {
  return v > 365
    ? (v / 365.25).toFixed(3) + ' yr'
    : v.toFixed(2) + ' d';
}

// MASTER DATA BINDER
function setData(data) {
  if (!data) return;

  // Period OR Year (whichever exists)
  if (data.period != null) {
	  setField('dper', data.period, formatPeriod);
  } else if (data.year != null) {
	  setField('dper', data.year, v => v.toFixed(2) + ' yr');
  } else {
	  setField('dper', null);
  }
  setField('ddist', data.distance, v => v.toFixed(2) + ' ly');
  setField('dmass', data.mass, v => v.toFixed(2));
  setField('drad', data.radius, v => v.toFixed(2));
}

window.DP = {
  show: showDP,
  hide: hideDP,
  setPeriod, // keep for now (backward compatibility)
  setData
};

  document.addEventListener('DOMContentLoaded', initDP);

})();