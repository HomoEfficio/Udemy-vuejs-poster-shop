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
    methods: {
        appendItems: function() {
            console.log('appended');
        },
        onSubmit: function() {
            this.items = [];
            this.loading = true;
            this.$http.get('/search/'.concat(this.newSearch))
                .then(
                    function(res) {
                        console.log(res);
                        this.lastSearch = this.newSearch;
                        this.results = res.data;
                        this.items = res.data.slice(0, LOAD_NUM);
                        this.loading = false;
                    },
                    function() {}
                )
        },
        addItem: function(index) {
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
        },
        inc: function(item) {
            item.qty++;
            this.total += item.price;
        },
        dec: function(item) {
            item.qty--;
            this.total -= item.price;
            if (item.qty <= 0) {
                for (var i = 0, len = this.cart.length; i < len ; i++) {
                    if (this.cart[i].id === item.id) {
                        this.cart.splice(i, 1);
                        break;
                    }
                }
            }
        }
    },
    filters: {
        currency: function(price) {
            return '$'.concat(price.toFixed(2));
        }
    },
    mounted: function() {
        this.onSubmit();

        var vueInstance = this;
        var elem = document.getElementById('product-list-bottom');
        var watcher = scrollMonitor.create(elem);
        watcher.enterViewport(function() {
            vueInstance.appendItems();
        });
    }
});
