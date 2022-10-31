const app = {
    data() {
        return {
            isHome: false,
            //スプラッシュ
            splashLinked: true,
            splashStatus: true,
            //タイマー
            initializeTime: this.setCurrentTime(),
            //タッチで動かす
            touchPrevX: 0,
            touchX: 0,
            touchPrevY: 0,
            touchY: 0,
            touchFirst: true,
            //ピンチ
            pinchZoom: 1, //ズーム比率の初期設定
            pinchPrev: 0,
            pinchFirst: true,
            //モーダル
            modalStatus: false,
            modalUrl: '#',
            //リダイレクト
            pageLinkStatus: true
        }
    },
    mounted() {
        this.timer();
        const currentPath = window.location.href;
        if (currentPath.match(/\/signageSample\/index.html/)) { //Home画面のパスを正規表現で指定する
            this.isHome = true;
        }
        //他ページから来た時だけハッシュをつける
        const splashInitial = location.hash;
        if (splashInitial == '#noSplash') {
            this.splashLinked = false;
        }
        //ブラウザデフォルトのピンチを無効化
        document.body.addEventListener("touchstart", function (e) {
            if (e.touches && e.touches.length > 1) {
                e.preventDefault();
            }
        }, {
            passive: false
        });
        document.body.addEventListener("touchmove", function (e) {
            if (e.touches && e.touches.length > 1) {
                e.preventDefault();
            }
        }, {
            passive: false
        });
        //ブラウザバック無効化
        history.pushState(null, null, location.href);
        window.addEventListener('popstate', function () {
            history.go(1);
        });
    },
    methods: {
        splash: function () {
            this.splashStatus = false;
            this.updateTime();
        },
        //モーダル
        modal: function (path) {
            this.modalUrl = path;
            this.modalStatus = true;
            this.updateTime();
        },
        modalClose: function () {
            this.modalStatus = false;
            this.updateTime();
        },
        //リダイレクト
        pageLink: function (path) {
            const url = path;
            this.pageLinkStatus = false;
            setTimeout(function () {
                window.location.href = url;
            }, 300);
        },
        //拡大・縮小
        bigger: function () {
            const max = 2; //ズーム比率の最大値を指定
            if (this.pinchZoom < max) {
                const zoomLoop = setInterval(function () {
                    if (this.pinchZoom >= max) {
                        clearInterval(zoomLoop);
                    }
                    this.pinchZoom = this.pinchZoom + 0.01;
                }.bind(this), 10);
            }
        },
        smaller: function () {
            const min = 1; //ズーム比率の最小値を指定
            if (this.pinchZoom > min) {
                const zoomLoop = setInterval(function () {
                    if (this.pinchZoom <= min) {
                        clearInterval(zoomLoop);
                    }
                    this.pinchZoom = this.pinchZoom - 0.01;
                }.bind(this), 10);
            }
        },
        //ホームへ
        toHome: function (splash) {
            let url = '../index.html';
            if (splash) {
                url = url + '#noSplash'
            }
            this.pageLinkStatus = false;
            setTimeout(function () {
                window.location.href = url;
            }, 500);
        },
        //タッチイベント
        touchStart: function (event) {
            const touches = event.changedTouches;
            if (touches.length > 1) { //ピンチでズーム
                this.pinchFirst = true;
            }
            this.touchFirst = true;
            this.updateTime();
        },
        touchMove: function (event) {
            const touches = event.changedTouches;
            if (touches.length > 1) { //ピンチでズーム
                let pinchAmount;
                let pinchX1 = touches[0].pageX;
                let pinchY1 = touches[0].pageY;
                let pinchX2 = touches[1].pageX;
                let pinchY2 = touches[1].pageY;
                let distance = Math.sqrt(Math.pow(pinchX2 - pinchX1, 2) + Math.pow(pinchY2 - pinchY1, 2));
                if (this.pinchFirst) {
                    pinchAmount = 0;
                } else {
                    pinchAmount = distance - this.pinchPrev;
                }
                if (pinchAmount !== 0) {
                    this.pinchZoom = this.pinchZoom + pinchAmount / 500; //ピンチの速さ調整
                    if (this.pinchZoom <= 1) {
                        this.pinchZoom = 1;
                    }
                    if (this.pinchZoom >= 2) {
                        this.pinchZoom = 2;
                    }
                }
                this.pinchPrev = distance;
                this.pinchFirst = false;
            } else { //タッチで上下左右移動
                let amountX;
                let amountY;
                if (this.touchFirst) {
                    amountX = 0;
                    amountY = 0;
                    this.touchFirst = false;
                } else {
                    amountX = this.touchPrevX - event.touches[0].screenX; //左→右の移動量
                    amountY = event.touches[0].screenY - this.touchPrevY; //上→下の移動量
                }
                if (amountX !== 0) {
                    this.touchX = this.touchX - amountX;
                }
                if (amountY !== 0) {
                    this.touchY = this.touchY + amountY;
                }
                this.touchPrevX = event.touches[0].screenX;
                this.touchPrevY = event.touches[0].screenY;
            }
            this.updateTime();
        },
        touchEnd: function () {
            this.pinchFirst = true;
            if (this.touchX > (this.getWindowWidth / 2)) {
                this.touchX = this.getWindowWidth / 2;
            } else if (this.touchX < -(this.getWindowWidth / 2)) {
                this.touchX = -this.getWindowWidth / 2;
            }
            if (this.touchY > (this.getWindowHeight / 3)) {
                this.touchY = this.getWindowHeight / 3;
            } else if (this.touchY < -(this.getWindowHeight / 3)) {
                this.touchY = -this.getWindowHeight / 3;
            }
            this.updateTime();
        },
        //タイマー
        setCurrentTime: function () {
            const time = new Date();
            const currentTime = time.getTime() / 1000; //秒
            return currentTime;
        },
        updateTime: function () {
            const time = new Date();
            this.initializeTime = time.getTime() / 1000; //秒
        },
        timer: function () {
            setInterval(function () {
                const time = new Date();
                const currentTime = time.getTime() / 1000; //秒
                if ((currentTime - this.initializeTime) > 600) { //10分=600
                    if (this.isHome) {
                        this.splashLinked = true;
                        this.splashStatus = true;
                        this.splashStatus = true;
                        this.modalStatus = false;
                        this.touchX = 0;
                        this.touchY = 0;
                        this.touchFirst = true;
                        this.pinchZoom = 1;
                        this.pinchFirst = true;
                    } else {
                        this.toHome(false);
                    }
                }
            }.bind(this), 1000);
        }
    },
    computed: {
        getWindowWidth: function () {
            return window.innerWidth;
        },
        getWindowHeight: function () {
            return window.innerHeight;
        }
    }
}
Vue.createApp(app).mount('#app')
