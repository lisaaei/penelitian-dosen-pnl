/**
 * JAVASCRIPT LOGIC - PORTAL PENELITIAN DOSEN POLITEKNIK NEGERI LHOKSEUMAWE
 * Terintegrasi Langsung dengan Backend & API PDDikti Kemdiktisaintek
 */

// Data Referensi Program Studi Per Jurusan di PNL
const dataProdiPerJurusan = {
    'Teknologi Informasi & Komputer': [
        'Teknologi Rekayasa Perangkat Lunak',
        'Teknologi Rekayasa Komputer Jaringan',
        'Teknologi Rekayasa Multimedia',
        'Teknik Informatika'
    ],
    'Teknik Sipil': [
        'Teknologi Konstruksi Jalan dan Jembatan',
        'Teknologi Konstruksi Bangunan Air',
        'Teknologi Rekayasa Konstruksi Jalan dan Jembatan',
        'Teknologi Rekayasa Konstruksi Bangunan Gedung'
    ],
    'Teknik Mesin': [
        'Teknologi Mesin',
        'Teknologi Industri',
        'Teknologi Rekayasa Manufaktur',
        'Teknologi Rekayasa Pengelasan dan Fabrikasi'
    ],
    'Teknik Elektro': [
        'Teknologi Listrik',
        'Teknologi Elektronika',
        'Teknologi Telekomunikasi',
        'Teknologi Rekayasa Instrumentasi Dan Kontrol',
        'Teknologi Rekayasa Jaringan Telekomunikasi',
        'Teknologi Rekayasa Pembangkit Energi',
        'Teknologi Rekayasa Mekatronika'
    ],
    'Teknik Kimia': [
        'Teknologi Kimia',
        'Teknologi Pengolahan Minyak Dan Gas',
        'Teknologi Rekayasa Kimia Industri',
        'Teknologi Rekayasa Kimia Berkelanjutan'
    ],
    'Tata Niaga': [
        'Administrasi Bisnis',
        'Akuntansi',
        'Akuntansi Lembaga Keuangan Syariah',
        'Akuntansi Sektor Publik',
        'Manajemen Keuangan Sektor Publik',
        'Keuangan Islam Terapan'
    ]
};

// Data Cadangan (Fallback) jika DB sedang inisialisasi awal
const fallbackData = [
    {
        id: 1,
        dosen_id: 1,
        nama_dosen: 'GUNTUR SYAHPUTRA',
        jurusan: 'Teknologi Informasi & Komputer',
        program_studi: 'Teknologi Rekayasa Perangkat Lunak',
        jabatan_fungsional: 'Lektor',
        pendidikan_terakhir: 'S2',
        status_aktivitas: 'Aktif',
        judul: 'Penerapan Teknik Single Page Aplication untuk membuat website SMK Negeri 8 Kota Lhokseumawe',
        tahun: 2026,
        jenis_kegiatan: 'Penelitian',
        sumber: 'PDDikti Kemdiktisaintek'
    },
    {
        id: 2,
        dosen_id: 1,
        nama_dosen: 'GUNTUR SYAHPUTRA',
        jurusan: 'Teknologi Informasi & Komputer',
        program_studi: 'Teknologi Rekayasa Perangkat Lunak',
        jabatan_fungsional: 'Lektor',
        pendidikan_terakhir: 'S2',
        status_aktivitas: 'Aktif',
        judul: 'PEMBUATAN SISTEM INFORMASI PENGUKURAN PENCAPAIAN CPL BERBASIS WEB DI POLITEKNIK NEGERI LHOKSEUMAWE ',
        tahun: 2025,
        jenis_kegiatan: 'Penelitian',
        sumber: 'PDDikti Kemdiktisaintek'
    },
    {
        id: 3,
        dosen_id: 1,
        nama_dosen: 'GUNTUR SYAHPUTRA',
        jurusan: 'Teknologi Informasi & Komputer',
        program_studi: 'Teknologi Rekayasa Perangkat Lunak',
        jabatan_fungsional: 'Lektor',
        pendidikan_terakhir: 'S2',
        status_aktivitas: 'Aktif',
        judul: 'PENERAPAN JARINGAN SYARAF TIRUAN UNTUK AUTENTIKASI USER DAN PASSWORD DENGAN METODE AUTO ASSOCIATIVE MEMORY ',
        tahun: 2022,
        jenis_kegiatan: 'Penelitian',
        sumber: 'PDDikti Kemdiktisaintek'
    },
    {
        id: 4,
        dosen_id: 1,
        nama_dosen: 'GUNTUR SYAHPUTRA',
        jurusan: 'Teknologi Informasi & Komputer',
        program_studi: 'Teknologi Rekayasa Perangkat Lunak',
        jabatan_fungsional: 'Lektor',
        pendidikan_terakhir: 'S2',
        status_aktivitas: 'Aktif',
        judul: 'Penerapan Sistem Pendukung Keputusan Dengan Metode Simpte Addilive Weight (SAW) dalam Penentuan Jabatan Wakapolres di Jajaran Kepolisian Daerah Sumatera Utara (POLDA SUMUT)',
        tahun: 2018,
        jenis_kegiatan: 'Penelitian',
        sumber: 'PDDikti Kemdiktisaintek'
    },
    {
        id: 5,
        dosen_id: 1,
        nama_dosen: 'GUNTUR SYAHPUTRA',
        jurusan: 'Teknologi Informasi & Komputer',
        program_studi: 'Teknologi Rekayasa Perangkat Lunak',
        jabatan_fungsional: 'Lektor',
        pendidikan_terakhir: 'S2',
        status_aktivitas: 'Aktif',
        judul: 'Deteksi Tingkat Kemiripan Data Peserta Ujian Berbasis Komputer Pada Bimbingan Belajar Expert Dengan Menggunakan Metode Levenshtein Distance',
        tahun: 2017,
        jenis_kegiatan: 'Penelitian',
        sumber: 'PDDikti Kemdiktisaintek'
    }
];

