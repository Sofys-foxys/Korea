
document.addEventListener('DOMContentLoaded', () => {

    //**SECTION PWA
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

//**SECTION Navbar toggle hamburguer menu for responsive design
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.navbar');
    toggle.addEventListener('click', () => {
        nav.classList.toggle('active');

        /*hide install-button when opening mobile menu */
        const installButton = document.getElementById('install-button');
        if (nav.classList.contains('active')) {
            installButton.style.display = 'none';
        } else {
            installButton.style.display = 'block';
            ;
        }
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


//**SECTION gallery
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
        window.scrollTo({top: 0, behavior: 'smooth'});
    };


    //lightbox part of gallery

    const thumbnails = document.querySelectorAll('.gallery-track img');
    const lightbox1 = document.getElementById('lightbox');
    const lightboxImg1 = document.getElementById('lightbox-img');
    /* const lightboxClose = document.getElementById('lightbox-close'); */ /*done elsewhere*/

    thumbnails.forEach(img => {
        img.addEventListener('click', () => {
            const fullImg = img.getAttribute('data-full');
            lightboxImg1.src = fullImg;
            lightbox1.style.display = 'flex';
        });
    });

    /*handled by other carousel */
    /*
     lightboxClose.addEventListener('click', () => {
     lightbox.style.display = 'none';
     lightboxImg.src = ''; // Clear image to prevent showing old one briefly
     });
     */



//**SECTION timeline
    const steps = document.querySelectorAll(".step");
    const timeline = document.querySelector(".timeline");
    const line = document.querySelector(".line");

    // Create and position circles aligned vertically with steps
    steps.forEach((step, i) => {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        // Add class right or left for fly-in direction based on step side
        circle.classList.add(step.classList.contains('right') ? 'right' : 'left');
        timeline.appendChild(circle);
    });

    function positionCircles() {
        const circles = timeline.querySelectorAll('.circle');
        steps.forEach((step, i) => {
            const circle = circles[i];
            const circleTop = step.offsetTop + step.offsetHeight / 8;
            circle.style.top = `${circleTop}px`;
        });
    }

    let prevScrollY = window.scrollY;
    let downDirection;
    let full = false;
    let set = 0;
    const targetY = window.innerHeight;

    function scrollHandler() {
        const {scrollY} = window;
        downDirection = scrollY < prevScrollY;

        const timelineRect = timeline.getBoundingClientRect();
        const remToPx = parseInt(getComputedStyle(document.documentElement).fontSize);

        const dist = targetY - timelineRect.top;
        const lineDist = dist - 7 * remToPx;

        if (!downDirection && !full) {
            set = Math.max(set, lineDist);
            line.style.bottom = `calc(100% - ${set}px)`;
        }

        if (lineDist > timeline.offsetHeight - 7 * remToPx && !full) {
            line.style.bottom = "7rem";
            full = true;
        }

        const circles = timeline.querySelectorAll('.circle');

        steps.forEach((step, i) => {
            const rect = step.getBoundingClientRect();
            if (rect.top + step.offsetHeight / 5 < targetY) {
                setTimeout(() => {
                    step.classList.add("show-me");
                    circles[i].classList.add("circle-show");
                }, i * 150);
            }
        });

        prevScrollY = scrollY;
    }

    window.addEventListener('resize', () => {
        positionCircles();
    });

    window.addEventListener('scroll', scrollHandler);

    // Initial setup
    positionCircles();
    scrollHandler();



    // **SECTION my travels
    const data = [
        {
            images: ['https://ik.imagekit.io/kzkvm3mnmc/TripSouthKorea.png?updatedAt=1750117121530'],
            title: 'Road Trip 2024',
            text: `With my father we decided to do a road trip around Korea to try to visit as much cities/villages as we could. In the image you can see some of the places we went to! Unfortunately
            we couldn't visit them all due to time constrains, still we visit more that 15 places! We both agree that it was even better than the first time, in scenery, culture and food. If you can, please, visit some of the 
            marked cities! You will not regret it.`
        },
        {
            images: ['https://ik.imagekit.io/kzkvm3mnmc/SeoulHanok.jpeg?updatedAt=1750155171965',
                'https://ik.imagekit.io/kzkvm3mnmc/SeoulRiver.jpeg?updatedAt=1750155198305',
                'https://ik.imagekit.io/kzkvm3mnmc/SeoulWings.jpeg?updatedAt=1750155213353',
                'https://ik.imagekit.io/kzkvm3mnmc/SeoulMandu.jpeg?updatedAt=1750155225865',
                'https://ik.imagekit.io/kzkvm3mnmc/SeoulPond.jpeg?updatedAt=1750154880453'],
            title: 'Seoul, the city that never sleeps',
            text: `It's the center of Korea. There is no doubt about it. The first time I visited I was surprised 
            by the harsh contrast of tradition—with the hanoks, and modern—with the tall industrial buildings. It's a view that
            you can quickly fall in love with. With the walks along the river, which part so many neighboorhoods. The street art,
            the small mandu shops and the green scenery of Seoul Forest.`
        },
        {
            images: ['https://ik.imagekit.io/kzkvm3mnmc/BusanCoast.jpeg?updatedAt=1750153139762',
            'https://ik.imagekit.io/kzkvm3mnmc/BusanClock.jpeg?updatedAt=1750153388149',
            'https://ik.imagekit.io/kzkvm3mnmc/BusanSea.jpeg?updatedAt=1750153359700',
            'https://ik.imagekit.io/kzkvm3mnmc/BusanTemple.jpeg?updatedAt=1750153162008'],
            title: 'Busan is Good',
            text: `Before you say something about the title—that's the slogan for Busan. Yes, they are not the
            best in this aspects haha. "Seoul, your Soul" Do you get the memo? Yes? great haha. Busan is the second
            most popular city to visit and live in, with their coast, beutiful sunsets and their temples. While is not my
            favourite—maybe I have yet to discover their wonders I believe is a must for a first timer.`
        },
        {
            images: ['https://ik.imagekit.io/kzkvm3mnmc/GyeongjuBridge.jpeg?updatedAt=1750153710386',
            'https://ik.imagekit.io/kzkvm3mnmc/GyeongjuRiver.jpeg?updatedAt=1750153694830',
            'https://ik.imagekit.io/kzkvm3mnmc/GyeongjuTomb.jpeg?updatedAt=1750153676955',
            'https://ik.imagekit.io/kzkvm3mnmc/GyeongjuStreet.jpeg?updatedAt=1750153659732',
            'https://ik.imagekit.io/kzkvm3mnmc/GyeongjuWolji.jpeg?updatedAt=1750153639679'],
            title: 'Gyeongju, The Open Museum',
            text: `My favourite city alongside Suwon. You can discover so much about Korea and their history. While their most
            famous dinasty is the Joseon Dinasty—and within reason since they existed for more that 800 years. The ones who united 
            Korea and brought so many aspects from the chinese and japanese culture where Silla. There is not much found about them—
            and their mistery appeals to me.`
        
        },
        {
            images: ['https://ik.imagekit.io/kzkvm3mnmc/SokchoCafe.jpeg?updatedAt=1750153876073',
            'https://ik.imagekit.io/kzkvm3mnmc/SokchoBeach.jpeg?updatedAt=1750153891252',
            'https://ik.imagekit.io/kzkvm3mnmc/SokchoJeongja.jpeg?updatedAt=1750154021118',
            'https://ik.imagekit.io/kzkvm3mnmc/SokchoPortal.jpeg?updatedAt=1750154117545',
            'https://ik.imagekit.io/kzkvm3mnmc/SokchoWaitingWoman.jpeg?updatedAt=1750154135734'],
            title: 'Sokcho, Where Koreans vacation',
            text: `The real vacation spot for koreans to go to the beach. There is a funny fenomenon in Korea
            where if you want to go to the beach you are going to find it closed—or at least in my experience—, more
            times that it's open. But that's not the case for Sokcho. Many tourist go there since it's near Sereoksan,
            one of the most popular mountrains for trekking in Korea. And by only focusing on that they miss this beutiful city
            and their great seafood—the best we had in Korea!`
        },
        {
            images: ['https://ik.imagekit.io/kzkvm3mnmc/Hahoe50s.jpeg?updatedAt=1750157986580',
            'https://ik.imagekit.io/kzkvm3mnmc/HahoiView.jpeg?updatedAt=1750153182183',
            'https://ik.imagekit.io/kzkvm3mnmc/HahoeHouse.jpeg?updatedAt=1750153203184'],
            title: 'Hahoe, a look into the past',
            text: `While their attractions are fairly small, I have to highlight it. They had the niciest people
            and you can visit a reconstruction of a village of the Joseon Dinasty and near it you also have two movie
            sets for historical dramas: one from the 50's-80's and another from Joseon. It's something you need to see
            at least once. I went to others, such as Andong but this was the most interactive and open one.`
        }
    ];

    const imageEl = document.getElementById('carousel-image');
    const titleEl = document.getElementById('content-title');
    const textEl = document.getElementById('content-text');
    const buttons = document.querySelectorAll('.mini-navbar button');
    const dotsContainer = document.getElementById('dots');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.lightbox .close');

    let sectionIndex = 0;
    let imageIndex = 0;
    let interval;

    function updateDots(images, activeIndex) {
        dotsContainer.innerHTML = '';
        images.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === activeIndex)
                dot.classList.add('active');
            dot.addEventListener('click', () => {
                imageIndex = i;
                updateImage();
            });
            dotsContainer.appendChild(dot);
        });
    }

    function updateImage() {
        const currentItem = data[sectionIndex];
        const newImg = currentItem.images[imageIndex];
        imageEl.style.opacity = 0;
        setTimeout(() => {
            imageEl.src = newImg;
            imageEl.style.opacity = 1;
            updateDots(currentItem.images, imageIndex);
        }, 250);
    }

    function updateContent(index) {
        const item = data[index];
        sectionIndex = index;
        imageIndex = 0;
        titleEl.textContent = item.title;
        textEl.textContent = item.text;
        updateImage();

        clearInterval(interval);
        if (item.images.length > 1) {
            interval = setInterval(() => {
                imageIndex = (imageIndex + 1) % item.images.length;
                updateImage();
            }, 3000);
        }
    }

    prevBtn.addEventListener('click', () => {
        const item = data[sectionIndex];
        imageIndex = (imageIndex - 1 + item.images.length) % item.images.length;
        updateImage();
    });

    nextBtn.addEventListener('click', () => {
        const item = data[sectionIndex];
        imageIndex = (imageIndex + 1) % item.images.length;
        updateImage();
    });

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            updateContent(index);
        });
    });

    imageEl.addEventListener('click', () => {
        lightbox.style.display = 'flex';
        lightboxImg.src = imageEl.src;
    });

    closeLightbox.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    // Initialize first content
    updateContent(0);



});
