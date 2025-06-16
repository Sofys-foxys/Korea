
document.addEventListener('DOMContentLoaded', () => {

    //Service worker registration. Installation button only appears if app not alreay isntalled.
    //Standard installation process overwritten 
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./js/sw.js')
                    .then(() => console.log('Service Worker registered'))
                    .catch(err => console.error('Service Worker registration failed:', err));
        });
        
        // Install prompt
        let deferredPrompt;
        function isAppInstalled() {
            return window.matchMedia('(display-mode: standalone)').matches
                    || window.navigator.standalone === true;
        }
        
        //custom installation behavior
        if (!isAppInstalled()) {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;

                const installBtn = document.createElement('button');
                installBtn.id = 'install-button';
                installBtn.textContent = 'Install as App';
                installBtn.onclick = () => {

                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(choiceResult => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                            installBtn.style.display = 'none';
                        } else {
                            console.log('User dismissed the install prompt');
                        }
                        deferredPrompt = null;
                    });
                };
                const header = document.querySelector('header');
                if (header) {
                    header.insertBefore(installBtn, header.firstChild);
                }
            });
        }

    }
    
//toggle hamburguer menu for responsive design
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.navbar');
    toggle.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
    //soundToggle
    const soundToggleBtn = document.getElementById('sound-toggle');
    const audio = document.getElementById('bg-sound');

    audio.volume = 0.2;  // 20% volume

    let isPlaying = false;
    soundToggleBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            soundToggleBtn.textContent = '🔇 Sound Off';
        } else {
            audio.muted = false;
            audio.play();
            soundToggleBtn.textContent = '🔊 Sound On';
        }
        isPlaying = !isPlaying;
    });


//gallery logic
    const scrollContainer = document.querySelector(".gallery-scroll");
    const images = document.querySelectorAll(".gallery-track img");
    const leftBtn = document.querySelector(".nav-btn.left");
    const rightBtn = document.querySelector(".nav-btn.right");
    let currentIndex = 0;
    const totalImages = images.length;
    function scrollToIndex(index) {
        if (!images[index])
            return;
        const img = images[index];
        // Calculate the left scroll position to center the image
        const scrollPos = img.offsetLeft - (scrollContainer.clientWidth - img.clientWidth) / 2;
        scrollContainer.scrollTo({
            left: scrollPos,
            behavior: "smooth"
        });
    }

    function showNextImage() {
        currentIndex = (currentIndex + 1) % totalImages;
        scrollToIndex(currentIndex);
    }

    function showPrevImage() {
        currentIndex = (currentIndex - 1 + totalImages) % totalImages;
        scrollToIndex(currentIndex);
    }

// Auto-scroll every 3 seconds
    let autoScroll = setInterval(showNextImage, 3000);
    // Pause auto-scroll on hover
    scrollContainer.addEventListener("mouseenter", () => clearInterval(autoScroll));
    scrollContainer.addEventListener("mouseleave", () => {
        autoScroll = setInterval(showNextImage, 3000);
    });
    // Manual controls
    leftBtn.addEventListener("click", () => {
        showPrevImage();
        resetAutoScroll();
    });
    rightBtn.addEventListener("click", () => {
        showNextImage();
        resetAutoScroll();
    });
    function resetAutoScroll() {
        clearInterval(autoScroll);
        autoScroll = setInterval(showNextImage, 3000);
    }

// Initial scroll in gallery
    scrollToIndex(currentIndex);

//scroll to top button behavior
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  // Show the button after scrolling down 100px
  window.onscroll = function () {
    scrollTopBtn.style.display = window.scrollY > 100 ? "block" : "none";
  };

  // Scroll to top smoothly when clicked
  scrollTopBtn.onclick = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

});