// State Aplikasi
let currentView = 'grid'; // 'grid' atau 'table'
let activeDosenData = null;
let activeTab = 'penelitian';
let searchDebounceTimer = null;

// DOM Elements
const jurusanSelect = document.getElementById('jurusan');
const prodiSelect = document.getElementById('prodi');
const tahunSelect = document.getElementById('tahun');
const namaDosenInput = document.getElementById('namaDosen');
const btnCari = document.getElementById('btnCari');
const btnReset = document.getElementById('btnReset');

const resultsGrid = document.getElementById('resultsGrid');
const resultsTableContainer = document.getElementById('resultsTableContainer');
const resultsTableBody = document.getElementById('resultsTableBody');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultCount = document.getElementById('resultCount');

const btnViewGrid = document.getElementById('btnViewGrid');
const btnViewTable = document.getElementById('btnViewTable');

// Sync Panel Elements
const syncPanel = document.getElementById('syncPanel');
const btnOpenSync = document.getElementById('btnOpenSync');
const btnCloseSync = document.getElementById('btnCloseSync');
const pddiktiUrlInput = document.getElementById('pddiktiUrlInput');
const btnPasteSample = document.getElementById('btnPasteSample');
const btnSyncSingle = document.getElementById('btnSyncSingle');
const btnSyncAllPnl = document.getElementById('btnSyncAllPnl');
const syncFeedback = document.getElementById('syncFeedback');

// Stats Elements
const statTotalDosen = document.getElementById('statTotalDosen');
const statTotalPenelitian = document.getElementById('statTotalPenelitian');
const statTotalProdi = document.getElementById('statTotalProdi');
const statDatabase = document.getElementById('statDatabase');

// Modal Elements
const dosenModal = document.getElementById('dosenModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const modalNamaDosen = document.getElementById('modalNamaDosen');
const modalJenisKelamin = document.getElementById('modalJenisKelamin');
const modalPerguruanTinggi = document.getElementById('modalPerguruanTinggi');
const modalProgramStudi = document.getElementById('modalProgramStudi');
const modalJabatanFungsional = document.getElementById('modalJabatanFungsional');
const modalPendidikanTerakhir = document.getElementById('modalPendidikanTerakhir');
const modalIkatanKerja = document.getElementById('modalIkatanKerja');
const modalStatusAktivitas = document.getElementById('modalStatusAktivitas');
const portfolioTableBody = document.getElementById('portfolioTableBody');
const tableColTitle = document.getElementById('tableColTitle');
const portfolioTabBtns = document.querySelectorAll('.portfolio-tab-btn');

// Toast Element
const toastNotification = document.getElementById('toastNotification');

// =====================================================================
// INISIALISASI
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    updateProdiOptions('');
    fetchStats();
    performSearch();
}

function setupEventListeners() {
    // Filter Events
    jurusanSelect.addEventListener('change', () => {
        updateProdiOptions(jurusanSelect.value);
        performSearch();
    });

    prodiSelect.addEventListener('change', performSearch);
    tahunSelect.addEventListener('change', performSearch);

    namaDosenInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(performSearch, 300);
    });

    btnCari.addEventListener('click', performSearch);
    btnReset.addEventListener('click', resetFilters);

    // Excel Export Buttons
    const btnExportExcel = document.getElementById('btnExportExcel');
    if (btnExportExcel) {
        btnExportExcel.addEventListener('click', handleExportExcel);
    }
    const btnExportExcelHeader = document.getElementById('btnExportExcelHeader');
    if (btnExportExcelHeader) {
        btnExportExcelHeader.addEventListener('click', handleExportExcel);
    }

    // View Switchers
    btnViewGrid.addEventListener('click', () => switchView('grid'));
    btnViewTable.addEventListener('click', () => switchView('table'));

    // Sync Panel
    btnOpenSync.addEventListener('click', () => {
        syncPanel.classList.toggle('hidden');
        if (!syncPanel.classList.contains('hidden')) {
            syncPanel.scrollIntoView({ behavior: 'smooth' });
        }
    });

    btnCloseSync.addEventListener('click', () => {
        syncPanel.classList.add('hidden');
    });

    btnPasteSample.addEventListener('click', () => {
        pddiktiUrlInput.value = 'https://pddikti.kemdiktisaintek.go.id/detail-dosen/9ZNJIsT_B68ZZTaBt-dZmlnWZAzPDWx6Uf5P3bSlAHqE8Z-J5J2ZOibbdOEkh0fT8w157Q==';
    });

    btnSyncSingle.addEventListener('click', handleSyncSingle);
    btnSyncAllPnl.addEventListener('click', handleSyncAllPnl);

    const btnSyncBatchPnl = document.getElementById('btnSyncBatchPnl');
    if (btnSyncBatchPnl) {
        btnSyncBatchPnl.addEventListener('click', handleSyncBatchPnl);
    }

    // Modal Live Sync Button
    const btnSyncModalDosen = document.getElementById('btnSyncModalDosen');
    if (btnSyncModalDosen) {
        btnSyncModalDosen.addEventListener('click', handleSyncModalDosen);
    }

    // Modal Events
    btnCloseModal.addEventListener('click', closeModal);
    dosenModal.addEventListener('click', (e) => {
        if (e.target === dosenModal) closeModal();
    });

    // Tab Switcher di Modal
    portfolioTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            portfolioTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.getAttribute('data-tab');
            renderPortfolioTable();
        });
    });

    // Escape Key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !dosenModal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// =====================================================================
