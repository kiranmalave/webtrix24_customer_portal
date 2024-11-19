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
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../models/currencySingleModel',
  '../../category/collections/slugCollection',
  '../../companyMaster/collections/companyCollection',
  '../../category/views/categorySingleView',
  '../../readFiles/views/readFilesView',
  'text!../templates/currencySingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, minicolors,moment, Quill,Swal,multiselectOptions,dynamicFieldRender, currencySingleModel, slugCollection ,companyCollection,categorySingleView,readFilesView, currencytemp) {
  var currencySingleView = Backbone.View.extend({
    form_label:'',
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "currencySingleView";
      var selfobj = this;
      this.form_label = options.form_label;
      this.menuId = options.menuId;
      this.loadFrom = options.loadfrom;
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      this.multiselectOptions = new multiselectOptions();
      // var mname = Backbone.history.getFragment();
      var service_id = options.action;
      readyState = true;
      this.pluginName = "currencyList";
      this.pluginId = options.pluginId;
      this.model = new currencySingleModel();
      this.categoryList = new slugCollection();
      this.companyList = new companyCollection();
      this.scanDetails = options.searchcurrency;
      $(".profile-loader").show();
      $('.loder').show();
      if (options.currency_id !="") {
        this.model.set({ currency_id:options.currency_id});
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
      "click .currencyDetails": "savecurrencyDetails",
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
        new categorySingleView({ slug:category_id, searchCategory: this, loadfrom: "currencySingleView" , form_label : "Category" });
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
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'currency_types,unit' }
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
    savecurrencyDetails: function(e){
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("currency_id");
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
      if($("#currencyDetails").valid()){
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
              selfobj.scanDetails.getCurrencyCollection();
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
        name: {
          required: true,
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
      
      $("#opening_balance_date").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        endDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (selected) {
        $('#opening_balance_date').change();
        var valuetxt = $("#opening_balance_date").val();
        selfobj.model.set({ 'opening_balance_date': valuetxt });
      });

      var messages= {
        name: "Please Enter currency Name",                      
      }
        var r = $("#currencyDetails").validate({
          rules: feildsrules,
          messages: messages, 
        });
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = currencytemp;
      var template = _.template(source);
      $("#"+this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models,"companyList": this.companyList.models }));
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
      rearrageOverlays(selfobj.form_label, this.toClose);
      this.delegateEvents();
      return this;
    },onDelete: function(){
      this.remove();
    },
  });
  return currencySingleView;
});