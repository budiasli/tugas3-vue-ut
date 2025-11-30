/**
 * File: ./js/components/stock-table.js
 * Komponen Smart: Menangani filter, sorting, dan manajemen tabel stok.
 */

// Asumsi: 'StatusBadge' sudah terdaftar secara global dari status-badge.js

// =======================================================
// SUB-KOMPONEN: MataKuliahRow (Baris Tabel Tunggal)
// =======================================================
const MataKuliahRow = {
    template: '#tpl-mata-kuliah-row', 
    props: ['item'], // Menerima seluruh objek item
    components: { 'status-badge': StatusBadge },
    data() {
        return {
            showTooltip: false
        }
    },
    methods: {
        edit() {
            // Emit event ke parent (BaStockTable)
            this.$emit('edit', this.item);
        },
        remove() { 
            // Emit event ke parent (BaStockTable)
            this.$emit('delete', this.item);
        }
    }
};

// =======================================================
// SUB-KOMPONEN: Modal Edit Stok (Logika Placeholder)
// =======================================================
const EditStockModal = {
    template: '#tpl-edit-stock-modal',
    props: ['itemToEdit', 'isVisible', 'kategoriList', 'upbjjList'],
    data() {
        return {
            localItem: {},
        };
    },
    watch: {
        // Ketika itemToEdit dari parent berubah, update data lokal
        itemToEdit: {
            handler(val) {
                if (val) {
                    this.localItem = Object.assign({}, val);
                    // Asumsi jQuery/Bootstrap
                    $(this.$el).modal('show');
                }
            },
            immediate: true
        },
        isVisible(val) {
             if (!val) {
                $(this.$el).modal('hide');
             }
        }
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        saveChanges() {
            // Emit item lokal ke parent
            this.$emit('save', this.localItem);
        }
    }
};

// =======================================================
// SUB-KOMPONEN: Modal New Stok (Logika Placeholder)
// =======================================================
const NewStockModal = {
    template: '#tpl-new-stock-modal',
    props: ['isVisible', 'kategoriList', 'upbjjList'],
    data() {
        return {
            newItem: {
                kode: '', judul: '', kategori: 'MK Wajib', upbjj: 'Jakarta', 
                lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: ''
            },
        };
    },
    watch: {
        isVisible(val) {
             if (val) {
                // Reset form saat modal dibuka
                this.newItem = {
                    kode: '', judul: '', kategori: 'MK Wajib', upbjj: 'Jakarta', 
                    lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: ''
                };
                $(this.$el).modal('show');
             } else {
                $(this.$el).modal('hide');
             }
        }
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        saveNewItem() {
            // Emit item baru ke parent
            this.$emit('save-new', Object.assign({}, this.newItem));
        }
    }
};


// =======================================================
// KOMPONEN UTAMA: BaStockTable
// =======================================================
const BaStockTable = {
    template: '#tpl-stock-table',
    components: { MataKuliahRow, EditStockModal, NewStockModal },
    props: {
        initialStok: { type: Array, required: true },
        kategoriList: { type: Array, required: true },
        upbjjList: { type: Array, required: true }
    },
    data() {
        return {
            // State untuk Filtering
            filterQuery: '',
            filterKategori: null,
            filterUpbjj: null,
            filterStatus: null, // <<< BARU: State untuk filter status
            
            // State untuk Sorting
            sortBy: 'kode',
            sortDir: 1, // 1: Ascending, -1: Descending
            
            // State untuk Modal
            itemToEdit: null,
            isEditModalVisible: false,
            isNewModalVisible: false,
        };
    },
    computed: {
        stockFiltered() {
            let filtered = this.initialStok;

            // 1. Filter Pencarian Teks
            if (this.filterQuery) {
                const query = this.filterQuery.toLowerCase();
                filtered = filtered.filter(item => 
                    item.kode.toLowerCase().includes(query) ||
                    item.judul.toLowerCase().includes(query)
                );
            }

            // 2. Filter Kategori
            if (this.filterKategori) {
                filtered = filtered.filter(item => item.kategori === this.filterKategori);
            }

            // 3. Filter UPBJJ
            if (this.filterUpbjj) {
                filtered = filtered.filter(item => item.upbjj === this.filterUpbjj);
            }

            // 4. Filter Status <<< LOGIKA BARU
            if (this.filterStatus) {
                filtered = filtered.filter(item => {
                    // Item status dihitung di api.js: 'Aman', 'Menipis', 'Kosong'
                    if (this.filterStatus === 'menipis_atau_habis') {
                        // Stock < Safety Stock (Menipis atau Habis)
                        return item.status === 'Menipis' || item.status === 'Habis';
                    }
                    if (this.filterStatus === 'habis') {
                        // Stock = 0 (Habis)
                        return item.status === 'Habis';
                    }
                    return true;
                });
            }
            
            return filtered;
        },
        stockFilteredAndSorted() {
            const sorted = this.stockFiltered;
            const dir = this.sortDir;
            const key = this.sortBy;
            
            return sorted.slice().sort((a, b) => {
                const aVal = a[key];
                const bVal = b[key];

                if (aVal < bVal) return -1 * dir;
                if (aVal > bVal) return 1 * dir;
                return 0;
            });
        }
    },
    methods: {
        setSort(key) {
            if (this.sortBy === key) {
                this.sortDir = -this.sortDir;
            } else {
                this.sortBy = key;
                this.sortDir = 1;
            }
        },
        
        // FUNGSI UNTUK MERESET SEMUA FILTER
        resetFilters() {
            this.filterQuery = '';
            this.filterKategori = null;
            this.filterUpbjj = null;
            this.filterStatus = null; // <<< BARU: Reset filter status
            this.setSort('kode'); // Reset penyortiran ke kolom Kode
        },
        
        // Event Handlers dari MataKuliahRow
        handleEdit(item) {
            this.itemToEdit = item;
            this.isEditModalVisible = true;
        },
        handleDelete(item) {
            this.$emit('delete-item', item);
        },
        
        // Event Handlers dari EditStockModal
        handleSave(updatedItem) {
            this.isEditModalVisible = false;
            this.itemToEdit = null;
            this.$emit('save-item', updatedItem);
        },
        closeEditModal() {
            this.isEditModalVisible = false;
            this.itemToEdit = null;
        },

        // Event Handlers Modal New Item
        openNewModal() {
            this.isNewModalVisible = true;
        },
        closeNewModal() {
            this.isNewModalVisible = false;
        },
        handleSaveNew(newItem) {
            this.isNewModalVisible = false;
            this.$emit('save-new', newItem);
        }
    }
};

// Daftarkan komponen utama secara global
Vue.component('ba-stock-table', BaStockTable);