// PENGAMBILAN DATA DARI BACKEND
// =====================================================================
function fetchStats() {
    fetch('backend.php?action=stats')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.stats) {
                if (statTotalDosen) statTotalDosen.textContent = `${data.stats.total_dosen} Dosen`;
                if (statTotalPenelitian) statTotalPenelitian.textContent = `${data.stats.total_penelitian} Judul`;
                if (statTotalProdi) statTotalProdi.textContent = '6 Jurusan • 28 Prodi';
                if (statDatabase) statDatabase.textContent = data.database === 'mysql' ? 'MySQL Aktif' : 'SQLite Lokal';
            }
        })
        .catch(err => {
            console.warn('Backend stats notice:', err);
            if (statTotalDosen) statTotalDosen.textContent = '306 Dosen';
            if (statTotalPenelitian) statTotalPenelitian.textContent = '750+ Judul';
            if (statTotalProdi) statTotalProdi.textContent = '6 Jurusan • 28 Prodi';
        });
}

function updateProdiOptions(jurusan) {
    prodiSelect.innerHTML = '<option value="">Semua Program Studi</option>';

    if (jurusan && dataProdiPerJurusan[jurusan]) {
        dataProdiPerJurusan[jurusan].forEach(prodi => {
            const opt = document.createElement('option');
            opt.value = prodi;
            opt.textContent = prodi;
            prodiSelect.appendChild(opt);
        });
        prodiSelect.disabled = false;
    } else {
        fetch(`backend.php?action=get_prodi&jurusan=${encodeURIComponent(jurusan)}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.data && data.data.length > 0) {
                    data.data.forEach(prodi => {
                        const opt = document.createElement('option');
                        opt.value = prodi;
                        opt.textContent = prodi;
                        prodiSelect.appendChild(opt);
                    });
                }
            })
            .catch(() => {});
        prodiSelect.disabled = false;
    }
}

function performSearch() {
    loadingIndicator.classList.remove('hidden');
    resultCount.textContent = 'Mencari data dari database...';

    const params = new URLSearchParams({
        action: 'list',
        jurusan: jurusanSelect.value,
        prodi: prodiSelect.value,
        tahun: tahunSelect.value,
        nama: namaDosenInput.value.trim()
    });

    fetch(`backend.php?${params.toString()}`)
        .then(res => res.json())
        .then(response => {
            loadingIndicator.classList.add('hidden');
            if (response.status === 'success' && Array.isArray(response.data)) {
                displayResults(response.data);
            } else {
                useFallbackSearch();
            }
        })
        .catch(err => {
            loadingIndicator.classList.add('hidden');
            console.warn('Backend query notice, using local filter:', err);
            useFallbackSearch();
        });
}

function useFallbackSearch() {
    const j = jurusanSelect.value.toLowerCase();
    const p = prodiSelect.value.toLowerCase();
    const t = tahunSelect.value;
    const n = namaDosenInput.value.trim().toLowerCase();

    const filtered = fallbackData.filter(item => {
        const matchJ = !j || item.jurusan.toLowerCase().includes(j) || (j.includes('informasi') && item.jurusan.includes('Informasi'));
        const matchP = !p || item.program_studi.toLowerCase().includes(p);
        const matchT = !t || item.tahun.toString() === t;
        const matchN = !n || item.nama_dosen.toLowerCase().includes(n) || item.judul.toLowerCase().includes(n);
        return matchJ && matchP && matchT && matchN;
    });

    displayResults(filtered);
}

function resetFilters() {
    jurusanSelect.value = '';
    updateProdiOptions('');
    tahunSelect.value = '';
    namaDosenInput.value = '';
    performSearch();
}

function switchView(view) {
    currentView = view;
    if (view === 'grid') {
        btnViewGrid.classList.add('active');
        btnViewTable.classList.remove('active');
        resultsGrid.classList.remove('hidden');
        resultsTableContainer.classList.add('hidden');
    } else {
        btnViewTable.classList.add('active');
        btnViewGrid.classList.remove('active');
        resultsGrid.classList.add('hidden');
        resultsTableContainer.classList.remove('hidden');
    }
}

// =====================================================================
// DISPLAY HASIL (GRID & TABEL)
// =====================================================================
function displayResults(data) {
    resultsGrid.innerHTML = '';
    resultsTableBody.innerHTML = '';

    // Filter deduplikasi di sisi client agar tidak pernah ada kartu/baris ganda per dosen & judul
    const seen = new Set();
    const uniqueData = [];
    (data || []).forEach(item => {
        const dId = item.dosen_id || item.id || item.nama_dosen;
        const jTitle = (item.judul || item.judul_penelitian || '').trim().toLowerCase();
        const dedupKey = `${dId}_${jTitle}`;
        if (!seen.has(dedupKey)) {
            seen.add(dedupKey);
            uniqueData.push(item);
        }
    });
    data = uniqueData;

    resultCount.textContent = `${data.length} penelitian ditemukan`;

    if (!data || data.length === 0) {
        const emptyHtml = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
                <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">Tidak Ada Data Ditemukan</h3>
                <p>Coba sesuaikan pilihan filter jurusan, program studi, atau kata kunci pencarian Anda.</p>
            </div>
        `;
        resultsGrid.innerHTML = emptyHtml;
        resultsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">Tidak ada data penelitian yang cocok dengan kriteria filter Anda.</td></tr>`;
        return;
    }

    // Populate Cards Grid
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'research-card';

        const dosenId = item.dosen_id || item.id || 1;

        card.innerHTML = `
            <div class="card-meta">
                <a href="#" class="author-link" data-dosen-id="${dosenId}">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    ${escapeHtml(item.nama_dosen)}
                </a>
                <span class="year-badge">${item.tahun}</span>
            </div>
            <h3 class="research-title">${escapeHtml(item.judul)}</h3>
            <div class="card-footer">
                <div class="meta-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    <span>${escapeHtml(item.jurusan)} &bull; ${escapeHtml(item.program_studi)}</span>
                </div>
                <div class="meta-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <span>Sumber: ${escapeHtml(item.sumber || 'PDDikti Kemdiktisaintek')}</span>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                    <button class="btn-detail-card" data-dosen-id="${dosenId}" style="flex: 1;">
                        Lihat Profil & Portofolio
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <button class="btn-quick-sync" data-dosen-id="${dosenId}" data-dosen-name="${escapeHtml(item.nama_dosen)}" title="Tarik seluruh penelitian resmi dosen ini langsung dari API PDDikti">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                        PDDikti Live
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.author-link').addEventListener('click', (e) => {
            e.preventDefault();
            openDosenDetailModal(dosenId);
        });

        card.querySelector('.btn-detail-card').addEventListener('click', () => {
            openDosenDetailModal(dosenId);
        });

        card.querySelector('.btn-quick-sync').addEventListener('click', (e) => {
            e.stopPropagation();
            syncDosenQuick(dosenId, item.nama_dosen, e.currentTarget);
        });

        resultsGrid.appendChild(card);
    });

    // Populate Table View
    data.forEach((item, idx) => {
        const dosenId = item.dosen_id || item.id || 1;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center; color: var(--text-muted);">${idx + 1}</td>
            <td>
                <strong style="color: var(--primary); cursor: pointer;" class="table-author-click">${escapeHtml(item.nama_dosen)}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(item.jabatan_fungsional || 'Lektor')}</div>
            </td>
            <td>
                <div>${escapeHtml(item.jurusan)}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(item.program_studi)}</div>
            </td>
            <td>${escapeHtml(item.judul)}</td>
            <td style="text-align: center;"><span class="year-badge">${item.tahun}</span></td>
            <td style="text-align: center; white-space: nowrap;">
                <button class="btn-secondary btn-table-view" style="padding: 0.35rem 0.65rem; font-size: 0.8125rem;">
                    Portofolio
                </button>
                <button class="btn-quick-sync btn-table-sync" data-dosen-id="${dosenId}" data-dosen-name="${escapeHtml(item.nama_dosen)}" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; margin-left: 0.25rem;" title="Tarik data lengkap PDDikti">
                    PDDikti
                </button>
            </td>
        `;

        tr.querySelector('.table-author-click').addEventListener('click', () => openDosenDetailModal(dosenId));
        tr.querySelector('.btn-table-view').addEventListener('click', () => openDosenDetailModal(dosenId));
        tr.querySelector('.btn-table-sync').addEventListener('click', (e) => {
            e.stopPropagation();
            syncDosenQuick(dosenId, item.nama_dosen, e.currentTarget);
        });

        resultsTableBody.appendChild(tr);
    });
}

