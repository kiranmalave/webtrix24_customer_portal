define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  'Quill',
  '../../core/views/multiselectOptions',
  '../../category/collections/slugCollection',
  '../../category/views/categorySingleView',
  '../models/registrationSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/registrationSingle_temp.html',

], function($, _, Backbone, validate, inputmask, datepickerBT, Swal, Quill, multiselectOptions, slugCollection, categorySingleView, registrationSingleModel, readFilesView, registrationSingleTemp) {

  var registrationSingleView = Backbone.View.extend({ 
    model: registrationSingleModel,
    form_label: '',
    initialize: function(options){
        var selfobj = this;
        this.toClose = "registrationSingleView";
        this.pluginName = "registrationList";
        this.menuId = options.menuId;
        this.model = new registrationSingleModel();
        this.model.set({ menuId: options.menuId });
        this.form_label = options.form_label;
        scanDetails = options.registration;
        $(".popupLoader").show();
        selfobj.render();
        $(".previous").hide();
        $(".preSubmit").hide();
      },
      events: {
        "click .loadMedia": "loadMedia",
        "click .multiSel": "setValues",
        "click .register-btn": "showRegisterForm",
        "click .btnNext": "btnNext",
        "click .previous": "previous",
      },
      attachEvents: function() {
      
      },
      onErrorHandler: function(collection, response, options){
        alert("Something was wrong! Try to refresh the page or contact admin. :(");
        $(".profile-loader").hide();
    },
      getSelectedFile: function(url){
        $('.' + this.elm).val(url);
        $('.' + this.elm).change();
        $("#profile_pic_view").attr("src", url);
        $("#profile_pic_view").css({"max-width": "100%"});
        $('#largeModal').modal('toggle');
        this.model.set({"image": url});
      },
      loadMedia: function(e){
        e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({loadFrom: "addpage", loadController: this});
      },
      previous: function () {
        var activeTab = document.querySelector('.active-tab');
        var previousTab;
        $(".preSubmit").hide();
        $('.btnNext').show();
        if (activeTab) {
          previousTab = activeTab.previousElementSibling;
          if (previousTab && previousTab.classList.contains('form-contents')) {
            activeTab.classList.remove('active-tab');
            previousTab.classList.add('active-tab');
            if (previousTab.getAttribute('id') == 'form1') {
              $('.previous').attr('disabled', true);
            }
          } else {
            console.log("No previous tab available");
          }
        } else {
          // If no tab is currently active, add active-tab to the first tab
          var firstTab = document.querySelector('.form-contents');
          if (firstTab) {
            firstTab.classList.add('active-tab');
          } else {
            console.log("No form is currently available");
          }
        }
      },
      btnNext: function () {
        var activeTab = document.querySelector('.active-tab');
        var nextTab;
  
        if (activeTab) {
          $(".previous").show();
          nextTab = activeTab.nextElementSibling;
          if (nextTab && nextTab.classList.contains('form-contents')) {
  
            activeTab.classList.remove('active-tab');
            nextTab.classList.add('active-tab');
            if ($(nextTab).attr('id') == 'form5') {
              $('.btnNext').hide();
              $(".preSubmit").show();
            }
            if ($(activeTab).attr('id') == 'form1') {
              $('.previous').removeAttr('disabled');
            }
  
          } else {
            console.log("No next tab available");
          }
  
        } else {
          // If no tab is currently active, add active-tab to the first tab
          var firstTab = document.querySelector('.form-contents');
          if (firstTab) {
            firstTab.classList.add('active-tab');
          } else {
            console.log("No form is currently available");
          }
        }
      },
      render: function(){
        var selfobj = this;
        var source = registrationSingleTemp;
        var template = _.template(source);
        $("#" + this.toClose).remove();
        this.$el.html(template({ "model": this.model.attributes }));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id', this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role", "tabpanel");
        this.$el.data("current", "yes");
        $(".ws-tab").append(this.$el);
        $('#' + this.toClose).show();
        $('.ws-select').selectpicker();
        rearrageOverlays(selfobj.form_label, this.toClose);
        this.uploadFileEl = $("#companyLogoUpload").RealTimeUpload({
          text: 'Company Logo',
          maxFiles: 0,
          maxFileSize: 4194304,
          uploadButton: false,
          notification: true,
          autoUpload: false,
          extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'xls', 'xlsx'],
          thumbnails: true,
          action: APIPATH + 'companyLogoUpload',
          element: 'companyLogoUpload',
          onSucess: function () {
            selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
            $('.modal-backdrop').hide();
          }
        })
        return this;
    },
    onDelete: function(){
        this.remove();
    }
  });

  return registrationSingleView;

});
