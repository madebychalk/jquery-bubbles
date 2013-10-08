/*
Plugin: jQuery Bubbles
Version 0.2.
Author: Jason Hummel
Twitter: @jhummel
Author URL: http://www.wearechalk.com/
Plugin URL: http://www.github.com/madebychalk/jquery-bubbles

Licensed under the MIT license:
http://www.opensource.org/licenses/mit-license.php

Get the bubbles Chester - get them!
http://www.youtube.com/watch?v=IiTjrpfssY0
*/

(function(factory) {
  'use strict';

  if(typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    factory(jQuery, window);
  }
})(function($, undefined){
  'use strict';

  $.extend( $.easing, {
    easeInSine: function(x, t, b, c, d) {
      return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    }
  });  

  var prefix = '',
      animationString = 'animation',
      translateString = 'translate',
      timelines = [],
      vendors = 'Webkit Moz O Khtml MS'.split(' '),
      testEl = $('<div/>'),
      animation = ( testEl.get(0).style.animationName ) ? true : false,
      downcase,
      capitalize,
      guid,
      std_dev,
      coords,
      startPos,
      endPos,
      Bubbles;


  downcase =   function(str) { return str.toLowerCase(); };
  capitalize = function(str) { return str.charAt(0).toUpperCase() + str.slice(1); };

  if(!animation) {
    $.each(vendors, function(index, vendor){
      
      if (testEl.get(0).style[vendor + 'AnimationName'] !== undefined) {
        prefix = '-' + downcase(vendor) + '-';
        animationString = prefix + animationString;
        animation = true;
        
        if(testEl.get(0).style[vendor + 'Perspective'] !== undefined) {
         translateString = 'translate3d';
        }
        return false;
      }
    });
  }

  guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

  std_dev = function(mean, stdev) {
    var rnd_snd = (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
    return Math.round(rnd_snd*stdev+mean);
  };

  coords = function(dir, trans, max) {
    if(trans === 'translate3d') {
      switch (downcase(dir)) {
        case 'left':
          return { start: '0, 0, 0', end: '-' + max + 'px, 0, 0'};
        case 'right':
          return { start: '0, 0, 0', end: max + 'px, 0, 0'};
        case 'up':
          return { start: '0, 0, 0', end: '0, -' + max + 'px, 0'};
        case 'down':
          return { start: '0, 0, 0', end: '0, ' + max + 'px, 0'};
      }
    } else {
      switch (downcase(dir)) {
        case 'left':
          return { start: '0, 0', end: '-' + max + 'px, 0'};
        case 'right':
          return { start: '0, 0', end: max + 'px, 0'};
        case 'up':
          return { start: '0, 0', end: '0, -' + max + 'px'};
        case 'down':
          return { start: '0, 0', end: '0, ' + max + 'px'};
      }
    }
    return false;
  };
  
  startPos = function(dir, mean, dev) {
    var startPos = std_dev(mean, dev);   
    dir = downcase(dir);
    var pos;
    switch (dir) {
      case 'left':
        pos = {bottom: 'auto', left: 'auto', right: 0, top: startPos + '%'};
        break;
      case 'right':
        pos = {bottom: 'auto', left: 0, right: 'auto', top: startPos + '%'};
        break;
      case 'up':
        pos = {bottom: 0, left: startPos + '%', right: 'auto', top: 'auto'};
        break;
      case 'down':
        pos = {bottom: 'auto', left: startPos + '%', right: 'auto', top: 0};
        break;
    }
    
    return pos;
  };
  
  endPos = function(dir) {
    dir = downcase(dir);
    var pos;
    switch (dir) {
      case 'left':
        pos = {right: '100%'};
        break;
      case 'right':
        pos = {left: '100%'};

        break;
      case 'up':
        pos = {bottom: '100%'};
        break;
      case 'down':
        pos = {top: '100%'};
        break;
    }
    return pos;
  };

  Bubbles = function(el, conf) {
    this.$el      = $(el);
    this.conf     = conf;
    this.bubbles  = [];
    this.current  = 0;

    var maxDistance = ($.inArray(downcase(this.conf.direction), 'down up'.split(' ')) < 0) ? this.$el.innerWidth() : this.$el.innerHeight();

    if(this.$el.css('position') === 'static') {
      this.$el.css({position: 'relative'});
    }
    
    if(animation && $.inArray(this.conf.uid, timelines) < 0) {
      var keyframes = '@' + prefix + 'keyframes bubble' + this.conf.uid + ' { '+
        '0% {' + prefix + 'transform:' + translateString + '( ' + coords(this.conf.direction, translateString, maxDistance).start + ' ) }'+
        ' 100% {' + prefix + 'transform:' + translateString + '( ' + coords(this.conf.direction, translateString, maxDistance).end + ' ) }'+
      ' }';

      var s = $('<style type="text/css"></style>');
          s.html(keyframes);

      $('head').append(s);

      timelines.push(this.conf.uid);
    }

    if(this.conf.autoStart) {
      this.start();
    }
  };

  Bubbles.prototype = {
    start: function() {
      for(var i = 0; i < this.conf.maxBubbles; i++) {
        var dur = Math.round(this.conf.minDuration+(Math.random()*(this.conf.maxDuration-this.conf.minDuration)));
        var del = Math.ceil(Math.random() * this.conf.maxDelay);
        
        var b = testEl.clone().addClass(this.conf.className).data("active", false).data("duration", dur);
        b.css(startPos(this.conf.direction, this.conf.mean, this.conf.std_dev));
        this.bubbles.push(b);
        this.$el.append(b);
        
        if(animation) {  
          // .css not working?
          b.hide();
          b.attr('style', b.attr('style') + ' ' + animationString + ': bubble' + this.conf.uid + ' ' + dur + 'ms ' + del + 'ms ease-in infinite');

          (function() {
            var c = b;
            setTimeout(function(){ c.show(); }, del * 2);
          })();
        }
      }

      if(!animation) {
        var me = this;
        
        this.interval = setInterval(function(){
          if(!me.bubbles[me.current].data("active")) {
            var bubble = me.bubbles[me.current];
            var epos = endPos(me.conf.direction);

            bubble.data("active", true)
              .css(startPos(me.conf.direction))
              .show()
              .animate(epos, bubble.data("duration"), 'easeInSine', function() {
                 bubble.data("active", false).hide();
              });
          }

          if(me.current < me.conf.maxBubbles - 1) {
            me.current++;
          } else {
            me.current = 0;
          }
        }, 50);
      }
    },

    stop: function() {
      for(var i = 0; i < this.bubbles.length; i++) {
        this.bubbles[i].remove();
      }

      if(!animation) {
        clearInterval(this.interval);
      }

      this.bubbles = [];
    },

    toggle: function() {
      if(this.bubbles.length) {
        this.stop();
      } else {
        this.start();
      }
    }
  };

  $.fn.bubbles = function(options) {
    var args  = $.makeArray(arguments),
        after = args.slice(1),
        uid   = guid();

    return this.each(function() {
      var instance,
          $el = $(this);

      instance = $el.data('bubbles');
      if(instance) {
        instance[args[0]].apply(instance, after);
      } else {
        options = $.extend({
          className:    'bubble',
          maxBubbles:   20,
          minDuration:  3000,
          maxDuration:  7000,
          maxDelay:     8000,
          direction:    'down',
          autoStart:    true,
          uid:          uid,
          mean:         50,
          std_dev:      15
        }, options);

        $el.data( 'bubbles', new Bubbles($el, options) );
      }

    });
  };

});

