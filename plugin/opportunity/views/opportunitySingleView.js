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
  '../../category/views/categorySingleView',
  '../../admin/views/addAdminView',
  '../../core/views/appSettings',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  "../../category/collections/slugCollection",
  "../../customer/collections/customerCollection",
  '../models/opportunitySingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/opportunitySingle_temp.html',
  '../../customer/views/customerSingleView',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, Swal, RealTimeUpload, categorySingleView, addAdminView, appSettings, multiselectOptions, dynamicFieldRender, slugCollection, customerCollection, opportunitySingleModel, readFilesView, opportunitytemp, customerSingleView) {
  var opportunitySingleView = Backbone.View.extend({
    model: opportunitySingleModel,
    form_label: '',
    custID: '',
    initialize: function (options) {
      this.toClose = "opportunitySingleView";
      // this.pluginName = "opportunityList";
      this.uploadFileElArray = [];
      this.menuName = options.menuName;
      this.menuId = options.menuId;
      this.loadFrom = options.loadfrom;
      this.model = new opportunitySingleModel();
      console.log(this.model);
      this.adminID = ADMINID;
      this.adminName = ADMINNAME;
      var selfobj = this;
      selfobj.model.set({ menuId: options.menuId });
      this.form_label = options.form_label;
      this.appSettings = new appSettings();
      if (options.loadfrom == "dashboard") {
        this.appSettings = new appSettings();
        this.appSettings.getMenuList(this.menuId, function (plural_label, module_desc, form_label, result) {
          selfobj.plural_label = plural_label;
          selfobj.module_desc = module_desc;
          selfobj.form_label = form_label;
          readyState = true;
        });
      }
      this.multiselectOptions = new multiselectOptions();
      $(".modelbox").hide();
      scanDetails = options.searchopportunity;
      $(".popupLoader").show();
      $(".profile-loader").show();
      selfobj.setDefaultAssignee();
      $("#state_id").attr("disabled", true);
      $("#city_id").prop("disabled", true);
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'opportunity_source,opportunity_stages,opportunity_type' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
        // $(".profile-loader").hide();
      });

      this.customerList = new customerCollection();
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.LastID = '';
      this.opportunityID = options.opportunity_id;
      this.recordID = options.opportunity_id;
      if (options.opportunity_id != "" && options.opportunity_id != undefined) {
        this.model.set({ opportunity_id: options.opportunity_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, data: { menuId: selfobj.model.get("menuId") }, error: selfobj.onErrorHandler
        }).done(function (res) {
          var birthDate = selfobj.model.get("birth_date");
          var country_id = selfobj.model.get("country_id");
          var state_id = selfobj.model.get("state_id");
          if (birthDate != null && birthDate != "0000-00-00") {
            selfobj.model.set({ "birth_date": moment(birthDate).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          $(".popupLoader").hide();
          // selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
          selfobj.render();
          selfobj.setOldValues();
        });
      }
    },
    events: {
      "click .saveopportunityDetails": "saveopportunityDetails",
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
      "click .deleteAttachments": "deleteAttachments",
      "input .custChange": "getcustomers",
      "click .selectCustomer": "setCustomer",
      "input .ws-freetxt": "getfreetext",
      "focus .ws-freetxt": "getfreetext",
      "click .selectFreeRecord": "updateDataFreeTxt",
      "click .addNewRecord": "addNew",
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },

    addNew: function (e) {
      var view = $(e.currentTarget).attr('data-view');
      console.log("in addnew");     
      switch (view) {
        case 'customers':
          new customerSingleView({ parentObj: this, loadfrom: "opportunitySingleView", form_label: 'Add Customer' });
          //handelClose(selfobj.toClose);
          break;
        case 'asignee':
          new addAdminView({ searchadmin: this, loadfrom: "opportunitySingleView", form_label: 'Add Assignee' });
          break;
        default:
          break;
      }
    },

    getfreetext:function(e){
      let type = $(e.currentTarget).attr("id");
      console.log("in getfreetext");
      
      console.log(type);
      switch (type) {
        case "customer_id":
            this.getcustomers(e);
          break;
        case "assignee":
            this.getassignee(e);    
          break;
        default:
          break;
      }
    },
    updateDataFreeTxt:function(e){
      e.stopPropagation();
      let selfobj = this;
      console.log("in updateDatafreetxt");
      
      let toID = $(e.currentTarget).attr("data-update");
      let record_id = $(e.currentTarget).attr("data-record_id");
      let newdetails = [];
      newdetails["" + toID] = record_id;
      this.model.set(newdetails);
      $(e.currentTarget).closest(".form-group").find("input").val($(e.currentTarget).text());
      $(".freeSerachList").hide();
    },

    updateOtherDetails: function (e) {
      e.stopPropagation();
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      var newdetails = [];
      if (valuetxt == "addLeadSource") {
        new categorySingleView({ searchCategory: this, loadfrom: "opportunitySingleView", form_label: "Category" });
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

    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'lead_stages,lead_source' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
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
      this.model.set({ "opportunity_image": url });
    },

    getcustomers:function(e){
      var selfobj = this;
      let data = {"source":'customer',"check":'name',"list":'name,customer_id,type',"stat":false};
      this.appSettings.getFreeSearchList(e,data,function(e,res){
        $(e.currentTarget).closest(".form-group").css("position","relative");
        var dropdownContainer = $(e.currentTarget).closest(".form-group").find(".freeSerachList");
        dropdownContainer.empty();
        dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view="customers"> Add New Customer </div>');
        if (res.msg === "sucess"){
          if (res.data.length > 0){
            $.each(res.data, function (index, value){
              dropdownContainer.append('<div class="dropdown-item selectFreeRecord" data-update="customer_id" data-record_id=' + value.customer_id + '>' + value.name +'(' + value.type.charAt(0) + ')'+'</div>');
              dropdownContainer.show();
            });
          }
        }else{
          selfobj.model.set("customer_id",null);
        }
        $(e.currentTarget).closest(".form-group").css("position","unset");
      });
    },

    setCustomer: function (e) {
      // e.preventDefault();
      let selfobj = this;
      if (selfobj.loadFrom == 'customer') {
        var Name = selfobj.customerName;
        var customerID = selfobj.customerID;
        selfobj.model.set({ "customerName": Name });
        selfobj.model.set({ "customer_id": customerID });
      } else {
        var Name = $(e.currentTarget).text();
        var customerID = $(e.currentTarget).attr('data-customerID');
        selfobj.model.set({ "customer_id": customerID });
        $("#customerDropdown").hide();
      }
      $('#customer_id').val(Name);
    },

    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
      $('.opportunityMediaLoader').hide();
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
          "opportunity_image": $("# opportunity_image").val(),
          "address": $("# address").val(),
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

    saveopportunityDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("opportunity_id");
      let isNew = $(e.currentTarget).attr("data-action");
      var stage = this.model.get("stages");
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }

      this.model.set({ "company_id": DEFAULTCOMPANY });

      if ($("#opportunityDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
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
            scanDetails.refreshCust();
          } else if (selfobj.loadFrom == "TaxInvoice") {
            scanDetails.refreshCust();
          } else if (selfobj.loadFrom == "AppointmentView") {
            scanDetails.render();
          } else if (selfobj.loadFrom == "ReceiptSingleView") {
            scanDetails.refreshCust();
          } else if (selfobj.loadFrom == "dashboard") {
            scanDetails.refreshDashboard(selfobj.custID);
          } else {
            scanDetails.filterSearch(false, stage);
          }
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId });
              // selfobj.dynamicFieldRenderobj.prepareForm();
              let url = APIPATH + 'opportunityUpload/' + selfobj.custID;
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
              let url = APIPATH + 'opportunityUpload/' + selfobj.custID;
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
          minlength: 10,
          maxlength: 10
        },

        pan_number: {
          minlength: 10,
          maxlength: 10,
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
        pan_number: "Please Enter valid PAN",
      };

      $.validator.addMethod("panPattern", function (value, element) {
        // Define the PAN card pattern
        var panPattern = /[a-zA-z]{5}\d{4}[a-zA-Z]{1}/;
        // Test the value against the pattern
        return this.optional(element) || panPattern.test(value);
      }, "Invalid PAN Number format");

      $("#mobile_no").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
      $("#adhar_number").inputmask("Regex", { regex: "^[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}$" });
      $("#opportunityDetails").validate({
        rules: feildsrules,
        messages: messages,
      });

      $("#opportunity_end").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        endDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (selected) {
        var valuetxt = $("#opportunity_end").val();
        selfobj.model.set({ opportunity_end: valuetxt });
      });

      $("#opportunity_start_date").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        endDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (selected) {
        var valuetxt = $("#opportunity_start_date").val();
        selfobj.model.set({ opportunity_start_date: valuetxt });
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
          selfobj.model.set({ "latitude": place.geometry['address'].lat() });
          selfobj.model.set({ "longitude": place.geometry['address'].lng() });
          selfobj.model.set({ "address_url": place.url });
        }
      });
      $(".ws-select").selectpicker('refresh');
    },

    getassignee:function(e){
      var selfobj = this;
      console.log("in getassignee");     
      let data = {"source":'admin',"check":'name',"list":'name,adminID',"stat":false};
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
    setDefaultAssignee: function (e) {
      let selfobj = this;
      let custID = selfobj.model.get('opportunity_id');
      if (custID == "" || custID == null || custID == undefined) {
        var Name = selfobj.adminName;
        var adminID = selfobj.adminID;
        selfobj.model.set({ "assignee": adminID, "assigneeName": Name });
      }
    },
    setAssignee: function (e) {
      let selfobj = this;
      var Name = $(e.currentTarget).text();
      var assigneeID = $(e.currentTarget).attr('data-record_id');
      var setto = $(e.currentTarget).attr('data-setto');
      $('.assignChange').val(Name);
      let objectDetails = [];
      objectDetails["" + setto] = assigneeID;
      selfobj.model.set(objectDetails);
      $(e.currentTarget).closest(".dropdown-content").removeClass(".active");
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
      let record_id = selfobj.model.get("opportunity_id");
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
              url: APIPATH + 'customModule/removeAttachment',
              method: 'POST',
              data: { fileID: file_id, status: status, recordID: record_id },
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

    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = opportunitytemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes, categoryList: this.categoryList.models, menuName: this.menuName, countryExtList: selfobj.countryExtList }));
      this.$el.addClass("tab-pane in active panel_overflow heading-top");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".tab-content").append(this.$el);
      $("#" + this.toClose).show();
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.initializeValidate();
      this.setOldValues();
      // this.attachEvents();
      var country_id = selfobj.model.get("country_id");
      var state_id = selfobj.model.get("state_id");
      if (country_id != 0 && country_id != null && country_id != "") {
        $('#state_id').removeAttr("disabled");
        $('.stateChange').find('.btn.dropdown-toggle').removeClass("disabled");
      }
      if (state_id != 0 && state_id != null && state_id != "") {
        $('#city_id').removeAttr("disabled");
        $('.cityChange').find('.btn.dropdown-toggle').removeClass("disabled");
      }

      if (selfobj.model.attributes.countryCode != undefined && selfobj.model.attributes.countryCode != null && selfobj.model.attributes.countryCode != "") {
        $(".countrySelect .filter-option-inner-inner").text(selfobj.model.attributes.countryCode);
      }

      rearrageOverlays(selfobj.form_label, this.toClose);

      this.uploadFileEl = $("#opportunityUpload").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: APIPATH + 'opportunityUpload/',
        element: 'opportunityUpload',
        onSucess: function () {
          selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
        }
      });

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
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''><div class='buttonShow visableAttach'><span class='attachView'><a href='" + UPLOADS + "/opportunity/" + selfobj.opportunityID + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class='deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else if (ftext[1] === "pdf") {
            modifiedFName = "pdf.png";
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/opportunity/" + selfobj.opportunityID + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else {
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/opportunity/" + selfobj.opportunityID + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/opportunity/" + selfobj.opportunityID + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          }
        }
        document.getElementById("attachedDoc").innerHTML += docUrl;

      }

      const uploadedMedia = selfobj.model.get("uploadedMedia");

      // Check if uploadedMedia is an array and has elements
      if (Array.isArray(uploadedMedia) && uploadedMedia.length > 0) {
        // Iterate over each object in the uploadedMedia array
        uploadedMedia.forEach(item => {
          const attachment_file = item.attachFile; // Array of file names
          const attachment_fieldID = item.attachment_fieldID; // Array of field IDs
          const attachment_id = item.attachment_id; // Array of attachment IDs

          // Check if attachment_file, attachment_fieldID, and attachment_id are arrays and have the same length
          if (Array.isArray(attachment_file) && Array.isArray(attachment_fieldID) && Array.isArray(attachment_id) &&
            attachment_file.length === attachment_fieldID.length && attachment_file.length === attachment_id.length) {

            let docUrl = "";
            // Iterate over each file in the arrays
            for (let i = 0; i < attachment_file.length; i++) {
              const fName = attachment_file[i];
              const ftext = fName.split(".");
              let modifiedFName = fName;
              var imgPath;
              const file_ids = attachment_id[i];

              if (ftext[1] === "xls" || ftext[1] === "xlsx") {
                modifiedFName = "excel.png";
                imgPath = `${UPLOADS}${modifiedFName}`;
              } else if (ftext[1] === "pdf") {
                modifiedFName = "pdf.png";
                imgPath = `${UPLOADS}${modifiedFName}`;
              } else {
                imgPath = `${UPLOADS}${selfobj.form_label}/${selfobj.recordID}/${modifiedFName}`;
              }
              // Construct the HTML for each file
              docUrl += `<div id="${file_ids}removeDiv" class="attachedPic" data-show="singleFile">
                                        <div class="thumbnail">
                                            <div class="centered removeAttach">
                                                <img id="removeIMG" class="img-fluid fileImage img-thumbnail" src="${imgPath}" alt="">                
                                                <div class="buttonShow visableAttach">
                                                    <span class="attachView">
                                                        <a href="${UPLOADS}${selfobj.form_label}/${selfobj.recordID}/${modifiedFName}" target="_blank">
                                                            <span class="material-icons">visibility</span>
                                                        </a>
                                                    </span>
                                                    <span class="deleteAttach deleteAttachments" data-file_id="${file_ids}">
                                                        <span class="material-icons">delete</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
            }
            setTimeout(function () {
              // Append the generated HTML to the "attachedDocs" div
              $('body').find(".attachedDocs_" + attachment_fieldID).empty();
              $('body').find(".attachedDocs_" + attachment_fieldID).append(docUrl);
            }, 1000);
          } else {
            console.log("Attachment arrays have different lengths or are not arrays.");
          }
        });
      } else {
        console.log("uploadedMedia is not an array or it is empty.");
      }

      this.delegateEvents();
      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return opportunitySingleView;
});
