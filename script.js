// script.js
// WhatsApp reservation & interactive package cards

document.addEventListener('DOMContentLoaded', function() {
    // Responsive navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.classList.toggle('open', isOpen);
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                if (navLinks.classList.contains('open')) {
                    navLinks.classList.remove('open');
                    navToggle.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        document.addEventListener('click', function(event) {
            if (!navLinks.contains(event.target) && !navToggle.contains(event.target) && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Reservation form submit
    const reservationForm = document.querySelector('.reservation form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = reservationForm.querySelector('input[name="name"]').value;
            const date = reservationForm.querySelector('input[name="date"]').value;
            const timeField = reservationForm.querySelector('[name="time"]');
            const time = timeField && timeField.value !== '' ? timeField.value : '';
            const packageSelected = document.querySelector('.package-card.selected .package-title')?.textContent || '';
            let message = `Halo, saya ingin reservasi atas nama ${name} pada tanggal ${date} jam ${time}`;
            if (packageSelected) message += ` untuk paket ${packageSelected}`;
            const waUrl = `https://wa.me/6288233550314?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        });
    }

    // Package card selection
    const packageCards = document.querySelectorAll('.package-card');
    packageCards.forEach(card => {
        card.addEventListener('click', function() {
            packageCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
        // WhatsApp action button
        const waBtn = card.querySelector('.wa-action');
        if (waBtn) {
            waBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const name = document.querySelector('input[name="name"]')?.value || '';
                const date = document.querySelector('input[name="date"]')?.value || '';
                const timeField = document.querySelector('[name="time"]');
                const time = timeField && timeField.value !== '' ? timeField.value : '';
                const pkg = card.querySelector('.package-title').textContent;
                let message = `Halo, saya tertarik dengan paket ${pkg}`;
                if (name && date && time) {
                    message += `, reservasi atas nama ${name} pada tanggal ${date} jam ${time}`;
                }
                const waUrl = `https://wa.me/6288233550314?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank');
            });
        }
    });
});
