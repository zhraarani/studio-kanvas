const API_URL = '/api/services';

const form = document.getElementById('service-form');
const formTitle = document.getElementById('form-title');
const cancelButton = document.getElementById('cancel-btn');
const tableBody = document.getElementById('service-table');
const messageBody = document.getElementById('message-table');
const statusElement = document.getElementById('status');

let services = [];

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

function showStatus(text, type = 'success') {
  statusElement.textContent = text;
  statusElement.className = `status ${type}`;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan.');
  return data;
}

function createCell(text) {
  const cell = document.createElement('td');
  cell.textContent = text;
  return cell;
}

function createButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `btn ${className}`;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function createServiceRow(service) {
  const row = document.createElement('tr');

  const actionCell = document.createElement('td');
  actionCell.className = 'actions';
  actionCell.append(
    createButton('Ubah', 'btn-secondary', () => startEdit(service)),
    createButton('Hapus', 'btn-danger', () => removeService(service))
  );

  row.append(createCell(service.name), createCell(formatRupiah(service.price_start)), actionCell);
  return row;
}

function createMessageRow(message) {
  const row = document.createElement('tr');
  row.append(
    createCell(message.name),
    createCell(message.email),
    createCell(message.message),
    createCell(message.created_at)
  );
  return row;
}

async function loadServices() {
  services = await request(API_URL);
  tableBody.replaceChildren(...services.map(createServiceRow));
}

async function loadMessages() {
  const messages = await request('/api/messages');
  messageBody.replaceChildren(...messages.map(createMessageRow));
}

function resetForm() {
  form.reset();
  form.elements.id.value = '';
  formTitle.textContent = 'Tambah Layanan';
  cancelButton.hidden = true;
}

function startEdit(service) {
  form.elements.id.value = service.id;
  form.elements.name.value = service.name;
  form.elements.description.value = service.description;
  form.elements.price_start.value = service.price_start;
  formTitle.textContent = 'Ubah Layanan';
  cancelButton.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function removeService(service) {
  if (!confirm(`Hapus layanan "${service.name}"?`)) return;

  try {
    await request(`${API_URL}/${service.id}`, { method: 'DELETE' });
    showStatus('Layanan dihapus.');
    await loadServices();
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const { id, ...payload } = Object.fromEntries(new FormData(form));
  const isEdit = Boolean(id);

  try {
    await request(isEdit ? `${API_URL}/${id}` : API_URL, {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    showStatus(isEdit ? 'Layanan diperbarui.' : 'Layanan ditambahkan.');
    resetForm();
    await loadServices();
  } catch (error) {
    showStatus(error.message, 'error');
  }
});

cancelButton.addEventListener('click', resetForm);

document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

Promise.all([loadServices(), loadMessages()]).catch((error) => showStatus(error.message, 'error'));
