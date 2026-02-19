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
    initializeMenuFromJson({
        dataUrl: 'assets/data/menu.json',
        specialsSelector: '[data-menu-specials]',
        fullMenuSelector: '[data-full-menu]'
    });
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
            const waUrl = `https://wa.me/6282220211273?text=${encodeURIComponent(text)}`;
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

    const supportsProgrammaticPicker = typeof dateField.showPicker === 'function';

    const refreshState = () => {
        const hasValue = Boolean(dateField.value);
        dateWrapper.classList.toggle('has-value', hasValue);
    };

    const getTodayInputValue = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const offsetInMs = now.getTimezoneOffset() * 60 * 1.000;
        const localDate = new Date(now.getTime() - offsetInMs);
        return localDate.toISOString().split('T')[0];
    };

    const enforceMinDate = () => {
        const todayValue = getTodayInputValue();
        let valueAdjusted = false;

        if (dateField.min !== todayValue) {
            dateField.min = todayValue;
        }

        if (dateField.value && dateField.value < todayValue) {
            dateField.value = todayValue;
            valueAdjusted = true;
        }

        return valueAdjusted;
    };

    const handleDateChange = () => {
        enforceMinDate();
        refreshState();
    };

    const handleDateFocus = () => {
        const adjusted = enforceMinDate();
        if (adjusted) {
            refreshState();
        }
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
        if (!supportsProgrammaticPicker) {
            return false;
        }

        try {
            dateField.showPicker();
            return true;
        } catch (error) {
            // showPicker dapat menolak ketika dipanggil saat picker sudah terbuka;
            // kita abaikan agar pengalaman pengguna tidak terganggu.
        }

        return false;
    };

    const handleWrapperClick = (event) => {
        if (event.button && event.button !== 0) {
            return;
        }

        const isDirectDateFieldTap = event.target === dateField;

        focusDateField();

        if (isDirectDateFieldTap) {
            if (!supportsProgrammaticPicker && event.isTrusted && typeof dateField.click === 'function') {
                try {
                    dateField.click();
                } catch (error) {
                    // Safari/iOS dapat menolak pemanggilan click saat kontrol sudah terbuka;
                    // kita abaikan supaya interaksi pengguna tetap mulus.
                }
            } else if (supportsProgrammaticPicker) {
                openNativePicker();
            }

            return;
        }

        const pickerOpened = openNativePicker();

        if (!pickerOpened && typeof dateField.click === 'function') {
            try {
                dateField.click();
            } catch (error) {
                // Beberapa browser bisa menolak pemanggilan click() kedua berturut-turut.
                // Dalam kasus tersebut kita biarkan interaksi asli berjalan tanpa gangguan.
            }
        }
    };

    dateWrapper.addEventListener('click', handleWrapperClick);
    dateField.addEventListener('input', refreshState);
    dateField.addEventListener('change', handleDateChange);
    dateField.addEventListener('focus', handleDateFocus);
    reservationForm.addEventListener('reset', () => {
        window.requestAnimationFrame(() => {
            enforceMinDate();
            refreshState();
        });
    });

    enforceMinDate();
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

        const waUrl = `https://wa.me/6282220211273?text=${encodeURIComponent(message)}`;
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

/**
 * Nama Fungsi: initializeMenuFromJson
 * Keterangan: Memuat data menu dari berkas JSON eksternal dan merendernya ke dalam halaman.
 */
