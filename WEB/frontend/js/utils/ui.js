/**
 * UI Utilities - Handle user interface interactions
 */

(function () {
  function setNotification(message, type = 'success') {
    const zone = document.getElementById('notification-zone');
    const content = document.getElementById('notif-content');
    const text = document.getElementById('notif-message');

    if (!zone || !content || !text) {
      return;
    }

    text.textContent = message;
    content.className = type === 'error' ? 'notif-error' : 'notif-success';
    zone.classList.remove('hidden');

    window.clearTimeout(window.__treeNotifTimer);
    window.__treeNotifTimer = window.setTimeout(() => {
      zone.classList.add('hidden');
    }, 3500);
  }

  function setLoading(button, isLoading) {
    if (!button) {
      return;
    }

    button.classList.toggle('chargement', isLoading);

    const spinner = button.querySelector('.spinner');
    const label = button.querySelector('#text-enregistrer') || button.querySelector('[data-role="button-label"]');

    if (spinner) {
      spinner.classList.toggle('hidden', !isLoading);
    }

    if (label) {
      label.textContent = isLoading ? 'Enregistrement...' : 'Enregistrer';
    }

    button.disabled = isLoading;
  }

  function populateSelect(select, items, valueKeys, labelKeys, placeholder) {
    if (!select) {
      return;
    }

    const currentValue = select.value;
    select.innerHTML = '';

    const option = document.createElement('option');
    option.value = '';
    option.disabled = true;
    option.selected = true;
    option.hidden = true;
    option.textContent = placeholder || 'Choisir une valeur';
    select.appendChild(option);

    for (const item of items) {
      const value = window.APP_DATA.getValue(item, valueKeys);
      const label = window.APP_DATA.getValue(item, labelKeys);

      if (value === '' || label === '') {
        continue;
      }

      const opt = document.createElement('option');
      opt.value = String(value);
      opt.textContent = String(label);
      select.appendChild(opt);
    }

    if (currentValue) {
      select.value = currentValue;
    }
  }

  // Expose globally
  window.APP_UI = {
    setNotification,
    setLoading,
    populateSelect,
  };
})();
