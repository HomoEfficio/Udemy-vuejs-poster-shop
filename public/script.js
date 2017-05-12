var LOAD_NUM = 10;
var RECO_SERVICE_ID = '543';
var RECO_REF = 'http://dev.recopick.com/index.html';
var RECO_URL = 'http://dev.recopick.com/index.html';
var RECO_UID = (function() {
    var url = document.location.href;
    var paramString = url.substring(url.indexOf('?') + 1);
    var params = paramString.split('&');
    for (var i = 0, len = params.length; i < len; i++) {
        var param = params[i];
        if (param.trim().indexOf('uid') === 0)
            return param.substring(param.indexOf('=') + 1);
    }
    return '';
}());
var RECO_MID = Math.floor(Math.random()*(1000000000-100000000)+100000000);
var RECO_BIRTHYEAR = Math.floor(Math.random()*(2000-1930)+1930);
var RECO_GENDER = Math.floor(Math.random()*(1-100)+100) % 2 ? 'F' : 'M';

new Vue({
    el: '#app',
    mounted: function() {
        if (RECO_UID.length === 0) {
            this.hasNoUID = true;
            return;
        }
        this.sendLog('visit', {
            service_id: RECO_SERVICE_ID,
            uid: RECO_UID,
            ref: RECO_REF,
            url: RECO_URL,
            user: {
                mid: RECO_MID,
                gender: RECO_GENDER,
                birthyear: RECO_BIRTHYEAR
            }
        });

        this.onSearch();

        var vueInstance = this;
        var elem = document.getElementById('product-list-bottom');
        var watcher = scrollMonitor.create(elem);
        watcher.enterViewport(function() {
            vueInstance.appendItems();
        });
    },
    data: {
        hasNoUID: false,
        total: 0,
        items: [],
        cart: [],
        results: [],
        newSearch: 'anime',
        lastSearch: '',
        loading: false
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
                            console.log(res);
                            this.lastSearch = this.newSearch;
                            this.results = res.data;
                            this.appendItems();
                            this.loading = false;
                        },
                        function() {}
                    );
                this.sendLog('search', {
                    service_id: RECO_SERVICE_ID,
                    uid: RECO_UID,
                    ref: RECO_REF,
                    url: RECO_URL,
                    q: this.newSearch,
                    user: {
                        mid: RECO_MID,
                        gender: RECO_GENDER,
                        birthyear: RECO_BIRTHYEAR
                    }
                });
            }
        },
        onDetail: function(i) {
            var item = this.items[i];
            // id, title, image, price, currency,
            // description, author, sale_price, sale_currency, is_hidden,
            // c1, c2, c3, brand, bc1
            this.sendLog('view', {
                service_id: RECO_SERVICE_ID,
                uid: RECO_UID,
                ref: RECO_REF,
                url: RECO_URL,
                items: [{
                    id: item.id,
                    title: item.title,
                    image: item.link,
                    price: item.score,
                    currency: item.type,
                    description: item.description,
                    c1: item.section,
                    c2: item.topic
                }],
                user: {
                    mid: RECO_MID,
                    gender: RECO_GENDER,
                    birthyear: RECO_BIRTHYEAR
                }
            });
        },
        addToCart: function(index) {
            var item = this.items[index];
            this.total += item.score;
            var found = false;
            for (var i = 0, len = this.cart.length; i < len; i++) {
                if (this.cart[i].id === item.id) {
                    this.cart[i].count++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.cart.push({
                    id: item.id,
                    title: item.title,
                    image: item.link,
                    price: item.score,
                    currency: item.type,
                    description: item.description,
                    c1: item.section,
                    c2: item.topic,
                    count: 1
                });
            }
            this.sendLog('basket', {
                service_id: RECO_SERVICE_ID,
                uid: RECO_UID,
                ref: RECO_REF,
                url: RECO_URL,
                items: this.cart,
                user: {
                    mid: RECO_MID,
                    gender: RECO_GENDER,
                    birthyear: RECO_BIRTHYEAR
                }
            });
        },
        inc: function(i) {
            var current = this.cart[i];
            current.count++;
            this.total += current.price;
            this.sendLog('basket', { msg: 'inc' });
        },
        dec: function(i) {
            var current = this.cart[i];
            current.count--;
            this.total -= current.price;
            if (current.count <= 0) {
                this.cart.splice(i, 1);
            }
            this.sendLog('basket', { msg: 'dec' });
        },
        onOrder: function(cart) {
            this.convertToOrderItems(cart);
            this.sendLog('order', {
                service_id: RECO_SERVICE_ID,
                uid: RECO_UID,
                ref: RECO_REF,
                url: RECO_URL,
                items: this.cart,
                user: {
                    mid: RECO_MID,
                    gender: RECO_GENDER,
                    birthyear: RECO_BIRTHYEAR
                }
            });
        },
        getRecoDataFrom: function(results) {
            for (var i = 0, len = results.length; i < len; i++) {
                results[i].count = results[i].comment_count;

            }
        },
        sendLog: function(action, payload) {
            console.log(action, payload);
        },
        convertToOrderItems: function(cartItems) {
            for (var i = 0, len = cartItems.length; i < len; i++) {
                var item = cartItems[i];
                item.total_sales = item.price * item.count;
                item.order_no = Math.floor(Math.random()*(10000000000-1000000000)+1000000000).toString();
            }
        }
    },
    filters: {
        currency: function(price) {
            return '$'.concat(price.toFixed(2));
        }
    },

});
