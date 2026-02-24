<script>
/* TOM SOX ALUMNI PAGE - JAVASCRIPT */

(function() {
    'use strict';

    var carouselState = {
        currentSlide: 0,
        totalSlides: 4,
        autoPlayInterval: null,
        autoPlayDelay: 5000,
        isPaused: false
    };

    function initCarousel() {
        console.log('Tom Sox: Initializing Carousel...');
        
        var slides = document.querySelectorAll('.carousel-slide');
        var dots = document.querySelectorAll('.carousel-dots .dot');
        var prevBtn = document.querySelector('.carousel-prev');
        var nextBtn = document.querySelector('.carousel-next');
        var carouselContainer = document.querySelector('.alumni-carousel');

        if (!slides || slides.length === 0) {
            console.error('Tom Sox: No carousel slides found! Retrying in 2 seconds...');
            setTimeout(initCarousel, 2000);
            return;
        }

        console.log('Tom Sox: Found ' + slides.length + ' slides');

        function showSlide(index) {
            for (var i = 0; i < slides.length; i++) {
                slides[i].classList.remove('active');
            }
            for (var i = 0; i < dots.length; i++) {
                dots[i].classList.remove('active');
            }

            if (index >= carouselState.totalSlides) {
                carouselState.currentSlide = 0;
            } else if (index < 0) {
                carouselState.currentSlide = carouselState.totalSlides - 1;
            } else {
                carouselState.currentSlide = index;
            }

            slides[carouselState.currentSlide].classList.add('active');
            if (dots[carouselState.currentSlide]) {
                dots[carouselState.currentSlide].classList.add('active');
            }
            
            console.log('Tom Sox: Showing slide ' + carouselState.currentSlide);
        }

        function nextSlide() {
            showSlide(carouselState.currentSlide + 1);
        }

        function prevSlide() {
            showSlide(carouselState.currentSlide - 1);
        }

        function startAutoPlay() {
            if (!carouselState.isPaused && !carouselState.autoPlayInterval) {
                carouselState.autoPlayInterval = setInterval(nextSlide, carouselState.autoPlayDelay);
                console.log('Tom Sox: Carousel auto-play started');
            }
        }

        function stopAutoPlay() {
            if (carouselState.autoPlayInterval) {
                clearInterval(carouselState.autoPlayInterval);
                carouselState.autoPlayInterval = null;
                console.log('Tom Sox: Carousel auto-play stopped');
            }
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Tom Sox: Previous clicked');
                prevSlide();
                resetAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Tom Sox: Next clicked');
                nextSlide();
                resetAutoPlay();
            });
        }

        for (var i = 0; i < dots.length; i++) {
            (function(index) {
                dots[index].addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Tom Sox: Dot ' + index + ' clicked');
                    showSlide(index);
                    resetAutoPlay();
                });
            })(i);
        }

        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', function() {
                carouselState.isPaused = true;
                stopAutoPlay();
            });

            carouselContainer.addEventListener('mouseleave', function() {
                carouselState.isPaused = false;
                startAutoPlay();
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                resetAutoPlay();
            }
        });

        startAutoPlay();
        console.log('Tom Sox: Carousel initialized successfully!');
    }

    function initDraftTable() {
        var showMoreBtn = document.getElementById('showMoreDraft');
        var hiddenRows = document.querySelectorAll('.draft-hidden');

        if (!showMoreBtn || !hiddenRows || hiddenRows.length === 0) return;

        showMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var isShown = hiddenRows[0].classList.contains('show');
            if (isShown) {
                for (var i = 0; i < hiddenRows.length; i++) {
                    hiddenRows[i].classList.remove('show');
                }
                showMoreBtn.textContent = 'Show More Draft Picks';
            } else {
                for (var i = 0; i < hiddenRows.length; i++) {
                    hiddenRows[i].classList.add('show');
                }
                showMoreBtn.textContent = 'Show Less';
            }
        });
    }

    // Try multiple times with increasing delays
    console.log('Tom Sox: Script loaded, waiting for page...');
    setTimeout(function() {
        console.log('Tom Sox: Attempt 1 (1 second)');
        initCarousel();
        initDraftTable();
    }, 1000);
    
    setTimeout(function() {
        console.log('Tom Sox: Attempt 2 (3 seconds)');
        initCarousel();
        initDraftTable();
    }, 3000);
    
    setTimeout(function() {
        console.log('Tom Sox: Attempt 3 (5 seconds)');
        initCarousel();
        initDraftTable();
    }, 5000);

})();
</script>
