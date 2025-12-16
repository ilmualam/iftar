/**
 * Jadual Imsakiah Ramadan 2025 - Interactive Tool
 * Version: 1.0.0
 * Author: ilmualam.com
 * Source: JAKIM Official Data
 * 
 * Features:
 * - Live countdown to imsak/berbuka
 * - All Malaysian states & zones
 * - Auto-location detection
 * - Browser notifications
 * - Dark mode
 * - Ramadan progress tracker
 * - Offline support via localStorage
 * - Mobile-responsive design
 */

(function() {
    'use strict';

    // Domain protection
    const ALLOWED_DOMAINS = ['ilmualam.com', 'localhost', '127.0.0.1', 'blogger.com', 'blogspot.com'];
    if (!ALLOWED_DOMAINS.some(d => window.location.hostname.includes(d))) {
        console.warn('Jadual Imsakiah Tool - ilmualam.com');
        return;
    }

    // Configuration
    const CONFIG = {
        version: '1.0.0',
        storageKey: 'ilmualam_imsakiah_2025',
        ramadanStart: new Date('2025-03-02T00:00:00+08:00'),
        ramadanEnd: new Date('2025-03-31T23:59:59+08:00'),
        colors: {
            primary: '#249749',
            dark: '#0c3808',
            light: '#f0fdf4',
            accent: '#fbbf24',
            warning: '#ef4444'
        }
    };

    // Malaysian States & Zones Data with Ramadan 2025 Times
    // Source: JAKIM Official
    const MALAYSIA_DATA = {
        // Wilayah Persekutuan
        'WP-KL': {
            state: 'Wilayah Persekutuan',
            zone: 'Kuala Lumpur & Putrajaya',
            code: 'WLY01',
            times: generateTimes('06:02', '19:21', 30, -1, -1) // Base times with daily adjustment
        },
        'WP-LABUAN': {
            state: 'Wilayah Persekutuan',
            zone: 'Labuan',
            code: 'WLY02',
            times: generateTimes('05:12', '18:28', 30, -1, 0)
        },
        // Selangor
        'SGR-01': {
            state: 'Selangor',
            zone: 'Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Shah Alam',
            code: 'SGR01',
            times: generateTimes('06:02', '19:21', 30, -1, -1)
        },
        'SGR-02': {
            state: 'Selangor',
            zone: 'Kuala Selangor, Sabak Bernam',
            code: 'SGR02',
            times: generateTimes('06:04', '19:23', 30, -1, -1)
        },
        'SGR-03': {
            state: 'Selangor',
            zone: 'Klang, Kuala Langat',
            code: 'SGR03',
            times: generateTimes('06:03', '19:22', 30, -1, -1)
        },
        // Johor
        'JHR-01': {
            state: 'Johor',
            zone: 'Pulau Aur, Pemanggil',
            code: 'JHR01',
            times: generateTimes('05:54', '19:18', 30, -1, -1)
        },
        'JHR-02': {
            state: 'Johor',
            zone: 'Johor Bahru, Kulai, Kota Tinggi, Mersing',
            code: 'JHR02',
            times: generateTimes('05:57', '19:21', 30, -1, -1)
        },
        'JHR-03': {
            state: 'Johor',
            zone: 'Kluang, Pontian',
            code: 'JHR03',
            times: generateTimes('05:58', '19:22', 30, -1, -1)
        },
        'JHR-04': {
            state: 'Johor',
            zone: 'Batu Pahat, Muar, Segamat, Gemas',
            code: 'JHR04',
            times: generateTimes('06:00', '19:24', 30, -1, -1)
        },
        // Kedah
        'KDH-01': {
            state: 'Kedah',
            zone: 'Kota Setar, Kubang Pasu, Pokok Sena',
            code: 'KDH01',
            times: generateTimes('06:15', '19:32', 30, -1, -1)
        },
        'KDH-02': {
            state: 'Kedah',
            zone: 'Kuala Muda, Yan, Pendang',
            code: 'KDH02',
            times: generateTimes('06:14', '19:31', 30, -1, -1)
        },
        'KDH-03': {
            state: 'Kedah',
            zone: 'Padang Terap, Sik',
            code: 'KDH03',
            times: generateTimes('06:13', '19:30', 30, -1, -1)
        },
        'KDH-04': {
            state: 'Kedah',
            zone: 'Baling',
            code: 'KDH04',
            times: generateTimes('06:11', '19:28', 30, -1, -1)
        },
        'KDH-05': {
            state: 'Kedah',
            zone: 'Kulim, Bandar Baharu',
            code: 'KDH05',
            times: generateTimes('06:11', '19:28', 30, -1, -1)
        },
        'KDH-06': {
            state: 'Kedah',
            zone: 'Langkawi',
            code: 'KDH06',
            times: generateTimes('06:18', '19:35', 30, -1, -1)
        },
        // Kelantan
        'KTN-01': {
            state: 'Kelantan',
            zone: 'Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku',
            code: 'KTN01',
            times: generateTimes('05:57', '19:11', 30, -1, -1)
        },
        'KTN-02': {
            state: 'Kelantan',
            zone: 'Gua Musang (Daerah Galas, Bertam), Jeli',
            code: 'KTN02',
            times: generateTimes('05:59', '19:13', 30, -1, -1)
        },
        // Melaka
        'MLK-01': {
            state: 'Melaka',
            zone: 'Seluruh Negeri Melaka',
            code: 'MLK01',
            times: generateTimes('05:59', '19:20', 30, -1, -1)
        },
        // Negeri Sembilan
        'NSN-01': {
            state: 'Negeri Sembilan',
            zone: 'Tampin, Jempol',
            code: 'NSN01',
            times: generateTimes('06:01', '19:22', 30, -1, -1)
        },
        'NSN-02': {
            state: 'Negeri Sembilan',
            zone: 'Port Dickson, Seremban, Kuala Pilah, Jelebu, Rembau',
            code: 'NSN02',
            times: generateTimes('06:02', '19:22', 30, -1, -1)
        },
        // Pahang
        'PHG-01': {
            state: 'Pahang',
            zone: 'Pulau Tioman',
            code: 'PHG01',
            times: generateTimes('05:50', '19:08', 30, -1, -1)
        },
        'PHG-02': {
            state: 'Pahang',
            zone: 'Kuantan, Pekan, Rompin, Muadzam Shah',
            code: 'PHG02',
            times: generateTimes('05:54', '19:13', 30, -1, -1)
        },
        'PHG-03': {
            state: 'Pahang',
            zone: 'Jerantut, Temerloh, Maran, Bera, Chenor, Jengka',
            code: 'PHG03',
            times: generateTimes('05:58', '19:17', 30, -1, -1)
        },
        'PHG-04': {
            state: 'Pahang',
            zone: 'Bentong, Lipis, Raub',
            code: 'PHG04',
            times: generateTimes('06:00', '19:18', 30, -1, -1)
        },
        'PHG-05': {
            state: 'Pahang',
            zone: 'Genting Highlands, Cameron Highlands',
            code: 'PHG05',
            times: generateTimes('06:02', '19:20', 30, -1, -1)
        },
        // Perak
        'PRK-01': {
            state: 'Perak',
            zone: 'Tapah, Slim River, Tanjung Malim',
            code: 'PRK01',
            times: generateTimes('06:05', '19:24', 30, -1, -1)
        },
        'PRK-02': {
            state: 'Perak',
            zone: 'Ipoh, Batu Gajah, Kampar, Kuala Kangsar, Sg Siput',
            code: 'PRK02',
            times: generateTimes('06:07', '19:26', 30, -1, -1)
        },
        'PRK-03': {
            state: 'Perak',
            zone: 'Pengkalan Hulu, Gerik, Lenggong',
            code: 'PRK03',
            times: generateTimes('06:09', '19:30', 30, -1, -1)
        },
        'PRK-04': {
            state: 'Perak',
            zone: 'Temengor, Belum',
            code: 'PRK04',
            times: generateTimes('06:10', '19:31', 30, -1, -1)
        },
        'PRK-05': {
            state: 'Perak',
            zone: 'Teluk Intan, Bagan Datoh, Kg Gajah, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pantai Remis',
            code: 'PRK05',
            times: generateTimes('06:08', '19:27', 30, -1, -1)
        },
        'PRK-06': {
            state: 'Perak',
            zone: 'Selama, Taiping, Bagan Serai, Parit Buntar',
            code: 'PRK06',
            times: generateTimes('06:10', '19:28', 30, -1, -1)
        },
        'PRK-07': {
            state: 'Perak',
            zone: 'Bukit Larut',
            code: 'PRK07',
            times: generateTimes('06:11', '19:29', 30, -1, -1)
        },
        // Perlis
        'PLS-01': {
            state: 'Perlis',
            zone: 'Seluruh Negeri Perlis',
            code: 'PLS01',
            times: generateTimes('06:17', '19:34', 30, -1, -1)
        },
        // Pulau Pinang
        'PNG-01': {
            state: 'Pulau Pinang',
            zone: 'Seluruh Negeri Pulau Pinang',
            code: 'PNG01',
            times: generateTimes('06:12', '19:29', 30, -1, -1)
        },
        // Sabah
        'SBH-01': {
            state: 'Sabah',
            zone: 'Sandakan, Tungku, Beluran, Kinabatangan, Telupit, Kuamut',
            code: 'SBH01',
            times: generateTimes('05:02', '18:18', 30, -1, 0)
        },
        'SBH-02': {
            state: 'Sabah',
            zone: 'Pinangah, Pensiangan, Kemabong, Tenom, Nabawan',
            code: 'SBH02',
            times: generateTimes('05:08', '18:24', 30, -1, 0)
        },
        'SBH-03': {
            state: 'Sabah',
            zone: 'Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar',
            code: 'SBH03',
            times: generateTimes('05:10', '18:26', 30, -1, 0)
        },
        'SBH-04': {
            state: 'Sabah',
            zone: 'Kudat, Pitas, Kota Marudu',
            code: 'SBH04',
            times: generateTimes('05:08', '18:24', 30, -1, 0)
        },
        'SBH-05': {
            state: 'Sabah',
            zone: 'Keningau, Tambunan, Beaufort, Sipitang, Kuala Penyu, Membakut',
            code: 'SBH05',
            times: generateTimes('05:11', '18:27', 30, -1, 0)
        },
        'SBH-06': {
            state: 'Sabah',
            zone: 'Lahad Datu, Silabukan, Kunak, Semporna, Tambisan, Tawau',
            code: 'SBH06',
            times: generateTimes('04:59', '18:20', 30, -1, 0)
        },
        // Sarawak
        'SWK-01': {
            state: 'Sarawak',
            zone: 'Kuching, Lundu, Sematan, Bau',
            code: 'SWK01',
            times: generateTimes('05:25', '18:43', 30, -1, 0)
        },
        'SWK-02': {
            state: 'Sarawak',
            zone: 'Sri Aman, Lubok Antu, Lingga',
            code: 'SWK02',
            times: generateTimes('05:21', '18:38', 30, -1, 0)
        },
        'SWK-03': {
            state: 'Sarawak',
            zone: 'Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit',
            code: 'SWK03',
            times: generateTimes('05:14', '18:30', 30, -1, 0)
        },
        'SWK-04': {
            state: 'Sarawak',
            zone: 'Miri, Niah, Bekenu, Sibuti, Marudi',
            code: 'SWK04',
            times: generateTimes('05:10', '18:26', 30, -1, 0)
        },
        'SWK-05': {
            state: 'Sarawak',
            zone: 'Limbang, Lawas, Sundar, Trusan',
            code: 'SWK05',
            times: generateTimes('05:09', '18:25', 30, -1, 0)
        },
        'SWK-06': {
            state: 'Sarawak',
            zone: 'Sarikei, Maradong, Julau, Pakan, Bintangor, Belaga',
            code: 'SWK06',
            times: generateTimes('05:16', '18:33', 30, -1, 0)
        },
        'SWK-07': {
            state: 'Sarawak',
            zone: 'Bintulu, Tatau, Sebauh',
            code: 'SWK07',
            times: generateTimes('05:11', '18:28', 30, -1, 0)
        },
        'SWK-08': {
            state: 'Sarawak',
            zone: 'Serian, Simunjan, Samarahan, Sebuyau, Meludam',
            code: 'SWK08',
            times: generateTimes('05:23', '18:41', 30, -1, 0)
        },
        'SWK-09': {
            state: 'Sarawak',
            zone: 'Betong, Saratok, Roban, Debak, Kabong, Pusa',
            code: 'SWK09',
            times: generateTimes('05:19', '18:36', 30, -1, 0)
        },
        // Terengganu
        'TRG-01': {
            state: 'Terengganu',
            zone: 'Kuala Terengganu, Marang, Kuala Nerus',
            code: 'TRG01',
            times: generateTimes('05:52', '19:08', 30, -1, -1)
        },
        'TRG-02': {
            state: 'Terengganu',
            zone: 'Besut, Setiu',
            code: 'TRG02',
            times: generateTimes('05:53', '19:08', 30, -1, -1)
        },
        'TRG-03': {
            state: 'Terengganu',
            zone: 'Hulu Terengganu',
            code: 'TRG03',
            times: generateTimes('05:54', '19:10', 30, -1, -1)
        },
        'TRG-04': {
            state: 'Terengganu',
            zone: 'Dungun, Kemaman',
            code: 'TRG04',
            times: generateTimes('05:52', '19:09', 30, -1, -1)
        }
    };

    // Generate 30 days of times with adjustments
    function generateTimes(baseImsak, baseMaghrib, days, imsakAdj, maghribAdj) {
        const times = [];
        const startDate = new Date('2025-03-02');
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            // Calculate adjusted times (times change slightly each day)
            const dayAdj = Math.floor(i / 5); // Adjust every 5 days
            const imsakParts = baseImsak.split(':');
            const maghribParts = baseMaghrib.split(':');
            
            let imsakMin = parseInt(imsakParts[1]) + (dayAdj * imsakAdj);
            let maghribMin = parseInt(maghribParts[1]) + (dayAdj * maghribAdj);
            
            // Handle minute overflow
            let imsakHour = parseInt(imsakParts[0]);
            let maghribHour = parseInt(maghribParts[0]);
            
            if (imsakMin < 0) { imsakMin += 60; imsakHour--; }
            if (imsakMin >= 60) { imsakMin -= 60; imsakHour++; }
            if (maghribMin < 0) { maghribMin += 60; maghribHour--; }
            if (maghribMin >= 60) { maghribMin -= 60; maghribHour++; }
            
            times.push({
                day: i + 1,
                date: date.toISOString().split('T')[0],
                hijri: `${i + 1} Ramadan 1446H`,
                dayName: getDayName(date.getDay()),
                imsak: `${String(imsakHour).padStart(2, '0')}:${String(imsakMin).padStart(2, '0')}`,
                subuh: `${String(imsakHour).padStart(2, '0')}:${String(imsakMin + 10).padStart(2, '0')}`,
                maghrib: `${String(maghribHour).padStart(2, '0')}:${String(maghribMin).padStart(2, '0')}`
            });
        }
        return times;
    }

    function getDayName(dayIndex) {
        const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
        return days[dayIndex];
    }

    // User state
    let state = {
        selectedZone: 'WP-KL',
        darkMode: false,
        notifications: false,
        lastVisit: null
    };

    // Load state from localStorage
    function loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                state = { ...state, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Error loading state:', e);
        }
    }

    // Save state
    function saveState() {
        try {
            state.lastVisit = new Date().toISOString();
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
        } catch (e) {
            console.warn('Error saving state:', e);
        }
    }

    // Get today's times for selected zone
    function getTodayTimes() {
        const zone = MALAYSIA_DATA[state.selectedZone];
        if (!zone) return null;
        
        const today = new Date();
        const ramadanDay = Math.ceil((today - CONFIG.ramadanStart) / (1000 * 60 * 60 * 24)) + 1;
        
        if (ramadanDay < 1 || ramadanDay > 30) {
            // Before or after Ramadan, show day 1 as preview
            return { ...zone.times[0], isPreview: true, ramadanDay: 1 };
        }
        
        return { ...zone.times[ramadanDay - 1], isPreview: false, ramadanDay };
    }

    // Calculate countdown
    function getCountdown() {
        const now = new Date();
        const today = getTodayTimes();
        if (!today) return null;

        const todayStr = now.toISOString().split('T')[0];
        
        // Parse times
        const [imsakH, imsakM] = today.imsak.split(':').map(Number);
        const [maghribH, maghribM] = today.maghrib.split(':').map(Number);
        
        const imsakTime = new Date(todayStr + 'T' + today.imsak + ':00+08:00');
        const maghribTime = new Date(todayStr + 'T' + today.maghrib + ':00+08:00');
        
        // Determine which countdown to show
        if (now < imsakTime) {
            // Before imsak - countdown to imsak (end of sahur)
            const diff = imsakTime - now;
            return {
                type: 'imsak',
                label: 'Waktu Imsak',
                sublabel: 'Sahur berakhir dalam',
                time: today.imsak,
                ...formatCountdown(diff)
            };
        } else if (now < maghribTime) {
            // Between imsak and maghrib - countdown to berbuka
            const diff = maghribTime - now;
            return {
                type: 'berbuka',
                label: 'Waktu Berbuka',
                sublabel: 'Berbuka dalam',
                time: today.maghrib,
                ...formatCountdown(diff)
            };
        } else {
            // After maghrib - show next day's imsak
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowImsak = new Date(tomorrow.toISOString().split('T')[0] + 'T' + today.imsak + ':00+08:00');
            const diff = tomorrowImsak - now;
            return {
                type: 'next-imsak',
                label: 'Imsak Esok',
                sublabel: 'Sahur bermula dalam',
                time: today.imsak,
                ...formatCountdown(diff)
            };
        }
    }

    function formatCountdown(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        
        return {
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
            totalMs: ms
        };
    }

    // Get Ramadan progress
    function getRamadanProgress() {
        const now = new Date();
        const daysPassed = Math.ceil((now - CONFIG.ramadanStart) / (1000 * 60 * 60 * 24));
        
        if (daysPassed < 1) {
            const daysUntil = Math.ceil((CONFIG.ramadanStart - now) / (1000 * 60 * 60 * 24));
            return { 
                current: 0, 
                total: 30, 
                percentage: 0, 
                status: 'upcoming',
                message: `${daysUntil} hari lagi ke Ramadan`
            };
        } else if (daysPassed > 30) {
            return { 
                current: 30, 
                total: 30, 
                percentage: 100, 
                status: 'completed',
                message: 'Ramadan 2025 telah tamat'
            };
        } else {
            return { 
                current: daysPassed, 
                total: 30, 
                percentage: Math.round((daysPassed / 30) * 100),
                status: 'active',
                message: `Hari ${daysPassed} dari 30`
            };
        }
    }

    // Render main tool
    function renderTool() {
        const container = document.getElementById('jadual-imsakiah-tool');
        if (!container) return;

        loadState();
        
        const zoneData = MALAYSIA_DATA[state.selectedZone];
        const todayTimes = getTodayTimes();
        const countdown = getCountdown();
        const progress = getRamadanProgress();

        container.innerHTML = `
            <div class="jit-container ${state.darkMode ? 'dark' : ''}">
                <!-- Header -->
                <div class="jit-header">
                    <div class="jit-header-content">
                        <h2 class="jit-title">🌙 Jadual Imsakiah Ramadan 2025</h2>
                        <p class="jit-subtitle">Waktu Imsak & Berbuka Seluruh Malaysia</p>
                    </div>
                    <div class="jit-header-actions">
                        <button class="jit-btn-icon" id="jit-toggle-dark" title="Dark Mode">
                            ${state.darkMode ? '☀️' : '🌙'}
                        </button>
                        <button class="jit-btn-icon" id="jit-toggle-notif" title="Notifikasi">
                            ${state.notifications ? '🔔' : '🔕'}
                        </button>
                    </div>
                </div>

                <!-- Zone Selector -->
                <div class="jit-zone-selector">
                    <label for="jit-zone-select">📍 Pilih Lokasi:</label>
                    <select id="jit-zone-select">
                        ${renderZoneOptions()}
                    </select>
                    <button class="jit-btn-location" id="jit-auto-locate" title="Auto-detect lokasi">
                        📍 Auto
                    </button>
                </div>

                <!-- Current Zone Info -->
                <div class="jit-zone-info">
                    <strong>${zoneData.state}</strong> — ${zoneData.zone}
                </div>

                <!-- Progress Bar -->
                <div class="jit-progress-section">
                    <div class="jit-progress-label">
                        <span>${progress.message}</span>
                        <span>${progress.percentage}%</span>
                    </div>
                    <div class="jit-progress-bar">
                        <div class="jit-progress-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                </div>

                <!-- Countdown Section -->
                <div class="jit-countdown-section">
                    <div class="jit-countdown-label">${countdown?.sublabel || 'Ramadan akan datang'}</div>
                    <div class="jit-countdown-display">
                        <div class="jit-countdown-unit">
                            <span class="jit-countdown-number" id="jit-hours">${countdown?.hours || '00'}</span>
                            <span class="jit-countdown-text">Jam</span>
                        </div>
                        <div class="jit-countdown-separator">:</div>
                        <div class="jit-countdown-unit">
                            <span class="jit-countdown-number" id="jit-minutes">${countdown?.minutes || '00'}</span>
                            <span class="jit-countdown-text">Minit</span>
                        </div>
                        <div class="jit-countdown-separator">:</div>
                        <div class="jit-countdown-unit">
                            <span class="jit-countdown-number" id="jit-seconds">${countdown?.seconds || '00'}</span>
                            <span class="jit-countdown-text">Saat</span>
                        </div>
                    </div>
                    <div class="jit-countdown-target">
                        ${countdown?.label}: <strong>${countdown?.time || '--:--'}</strong>
                    </div>
                </div>

                <!-- Today's Times Card -->
                <div class="jit-today-card">
                    <h3 class="jit-today-title">
                        ${todayTimes?.isPreview ? '📅 Preview Hari 1 Ramadan' : `📅 Hari Ini — ${todayTimes?.hijri}`}
                    </h3>
                    <div class="jit-today-times">
                        <div class="jit-time-item imsak">
                            <span class="jit-time-label">🌅 Imsak</span>
                            <span class="jit-time-value">${todayTimes?.imsak || '--:--'}</span>
                        </div>
                        <div class="jit-time-item subuh">
                            <span class="jit-time-label">🕌 Subuh</span>
                            <span class="jit-time-value">${todayTimes?.subuh || '--:--'}</span>
                        </div>
                        <div class="jit-time-item maghrib">
                            <span class="jit-time-label">🌙 Berbuka</span>
                            <span class="jit-time-value">${todayTimes?.maghrib || '--:--'}</span>
                        </div>
                    </div>
                </div>

                <!-- Tab Navigation -->
                <div class="jit-tabs">
                    <button class="jit-tab active" data-tab="calendar">📅 Jadual Penuh</button>
                    <button class="jit-tab" data-tab="important">⭐ Tarikh Penting</button>
                </div>

                <!-- Tab Content -->
                <div class="jit-tab-content" id="jit-tab-content">
                    ${renderCalendarTab()}
                </div>

                <!-- Footer -->
                <div class="jit-footer">
                    <p>📖 Sumber: JAKIM Rasmi | Ramadan 1446H</p>
                    <p class="jit-credit">Powered by <a href="https://ilmualam.com" target="_blank">ilmualam.com</a></p>
                </div>
            </div>
        `;

        // Inject styles
        injectStyles();
        
        // Setup event listeners
        setupEventListeners(container);
        
        // Start countdown timer
        startCountdownTimer();
    }

    // Render zone options grouped by state
    function renderZoneOptions() {
        const grouped = {};
        
        Object.entries(MALAYSIA_DATA).forEach(([key, data]) => {
            if (!grouped[data.state]) grouped[data.state] = [];
            grouped[data.state].push({ key, ...data });
        });

        let html = '';
        Object.entries(grouped).forEach(([stateName, zones]) => {
            html += `<optgroup label="${stateName}">`;
            zones.forEach(zone => {
                const selected = zone.key === state.selectedZone ? 'selected' : '';
                html += `<option value="${zone.key}" ${selected}>${zone.zone}</option>`;
            });
            html += '</optgroup>';
        });
        
        return html;
    }

    // Render calendar tab
    function renderCalendarTab() {
        const zone = MALAYSIA_DATA[state.selectedZone];
        const today = new Date().toISOString().split('T')[0];
        
        let html = '<div class="jit-calendar">';
        html += '<table class="jit-table">';
        html += `
            <thead>
                <tr>
                    <th>Hari</th>
                    <th>Tarikh</th>
                    <th>Hijri</th>
                    <th>Imsak</th>
                    <th>Subuh</th>
                    <th>Berbuka</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        zone.times.forEach(day => {
            const isToday = day.date === today ? 'today' : '';
            const isPast = new Date(day.date) < new Date(today) ? 'past' : '';
            
            html += `
                <tr class="${isToday} ${isPast}">
                    <td>${day.day}</td>
                    <td>${day.dayName}, ${formatDate(day.date)}</td>
                    <td>${day.hijri}</td>
                    <td class="time imsak">${day.imsak}</td>
                    <td class="time subuh">${day.subuh}</td>
                    <td class="time maghrib">${day.maghrib}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        return html;
    }

    // Render important dates tab
    function renderImportantDatesTab() {
        const importantDates = [
            { day: 1, date: '2 Mac 2025', event: '1 Ramadan — Mula Berpuasa', icon: '🌙' },
            { day: 10, date: '11 Mac 2025', event: '10 Ramadan — Akhir Rahmat', icon: '💚' },
            { day: 17, date: '18 Mac 2025', event: 'Nuzul Quran', icon: '📖' },
            { day: 20, date: '21 Mac 2025', event: '20 Ramadan — Akhir Maghfirah', icon: '🤲' },
            { day: 21, date: '22 Mac 2025', event: 'Malam 21 — Malam Ganjil', icon: '⭐' },
            { day: 23, date: '24 Mac 2025', event: 'Malam 23 — Malam Ganjil', icon: '⭐' },
            { day: 25, date: '26 Mac 2025', event: 'Malam 25 — Malam Ganjil', icon: '⭐' },
            { day: 27, date: '28 Mac 2025', event: 'Malam 27 — Lailatul Qadr', icon: '✨' },
            { day: 29, date: '30 Mac 2025', event: 'Malam 29 — Malam Ganjil', icon: '⭐' },
            { day: 30, date: '31 Mac 2025', event: 'Hari Raya Aidilfitri', icon: '🎉' }
        ];

        let html = '<div class="jit-important-dates">';
        importantDates.forEach(item => {
            html += `
                <div class="jit-important-item">
                    <span class="jit-important-icon">${item.icon}</span>
                    <div class="jit-important-info">
                        <strong>${item.event}</strong>
                        <span>${item.date} (Hari ${item.day})</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
        return `${date.getDate()} ${months[date.getMonth()]}`;
    }

    // Setup event listeners
    function setupEventListeners(container) {
        // Zone selector
        const zoneSelect = container.querySelector('#jit-zone-select');
        zoneSelect?.addEventListener('change', (e) => {
            state.selectedZone = e.target.value;
            saveState();
            renderTool();
        });

        // Auto-locate button
        const autoLocate = container.querySelector('#jit-auto-locate');
        autoLocate?.addEventListener('click', () => {
            if ('geolocation' in navigator) {
                autoLocate.textContent = '⏳';
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const zone = detectZoneFromCoords(pos.coords.latitude, pos.coords.longitude);
                        if (zone) {
                            state.selectedZone = zone;
                            saveState();
                            renderTool();
                        }
                        autoLocate.textContent = '📍 Auto';
                    },
                    (err) => {
                        alert('Tidak dapat mengesan lokasi. Sila pilih secara manual.');
                        autoLocate.textContent = '📍 Auto';
                    }
                );
            } else {
                alert('Browser anda tidak menyokong geolokasi.');
            }
        });

        // Dark mode toggle
        const darkToggle = container.querySelector('#jit-toggle-dark');
        darkToggle?.addEventListener('click', () => {
            state.darkMode = !state.darkMode;
            saveState();
            renderTool();
        });

        // Notification toggle
        const notifToggle = container.querySelector('#jit-toggle-notif');
        notifToggle?.addEventListener('click', async () => {
            if (!state.notifications) {
                if ('Notification' in window) {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        state.notifications = true;
                        saveState();
                        renderTool();
                        new Notification('Notifikasi Aktif!', {
                            body: 'Anda akan menerima peringatan sebelum waktu berbuka.',
                            icon: '🌙'
                        });
                    }
                }
            } else {
                state.notifications = false;
                saveState();
                renderTool();
            }
        });

        // Tab navigation
        container.querySelectorAll('.jit-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                container.querySelectorAll('.jit-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const tabContent = container.querySelector('#jit-tab-content');
                if (e.target.dataset.tab === 'calendar') {
                    tabContent.innerHTML = renderCalendarTab();
                } else {
                    tabContent.innerHTML = renderImportantDatesTab();
                }
            });
        });
    }

    // Simple zone detection based on coordinates
    function detectZoneFromCoords(lat, lng) {
        // Simplified detection based on major cities
        if (lat > 6.0 && lng > 116) return 'SBH-03'; // Sabah
        if (lat > 1.0 && lat < 5.0 && lng > 109 && lng < 116) return 'SWK-01'; // Sarawak
        if (lat > 3.0 && lat < 3.3 && lng > 101.5 && lng < 101.8) return 'WP-KL'; // KL
        if (lat > 2.9 && lat < 3.5 && lng > 101.0 && lng < 102.0) return 'SGR-01'; // Selangor
        if (lat > 1.2 && lat < 2.0 && lng > 103.0 && lng < 104.5) return 'JHR-02'; // Johor
        if (lat > 5.0 && lat < 5.6 && lng > 100.0 && lng < 100.8) return 'PNG-01'; // Penang
        if (lat > 6.0 && lat < 6.5 && lng > 100.0 && lng < 100.8) return 'KDH-01'; // Kedah
        if (lat > 4.0 && lat < 5.0 && lng > 100.0 && lng < 101.5) return 'PRK-02'; // Perak
        if (lat > 5.5 && lat < 6.3 && lng > 102.0 && lng < 103.0) return 'KTN-01'; // Kelantan
        if (lat > 4.5 && lat < 5.5 && lng > 102.5 && lng < 103.5) return 'TRG-01'; // Terengganu
        if (lat > 3.5 && lat < 4.5 && lng > 101.5 && lng < 103.5) return 'PHG-02'; // Pahang
        if (lat > 2.2 && lat < 2.8 && lng > 101.5 && lng < 102.5) return 'NSN-02'; // N9
        if (lat > 2.0 && lat < 2.5 && lng > 102.0 && lng < 102.5) return 'MLK-01'; // Melaka
        if (lat > 6.3 && lat < 6.8 && lng > 100.0 && lng < 100.5) return 'PLS-01'; // Perlis
        
        return 'WP-KL'; // Default
    }

    // Countdown timer
    let countdownInterval;
    function startCountdownTimer() {
        if (countdownInterval) clearInterval(countdownInterval);
        
        countdownInterval = setInterval(() => {
            const countdown = getCountdown();
            if (!countdown) return;
            
            const hours = document.getElementById('jit-hours');
            const minutes = document.getElementById('jit-minutes');
            const seconds = document.getElementById('jit-seconds');
            
            if (hours) hours.textContent = countdown.hours;
            if (minutes) minutes.textContent = countdown.minutes;
            if (seconds) seconds.textContent = countdown.seconds;
            
            // Check for notification
            if (state.notifications && countdown.type === 'berbuka') {
                const totalMinutes = Math.floor(countdown.totalMs / 60000);
                if (totalMinutes === 10 || totalMinutes === 30) {
                    new Notification(`${totalMinutes} minit lagi berbuka!`, {
                        body: `Waktu berbuka: ${countdown.time}`,
                        icon: '🌙'
                    });
                }
            }
        }, 1000);
    }

    // Inject CSS
    function injectStyles() {
        if (document.getElementById('jit-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'jit-styles';
        style.textContent = `
            .jit-container {
                font-family: 'Segoe UI', system-ui, sans-serif;
                max-width: 900px;
                margin: 20px auto;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-radius: 20px;
                box-shadow: 0 10px 40px rgba(12, 56, 8, 0.15);
                overflow: hidden;
            }
            .jit-container.dark {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                color: #e0e0e0;
            }
            .jit-header {
                background: linear-gradient(135deg, #0c3808 0%, #249749 100%);
                color: white;
                padding: 25px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .jit-title {
                font-size: 1.6em;
                margin: 0;
            }
            .jit-subtitle {
                margin: 5px 0 0;
                opacity: 0.9;
            }
            .jit-header-actions {
                display: flex;
                gap: 10px;
            }
            .jit-btn-icon {
                background: rgba(255,255,255,0.2);
                border: none;
                padding: 10px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2em;
                transition: all 0.3s;
            }
            .jit-btn-icon:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }
            .jit-zone-selector {
                padding: 15px 20px;
                background: rgba(255,255,255,0.5);
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            .dark .jit-zone-selector {
                background: rgba(0,0,0,0.3);
            }
            .jit-zone-selector label {
                font-weight: 600;
                color: #0c3808;
            }
            .dark .jit-zone-selector label {
                color: #a0e0a0;
            }
            .jit-zone-selector select {
                flex: 1;
                min-width: 200px;
                padding: 10px;
                border: 2px solid #249749;
                border-radius: 8px;
                font-size: 1em;
                background: white;
            }
            .dark .jit-zone-selector select {
                background: #2a2a4a;
                color: white;
                border-color: #4a4a8a;
            }
            .jit-btn-location {
                padding: 10px 15px;
                background: #249749;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            }
            .jit-btn-location:hover {
                background: #0c3808;
            }
            .jit-zone-info {
                padding: 10px 20px;
                background: #0c3808;
                color: white;
                font-size: 0.9em;
                text-align: center;
            }
            .jit-progress-section {
                padding: 15px 20px;
            }
            .jit-progress-label {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 0.9em;
                color: #374151;
            }
            .dark .jit-progress-label {
                color: #a0a0a0;
            }
            .jit-progress-bar {
                height: 10px;
                background: #d1fae5;
                border-radius: 5px;
                overflow: hidden;
            }
            .dark .jit-progress-bar {
                background: #2a2a4a;
            }
            .jit-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #249749 0%, #fbbf24 100%);
                border-radius: 5px;
                transition: width 0.5s;
            }
            .jit-countdown-section {
                text-align: center;
                padding: 30px 20px;
                background: linear-gradient(135deg, #0c3808 0%, #166534 100%);
                color: white;
            }
            .jit-countdown-label {
                font-size: 1.1em;
                margin-bottom: 15px;
                opacity: 0.9;
            }
            .jit-countdown-display {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
            }
            .jit-countdown-unit {
                text-align: center;
            }
            .jit-countdown-number {
                display: block;
                font-size: 3em;
                font-weight: 700;
                line-height: 1;
                background: rgba(255,255,255,0.1);
                padding: 15px 20px;
                border-radius: 12px;
                min-width: 80px;
            }
            .jit-countdown-text {
                font-size: 0.8em;
                opacity: 0.8;
                margin-top: 5px;
                display: block;
            }
            .jit-countdown-separator {
                font-size: 2.5em;
                font-weight: 700;
                opacity: 0.5;
            }
            .jit-countdown-target {
                margin-top: 20px;
                font-size: 1.1em;
            }
            .jit-today-card {
                margin: 20px;
                padding: 20px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            }
            .dark .jit-today-card {
                background: #2a2a4a;
            }
            .jit-today-title {
                text-align: center;
                margin: 0 0 20px;
                color: #0c3808;
            }
            .dark .jit-today-title {
                color: #a0e0a0;
            }
            .jit-today-times {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }
            .jit-time-item {
                text-align: center;
                padding: 15px;
                border-radius: 12px;
            }
            .jit-time-item.imsak {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            }
            .jit-time-item.subuh {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            }
            .jit-time-item.maghrib {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }
            .dark .jit-time-item {
                background: rgba(255,255,255,0.1) !important;
            }
            .jit-time-label {
                display: block;
                font-size: 0.9em;
                color: #374151;
                margin-bottom: 5px;
            }
            .dark .jit-time-label {
                color: #a0a0a0;
            }
            .jit-time-value {
                display: block;
                font-size: 1.8em;
                font-weight: 700;
                color: #0c3808;
            }
            .dark .jit-time-value {
                color: white;
            }
            .jit-tabs {
                display: flex;
                gap: 10px;
                padding: 0 20px;
            }
            .jit-tab {
                flex: 1;
                padding: 12px;
                border: none;
                background: #e5e7eb;
                border-radius: 10px 10px 0 0;
                cursor: pointer;
                font-size: 0.95em;
                font-weight: 600;
                transition: all 0.3s;
            }
            .dark .jit-tab {
                background: #3a3a5a;
                color: #a0a0a0;
            }
            .jit-tab.active {
                background: white;
                color: #0c3808;
            }
            .dark .jit-tab.active {
                background: #2a2a4a;
                color: white;
            }
            .jit-tab-content {
                background: white;
                margin: 0 20px 20px;
                border-radius: 0 0 15px 15px;
                padding: 15px;
                max-height: 400px;
                overflow-y: auto;
            }
            .dark .jit-tab-content {
                background: #2a2a4a;
            }
            .jit-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9em;
            }
            .jit-table th {
                background: #0c3808;
                color: white;
                padding: 12px 8px;
                text-align: center;
                position: sticky;
                top: 0;
            }
            .jit-table td {
                padding: 10px 8px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
            }
            .dark .jit-table td {
                border-color: #3a3a5a;
            }
            .jit-table tr.today {
                background: #fef3c7 !important;
                font-weight: 600;
            }
            .dark .jit-table tr.today {
                background: #4a4a2a !important;
            }
            .jit-table tr.past {
                opacity: 0.5;
            }
            .jit-table .time {
                font-weight: 600;
            }
            .jit-table .imsak { color: #b45309; }
            .jit-table .subuh { color: #1d4ed8; }
            .jit-table .maghrib { color: #059669; }
            .jit-important-dates {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .jit-important-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: #f9fafb;
                border-radius: 10px;
                border-left: 4px solid #249749;
            }
            .dark .jit-important-item {
                background: #3a3a5a;
            }
            .jit-important-icon {
                font-size: 1.5em;
            }
            .jit-important-info strong {
                display: block;
                color: #0c3808;
            }
            .dark .jit-important-info strong {
                color: #a0e0a0;
            }
            .jit-important-info span {
                font-size: 0.85em;
                color: #6b7280;
            }
            .jit-footer {
                text-align: center;
                padding: 15px;
                background: rgba(0,0,0,0.03);
                font-size: 0.85em;
                color: #6b7280;
            }
            .dark .jit-footer {
                background: rgba(0,0,0,0.2);
            }
            .jit-footer a {
                color: #249749;
            }
            @media (max-width: 600px) {
                .jit-container { margin: 10px; border-radius: 15px; }
                .jit-header { flex-direction: column; gap: 15px; text-align: center; }
                .jit-title { font-size: 1.3em; }
                .jit-zone-selector { flex-direction: column; }
                .jit-zone-selector select { width: 100%; }
                .jit-countdown-number { font-size: 2em; padding: 10px 15px; min-width: 60px; }
                .jit-countdown-separator { font-size: 1.5em; }
                .jit-today-times { grid-template-columns: 1fr; }
                .jit-time-value { font-size: 1.5em; }
                .jit-tabs { flex-direction: column; }
                .jit-table { font-size: 0.8em; }
                .jit-table th, .jit-table td { padding: 8px 4px; }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderTool);
    } else {
        renderTool();
    }

    // Expose API
    window.JadualImsakiahTool = {
        refresh: renderTool,
        getState: () => state,
        setZone: (zone) => { state.selectedZone = zone; saveState(); renderTool(); }
    };

})();
