// script.js
// WhatsApp reservation & interactive package cards

document.addEventListener('DOMContentLoaded', onDomReady);

/**
 * Nama Fungsi: onDomReady
 * Keterangan: Menginisialisasi seluruh interaksi situs setelah dokumen siap dipakai.
 */
function onDomReady() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const reservationForm = document.querySelector('.reservation form');
    const packageCards = Array.from(document.querySelectorAll('.package-card'));

    setupResponsiveNavigation(navToggle, navLinks);
    setupReservationForm(reservationForm);
    setupPackageCards(packageCards);
}

/**
 * Nama Fungsi: setupResponsiveNavigation
 * Keterangan: Menghubungkan handler navigasi hamburger agar responsif dan mudah digunakan.
 */
function setupResponsiveNavigation(navToggle, navLinks) {
    if (!navToggle || !navLinks) {
        return;
    }

    /**
     * Nama Fungsi: handleNavToggle
     * Keterangan: Membuka atau menutup menu navigasi ketika tombol hamburger ditekan.
     */
    function handleNavToggle() {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    /**
     * Nama Fungsi: closeNavigation
     * Keterangan: Menutup menu navigasi dan mereset status tombol hamburger.
     */
    function closeNavigation() {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    /**
     * Nama Fungsi: handleNavLinkClick
     * Keterangan: Menutup menu setelah pengguna memilih salah satu tautan.
     */
    function handleNavLinkClick() {
        if (navLinks.classList.contains('open')) {
            closeNavigation();
        }
    }

    /**
     * Nama Fungsi: handleDocumentClick
     * Keterangan: Menutup menu ketika pengguna klik di luar area navigasi.
     */
    function handleDocumentClick(event) {
        if (!navLinks.contains(event.target) && !navToggle.contains(event.target) && navLinks.classList.contains('open')) {
            closeNavigation();
        }
    }

    /**
     * Nama Fungsi: handleResize
     * Keterangan: Menjamin menu tertutup ketika viewport melebar ke ukuran desktop.
     */
    function handleResize() {
        if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
            closeNavigation();
        }
    }

    navToggle.addEventListener('click', handleNavToggle);

    const navAnchors = navLinks.querySelectorAll('a');
    for (const link of navAnchors) {
        link.addEventListener('click', handleNavLinkClick);
    }

    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('resize', handleResize);
}

/**
 * Nama Fungsi: setupReservationForm
 * Keterangan: Menangani pengiriman formulir reservasi agar langsung membuka WhatsApp dengan pesan terformat.
 */
function setupReservationForm(reservationForm) {
    if (!reservationForm) {
        return;
    }

    initializeReservationDateInput(reservationForm);

    /**
     * Nama Fungsi: handleReservationSubmit
     * Keterangan: Membentuk pesan reservasi dari input pengguna dan membuka WhatsApp.
     */
    function handleReservationSubmit(event) {
        event.preventDefault();

        const name = reservationForm.querySelector('input[name="name"]')?.value || '';
        const date = reservationForm.querySelector('input[name="date"]')?.value || '';
        const timeField = reservationForm.querySelector('[name="time"]');
        const time = timeField && timeField.value !== '' ? timeField.value : '';
        const packageSelected = document.querySelector('.package-card.selected .package-title')?.textContent || '';

        let message = `Halo, saya ingin reservasi atas nama ${name} pada tanggal ${date} jam ${time}`;
        if (packageSelected) {
            message += ` untuk paket ${packageSelected}`;
        }

        /**
         * Nama Fungsi: openWhatsappWithMessage
         * Keterangan: Membuka tab WhatsApp baru dengan pesan yang sudah dikodekan.
         */
        function openWhatsappWithMessage(text) {
            const waUrl = `https://wa.me/6288233550314?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        }

        openWhatsappWithMessage(message);
    }

    reservationForm.addEventListener('submit', handleReservationSubmit);
}

/**
 * Nama Fungsi: initializeReservationDateInput
 * Keterangan: Menambahkan placeholder kustom dan ikon kalender pada input tanggal.
 */
function initializeReservationDateInput(reservationForm) {
    const dateWrapper = reservationForm.querySelector('.date-input');
    const dateField = dateWrapper?.querySelector('input[type="date"]');

    if (!dateWrapper || !dateField) {
        return;
    }

    const refreshState = () => {
        const hasValue = Boolean(dateField.value);
        dateWrapper.classList.toggle('has-value', hasValue);
    };

    const focusDateField = () => {
        if (typeof dateField.focus === 'function') {
            try {
                dateField.focus({ preventScroll: true });
            } catch (error) {
                dateField.focus();
            }
        }
    };

    const openNativePicker = () => {
        if (typeof dateField.showPicker === 'function') {
            try {
                dateField.showPicker();
            } catch (error) {
                // showPicker dapat menolak ketika dipanggil saat picker sudah terbuka;
                // kita abaikan agar pengalaman pengguna tidak terganggu.
            }
        }
    };

    const handleWrapperClick = (event) => {
        if (event.button && event.button !== 0) {
            return;
        }

        focusDateField();
        openNativePicker();
    };

    dateWrapper.addEventListener('click', handleWrapperClick);

    dateField.addEventListener('input', refreshState);
    dateField.addEventListener('change', refreshState);
    reservationForm.addEventListener('reset', () => {
        window.requestAnimationFrame(refreshState);
    });

    refreshState();
}

/**
 * Nama Fungsi: setupPackageCards
 * Keterangan: Mengatur interaksi kartu paket agar dapat dipilih dan langsung mengirim pesan WhatsApp.
 */
function setupPackageCards(packageCards) {
    if (!Array.isArray(packageCards) || packageCards.length === 0) {
        return;
    }
    document.addEventListener('click', function (e) {
    // Cek apakah klik terjadi DI DALAM salah satu .package-card
    const clickedInsideCard = e.target.closest('.package-card');
    if (!clickedInsideCard) {
        // Kalau klik di luar semua card → hapus semua .selected
        document.querySelectorAll('.package-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
    }
});

    /**
     * Nama Fungsi: markSelectedCard
     * Keterangan: Memberi tanda kartu paket yang aktif dipilih oleh pengguna.
     */
    function markSelectedCard(activeCard) {
        for (const card of packageCards) {
            card.classList.remove('selected');
        }
        activeCard.classList.add('selected');
    }

    /**
     * Nama Fungsi: handlePackageCardClick
     * Keterangan: Memberi highlight pada kartu paket yang baru dipilih.
     */
    function handlePackageCardClick(event) {
    const currentCard = event.currentTarget;

    const isAlreadySelected = currentCard.classList.contains('selected');

    if (isAlreadySelected) {
        currentCard.classList.remove('selected');
    } else {
        for (const card of packageCards) {
            card.classList.remove('selected');
        }
        currentCard.classList.add('selected');
    }
}
    /**
     * Nama Fungsi: handlePackageWhatsapp
     * Keterangan: Mengirimkan pesan WhatsApp terkait paket tertentu tanpa kehilangan fungsi pemilihan kartu.
     */
    function handlePackageWhatsapp(event) {
        event.stopPropagation();
        const cardElement = event.currentTarget.closest('.package-card');
        if (!cardElement) {
            return;
        }

        const name = document.querySelector('input[name="name"]')?.value || '';
        const date = document.querySelector('input[name="date"]')?.value || '';
        const timeField = document.querySelector('[name="time"]');
        const time = timeField && timeField.value !== '' ? timeField.value : '';
        const pkg = cardElement.querySelector('.package-title')?.textContent || '';

        let message = `Halo, saya tertarik dengan paket ${pkg}`;
        if (name && date && time) {
            message += `, reservasi atas nama ${name} pada tanggal ${date} jam ${time}`;
        }

        const waUrl = `https://wa.me/6288233550314?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    }

    for (const card of packageCards) {
    card.addEventListener('click', handlePackageCardClick);

    const waBtn = card.querySelector('.wa-action');
    if (waBtn) {
        waBtn.addEventListener('click', handlePackageWhatsapp);
    }
}
}