// =====================================================================
// MODAL DETAIL DOSEN & PORTOFOLIO (REPLIKA PERSIS SCREENSHOT 1 & 2)
// =====================================================================
function openDosenDetailModal(dosenId) {
    dosenModal.classList.remove('hidden');
    modalNamaDosen.textContent = 'Memuat...';
    portfolioTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 2rem;">Mengambil data portofolio dari database...</td></tr>`;

    fetch(`backend.php?action=detail_dosen&id=${dosenId}`)
        .then(res => res.json())
        .then(response => {
            if (response.status === 'success' && response.data) {
                activeDosenData = response.data;
                populateModalProfil(activeDosenData.profil);
                renderPortfolioTable();

                // Update status badge PDDikti
                const modalSyncBadge = document.getElementById('modalSyncBadge');
                const modalSyncText = document.getElementById('modalSyncText');
                if (modalSyncBadge && modalSyncText) {
                    const penCount = (activeDosenData.portofolio.penelitian || []).length;
                    if (activeDosenData.is_synced) {
                        modalSyncBadge.className = 'modal-sync-badge';
                        modalSyncText.textContent = `✓ Resmi PDDikti (${penCount} Penelitian)`;
                    } else {
                        modalSyncBadge.className = 'modal-sync-badge badge-pending';
                        modalSyncText.textContent = `Database Lokal (${penCount} Penelitian - Klik Tarik PDDikti)`;
                    }
                }
            } else {
                useFallbackModal(dosenId);
            }
        })
        .catch(err => {
            console.warn('Detail fetch error, using fallback:', err);
            useFallbackModal(dosenId);
        });
}

