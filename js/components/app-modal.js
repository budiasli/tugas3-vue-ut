/**
 * File: ./js/components/app-modal.js
 * Komponen Utilitas: Menangani tampilan modal/popup generik.
 */
const AppModal = {
    template: '#tpl-modal',
    data() {
        return {
            title: '',
            message: '',
            isVisible: false
        };
    },
    methods: {
        open(title, message) {
            this.title = title;
            this.message = message;
            this.isVisible = true;
            // Gunakan jQuery untuk menampilkan modal Bootstrap
            $(this.$el).modal('show');
        },
        close() {
            this.isVisible = false;
            $(this.$el).modal('hide');
        }
    }
};

// Daftarkan komponen secara global
Vue.component('app-modal', AppModal);