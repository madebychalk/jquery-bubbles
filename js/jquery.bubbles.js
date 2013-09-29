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
  
  startPos = function(dir) {
    var startPos = Math.ceil(Math.random() * 99);
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
    
    if(animation && $.inArray(downcase(this.conf.direction), timelines) < 0) {
      var keyframes = '@' + prefix + 'keyframes bubble' + capitalize(this.conf.direction) + ' { '+
        '0% {' + prefix + 'transform:' + translateString + '( ' + coords(this.conf.direction, translateString, maxDistance).start + ' ) }'+
        ' 100% {' + prefix + 'transform:' + translateString + '( ' + coords(this.conf.direction, translateString, maxDistance).end + ' ) }'+
      ' }';

      var s = $('<style type="text/css"></style>');
          s.html(keyframes);

      $('head').append(s);

      timelines.push(downcase(this.conf.direction));
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
        b.css(startPos(this.conf.direction));
        this.bubbles.push(b);
        this.$el.append(b);
        
        if(animation) {  
          // .css not working?
          b.attr('style', b.attr('style') + ' ' + animationString + ': bubble' + capitalize(this.conf.direction) + ' ' + dur + 'ms ' + del + 'ms ease-in infinite');
        }
      }

      if(!animation) {
        var me = this;
        this.interval = setInterval(function(){
          if(!me.bubbles[me.current].data("active")) {
            var bubble = me.bubbles[me.current];
            var epos = endPos(conf.direction);

            bubble.data("active", true)
              .css(startPos(conf.direction))
              .show()
              .animate(epos, bubble.data("duration"), 'easeInSine', function() {
                 bubble.data("active", false).hide();
              });
          }

          if(me.current < conf.maxBubbles) {
            me.current++;
          } else {
            me.current = 0;
          }

        },50);
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
        after = args.slice(1);

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
          autoStart:    true
        }, options);

        $el.data( 'bubbles', new Bubbles($el, options) );
      }

    });
  };

});
