document.addEventListener('DOMContentLoaded', () => {
  console.log('App loaded');
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('App loaded');
  
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.navbar');

  toggle.addEventListener('click', () => {
    nav.classList.toggle('active');
  });
});