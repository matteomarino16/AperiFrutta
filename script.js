document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const preventivoForm = document.getElementById('preventivoForm');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    navToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        navToggle.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.servizio-card, .feature, .galleria-item, .contatti-box').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.textContent = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    if (preventivoForm) {
        preventivoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            const required = ['nome', 'email', 'telefono', 'tipo-evento', 'numero-persone', 'messaggio'];
            for (const field of required) {
                if (!data[field] || !data[field].trim()) {
                    alert('Per favore compila tutti i campi obbligatori.');
                    return;
                }
            }

            if (!document.getElementById('privacy').checked) {
                alert('È necessario accettare la Cookie Policy per inviare la richiesta.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                alert('Per favore inserisci un indirizzo email valido.');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Invio in corso...';
            submitBtn.disabled = true;

            // Invio tramite Formspree (sostituire YOUR_FORMSPREE_ID con il proprio ID Formspree)
            fetch('https://formspree.io/f/mqakvjje', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Richiesta inviata!';
                    submitBtn.style.background = '#27ae60';
                    submitBtn.style.borderColor = '#27ae60';
                    preventivoForm.reset();
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.background = '';
                        submitBtn.style.borderColor = '';
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            alert(data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            alert('Si è verificato un errore. Per favore riprova.');
                        }
                    });
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }).catch(error => {
                alert('Si è verificato un errore di connessione. Per favore riprova.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // Cookie Banner Logic
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
            document.body.classList.add('has-cookie-banner');
        }, 2000);
    }

    acceptBtn.addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.remove('show');
        document.body.classList.remove('has-cookie-banner');
    });

    document.querySelectorAll('.galleria-item').forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (img) {
                const overlay = this.querySelector('.galleria-overlay');
                if (overlay) {
                    overlay.innerHTML = '<i class="fas fa-expand" style="font-size: 2rem; color: white;"></i>';
                    setTimeout(() => {
                        overlay.innerHTML = '<i class="fas fa-search-plus"></i>';
                    }, 1500);
                }
            }
        });
    });

    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('data');
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }

    let currentLightboxIndex = 0;
    const galleryItems = document.querySelectorAll('.galleria-item');

    window.openLightbox = function(element) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const img = element.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentLightboxIndex = Array.from(galleryItems).indexOf(element);
    };

    window.closeLightbox = function() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    window.changeLightbox = function(direction) {
        currentLightboxIndex += direction;
        if (currentLightboxIndex < 0) currentLightboxIndex = galleryItems.length - 1;
        if (currentLightboxIndex >= galleryItems.length) currentLightboxIndex = 0;
        const img = galleryItems[currentLightboxIndex].querySelector('img');
        document.getElementById('lightbox-img').src = img.src;
        document.getElementById('lightbox-img').alt = img.alt;
    };

    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('lightbox');
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') changeLightbox(-1);
            if (e.key === 'ArrowRight') changeLightbox(1);
        }
    });
});