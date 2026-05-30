// AniSphere App Logic

// Initial Mock Data (Pre-populated for a stunning first look)
const DEFAULT_ANIMES = [
    {
        id: "mock-1",
        title: "Sousou no Frieren",
        status: "completed",
        genre: "Aksiyon, Macera, Fantezi",
        currentEpisode: 28,
        totalEpisodes: 28,
        rating: 10,
        image: "https://i.pinimg.com/736x/01/cc/0a/01cc0a9a14de8b71d607e05206f364a2.jpg",
        notes: "Mükemmel ötesi bir yapım. Müzikleri, karakter gelişimleri ve animasyon kalitesi 10/10.",
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "mock-2",
        title: "Shingeki no Kyojin",
        status: "completed",
        genre: "Aksiyon, Dram, Gizem",
        currentEpisode: 87,
        totalEpisodes: 87,
        rating: 9.5,
        image: "https://i.pinimg.com/736x/a8/50/be/a850be85c30fbbe9a68bc0b784089069.jpg",
        notes: "Eren Yeager'ın özgürlük arayışı ve inanılmaz ters köşeler. Hikaye anlatımı bir başyapıt.",
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "mock-3",
        title: "Kimetsu no Yaiba: Hashira Training Arc",
        status: "watching",
        genre: "Aksiyon, Shonen, Fantezi",
        currentEpisode: 3,
        totalEpisodes: 8,
        rating: 8.5,
        image: "https://i.pinimg.com/736x/8a/a5/d8/8aa5d8cc8c1f96434ff143bd2b0662d5.jpg",
        notes: "Ufotable yine görsel şölen sunuyor. Muzan savaşı öncesi son hazırlıklar!",
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "mock-4",
        title: "Chainsaw Man",
        status: "plan-to-watch",
        genre: "Aksiyon, Doğaüstü, Karanlık Fantezi",
        currentEpisode: 0,
        totalEpisodes: 12,
        rating: 0,
        image: "https://i.pinimg.com/736x/e4/df/e3/e4dfe36c646efc54ad3d9c57d7cfb5d0.jpg",
        notes: "Mappa'nın en çılgın animelerinden biri olduğunu duydum, en kısa zamanda başlayacağım.",
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// App State
let animes = [];
let currentFilter = 'all';
let searchQuery = '';
let apiSearchTimeout = null;
let activeGenreFilter = null;
let activeFavoritesFilter = false;
let currentHeroIndex = 0;
let heroCarouselInterval = null;

// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const backupMenuBtn = document.getElementById('backup-menu-btn');
const addAnimeBtn = document.getElementById('add-anime-btn');
const emptyAddBtn = document.getElementById('empty-add-btn');
const searchInput = document.getElementById('search-input');
const filterTabs = document.querySelectorAll('.filter-tab');
const animeGrid = document.getElementById('anime-grid');
const emptyState = document.getElementById('empty-state');

// Modal Elements
const animeModal = document.getElementById('anime-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const animeForm = document.getElementById('anime-form');
const modalTitle = document.getElementById('modal-title');
const ratingRange = document.getElementById('anime-rating-range');
const ratingDisplay = document.getElementById('rating-val-display');

// Hidden & Input Fields in Modal
const animeIdField = document.getElementById('anime-id-field');
const animeNameInput = document.getElementById('anime-name-input');
const animeStatusSelect = document.getElementById('anime-status-select');
const animeGenreInput = document.getElementById('anime-genre-input');
const animeCurrentEp = document.getElementById('anime-current-ep');
const animeTotalEp = document.getElementById('anime-total-ep');
const animeImageInput = document.getElementById('anime-image-input');
const animeNotesInput = document.getElementById('anime-notes-input');

// Dropdown Action Buttons
const exportDataBtn = document.getElementById('export-data-btn');
const importDataFile = document.getElementById('import-data-file');

// Toast Notification System
function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Close on button click
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    });
    
    // Auto-remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

// Load Application State
function initApp() {
    // 1. Theme Configuration
    const savedTheme = localStorage.getItem('anisphere_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }

    // 2. Data Initialization
    const savedData = localStorage.getItem('anisphere_data');
    if (savedData) {
        try {
            animes = JSON.parse(savedData);
        } catch (e) {
            console.error("Veri yüklenirken hata oluştu, varsayılanlar yükleniyor.", e);
            animes = [...DEFAULT_ANIMES];
        }
    } else {
        animes = [...DEFAULT_ANIMES];
        saveToLocalStorage();
    }

    // Ensure all animes have isFavorite attribute
    animes.forEach(anime => {
        if (anime.isFavorite === undefined) {
            anime.isFavorite = false;
        }
    });

    // 3. Initial Render
    renderApp();
    setupEventListeners();
    printConsoleWatermark();
}

// Save data to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('anisphere_data', JSON.stringify(animes));
}

// Stats & Badges Calculation
function updateStats() {
    const total = animes.length;
    const completed = animes.filter(a => a.status === 'completed').length;
    const watching = animes.filter(a => a.status === 'watching').length;
    const planToWatch = animes.filter(a => a.status === 'plan-to-watch').length;
    const onHold = animes.filter(a => a.status === 'on-hold').length;
    const dropped = animes.filter(a => a.status === 'dropped').length;

    // Calculate Average Rating (exclude 0 ratings)
    const ratedAnimes = animes.filter(a => a.rating > 0);
    const avgRating = ratedAnimes.length > 0 
        ? (ratedAnimes.reduce((sum, a) => sum + Number(a.rating), 0) / ratedAnimes.length).toFixed(1) 
        : '0.0';

    // Update Stats Display
    document.getElementById('stat-total-anime').textContent = total;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-watching').textContent = watching;
    document.getElementById('stat-avg-rating').textContent = avgRating;

    // Update Sidebar/Filter Badges
    document.getElementById('badge-all').textContent = total;
    document.getElementById('badge-watching').textContent = watching;
    document.getElementById('badge-completed').textContent = completed;
    document.getElementById('badge-plan-to-watch').textContent = planToWatch;
    document.getElementById('badge-on-hold').textContent = onHold;
    document.getElementById('badge-dropped').textContent = dropped;
}

// Render Visual Statistics: SVG Doughnut Chart, Total Duration, and Top Genres
function renderVisualStats() {
    const total = animes.length;
    
    // 1. Total Duration Calculation (Average 24 mins per episode)
    const totalMinutes = animes.reduce((sum, a) => sum + (Number(a.currentEpisode) || 0) * 24, 0);
    const totalDays = Math.floor(totalMinutes / (24 * 60));
    const totalHours = Math.floor((totalMinutes % (24 * 60)) / 60);
    
    const durationValEl = document.getElementById('stat-total-duration');
    if (durationValEl) {
        if (totalMinutes > 0) {
            durationValEl.textContent = `${totalDays} gün, ${totalHours} saat`;
        } else {
            durationValEl.textContent = "0 gün, 0 saat";
        }
    }

    // 2. SVG Doughnut Chart Calculations
    const svgChart = document.getElementById('status-doughnut-chart');
    const legendEl = document.getElementById('chart-legend');
    const totalCountEl = document.getElementById('chart-total-count');
    
    if (svgChart && legendEl && totalCountEl) {
        totalCountEl.textContent = total;

        // Clear previous segments (all circle tags except donut-hole and donut-ring)
        const segments = svgChart.querySelectorAll('.donut-segment');
        segments.forEach(s => s.remove());

        // Count statuses
        const statusCounts = {
            'watching': animes.filter(a => a.status === 'watching').length,
            'completed': animes.filter(a => a.status === 'completed').length,
            'plan-to-watch': animes.filter(a => a.status === 'plan-to-watch').length,
            'on-hold': animes.filter(a => a.status === 'on-hold').length,
            'dropped': animes.filter(a => a.status === 'dropped').length
        };

        const statusLabels = {
            'watching': 'İzleniyor',
            'completed': 'Tamamlandı',
            'plan-to-watch': 'İzleyeceğim',
            'on-hold': 'Beklemede',
            'dropped': 'Bırakıldı'
        };

        const statusColors = {
            'watching': 'var(--status-watching)',
            'completed': 'var(--status-completed)',
            'plan-to-watch': 'var(--status-plan-to-watch)',
            'on-hold': 'var(--status-on-hold)',
            'dropped': 'var(--status-dropped)'
        };

        legendEl.innerHTML = '';

        if (total === 0) {
            // Draw a single fallback empty ring
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("class", "donut-segment");
            circle.setAttribute("cx", "21");
            circle.setAttribute("cy", "21");
            circle.setAttribute("r", "15.91549430918954");
            circle.setAttribute("fill", "transparent");
            circle.setAttribute("stroke", "var(--border-color)");
            circle.setAttribute("stroke-width", "3");
            svgChart.appendChild(circle);

            // Empty legend
            legendEl.innerHTML = '<div class="legend-item" style="justify-content:center; color:var(--text-muted);">Veri yok.</div>';
        } else {
            let currentOffset = 100; // Stroke-dashoffset starts from 100

            // Order: Completed, Watching, Plan to Watch, On Hold, Dropped
            const order = ['completed', 'watching', 'plan-to-watch', 'on-hold', 'dropped'];

            order.forEach(statusKey => {
                const count = statusCounts[statusKey];
                if (count === 0) return;

                const percent = (count / total) * 100;
                
                // SVG Circle segment
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("class", "donut-segment");
                circle.setAttribute("cx", "21");
                circle.setAttribute("cy", "21");
                circle.setAttribute("r", "15.91549430918954");
                circle.setAttribute("fill", "transparent");
                circle.setAttribute("stroke", statusColors[statusKey]);
                circle.setAttribute("stroke-width", "3");
                
                // Dasharray: [length of segment] [rest of circle]
                circle.setAttribute("stroke-dasharray", `${percent} ${100 - percent}`);
                circle.setAttribute("stroke-dashoffset", currentOffset);
                svgChart.appendChild(circle);

                // Update offset for next segment
                currentOffset -= percent;

                // Add to legend
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';
                legendItem.innerHTML = `
                    <div class="legend-color-label">
                        <span class="legend-dot ${statusKey}"></span>
                        <span>${statusLabels[statusKey]}</span>
                    </div>
                    <span class="legend-count">${count} (%${Math.round(percent)})</span>
                `;
                legendEl.appendChild(legendItem);
            });
        }
    }

    // 3. Genres Ranking Calculation
    const genresListEl = document.getElementById('genres-ranking-list');
    if (genresListEl) {
        genresListEl.innerHTML = '';
        
        // Compile all genres count
        const genresCount = {};
        animes.forEach(anime => {
            if (anime.genre) {
                anime.genre.split(',').forEach(g => {
                    const cleaned = g.trim();
                    if (cleaned.length > 0) {
                        // Case-insensitive title capitalization
                        const name = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
                        genresCount[name] = (genresCount[name] || 0) + 1;
                    }
                });
            }
        });

        // Convert to array and sort
        const sortedGenres = Object.entries(genresCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4); // Take top 4

        if (sortedGenres.length === 0) {
            genresListEl.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem; font-style:italic; padding-top:8px;">Tür bilgisi bulunmamaktadır.</div>';
        } else {
            const maxCount = sortedGenres[0][1]; // Highest count for scaling
            
            sortedGenres.forEach(([name, count]) => {
                const fillPercent = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                
                const row = document.createElement('div');
                row.className = 'genre-rank-row';
                row.innerHTML = `
                    <div class="genre-rank-info">
                        <span class="genre-rank-name">${escapeHTML(name)}</span>
                        <span class="genre-rank-count">${count} Seri</span>
                    </div>
                    <div class="genre-rank-bar-bg">
                        <div class="genre-rank-bar-fill" style="width: ${fillPercent}%"></div>
                    </div>
                `;
                genresListEl.appendChild(row);
            });
        }
    }
}

// Get candidates for hero carousel (up to top 4 highest rated/updated watching status)
function getHeroAnimes() {
    const activeCandidates = animes.filter(a => a.status === 'watching');
    
    return [...activeCandidates].sort((a, b) => {
        const scoreA = Number(a.rating) || 0;
        const scoreB = Number(b.rating) || 0;
        if (scoreB !== scoreA) {
            return scoreB - scoreA;
        }
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }).slice(0, 4);
}

// Start automatic slideshow interval
function startHeroCarousel() {
    stopHeroCarousel();
    heroCarouselInterval = setInterval(() => {
        const heroAnimes = getHeroAnimes();
        if (heroAnimes.length <= 1) return;
        const nextIndex = (currentHeroIndex + 1) % heroAnimes.length;
        goToHeroSlide(nextIndex);
    }, 6000);
}

// Stop automatic slideshow interval
function stopHeroCarousel() {
    if (heroCarouselInterval) {
        clearInterval(heroCarouselInterval);
        heroCarouselInterval = null;
    }
}

// Go to specific hero slide with fade transition
window.goToHeroSlide = function(index) {
    const heroAnimes = getHeroAnimes();
    if (heroAnimes.length === 0) return;
    
    const nextIndex = (index + heroAnimes.length) % heroAnimes.length;
    const heroCard = document.querySelector('.hero-banner-card');
    
    if (heroCard) {
        heroCard.classList.add('fade-transition');
        setTimeout(() => {
            currentHeroIndex = nextIndex;
            renderHeroBanner();
            startHeroCarousel(); // restart timer
        }, 250);
    } else {
        currentHeroIndex = nextIndex;
        renderHeroBanner();
        startHeroCarousel();
    }
};

// Render Cinematic Hero Banner Slideshow
function renderHeroBanner() {
    const heroContainer = document.getElementById('hero-banner-container');
    if (!heroContainer) return;

    const heroAnimes = getHeroAnimes();
    if (heroAnimes.length === 0) {
        heroContainer.style.display = 'none';
        stopHeroCarousel();
        return;
    }

    if (currentHeroIndex >= heroAnimes.length) {
        currentHeroIndex = 0;
    }

    const bestAnime = heroAnimes[currentHeroIndex];
    const ratingLabel = bestAnime.rating > 0 ? `⭐ ${bestAnime.rating}` : '⭐ Puan Yok';
    const statusLabels = {
        'watching': 'İzleniyor',
        'completed': 'Tamamlandı',
        'plan-to-watch': 'İzleyeceğim',
        'on-hold': 'Beklemede',
        'dropped': 'Bırakıldı'
    };

    const bgImage = bestAnime.image || '';
    const hasImage = !!bestAnime.image;

    // Dots/Indicators Navigation markup
    let dotsMarkup = '';
    if (heroAnimes.length > 1) {
        dotsMarkup = `
            <div class="hero-carousel-indicators">
                ${heroAnimes.map((anime, idx) => `
                    <button class="hero-dot ${idx === currentHeroIndex ? 'active' : ''}" onclick="goToHeroSlide(${idx})" title="${escapeHTML(anime.title)}"></button>
                `).join('')}
            </div>
        `;
    }

    heroContainer.innerHTML = `
        <div class="hero-banner-card" data-id="${bestAnime.id}">
            <div class="hero-banner-blur-bg" style="background-image: url('${escapeHTML(bgImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=95')}');"></div>
            ${hasImage ? `<img class="hero-banner-img" src="${escapeHTML(bgImage)}" alt="${escapeHTML(bestAnime.title)}" onerror="this.onerror=null; this.style.display='none'; this.previousElementSibling.style.display='none';">` : ''}
            <div class="hero-banner-overlay"></div>
            
            <div class="hero-banner-content">
                <div class="hero-banner-meta">
                    <span class="card-badge badge-${bestAnime.status}">${statusLabels[bestAnime.status]}</span>
                    <span class="card-rating-float" style="position: static; border: 1px solid rgba(245, 158, 11, 0.2); background: rgba(0, 0, 0, 0.5);">${ratingLabel}</span>
                    <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Bölüm: ${bestAnime.currentEpisode} / ${bestAnime.totalEpisodes > 0 ? bestAnime.totalEpisodes : '∞'}</span>
                </div>
                
                <h2 class="hero-banner-title" title="${escapeHTML(bestAnime.title)}">${escapeHTML(bestAnime.title)}</h2>
                
                <p class="hero-banner-desc">${escapeHTML(bestAnime.notes || 'Bu anime için henüz kişisel not veya açıklama eklenmemiş. Modal formundan not ekleyebilirsiniz.')}</p>
                
                <button class="btn btn-primary hero-banner-btn" onclick="quickIncrement('${bestAnime.id}', event)" ${bestAnime.totalEpisodes > 0 && bestAnime.currentEpisode >= bestAnime.totalEpisodes ? 'disabled' : ''}>
                    <svg class="icon" style="width: 16px; height: 16px;"><use href="#icon-plus"></use></svg>
                    <span>İzlemeye Devam Et ( +1 )</span>
                </button>
            </div>
            ${dotsMarkup}
        </div>
    `;
    heroContainer.style.display = 'block';

    // Start auto carousel if multiple items are present
    if (heroAnimes.length > 1 && !heroCarouselInterval) {
        startHeroCarousel();
    } else if (heroAnimes.length <= 1) {
        stopHeroCarousel();
    }
}

// Main Render Function
function renderApp() {
    updateStats();
    renderVisualStats();
    renderHeroBanner();
    
    // Filter and Search data
    const filteredAnimes = animes.filter(anime => {
        const matchesStatus = currentFilter === 'all' || anime.status === currentFilter;
        const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (anime.genre && anime.genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
                             (anime.notes && anime.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesGenreCard = !activeGenreFilter || (anime.genre && anime.genre.toLowerCase().includes(activeGenreFilter.toLowerCase()));
        const matchesFavorites = !activeFavoritesFilter || anime.isFavorite;
        return matchesStatus && matchesSearch && matchesGenreCard && matchesFavorites;
    });

    // Handle Empty States
    if (filteredAnimes.length === 0) {
        animeGrid.style.display = 'none';
        emptyState.style.display = 'flex';
        
        const emptyIllustration = emptyState.querySelector('.empty-illustration');
        const emptyTitle = emptyState.querySelector('h3');
        const emptyDesc = emptyState.querySelector('p');
        const emptyBtn = document.getElementById('empty-add-btn');
        
        if (animes.length === 0) {
            // Truly empty database
            if (emptyIllustration) emptyIllustration.textContent = '🪐';
            if (emptyTitle) emptyTitle.textContent = 'Burada henüz bir şey yok...';
            if (emptyDesc) emptyDesc.textContent = 'Listenize ilk animeyi eklemek için sağ üstteki butonla başlayın.';
            if (emptyBtn) {
                emptyBtn.textContent = 'İlk Animenizi Ekleyin';
                emptyBtn.onclick = openAddModal;
            }
        } else {
            // Filters returned 0 results
            if (emptyIllustration) emptyIllustration.textContent = '🔍';
            if (emptyTitle) emptyTitle.textContent = 'Eşleşen anime bulunamadı';
            if (emptyDesc) emptyDesc.textContent = 'Arama sorgunuzu değiştirin veya aktif durum ve tür filtrelerini temizleyin.';
            if (emptyBtn) {
                emptyBtn.textContent = 'Filtreleri Temizle';
                emptyBtn.onclick = window.clearAllFilters;
            }
        }
    } else {
        emptyState.style.display = 'none';
        animeGrid.style.display = 'grid';
        
        animeGrid.innerHTML = '';
        filteredAnimes.forEach(anime => {
            const card = createAnimeCardElement(anime);
            animeGrid.appendChild(card);
        });
    }
}

// Global filter reset helper
window.clearAllFilters = function() {
    searchQuery = '';
    currentFilter = 'all';
    activeGenreFilter = null;
    activeFavoritesFilter = false;
    
    // Reset inputs & tab states
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(t => {
        if (t.getAttribute('data-status') === 'all') {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });
    
    const genreCards = document.querySelectorAll('.genre-explore-card');
    genreCards.forEach(c => c.classList.remove('active'));
    
    const favoriteFilterBtn = document.getElementById('favorite-filter-btn');
    if (favoriteFilterBtn) {
        favoriteFilterBtn.classList.remove('active');
    }
    
    renderApp();
    showToast("Tüm filtreler başarıyla temizlendi.", "info", 1500);
};

// Create Card Element
function createAnimeCardElement(anime) {
    const card = document.createElement('div');
    card.className = `anime-card`;
    card.setAttribute('data-id', anime.id);

    // Calculate progress percentage
    const progressPercent = anime.totalEpisodes > 0 
        ? Math.min(100, Math.round((anime.currentEpisode / anime.totalEpisodes) * 100)) 
        : 0;

    // Format rating label
    const ratingLabel = anime.rating > 0 ? `⭐ ${anime.rating}` : '⭐ Puan Yok';

    // Cover image markup
    let posterMarkup = '';
    if (anime.image) {
        posterMarkup = `
            <div class="poster-blur-bg" style="background-image: url('${escapeHTML(anime.image)}');"></div>
            <img src="${escapeHTML(anime.image)}" alt="${escapeHTML(anime.title)}" onerror="this.onerror=null; this.className='hidden'; this.previousElementSibling.style.display='none'; this.nextElementSibling.style.display='flex';">
        `;
    }
    const placeholderMarkup = `
        <div class="poster-placeholder" style="${anime.image ? 'display:none;' : ''}">
            ${escapeHTML(anime.title.charAt(0).toUpperCase())}
        </div>
    `;

    // Status classes
    const statusLabels = {
        'watching': 'İzleniyor',
        'completed': 'Tamamlandı',
        'plan-to-watch': 'İzleyeceğim',
        'on-hold': 'Beklemede',
        'dropped': 'Bırakıldı'
    };

    // Genres markup
    const genresList = anime.genre ? anime.genre.split(',').map(g => g.trim()).filter(g => g.length > 0) : [];
    const genresMarkup = genresList.map(g => `<span class="genre-badge">${escapeHTML(g)}</span>`).join('');

    card.innerHTML = `
        <div class="card-poster">
            <span class="card-badge badge-${anime.status}">${statusLabels[anime.status]}</span>
            <span class="card-rating-float">${ratingLabel}</span>
            <button class="card-favorite-btn ${anime.isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${anime.id}')" title="Favorilere Ekle/Kaldır">
                <svg class="icon"><use href="#icon-star"></use></svg>
            </button>
            ${posterMarkup}
            ${placeholderMarkup}
        </div>
        
        <div class="card-body">
            <h3 class="card-title" title="${escapeHTML(anime.title)}">${escapeHTML(anime.title)}</h3>
            <div class="card-genres">
                ${genresMarkup || '<span class="genre-badge">Etiket Yok</span>'}
            </div>
            
            <div class="card-progress-section">
                <div class="progress-header">
                    <span>Bölüm: ${anime.currentEpisode} / ${anime.totalEpisodes > 0 ? anime.totalEpisodes : '∞'}</span>
                    <span>${progressPercent}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                </div>
            </div>
        </div>

        <div class="card-footer">
            <div class="action-left">
                <button class="card-action-btn edit-btn" title="Düzenle" onclick="openEditModal('${anime.id}')">
                    <svg class="icon"><use href="#icon-edit"></use></svg>
                </button>
                <button class="card-action-btn delete-btn" title="Sil" onclick="triggerDelete('${anime.id}')">
                    <svg class="icon"><use href="#icon-trash"></use></svg>
                </button>
            </div>
            
            <button class="increment-btn" onclick="quickIncrement('${anime.id}', event)" ${anime.totalEpisodes > 0 && anime.currentEpisode >= anime.totalEpisodes ? 'disabled' : ''}>
                <svg class="icon" style="width:14px; height:14px;"><use href="#icon-plus"></use></svg>
                <span>Bölüm Ekle</span>
            </button>
        </div>
    `;

    // Make card cover image/placeholder clickable for preview (Lightbox & Notes view)
    const posterEl = card.querySelector('.card-poster');
    if (posterEl) {
        posterEl.classList.add('clickable');
        posterEl.addEventListener('click', (e) => {
            // Prevent lightbox trigger if clicking badges, rating float or favorite button
            if (e.target.closest('.card-badge') || e.target.closest('.card-rating-float') || e.target.closest('.card-favorite-btn')) {
                return;
            }
            openImageLightbox(anime.image, anime.title, anime.notes);
        });
    }

    return card;
}

// Helpers
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Spawn floating +1 animation at click position
function spawnPlusOneAnimation(event) {
    if (!event) return;
    
    const plusOne = document.createElement('div');
    plusOne.className = 'floating-plus-one';
    plusOne.textContent = '+1';
    
    // Position at cursor
    plusOne.style.left = `${event.clientX}px`;
    plusOne.style.top = `${event.clientY}px`;
    
    document.body.appendChild(plusOne);
    
    // Remove after animation finishes (800ms)
    setTimeout(() => {
        plusOne.remove();
    }, 800);
}

// Quick increment (+1 episode)
window.quickIncrement = function(id, event) {
    const animeIndex = animes.findIndex(a => a.id === id);
    if (animeIndex === -1) return;

    const anime = animes[animeIndex];
    let showCompletedToast = false;

    if (anime.totalEpisodes > 0 && anime.currentEpisode >= anime.totalEpisodes) {
        showToast("Zaten tüm bölümleri izlediniz!", "info");
        return;
    }

    // Spawn flight animation
    if (event) {
        spawnPlusOneAnimation(event);
    }

    anime.currentEpisode++;
    anime.updatedAt = new Date().toISOString();

    // Auto complete check
    if (anime.totalEpisodes > 0 && anime.currentEpisode === anime.totalEpisodes) {
        anime.status = 'completed';
        showCompletedToast = true;
    }

    saveToLocalStorage();
    renderApp();

    if (showCompletedToast) {
        showToast(`Tebrikler! ${anime.title} serisini tamamladınız! 🎉`, "success");
    } else {
        showToast(`${anime.title} - Bölüm ${anime.currentEpisode} kaydedildi.`, "success", 2000);
    }
};

// Toggle favorite status of anime
window.toggleFavorite = function(id) {
    const animeIndex = animes.findIndex(a => a.id === id);
    if (animeIndex === -1) return;

    const anime = animes[animeIndex];
    anime.isFavorite = !anime.isFavorite;
    anime.updatedAt = new Date().toISOString();

    saveToLocalStorage();
    renderApp();

    if (anime.isFavorite) {
        showToast(`"${anime.title}" favorilere eklendi. ⭐`, "success", 2000);
    } else {
        showToast(`"${anime.title}" favorilerden kaldırıldı.`, "info", 2000);
    }
};

// Modal functions
function openAddModal() {
    modalTitle.textContent = "Yeni Anime Ekle";
    animeIdField.value = "";
    animeForm.reset();
    ratingRange.value = 0;
    ratingDisplay.textContent = "Puan Yok";
    
    // Show API Search
    const searchContainer = document.getElementById('api-search-container');
    const searchDivider = document.getElementById('api-search-divider');
    if (searchContainer && searchDivider) {
        searchContainer.style.display = 'flex';
        searchDivider.style.display = 'block';
    }
    
    // Clear API Search
    const apiInput = document.getElementById('api-search-input');
    const apiDropdown = document.getElementById('api-results-dropdown');
    if (apiInput) apiInput.value = '';
    if (apiDropdown) {
        apiDropdown.style.display = 'none';
        apiDropdown.innerHTML = '';
    }

    animeModal.classList.add('active');
}

window.openEditModal = function(id) {
    const anime = animes.find(a => a.id === id);
    if (!anime) return;

    modalTitle.textContent = "Animeyi Düzenle";
    animeIdField.value = anime.id;
    animeNameInput.value = anime.title;
    animeStatusSelect.value = anime.status;
    animeGenreInput.value = anime.genre;
    animeCurrentEp.value = anime.currentEpisode;
    animeTotalEp.value = anime.totalEpisodes;
    animeImageInput.value = anime.image;
    animeNotesInput.value = anime.notes || "";
    
    ratingRange.value = anime.rating;
    ratingDisplay.textContent = anime.rating > 0 ? `${anime.rating} / 10` : "Puan Yok";

    // Hide API Search for Editing
    const searchContainer = document.getElementById('api-search-container');
    const searchDivider = document.getElementById('api-search-divider');
    if (searchContainer && searchDivider) {
        searchContainer.style.display = 'none';
        searchDivider.style.display = 'none';
    }

    animeModal.classList.add('active');
};

function closeModal() {
    animeModal.classList.remove('active');
}

window.triggerDelete = function(id) {
    const anime = animes.find(a => a.id === id);
    if (!anime) return;
    
    if (confirm(`"${anime.title}" serisini listenizden silmek istediğinize emin misiniz?`)) {
        deleteAnime(id);
    }
};

function deleteAnime(id) {
    const animeIndex = animes.findIndex(a => a.id === id);
    if (animeIndex === -1) return;

    const title = animes[animeIndex].title;
    animes.splice(animeIndex, 1);
    
    saveToLocalStorage();
    renderApp();
    showToast(`"${title}" başarıyla silindi.`, "info");
}

// Event Listeners Setup
function setupEventListeners() {
    // Add Anime buttons
    addAnimeBtn.addEventListener('click', openAddModal);
    emptyAddBtn.addEventListener('click', openAddModal);
    
    // Modal close events
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    animeModal.addEventListener('click', (e) => {
        if (e.target === animeModal) closeModal();
    });

    // API Search Keyboard Debounce
    const apiSearchInput = document.getElementById('api-search-input');
    const apiResultsDropdown = document.getElementById('api-results-dropdown');

    if (apiSearchInput) {
        apiSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(apiSearchTimeout);
            
            if (query.length < 3) {
                if (apiResultsDropdown) apiResultsDropdown.style.display = 'none';
                return;
            }

            apiSearchTimeout = setTimeout(() => {
                searchAnimeAPI(query);
            }, 600);
        });
    }

    // Close API search dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (apiResultsDropdown && apiSearchInput && !apiSearchInput.contains(e.target) && !apiResultsDropdown.contains(e.target)) {
            apiResultsDropdown.style.display = 'none';
        }
    });

    // Rating Slider Change display
    ratingRange.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (val === 0) {
            ratingDisplay.textContent = "Puan Yok";
        } else {
            ratingDisplay.textContent = `${val} / 10`;
        }
    });

    // Auto-fill episodes when status changes to Completed
    animeStatusSelect.addEventListener('change', (e) => {
        if (e.target.value === 'completed') {
            const totalEpVal = parseInt(animeTotalEp.value) || 0;
            if (totalEpVal > 0) {
                animeCurrentEp.value = totalEpVal;
            }
        }
    });

    // Auto-change status to completed when current episodes match total episodes in the form
    animeCurrentEp.addEventListener('input', () => {
        const currentEpVal = parseInt(animeCurrentEp.value) || 0;
        const totalEpVal = parseInt(animeTotalEp.value) || 0;
        if (totalEpVal > 0 && currentEpVal >= totalEpVal) {
            animeStatusSelect.value = 'completed';
        }
    });
    animeTotalEp.addEventListener('input', () => {
        const currentEpVal = parseInt(animeCurrentEp.value) || 0;
        const totalEpVal = parseInt(animeTotalEp.value) || 0;
        if (totalEpVal > 0 && currentEpVal >= totalEpVal) {
            animeStatusSelect.value = 'completed';
        }
    });

    // Handle Form Submit
    animeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = animeIdField.value;
        const title = animeNameInput.value.trim();
        let status = animeStatusSelect.value;
        const genre = animeGenreInput.value.trim();
        const currentEp = Math.max(0, parseInt(animeCurrentEp.value) || 0);
        const totalEp = Math.max(0, parseInt(animeTotalEp.value) || 0);
        const image = animeImageInput.value.trim();
        const notes = animeNotesInput.value.trim();
        const rating = Number(ratingRange.value);

        if (!title) {
            showToast("Lütfen anime adını girin.", "error");
            return;
        }

        // Logical checks
        let finalStatus = status;
        if (totalEp > 0 && currentEp >= totalEp) {
            finalStatus = 'completed';
        }

        const animeData = {
            title,
            status: finalStatus,
            genre,
            currentEpisode: currentEp,
            totalEpisodes: totalEp,
            image,
            notes,
            rating,
            updatedAt: new Date().toISOString()
        };

        if (id) {
            // Edit existing
            const index = animes.findIndex(a => a.id === id);
            if (index !== -1) {
                animes[index] = { ...animes[index], ...animeData };
                showToast(`"${title}" başarıyla güncellendi.`, "success");
            }
        } else {
            // Add new
            const newAnime = {
                id: 'anime-' + Date.now(),
                ...animeData,
                createdAt: new Date().toISOString()
            };
            animes.unshift(newAnime);
            showToast(`"${title}" listenize eklendi.`, "success");
        }

        saveToLocalStorage();
        closeModal();
        renderApp();
    });

    // Filter Tabs behavior
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-status');
            renderApp();
        });
    });

    // Favorite Filter Button behavior
    const favoriteFilterBtn = document.getElementById('favorite-filter-btn');
    if (favoriteFilterBtn) {
        favoriteFilterBtn.addEventListener('click', () => {
            activeFavoritesFilter = !activeFavoritesFilter;
            favoriteFilterBtn.classList.toggle('active', activeFavoritesFilter);
            renderApp();
            if (activeFavoritesFilter) {
                showToast("Sadece favoriler filtrelendi.", "success", 1500);
            } else {
                showToast("Favori filtresi kaldırıldı.", "info", 1500);
            }
        });
    }

    // Search input search query
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderApp();
    });

    // Theme Toggle click
    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('anisphere_theme', 'light');
            showToast("Aydınlık mod aktif.", "info", 1500);
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('anisphere_theme', 'dark');
            showToast("Karanlık mod aktif.", "info", 1500);
        }
    });

    // Dropdown toggle action
    backupMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        backupMenuBtn.parentElement.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(d => d.classList.remove('active'));
    });

    // Export Data JSON with Furkan Batu metadata signature
    exportDataBtn.addEventListener('click', () => {
        const packageData = {
            crafted_by: "Furkan Batu",
            system_version: "Faz 6.0 Premium",
            exportDate: new Date().toISOString(),
            data: animes
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packageData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `anisphere_yedek_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Veri yedeği Furkan Batu imzasıyla başarıyla indirildi. 📂", "success");
    });

    // Import Data JSON supporting legacy list and signed package backups
    importDataFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const parsed = JSON.parse(evt.target.result);
                let animeList = null;
                
                if (Array.isArray(parsed)) {
                    animeList = parsed;
                } else if (parsed && Array.isArray(parsed.data)) {
                    animeList = parsed.data;
                    if (parsed.crafted_by) {
                        showToast(`Geliştirici ${parsed.crafted_by} imzalı yedek tespit edildi. 🛡️`, "info", 2000);
                    }
                }
                
                if (animeList) {
                    // Simple validation check: each must have title
                    const isValid = animeList.every(item => item.title && typeof item.title === 'string');
                    if (isValid) {
                        animes = animeList;
                        animes.forEach(anime => {
                            if (anime.isFavorite === undefined) {
                                anime.isFavorite = false;
                            }
                        });
                        saveToLocalStorage();
                        renderApp();
                        showToast(`Başarıyla ${animeList.length} anime aktarıldı!`, "success");
                    } else {
                        showToast("Geçersiz yedek dosyası yapısı.", "error");
                    }
                } else {
                    showToast("Yedek dosyası liste veya imzalı veri paketi biçiminde olmalıdır.", "error");
                }
            } catch (err) {
                showToast("Yedek dosyası okunurken hata: " + err.message, "error");
            }
        };
        reader.readAsText(file);
        
        // Reset file value so it triggers change even for same file
        importDataFile.value = '';
    });

    // Clear Data completely
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm("Tüm anime listeniz ve istatistikleriniz sıfırlanacaktır. Bu işlem geri alınamaz. Emin misiniz?")) {
                animes = [];
                saveToLocalStorage();
                renderApp();
                showToast("Tüm veriler başarıyla sıfırlandı.", "info");
            }
        });
    }

    // Genre Explore Card click handlers (Inspired by Deokwave.com)
    const genreCards = document.querySelectorAll('.genre-explore-card');
    genreCards.forEach(card => {
        card.addEventListener('click', () => {
            const genre = card.getAttribute('data-genre');
            
            if (card.classList.contains('active')) {
                card.classList.remove('active');
                activeGenreFilter = null;
                showToast("Tür filtresi kaldırıldı.", "info", 1500);
            } else {
                genreCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                activeGenreFilter = genre;
                showToast(`"${genre}" türü filtrelendi.`, "success", 1500);
            }
            renderApp();
        });
    });

    // Lightbox modal listeners
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.id === 'lightbox-close-btn') {
                closeImageLightbox();
            }
        });
    }

    // Developer modal listeners
    const devModal = document.getElementById('dev-modal');
    const devModalCloseBtn = document.getElementById('dev-modal-close-btn');
    if (devModalCloseBtn) devModalCloseBtn.addEventListener('click', closeDevModal);
    if (devModal) {
        devModal.addEventListener('click', (e) => {
            if (e.target === devModal) closeDevModal();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const lightbox = document.getElementById('image-lightbox');
            const apiResultsDropdown = document.getElementById('api-results-dropdown');
            const devModal = document.getElementById('dev-modal');
            
            if (lightbox && lightbox.classList.contains('active')) {
                closeImageLightbox();
            } else if (apiResultsDropdown && apiResultsDropdown.style.display === 'flex') {
                apiResultsDropdown.style.display = 'none';
            } else if (devModal && devModal.classList.contains('active')) {
                closeDevModal();
            } else {
                closeModal();
            }
        }
    });
}

// Search Jikan API
function searchAnimeAPI(query) {
    const spinner = document.getElementById('api-search-spinner');
    const dropdown = document.getElementById('api-results-dropdown');
    
    if (!spinner || !dropdown) return;

    spinner.style.display = 'block';
    dropdown.style.display = 'none';

    fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`)
        .then(response => {
            if (!response.ok) {
                throw new Error("API limit or connection issue.");
            }
            return response.json();
        })
        .then(res => {
            spinner.style.display = 'none';
            dropdown.innerHTML = '';

            if (res.data && res.data.length > 0) {
                dropdown.style.display = 'flex';
                
                res.data.forEach(item => {
                    const genres = item.genres ? item.genres.map(g => g.name).join(', ') : 'Belirtilmemiş';
                    const epInfo = item.episodes ? `${item.episodes} Bölüm` : 'Bilinmiyor';
                    const title = item.title_english && item.title_english !== item.title ? `${item.title} (${item.title_english})` : item.title;
                    
                    const div = document.createElement('div');
                    div.className = 'api-result-item';
                    div.innerHTML = `
                        <img class="api-result-img" src="${item.images.jpg.image_url}" alt="${escapeHTML(item.title)}">
                        <div class="api-result-info">
                            <span class="api-result-title" title="${escapeHTML(title)}">${escapeHTML(title)}</span>
                            <span class="api-result-meta">${escapeHTML(epInfo)} • ${escapeHTML(genres)}</span>
                        </div>
                    `;

                    // Click event to fill form
                    div.addEventListener('click', () => {
                        animeNameInput.value = item.title;
                        animeTotalEp.value = item.episodes || 0;
                        animeGenreInput.value = item.genres ? item.genres.map(g => g.name).join(', ') : '';
                        
                        // Select WebP HD large image if available, else JPG HD large image, else default JPG image
                        animeImageInput.value = (item.images.webp && item.images.webp.large_image_url) || 
                                                (item.images.jpg && item.images.jpg.large_image_url) || 
                                                (item.images.jpg && item.images.jpg.image_url) || '';
                        
                        if (item.synopsis) {
                            animeNotesInput.value = item.synopsis.slice(0, 160) + '...';
                        } else {
                            animeNotesInput.value = '';
                        }

                        dropdown.style.display = 'none';
                        const apiInput = document.getElementById('api-search-input');
                        if (apiInput) apiInput.value = '';
                        showToast(`"${item.title}" bilgileri otomatik dolduruldu!`, 'success');
                    });

                    dropdown.appendChild(div);
                });
            } else {
                dropdown.style.display = 'none';
            }
        })
        .catch(err => {
            console.error("API Error: ", err);
            spinner.style.display = 'none';
            dropdown.style.display = 'none';
            showToast("Arama başarısız (API limiti aşılmış olabilir).", "error");
        });
}

// Image Lightbox Functions
window.openImageLightbox = function(src, title, notes) {
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxNotes = document.getElementById('lightbox-notes');
    
    if (lightbox) {
        if (lightboxImg) {
            if (src) {
                lightboxImg.src = src;
                lightboxImg.style.display = 'block';
            } else {
                lightboxImg.src = '';
                lightboxImg.style.display = 'none';
            }
        }
        if (lightboxCaption) {
            lightboxCaption.textContent = title || "";
        }
        if (lightboxNotes) {
            lightboxNotes.textContent = notes || "Bu anime için eklenmiş bir kişisel not bulunmuyor.";
        }
        lightbox.classList.add('active');
    }
};

window.closeImageLightbox = function() {
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        // Clear image src and notes after transition to avoid blink next time it opens
        setTimeout(() => {
            const lightboxImg = document.getElementById('lightbox-img');
            const lightboxNotes = document.getElementById('lightbox-notes');
            if (lightboxImg) lightboxImg.src = '';
            if (lightboxNotes) lightboxNotes.textContent = '';
        }, 300);
    }
};

