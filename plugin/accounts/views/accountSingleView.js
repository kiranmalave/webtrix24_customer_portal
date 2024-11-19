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
  '../models/accountSingleModel',
  '../../category/collections/slugCollection',
  '../../companyMaster/collections/companyCollection',
  '../../currencyMaster/collections/currencyCollection',
  '../../currencyMaster/views/currencySingleView',
  '../../category/views/categorySingleView',
  '../../readFiles/views/readFilesView',
  'text!../templates/accountSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, minicolors,moment, Quill,Swal,multiselectOptions,dynamicFieldRender, accountSingleModel, slugCollection ,companyCollection,currencyCollection,currencySingleView,categorySingleView,readFilesView, accounttemp) {
  var accountSingleView = Backbone.View.extend({
    form_label:'',
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "accountSingleView";
      var selfobj = this;
      this.form_label = options.form_label;
      this.menuId = options.menuId;
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      this.multiselectOptions = new multiselectOptions();
      // var mname = Backbone.history.getFragment();
      console.log('options:',options);
      var service_id = options.action;
      this.loadFrom = options.loadFrom;
      readyState = true;
      this.pluginName = "accountList";
      this.pluginId = options.pluginId;
      this.model = new accountSingleModel();
      this.categoryList = new slugCollection();
      this.companyList = new companyCollection();
      this.currencyList = new currencyCollection();
      this.scanDetails = options.searchaccount;
      $(".profile-loader").show();
      $('.loder').show();
      if (options.account_id !="") {
        this.model.set({ account_id:options.account_id});
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
      selfobj.getCurrencyCollection();
    },
    events:
    {
      "click .accountDetails": "saveaccountDetails",
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
      switch (valuetxt) {
        case 'addCategory':
          var category_id = $(e.currentTarget).attr("data-slug");
          new categorySingleView({ slug:category_id, searchCategory: this, loadfrom: "accountSingleView" , form_label : "Category" });
          break;
        case 'addCurrency':
          new currencySingleView({ searchcurrency: this, loadfrom: "accountSingleView" , form_label : "Currency" });
          break;
        default:
          break;
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
    getCurrencyCollection: function () {
      let selfobj = this;
      selfobj.currencyList.fetch({
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
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'account_types,unit' }
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
    saveaccountDetails: function(e){
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("account_id");
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
      if($("#accountDetails").valid()){
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
            if (res.flag == "S") {
              if (isNew == "new") { 
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.model.set({ menuId: selfobj.menuId});
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
                selfobj.render();
              } else { 
                if (selfobj.loadFrom == 'receipts') {
                  selfobj.scanDetails.refreshAccounts();
                }else{
                  selfobj.scanDetails.filterSearch();
                }
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
        account_type: {
          required: true,
        },            
        currency: {
          required: true,
        },
        company_id : {
          required: true,
        }    
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
        name: "Please Enter Account Name",           
        account_type: "Please Enter Account Type",        
        opening_balance_date:"Please Select Opening Balance date",  
        currency:"Please Select Currency",           
        company_id: "Please Select Company ",           
      }
        var r = $("#accountDetails").validate({
          rules: feildsrules,
          messages: messages, 
        });
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = accounttemp;
      var template = _.template(source);
      $("#"+this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models,"companyList": this.companyList.models,"currencyList": this.currencyList.models }));
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
      // this.attachEvents();
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
  return accountSingleView;
});