// Запуск всіх ініціалізаційніх функцій після завантаження DOM
document.addEventListener("DOMContentLoaded", () => {
  initBurgerMenu();              
  initIntersectionAnimations();  
  initCatalogCards();            
  initCarPage();               
  initCatalogRedirect();        
  initIndexSearch();           
  initTotalCarCount();          
});

// Меню-бургер
function initBurgerMenu() {
  const burger = document.getElementById("burger");
  const navWrapper = document.getElementById("nav-wrapper");
  if (!burger || !navWrapper) return;

  // Клік по бургеру — відкриває/закриває меню
  burger.addEventListener("click", () => navWrapper.classList.toggle("active"));

  // Клік по пункту меню — закриває меню
  document.querySelectorAll(".header__navigation-item a")
    .forEach(link => link.addEventListener("click", () => navWrapper.classList.remove("active")));
}
// Анімації елементів при появі в полі зору
function initIntersectionAnimations() {
  const observe = (selector, visibleClass = "visible", threshold = 0.3, withDelay = false) => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          if (withDelay) entry.target.style.animationDelay = `${idx * 0.3}s`;
          entry.target.classList.add(visibleClass);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold });

    elements.forEach(el => observer.observe(el));
  };

  // Ініціалізуємо анімації для різних секцій
  observe(".advantages__item");
  observe(".caring__item", "visible", 0.5, true);
  observe(".tarifs__tarif-card");
}

// Пошук на головній сторінці
function initIndexSearch() {
  const searchForm = document.querySelector('.header__form-search');
  if (!searchForm) return;

  const searchInput = searchForm.querySelector('input[type="text"]');
  const autocompleteList = searchForm.querySelector('.autocomplete-list');
  if (!searchInput || !autocompleteList) return;

  const basePath = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';
  let allCars = [];

  // Завантаження всіх авто
  fetch('js/cars.json')
    .then(res => res.json())
    .then(data => {
      allCars = data.carts;
    })
    .catch(err => console.error("Помилка завантаження JSON:", err));

  // Підказка під час введення
  function showAutocomplete(query) {
    autocompleteList.innerHTML = '';
    if (!query) return;

    const matches = allCars
      .filter(car => car.title.toLowerCase().includes(query))
      .slice(0, 5);

    matches.forEach(car => {
      const item = document.createElement('li');
      item.textContent = car.title;
      item.addEventListener('click', () => {
        searchInput.value = car.title;
        autocompleteList.innerHTML = '';
        const url = new URL(basePath + 'catalog.html');
        url.searchParams.set('search', car.title.toLowerCase());
        window.location.href = url.toString();
      });
      autocompleteList.appendChild(item);
    });
  }

  searchInput.addEventListener('input', () => {
    showAutocomplete(searchInput.value.trim().toLowerCase());
  });

  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;
    const basePath = window.location.pathname.replace(/\/[^\/]*$/, '/');
    const url = new URL(basePath + 'catalog.html');
    url.searchParams.set('search', query);
    window.location.href = url.toString();
  });

  // Закриття списку підказок при кліку поза формою
  document.addEventListener('click', e => {
    if (!searchForm.contains(e.target)) {
      autocompleteList.innerHTML = '';
    }
  });
}

