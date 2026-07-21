
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
if(menuBtn){
  menuBtn.addEventListener('click',()=>navLinks.classList.toggle('open'));
}
const year = document.querySelector('#year');
if(year) year.textContent = new Date().getFullYear();

const form = document.querySelector('#estimate-form');
if(form){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.querySelector('#name').value.trim();
    alert(`Thank you${name ? ', ' + name : ''}! Your estimate request has been prepared. Connect this form to your email service before publishing.`);
    form.reset();
  });
}
