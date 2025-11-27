const counters = document.querySelectorAll('.counter');
const speed = 100; // smaller = faster

const animateCounters = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counter = entry.target;
      const target = +counter.getAttribute('data-target');
      const increment = target / speed;

      const updateCount = () => {
        const count = +counter.innerText;
        if (count < target) {
          counter.innerText = Math.ceil(count + increment);
          setTimeout(updateCount, 10);
        } else {
          counter.innerText = target + '+';
        }
      };

      updateCount();
      observer.unobserve(counter);
    }
  });
};

const observer = new IntersectionObserver(animateCounters, {
  threshold: 0.5,
});

counters.forEach(counter => observer.observe(counter));




const carousel = document.getElementById("carousel");
const next = document.getElementById("next");
const prev = document.getElementById("prev");

if (carousel) {
  if (next) {
    next.addEventListener("click", () => {
      carousel.scrollBy({ left: 330, behavior: "smooth" });
    });
  }

  if (prev) {
    prev.addEventListener("click", () => {
      carousel.scrollBy({ left: -330, behavior: "smooth" });
    });
  }

  // Swipe support for mobile
  let startX;
  carousel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  carousel.addEventListener("touchmove", (e) => {
    if (!startX) return;
    let diffX = startX - e.touches[0].clientX;
    carousel.scrollLeft += diffX;
    startX = e.touches[0].clientX;
  });
}



const faqs = document.querySelectorAll(".faq-item");

faqs.forEach((faq) => {
  faq.querySelector(".faq-question").addEventListener("click", () => {
    faqs.forEach((item) => {
      if (item !== faq) item.classList.remove("active");
    });
    faq.classList.toggle("active");
  });
});

// Dropdown menu functionality
const trackDropdown = document.getElementById("trackDropdown");
const dropdown = document.querySelector(".dropdown");

if (trackDropdown && dropdown) {
  trackDropdown.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
}




gsap.from("#page2 .text h1",{
  x:-100,
  opacity:0,
  duration:1,
  ease:"power2.out",
})