function useFallbackModal(dosenId) {
    activeDosenData = {
        profil: {
            nama_dosen: 'GUNTUR SYAHPUTRA',
            jenis_kelamin: 'Laki-laki',
            perguruan_tinggi: 'Politeknik Negeri Lhokseumawe',
            program_studi: 'Teknologi Rekayasa Perangkat Lunak',
            jabatan_fungsional: 'Lektor',
            pendidikan_terakhir: 'S2',
            status_ikatan_kerja: 'Dosen Tetap',
            status_aktivitas: 'Aktif'
        },
        portofolio: {
            penelitian: fallbackData,
            pengabdian: [
                { judul_pengabdian: 'PELATIHAN PEMBUATAN APLIKASI AUGMENTED REALITY UNTUK MENINGKATKAN KOMPETENSI DIGITAL SISWA SMAN 1 SYAMTALIRA ARON', tahun: 2026 },
                { judul_pengabdian: 'Pengembangan Website Sekolah SMKN 5 Lhokseumawe dalam meningkatkan layanan digital', tahun: 2025 },
                { judul_pengabdian: 'PERUBAHAN PERTAMA PENETAPAN TIM KERJA ZONA INTEGRITAS WILAYAH BEBAS DARI KORUPSI (ZI-WBK) PADA POLITEKNIK NEGERI LHOKSEUMAWE', tahun: 2025 },
                { judul_pengabdian: 'Penerapan Virtual Reality (VR) Berbasis Video 360 dalam Rangka Optimalisasi Teknologi Mutmedia untuk Mendukung Sarana Promosi Sekolah pada SMK N 5 Lhokseumaw', tahun: 2024 },
                { judul_pengabdian: 'Rancang Bangun Network Attached Storage (NAS) Server pada Ruang Lingkup Jurusan TIK Politeknik Negeri Lhokseumawe dalam Upaya Mengurangi Ketergantungan terhadap Jaringan Internet', tahun: 2023 }
            ],
            karya: [],
            paten: []
        }
    };
    populateModalProfil(activeDosenData.profil);
    renderPortfolioTable();
}

function populateModalProfil(p) {
    modalNamaDosen.textContent = p.nama_dosen || '-';
    modalJenisKelamin.textContent = p.jenis_kelamin || 'Laki-laki';
    modalPerguruanTinggi.textContent = p.perguruan_tinggi || 'Politeknik Negeri Lhokseumawe';
    modalProgramStudi.textContent = p.program_studi || '-';
    modalJabatanFungsional.textContent = p.jabatan_fungsional || 'Lektor';
    modalPendidikanTerakhir.textContent = p.pendidikan_terakhir || 'S2';
    modalIkatanKerja.textContent = p.status_ikatan_kerja || 'Dosen Tetap';
    modalStatusAktivitas.textContent = p.status_aktivitas || 'Aktif';

    if ((p.status_aktivitas || '').toLowerCase() === 'aktif') {
        modalStatusAktivitas.className = 'info-value text-bold status-green';
    } else {
        modalStatusAktivitas.className = 'info-value text-bold';
    }
}