async function initializeMenuFromJson({ dataUrl, specialsSelector, fullMenuSelector } = {}) {
    const specialsContainer = typeof specialsSelector === 'string' ? document.querySelector(specialsSelector) : null;
    const fullMenuContainer = typeof fullMenuSelector === 'string' ? document.querySelector(fullMenuSelector) : null;

    if (!specialsContainer && !fullMenuContainer) {
        return;
    }

    const setLoadingState = (container, message) => {
        if (!container) {
            return;
        }

        container.innerHTML = '';
        const loadingMessage = createInfoMessage(message || 'Memuat data...', 'menu-loading');
        if (loadingMessage) {
            container.appendChild(loadingMessage);
        }
    };

    const setErrorState = (container, message) => {
        if (!container) {
            return;
        }

        container.innerHTML = '';
        const errorMessage = createInfoMessage(message || 'Menu tidak dapat dimuat.', 'menu-feedback menu-feedback--error');
        if (errorMessage) {
            container.appendChild(errorMessage);
        }
    };

    setLoadingState(specialsContainer, 'Memuat menu spesial...');
    setLoadingState(fullMenuContainer, 'Memuat daftar menu lengkap...');

    if (typeof fetch !== 'function') {
        setErrorState(specialsContainer, 'Peramban Anda belum mendukung pemuatan menu otomatis.');
        setErrorState(fullMenuContainer, 'Peramban Anda belum mendukung pemuatan menu otomatis.');
        return;
    }

    try {
        const response = await fetch(dataUrl, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Gagal memuat data menu: ${response.status}`);
        }

        const menuData = await response.json();

        if (specialsContainer) {
            renderSpecialMenu(menuData?.specials, specialsContainer);
        }

        if (fullMenuContainer) {
            renderFullMenu(menuData?.fullMenu, fullMenuContainer);
        }
    } catch (error) {
        console.error('Gagal memuat data menu', error);
        setErrorState(specialsContainer, 'Maaf, data menu belum dapat dimuat. Silakan coba lagi nanti.');
        setErrorState(fullMenuContainer, 'Maaf, data menu belum dapat dimuat. Silakan coba lagi nanti.');
    }
}

/**
 * Nama Fungsi: renderSpecialMenu
 * Keterangan: Mengganti konten menu spesial dengan kartu yang dibentuk dari data JSON.
 */
function renderSpecialMenu(specials, container) {
    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (!Array.isArray(specials) || specials.length === 0) {
        const message = createInfoMessage('Menu spesial akan segera hadir.', 'menu-feedback');
        if (message) {
            container.appendChild(message);
        }
        return;
    }

    const fragment = document.createDocumentFragment();

    for (const special of specials) {
        if (!special || typeof special !== 'object') {
            continue;
        }

        const card = document.createElement('article');
        card.className = 'menu-item';

        if (special.image) {
            const imageElement = document.createElement('img');
            imageElement.src = special.image;
            imageElement.alt = special.alt || special.title || '';
            card.appendChild(imageElement);
        }

        const titleElement = document.createElement('h3');
        titleElement.textContent = special.title || 'Menu Spesial';
        card.appendChild(titleElement);

        if (special.description) {
            const descriptionElement = document.createElement('p');
            descriptionElement.textContent = special.description;
            card.appendChild(descriptionElement);
        }

        fragment.appendChild(card);
    }

    container.appendChild(fragment);
}

/**
 * Nama Fungsi: renderFullMenu
 * Keterangan: Membentuk daftar menu lengkap (makanan & minuman) dari data JSON.
 */
function renderFullMenu(fullMenu, container) {
    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (!Array.isArray(fullMenu) || fullMenu.length === 0) {
        const message = createInfoMessage('Daftar menu sedang disiapkan.', 'menu-feedback');
        if (message) {
            container.appendChild(message);
        }
        return;
    }

    const fragment = document.createDocumentFragment();

    for (const category of fullMenu) {
        if (!category || typeof category !== 'object') {
            continue;
        }

        const categoryCard = document.createElement('div');
        categoryCard.classList.add('menu-category');

        const titleElement = document.createElement('h3');
        titleElement.textContent = category.title || 'Menu';
        categoryCard.appendChild(titleElement);

        const columnsWrapper = document.createElement('div');
        columnsWrapper.className = 'menu-list-2col';

        const columnsSource = Array.isArray(category.columns) && category.columns.length > 0
            ? category.columns
            : category.groups
                ? [category.groups]
                : [];

        for (const columnGroups of columnsSource) {
            const columnElement = document.createElement('div');
            const groupsArray = Array.isArray(columnGroups) ? columnGroups : [];

            for (const group of groupsArray) {
                const groupElement = createMenuGroupElement(group);
                if (groupElement) {
                    columnElement.appendChild(groupElement);
                }
            }

            if (columnElement.children.length > 0) {
                columnsWrapper.appendChild(columnElement);
            }
        }

        if (columnsWrapper.children.length > 0) {
            categoryCard.appendChild(columnsWrapper);
        } else {
            const placeholder = createInfoMessage('Menu akan segera tersedia.', 'menu-feedback');
            if (placeholder) {
                categoryCard.appendChild(placeholder);
            }
        }

        fragment.appendChild(categoryCard);
    }

    container.appendChild(fragment);
}

/**
 * Nama Fungsi: createMenuGroupElement
 * Keterangan: Membentuk daftar HTML untuk setiap grup menu (misal Aneka Mie, Lauk, dll).
 */
function createMenuGroupElement(group) {
    if (!group || typeof group !== 'object') {
        return null;
    }

    const heading = typeof group.heading === 'string' ? group.heading.trim() : '';
    const items = Array.isArray(group.items) ? group.items : [];

    if (!heading && items.length === 0) {
        return null;
    }

    const listElement = document.createElement('ul');
    listElement.className = 'menu-group';

    if (heading) {
        const headingItem = document.createElement('li');
        headingItem.className = 'menu-group-title';
        headingItem.textContent = heading;
        listElement.appendChild(headingItem);
    }

    for (const item of items) {
        if (!item || typeof item !== 'object') {
            continue;
        }

        const name = typeof item.name === 'string' ? item.name.trim() : '';
        const price = typeof item.price === 'string' || typeof item.price === 'number' ? String(item.price) : '';

        if (!name && !price) {
            continue;
        }

        const itemElement = document.createElement('li');
        itemElement.className = 'menu-group-item';

        if (name) {
            const nameSpan = document.createElement('span');
            nameSpan.className = 'menu-group-name';
            nameSpan.textContent = name;
            itemElement.appendChild(nameSpan);
        }

        if (price) {
            const priceSpan = document.createElement('span');
            priceSpan.className = 'menu-group-price';
            priceSpan.textContent = price;
            itemElement.appendChild(priceSpan);
        }

        listElement.appendChild(itemElement);
    }

    if (listElement.children.length === 0) {
        return null;
    }

    return listElement;
}

/**
 * Nama Fungsi: createInfoMessage
 * Keterangan: Membuat elemen paragraf sederhana untuk pesan status menu (loading/error/info).
 */
function createInfoMessage(message, className) {
    if (!message) {
        return null;
    }

    const paragraph = document.createElement('p');
    paragraph.className = className || 'menu-feedback';
    paragraph.textContent = message;
    return paragraph;
}
