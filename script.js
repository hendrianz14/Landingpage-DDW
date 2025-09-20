// script.js
// WhatsApp reservation & interactive package cards

document.addEventListener('DOMContentLoaded', function() {
    // Reservation form submit
    const reservationForm = document.querySelector('.reservation form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nameField = reservationForm.querySelector('input[name="name"]');
            const dateField = reservationForm.querySelector('input[name="date"]');
            const timeField = reservationForm.querySelector('[name="time"]');
            const name = nameField ? nameField.value : '';
            const date = dateField ? dateField.value : '';
            const time = timeField ? timeField.value : '';
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
                const time = document.querySelector('[name="time"]')?.value || '';
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