// Генерація карток авто в каталозі
function initCatalogCards() {
  const container = document.getElementById('portfolio__card');
  const pagination = document.getElementById('pagination');
  const basePath = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';

  const searchForm = document.querySelector('.header__form-search');
  const searchInput = searchForm?.querySelector('input[type="text"]');
  const autocompleteList = searchForm?.querySelector('.autocomplete-list');
  const classFilter = document.getElementById("classFilter");
  if (!container || !pagination || !searchForm || !searchInput || !autocompleteList) return;

  const CARDS_PER_PAGE = 8;
  let allCars = [], filteredCars = [], currentPage = 1, currentQuery = '';
  let selectedClass = 'Усі';

  // Читання параметрів з URL
  const urlParams = new URLSearchParams(window.location.search);
  currentPage = Math.max(1, parseInt(urlParams.get('page')) || 1);
  currentQuery = urlParams.get('search')?.toLowerCase().trim() || '';
  if (currentQuery) searchInput.value = currentQuery;
  selectedClass = urlParams.get('class') || 'Усі';
  if (classFilter) classFilter.value = selectedClass;

  fetch('js/cars.json')
    .then(res => res.json())
    .then(data => {
      allCars = data.carts;
      applySearch(currentQuery);
      renderPage(currentPage);
      renderPagination(currentPage);
    })
    .catch(err => console.error("Помилка завантаження JSON:", err));

  // Підказки при вводі
  function showAutocomplete(query) {
    autocompleteList.innerHTML = '';
    if (!query) return;

    allCars
      .filter(car => car.title.toLowerCase().includes(query))
      .slice(0, 5)
      .forEach(car => {
        const item = document.createElement('li');
        item.textContent = car.title;
        item.addEventListener('click', () => {
          searchInput.value = car.title;
          autocompleteList.innerHTML = '';
          searchForm.dispatchEvent(new Event('submit'));
        });
        autocompleteList.appendChild(item);
      });
  }

  searchInput.addEventListener('input', () => showAutocomplete(searchInput.value.trim().toLowerCase()));

  document.addEventListener('click', e => {
    if (!searchForm.contains(e.target)) autocompleteList.innerHTML = '';
  });

  // Пошук та фільтр класу
  function applySearch(query) {
    let result = allCars;

    if (query) {
      result = result.filter(car => car.title.toLowerCase().includes(query));
    }

    if (selectedClass !== 'Усі') {
      result = result.filter(car =>
        car.car_class && car.car_class.toLowerCase() === selectedClass.toLowerCase()
      );
    }

    filteredCars = result;
  }

  // Рендер карток
  function renderPage(page) {
    container.innerHTML = '';
    const start = (page - 1) * CARDS_PER_PAGE;
    const pageCars = filteredCars.slice(start, start + CARDS_PER_PAGE);

    if (!pageCars.length) {
      container.innerHTML = '<p>Авто не знайдено.</p>';
      pagination.innerHTML = '';
      return;
    }

    pageCars.forEach(car => {
      const card = document.createElement('div');
      card.className = 'portfolio__card';
      card.innerHTML = `
        <img class="card__bg" src="${car.image}" alt="${car.title}">
        <div class="card__title">
          <p class="car__advantages">${car.subtitle}</p>
          <p class="car__model">${car.title}</p>
          <p class="car__description">${car.description}</p>
        </div>
        <div class="card__select">
          <p class="car__price">${car.price}</p>
          <button class="card__btn">
            <a href="car.html?model=${encodeURIComponent(car.slug)}">Обрати</a>
          </button>
        </div>`;
      container.appendChild(card);
    });
  }

  // Пагінація
  function renderPagination(activePage) {
    const pageCount = Math.ceil(filteredCars.length / CARDS_PER_PAGE);
    pagination.innerHTML = '';

    for (let i = 1; i <= pageCount; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = 'pagination-btn' + (i === activePage ? ' active' : '');
      btn.addEventListener('click', () => {
        currentPage = i;
        renderPage(currentPage);
        renderPagination(currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateURL();
      });
      pagination.appendChild(btn);
    }
  }

  // Оновлення URL
  function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('page', currentPage);
    if (currentQuery) url.searchParams.set('search', currentQuery);
    else url.searchParams.delete('search');
    if (selectedClass && selectedClass !== 'Усі') url.searchParams.set('class', selectedClass);
    else url.searchParams.delete('class');
    window.history.pushState({}, '', url);
  }

  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    currentQuery = searchInput.value.trim().toLowerCase();
    currentPage = 1;

    applySearch(currentQuery);
    renderPage(currentPage);
    renderPagination(currentPage);
    updateURL();
  });

  if (classFilter) {
    classFilter.addEventListener("change", () => {
      selectedClass = classFilter.value;
      currentPage = 1;

      applySearch(currentQuery);
      renderPage(currentPage);
      renderPagination(currentPage);
      updateURL();
    });
  }

  window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentPage = Math.max(1, parseInt(urlParams.get('page')) || 1);
    currentQuery = urlParams.get('search')?.toLowerCase().trim() || '';
    selectedClass = urlParams.get('class') || 'Усі';

    if (searchInput) searchInput.value = currentQuery;
    if (classFilter) classFilter.value = selectedClass;

    applySearch(currentQuery);
    renderPage(currentPage);
    renderPagination(currentPage);
  });
}

