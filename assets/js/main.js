document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        once: true
    });

    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    const mobileDropdownBtn = document.getElementById('mobile-dropdown-btn');
    const mobileDropdownMenu = document.getElementById('mobile-dropdown-menu');
    
    if (mobileDropdownBtn && mobileDropdownMenu) {
        mobileDropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mobileDropdownMenu.classList.toggle('hidden');
        });
    }

    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const icon = question.querySelector('i');
                const isExpanded = answer.style.maxHeight;

                document.querySelectorAll('.faq-answer').forEach(a => a.style.maxHeight = null);
                document.querySelectorAll('.faq-question i').forEach(i => i.classList.remove('rotate-180'));
                
                if (!isExpanded) {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                    icon.classList.add('rotate-180');
                }
            });
        });
    }

    const counterSection = document.getElementById('counter-section');
    const counters = document.querySelectorAll('.counter-number');
    let hasAnimated = false;
    let activeTimers = [];

    const formatNumber = (num) => new Intl.NumberFormat('de-DE').format(num);

    const animateCounter = (element) => {
        const target = +element.dataset.target;
        const prefix = element.dataset.prefix || '';
        const suffix = element.dataset.suffix || '';
        const useFormat = element.dataset.format === 'true';
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                const finalValue = useFormat ? formatNumber(target) : target;
                element.innerText = `${prefix}${finalValue}${suffix}`;
            } else {
                const currentValue = Math.floor(current);
                const displayValue = useFormat ? formatNumber(currentValue) : currentValue;
                element.innerText = `${prefix}${displayValue}${suffix}`;
            }
        }, 16);
        activeTimers.push(timer);
    };

    const resetCounters = () => {
        activeTimers.forEach(timer => clearInterval(timer));
        activeTimers = [];
        counters.forEach(counter => {
            const prefix = counter.dataset.prefix || '';
            const suffix = counter.dataset.suffix || '';
            counter.innerText = `${prefix}0${suffix}`;
        });
        hasAnimated = false;
    };

    if (counterSection && counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    counters.forEach(animateCounter);
                } else if (!entry.isIntersecting && hasAnimated) {
                    resetCounters();
                }
            });
        }, {
            threshold: 0.5
        });

        observer.observe(counterSection);
    }

    const testimonialsGrid = document.getElementById('testimonials-grid');
    if (testimonialsGrid) {
        const testimonials = Array.from(testimonialsGrid.children);
        const paginationControls = document.getElementById('pagination-controls');
        const itemsPerPage = 4;
        const totalPages = Math.ceil(testimonials.length / itemsPerPage);
        let currentPage = 1;

        const showPage = (page) => {
            currentPage = page;
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            testimonials.forEach(item => {
                item.classList.add('hidden');
                item.classList.remove('flex'); // Asegurarse de quitar flex
            });

            const currentItems = testimonials.slice(startIndex, endIndex);
            currentItems.forEach((item, index) => {
                item.classList.remove('hidden');
                item.classList.add('flex'); // Volver a añadir flex para que se muestre
                item.setAttribute('data-aos', 'fade-up');
                item.setAttribute('data-aos-delay', (index) * 100);
            });
            
            setTimeout(() => AOS.refresh(), 50);

            if (paginationControls) {
                updatePaginationButtons();
            }
        };

        const updatePaginationButtons = () => {
            const pageButtons = paginationControls.querySelectorAll('.page-btn');
            pageButtons.forEach(btn => {
                const pageNum = parseInt(btn.dataset.page, 10);
                btn.classList.toggle('bg-primary', pageNum === currentPage);
                btn.classList.toggle('text-white', pageNum === currentPage);
                btn.classList.toggle('bg-white', pageNum !== currentPage);
                btn.classList.toggle('text-dark', pageNum !== currentPage);
            });

            const prevButton = paginationControls.querySelector('.prev-btn');
            const nextButton = paginationControls.querySelector('.next-btn');
            
            if (prevButton) {
                prevButton.disabled = currentPage === 1;
                prevButton.classList.toggle('opacity-50', currentPage === 1);
            }
            if (nextButton) {
                nextButton.disabled = currentPage === totalPages;
                nextButton.classList.toggle('opacity-50', currentPage === totalPages);
            }
        };
        
        const setupPagination = () => {
            if (!paginationControls) return;
            paginationControls.innerHTML = '';

            const prevButton = document.createElement('button');
            prevButton.innerHTML = `<i class="fas fa-chevron-left"></i>`;
            prevButton.className = 'prev-btn px-4 py-2 text-dark bg-white rounded-md shadow-sm hover:bg-light disabled:opacity-50 transition-all';
            prevButton.addEventListener('click', () => {
                if (currentPage > 1) showPage(currentPage - 1);
            });
            paginationControls.appendChild(prevButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.innerText = i;
                pageButton.dataset.page = i;
                pageButton.className = 'page-btn px-4 py-2 rounded-md shadow-sm hover:bg-light transition-all';
                pageButton.addEventListener('click', () => showPage(i));
                paginationControls.appendChild(pageButton);
            }

            const nextButton = document.createElement('button');
            nextButton.innerHTML = `<i class="fas fa-chevron-right"></i>`;
            nextButton.className = 'next-btn px-4 py-2 text-dark bg-white rounded-md shadow-sm hover:bg-light disabled:opacity-50 transition-all';
            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages) showPage(currentPage + 1);
            });
            paginationControls.appendChild(nextButton);
        };

        if (testimonials.length > itemsPerPage) {
            setupPagination();
            showPage(1);
        } else {
            testimonials.forEach(item => {
                item.classList.remove('hidden');
                item.classList.add('flex');
            });
        }
    }
});