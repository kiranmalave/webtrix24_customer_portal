define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  'Swal',
  'RealTimeUpload',
  'slim',
  '../../category/views/categorySingleView',
  '../../admin/views/addAdminView',
  '../../core/views/appSettings',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  "../../category/collections/slugCollection",
  '../collections/countryCollection',
  '../collections/stateCollection',
  '../collections/cityCollection',
  '../models/customerSingleModel',
  '../../readFiles/views/readFilesView',
  '../../core/views/countryExtList',
  'text!../templates/customerSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, Swal, RealTimeUpload, slim, categorySingleView, addAdminView, appSettings, multiselectOptions, dynamicFieldRender, slugCollection, countryCollection, stateCollection, cityCollection, customerSingleModel, readFilesView, countryExtList, customertemp) {
  var customerSingleView = Backbone.View.extend({
    model: customerSingleModel,
    form_label: '',
    module_desc:'',
    plural_label:'',
    custID: '',
    updateTo:null,
    initialize: function (options) {
      this.toClose = "customerSingleView";
      // this.pluginName = "customerList";
      this.uploadFileElArray = [];
      this.model = new customerSingleModel();
      this.menuName = options.menuName;
      this.loadFrom = options.loadfrom;
      if(this.loadFrom == "project"){
        permission = ROLE["customer"];
        this.menuId = permission.menuID;
        this.model.set({ type: "customer"  });
      }else{
        this.menuId = options.menuId;
      }
      this.countryListView = new countryExtList();
      this.countryExtList = this.countryListView.countryExtList;
      this.adminID = ADMINID;
      this.adminName = ADMINNAME;
      var selfobj = this;
      selfobj.model.set({ menuId: this.menuId  });
      this.form_label = options.form_label;
      //if (options.loadfrom == "dashboard") {
        this.appSettings = new appSettings();
        this.appSettings.getMenuList(this.menuId, function (plural_label, module_desc, form_label, result) {
          selfobj.plural_label = plural_label;
          selfobj.module_desc = module_desc;
          selfobj.form_label = form_label;
          readyState = true;
        });
        
      ///}
      
      this.multiselectOptions = new multiselectOptions();
      $(".modelbox").hide();
      this.scanDetails = options.parentObj;
      $(".popupLoader").show();
      $(".profile-loader").show();
      this.stateList = new stateCollection();
      this.cityList = new cityCollection();

      $("#state_id").attr("disabled", true);
      $("#city_id").prop("disabled", true);
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'lead_stages,lead_source,lead_priority' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
        // $(".profile-loader").hide();
      });
      this.countryList = new countryCollection();
      this.countryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
        // $(".profile-loader").hide();
      });

      this.gstStateList = new stateCollection();
      this.gstStateList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', country: '101' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.LastID = '';
      this.customerID = options.customer_id;
      this.recordID = options.customer_id;
      if (options.customer_id != "" && options.customer_id != undefined) {
        this.model.set({ customer_id: options.customer_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, data: { menuId: selfobj.model.get("menuId") }, error: selfobj.onErrorHandler
        }).done(function (res) {
          var birthDate = selfobj.model.get("birth_date");
          if (birthDate != null && birthDate != "0000-00-00") {
            selfobj.model.set({ "birth_date": moment(birthDate).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
          selfobj.render();
          selfobj.setDefaultAssignee();
          selfobj.setOldValues();
        });
      }else{
        setTimeout(function () {
          selfobj.setDefaultAssignee();
          selfobj.render();
        }, 500);
      }
      
      
    },
    events: {
      "click .saveCustomerDetails": "saveCustomerDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "change .logoAdded": "updateImageLogo",
      "click .loadMedia": "loadMedia",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
      "change .countryChange": "setCountry",
      "change .stateChange": "setState",
      "click .loadFile": "loadFile",
      "click .hideUpload": "hideUpload",
      "change .assignChange": "getassignee",
      "focus .assignChange": "getassignee",
      "click .lookupValueSet": "setAssignee",
      "click .loadAttachment": "loadAttachment",
      "click .hideUploadMedia": "hideUploadMedia",
      "click .deleteAttachment": "deleteAttachments",
      "click #billing_addressCheckbox": "copyMaillingAddress",
      "change #mailing_address": "mailingAddress",
      "click #displayCountryCode": "contryCodeShow",
      "input .ws-freetxt": "getfreetext",
      "focus .ws-freetxt": "getfreetext",
      "click .selectFreeRecord": "updateDataFreeTxt",
      "click .addNewRecord": "addNew",
      "click .ws_clear": "setDefaultSalutation"
    },
    setDefaultSalutation: function(event) {
      event.stopPropagation();
      var selfobj = this;
      selfobj.model.set({'salutation' : 'mr'});
      selfobj.render();
  },
    updateDataFreeTxt:function(e){
      e.stopPropagation();
      let selfobj = this;
      let toID = $(e.currentTarget).attr("data-update");
      let record_id = $(e.currentTarget).attr("data-record_id");
      let newdetails = [];
      newdetails["" + toID] = record_id;
      this.model.set(newdetails);
      $(e.currentTarget).closest(".form-group").find("input").val($(e.currentTarget).text());
      $(".freeSerachList").hide();
    },
    onErrorHandler: function () {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
      var btnsave = $('.saveCustomerDetails[disabled]');
      var action = btnsave.attr('data-action');
      if (btnsave) {
        btnsave.removeAttr("disabled");
        if(action == "close"){
          btnsave.html("Save");
        }else{
          btnsave.html("Save & New");
        }
      }
    },

    addNew: function (e) {
      var view = $(e.currentTarget).attr('data-view');
      switch (view) {
        case 'asignee':
          new addAdminView({ searchadmin: this, loadfrom: "TaskSingleView", form_label: 'Add Assignee' });
          break;
        default:
          break;
      }
    },

    updateOtherDetails: function (e) {
      e.stopPropagation();
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      var newdetails = [];
      if (valuetxt == "addLeadSource") {
        let category_id = $(e.currentTarget).attr("data-slug");
        this.updateTo = toName;
        this.catObj = new categorySingleView({ slug: category_id, searchCategory: this, loadfrom: "customerSingleView", form_label: "Category" });
        $(e.currentTarget).val(this.model.get(""+toName));
        $(e.currentTarget).trigger('change');
        return;
      } else if (valuetxt == "addLeadStage") {
        this.updateTo = toName;
        let category_id = $(e.currentTarget).attr("data-slug");
        this.catObj = new categorySingleView({ slug: category_id, searchCategory: this, loadfrom: "customerSingleView", form_label: "Category" });
        $(e.currentTarget).val(this.model.get(""+toName));
        $(e.currentTarget).trigger('change');
        return;
      } else if (valuetxt == "addLeadPriority") {
        this.updateTo = toName;
        let category_id = $(e.currentTarget).attr("data-slug");
        this.catObj = new categorySingleView({ slug: category_id, searchCategory: this, loadfrom: "customerSingleView", form_label: "Category" });
        $(e.currentTarget).val(this.model.get(""+toName));
        $(e.currentTarget).trigger('change');
        return;
      }

      if (toName == "countryCodeNumber") {
        $(".countrySelect .filter-option-inner-inner").text(valuetxt);
      }
      newdetails["" + toName] = valuetxt;
      this.model.set(newdetails);
      if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
        this.model.set(toName, this.model.get(toName).join(","));
      }
    },

    refreshCat: function (lastID) {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'lead_stages,lead_source,lead_priority' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.model.set(""+selfobj.updateTo,lastID);
        console.log(selfobj.model);
        selfobj.updateTo = null;
        selfobj.render();
        selfobj.catObj.destroy();
      });
    },
    loadFile: function (e) {
      $('.uploadCustAtt').show();
      $('.dotborderCustAtt').hide();
    },
    hideUpload: function (e) {
      $(".uploadCustAtt").hide();
      $('.dotborderCustAtt').show();
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

    setCountry: function (e) {
      e.stopPropagation();
      let selfobj = this;
      var country_id = $(e.currentTarget).val();
      if (country_id) {
        this.model.set({ country_id: country_id });
        this.stateList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', country: country_id }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      }
    },

    setState: function (e) {
      e.stopPropagation();
      $('#city_id').val("");
      let selfobj = this;
      var state_id = $(e.currentTarget).val();
      if (state_id) {
        this.model.set({ state_id: state_id });
        this.cityList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', state: state_id }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();

          selfobj.render();
          // $(".profile-loader").hide();
        });
      }
    },

    copyMaillingAddress: function (e) {
      var selfobj = this;
      var address = $('#mailing_address').val();
      if (e.currentTarget.checked) {
        selfobj.model.set({ 'billing_address': address });
        selfobj.model.set({ 'billing_addressCheckbox': true });
        selfobj.render();
        console.log(selfobj.model);
        
      }
    },

    mailingAddress: function(e){
      var value = $(e.currentTarget).val();
      var billingAddress = $('#billing_address').val()
      if( value == billingAddress){
        $('#billing_addressCheckbox').removeAttr('disabled');
        $('#billing_addressCheckbox').prop('checked', true);
      }else{
        $('#billing_addressCheckbox').removeAttr('disabled');
        $('#billing_addressCheckbox').prop('checked', false);
      }
    },

    selectOnlyThis: function (e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("id");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
    },

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["record_type"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "customer_image": url });
    },

    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
      $('.customerMediaLoader').hide();
    },

    setValues: function (e) {
      setvalues = ["status", "record_type", "order"];
      var selfobj = this;
      $.each(setvalues, function (key, value) {
        var modval = selfobj.model.get(value);
        if (modval != null) {
          var modeVal = modval.split(",");
        } else { var modeVal = {}; }

        $(".item-container li." + value).each(function () {
          var currentval = $(this).attr("data-value");
          var selecterobj = $(this);
          $.each(modeVal, function (key, dbvalue) {
            if (dbvalue.trim().toLowerCase() == currentval.toLowerCase()) {
              $(selecterobj).addClass("active");
            }
          });
        });
      });

      if (selfobj.model.record_type === "individual") {
        // Set values for individual
        selfobj.model.set({
          "salutation": $("#salutation").val(),
          "first_name": $("#first_name").val(),
          "middle_name": $("#middle_name").val(),
          "last_name": $("# last_name").val(),
          "email": $("#email").val(),
          "mobile_no": $("# mobile_no").val(),
          "birth_date": $("#birth_date").val(),
          "customer_image": $("# customer_image").val(),
          "address": $("#address").val(),
        });
      } else if (selfobj.model.record_type === "company") {
        selfobj.model.set({
          "company_name": $("#company_name").val(),
          "billing_name": $("#billing_name").val(),
          "billing_address": $("#billing_address").val(),
          "branch_id": $("#branch_id").val(),
          "gst_no": $("#gst_no").val(),
          "email": $("#email").val(),
          "mobile_no": $("# mobile_no").val(),
          "adhar_number": $("#adhar_number").val(),
          "website": $("#website").val(),
          "country_code": $("#country_code").val(),
          "pan_number": $("#pan_number").val(),
        });
      }

      setTimeout(function () {
        if (e != undefined && e.type == "click") {
          var newsetval = [];
          var objectDetails = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          $(".item-container li." + classname[0]).each(function () {
            var isclass = $(this).hasClass("active");
            if (isclass) {
              var vv = $(this).attr("data-value");
              newsetval.push(vv);
            }
          });
          if (0 < newsetval.length) {
            var newsetvalue = newsetval.toString();
          }
          else { var newsetvalue = ""; }
          objectDetails["" + classname[0]] = newsetvalue;
          $("#valset__" + classname[0]).html(newsetvalue);
          selfobj.model.set(objectDetails);
          if (classname[0] == "record_type") {
            classname[0]
            selfobj.render();
          }
        }
      }, 50);
    },
    saveCustomerDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("customer_id");
      let isNew = $(e.currentTarget).attr("data-action");
      var stage = this.model.get("stages");
      let saveBtn = $(e.currentTarget);
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if (this.menuName == "customer") {
        this.model.set({ "type": "customer" });
      }
      if (this.loadFrom == "TaxInvoice") {
        this.model.set({ "type": "customer" });
      }
      this.model.set({ "company_id": DEFAULTCOMPANY });

      if ($("#customerDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        if (this.model.get("customer_id") == '' || this.model.get("customer_id") == null || this.model.get("customer_id") == undefined) {
          if ((this.model.get("mobile_no") == '' || this.model.get("mobile_no") == null || this.model.get("mobile_no") == undefined) && (this.model.get("email") == '' || this.model.get("email") == null || this.model.get("email") == undefined)) {
            alert("Mobile No.& Email Address Not Found. Please note that without a registered mobile no. & email address certain notifications and triggers cannot be activated.");
          } else if (this.model.get("mobile_no") == '' || this.model.get("mobile_no") == null || this.model.get("mobile_no") == undefined) {
            alert("Mobile No. Not Found. Please note that without a registered mobile no. certain notifications and triggers cannot be activated.");
          } else if (this.model.get("email") == '' || this.model.get("email") == null || this.model.get("email") == undefined) {
            alert("Email Address Not Found. Please note that without a registered email address, certain notifications and triggers cannot be activated.");
          }
        }
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.lastID != undefined) {
            selfobj.custID = res.lastID;
          }
          if (res.lastID != undefined) {
            selfobj.LastID = res.lastID;
          } else {
            selfobj.LastID = mid;
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          if (selfobj.loadFrom == "TaskSingleView") {
            let de = {"customer_id":res.lastID,"name":selfobj.model.get("name")}
            scanDetails.refreshview("customer",de);
          } else if (selfobj.loadFrom == "TaxInvoice") {
            scanDetails.refreshCust();
          } else if (selfobj.loadFrom == "AppointmentView") {
            scanDetails.render();
          } else if (selfobj.loadFrom == "ReceiptSingleView") {
            scanDetails.refreshCust();
          } else if (selfobj.loadFrom == "dashboard") {
            scanDetails.refreshDashboard(selfobj.custID);
          } else if(selfobj.loadFrom == "project"){
            scanDetails.refresh(selfobj.custID);
          } else {
            //scanDetails.filterSearch(false, stage);
            selfobj.scanDetails.isdataupdated=true;
            selfobj.scanDetails.updateData();
          }
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId });
              // selfobj.dynamicFieldRenderobj.prepareForm();
              let url = APIPATH + 'custUpload/' + selfobj.custID;
              selfobj.uploadFileEl.elements.parameters.action = url;
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
              // Dynamic field file upload
              var form_label = selfobj.form_label.replace(/ /g, '_');
              selfobj.uploadFileElArray.forEach(function (uploadFileEl, index) {
                var fieldID = $(uploadFileEl.elements).attr('id').split('_')[1];
                var fileTypes = [];
                var uploadedFileTypes = $(uploadFileEl.elements).attr('data-fileTypes');
                uploadedFileTypes.split(',').forEach(function (type) {
                  fileTypes.push(type.trim());
                });
                var noOfFiles = $(uploadFileEl.elements).attr('data-noOfFiles');
                let url1 = APIPATH + 'customUpload/?menuID=' + selfobj.menuId + '&recordID=' + selfobj.LastID + '&fieldID=' + fieldID + '&module=' + form_label + '&fileTypes=' + fileTypes + '&noOfFiles=' + noOfFiles;
                uploadFileEl.elements.parameters.action = url1;
                uploadFileEl.prepareUploads(uploadFileEl.elements);
              });

              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              selfobj.render();
            } else {
              let url = APIPATH + 'custUpload/' + selfobj.custID;
              selfobj.uploadFileEl.elements.parameters.action = url;
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
              // Dynamic field file upload
              var form_label = selfobj.form_label.replace(/ /g, '_');
              selfobj.uploadFileElArray.forEach(function (uploadFileEl, index) {
                var fieldID = $(uploadFileEl.elements).attr('id').split('_')[1];
                var fileTypes = [];
                var uploadedFileTypes = $(uploadFileEl.elements).attr('data-fileTypes');
                uploadedFileTypes.split(',').forEach(function (type) {
                  fileTypes.push(type.trim());
                });
                var noOfFiles = $(uploadFileEl.elements).attr('data-noOfFiles');
                let url1 = APIPATH + 'customUpload/?menuID=' + selfobj.menuId + '&recordID=' + selfobj.LastID + '&fieldID=' + fieldID + '&module=' + form_label + '&fileTypes=' + fileTypes + '&noOfFiles=' + noOfFiles;
                uploadFileEl.elements.parameters.action = url1;
                uploadFileEl.prepareUploads(uploadFileEl.elements);
              });
              handelClose(selfobj.toClose);
            }
          }
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        name: {
          required: true,
        },

        office_land_line: {
          number: true,
          maxlength: 15
        },

        company_name: {
          required: true,
        },

        gst_no: {
          minlength: 15,
          maxlength: 15,
        },

        email: {
          email: true,
        },

      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);

      }

      var messages = {
        name: "Please enter Name",
        gst_no: "Please enter valid number",
        office_land_line: "Please enter valid number",
        email: "Please Enter valid Email",
      };

      $("#pan_number").inputmask("Regex", { regex: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$" });
      $("#mobile_no").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
      $("#adhar_number").inputmask("Regex", { regex: "^[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}$" });
      $("#customerDetails").validate({
        rules: feildsrules,
        messages: messages,
      });

      $("#birth_date").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        startDate: "01-01-1900",
        endDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (selected) {
        $('#birth_date').change();
        $(".birth_date.form-line").addClass("focused");
        var valuetxt = $("#birth_date").val();
        selfobj.model.set({ birth_date: valuetxt });
      });
      var input = document.getElementById('address');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        console.log(place);
        if (place == "") {
          selfobj.model.set({ "address": input.value() });
        } else {
          selfobj.model.set({ "address": place.formatted_address });
          selfobj.model.set({ "latitude": place.geometry.location.lat() });
          selfobj.model.set({ "longitude": place.geometry.location.lng() });
          selfobj.model.set({ "address_url": place.url });
          // Initialize variables for city, state, and country
          let city = '';
          let state = '';
          let country = '';

          // Iterate through the address components to extract city, state, and country
          place.address_components.forEach(function (component) {
            // Check for country
            if (component.types.includes('country')) {
              country = component.long_name;
            }
            // Check for state (administrative_area_level_1)
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            // Check for city (locality)
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
          });

          // Set city, state, and country in the model
          selfobj.model.set({ "city": city });
          selfobj.model.set({ "state": state });
          selfobj.model.set({ "country": country });
          selfobj.render();
          console.log("google loc",selfobj.model);
        }
      });
      $(".ws-select").selectpicker('refresh');
      var slim = $('.slim').slim();
      // Listen for the Slim's onUpload event
      slim.on('slim.upload', function (e, data) {
        // Handle onUpload event here
        console.log('Image has been uploaded.');
        console.log('Uploaded data:', data); // Data contains information about the uploaded image
      });
    },
    // getassignee: function (e) {
    //   let selfobj = this;
    //   var parameters = { url: APIPATH + 'getAssigneeList/', setto: "assignee", search: $(e.currentTarget).val(), table: "admin", where: "name", list: "adminID, name, photo" };
    //   this.multiselectOptions.getlookupDropDown(parameters, function (res) {
    //     $(e.currentTarget).next(".dropdown-content").remove();
    //     $(e.currentTarget).after(res);
    //     setupLookup();
    //   }, selfobj);
    // },
    setAssignee: function (e) {
      let selfobj = this;
      var Name = $(e.currentTarget).text();
      var assigneeID = $(e.currentTarget).attr('data-record_id');
      var setto = $(e.currentTarget).attr('data-setto');
      var image = $(e.currentTarget).attr('data-image');
      $('.assignChange').val(Name);
      let objectDetails = [];
      objectDetails["" + setto] = assigneeID;
      selfobj.model.set(objectDetails);
      console.log(selfobj.model);
      var $photoElement = $('#assignee-photo');
      if (image) {
        $photoElement.attr('src', image).show();
      } else {
        $photoElement.hide();
      }
      $(e.currentTarget).closest(".dropdown-content").removeClass(".active");
    },

    setDefaultAssignee: function (){
      let selfobj = this;
      if (this.customerID == "" || this.customerID == null || this.customerID == undefined) {
        selfobj.model.set({ "assignee": selfobj.adminID });
        selfobj.model.set({ "assigneeName": selfobj.adminName });
        selfobj.model.set({ "assigneePhoto": PROFILEIMG });
      }
    },

    loadAttachment: function (e) {
      var selfobj = this;
      let fieldID = $(e.currentTarget).attr("id");
      $('.upload_' + fieldID).show();
      $('.dotborder_' + fieldID).hide();
      selfobj.setRealtimeUpload();
    },
    hideUploadMedia: function (e) {
      let fieldID = $(e.currentTarget).attr("id");
      $('.upload_' + fieldID).hide();
      $('.dotborder_' + fieldID).show();
    },
    deleteAttachments: function (e) {
      let selfobj = this;
      let file_id = $(e.currentTarget).attr("data-file_id");
      let record_id = selfobj.model.get("customer_id");
      let div = document.getElementById('removeIMG');
      let status = "delete";
      Swal.fire({
        title: "Delete Attachment ",
        text: "Do you want to delete Attachment ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          if (file_id != null) {
            $.ajax({
              url: APIPATH + 'customerModule/removeAttachment',
              method: 'POST',
              data: { fileID: file_id, status: status, customerID: record_id },
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
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                  $('#' + file_id + 'removeDiv').remove();
                  selfobj.model.set({ "attachment_file": "" });
                }

              }
            });
          } else {
            div.remove();
            selfobj.model.set({ "attachment_file": "" });
          }
        } else {

        }
      });

    },

    setRealtimeUpload: function () {
      var selfobj = this;
      $('body').find(".customUpload").each(function (index) {
        var uploadId = $(this).attr('id');
        var fileTypes = $(this).attr('data-fileTypes');

        var fileTypeArray = fileTypes.split(',').map(function (type) {
          return type.trim();
        });
        // var formattedFileTypes = fileTypeArray.map(function(type) {
        //   return "'" + type + "'";
        // });
        // var fileTypesArray = '[' + formattedFileTypes.join(', ') + ']';
        var fileTypesArray = fileTypeArray;

        var noOfFiles = $(this).attr('data-noOfFiles') ? $(this).attr('data-noOfFiles') : 0;

        // Initialize RealTimeUpload plugin for each element
        var uploadFileEl = $(this).RealTimeUpload({
          text: 'Drag and Drop or Select a File to Upload.',
          maxFiles: parseInt(noOfFiles),
          maxFileSize: 4194304,
          uploadButton: false,
          notification: true,
          autoUpload: false,
          extension: fileTypesArray,
          // extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf','docx', 'doc', 'xls', 'xlsx'],
          thumbnails: true,
          action: APIPATH + 'customUpload',
          element: uploadId, // Use a unique identifier for each element
          onSucess: function () {
            selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
            $('.modal-backdrop').hide();
          }
        });
        selfobj.uploadFileElArray.push(uploadFileEl);
      });
    },

    countryCodeExtension: function(){
      let selfobj = this;
      if (selfobj.model.attributes.countryCode != undefined && selfobj.model.attributes.countryCode != null && selfobj.model.attributes.countryCode != "") {
        $(".countrySelect").hide();
        $("#displayCountryCode").show();
      }
    },

    contryCodeShow: function(e){
      $(e.currentTarget).hide();
      $(".countrySelect").show();
    },
    getfreetext:function(e){
      let type = $(e.currentTarget).attr("id");
      console.log(type);
      switch (type) {
        case "assignee":
            this.getassignee(e);
          break;
      }
    },
    getassignee:function(e){
      var selfobj = this;
      let data = {"source":'admin',"check":'name',"list":'name,adminID,photo',"stat":false};
      this.appSettings.getFreeSearchList(e,data,function(e,res){
        $(e.currentTarget).closest(".form-group").css("position","relative");
        var dropdownContainer = $(e.currentTarget).closest(".form-group").find(".freeSerachList");
        dropdownContainer.empty();
        dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view="asignee" style="background-color: #5D60A6; color:#ffffff;" > Add New Assignee </div>');
        if (res.msg === "sucess"){
          if (res.data.length > 0){
            $.each(res.data, function (index,value){
              console.log(value);
              dropdownContainer.append('<div class="dropdown-item selectFreeRecord" data-update="assignee" data-record_id=' + value.adminID + '>' + value.name +'</div>');
              dropdownContainer.show();
            });
          }
        }else{
          selfobj.model.set("assignee",null);
        }
        $(e.currentTarget).closest(".form-group").css("position","unset");
      });
    },
    renderAttachments:function(){
      var selfobj= this;
      let docUrl = "";
      const attachment_file = this.model.get("attachment_file");
      const file_id = this.model.get("attachment_id");
      if (Array.isArray(attachment_file) && Array.isArray(file_id) && attachment_file.length === file_id.length) {
        for (let i = 0; i < attachment_file.length; i++) {
          const fName = attachment_file[i];
          const ftext = fName.split(".");
          let modifiedFName = fName;
          const file_ids = file_id[i];
          if (ftext[1] === "xls" || ftext[1] === "xlsx") {
            modifiedFName = "excel.png";
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + IMAGES + '/' + modifiedFName + "' alt=''><div class='buttonShow visableAttach'><span class='attachView'><a href='" + UPLOADS + "/customer/" + selfobj.customerID + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class='deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else if (ftext[1] === "pdf") {
            modifiedFName = "pdf.png";
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + IMAGES + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/customer/" + selfobj.customerID + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else if(ftext[1] === "word" || ftext[1] === "docx") {
            modifiedFName = "word.png";
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + IMAGES + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/customer/" + selfobj.customerID + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          }else{
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/customer/" + selfobj.customerID + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/customer/" + selfobj.customerID + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          }
        }
        selfobj.$(".taskAttachDoc").append(docUrl);

      }
      // const uploadedMedia = selfobj.model.get("uploadedMedia");

      // // Check if uploadedMedia is an array and has elements
      // if (Array.isArray(uploadedMedia) && uploadedMedia.length > 0) {
      //   // Iterate over each object in the uploadedMedia array
      //   uploadedMedia.forEach(item => {
      //     const attachment_file = item.attachFile; // Array of file names
      //     const attachment_fieldID = item.attachment_fieldID; // Array of field IDs
      //     const attachment_id = item.attachment_id; // Array of attachment IDs

      //     // Check if attachment_file, attachment_fieldID, and attachment_id are arrays and have the same length
      //     if (Array.isArray(attachment_file) && Array.isArray(attachment_fieldID) && Array.isArray(attachment_id) &&
      //       attachment_file.length === attachment_fieldID.length && attachment_file.length === attachment_id.length) {

      //       let docUrl = "";
      //       // Iterate over each file in the arrays
      //       for (let i = 0; i < attachment_file.length; i++) {
      //         const fName = attachment_file[i];
      //         const ftext = fName.split(".");
      //         let modifiedFName = fName;
      //         var imgPath;
      //         const file_ids = attachment_id[i];

      //         if (ftext[1] === "xls" || ftext[1] === "xlsx") {
      //           modifiedFName = "excel.png";
      //           imgPath = `${UPLOADS}${modifiedFName}`;
      //         } else if (ftext[1] === "pdf") {
      //           modifiedFName = "pdf.png";
      //           imgPath = `${UPLOADS}${modifiedFName}`;
      //         } else {
      //           imgPath = `${UPLOADS}${selfobj.form_label}/${selfobj.recordID}/${modifiedFName}`;
      //         }
      //         // Construct the HTML for each file
      //         docUrl += `<div id="${file_ids}removeDiv" class="attachedPic" data-show="singleFile">
      //                                   <div class="thumbnail">
      //                                       <div class="centered removeAttach">
      //                                           <img id="removeIMG" class="img-fluid fileImage img-thumbnail" src="${imgPath}" alt="">                
      //                                           <div class="buttonShow visableAttach">
      //                                               <span class="attachView">
      //                                                   <a href="${UPLOADS}${selfobj.form_label}/${selfobj.recordID}/${modifiedFName}" target="_blank">
      //                                                       <span class="material-icons">visibility</span>
      //                                                   </a>
      //                                               </span>
      //                                               <span class="deleteAttach deleteAttachments" data-file_id="${file_ids}">
      //                                                   <span class="material-icons">delete</span>
      //                                               </span>
      //                                           </div>
      //                                       </div>
      //                                   </div>
      //                               </div>`;
      //       }
      //       setTimeout(function () {
      //         // Append the generated HTML to the "attachedDocs" div
      //         selfobj.$(".attachedDocs_" + attachment_fieldID).empty();
      //         selfobj.$(".attachedDocs_" + attachment_fieldID).append(docUrl);
      //       }, 1000);
      //     } else {
      //       console.log("Attachment arrays have different lengths or are not arrays.");
      //     }
      //   });
      // } else {
      //   // console.log("uploadedMedia is not an array or it is empty.");
      // }
      
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = customertemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes, categoryList: this.categoryList.models, menuName: this.menuName, countryList: this.countryList.models, stateList: this.stateList.models, cityList: this.cityList.models, countryExtList: selfobj.countryExtList, gstStateList: this.gstStateList.models }));
      this.$el.addClass("tab-pane in active panel_overflow heading-top");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $("#" + this.toClose).show();
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.initializeValidate();
      this.setOldValues();
      // this.attachEvents();
      
      $('#clientProfilePic').slim({
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
        service: APIPATH + 'changeClientPic/' + this.customerID,
        download: false,
        willSave: function (data, ready) {
          //alert('saving!');
          ready(data);
        },

        didUpload: function (error, data, response) {
          var expDate = new Date();
          $(".overlap").css("display", "block");
          var newimage = $("#profilepic").find('img').attr("src");
          var fileName = response.newFileName
          $.cookie('photo', fileName);
          $.cookie('avtar', newimage, { path: COKI, expires: expDate });
          $("#myAccountRight").css("background-image", "url('" + newimage + "')");
        },
        willTransform: function (data, ready) {
          if ($("#profilepic").hasClass("pending")) {
            $(".overlap").css("display", "block");
          } else {
            var expDate = new Date();
            var newimage = $("#profilepic").find('img').attr("src");
            $.cookie('avtar', newimage, { path: COKI, expires: expDate });
            $("#myAccountRight").css("background-image", "url('" + newimage + "')");
          }
          ready(data);
        },
        willRemove: function (data, remove) {
          remove();
          var memberID = selfobj.customerID;
          console.log(selfobj.customerID);
          $.ajax({
            url: APIPATH + 'delClientPic/' + memberID,
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
          memberID: selfobj.customerID
        }
      });
      rearrageOverlays(selfobj.form_label, this.toClose);

      this.uploadFileEl = $("#custUpload").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: APIPATH + 'custUpload/',
        element: 'custUpload',
        onSucess: function () {
          selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
        }
      });

      this.renderAttachments();
      this.countryCodeExtension();
      this.delegateEvents();
      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });
  return customerSingleView;
});