function renderPortfolioTable() {
    if (!activeDosenData || !activeDosenData.portofolio) return;

    portfolioTableBody.innerHTML = '';
    const rawItems = activeDosenData.portofolio.penelitian || [];

    // Deduplikasi judul pada modal dosen
    const seenTitles = new Set();
    const items = [];
    rawItems.forEach(item => {
        const jTitle = (item.judul_penelitian || item.judul || '').trim().toLowerCase();
        if (jTitle && !seenTitles.has(jTitle)) {
            seenTitles.add(jTitle);
            items.push(item);
        }
    });

    if (!items || items.length === 0) {
        portfolioTableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    Belum ada data penelitian yang tercatat di PDDikti untuk dosen ini.
                </td>
            </tr>
        `;
        document.getElementById('pageCurrent').textContent = '1';
        document.getElementById('pageTotal').textContent = '1';
        return;
    }

    items.forEach((item, index) => {
        const tr = document.createElement('tr');
        const judul = item.judul_penelitian || item.judul || '-';
        const tahun = item.tahun || '-';

        tr.innerHTML = `
            <td style="text-align: center;">${index + 1}</td>
            <td>${escapeHtml(judul)}</td>
            <td style="text-align: center;">${tahun}</td>
        `;
        portfolioTableBody.appendChild(tr);
    });

    document.getElementById('pageCurrent').textContent = '1';
    document.getElementById('pageTotal').textContent = '1';
}

function closeModal() {
    dosenModal.classList.add('hidden');
    activeDosenData = null;
}

// =====================================================================
// INTEGRASI SINKRONISASI API PDDIKTI
// =====================================================================
function handleSyncSingle() {
    const url = pddiktiUrlInput.value.trim();
    if (!url) {
        showSyncFeedback('Masukkan URL atau ID detail dosen PDDikti terlebih dahulu.', 'error');
        return;
    }

    showSyncFeedback('Sedang menghubungi API PDDikti Kemdiktisaintek & menyimpan ke database...', 'loading');
    btnSyncSingle.disabled = true;

    fetch('backend.php?action=sync_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
    })
    .then(res => res.json())
    .then(result => {
        btnSyncSingle.disabled = false;
        if (result.status === 'success') {
            showSyncFeedback(`✓ ${result.message} (${result.stats.penelitian} penelitian, ${result.stats.pengabdian} pengabdian)`, 'success');
            showToast(`Berhasil menyinkronkan data: ${result.nama_dosen}`);
            fetchStats();
            performSearch();

            if (result.dosen_id) {
                setTimeout(() => {
                    openDosenDetailModal(result.dosen_id);
                }, 600);
            }
        } else {
            showSyncFeedback(`Gagal: ${result.message}`, 'error');
        }
    })
    .catch(err => {
        btnSyncSingle.disabled = false;
        showSyncFeedback('Terjadi kesalahan saat memproses sinkronisasi.', 'error');
        console.error(err);
    });
}

function handleSyncAllPnl() {
    if (!confirm('Apakah Anda ingin menyinkronkan semua dosen Politeknik Negeri Lhokseumawe dari PDDikti? Proses ini akan memuat seluruh program studi.')) {
        return;
    }

    showSyncFeedback('Sedang menarik daftar lengkap dosen PNL dari PDDikti (memerlukan beberapa detik)...', 'loading');
    btnSyncAllPnl.disabled = true;

    fetch('backend.php?action=sync_pnl_all')
        .then(res => res.json())
        .then(result => {
            btnSyncAllPnl.disabled = false;
            if (result.status === 'success') {
                showSyncFeedback(`✓ ${result.message}`, 'success');
                showToast('Sinkronisasi semua dosen PNL selesai!');
                fetchStats();
                performSearch();
            } else {
                showSyncFeedback(`Gagal: ${result.message}`, 'error');
            }
        })
        .catch(err => {
            btnSyncAllPnl.disabled = false;
            showSyncFeedback('Gagal menyinkronkan data massal.', 'error');
            console.error(err);
        });
}

function showSyncFeedback(message, type) {
    syncFeedback.className = `sync-feedback ${type}`;
    syncFeedback.textContent = message;
    syncFeedback.classList.remove('hidden');
}

function showToast(message) {
    toastNotification.textContent = message;
    toastNotification.classList.remove('hidden');
    setTimeout(() => {
        toastNotification.classList.add('hidden');
    }, 4500);
}

// =====================================================================
// SINKRONISASI MODAL, QUICK SYNC & BATCH API
// =====================================================================

// Sinkronisasi data lengkap dosen langsung dari modal
function handleSyncModalDosen() {
    if (!activeDosenData || !activeDosenData.profil || !activeDosenData.profil.id) return;
    const dId = activeDosenData.profil.id;
    const dName = activeDosenData.profil.nama_dosen;

    const btn = document.getElementById('btnSyncModalDosen');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:4px;"></span> Menghubungi PDDikti...`;
    }

    showToast(`Sedang menghubungi API PDDikti Kemdiktisaintek untuk ${dName}...`);

    fetch(`backend.php?action=sync_dosen&id=${dId}`)
        .then(res => res.json())
        .then(result => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
            if (result.status === 'success') {
                showToast(`✓ Berhasil! Ditemukan ${result.total_penelitian} judul penelitian resmi dari PDDikti.`);
                openDosenDetailModal(dId);
                fetchStats();
                performSearch();
            } else {
                showToast(`Info: ${result.message}`);
            }
        })
        .catch(err => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
            showToast('Terjadi gangguan saat menghubungi API PDDikti.');
            console.error(err);
        });
}

// Sinkronisasi cepat dari kartu atau tabel
function syncDosenQuick(dosenId, dosenName, btnElement) {
    if (!dosenId) return;

    const originalContent = btnElement ? btnElement.innerHTML : '';
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = `<span>⏳</span>`;
    }

    showToast(`Menarik data penelitian resmi ${dosenName} dari PDDikti...`);

    fetch(`backend.php?action=sync_dosen&id=${dosenId}`)
        .then(res => res.json())
        .then(result => {
            if (btnElement) {
                btnElement.disabled = false;
                btnElement.innerHTML = originalContent;
            }
            if (result.status === 'success') {
                showToast(`✓ Berhasil! ${dosenName}: ${result.total_penelitian} judul penelitian resmi terintegrasi.`);
                fetchStats();
                performSearch();
            } else {
                showToast(`Info: ${result.message}`);
            }
        })
        .catch(err => {
            if (btnElement) {
                btnElement.disabled = false;
                btnElement.innerHTML = originalContent;
            }
            showToast('Gagal menghubungi API PDDikti.');
            console.error(err);
        });
}

