document.addEventListener("DOMContentLoaded", function () {
    const burger = document.getElementById("burger");
    const navWrapper = document.getElementById("nav-wrapper");
  
    burger.addEventListener("click", function () {
      navWrapper.classList.toggle("active");
    });
  
    // Закрывать меню при клике на пункт
    document.querySelectorAll(".header__navigation-item a").forEach(link => {
      link.addEventListener("click", () => {
        navWrapper.classList.remove("active");
      });
    });
  });
  