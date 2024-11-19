
define([
  'jquery',
  'underscore',
  'backbone',
  'text!../templates/customerMail_temp.html',
], function ($, _, Backbone, customerMail_temp) {
  var customerMailsView = Backbone.View.extend({
    emailMasterList: [],
    initialize: function (options) {
      console.log("options", options);
      var selfobj = this;
      selfobj.emailMasterList = options.emailMasterList;
      selfobj.render();
    },

    render: function () {
      $(".profile-loader").hide();
      var selfobj = this;
      var source = customerMail_temp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      $(".customMail").empty().append(template({ "emailMasterList": selfobj.emailMasterList }));

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
      var editor = new Quill($("#mail_description").get(0), {
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
          selfobj.model.set({"mail":justHtml});
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
      // $(".ws-select").selectpicker();

      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return customerMailsView;

});