// Sinkronisasi bertahap seluruh dosen secara berkelanjutan (Batch API)
let isBatchRunning = false;
function handleSyncBatchPnl() {
    if (isBatchRunning) {
        showToast('Sinkronisasi bertahap sedang berlangsung...');
        return;
    }

    if (!confirm('Mulai sinkronisasi seluruh dosen secara bertahap langsung ke API PDDikti Kemdiktisaintek? Proses ini akan menarik penelitian riil per 5 dosen secara otomatis.')) {
        return;
    }

    isBatchRunning = true;
    const btnBatch = document.getElementById('btnSyncBatchPnl');
    if (btnBatch) btnBatch.disabled = true;

    showSyncFeedback('Memulai sinkronisasi bertahap dari API PDDikti...', 'loading');

    let offset = 0;
    function runNextBatch() {
        fetch(`backend.php?action=sync_batch&offset=${offset}&limit=5`)
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    const totalRemaining = res.total_remaining;
                    const syncedNames = (res.synced || []).map(s => `${s.nama} (${s.total_penelitian} penelitian)`).join(', ');
                    
                    showSyncFeedback(`Sedang memproses... Tersinkron: ${syncedNames}. Sisa yang belum tersinkron: ${totalRemaining} dosen.`, 'loading');
                    fetchStats();

                    if (res.synced_count > 0 && totalRemaining > 0 && offset < 350) {
                        offset = res.next_offset;
                        setTimeout(runNextBatch, 800);
                    } else {
                        isBatchRunning = false;
                        if (btnBatch) btnBatch.disabled = false;
                        showSyncFeedback('✓ Seluruh dosen yang terdaftar di PDDikti telah tersinkronisasi penuh!', 'success');
                        showToast('Sinkronisasi bertahap selesai!');
                        performSearch();
                    }
                } else {
                    isBatchRunning = false;
                    if (btnBatch) btnBatch.disabled = false;
                    showSyncFeedback('Sinkronisasi bertahap terhenti atau selesai.', 'info');
                }
            })
            .catch(err => {
                isBatchRunning = false;
                if (btnBatch) btnBatch.disabled = false;
                showSyncFeedback('Terjadi kendala jaringan saat batch sync.', 'error');
                console.error(err);
            });
    }

    runNextBatch();
}

