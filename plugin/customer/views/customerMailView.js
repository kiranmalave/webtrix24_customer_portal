
define([
  'jquery',
  'underscore',
  'backbone',
  'text!../templates/customerMails_temp.html',
], function ($, _, Backbone, customerMails_temp) {

  var customerMailView = Backbone.View.extend({
    initialize: function (options) {
      // console.log("options",options);
      var selfobj = this;
      $(".profile-loader").show();
      this.toClose = "mailView";
      this.customer_id = options.customer_id;
      this.custName = options.customerName;
      var data = { customer_id: this.customer_id };

      this.render();
    },

    events:
    {
      "click .composeMail": "openComposeMail",
      "click .loadView": "displayList",
    },

    openComposeMail: function () {

    },

    displayList: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-name");
      $(".listItem").removeClass("active");
      $(".cmpBox").removeClass("focusCls");
      switch (show) {
        case "Inbox": {
          $(".inboxList").show();
          $(".sentList").hide();
          $(".composeDiv").hide();
          break;
        }
        case "Sent": {
          $(".inboxList").hide();
          $(".composeDiv").hide();
          $(".sentList").show();
          break;
        }
        case "Compose": {
          $(".cmpBox").addClass("focusCls");
          $(".inboxList").hide();
          $(".sentList").hide();
          $(".composeDiv").show();
          break;
        }
      }
      $(e.currentTarget).addClass("active");
    },

    render: function () {
      $(".profile-loader").hide();
      var selfobj = this;
      var source = customerMails_temp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".tab-content").append(this.$el);
      $("#" + this.toClose).show();
      rearrageOverlays("Mail", this.toClose);

      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean'],
        ['image']                              // remove formatting button
      ];
      var editor = new Quill($("#").get(0), {
        modules: {
          imageResize: {
            displaySize: true
          },
          toolbar: {
            container: __toolbarOptions,
            handlers: {
              image: imageHandler
            }
          },
        },
        theme: 'snow'
      });
      function imageHandler() {
        var range = this.quill.getSelection();
        var value = prompt('please copy paste the image url here.');
        if (value) {
          this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
        }
      }
      editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
        }
      });

      var truncateElements = document.querySelectorAll('.truncate');
      truncateElements.forEach(function (element) {
        var maxLength = 60;
        var text = element.textContent;
        if (text.length > maxLength) {
          element.textContent = text.substring(0, maxLength) + '...';
        }
      });

      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return customerMailView;

});
