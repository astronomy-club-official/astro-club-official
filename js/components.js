document.addEventListener("DOMContentLoaded", () => {
  // Load Navbar
  const navPlaceholder = document.getElementById("navbar-placeholder");
  if (navPlaceholder) {
    fetch("components/navbar.html")
      .then((res) => res.text())
      .then((data) => {
        navPlaceholder.innerHTML = data;
        if (typeof updateThemeToggleUI === "function") {
          updateThemeToggleUI();
        }
        if (typeof initHamburger === "function") {
          initHamburger();
        }
      });
  }

  // Load Footer
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    fetch("components/footer.html")
      .then((res) => res.text())
      .then((data) => {
        footerPlaceholder.innerHTML = data;
      });
  }
});
