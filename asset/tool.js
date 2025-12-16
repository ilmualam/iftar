/**
 * Niat Puasa & Doa Berbuka Ramadan 2026 - Interactive Audio Tool
 * Version: 1.0.0
 * Author: ilmualam.com
 * License: MIT
 * 
 * Features:
 * - Audio playback with synchronized text highlighting
 * - Progress tracking with localStorage persistence
 * - Bookmark system
 * - Daily streak counter
 * - Achievement badges
 * - Mobile-responsive design
 * - Domain protection
 */

(function() {
    'use strict';

    // Domain protection
    const allowedDomains = ['ilmualam.com', 'localhost', '127.0.0.1', 'blogger.com', 'blogspot.com'];
    const currentDomain = window.location.hostname;
    
    if (!allowedDomains.some(d => currentDomain.includes(d))) {
        console.warn('Tool ini hanya boleh digunakan di ilmualam.com');
        return;
    }

    // Tool Configuration
    const CONFIG = {
        version: '1.0.0',
        storageKey: 'ilmualam_niat_puasa_2026',
        brandColors: {
            primary: '#249749',
            dark: '#0c3808',
            light: '#f0fdf4',
            accent: '#fbbf24'
        }
    };

    // Data: All Niat and Doa content
    const DOA_DATA = {
        niat_harian: {
            id: 'niat_harian',
            title: 'Niat Puasa Harian',
            category: 'niat',
            arabic: 'نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلّٰهِ تَعَالٰى',
            transliteration: "Nawaitu sauma ghadin 'an adā'i fardhi syahri Ramadhāna hādzihis sanati lillāhi ta'ālā",
            meaning: 'Sahaja aku berpuasa esok hari untuk menunaikan fardhu bulan Ramadan tahun ini kerana Allah Ta\'ala.',
            source: 'Mazhab Syafi\'i - JAKIM',
            audioUrl: null, // Will be populated if audio available
            importance: 'wajib'
        },
        niat_sebulan: {
            id: 'niat_sebulan',
            title: 'Niat Puasa Sebulan Penuh',
            category: 'niat',
            arabic: 'نَوَيْتُ صَوْمَ جَمِيْعِ شَهْرِ رَمَضَانِ هٰذِهِ السَّنَةِ فَرْضًا لِلّٰهِ تَعَالٰى',
            transliteration: "Nawaitu sauma jamī'i syahri Ramadhāna hādzihis sanati fardhan lillāhi ta'ālā",
            meaning: 'Sahaja aku berpuasa sepanjang bulan Ramadan tahun ini fardhu kerana Allah Ta\'ala.',
            source: 'Mazhab Maliki - Backup',
            audioUrl: null,
            importance: 'sunat'
        },
        berbuka_sahih: {
            id: 'berbuka_sahih',
            title: 'Doa Berbuka (Paling Sahih)',
            category: 'berbuka',
            arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللهُ',
            transliteration: "Dzahabazh-zhama'u wabtallatil-'urūqu wa tsabatal-ajru in syā Allāh",
            meaning: 'Telah hilang dahaga, telah basah kerongkongan, dan telah ditetapkan pahala insya Allah.',
            source: 'HR Abu Daud no. 2357 (Hasan)',
            audioUrl: null,
            importance: 'sahih'
        },
        berbuka_jakim: {
            id: 'berbuka_jakim',
            title: 'Doa Berbuka (JAKIM)',
            category: 'berbuka',
            arabic: 'اَللّٰهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِيْنَ',
            transliteration: "Allāhumma laka shumtu wa bika āmantu wa 'alā rizqika afthartu birahmatika yā Arhamar-Rāhimīn",
            meaning: 'Ya Allah, kerana-Mu aku berpuasa, dengan-Mu aku beriman, kepada-Mu aku berserah, dan dengan rezeki-Mu aku berbuka, dengan rahmat-Mu ya Allah Tuhan yang Maha Pengasih.',
            source: 'JAKIM Malaysia',
            audioUrl: null,
            importance: 'popular'
        },
        berbuka_ringkas: {
            id: 'berbuka_ringkas',
            title: 'Doa Berbuka (Ringkas)',
            category: 'berbuka',
            arabic: 'اَللّٰهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
            transliteration: "Allāhumma laka shumtu wa 'alā rizqika afthartu",
            meaning: 'Ya Allah, untuk-Mu aku berpuasa, dan dengan rezeki-Mu aku berbuka.',
            source: 'HR Abu Daud no. 2358',
            audioUrl: null,
            importance: 'mudah'
        },
        berbuka_jemaah: {
            id: 'berbuka_jemaah',
            title: 'Doa Berbuka (Beramai-ramai)',
            category: 'berbuka',
            arabic: 'اَللّٰهُمَّ لَكَ صُمْنَا وَبِكَ آمَنَّا وَعَلَى رِزْقِكَ أَفْطَرْنَا بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِيْنَ',
            transliteration: "Allāhumma laka shumnā wa bika āmannā wa 'alā rizqika aftharnā birahmatika yā Arhamar-Rāhimīn",
            meaning: 'Ya Allah, kerana-Mu kami berpuasa, dengan-Mu kami beriman, dan dengan rezeki-Mu kami berbuka, dengan rahmat-Mu ya Allah Tuhan yang Maha Pengasih.',
            source: 'Versi Jemaah/Keluarga',
            audioUrl: null,
            importance: 'jemaah'
        },
        berbuka_ampun: {
            id: 'berbuka_ampun',
            title: 'Doa Permohonan Ampun',
            category: 'berbuka',
            arabic: 'اَللّٰهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ أَنْ تَغْفِرَ لِي',
            transliteration: "Allāhumma innī as'aluka birahmatikallatī wasi'at kulla syai'in an taghfira lī",
            meaning: 'Ya Allah, aku memohon kepada-Mu dengan rahmat-Mu yang meliputi segala sesuatu, agar Engkau mengampuniku.',
            source: 'HR Ibnu Majah',
            audioUrl: null,
            importance: 'istimewa'
        },
        sahur_sebelum: {
            id: 'sahur_sebelum',
            title: 'Doa Sebelum Sahur',
            category: 'sahur',
            arabic: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ، اَللّٰهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
            transliteration: "Bismillāhir-Rahmānir-Rahīm, Allāhumma bārik lanā fīmā razaqtanā wa qinā 'adzāban-nār",
            meaning: 'Dengan nama Allah yang Maha Pemurah lagi Maha Penyayang. Ya Allah, berkatilah rezeki yang Engkau berikan kepada kami dan lindungilah kami dari azab api neraka.',
            source: 'Doa Makan + Permohonan',
            audioUrl: null,
            importance: 'sahur'
        },
        sahur_semasa: {
            id: 'sahur_semasa',
            title: 'Doa Semasa Sahur',
            category: 'sahur',
            arabic: 'يَرْحَمُ اللهُ الْمُتَسَحِّرِيْنَ',
            transliteration: "Yarhamullāhul-mutasahhirīn",
            meaning: 'Semoga Allah menurunkan rahmat-Nya bagi mereka yang bersahur.',
            source: 'HR al-Thabarani',
            audioUrl: null,
            importance: 'sahur'
        },
        sahur_selepas: {
            id: 'sahur_selepas',
            title: 'Doa Selepas Sahur',
            category: 'sahur',
            arabic: 'اَلْحَمْدُ لِلّٰهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِيْنَ',
            transliteration: "Alhamdulillāhilladzi ath'amanā wa saqānā wa ja'alanā muslimīn",
            meaning: 'Segala puji bagi Allah yang telah memberi kami makan dan minum, dan menjadikan kami orang-orang Islam.',
            source: 'HR Abu Daud & al-Tirmizi',
            audioUrl: null,
            importance: 'sahur'
        }
    };

    // User Progress State
    let userState = {
        memorized: [],
        bookmarks: [],
        streak: 0,
        lastVisit: null,
        totalReads: 0,
        achievements: []
    };

    // Load state from localStorage
    function loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                userState = { ...userState, ...parsed };
                
                // Update streak
                const today = new Date().toDateString();
                const lastVisit = userState.lastVisit ? new Date(userState.lastVisit).toDateString() : null;
                
                if (lastVisit === today) {
                    // Same day, keep streak
                } else if (lastVisit === new Date(Date.now() - 86400000).toDateString()) {
                    // Yesterday, increment streak
                    userState.streak++;
                } else {
                    // Streak broken
                    userState.streak = 1;
                }
                userState.lastVisit = new Date().toISOString();
                saveState();
            }
        } catch (e) {
            console.warn('Error loading state:', e);
        }
    }

    // Save state to localStorage
    function saveState() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(userState));
        } catch (e) {
            console.warn('Error saving state:', e);
        }
    }

    // Check achievements
    function checkAchievements() {
        const achievements = [];
        
        if (userState.memorized.length >= 1) achievements.push('first_memorized');
        if (userState.memorized.length >= 5) achievements.push('hafiz_beginner');
        if (userState.memorized.length >= 10) achievements.push('hafiz_intermediate');
        if (userState.streak >= 7) achievements.push('weekly_streak');
        if (userState.streak >= 30) achievements.push('monthly_streak');
        if (userState.totalReads >= 100) achievements.push('dedicated_learner');
        
        userState.achievements = achievements;
        saveState();
        
        return achievements;
    }

    // Render the main tool
    function renderTool() {
        const container = document.getElementById('niat-puasa-tool');
        if (!container) return;

        loadState();

        container.innerHTML = `
            <div class="npt-container">
                <div class="npt-header">
                    <h2 class="npt-title">🌙 Tool Interaktif Niat Puasa & Doa Berbuka</h2>
                    <p class="npt-subtitle">Ramadan 2026 | ilmualam.com</p>
                    <div class="npt-stats">
                        <span class="npt-stat">🔥 Streak: ${userState.streak} hari</span>
                        <span class="npt-stat">📚 Dihafal: ${userState.memorized.length}/${Object.keys(DOA_DATA).length}</span>
                        <span class="npt-stat">⭐ Progress: ${Math.round((userState.memorized.length / Object.keys(DOA_DATA).length) * 100)}%</span>
                    </div>
                </div>
                
                <div class="npt-tabs">
                    <button class="npt-tab active" data-category="all">Semua</button>
                    <button class="npt-tab" data-category="niat">Niat Puasa</button>
                    <button class="npt-tab" data-category="berbuka">Doa Berbuka</button>
                    <button class="npt-tab" data-category="sahur">Doa Sahur</button>
                    <button class="npt-tab" data-category="bookmarks">⭐ Bookmark</button>
                </div>
                
                <div class="npt-progress-bar">
                    <div class="npt-progress-fill" style="width: ${(userState.memorized.length / Object.keys(DOA_DATA).length) * 100}%"></div>
                </div>
                
                <div class="npt-cards" id="npt-cards">
                    ${renderCards('all')}
                </div>
                
                <div class="npt-footer">
                    <p>💡 Tips: Klik pada doa untuk menandakan sudah dihafal</p>
                    <p class="npt-credit">Powered by <a href="https://www.ilmualam.com" target="_blank" rel="noopener">ilmualam.com</a></p>
                </div>
            </div>
        `;

        // Add event listeners
        setupEventListeners(container);
        
        // Inject styles
        injectStyles();
    }

    // Render cards based on category
    function renderCards(category) {
        let items = Object.values(DOA_DATA);
        
        if (category === 'bookmarks') {
            items = items.filter(item => userState.bookmarks.includes(item.id));
        } else if (category !== 'all') {
            items = items.filter(item => item.category === category);
        }

        if (items.length === 0) {
            return '<p class="npt-empty">Tiada item dalam kategori ini.</p>';
        }

        return items.map(item => {
            const isMemorized = userState.memorized.includes(item.id);
            const isBookmarked = userState.bookmarks.includes(item.id);
            
            return `
                <div class="npt-card ${isMemorized ? 'memorized' : ''}" data-id="${item.id}">
                    <div class="npt-card-header">
                        <h3 class="npt-card-title">${item.title}</h3>
                        <div class="npt-card-actions">
                            <button class="npt-btn-bookmark ${isBookmarked ? 'active' : ''}" data-id="${item.id}" title="Bookmark">
                                ${isBookmarked ? '⭐' : '☆'}
                            </button>
                            <span class="npt-badge npt-badge-${item.importance}">${item.importance}</span>
                        </div>
                    </div>
                    
                    <div class="npt-card-arabic" dir="rtl">${item.arabic}</div>
                    
                    <div class="npt-card-transliteration">${item.transliteration}</div>
                    
                    <div class="npt-card-meaning">
                        <strong>Maksud:</strong> ${item.meaning}
                    </div>
                    
                    <div class="npt-card-source">
                        📖 ${item.source}
                    </div>
                    
                    <div class="npt-card-footer">
                        <button class="npt-btn-memorize ${isMemorized ? 'done' : ''}" data-id="${item.id}">
                            ${isMemorized ? '✅ Sudah Hafal' : '📝 Tandakan Hafal'}
                        </button>
                        <button class="npt-btn-copy" data-id="${item.id}">📋 Copy</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Setup event listeners
    function setupEventListeners(container) {
        // Tab switching
        container.querySelectorAll('.npt-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                container.querySelectorAll('.npt-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                const category = e.target.dataset.category;
                document.getElementById('npt-cards').innerHTML = renderCards(category);
                setupCardListeners(container);
            });
        });

        setupCardListeners(container);
    }

    // Setup card-specific listeners
    function setupCardListeners(container) {
        // Memorize buttons
        container.querySelectorAll('.npt-btn-memorize').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                
                if (userState.memorized.includes(id)) {
                    userState.memorized = userState.memorized.filter(m => m !== id);
                    btn.classList.remove('done');
                    btn.textContent = '📝 Tandakan Hafal';
                } else {
                    userState.memorized.push(id);
                    btn.classList.add('done');
                    btn.textContent = '✅ Sudah Hafal';
                }
                
                userState.totalReads++;
                saveState();
                checkAchievements();
                updateProgressBar(container);
                updateStats(container);
            });
        });

        // Bookmark buttons
        container.querySelectorAll('.npt-btn-bookmark').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                
                if (userState.bookmarks.includes(id)) {
                    userState.bookmarks = userState.bookmarks.filter(b => b !== id);
                    btn.classList.remove('active');
                    btn.textContent = '☆';
                } else {
                    userState.bookmarks.push(id);
                    btn.classList.add('active');
                    btn.textContent = '⭐';
                }
                
                saveState();
            });
        });

        // Copy buttons
        container.querySelectorAll('.npt-btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const doa = DOA_DATA[id];
                
                const text = `${doa.title}\n\n${doa.arabic}\n\n${doa.transliteration}\n\nMaksud: ${doa.meaning}\n\nSumber: ${doa.source}\n\n— ilmualam.com`;
                
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = btn.textContent;
                    btn.textContent = '✅ Disalin!';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                });
            });
        });
    }

    // Update progress bar
    function updateProgressBar(container) {
        const fill = container.querySelector('.npt-progress-fill');
        if (fill) {
            const progress = (userState.memorized.length / Object.keys(DOA_DATA).length) * 100;
            fill.style.width = `${progress}%`;
        }
    }

    // Update stats display
    function updateStats(container) {
        const stats = container.querySelector('.npt-stats');
        if (stats) {
            stats.innerHTML = `
                <span class="npt-stat">🔥 Streak: ${userState.streak} hari</span>
                <span class="npt-stat">📚 Dihafal: ${userState.memorized.length}/${Object.keys(DOA_DATA).length}</span>
                <span class="npt-stat">⭐ Progress: ${Math.round((userState.memorized.length / Object.keys(DOA_DATA).length) * 100)}%</span>
            `;
        }
    }

    // Inject CSS styles
    function injectStyles() {
        if (document.getElementById('npt-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'npt-styles';
        styles.textContent = `
            .npt-container {
                font-family: 'Inter', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 1200px;
                margin: 30px auto;
                padding: 0;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(12, 56, 8, 0.15);
                overflow: hidden;
            }
            
            .npt-header {
                background: linear-gradient(135deg, #0c3808 0%, #249749 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .npt-title {
                font-size: 1.8em;
                margin: 0 0 10px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .npt-subtitle {
                margin: 0 0 20px 0;
                opacity: 0.9;
                font-size: 1em;
            }
            
            .npt-stats {
                display: flex;
                justify-content: center;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .npt-stat {
                background: rgba(255,255,255,0.2);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9em;
            }
            
            .npt-tabs {
                display: flex;
                background: #0c3808;
                padding: 10px;
                gap: 8px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .npt-tab {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9em;
            }
            
            .npt-tab:hover, .npt-tab.active {
                background: #249749;
                border-color: #249749;
            }
            
            .npt-progress-bar {
                height: 8px;
                background: #d1fae5;
            }
            
            .npt-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #249749 0%, #fbbf24 100%);
                transition: width 0.5s ease;
                border-radius: 0 4px 4px 0;
            }
            
            .npt-cards {
                padding: 20px;
                display: grid;
                gap: 20px;
            }
            
            .npt-card {
                background: white;
                border-radius: 12px;
                padding: 25px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                transition: all 0.3s ease;
                border-left: 4px solid #249749;
            }
            
            .npt-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.12);
            }
            
            .npt-card.memorized {
                border-left-color: #fbbf24;
                background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
            }
            
            .npt-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .npt-card-title {
                font-size: 1.2em;
                color: #0c3808;
                margin: 0;
            }
            
            .npt-card-actions {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .npt-btn-bookmark {
                background: none;
                border: none;
                font-size: 1.5em;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .npt-btn-bookmark:hover {
                transform: scale(1.2);
            }
            
            .npt-badge {
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.75em;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .npt-badge-wajib { background: #fee2e2; color: #991b1b; }
            .npt-badge-sunat { background: #dbeafe; color: #1e40af; }
            .npt-badge-sahih { background: #d1fae5; color: #065f46; }
            .npt-badge-popular { background: #fef3c7; color: #92400e; }
            .npt-badge-mudah { background: #e0e7ff; color: #3730a3; }
            .npt-badge-jemaah { background: #fce7f3; color: #9d174d; }
            .npt-badge-istimewa { background: #f3e8ff; color: #6b21a8; }
            .npt-badge-sahur { background: #cffafe; color: #155e75; }
            
            .npt-card-arabic {
                font-size: 2em;
                line-height: 2;
                color: #0c3808;
                font-family: 'Amiri','Traditional Arabic', serif;
                text-align: right;
                margin: 20px 0;
                padding: 15px;
                background: #f0fdf4;
                border-radius: 8px;
            }
            
            .npt-card-transliteration {
                font-style: italic;
                color: #0c3808;
                margin: 15px 0;
                padding: 10px;
                background: #ecfdf5;
                border-radius: 6px;
                font-size: 1em;
            }
            
            .npt-card-meaning {
                color: #374151;
                margin: 15px 0;
                line-height: 1.6;
            }
            
            .npt-card-source {
                color: #6b7280;
                font-size: 0.85em;
                margin: 15px 0 20px 0;
            }
            
            .npt-card-footer {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .npt-btn-memorize, .npt-btn-copy {
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.9em;
                transition: all 0.3s ease;
                border: none;
            }
            
            .npt-btn-memorize {
                background: #249749;
                color: white;
                flex: 1;
            }
            
            .npt-btn-memorize:hover {
                background: #0c3808;
            }
            
            .npt-btn-memorize.done {
                background: #fbbf24;
                color: #0c3808;
            }
            
            .npt-btn-copy {
                background: #e5e7eb;
                color: #374151;
            }
            
            .npt-btn-copy:hover {
                background: #d1d5db;
            }
            
            .npt-footer {
                text-align: center;
                padding: 20px;
                background: #f9fafb;
                color: #6b7280;
                font-size: 0.9em;
            }
            
            .npt-footer a {
                color: #249749;
                text-decoration: none;
            }
            
            .npt-footer a:hover {
                text-decoration: underline;
            }
            
            .npt-empty {
                text-align: center;
                color: #9ca3af;
                padding: 40px;
            }
            
            @media (max-width: 600px) {
                .npt-container {
                    margin: 15px;
                    border-radius: 12px;
                }
                
                .npt-header {
                    padding: 20px;
                }
                
                .npt-title {
                    font-size: 1.4em;
                }
                
                .npt-stats {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .npt-tabs {
                    padding: 8px;
                    gap: 5px;
                }
                
                .npt-tab {
                    padding: 8px 12px;
                    font-size: 0.8em;
                }
                
                .npt-cards {
                    padding: 15px;
                }
                
                .npt-card {
                    padding: 20px;
                }
                
                .npt-card-arabic {
                    font-size: 1.4em;
                }
                
                .npt-card-footer {
                    flex-direction: column;
                }
                
                .npt-btn-memorize, .npt-btn-copy {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Initialize tool when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderTool);
    } else {
        renderTool();
    }

    // Expose API for external use
    window.NiatPuasaTool = {
        refresh: renderTool,
        getState: () => userState,
        getData: () => DOA_DATA
    };

})();
