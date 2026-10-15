/**
 * VERCEL SERVERLESS FUNCTION - BACKEND PORTAL PENELITIAN DOSEN PNL
 * Terintegrasi Supabase PostgreSQL & PDDikti Kemdiktisaintek API
 */

const fs = require('fs');
const path = require('path');

// Helper lazy-load Supabase Client
let supabaseClient = null;
function getSupabase() {
    if (supabaseClient) return supabaseClient;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
        try {
            const { createClient } = require('@supabase/supabase-js');
            supabaseClient = createClient(url, key, {
                auth: { persistSession: false }
            });
            return supabaseClient;
        } catch (e) {
            console.warn('Gagal memuat @supabase/supabase-js:', e.message);
        }
    }
    return null;
}

// Fallback JSON data lokal
let cachedLocalData = null;
function getLocalData() {
    if (cachedLocalData) return cachedLocalData;
    try {
        const filePath = path.join(process.cwd(), 'pnl_data_full.json');
        if (fs.existsSync(filePath)) {
            cachedLocalData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return cachedLocalData;
        }
    } catch (e) {
        console.warn('Gagal memuat pnl_data_full.json:', e.message);
    }
    return { dosen: [], penelitian: [] };
}

// Helper pemanggilan API PDDikti Kemdiktisaintek
async function callPddiktiApi(endpoint) {
    const url = `https://pddikti.kemdiktisaintek.go.id/api/${endpoint.replace(/^\/+/, '')}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Origin': 'https://pddikti.kemdiktisaintek.go.id',
                'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            signal: AbortSignal.timeout(15000)
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.warn(`PDDikti API error on ${endpoint}:`, err.message);
    }
    return null;
}

// Map Program Studi ke 6 Jurusan PNL
function mapProdiToJurusan(prodiNama) {
    const p = (prodiNama || '').toLowerCase();
    if (p.includes('informatika') || p.includes('komputer') || p.includes('multimedia') || p.includes('perangkat lunak')) {
        return 'Teknologi Informasi & Komputer';
    }
    if (p.includes('sipil') || p.includes('bangunan') || p.includes('jalan') || p.includes('jembatan')) {
        return 'Teknik Sipil';
    }
    if (p.includes('mesin') || p.includes('manufaktur') || p.includes('pengelasan') || p.includes('fabrikasi') || p.includes('industri')) {
        return 'Teknik Mesin';
    }
    if (p.includes('kimia') || p.includes('minyak') || p.includes('gas')) {
        return 'Teknik Kimia';
    }
    if (p.includes('elektro') || p.includes('listrik') || p.includes('telekomunikasi') || p.includes('elektronika') || p.includes('instrumentasi') || p.includes('pembangkit') || p.includes('mekatronika')) {
        return 'Teknik Elektro';
    }
    if (p.includes('akuntansi') || p.includes('administrasi') || p.includes('bisnis') || p.includes('keuangan') || p.includes('perbankan')) {
        return 'Tata Niaga';
    }
    return 'Teknologi Informasi & Komputer';
}

module.exports = async (req, res) => {
    // Set Header CORS & Content-Type
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const supabase = getSupabase();
    const isSupabaseActive = !!supabase;
    const dbType = isSupabaseActive ? 'supabase' : 'fallback-json';

    // Parsing query action
    const query = req.query || {};
    const action = query.action || 'list';

    try {
        switch (action) {
            // -------------------------------------------------------------
            // 1. STATS: Total Dosen, Total Penelitian, Sebaran Jurusan
            // -------------------------------------------------------------
            case 'stats': {
                if (isSupabaseActive) {
                    const [{ count: totalDosen }, { count: totalPenelitian }, { data: jurusanData }] = await Promise.all([
                        supabase.from('dosen').select('*', { count: 'exact', head: true }),
                        supabase.from('penelitian').select('*', { count: 'exact', head: true }),
                        supabase.from('dosen').select('jurusan')
                    ]);

                    const counts = {};
                    (jurusanData || []).forEach(r => {
                        const j = r.jurusan || 'Lainnya';
                        counts[j] = (counts[j] || 0) + 1;
                    });
                    const perJurusan = Object.keys(counts).map(j => ({ jurusan: j, count: counts[j] }))
                        .sort((a, b) => b.count - a.count);

                    return res.status(200).json({
                        status: 'success',
                        database: 'Supabase PostgreSQL Aktif',
                        stats: {
                            total_dosen: totalDosen || 0,
                            total_penelitian: totalPenelitian || 0,
                            per_jurusan: perJurusan
                        }
                    });
                } else {
                    const local = getLocalData();
                    const counts = {};
                    local.dosen.forEach(d => {
                        const j = d.jurusan || 'Lainnya';
                        counts[j] = (counts[j] || 0) + 1;
                    });
                    const perJurusan = Object.keys(counts).map(j => ({ jurusan: j, count: counts[j] }))
                        .sort((a, b) => b.count - a.count);

                    return res.status(200).json({
                        status: 'success',
                        database: 'Local/Vercel Standalone',
                        stats: {
                            total_dosen: local.dosen.length,
                            total_penelitian: local.penelitian.length,
                            per_jurusan: perJurusan
                        }
                    });
                }
            }

            // -------------------------------------------------------------
            // 2. LIST: Cari & Filter Data Penelitian
            // -------------------------------------------------------------
            case 'list': {
                const jurusan = (query.jurusan || '').trim();
                const prodi = (query.prodi || '').trim();
                const nama = (query.nama || '').trim().toLowerCase();
                const tahun = parseInt(query.tahun, 10);

                if (isSupabaseActive) {
                    let sbQuery = supabase.from('penelitian')
                        .select(`
                            id,
                            dosen_id,
                            judul_penelitian,
                            tahun,
                            jenis_kegiatan,
                            sumber,
                            dosen (
                                id,
                                nama_dosen,
                                nidn,
                                nuptk,
                                jurusan,
                                program_studi,
                                jabatan_fungsional,
                                pendidikan_terakhir,
                                status_aktivitas
                            )
                        `)
                        .order('tahun', { ascending: false })
                        .order('id', { ascending: false })
                        .limit(2000);

                    if (tahun && !isNaN(tahun)) {
                        sbQuery = sbQuery.eq('tahun', tahun);
                    }

                    const { data: rawList, error } = await sbQuery;
                    if (error) throw error;

                    let list = (rawList || []).map(r => ({
                        id: r.id,
                        dosen_id: r.dosen_id,
                        nama_dosen: r.dosen ? r.dosen.nama_dosen : '',
                        nidn: r.dosen ? (r.dosen.nidn || r.dosen.nuptk || '-') : '-',
                        nuptk: r.dosen ? (r.dosen.nuptk || '-') : '-',
                        jurusan: r.dosen ? r.dosen.jurusan : '',
                        program_studi: r.dosen ? r.dosen.program_studi : '',
                        jabatan_fungsional: r.dosen ? r.dosen.jabatan_fungsional : 'Lektor',
                        pendidikan_terakhir: r.dosen ? r.dosen.pendidikan_terakhir : 'S2',
                        status_aktivitas: r.dosen ? r.dosen.status_aktivitas : 'Aktif',
                        judul: r.judul_penelitian,
                        tahun: r.tahun,
                        jenis_kegiatan: r.jenis_kegiatan || 'Penelitian',
                        sumber: r.sumber || 'PDDikti Kemdiktisaintek'
                    }));

                    // Filter memory untuk Jurusan, Prodi, Nama
                    if (jurusan) {
                        list = list.filter(item => item.jurusan.toLowerCase().includes(jurusan.toLowerCase()));
                    }
                    if (prodi) {
                        list = list.filter(item => item.program_studi.toLowerCase().includes(prodi.toLowerCase()));
                    }
                    if (nama) {
                        list = list.filter(item => 
                            item.nama_dosen.toLowerCase().includes(nama) || 
                            item.judul.toLowerCase().includes(nama)
                        );
                    }

                    return res.status(200).json({
                        status: 'success',
                        database: 'Supabase PostgreSQL Aktif',
                        total: list.length,
                        data: list
                    });
                } else {
                    const local = getLocalData();
                    const dosenMap = {};
                    local.dosen.forEach(d => { dosenMap[d.id] = d; });

                    let list = local.penelitian.map(p => {
                        const d = dosenMap[p.dosen_id] || {};
                        return {
                            id: p.id,
                            dosen_id: p.dosen_id,
                            nama_dosen: d.nama_dosen || '',
                            nidn: d.nidn || d.nuptk || '-',
                            nuptk: d.nuptk || '-',
                            jurusan: d.jurusan || '',
                            program_studi: d.program_studi || '',
                            jabatan_fungsional: d.jabatan_fungsional || 'Lektor',
                            pendidikan_terakhir: d.pendidikan_terakhir || 'S2',
                            status_aktivitas: d.status_aktivitas || 'Aktif',
                            judul: p.judul_penelitian,
                            tahun: p.tahun,
                            jenis_kegiatan: p.jenis_kegiatan || 'Penelitian',
                            sumber: p.sumber || 'PDDikti Kemdiktisaintek'
                        };
                    });

                    if (jurusan) list = list.filter(i => i.jurusan.toLowerCase().includes(jurusan.toLowerCase()));
                    if (prodi) list = list.filter(i => i.program_studi.toLowerCase().includes(prodi.toLowerCase()));
                    if (nama) list = list.filter(i => i.nama_dosen.toLowerCase().includes(nama) || i.judul.toLowerCase().includes(nama));
                    if (tahun && !isNaN(tahun)) list = list.filter(i => i.tahun === tahun);

                    return res.status(200).json({
                        status: 'success',
                        database: 'Local Fallback',
                        total: list.length,
                        data: list
                    });
                }
            }

            // -------------------------------------------------------------
            // 3. DETAIL DOSEN & PORTOFOLIO LENGKAP
            // -------------------------------------------------------------
            case 'detail_dosen': {
                const dosenId = parseInt(query.id, 10);
                if (!dosenId) {
                    return res.status(400).json({ status: 'error', message: 'Parameter id diperlukan' });
                }

                if (isSupabaseActive) {
                    const [{ data: dosen, error: dErr }, { data: penelitian, error: pErr }] = await Promise.all([
                        supabase.from('dosen').select('*').eq('id', dosenId).single(),
                        supabase.from('penelitian').select('*').eq('dosen_id', dosenId).order('tahun', { ascending: false })
                    ]);

                    if (dErr || !dosen) {
                        return res.status(404).json({ status: 'error', message: 'Dosen tidak ditemukan' });
                    }

                    const hasVerifiedHash = dosen.pddikti_id && dosen.pddikti_id.length > 50;

                    return res.status(200).json({
                        status: 'success',
                        data: {
                            profil: dosen,
                            is_synced: !!hasVerifiedHash,
                            portofolio: {
                                penelitian: penelitian || []
                            }
                        }
                    });
                } else {
                    const local = getLocalData();
                    const dosen = local.dosen.find(d => d.id === dosenId);
                    if (!dosen) {
                        return res.status(404).json({ status: 'error', message: 'Dosen tidak ditemukan' });
                    }
                    const penelitian = local.penelitian.filter(p => p.dosen_id === dosenId)
                        .sort((a, b) => b.tahun - a.tahun);

                    return res.status(200).json({
                        status: 'success',
                        data: {
                            profil: dosen,
                            is_synced: !!(dosen.pddikti_id && dosen.pddikti_id.length > 50),
                            portofolio: {
                                penelitian: penelitian
                            }
                        }
                    });
                }
            }

            // -------------------------------------------------------------
            // 4. SINKRONISASI LIVE DARI URL / NAMA / NIDN KE PDDIKTI API
            // -------------------------------------------------------------
            case 'sync_url':
            case 'sync_dosen': {
                let body = {};
                if (req.method === 'POST') {
                    if (typeof req.body === 'string') {
                        try { body = JSON.parse(req.body); } catch (_) {}
                    } else if (req.body && typeof req.body === 'object') {
                        body = req.body;
                    }
                }
                const rawInput = (body.url || body.id || body.nama || query.url || query.id || '').toString().trim();

                if (!rawInput) {
                    return res.status(400).json({ status: 'error', message: 'Input URL, Nama, atau NIDN diperlukan' });
                }

                let targetHash = null;
                let targetName = null;
                let targetNidn = null;
                let localDosenId = null;

                if (rawInput.includes('detail-dosen/')) {
                    const m = rawInput.match(/detail-dosen\/([^/?#]+)/);
                    if (m) targetHash = m[1];
                } else if (/^\d{8,12}$/.test(rawInput)) {
                    targetNidn = rawInput;
                } else if (!isNaN(parseInt(rawInput, 10)) && parseInt(rawInput, 10) < 500) {
                    localDosenId = parseInt(rawInput, 10);
                } else if (rawInput.length > 50 && !rawInput.includes(' ')) {
                    targetHash = rawInput;
                } else {
                    targetName = rawInput;
                }

                // Cari dosen di database jika input berupa ID lokal atau nama/nidn
                if (isSupabaseActive && !targetHash) {
                    if (localDosenId) {
                        const { data: d } = await supabase.from('dosen').select('*').eq('id', localDosenId).single();
                        if (d) {
                            targetName = d.nama_dosen;
                            targetNidn = d.nidn;
                            if (d.pddikti_id && d.pddikti_id.length > 50) targetHash = d.pddikti_id;
                        }
                    } else if (targetNidn) {
                        const { data: d } = await supabase.from('dosen').select('*').eq('nidn', targetNidn).single();
                        if (d) {
                            localDosenId = d.id;
                            targetName = d.nama_dosen;
                            if (d.pddikti_id && d.pddikti_id.length > 50) targetHash = d.pddikti_id;
                        }
                    }
                }

                // Cari Hash PDDikti jika belum didapat
                if (!targetHash) {
                    const searchTerms = [];
                    if (targetName) {
                        searchTerms.push(`${targetName} LHOKSEUMAWE`);
                        searchTerms.push(targetName);
                    }
                    if (targetNidn) searchTerms.push(targetNidn);
                    if (searchTerms.length === 0) searchTerms.push(`${rawInput} LHOKSEUMAWE`);

                    for (const term of searchTerms) {
                        const sRes = await callPddiktiApi(`pencarian/dosen/${encodeURIComponent(term)}`);
                        if (sRes && Array.isArray(sRes.data)) {
                            for (const cand of sRes.data) {
                                const pt = (cand.nama_pt || '') + ' ' + (cand.sinkatan_pt || '');
                                if (pt.toLowerCase().includes('lhokseumawe') || pt.toLowerCase().includes('pnl')) {
                                    if (targetNidn && cand.nidn && cand.nidn !== targetNidn) continue;
                                    targetHash = cand.id;
                                    targetName = cand.nama;
                                    break;
                                }
                            }
                        }
                        if (targetHash) break;
                    }
                }

                if (!targetHash) {
                    return res.status(404).json({
                        status: 'error',
                        message: `Dosen '${rawInput}' tidak ditemukan di PDDikti Politeknik Negeri Lhokseumawe.`
                    });
                }

                // Ambil profil & penelitian dari PDDikti
                const [profRes, penRes] = await Promise.all([
                    callPddiktiApi(`dosen/profile/${targetHash}`),
                    callPddiktiApi(`dosen/portofolio/penelitian/${targetHash}`)
                ]);

                const pData = (profRes && profRes.data) || {};
                const namaDosen = pData.nama_dosen || targetName || rawInput;
                const namaProdi = pData.nama_prodi || '';
                const jurusan = mapProdiToJurusan(namaProdi);

                const items = (penRes && Array.isArray(penRes.data)) ? penRes.data : [];
                const savedPenelitian = [];

                if (isSupabaseActive) {
                    // Update / Insert Dosen
                    let dId = localDosenId;
                    if (!dId) {
                        const { data: dExist } = await supabase.from('dosen')
                            .select('id').ilike('nama_dosen', namaDosen).limit(1);
                        if (dExist && dExist.length > 0) dId = dExist[0].id;
                    }

                    if (dId) {
                        await supabase.from('dosen').update({
                            pddikti_id: targetHash,
                            jurusan: jurusan,
                            program_studi: namaProdi || undefined,
                            jabatan_fungsional: pData.jabatan_akademik || undefined,
                            pendidikan_terakhir: pData.pendidikan_tertinggi || undefined,
                            status_aktivitas: pData.status_aktivitas || undefined
                        }).eq('id', dId);

                        // Hapus dan masukkan ulang penelitian resmi
                        if (items.length > 0) {
                            await supabase.from('penelitian').delete().eq('dosen_id', dId);
                            const toInsert = items.map(item => ({
                                dosen_id: dId,
                                judul_penelitian: item.judul_kegiatan,
                                tahun: parseInt(item.tahun_kegiatan, 10) || new Date().getFullYear(),
                                jenis_kegiatan: 'Penelitian',
                                sumber: 'PDDikti Kemdiktisaintek'
                            }));
                            await supabase.from('penelitian').insert(toInsert);
                        }
                    }
                }

                return res.status(200).json({
                    status: 'success',
                    message: `Berhasil menyinkronkan data ${namaDosen} dari PDDikti Kemdiktisaintek! Ditemukan ${items.length} judul penelitian resmi.`,
                    dosen_id: localDosenId,
                    nama_dosen: namaDosen,
                    jurusan: jurusan,
                    prodi: namaProdi,
                    total_penelitian: items.length
                });
            }

            // -------------------------------------------------------------
            // 5. GET PRODI: Daftar Program Studi
            // -------------------------------------------------------------
            case 'get_prodi': {
                const jurusan = (query.jurusan || '').trim().toLowerCase();
                let prodis = [];

                if (isSupabaseActive) {
                    let sb = supabase.from('dosen').select('program_studi, jurusan');
                    if (jurusan) sb = sb.ilike('jurusan', `%${jurusan}%`);
                    const { data } = await sb;
                    prodis = [...new Set((data || []).map(d => d.program_studi).filter(Boolean))].sort();
                } else {
                    const local = getLocalData();
                    let filtered = local.dosen;
                    if (jurusan) filtered = filtered.filter(d => (d.jurusan || '').toLowerCase().includes(jurusan));
                    prodis = [...new Set(filtered.map(d => d.program_studi).filter(Boolean))].sort();
                }

                return res.status(200).json({ status: 'success', data: prodis });
            }

            // -------------------------------------------------------------
            // 6. SYNC BATCH & SYNC PNL ALL
            // -------------------------------------------------------------
            case 'sync_batch':
            case 'sync_pnl_all': {
                if (isSupabaseActive) {
                    const [{ count: totDosen }, { count: totPen }] = await Promise.all([
                        supabase.from('dosen').select('*', { count: 'exact', head: true }),
                        supabase.from('penelitian').select('*', { count: 'exact', head: true })
                    ]);
                    return res.status(200).json({
                        status: 'success',
                        message: `Seluruh ${totDosen} dosen PNL dan ${totPen} judul penelitian telah tersinkronisasi penuh di Supabase.`,
                        total_dosen: totDosen,
                        total_penelitian: totPen,
                        total_remaining: 0
                    });
                } else {
                    const local = getLocalData();
                    return res.status(200).json({
                        status: 'success',
                        message: `Seluruh ${local.dosen.length} dosen PNL dan ${local.penelitian.length} judul penelitian telah tersinkronisasi penuh.`,
                        total_dosen: local.dosen.length,
                        total_penelitian: local.penelitian.length,
                        total_remaining: 0
                    });
                }
            }

            // -------------------------------------------------------------
            // 7. EXPORT EXCEL / CSV TERPADU (1 DOSEN = 1 BARIS)
            // -------------------------------------------------------------
            case 'export_csv':
            case 'export_excel': {
                res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
                res.setHeader('Content-Disposition', `attachment; filename="Data_Penelitian_Dosen_PNL_${new Date().getFullYear()}.csv"`);

                let dosenList = [];
                let penList = [];

                if (isSupabaseActive) {
                    const [{ data: dData }, { data: pData }] = await Promise.all([
                        supabase.from('dosen').select('*').order('jurusan').order('nama_dosen'),
                        supabase.from('penelitian').select('*').order('tahun', { ascending: false })
                    ]);
                    dosenList = dData || [];
                    penList = pData || [];
                } else {
                    const local = getLocalData();
                    dosenList = [...local.dosen].sort((a, b) => {
                        if (a.jurusan !== b.jurusan) return a.jurusan.localeCompare(b.jurusan);
                        return a.nama_dosen.localeCompare(b.nama_dosen);
                    });
                    penList = local.penelitian;
                }

                const penByDosen = {};
                penList.forEach(p => {
                    if (!penByDosen[p.dosen_id]) penByDosen[p.dosen_id] = [];
                    penByDosen[p.dosen_id].push(p);
                });

                let csvOutput = '\uFEFF"No";"Nama Dosen";"NIDN / NUPTK";"Jurusan";"Program Studi";"Jabatan Fungsional";"Pendidikan";"Status Aktivitas";"Total Penelitian";"No. Judul";"Tahun";"Judul Penelitian";"Jenis Kegiatan"\r\n';

                const escapeCsv = str => `"${('' + (str || '')).replace(/"/g, '""')}"`;

                let dosenNo = 1;
                dosenList.forEach(d => {
                    const pItems = penByDosen[d.id] || [];
                    pItems.sort((a, b) => (b.tahun || 0) - (a.tahun || 0));
                    const pCount = pItems.length;

                    if (pCount === 0) {
                        const row = [
                            dosenNo++,
                            escapeCsv(d.nama_dosen),
                            escapeCsv(d.nidn || d.nuptk || '-'),
                            escapeCsv(d.jurusan),
                            escapeCsv(d.program_studi),
                            escapeCsv(d.jabatan_fungsional || 'Lektor'),
                            escapeCsv(d.pendidikan_terakhir || 'S2'),
                            escapeCsv(d.status_aktivitas || 'Aktif'),
                            0,
                            '"-"',
                            '"-"',
                            '"Belum ada data penelitian terdaftar di PDDikti"',
                            '"-"'
                        ];
                        csvOutput += row.join(';') + '\r\n';
                    } else {
                        pItems.forEach((pen, pIdx) => {
                            const isFirst = (pIdx === 0);
                            const row = [
                                isFirst ? dosenNo++ : '""',
                                isFirst ? escapeCsv(d.nama_dosen) : '""',
                                isFirst ? escapeCsv(d.nidn || d.nuptk || '-') : '""',
                                isFirst ? escapeCsv(d.jurusan) : '""',
                                isFirst ? escapeCsv(d.program_studi) : '""',
                                isFirst ? escapeCsv(d.jabatan_fungsional || 'Lektor') : '""',
                                isFirst ? escapeCsv(d.pendidikan_terakhir || 'S2') : '""',
                                isFirst ? escapeCsv(d.status_aktivitas || 'Aktif') : '""',
                                isFirst ? pCount : '""',
                                pIdx + 1,
                                escapeCsv(pen.tahun || '-'),
                                escapeCsv(pen.judul_penelitian),
                                escapeCsv(pen.jenis_kegiatan || 'Penelitian')
                            ];
                            csvOutput += row.join(';') + '\r\n';
                        });
                    }
                });

                return res.status(200).send(csvOutput);
            }

            default:
                return res.status(400).json({ status: 'error', message: 'Action tidak dikenali' });
        }
    } catch (error) {
        console.error('Serverless Handler Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal Server Error'
        });
    }
};