// Developer Easter Eggs & Profile Modal Functions
window.openDevModal = function() {
    const devModal = document.getElementById('dev-modal');
    if (devModal) devModal.classList.add('active');
};

window.closeDevModal = function() {
    const devModal = document.getElementById('dev-modal');
    if (devModal) devModal.classList.remove('active');
};

let logoClickCount = 0;
let logoClickTimeout = null;

window.handleLogoClick = function() {
    logoClickCount++;
    clearTimeout(logoClickTimeout);
    
    logoClickTimeout = setTimeout(() => {
        logoClickCount = 0;
    }, 2000);
    
    if (logoClickCount === 5) {
        logoClickCount = 0;
        triggerLogoConfetti();
    }
};

function triggerLogoConfetti() {
    showToast("🎉 AniSphere Geliştiricisi Furkan Batu selamlarını iletir! 🚀", "success", 4000);
    
    const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
    
    // Spawn 80 particles
    for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        
        // Random sizes and colors
        const size = Math.random() * 8 + 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Start near the logo at top left
        particle.style.left = '80px';
        particle.style.top = '40px';
        
        // Random direction angles
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 320 + 100;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance + 120;
        const rot = Math.random() * 720 - 360;
        
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        particle.style.setProperty('--rot', `${rot}deg`);
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 2500);
    }
}

