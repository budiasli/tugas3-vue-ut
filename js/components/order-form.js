/**
 * File: ./js/components/order-form.js
 * Komponen Smart: Menangani input dan logika pembuatan Delivery Order (DO) baru.
 */
const OrderForm = {
    template: '#tpl-order-form',
    props: {
        // Menerima data mentah dari App Root
        stokData: { type: Array, required: true },
        paketFull: { type: Array, required: true },
        pengirimanList: { type: Array, required: true }
    },
    data() {
        return {
            form: {
                nim: '',
                nama: '',
                upbjj: 'Jakarta', // Default value
                paketKode: null, // Kode paket yang dipilih
                ekspedisiKode: 'REG' // Default value
            },
            isSubmitting: false,
            lastDONumber: 2, // Simulasi nomor DO terakhir
        };
    },
    computed: {
        selectedPackageDetails() {
            return this.paketFull.find(p => p.kode === this.form.paketKode);
        },
        
        totalHarga() {
            return this.selectedPackageDetails ? this.selectedPackageDetails.harga : 0;
        },
        
        isFormValid() {
            return this.form.nim && this.form.nama && this.form.paketKode;
        }
    },
    methods: {
        generateNewDONumber() {
            this.lastDONumber++;
            return `DO2025-${String(this.lastDONumber).padStart(4, '0')}`;
        },
        
        checkStockAvailability() {
            if (!this.selectedPackageDetails) return true;

            const requiredItems = this.selectedPackageDetails.isi;
            let isAvailable = true;

            // Periksa ketersediaan setiap item dalam paket
            for (const requiredKode of requiredItems) {
                const item = this.stokData.find(s => s.kode === requiredKode);
                if (!item || item.qty < 1) {
                    isAvailable = false;
                    break;
                }
            }
            return isAvailable;
        },

        submitOrder() {
            if (!this.isFormValid) {
                this.$emit('show-modal', { title: 'Gagal', message: 'Harap lengkapi semua field yang wajib diisi.' });
                return;
            }

            if (!this.checkStockAvailability()) {
                this.$emit('show-modal', { title: 'Gagal', message: 'Stok salah satu bahan ajar dalam paket ini sudah habis atau tidak tersedia.' });
                return;
            }

            this.isSubmitting = true;

            // 1. Buat Objek DO Baru
            const newDONumber = this.generateNewDONumber();
            const now = new Date();
            
            const newDO = {
                no_do: newDONumber,
                nim: this.form.nim,
                nama: this.form.nama,
                upbjj: this.form.upbjj,
                tanggal_kirim: now.toISOString().split('T')[0],
                ekspedisi: this.form.ekspedisiKode,
                paket_kode: this.form.paketKode,
                total_harga: this.totalHarga,
                status: 'Menunggu Pengiriman',
                tracking: [
                    {
                        timestamp: now.toISOString(),
                        description: `DO Dibuat dan Diverifikasi - ${this.form.upbjj}`
                    }
                ]
            };

            // 2. Emit Event ke App Root
            setTimeout(() => {
                this.isSubmitting = false;
                
                // Root akan menerima event ini dan memperbarui state.tracking
                this.$emit('do-created', newDO); 
                
                // 3. Reset Form
                this.form.nim = '';
                this.form.nama = '';
                this.form.paketKode = null;
            }, 1000); // Simulasi delay API
        },
        
        // Helper untuk mendapatkan nama ekspedisi
        getEkspedisiName(kode) {
            const ekspedisi = this.pengirimanList.find(e => e.kode === kode);
            return ekspedisi ? ekspedisi.nama : kode;
        }
    }
};

// Daftarkan komponen utama
Vue.component('order-form', OrderForm);