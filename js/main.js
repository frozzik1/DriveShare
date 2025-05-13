document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger");
  const navWrapper = document.getElementById("nav-wrapper");

  if (burger && navWrapper) {
    burger.addEventListener("click", () => {
      navWrapper.classList.toggle("active");
    });

    document.querySelectorAll(".header__navigation-item a").forEach(link => {
      link.addEventListener("click", () => {
        navWrapper.classList.remove("active");
      });
    });
  }

  const observeVisibility = (selector, visibleClass = "visible", threshold = 0.3, withDelay = false) => {
    const elements = document.querySelectorAll(selector);

    if (elements.length) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(visibleClass);

            if (withDelay) {
              entry.target.style.animationDelay = `${index * 0.3}s`;
            }

            obs.unobserve(entry.target);
          }
        });
      }, { threshold });

      elements.forEach(el => observer.observe(el));
    }
  };

  observeVisibility(".advantages__item");
  observeVisibility(".caring__item", "visible", 0.5, true);
  observeVisibility(".tarifs__tarif-card");

  const catalogBtn = document.querySelector(".catalog__btn");
  if (catalogBtn) {
    catalogBtn.addEventListener("click", () => {
      window.location.href = "catalog.html";
    });
  }

  // 📦 Додавання логіки для car.html
  const carTitle = document.getElementById("car-title");
  if (carTitle) {
    const params = new URLSearchParams(window.location.search);
    const model = params.get("model");

    fetch("js/cars.json")
      .then(response => response.json())
      .then(data => {
        // Підключення до нового формату JSON
        const carData = data.data.find(car => car.title.toLowerCase().replace(/\s+/g, '-') === model.toLowerCase());

        if (carData) {
          document.title = carData.title + " – DriveShare";
          carTitle.textContent = carData.title;
          document.getElementById("car-subtitle").textContent = carData.subtitle;

          // Добавляем характеристики машины в список
          const featuresList = document.getElementById("car-features");
          featuresList.innerHTML = '';

          // Добавляем характеристики
          for (const feature in carData.car_features) {
            const listItem = document.createElement("li");
            listItem.textContent = `${feature}: ${carData.car_features[feature]}`;
            featuresList.appendChild(listItem);
          }

          // Добавляем цены аренды в отдельный список
          const rentalList = document.getElementById("rental_cost");
          rentalList.innerHTML = ''; // очищаем список, если нужно

          for (const rental in carData.rental_cost) {
            const listItem = document.createElement("li");
            listItem.textContent = `${rental}: ${carData.rental_cost[rental]}`;
            rentalList.appendChild(listItem);
          }

          const image = document.getElementById("car-image");
          image.src = carData.image;
          image.alt = carData.title;
          document.getElementById("car-price").textContent = carData.price + " ₴/доба";
        } else {
          document.body.innerHTML = "<h2>Автомобіль не знайдено</h2>";
        }
      })
      .catch(err => {
        console.error("Помилка завантаження car data:", err);
        document.body.innerHTML = "<h2>Сталася помилка при завантаженні даних</h2>";
      });
  }
});
