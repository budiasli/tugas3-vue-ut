/**
 * File: ./js/components/do-tracking.js
 * Komponen Smart: Menangani pencarian dan tampilan status Delivery Order (DO).
 */
const DoTracking = {
    template: '#tpl-do-tracking',
    props: {
        // Menerima data mentah dari App Root
        trackingData: { type: Array, required: true },
        paketFull: { type: Array, required: true },
        pengirimanList: { type: Array, required: true }
    },
    data() {
        return {
            inputQuery: '',
            isSearching: false,
            searchPerformed: false,
        };
    },
    watch: {
        // Menambahkan watcher untuk memicu clearSearch saat input dikosongkan secara manual
        inputQuery(newValue) {
            if (newValue === '') {
                this.clearSearch();
            }
        }
    },
    computed: {
        selectedDO() {
            if (!this.searchPerformed || !this.inputQuery) return null;
            
            const query = this.inputQuery.toLowerCase().trim();

            // --- LOGIKA MODIFIKASI: MENCARI BERDASARKAN NOMOR DO ATAU NIM ---
            return this.trackingData.find(doItem => 
                doItem.no_do.toLowerCase() === query ||
                doItem.nim.toLowerCase() === query // Mencari berdasarkan NIM
            );
            // -------------------------------------------------------------
        },
        
        // Menggabungkan detail paket ke dalam DO yang dipilih
        doDetails() {
            if (!this.selectedDO) return null;
            
            const doItem = Object.assign({}, this.selectedDO);
            
            // Mencari nama paket
            const paket = this.paketFull.find(p => p.kode === doItem.paket_kode);
            doItem.paket_nama = paket ? paket.nama : 'Tidak Diketahui';
            
            // Tambahkan nama ekspedisi (menggunakan fungsi global dari api.js)
            if (typeof window.getEkspedisiName === 'function') {
                doItem.ekspedisi_nama = window.getEkspedisiName(doItem.ekspedisi, this.pengirimanList);
            } else {
                doItem.ekspedisi_nama = doItem.ekspedisi;
            }
            
            // Sortir riwayat perjalanan dari terbaru ke terlama
            doItem.tracking.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            return doItem;
        }
    },
    methods: {
        performSearch() {
            // Validasi Input: Jangan lakukan pencarian jika input kosong
            if (!this.inputQuery || this.inputQuery.trim() === '') {
                this.searchPerformed = false;
                return;
            }

            this.isSearching = true;
            this.searchPerformed = false;
            
            // Simulasi loading/delay pencarian (Opsional, untuk UI/UX)
            setTimeout(() => {
                this.searchPerformed = true;
                this.isSearching = false;
            }, 500); 
            // Catatan: Template harus menggunakan @keyup.enter="performSearch"
        },
        
        // --- METODE BARU: CLEAR SEARCH (DIPICU OLEH ESC) ---
        clearSearch() {
            this.inputQuery = '';
            this.isSearching = false;
            this.searchPerformed = false;
            // Catatan: Template harus menggunakan @keyup.esc="clearSearch"
        }
        
        // Catatan: getEkspedisiName(kode) dihapus karena redundansi (sudah ada di api.js sebagai global).
    }
};

// Daftarkan komponen utama
Vue.component('do-tracking', DoTracking);