App.new('listening',{
    title: 'Listening',

    num:   null,

    sounds: {},

    step: 0,

    steps: 20,

    qty: 4,

    i: null,

    time: {
        min: 0,
        max: 3,
    },

    timer: null,

    tts: {
        domain: '//api.voicerss.org',
        key:    'd9d0d46d0c9c448baf43dc831fc7eca8',
        hl:     'en-us',
        r:      -3,
        url: function(text,cfg) {
            if (typeof cfg != 'object') cfg = {};
            cfg = $.extend({}, this, cfg);
            return cfg.domain +'/?key='+ cfg.key +'&hl='+ cfg.hl +'&r='+ cfg.r +'&src='+ text;
        }
    },

    //------------------------------------------------------------------------------------------------------------------

    init: function() {
        console.log('init',this.id);

        this.sounds.yes    = new buzz.sound("sounds/yes-chimes.mp3");
        this.sounds.no     = new buzz.sound("sounds/no-buzz.mp3");
        this.sounds.bounce = new buzz.sound("sounds/bounce.mp3");

        this.$view.append('<div data-role="modal"></div>');
        this.$modal = $('[data-role="modal"]');

        this.$m.append('<div id="guide"></div>');
        this.$guide = $('#guide');

        var pct = (100/this.qty);

        for (i = 0; i < this.qty; i++) {
            this.$view.append('<div class="column" data-i="' + i + '" style="width:' + pct + '%; left:' + (pct * i) + '%;"></div>');
        }

        var $this = this;
        this.$view.on('click', '[data-role="modal"] [data-state]', function() {
            $this.onModalClick($(this).attr('data-state'));
        }).on('click', '.block:not(.done)', function() {
            $this.onBlockClick($(this));
        });
    }, // init()

    //------------------------------------------------------------------------------------------------------------------

    open: function() {
        console.log('open',this.id);

        var btime = 2;

        var $this = this;
        this.$guide.css({bottom:'100%',left:'0%'}).animate({bottom:0},btime * 1000,'easeOutBounce',function(){
            $this.introduction();
        });

        // sound delay needs to coincide with easing above
        this.timer = window.setTimeout(function(){
            $this.sounds.bounce.play();
        }, btime * 400);
    }, // open()

    //------------------------------------------------------------------------------------------------------------------

    introduction: function() {

        this.sounds.intro = App.say("Hi, I'm Bunny! Listen carefully while I say a number, so you can click the right button when it appears! Are you ready?",
            {r:0});

        this.sounds.intro.play();

        this.$modal.show().html('<div data-state="intro" class="ui-btn ui-corner-all ui-shadow">Start</div>');
    }, // introduction()

    //------------------------------------------------------------------------------------------------------------------

    run: function() {
        this.clear();

        this.i = Math.randomInt(0, this.qty-1);

        for (i = 0; i < this.qty; i++) {
            var num = Number(Math.randomInt(1000, 9999));

            if (i == this.i) this.num = num;

            this.$view.find('.column[data-i="'+ i +'"]')
                .append('<div class="block hidden'+ (i == this.i ? ' i' : '') +'" data-num="'+ num +'">'+ num.toLocaleString() +'</div>');
        }

        var num_str = this.num.toLocaleString(),
            src   = this.tts.url(num_str);

        var $this = this;
        new buzz.sound(src, {
            autoplay: true
        }).bind('ended',function(){
            $this.showBlocks();
        });
    }, // run()

    //------------------------------------------------------------------------------------------------------------------

    showBlocks: function() {
        var time = (((this.time.max - this.time.min) / this.steps) * this.step) + this.time.min;

        var $this = this;
        this.timer = window.setTimeout(function(){
            $this.$view.find('.block.hidden').removeClass('hidden');
        }, time * 1000);

    }, // showBlocks()

    //------------------------------------------------------------------------------------------------------------------

    onModalClick: function(state) {
        if (state == 'intro') {
            this.sounds.intro.stop();
            this.run();
        }
        // clear modal
        this.$modal.hide();
    }, // onModalClick()

    //------------------------------------------------------------------------------------------------------------------

    onBlockClick: function($b) {
        this.$view.find('.block:not(.done)').addClass('done');

        var yes = $b.hasClass('i');

        $b.addClass('selected '+ (yes ? 'yes' : 'no'));

        if (yes) {
            if (this.advance() == 'complete') {
                this.clear();
                return;
            }
        } else {
            this.sounds.no.play();
        }

        var $this = this;
        this.timer = window.setTimeout(function(){
            $this.run();
        }, 2 * 1000);

    }, // onBlockClick()

    //------------------------------------------------------------------------------------------------------------------

    advance: function() {
        this.step++;

        this.$guide.animate({left: ((100/this.steps)*this.step) +'%'}, 500,'easeInQuart');
        this.sounds.bounce.play();

        if (this.step == this.steps) {
            this.sounds.yes.play();
            return 'complete';
        }

    }, // advance

    //------------------------------------------------------------------------------------------------------------------

    close: function() {
        console.log('close',this.id);
    }, // close()

    //------------------------------------------------------------------------------------------------------------------

    clear: function() {

        this.$view.find('.column .block').remove();

    }, // clear()

    //------------------------------------------------------------------------------------------------------------------

});