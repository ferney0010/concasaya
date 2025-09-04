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

    const animateCounter = (element) => {
        const target = +element.dataset.target;
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                element.innerText = target;
            } else {
                element.innerText = Math.floor(current);
            }
        }, 16);
        activeTimers.push(timer);
    };

    const resetCounters = () => {
        activeTimers.forEach(timer => clearInterval(timer));
        activeTimers = [];
        counters.forEach(counter => counter.innerText = '0');
        hasAnimated = false;
    };

    if (counterSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    counters.forEach(counter => {
                        animateCounter(counter);
                    });
                } else if (!entry.isIntersecting && hasAnimated) {
                    resetCounters();
                }
            });
        }, {
            threshold: 0.5
        });

        observer.observe(counterSection);
    }
});