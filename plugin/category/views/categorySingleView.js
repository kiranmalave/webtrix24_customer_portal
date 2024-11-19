define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'minicolors',
  'Swal',
  '../../core/views/multiselectOptions',
  '../collections/categoryCollection',
  '../models/categorySingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/categorySingle_temp.html',
], function ($, _, Backbone, validate, inputmask, minicolors, Swal, multiselectOptions, categoryCollection, categorySingleModel, readFilesView, categorytemp) {

  var categorySingleView = Backbone.View.extend({
    model: categorySingleModel,
    form_label:'',
    initialize: function (options) {
      this.form_label = options.form_label;
      this.multiselectOptions = new multiselectOptions();
      this.toClose = "categorySingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "categoryList";
      this.model = new categorySingleModel();
      var selfobj = this;
      this.loadFrom = options.loadfrom;
      this.slug_id = options.slug;
      $(".modelbox").hide();
      scanDetails = options.searchCategory;
      $(".popupLoader").show();
      var categoryList = new categoryCollection();
      categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', is_parent: 'yes', isSub: 'N' }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        } 
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("categoryList", res.data);
        selfobj.render();
      });
     
      if (options.category_id != "" && options.category_id != undefined) {
        this.model.set({ category_id: options.category_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          } 
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      } else {
       
          if(options.slug != undefined && options.slug != "")
          {
            this.model.set({parent_id : options.slug});
          }
          selfobj.render();
          $(".popupLoader").hide();
      }
    },
    
    events:
    {
      "click .savecategoryDetails": "savecategoryDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
      "change .logoAdded": "updateImageLogo",
      "click .loadMedia": "loadMedia",
      "keyup .titleChange": "updateURL",
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },

    updateURL: function (e) {
      var url = $(e.currentTarget).val().trim().toLowerCase().replace(/[^A-Z0-9]+/ig, "_");
      //var url = $(e.currentTarget).val().toLowerCase().trim().replace(/[^A-Z0-9]+/ig, "-");
      $("#slug").val(url);
      this.model.set({ "slug": url });
    },

    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },
    
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status", "is_parent"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },

    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "cover_image": url });
      this.render();
    },

    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      var menusingleview = new readFilesView({ loadFrom: "addpage", loadController: this });
    },

    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      console.log(selfobj.model);
      let isRender = $(e.currentTarget).attr("data-render");
      if (isRender == "yes") {
        $("#parent_id").val("");
        selfobj.render();
      }
    },

    savecategoryDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("category_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#categoryDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
            var lastCatiD = res.lastID;
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
            }
            if(selfobj.loadFrom !=''){
              scanDetails.refreshCat(lastCatiD);
            }else{
              scanDetails.filterSearch();
            }
            // if (selfobj.loadFrom == "TaskSingleView") {
            //   scanDetails.refreshCat(lastCatiD);
            // }else if(selfobj.loadFrom == "courseSingleView") {
            //   scanDetails.refreshCat(lastCatiD);
            // }else if(selfobj.loadFrom == "PageMasterSingle"){
            //   scanDetails.refreshCat(lastCatiD);
            // }else if(selfobj.loadFrom == "dynamicForm"){
            //   scanDetails.refreshCat(lastCatiD);
            // } else if(selfobj.loadFrom == "ProductSingleView"){
            //   scanDetails.refreshCat(lastCatiD);
            // }else if(selfobj.loadFrom == "customerSingleView"){
            //   scanDetails.refreshCat(lastCatiD);
            // }else if(selfobj.loadFrom == "ourTeamSingleView"){
            //   scanDetails.refreshCat(lastCatiD);
            // }else if(selfobj.loadFrom == "taxInvoiceSingleView"){
            //   scanDetails.refreshCat(lastCatiD);
            // }else if(selfobj.loadFrom == "accountSingleView"){
            //   scanDetails.refreshCat(lastCatiD);
            // }else if(selfobj.loadFrom == "ProjectSingleView"){
            //   scanDetails.refreshCat(lastCatiD);
            // }else{
            //   scanDetails.filterSearch();
            // }
          }
        });
      }
    },

    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        categoryName: {
          required: true,
        },
        categorySlug: {
          required: true,
        },
        is_parent: {
          required: true,
        },
        profile_pic_view: {
          required: true,
        },
        parent_id: {
          required: true,
        },
        status: {
          required: true,
        }
      };
      var feildsrules = feilds;

      var messages = {
        categoryName: "Please enter Category Name",
        categorySlug: "Please enter Category Slug",
        is_parent: "Please  select  is parent ",
        profile_pic_view: " please select profile picture",
        status: "Please enter Status",
      };

      $("#categoryDetails").validate({
        rules: feildsrules,
        messages: messages
      });

      $('.color').minicolors({
        format: "hex",
        opacity: true,
        change: function (value, opacity) {
          console.log($(this));
          if ($(this).hasClass("subObj")) {
            let inID = $(this).attr("data-toChange");
            let ob = selfobj.model.get(inID);
            console.log(ob);
            if (typeof (ob) == "string") {
              ob = JSON.parse(ob);
            }
            ob.color = value;
            let elID = $(this).attr("data-toChange");
            let newdetails = [];
            newdetails["" + elID] = ob;
            selfobj.model.set(newdetails);
          } else {
            let elID = this.id;
            let newdetails = [];
            newdetails["" + elID] = value;
            selfobj.model.set(newdetails);
          }
        },
        theme: 'bootstrap',
      });
      $(".ws-select").selectpicker('refresh');
    },

    render: function () {
      var selfobj = this;
      //var isexits = checkisoverlay(this.toClose);
      //if(!isexits){
        this.undelegateEvents();  
      var source = categorytemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes,"colors":CAT_COLORS}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".tab-content").append(this.$el);
      $('#' + this.toClose).show();
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      rearrageOverlays(selfobj.form_label, this.toClose);
      setToolTip();
      var __toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ direction: "rtl" }], // text direction
        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ align: [] }],
        ["link"],
        ["clean"], // remove formatting button
      ];
      var editor = new Quill($("#categorydescription").get(0), {
        modules: {
          toolbar: __toolbarOptions,
        },
        theme: "snow", // or 'bubble'
      });

      //const delta = editor.clipboard.convert();
      //editor.setContents(delta, 'silent');
      editor.on("text-change", function (delta, oldDelta, source) {
        if (source == "api") {
          console.log("An API call triggered this change.");
        } else if (source == "user") {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          selfobj.model.set({ description: justHtml });
        }
      });
      this.delegateEvents();
      return this;
    }, onDelete: function () {
      this.remove();
    },
    destroy: function() {
      this.remove(); // Removes the view's element from the DOM
      this.unbind(); // Unbind all events that were bound to this view
      this.stopListening(); // Stop listening to model events or other objects
    }
    
  });

  return categorySingleView;

});
