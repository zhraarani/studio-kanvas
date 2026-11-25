const listElement = document.getElementById('service-list');
const statusElement = document.getElementById('status');

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

function createServiceCard(service) {
  const card = document.createElement('article');
  card.className = 'card';

  const title = document.createElement('h3');
  title.textContent = service.name;

  const description = document.createElement('p');
  description.textContent = service.description;

  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = `Mulai ${formatRupiah(service.price_start)}`;

  card.append(title, description, price);
  return card;
}

async function loadServices() {
  try {
    const response = await fetch('/api/services');
    if (!response.ok) throw new Error();

    const services = await response.json();
    listElement.replaceChildren(...services.map(createServiceCard));
    if (services.length === 0) statusElement.textContent = 'Belum ada layanan.';
  } catch {
    statusElement.textContent = 'Gagal memuat layanan.';
    statusElement.classList.add('error');
  }
}

loadServices();
