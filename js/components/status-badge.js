/**
 * File: ./js/components/status-badge.js
 * Komponen Presentasional: Menampilkan status stok dalam badge berwarna.
 */
const StatusBadge = {
    template: '#tpl-badge',
    props: {
        status: {
            type: String,
            required: true
        }
    },
    computed: {
        badgeClass() {
            // Menentukan kelas Bootstrap berdasarkan status
            switch (this.status) {
                case 'Aman':
                    return 'badge-success';
                case 'Menipis':
                    return 'badge-warning';
                case 'Habis':
                    return 'badge-danger';
                default:
                    return 'badge-secondary';
            }
        }
    }
};

// Daftarkan komponen secara global agar dapat digunakan di komponen lain
Vue.component('status-badge', StatusBadge);