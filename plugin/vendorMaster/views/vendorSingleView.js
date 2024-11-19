define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'minicolors',
  'moment',
  'Quill',
  'Swal',
  'slim',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../models/vendorSingleModel',
  '../../category/collections/slugCollection',
  '../../companyMaster/collections/companyCollection',
  '../../category/views/categorySingleView',
  '../../core/views/countryExtList',
  '../../readFiles/views/readFilesView',
  '../../category/views/categorySingleView',
  "../../category/collections/slugCollection",
  'text!../templates/vendorSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, minicolors,moment, Quill,Swal,slim,multiselectOptions,dynamicFieldRender, vendorSingleModel, slugCollection ,companyCollection,categorySingleView,countryExtList,readFilesView,categorySingleView,slugCollection, vendortemp) {
  var vendorSingleView = Backbone.View.extend({
    form_label:'',
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "vendorSingleView";
      var selfobj = this;
      this.form_label = options.form_label;
      this.menuId = options.menuId;
      this.vendor_id = options.vendor_id;
      this.loadFrom = options.loadfrom;
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      this.multiselectOptions = new multiselectOptions();
      // var mname = Backbone.history.getFragment();
      var service_id = options.action;
      this.countryListView = new countryExtList();
      this.countryExtList = this.countryListView.countryExtList;
      readyState = true;
      this.pluginName = "vendorList";
      this.pluginId = options.pluginId;
      this.model = new vendorSingleModel();
      this.categoryList = new slugCollection();
      this.companyList = new companyCollection();
      this.scanDetails = options.searchvendor;
      $(".profile-loader").show();
      $('.loder').show();
      if (options.vendor_id !="") {
        this.model.set({ vendor_id:options.vendor_id});
        this.model.fetch({headers: {'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          $('.loder').hide();
          $('.profile-loader').hide();
          selfobj.render();
        });
      }     
      selfobj.refreshCat();
      selfobj.getCompanyCollection();
    },
    events:
    {
      "click .vendorDetails": "savevendorDetails",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "click .multiOptionSel": "multioption",
      "change .dropval": "updateOtherDetails",
      "change .fileAdded": "updateImage",
      "click .loadMedia": "loadMedia",
      "click .singleSelectOpt": "selectOnlyThis",
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});
    $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      if (valuetxt == "addCategory") {
        var category_id = $(e.currentTarget).attr("data-slug");
        new categorySingleView({ slug:category_id, searchCategory: this, loadfrom: "vendorSingleView" , form_label : "Category" });
      }
      this.model.set(newdetails);
    },
    getCompanyCollection: function () {
      let selfobj = this;
      selfobj.companyList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },
    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'service_types' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },
    updatemultiSelDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      var existingValues = this.model.get(toName);
      if (existingValues === null || existingValues === undefined) {
          existingValues = '';
      } else if (typeof existingValues !== 'string') {
          existingValues = existingValues.toString();
      }
      existingValues = existingValues.replace(/NULL/ig, '');
      existingValues = existingValues.replace(/^,|,$/g, '');
      if ($(e.currentTarget).prop('checked')) {
          if (existingValues.indexOf(valuetxt) === -1) {
              existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
          }
      } else {
          existingValues = existingValues.split(',').filter(value => value !== valuetxt).join(',');
      }
      this.model.set({ [toName]: existingValues });
    },
    setOldValues:function(){
      var selfobj = this;
      setvalues = ["record_acc_balance"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues:function(e){
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      selfobj.render();  
    },
    savevendorDetails: function(e){
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("vendor_id");
      let isNew = $(e.currentTarget).attr("data-action");
      let isAmc = this.model.get("is_amc");
      if(isAmc == "yes"){
        let duration = $('#duration_time').val();
        let amc_duration = this.model.get("amc_duration");
        amc_duration += + " " + duration;
        selfobj.model.set({ amc_duration: amc_duration});
      }
      if(mid == "" || mid == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#vendorDetails").valid()){
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if (res.flag == "F") {
            showResponse(e, res, "Error");
            $(e.currentTarget).html("<span>Error</span>");  
          } else {
            $(e.currentTarget).html("<span>Saved</span>");
            handelClose(selfobj.toClose);
            if(selfobj.loadFrom == "accountSingleView"){
              selfobj.scanDetails.getvendorCollection();
            }else{
              selfobj.scanDetails.filterSearch();
            }
            if (res.flag == "S") {
              if (isNew == "new") { 
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.model.set({ menuId: selfobj.menuId});
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
                selfobj.render();
              } else { 
                handelClose(selfobj.toClose);
              }
              
            }
          }
          setTimeout(function () {
            (isNew == "new") ? $(e.currentTarget).html("<span>Save & New</span>"):$(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
   
      var  feilds={          
        vendor_name: {
          required: true,
        },        
        email: {
          email: true,
        },
      };
      if (selfobj.model.get('record_acc_balance') == 'yes') {
        feilds.opening_balance_date = {
          required: true,
        };
        
      }
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
      }
      
      $("#contact_no").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
      $("#pan").inputmask("Regex", { regex: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$" });
      var messages= {
        vendor_name: "Please Enter vendor Name",                      
        email: "Please Enter valid Email",        
      }
        var r = $("#vendorDetails").validate({
          rules: feildsrules,
          messages: messages, 
        });
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = vendortemp;
      var template = _.template(source);
      $("#"+this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models,"companyList": this.companyList.models,'countryExtList': selfobj.countryExtList ,'categoryList': this.categoryList.models}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id',this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role","tabpanel");
      this.$el.data("current","yes");
      $(".ws-tab").append(this.$el);
      $('#'+this.toClose).show();
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.initializeValidate();
      this.setOldValues();
      if (selfobj.model.get('with_gst') == 'no') {
        $('.gstDiv').hide();
      }
      $('.ws-select').selectpicker(); 
      $('#vendorProfilePic').slim({
        ratio: '1:1',
        minSize: {
          width: 100,
          height: 100,
        },
        size: {
          width: 100,
          height: 100,
        },
        push: true,
        rotateButton: true,
        service: APIPATH + 'changeVendorPic/' + this.vendor_id,
        download: false,
        willSave: function (data, ready) {
          //alert('saving!');
          ready(data);
        },

        didUpload: function (error, data, response) {
          var expDate = new Date();
          $(".overlap").css("display", "block");
          var newimage = $("#vendorProfilePic_view").find('img').attr("src");
          var fileName = response.newFileName
          $.cookie('photo', fileName);
          $.cookie('avtar', newimage, { path: COKI, expires: expDate });
          $("#myAccountRight").css("background-image", "url('" + newimage + "')");
        },
        willTransform: function (data, ready) {
          if ($("#vendorprofilepic").hasClass("pending")) {
            $(".overlap").css("display", "block");
          } else {
            var expDate = new Date();
            var newimage = $("#vendorProfilePic_view").find('img').attr("src");
            $.cookie('avtar', newimage, { path: COKI, expires: expDate });
            $("#myAccountRight").css("background-image", "url('" + newimage + "')");
          }
          ready(data);
        },
        willRemove: function (data, remove) {
          remove();
          var memberID = selfobj.vendor_id;
          $.ajax({
            url: APIPATH + 'delVendorPic/' + memberID,
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F")
                showResponse(e, res, '');
              if (res.statusCode == 994) { app_router.navigate("bareback-logout", { trigger: true }); }
            }
          });
          remove();
        },
        label: 'Click here to add new image or Drop your image here.',
        buttonConfirmLabel: 'Ok',
        meta: {
          memberID: selfobj.vendor_id
        }
      });

      var __toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ direction: "rtl" }], // text direction
        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ align: [] }],
        ["link"],
        ["clean"], // remove formatting button
      ];
      var editor = new Quill($("#description").get(0), {
        modules: {
          toolbar: __toolbarOptions,
        },
        theme: "snow", // or 'bubble'
      });
      editor.on('text-change', function(delta, oldDelta, source) {
        if (source == "api") {
          console.log("An API call triggered this change.");
        } else if (source == "user") {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          text = text.replace(/\n/g, '');
          selfobj.model.set({ "description": text });
        }
      });
      rearrageOverlays(selfobj.form_label, this.toClose);
      this.delegateEvents();
      return this;
    },onDelete: function(){
      this.remove();
    },
  });
  return vendorSingleView;
});