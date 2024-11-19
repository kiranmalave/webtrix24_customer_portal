define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!../templates/listSliderTemp.html',
], function ($, _, Backbone, moment, listSliderTemp) {
    var listSliderView = Backbone.View.extend({
        initialize: function (options) {
            var selfObj = this;
            this.sectionID = '';
            this.sectionID = options.sectionID;
            $(document).ready(function () {
                selfObj.render();
            });
        },

        listSlider: function () {
          var selfObj = this;
          var offset = [0, 0];
          var tableElement = document.getElementById(selfObj.sectionID);
          var divOverlay = document.querySelector("#" + selfObj.sectionID + ' .list-scroll-active');
          var scrollView = document.querySelector("#" + selfObj.sectionID + ' .list-columns-thumbs');
          // scrollView.innerHTML = "";
          var kanban = $(tableElement).find('.customTableClass')[0];
          var customTableClass = $(tableElement).find('.customTableClass').eq(0).attr('class');
          var classNames = customTableClass.split(' ');
          var desiredClassName = classNames.find(className => className === 'customTableClass');
          $(document).ready(function() {
            if(desiredClassName){
              $('.'+desiredClassName).on('scroll', function() {
                var scrollHeight = $(this)[0].scrollHeight;
                scrollHeight = scrollHeight - 20 ;
                var scrollPosition = $(this).height() + $(this).scrollTop();
                if (scrollPosition + 50 > scrollHeight) {
                  $('.'+desiredClassName).addClass('add-extra-padding');
                } else {
                  $('.'+desiredClassName).removeClass('add-extra-padding');
                }
              });
            }
          });
          var isDown = false;
          calViewPortScroll();
          window.addEventListener('resize', calViewPortScroll);
        
          function calViewPortScroll() {
            var viewPort = kanban ? parseInt(kanban.offsetWidth) * 100 / parseInt(kanban.scrollWidth) : '';
            divOverlay.style.width = viewPort + "%";
          }
      
          document.removeEventListener('mouseup', handleMouseUp, true);
          if (divOverlay) {
            divOverlay.removeEventListener('mousedown', handleMouseDown, true);
            divOverlay.removeEventListener('mousemove', handleMouseMove, true);
          }
          if (kanban) {
            if (kanban instanceof Element) {
              kanban.removeEventListener('scroll', handleScroll);
            } else {
              $(kanban).off('scroll', handleScroll);
            }
          }
      
          function handleMouseUp() {
            isDown = false;
          }
        
          function handleMouseDown(e) {
            isDown = true;
            offset = [
              divOverlay.offsetLeft - e.clientX,
              divOverlay.offsetTop - e.clientY
            ];
          }
        
          function handleScroll() {
            $(".list-scroll-view").css("opacity","1");
            if (!isDown) {
              var CalPositionPer = (kanban.scrollLeft * 100 / kanban.scrollWidth);
              var decideScroll = scrollView.offsetWidth * CalPositionPer / 100;
              divOverlay.style.left = decideScroll + 'px';
              setTimeout(function() {
                $(".list-scroll-view").css("opacity","0.4");
            }, 1000); // Adjust the delay as needed
            }
          }
        
          function handleMouseMove(e) {
            e.preventDefault();
            if (isDown) {
              var wid = scrollView.offsetWidth - divOverlay.offsetWidth;
              var newLeft = e.clientX + offset[0];
              if ((newLeft) > 0 && (newLeft) < wid) {
                var CalPositionPer = (scrollView.offsetWidth * (newLeft) / 100);
                var decideScroll = kanban.scrollWidth * CalPositionPer / 100;
                divOverlay.style.left = (newLeft) + 'px';
                kanban.scrollLeft = decideScroll;
              }
              if ((newLeft) <= 0) {
                kanban.scrollLeft = 0;
              }
            }
          }
        
          document.addEventListener('mouseup', handleMouseUp, true);
          if (divOverlay) {
            divOverlay.addEventListener('mousedown', handleMouseDown, true);
            divOverlay.addEventListener('mousemove', handleMouseMove, true);
          }
          if (kanban) {
            if (kanban instanceof Element) {
              kanban.addEventListener('scroll', handleScroll);
            } else {
              $(kanban).on('scroll', handleScroll);
            }
          }
        },
        
        render: function () {
            var selfObj = this;
            var template = _.template(listSliderTemp);
            this.$el.html(template({}));
            if ($("#"+selfObj.sectionID).find('.list-scroll-view').length === 0) {
                $('body').find("#"+selfObj.sectionID).append(this.$el);
            }
            selfObj.listSlider();
           
            return this;
        },
             
    });
    return listSliderView;
});
