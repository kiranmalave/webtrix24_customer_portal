define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'Swal',
  'Quill',
  "../../category/collections/categoryCollection",
  '../../category/views/categorySingleView',
  '../../core/views/multiselectOptions',
  '../models/pagesMasterSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/pagesMasterSingleTemp.html',
], function ($, _, Backbone, validate, inputmask, Swal, Quill, categoryCollection, categorySingleView, multiselectOptions, pagesMasterSingleModel, readFilesView, pagesMasterTemp) {

  var pagesMasterSingleView = Backbone.View.extend({
    form_label:'',
    initialize: function (options) {
      this.form_label = options.form_label;
      this.menuName = options.menuName;
      this.toClose = "pageMasterSingleView";
      var selfobj = this;
      this.pluginName = "pages";
      this.pluginId = options.pageId
      this.multiselectOptions = new multiselectOptions();
      this.parentCont = options.parentCont;
      $(".modelbox").hide();
      $('#pageMasterData').remove();
      $(".popupLoader").show();
      var pageID = options.pageID;
      this.model = new pagesMasterSingleModel();
      if (pageID != 0) {
        this.model.set({ pageID: pageID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
          selfobj.setOldValues();
        });
      } else {
        selfobj.render();
        $(".popupLoader").hide();
      }
      if (this.menuName == "pages") {
        this.model.set({ page_type: "page" });
      } else if (this.menuName == "blogs") {
        this.model.set({ page_type: "blog" });
      } else if (this.menuName == "services") {
        this.model.set({ page_type: "service" });
      }
      this.categoryList = new categoryCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
    },
    events:
    {
      "click .saveDetails": "saveDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "click .checkVal": "updateOtherDetailsCheck",
      "change .dropval": "updateOtherDetails",
      "keyup .titleChange": "updateURL",
      "click .loadMedia": "loadMedia",
      "change .multiSelect": "multiSelectOptions",
    },


    multiSelectOptions: function (e) {
      var selfobj = this;
      e.stopPropagation();
      var toID = $(e.currentTarget).attr("id");
      var valuetxt = $(e.currentTarget).val().join(",");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      selfobj.model.set(newdetails);
      console.log("selfobj.model",selfobj.model);
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },

    updateURL: function (e) {
      var url = $(e.currentTarget).val().trim().replace(/[^A-Z0-9]+/ig, "-");
      if (url !== "") {
          $("#pageLink").closest('.form-line').addClass("focused");
      } else {
          $("#pageLink").closest('.form-line').removeClass("focused");
      }
      $("#pageLink").val(url);
      this.model.set({ "pageLink": url });
    },

    updateOtherDetails: function (e) {
      e.stopPropagation();
      var valuetxt = $(e.currentTarget).val();
      if (valuetxt == "addCategory") {
        new categorySingleView({ searchCategory: this, loadfrom: "PageMasterSingle" });
      }
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },
 
    updateOtherDetailsCheck: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      var ische = $(e.currentTarget).is(":checked");
      if (ische) {
        newdetails["" + toID] = "yes";
      } else {
        newdetails["" + toID] = "no";
      }
      this.model.set(newdetails);
    },

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status","is_external_link","show_banner_image","show_description_on_website"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },

    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      let isRender = $(e.currentTarget).attr("data-render");
      if (isRender == "yes") {
        selfobj.render();
      }
    },

    getSelectedFile:function(url){
      $('.'+this.elm).val(url);
      $('.'+this.elm).change();
      $("#profile_pic_view").attr("src",url);
      $("#profile_pic_view").css({"max-width":"100%"});
      $('#largeModal').modal('toggle');
      this.model.set({"feture_image":url});
    },

    loadMedia: function(e){
      e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({loadFrom:"addpage",loadController:this});
    },

    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },

    saveDetails: function (e) {
      e.preventDefault();
      let isNew = $(e.currentTarget).attr("data-action");
      var pageID = this.model.get("pageID");

      if (pageID == "" || pageID == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if (this.menuName == "blogs") {
        this.model.set({ "page_type": "blog" });
      }
      if (this.menuName == "services") {
        this.model.set({ "page_type": "service" });
      }
      if ($("#pagesDetails").valid()) {
        var selfobj = this;
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          selfobj.parentCont.filterSearch();
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
            }
          }
        });
      }
    },

    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        pageTitle: {
          required: true,
        },
        pageLink: {
          required: true,
        },
        pageSubTitle:{
          required: true,
        },
        keywords: {
          required: true,
        },
        metaDesc: {
          required: true,
        },
        status: {
          required: true,
        },
        description: {
          required: true,
        },
        external_link: {
          required: true,
        },
      };

      var messages = {
        pageTitle: "Please enter page Title",
        pageSubTitle: "Please enter page Sub-Title",
        pageLink: "Please enter page link",
        keywords: "Please enter keyword",
        metaDesc: "Please enter metaDesc",
        status: "Please select status",
        description: "Please enter description",
      };
      $("#pagesDetails").validate({
        rules: feilds,
        messages: messages,
      });
      
    },
    
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = pagesMasterTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      // console.log("this.categoryList.models",this.categoryList.models);
      this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models, "menuName": this.menuName }));
      this.$el.addClass("tab-pane in active panel_overflow heading-top");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      this.initializeValidate();
      this.setOldValues();
      setToolTip();
      $('.ws-select').selectpicker();
      rearrageOverlays(selfobj.form_label, this.toClose);

      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];

      var editor = new Quill($("#description").get(0), {
        modules: {
          toolbar: __toolbarOptions
        },
        theme: 'snow'  // or 'bubble'
      });

      //const delta = editor.clipboard.convert();
      //editor.setContents(delta, 'silent');
      editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          selfobj.model.set({ "description": justHtml });
        }
      });
      this.delegateEvents();
      return this;
    }
  });

  return pagesMasterSingleView;

});
