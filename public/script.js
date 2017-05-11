var PRICE = 9.99;
var LOAD_NUM = 10;

new Vue({
    el: '#app',
    data: {
        total: 0,
        items: [],
        cart: [],
        results: [],
        newSearch: 'anime',
        lastSearch: '',
        loading: false,
        price: PRICE
    },
    computed: {
        noMoreItems: function() {
            return this.items.length == this.results.length && this.results.length > 0
        }
    },
    methods: {
        appendItems: function() {
            if (this.items.length < this.results.length) {
                var append = this.results.slice(this.items.length, this.items.length + LOAD_NUM);
                this.items = this.items.concat(append);
            }
        },
        onSearch: function() {
            if (this.newSearch.length) {
                this.items = [];
                this.loading = true;
                this.$http.get('/search/'.concat(this.newSearch))
                    .then(
                        function(res) {
                            this.lastSearch = this.newSearch;
                            this.results = res.data;
                            this.appendItems();
                            this.loading = false;
                        },
                        function() {}
                    );
                this.sendLog('search', { msg: 'searched' });
            }
        },
        onDetail: function(i) {
            console.log(this.items[i].title);
            this.sendLog('view', { msg: 'detail-view' });
        },
        addToCart: function(index) {
            this.total += PRICE;
            var item = this.items[index];
            var found = false;
            for (var i = 0, len = this.cart.length; i < len; i++) {
                if (this.cart[i].id === item.id) {
                    this.cart[i].qty++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.cart.push({
                    id: item.id,
                    title: item.title,
                    price: this.price,
                    qty: 1
                });
            }
            this.sendLog('basket', { msg: 'added' });
        },
        inc: function(i) {
            var current = this.cart[i];
            current.qty++;
            this.total += current.price;
            this.sendLog('basket', { msg: 'inc' });
        },
        dec: function(i) {
            var current = this.cart[i];
            current.qty--;
            this.total -= current.price;
            if (current.qty <= 0) {
                this.cart.splice(i, 1);
            }
            this.sendLog('basket', { msg: 'dec' });
        },
        onOrder: function(cart) {
            console.log(cart);
            this.sendLog('order', { msg: 'ordered' });
        },
        sendLog: function(action, payload) {
            console.log(action);
        }
    },
    filters: {
        currency: function(price) {
            return '$'.concat(price.toFixed(2));
        }
    },
    mounted: function() {
        this.sendLog('visit', { msg: 'visited' });

        this.onSearch();

        var vueInstance = this;
        var elem = document.getElementById('product-list-bottom');
        var watcher = scrollMonitor.create(elem);
        watcher.enterViewport(function() {
            vueInstance.appendItems();
        });

    }
});
