let toastContainer;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

const recent = new Set();

function showToast(msg, type = 'info') {
  const key = `${type}:${msg}`;
  if (recent.has(key)) return;
  recent.add(key);
  setTimeout(() => recent.delete(key), 3000);

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;

  getToastContainer().appendChild(el);

  setTimeout(() => {
    el.classList.add('toast-exit');
    setTimeout(() => el.remove(), 200);
  }, 3500);
}