// Загальна кількості авто
function initTotalCarCount() {
  const counterElement = document.querySelector('.carts__title');
  if (!counterElement) return;

  fetch('js/cars.json')
    .then(res => res.json())
    .then(data => {
      const allCars = data.carts || [];
      const availableCars = allCars.filter(car => car.available !== false);
      counterElement.textContent = `Всього авто: ${availableCars.length}`;
    })
    .catch(err => {
      console.error("Помилка завантаження JSON для підрахунку авто:", err);
      counterElement.textContent = "Всього авто: —";
    });
}

// Сторінка обраного авто
function initCarPage() {
  const carTitle = document.getElementById("car-title");
  if (!carTitle) return;

  const model = new URLSearchParams(window.location.search).get("model");
  if (!model) return;

  fetch("js/cars.json")
    .then(res => res.json())
    .then(data => {
      const allCars = data.data || [];
      const carData = allCars.find(car =>
        car.title.toLowerCase().replace(/\s+/g, '-') === model.toLowerCase()
      );

      if (!carData) {
        document.body.innerHTML = "<h2>Автомобіль не знайдено</h2>";
        return;
      }

      document.title = `${carData.title} – DriveShare`;
      carTitle.textContent = carData.title;

      const subtitleEl = document.getElementById("car-subtitle");
      if (subtitleEl) subtitleEl.textContent = carData.subtitle || "";

      const img = document.getElementById("car-image");
      if (img) {
        img.src = carData.image || "";
        img.alt = carData.title || "";
      }

      const priceEl = document.getElementById("car-price");

      function renderList(id, data) {
        const container = document.getElementById(id);
        if (!container || !data) return;

        container.innerHTML = Object.entries(data)
          .map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`)
          .join('');
      }

      if (carData.car_features) renderList("car-features", carData.car_features);
      if (carData.rental_cost) renderList("rental_cost", carData.rental_cost);

      renderRecommendedCars(data.carts || [], model.toLowerCase());
    })
    .catch(err => {
      console.error("Помилка завантаження car data:", err);
      document.body.innerHTML = "<h2>Сталася помилка при завантаженні даних</h2>";
    });

  function renderRecommendedCars(allCars, currentSlug) {
    const container = document.getElementById('portfolio__card');
    if (!container) return;

    const recommended = allCars
      .filter(car => car.slug !== currentSlug)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    container.innerHTML = '';

    recommended.forEach(car => {
      const card = document.createElement('div');
      card.className = 'portfolio__card';
      card.innerHTML = `
        <img class="card__bg" src="${car.image}" alt="${car.title}">
        <div class="card__title">
          <p class="car__advantages">${car.subtitle}</p>
          <p class="car__model">${car.title}</p>
          <p class="car__description">${car.description}</p>
        </div>
        <div class="card__select">
          <p class="currcar__price">${car.price}</p>
          <button class="card__btn">
            <a href="car.html?model=${encodeURIComponent(car.slug)}">Обрати</a>
          </button>
        </div>`;
      container.appendChild(card);
    });
  }
}

// Перехід з кнопки на сторінку каталогу
function initCatalogRedirect() {
  document.querySelector(".catalog__btn")?.addEventListener("click", () => {
    window.location.href = "catalog.html";
  });
}
