/**
 * File: ./js/app.js
 * Root Instance (Controller) Vue Aplikasi SITTA Bahan Ajar.
 * Bertanggung jawab atas: 
 * 1. Initial Data Loading (via api.js).
 * 2. Global State Management (this.state).
 * 3. Handling Events CRUD dari komponen anak.
 * * PERBAIKAN REDUDANSI: Fungsi updateItemStatus() telah dihapus dari file ini 
 * dan dipindahkan ke api.js agar dapat diakses secara global.
 */

// HAPUS FUNGSI updateItemStatus() YANG REDUNDAN DARI SINI.

/**
 * Fungsi utama untuk mengambil data dan menginisialisasi aplikasi.
 * Asumsi: Semua file JS (api.js, components/*.js) sudah dimuat.
 */
async function mountApp() {
    // 1. Ambil data awal dari service layer (api.js)
    // Asumsi: fetchAppData() tersedia secara global dari ./js/services/api.js
    const initialData = await fetchAppData();

    // 2. Inisialisasi Root Vue Instance
    new Vue({
        el: '#app',
        data: {
            // State global yang dibagikan ke semua komponen anak
            state: initialData, 
            tab: 'stok', // Tab yang aktif (default: Stok)
        },

        methods: {
            // =======================================================
            // 1. General Handler
            // =======================================================
            
            // Menampilkan Modal Pesan/Notifikasi (dipanggil dari semua komponen)
            handleModalOpen(title, message) {
                // Menggunakan $refs untuk memanggil metode 'open' di komponen AppModal
                this.$refs.modal.open(title, message);
            },

            // =======================================================
            // 2. Stock Management Handlers (Dipanggil dari StockTable)
            // =======================================================
            
            // Menghapus Item Stok
            handleDeleteItem(itemToDelete) {
                const index = this.state.stok.findIndex(item => item.kode === itemToDelete.kode);
                if (index !== -1) {
                    this.state.stok.splice(index, 1);
                    this.handleModalOpen('Sukses!', `Bahan Ajar <b>${itemToDelete.judul}</b> berhasil dihapus dari stok.`);
                }
            },

            // Menyimpan Item Stok yang Diedit
            handleSaveItem(updatedItem) {
                // Logika pembaruan data stok
                const index = this.state.stok.findIndex(item => item.kode === updatedItem.kode);
                
                // PANGGIL FUNGSI updateItemStatus() YANG TERPUSAT DARI API.JS (window.updateItemStatus)
                const processedItem = window.updateItemStatus(updatedItem); 

                if (index !== -1) {
                    // Gunakan Vue.set atau splice untuk memastikan reaktivitas
                    this.state.stok.splice(index, 1, processedItem);
                    this.handleModalOpen('Sukses!', `Bahan Ajar <b>${updatedItem.judul}</b> berhasil diubah.`);
                }
            },
            
            // Menyimpan Item Stok Baru
            handleSaveNewItem(itemToAdd) {
                // Cek duplikasi kode
                if (this.state.stok.some(item => item.kode === itemToAdd.kode)) {
                    this.handleModalOpen('Gagal!', `Kode Bahan Ajar <b>${itemToAdd.kode}</b> sudah ada.`);
                    return;
                }

                // PANGGIL FUNGSI updateItemStatus() YANG TERPUSAT DARI API.JS (window.updateItemStatus)
                const processedItem = window.updateItemStatus(itemToAdd); 
                
                // Tambahkan item baru
                this.state.stok.push(processedItem);

                // Update daftar pilihan (kategori dan upbjj) secara dinamis
                if (this.state.kategoriList.indexOf(itemToAdd.kategori) === -1) {
                    this.state.kategoriList.push(itemToAdd.kategori);
                    this.state.kategoriList.sort();
                }
                if (this.state.upbjjList.indexOf(itemToAdd.upbjj) === -1) {
                    this.state.upbjjList.push(itemToAdd.upbjj);
                    this.state.upbjjList.sort(); 
                }

                this.handleModalOpen('Sukses!', `Bahan Ajar <b>${itemToAdd.judul}</b> (${itemToAdd.kode}) berhasil ditambahkan ke stok.`);
            },
            
            // =======================================================
            // 3. Order Management Handler (Dipanggil dari OrderForm)
            // =======================================================
            
            // Menambahkan Delivery Order (DO) baru
            handleNewDO(newDO) {
                // Tambahkan DO baru ke daftar tracking
                this.state.tracking.push(newDO);
                this.handleModalOpen('Sukses!', `Delivery Order <b>${newDO.no_do}</b> berhasil dibuat.`);
                
                // Pindah ke tab tracking dan picu pencarian DO baru
                this.tab = 'tracking';
                this.$nextTick(() => {
                    // Gunakan $refs untuk memanggil metode di komponen anak (do-tracking)
                    if (this.$refs.doTracking) {
                        this.$refs.doTracking.inputQuery = newDO.no_do;
                        this.$refs.doTracking.performSearch();
                    }
                });
            }
        }
    }).$mount('#app');            
}

// Jalankan fungsi inisialisasi aplikasi
mountApp();