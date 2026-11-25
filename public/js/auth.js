const form = document.getElementById('auth-form');
const statusElement = document.getElementById('status');

const redirectByRole = (user) => {
  window.location.href = user.role === 'admin' ? '/admin' : '/';
};

function showError(text) {
  statusElement.textContent = text;
  statusElement.className = 'status error';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form));

  try {
    const response = await fetch(form.dataset.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) return showError(result.error);

    redirectByRole(result);
  } catch {
    showError('Terjadi kesalahan jaringan.');
  }
});
