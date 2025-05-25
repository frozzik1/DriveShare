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

  burger.addEventListener("click", () => navWrapper.classList.toggle("active"));
  document.querySelectorAll(".header__navigation-item a")
    .forEach(link => link.addEventListener("click", () => navWrapper.classList.remove("active")));
}
// Анімації при скролі
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

  observe(".advantages__item");
  observe(".caring__item", "visible", 0.5, true);
  observe(".tarifs__tarif-card");
}
// Пошук на index.html
function initIndexSearch() {
  const searchForm = document.querySelector('.header__form-search');
  if (!searchForm) return;

  const searchInput = searchForm.querySelector('input[type="text"]');
  const autocompleteList = searchForm.querySelector('.autocomplete-list');
  if (!searchInput || !autocompleteList) return;
  const basePath = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';
  let allCars = [];

  fetch('js/cars.json')
    .then(res => res.json())
    .then(data => {
      allCars = data.carts;
    })
    .catch(err => console.error("Помилка завантаження JSON:", err));

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
        // Переходим на каталог с поисковым параметром
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
    // При сабмите сразу переходим на каталог с поисковым параметром
    const url = new URL(basePath + 'catalog.html');
  
    url.searchParams.set('search', query);
    window.location.href = url.toString();
  });

  document.addEventListener('click', e => {
    if (!searchForm.contains(e.target)) {
      autocompleteList.innerHTML = '';
    }
  });
}
// Генерація карток авто (каталог)
function initCatalogCards() {
  const container = document.getElementById('portfolio__card');
  const pagination = document.getElementById('pagination');
  const basePath = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';
  
  const searchForm = document.querySelector('.header__form-search');
  const searchInput = searchForm?.querySelector('input[type="text"]');
  const autocompleteList = searchForm?.querySelector('.autocomplete-list');
  const classFilter = document.getElementById("classFilter"); // ← важливо
  if (!container || !pagination || !searchForm || !searchInput || !autocompleteList) return;

  const CARDS_PER_PAGE = 9;
  let allCars = [], filteredCars = [], currentPage = 1, currentQuery = '';
  let selectedClass = 'Усі';

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

  function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('page', currentPage);
    if (currentQuery) {
      url.searchParams.set('search', currentQuery);
    } else {
      url.searchParams.delete('search');
    }
    if (selectedClass && selectedClass !== 'Усі') {
      url.searchParams.set('class', selectedClass);
    } else {
      url.searchParams.delete('class');
    }
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
// Підрахунок кількості авто
function initTotalCarCount() {
  const counterElement = document.querySelector('.carts__title');

  if (!counterElement) return;

  fetch('js/cars.json')
    .then(res => res.json())
    .then(data => {
      const allCars = data.carts || [];
      const availableCars = allCars.filter(car => car.available !== false); // Якщо поле `available` = false — пропускаємо
      counterElement.textContent = `Всього авто: ${availableCars.length}`;
    })
    .catch(err => {
      console.error("Помилка завантаження JSON для підрахунку авто:", err);
      counterElement.textContent = "Всього авто: —";
    });
}
// Сторінка car.html
function initCarPage() {
  const carTitle = document.getElementById("car-title");
  if (!carTitle) return;

  const model = new URLSearchParams(window.location.search).get("model");
  if (!model) return;

  fetch("js/cars.json")
    .then(res => res.json())
    .then(data => {
      // Используем data.data для страницы car.html
      const allCars = data.data || [];

      // Ищем машину по slug (а не по title)
      const carData = allCars.find(car =>
        car.title.toLowerCase().replace(/\s+/g, '-') === model.toLowerCase()
      );

      if (!carData) {
        document.body.innerHTML = "<h2>Автомобіль не знайдено</h2>";
        return;
      }

      document.title = `${carData.title} – DriveShare`;
      carTitle.textContent = carData.title;

      // Добавляем проверку существования элементов
      const subtitleEl = document.getElementById("car-subtitle");
      if (subtitleEl) subtitleEl.textContent = carData.subtitle || "";

      const img = document.getElementById("car-image");
      if (img) {
        img.src = carData.image || "";
        img.alt = carData.title || "";
      }

      // Исправленная функция renderList
      function renderList(id, data) {
        const container = document.getElementById(id);
        if (!container || !data) {
          console.error(`Контейнер ${id} не найден или нет данных`);
          return;
        }

        container.innerHTML = Object.entries(data)
          .map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`)
          .join('');
      }

      // Добавляем характеристики
      if (carData.car_features) {
        renderList("car-features", carData.car_features);
      } else {
        console.error("Нет данных car_features");
      }

      // Добавляем стоимость аренды
      if (carData.rental_cost) {
        renderList("rental_cost", carData.rental_cost);
      } else {
        console.error("Нет данных rental_cost");
      }

      // Рекомендованные авто (используем data.carts)
      const recommendedCars = data.carts || [];
      renderRecommendedCars(recommendedCars, model.toLowerCase());
    })
    .catch(err => {
      console.error("Помилка завантаження car data:", err);
      document.body.innerHTML = "<h2>Сталася помилка при завантаженні даних</h2>";
    });

  function renderRecommendedCars(allCars, currentSlug) {
    const container = document.getElementById('portfolio__card');
    if (!container) return;

    // Фильтруем авто (исключаем текущее)
    const recommended = allCars
      .filter(car => car.slug !== currentSlug)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

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

