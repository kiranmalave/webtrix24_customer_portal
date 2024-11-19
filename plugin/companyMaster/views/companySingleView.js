define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'Quill',
    'Swal',
    '../../core/views/multiselectOptions',
    '../../dynamicForm/views/dynamicFieldRender',
    '../../readFiles/views/readFilesView',
    '../models/companySingleModel',
    '../../core/views/countryExtList',
    '../../core/collections/countryCollection',
    '../../core/collections/stateCollection',
    '../../core/collections/cityCollection',
    'text!../templates/companySingle_temp.html',
  ], function ($, _, Backbone, validate, inputmask, datepickerBT,Quill, Swal, multiselectOptions, dynamicFieldRender,readFilesView,companySingleModel, countryExtList, countryCollection,stateCollection,cityCollection,companyTemp) {
  
    var companySingleView = Backbone.View.extend({
      model: companySingleModel,
      form_label:'',
      initialize: function (options) {
        this.loadFrom = options.loadfrom;
        var selfobj = this;
        this.toClose = "companySingleView";
        this.countryList = new countryCollection();
        this.stateList = new stateCollection();
        $("#state").attr("disabled", true);
        this.pluginName = Backbone.history.getFragment();
        this.model = new companySingleModel();
        this.countryListView = new countryExtList();
        this.countryExtList = this.countryListView.countryExtList;
        selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
        this.form_label = options.form_label;
        selfobj.menuId = options.menuId;
        selfobj.model.set({ menuId: options.menuId });
        this.stateList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', country: "101" }
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          } 
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
        if (options.infoID != ""  && options.infoID != null && options.infoID != "undefined") {
          this.model.set({ infoID: options.infoID });
          this.model.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            },data:{menuId:selfobj.model.get("menuId")}, error: selfobj.onErrorHandler
          }).done(function (res) {
            if (res.flag == "F") {
              Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
            } 
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
            selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
            selfobj.render();
            
          });
        }
        
        this.multiselectOptions = new multiselectOptions();
        $(".modelbox").hide();
        scanDetails = options.searchCompany;
        $(".popupLoader").show();
      },
      events:
      {
        "click .saveCompanyDetails": "saveCompanyDetails",
        "click .item-container li": "setValues",
        "blur .txtchange": "updateOtherDetails",
        "click .multiSel": "setValues",
        "change .bDate": "updateOtherDetails",
        "change .dropval": "updateOtherDetails",
        "change .logoAdded": "updateImageLogo",
        "click .loadMedia": "loadMedia",
        "blur .multiselectOpt": "updatemultiSelDetails",
        "click .singleSelectOpt": "selectOnlyThis",
        "change .stateChange": "setState",
        "change .changeEmailSettings": "changeEmailSettings",
        "click .deleteAttachment": "deleteAttachment",
      },
  
      isGstBilling : function(e){
        var value = this.model.get("is_gst_billing");
        console.log(value);
        if(value == "yes"){
          $('.isGst').show();
        }else{
          $('.isGst').hide();
        }
       
      },
      isDisplayPayment : function(e){
        selfobj = this ;
        var isDisplayPayment = $(e.currentTarget).is(":checked") ? 'yes' : 'no';
        selfobj.model.set({'is_display_payment' : isDisplayPayment});
        console.log('this model : ', selfobj.model.attributes);
      },
      changeEmailSettings: function(e){
        e.stopPropagation();
        let selfobj = this;
        var value = $(e.currentTarget).val();
        if(value == "smtp"){
          $(".smtpDiv").show();
          $(".sendGrid").hide();
          $(".brevo").hide();
        }else if(value == "sendgrid"){
          $(".smtpDiv").hide();
          $(".brevo").hide();
          $(".sendGrid").show();
        }else if(value == "brevo"){
          $(".smtpDiv").hide();
          $(".sendGrid").hide();
          $(".brevo").show();
        }else if(value == ""){
          $(".smtpDiv").hide();
          $(".sendGrid").hide();
          $(".brevo").hide();
          selfobj.model.set({"email_provider":null});
        }
      },

      deleteAttachment: function(e){
        var file = $(e.currentTarget).attr("data-fileType");
        if(file == "invoice"){
          this.model.set({'invoice_logo' : null});
          $("#invoiceLogo").attr("src", "");
          $(".invoiceLogoHide").show();
          $(".invoiceLogoShow").hide();
        }else if(file == "email"){
          this.model.set({'email_logo' : null});
          $("#emailLogo").attr("src", "");
          $(".emailLogoHide").show();
          $(".emailLogoShow").hide();
        }
      },
  
      loadMedia: function (e) {
        e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = e;
        new readFilesView({ loadFrom: "addpage", loadController: this });
      },

      getSelectedFile: function (url) {
        var filename = url.substring(url.lastIndexOf('/') + 1);
        var type = $(this.elm.currentTarget).attr("data-type");
        if (type == "invoiceLogo") {
          $("#invoiceLogo").attr("src", url);
          $("#invoiceLogo").css({ "max-width": "50%" });
          $(".invoiceLogoHide").hide();
          $(".invoiceLogoShow").show();
          $('#invoiceLogo').addClass('loadMedia');
          this.model.set({ "invoice_logo": filename });
        } else if (type == "emailLogo") {
          $("#emailLogo").attr("src", url);
          $("#emailLogo").css({ "max-width": "50%" });
          $(".emailLogoHide").hide();
          $('.emailLogoShow').show();
          $('#emailLogo').addClass('loadMedia');
          this.model.set({ "email_logo": filename });
        }
        $('#largeModal').modal('toggle');
      },
  
      onErrorHandler: function (collection, response, options) {
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
      },
  
      setCountryCode: function () {
        var value = this.model.get('countryCode');
        $(".countrySelect .filter-option-inner-inner").text(value);
      },

      updateOtherDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toName = $(e.currentTarget).attr("id");
        var newdetails = [];
        if(valuetxt != "Ext"){
          newdetails["" + toName] = valuetxt;
          this.model.set(newdetails);
        }
        
        if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
          this.model.set(toName, this.model.get(toName).join(","));
        }
        if (toName == "countryCodeNumber"){
          $(".countrySelect .filter-option-inner-inner").text(valuetxt);
        }
        console.log(this.model);
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

      setState: function (e) {
        e.stopPropagation();
        var state_id = $(e.currentTarget).val();
        this.model.set({ state: state_id });
      },
      setDocPrefix: function(){
        var selfobj = this;
        $('.docPrefixDiv').each(function () {
          var suffix = $(this).attr("data-suffix");
          var curr_Year = new Date().getFullYear();
          const prefixMap = {
            'in': 'INV/',
            'dc': 'DC/',
            'quo': 'QT/',
            'pro': 'PI/',
            'pur': 'PUR/',
            'rec': 'REC/'
          };
          var doc_prefix = prefixMap[suffix] || '';
          var doc_year = curr_Year+'-'+((curr_Year % 100)+1);
          var doc_curr_no = '0001';
          var obj = {
            [`doc_prefix_${suffix}`]: doc_prefix,
            [`doc_year_${suffix}`]: doc_year,
            [`doc_curr_no_${suffix}`]: doc_curr_no
          }
          selfobj.model.set(obj);
          $('#doc_prefix_'+suffix).val(doc_prefix);
          $('#doc_year_'+suffix).val(doc_year);
          $('#doc_curr_no_'+suffix).val(doc_curr_no);
        });
      },
      selectOnlyThis: function(e) {
        var clickedCheckbox = e.currentTarget;
        var valueTxt = $(clickedCheckbox).val();
        var toName = $(clickedCheckbox).attr("id");
        this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
        var existingData = this.model.get(toName);
        this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
      },
      
      setOldValues: function () {
        var selfobj = this;
        setvalues = ["status","is_gst_billing","is_display_payment"];
        selfobj.multiselectOptions.setValues(setvalues, selfobj);
      },
  
      setValues: function (e) {
        var selfobj = this;
        var da = selfobj.multiselectOptions.setCheckedValue(e);
        selfobj.model.set(da);
        console.log(this.model);
        selfobj.isGstBilling();
      },
  
      saveCompanyDetails: function (e) {
        e.preventDefault();
        e.stopPropagation();
        let selfobj = this;
        var mid = this.model.get("infoID");
        let isNew = $(e.currentTarget).attr("data-action");
        if (mid == "" || mid == null) {
          var methodt = "PUT";
        } else {
          var methodt = "POST";
        }
        if ($("#companyDetails").valid()) {
          $(e.currentTarget).html("<span>Saving..</span>");
          $(e.currentTarget).attr("disabled", "disabled");
          this.model.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: methodt
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (isNew == "new") {
              showResponse(e, res, "Save & New");
            } else {
              showResponse(e, res, "Save");
            }
            if (selfobj.loadFrom == "invoiceView") {
              scanDetails.refreshComp();
            }else{
              scanDetails.filterSearch();
            }
            if (res.flag == "S") {
              if (isNew == "new") {
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.model.set({ menuId: selfobj.menuId});
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                selfobj.render();
                // selfobj.attachEvents();
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
          companyName: {
            required: true,
          },
          smtp_host: {
            required: true,
          },
          smtp_user:{
            required: true,
          },
          smtp_pass:{
            required: true,
          },
          smtp_post:{
            required: true,
          },
          sendgrid_API: {
            required: true,
          },
          brevo_API:{
            required: true,
          },
          mobile_number:{
            minlength: 10,
            maxlength: 10,
          },
          ifsc_code:{
            minlength: 11,
            maxlength: 11,
          },
          pan:{
            minlength: 10,
            maxlength: 10,
          }
        
        };
        var feildsrules = feilds;
        var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
  
        if (!_.isEmpty(dynamicRules)) {
          var feildsrules = $.extend({}, feilds, dynamicRules);
        }
        var messages = {
            companyName: "Please enter Company Name",
            smtp_host: "Please enter SMTP HOST",
            smtp_user: "Please enter SMTP USER",
            smtp_pass: "Please enter SMTP Password",
            smtp_post: "Please enter SMTP Port",
            sendgrid_API: "Please enter Sendgrid Key",
            brevo_API:"Please enter Brevo Key",
            mobile_number:"Please enter valid number",
            ifsc_code:"Please enter valid IFCS code",
            pan:"Please enter valid PAN number",
        };
        $("#mobile_number").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
        $("#pan").inputmask("Regex", { regex: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$" });
        $("#ifsc_code").inputmask("Regex", { regex: "^[A-Z]{4}0[A-Z0-9]{6}$" });
        $("#companyDetails").validate({
          rules: feildsrules,
          messages: messages
        });

        var input = document.getElementById('company_address');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.addListener('place_changed', function () {
          var place = autocomplete.getPlace();
          if (place == "") {
            selfobj.model.set({ "company_address": input.value() });
          } else {
            selfobj.model.set({ "company_address": place.formatted_address });
            selfobj.model.set({ "latitude": place.geometry['address'].lat() });
            selfobj.model.set({ "longitude": place.geometry['address'].lng() });
            selfobj.model.set({ "address_url": place.url });
          }
        });
        $(".ws-select").selectpicker('refresh');
        selfobj.setCountryCode();
      },

      render: function () {
        var selfobj = this;
        this.undelegateEvents();
        var source = companyTemp;
        var template = _.template(source);
        $("#" + this.toClose).remove();
        console.log(this.model.attributes);
        this.$el.html(template({ "model": this.model.attributes, stateList: this.stateList.models, countryExtList: selfobj.countryExtList }));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id', this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role", "tabpanel");
        this.$el.data("current", "yes");
        $(".tab-content").append(this.$el);
        $('#' + this.toClose).show();
        $(".ws-select").selectpicker("refresh");
        $(".ws-select").selectpicker();
        $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
        this.initializeValidate();
        this.setOldValues();
        setToolTip();
        rearrageOverlays(selfobj.form_label, this.toClose);
        
        if ($('#dynamicFormFields').children().length === 0 || $('#dynamicFormFields').children().filter(function() {
          return $(this).html().trim() !== '';
        }).length === 0) {
            $('#dynamicFormFields').append('<p style="padding-left: 30px; padding-bottom: 30px;">No custom fields present.</p>');
        }
        if (selfobj.model.get('infoID') == null || selfobj.model.get('infoID') == undefined ) {
          selfobj.setDocPrefix(); 
        }
        var invoiceLOGO = this.model.get("invoice_logo");
        if(invoiceLOGO != "" && invoiceLOGO != null){
          $(".invoiceLogoHide").hide();
          $('#invoiceLogo').addClass("loadMedia");
        }

        var emailLOGO = this.model.get("email_logo");
        if(emailLOGO != "" && emailLOGO != null){
          $(".emailLogoHide").hide();
          $('#emailLogo').addClass("loadMedia");
        }

        var __toolbarOptions = [
          ["bold", "italic", "underline", "strike"],
          [{ header: 1 }, { header: 2 }],
          [{ direction: "rtl" }], 
          [{ size: ["small", false, "large", "huge"] }], 
          [{ align: [] }],
          ["link"],
          ["clean"],
        ];
        var invoiceEditor = new Quill($("#invoice_terms_condotions_quill").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
        console.log("invoiceEditor",invoiceEditor);
     
        invoiceEditor.on("text-change", function (delta, oldDelta, source) {
          console.log("text-change");
          console.log("source",source);
          if (source == "api") {
            console.log("An API call triggered this change.");
          } else if (source == "user") {
            var delta = invoiceEditor.getContents();
            var text = invoiceEditor.getText();
            var justHtml = invoiceEditor.root.innerHTML;
            selfobj.model.set({ invoice_terms_condotions: justHtml });
          }
        });

        var quotationEditor = new Quill($("#quotation_terms_conditions_quill").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
     
        quotationEditor.on("text-change", function (delta, oldDelta, source) {
          console.log("text-change");
          console.log("source",source);
          if (source == "api") {
            console.log("An API call triggered this change.");
          } else if (source == "user") {
            var delta = quotationEditor.getContents();
            var text = quotationEditor.getText();
            var justHtml = quotationEditor.root.innerHTML;
            selfobj.model.set({ quotation_terms_conditions: justHtml });
          }
        });

        var receiptEditor = new Quill($("#receipt_terms_condotions_quill").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
     
        receiptEditor.on("text-change", function (delta, oldDelta, source) {
          console.log("text-change");
          console.log("source",source);
          if (source == "api") {
            console.log("An API call triggered this change.");
          } else if (source == "user") {
            var delta = receiptEditor.getContents();
            var text = receiptEditor.getText();
            var justHtml = receiptEditor.root.innerHTML;
            selfobj.model.set({ receipt_terms_condotions: justHtml });
          }
        });
        this.delegateEvents();
        return this;
      }, onDelete: function () {
        this.remove();
      }
    });
  
    return companySingleView;
  
  });