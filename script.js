const menuButton = document.querySelector('.menu-btn');
const navigation = document.querySelector('.nav-links');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => navigation.classList.toggle('open'));
}

document.querySelectorAll('#year').forEach((element) => {
  element.textContent = new Date().getFullYear();
});