function printConsoleWatermark() {
    const asciiArt = `
 █████╗ ███╗   ██╗██╗███████╗██████╗ ██╗  ██╗███████╗██████╗ ███████╗
██╔══██╗████╗  ██║██║██╔════╝██╔══██╗██║  ██║██╔════╝██╔══██╗██╔════╝
███████║██╔██╗ ██║██║███████╗██████╔╝███████║█████╗  ██████╔╝█████╗  
██╔══██║██║╚██╗██║██║╚════██║██╔═══╝ ██╔══██║██╔══╝  ██╔══██╗██╔══╝  
██║  ██║██║ ╚████║██║███████║██║     ██║  ██║███████╗██║  ██║███████╗
╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
    `;
    console.log(
        `%c${asciiArt}%c\\n✨ Crafted with 💜 by Furkan Batu ✨\\n👉 Check out my work: https://github.com/batufurkan`,
        "color: #8b5cf6; font-weight: bold; font-family: monospace; text-shadow: 0 0 5px rgba(139, 92, 246, 0.4);",
        "color: #ec4899; font-size: 14px; font-weight: bold; font-family: sans-serif;"
    );
}

// Initialise Application
document.addEventListener('DOMContentLoaded', initApp);
// Fallback for cases when DOMContentLoaded is already fired
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initApp();
}
