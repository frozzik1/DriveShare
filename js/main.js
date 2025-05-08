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
  });
  