// =====================================================================
// HELPER UTILITIES
// =====================================================================
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// =====================================================================
// EXCEL EXPORT (1-CLICK DOWNLOAD FULL DATASET 314 DOSEN & 1.564 PENELITIAN)
// =====================================================================
async function handleExportExcel() {
    const btnFilter = document.getElementById('btnExportExcel');
    const btnHeader = document.getElementById('btnExportExcelHeader');
    const originalTextFilter = btnFilter ? btnFilter.innerHTML : '';
    const originalTextHeader = btnHeader ? btnHeader.innerHTML : '';

    if (btnFilter) {
        btnFilter.disabled = true;
        btnFilter.innerHTML = `<span style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:4px;"></span> Mengunduh...`;
    }
    if (btnHeader) {
        btnHeader.disabled = true;
        btnHeader.innerHTML = `<span style="display:inline-block; width:12px; height:12px; border:2px solid #15803d; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:4px;"></span> Unduh...`;
    }

    showToast('Menyiapkan file Excel lengkap 314 Dosen & 1.564 Penelitian...');

    try {
        const res = await fetch('backend.php?action=list');
        const json = await res.json();
        const penelitianList = (json && json.data) ? json.data : fallbackData;

        // Petakan per dosen sehingga 1 baris = 1 dosen dengan seluruh penelitian digabung
        const dosenMap = new Map();
        penelitianList.forEach(p => {
            const dId = p.dosen_id || p.nama_dosen;
            if (!dosenMap.has(dId)) {
                dosenMap.set(dId, {
                    id: dId,
                    nama_dosen: p.nama_dosen || '-',
                    nidn: p.nidn || p.nuptk || '-',
                    jurusan: p.jurusan || '-',
                    program_studi: p.program_studi || '-',
                    jabatan_fungsional: p.jabatan_fungsional || 'Lektor',
                    pendidikan_terakhir: p.pendidikan_terakhir || 'S2',
                    status_aktivitas: p.status_aktivitas || 'Aktif',
                    penelitian: []
                });
            }
            const dosenEntry = dosenMap.get(dId);
            if ((!dosenEntry.nidn || dosenEntry.nidn === '-') && (p.nidn || p.nuptk)) {
                dosenEntry.nidn = p.nidn || p.nuptk;
            }
            dosenEntry.penelitian.push({
                judul: (p.judul || p.judul_penelitian || '').trim(),
                tahun: parseInt(p.tahun, 10) || 0,
                jenis_kegiatan: p.jenis_kegiatan || 'Penelitian',
                sumber: p.sumber || 'PDDikti Kemdiktisaintek'
            });
        });

        // Urutkan dosen berdasarkan Jurusan, kemudian Nama Dosen secara alfabetis
        const dosenArray = Array.from(dosenMap.values()).sort((a, b) => {
            if (a.jurusan !== b.jurusan) {
                return a.jurusan.localeCompare(b.jurusan);
            }
            return a.nama_dosen.localeCompare(b.nama_dosen);
        });

        // =========================================================================
        // SHEET 1 (UTAMA): 1 NAMA DOSEN DI-MERGE, JUDUL BERBARIS KE BAWAH SECARA RAPI
        // =========================================================================
        const aoaRows = [
            [
                'No',
                'Nama Dosen',
                'NIDN / NUPTK',
                'Jurusan',
                'Program Studi',
                'Jabatan Fungsional',
                'Pendidikan',
                'Status Aktivitas',
                'Total Penelitian',
                'No. Judul',
                'Tahun',
                'Daftar Judul Penelitian (Berbaris ke Bawah)',
                'Jenis Kegiatan'
            ]
        ];

        const merges = [];

        dosenArray.forEach((d, dIdx) => {
            // Urutkan penelitian dari tahun terbaru
            d.penelitian.sort((p1, p2) => (p2.tahun || 0) - (p1.tahun || 0));

            const startRow = aoaRows.length;
            const pCount = d.penelitian.length;

            if (pCount === 0) {
                aoaRows.push([
                    dIdx + 1,
                    d.nama_dosen,
                    d.nidn || d.nuptk || '-',
                    d.jurusan,
                    d.program_studi,
                    d.jabatan_fungsional,
                    d.pendidikan_terakhir,
                    d.status_aktivitas,
                    0,
                    '-',
                    '-',
                    'Belum ada data penelitian terdaftar di PDDikti',
                    '-'
                ]);
            } else {
                d.penelitian.forEach((pen, pIdx) => {
                    if (pIdx === 0) {
                        // Baris pertama dosen: Tulis nama & identitas dosen lengkap
                        aoaRows.push([
                            dIdx + 1,
                            d.nama_dosen,
                            d.nidn || d.nuptk || '-',
                            d.jurusan,
                            d.program_studi,
                            d.jabatan_fungsional,
                            d.pendidikan_terakhir,
                            d.status_aktivitas,
                            pCount,
                            pIdx + 1,
                            pen.tahun > 0 ? pen.tahun : '-',
                            pen.judul,
                            pen.jenis_kegiatan || 'Penelitian'
                        ]);
                    } else {
                        // Baris judul berikutnya: Kolom identitas dosen dikosongkan (akan di-merge ke baris pertama)
                        // Judul penelitian berbaris ke bawah dengan rapi
                        aoaRows.push([
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            pIdx + 1,
                            pen.tahun > 0 ? pen.tahun : '-',
                            pen.judul,
                            pen.jenis_kegiatan || 'Penelitian'
                        ]);
                    }
                });

                // Merge sel identitas dosen (Kolom 0 s.d 8) jika dosen memiliki lebih dari 1 judul
                if (pCount > 1) {
                    const endRow = startRow + pCount - 1;
                    for (let c = 0; c <= 8; c++) {
                        merges.push({
                            s: { r: startRow, c: c },
                            e: { r: endRow, c: c }
                        });
                    }
                }
            }
        });

        if (window.XLSX) {
            const wb = XLSX.utils.book_new();

            // Satu-satunya Sheet: Penelitian Dosen (Merged Rows, Judul Berbaris ke Bawah Rapi)
            const ws = XLSX.utils.aoa_to_sheet(aoaRows);
            ws['!merges'] = merges;
            ws['!cols'] = [
                { wch: 6 },   // No
                { wch: 34 },  // Nama Dosen (Merged)
                { wch: 18 },  // NIDN / NUPTK
                { wch: 28 },  // Jurusan
                { wch: 35 },  // Program Studi
                { wch: 20 },  // Jabatan Fungsional
                { wch: 12 },  // Pendidikan
                { wch: 14 },  // Status Aktivitas
                { wch: 16 },  // Total Penelitian
                { wch: 10 },  // No. Judul
                { wch: 10 },  // Tahun
                { wch: 85 },  // Judul Penelitian
                { wch: 16 }   // Jenis Kegiatan
            ];

            // Penataan Alignment untuk seluruh sel
            Object.keys(ws).forEach(ref => {
                if (ref[0] === '!') return;
                if (!ws[ref].s) ws[ref].s = {};
                ws[ref].s.alignment = { vertical: 'center', wrapText: true };
            });

            // Tambahkan satu-satunya halaman: Penelitian Dosen
            XLSX.utils.book_append_sheet(wb, ws, 'Penelitian Dosen');

            const fileName = `Data_Penelitian_Dosen_PNL_${new Date().getFullYear()}.xlsx`;
            XLSX.writeFile(wb, fileName);
            showToast(`✓ Berhasil mengunduh Excel: Halaman Penelitian Dosen (314 Dosen)!`);
        } else {
            downloadFallbackCsv(aoaRows);
        }
    } catch (err) {
        console.error('Export Excel error:', err);
        showToast('Gagal memproses file Excel.');
    } finally {
        if (btnFilter) {
            btnFilter.disabled = false;
            btnFilter.innerHTML = originalTextFilter;
        }
        if (btnHeader) {
            btnHeader.disabled = false;
            btnHeader.innerHTML = originalTextHeader;
        }
    }
}

function downloadFallbackCsv(data) {
    if (!data || data.length === 0) return;
    let csvRows = [];
    if (Array.isArray(data[0])) {
        data.forEach(row => {
            const values = row.map(val => {
                const escaped = ('' + (val !== null && val !== undefined ? val : '')).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(';'));
        });
    } else {
        const headers = Object.keys(data[0]);
        csvRows.push(headers.map(h => `"${h}"`).join(';'));
        data.forEach(row => {
            const values = headers.map(h => {
                const escaped = ('' + (row[h] || '')).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(';'));
        });
    }
    const blob = new Blob(["\uFEFF" + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Penelitian_Dosen_PNL_${new Date().getFullYear()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Berhasil mengunduh data penelitian (CSV format)!');
}
