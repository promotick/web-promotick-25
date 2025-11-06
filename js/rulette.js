(function ($) {
  $.fn.extend({

    roulette: function (options) {

      var defaults = {
        angle: 0,
        angleOffset: -45,
        speed: 5000,
        easing: "easeInOutElastic",
      };

      var opt = $.extend(defaults, options);

      return this.each(function () {
        var o = opt;
        var data = [
          {
            color: '#E4022C',
            textColor: '#FFFFFF',
            status: 'winner',
            text: '+20 puntos'
          },
          {
            color: '#FEE8EA',
            textColor: '#000000',
            status: 'winner',
            text: 'Gift Card 50 USD'
          },
          {
            color: '#E4022C',
            textColor: '#FFFFFF',
            status: 'loser',
            text: 'Sigue intentando'
          },
          {
            color: '#FEE8EA',
            textColor: '#000000',
            status: 'winner',
            text: 'Combo KFC'
          },
          {
            color: '#E4022C',
            textColor: '#FFFFFF',
            status: 'winner',
            text: 'Canasta Multi Producto'
          },
          {
            color: '#FEE8EA',
            textColor: '#000000',
            status: 'winner',
            text: 'Regalo sorpresa'
          },
          {
            color: '#E4022C',
            textColor: '#FFFFFF',
            status: 'loser',
            text: 'Sigue intentando'
          },
          {
            color: '#FEE8EA',
            textColor: '#000000',
            status: 'winner',
            text: 'Regalo sorpresa'
          },
          {
            color: '#E4022C',
            textColor: '#FFFFFF',
            status: 'winner',
            text: '+50 Puntos'
          },
          {
            color: '#FEE8EA',
            textColor: '#000000',
            status: 'loser',
            text: 'Sigue intentando'
          },
          {
            color: '#E4022C',
            textColor: '#FFFFFF',
            status: 'winner',
            text: 'Canasta Multi Producto'
          },
          {
            color: '#FEE8EA',
            textColor: '#000000',
            status: 'winner',
            text: 'Regalo sorpresa'
          }
        ];

        var $wrap = $(this);
        var $btnStart = $wrap.find("#btn-start");
        var $roulette = $wrap.find(".roulette");
        var wrapW = $wrap.width();
        var angle = o.angle;
        var angleOffset = o.angleOffset;
        var speed = o.speed;
        var esing = o.easing;
        var itemSize = data.length;
        var itemSelector = "item";
        var labelSelector = "label";
        var d = 360 / itemSize;
        var borderTopWidth = wrapW;
        var borderRightWidth = tanDeg(d);

        for (i = 1; i <= itemSize; i += 1) {
          var idx = i - 1;
          var rt = i * d + angleOffset;
          var itemHTML = $('<div class="' + itemSelector + '">');
          var labelHTML = '';
          labelHTML += '<p class="' + labelSelector + '">';
          labelHTML += '	<span class="text">' + data[idx].text + '<\/span>';
          labelHTML += '<\/p>';

          $roulette.append(itemHTML);
          $roulette.children("." + itemSelector).eq(idx).append(labelHTML);
          $roulette.children("." + itemSelector).eq(idx).css({
            "left": wrapW / 2,
            "top": -wrapW / 2,
            "border-top-width": borderTopWidth,
            "border-right-width": borderRightWidth,
            "border-top-color": data[idx].color,
            "transform": "rotate(" + rt + "deg)"
          });

          var textH = parseInt(((2 * Math.PI * wrapW) / d) * .5);

          var isMobileView = window.matchMedia('(max-width: 640px)').matches;
          var $label = $roulette.children("." + itemSelector).eq(idx).children("." + labelSelector);

          $label.css({
            "height": textH + 'px',
            "line-height": textH + 'px',
            "color": data[idx].textColor
          });

          if (isMobileView) {
            $label.css("transform", 'translateX(51.6px) translateY(-121.4px) rotateZ(' + (90 + d * .5) + 'deg)');
          } else {
            $label.css("transform", "");
          }

        }

        function tanDeg(deg) {
          var rad = deg * Math.PI / 180;
          return wrapW / (1 / Math.tan(rad));
        }


        $btnStart.on("click", function () {
          rotation();
        });

        function rotation() {
          var idxDataSelected = r(0, itemSize - 1);
          var completeA = 360 * r(5, 10) + ((360 / itemSize) * idxDataSelected);
          var rotateOptions = {
            animateTo: completeA,
            center: ["50%", "50%"],
            callback: function () {
              var currentA = $(this).getRotateAngle();
              if (Array.isArray(currentA)) currentA = currentA[0];
              var totalRotation = currentA % 360;
              var index = (itemSize - Math.round(totalRotation / (360 / itemSize))) % itemSize;
              var selectedItem = data[index];
              showModal(selectedItem);
            },
            duration: speed
          };
          $roulette.rotate(rotateOptions);
        }

        function r(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function showModal(item) {
          var mapModal = {
            winner: $('#winnerModal'),
            loser: $('#loserModal')
          };

          var modalKey = item.status === 'winner' ? 'winner' : 'loser';
          var $modal = mapModal[modalKey];
          if (!$modal || $modal.length === 0) return;

          $modal.find('#text').text(item.text)

          var modalId = $modal.attr('id');
          if (modalId && typeof MicroModal !== 'undefined') {
            try {
              MicroModal.show(modalId);
              return;
            } catch (_) {}
          }

          $modal.addClass('is-open');
        }
      });
    }
  });
})(jQuery);

$(function () {

  $('.box-roulette').roulette();

});