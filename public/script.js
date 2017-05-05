

var PRICE = 9.99;

new Vue({
    el: '#app',
    data: {
        total: 0,
        items: [],
        cart: [],
        newSearch: 'anime',
        lastSearch: '',
        loading: false
    },
    methods: {
        onSubmit: function() {
            this.items = [];
            this.loading = true;
            this.$http.get('/search/'.concat(this.newSearch))
                .then(
                    function(res) {
                        console.log(res);
                        this.lastSearch = this.newSearch;
                        this.items = res.data;
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
                    price: PRICE,
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
    }
});