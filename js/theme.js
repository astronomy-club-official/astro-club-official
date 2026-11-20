const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
} else {
  document.documentElement.setAttribute("data-theme", "dark");
}

function updateThemeToggleUI() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) {
    btn.setAttribute("aria-pressed", isLight ? "true" : "false");
  }
  const themeCheckbox = document.getElementById("theme-checkbox");
  if (themeCheckbox) {
    themeCheckbox.checked = isLight;
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeToggleUI();
}

document.addEventListener("DOMContentLoaded", () => {
  updateThemeToggleUI();
});
