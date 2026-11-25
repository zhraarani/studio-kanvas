const form = document.getElementById('contact-form');
const statusElement = document.getElementById('status');

function showStatus(text, type) {
  statusElement.textContent = text;
  statusElement.className = `status ${type}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form));

  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) return showStatus(result.error, 'error');

    form.reset();
    showStatus(result.message, 'success');
  } catch {
    showStatus('Terjadi kesalahan jaringan.', 'error');
  }
});
