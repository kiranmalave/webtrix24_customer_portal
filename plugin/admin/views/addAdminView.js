define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  "datepickerBT",
  'moment',
  'Swal',
  'locationpicker',
  '../../core/views/multiselectOptions',
  '../models/adminSingleModel',
  '../../dynamicForm/views/dynamicFieldRender',
  '../../core/views/countryExtList',
  'text!../templates/addAdmin_temp.html',
  '../../userRole/collections/userRoleCollection',
  '../../userRole/views/userRoleSingleView',
  '../../companyMaster/collections/companyCollection',
], function ($, _, Backbone, validate, datepickerBT, moment, Swal, locationpicker, multiselectOptions, adminModel, dynamicFieldRender, countryExtList, addAdminTemp, userRoleCollection,userRoleSingleView,companyCollection) {

  var addAdminView = Backbone.View.extend({
    form_label:'',
    options : '',
    permissionUserRole:null,
    initialize: function (options) {
      var selfobj = this;
      this.form_label = options.form_label;
      this.menuId = options.menuId;
      this.options = options;
      this.toClose = "addAdminView";
      this.permissionUserRole = ROLE['roleList'];
      this.loadFrom = options.loadfrom;
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchadmin;
      $(".popupLoader").show();
      this.model = new adminModel();
      this.model.set({ menuId: options.menuId });
      this.countryListView = new countryExtList();
      this.countryExtList = this.countryListView.countryExtList;
      this.companyCollection = new companyCollection();
      this.userRoleList = new userRoleCollection();
      this.fetchUserRoleList(); 

      this.companyCollection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'POST', data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      if (options.adminID != "" && options.adminID != undefined) {
        this.model.set({ adminID: options.adminID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          },data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          var dob = selfobj.model.get("dateOfBirth");
          if (dob != null && dob != "0000-00-00") {
            selfobj.model.set({ "dateOfBirth": moment(dob).format("DD-MM-YYYY") });
          }else{
           
            // selfobj.model.set({'dateOfBirth' : currentdate});
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.render();
          selfobj.setOldValues();
          $('#email').removeClass("updateUserName");
        });
      }

    },
    events:
    {
      "click .saveEduDetails": "saveEduDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "blur .updateUserName": "updateUserName",
      "change .dropval": "updateOtherDetails",
      "change .roleChange": "changeRole",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
    },
    fetchUserRoleList : function(){
      var selfobj = this;
      selfobj.userRoleList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        // selfobj.model.set("userRoleList", res.data);
        selfobj.render();
      });
    },
    attachEvents: function () {
      this.$el.off('click', '.saveEduDetails', this.saveEduDetails);
      this.$el.on('click', '.saveEduDetails', this.saveEduDetails.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.updateUserName', this.updateUserName);
      this.$el.on('blur', '.updateUserName', this.updateUserName.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('change', '.roleChange', this.changeRole);
      this.$el.on('change', '.roleChange', this.changeRole.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
      this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toName] = valuetxt;
      this.model.set(newdetails);
      if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
        this.model.set(toName, this.model.get(toName).join(","));
      }
      if (toName == "whatsappCountryCodeNumber"){
        $(".whatsappCountrySelect .filter-option-inner-inner").text(valuetxt);
      }
      if (toName == "country_code"){
        $(".countrySelect .filter-option-inner-inner").text(valuetxt);
      }
      if (toName == "roleID" && valuetxt == "addUserRole") {
        if (this.permissionUserRole.add != "yes") {
          Swal.fire("You don't have permission to add", '', 'error');
          return false;
        }else{
          new userRoleSingleView({searchuserRole: this,form_label:'User Role Management',load_from:'addAdminView'});
        }
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

    setCountryCode: function () {
      var value = this.model.get('country_code');
      $(".countrySelect .filter-option-inner-inner").text(value);
      var whatsAppCountry = this.model.get('whatsappCountryCodeNumber');
      $(".whatsappCountrySelect .filter-option-inner-inner").text(whatsAppCountry);
    },

    selectOnlyThis: function(e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("id");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
    },
    updateUserName: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var emailarray = valuetxt.split("@");
      this.model.set({ userName: emailarray[0] });
      selfobj.render();
    },
    changeRole: function (e) {
      let selfobj = this;
      var adminID = this.model.get("adminID");
      var oldValue = this.model.get("roleID");
      var newValue = $(e.currentTarget).val();
      if (adminID != undefined) {
        if (oldValue == 1) {
          if (newValue != 1) {
            alert("You Cannot Change Admin Role");
            $(e.currentTarget).val(oldValue);
          }
        } else {
          selfobj.model.set({ roleID: newValue });
        }
      } else {
        selfobj.model.set({ roleID: newValue });
      }
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status","is_approver"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    saveEduDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var aid = this.model.get("adminID");
      let isNew = $(e.currentTarget).attr("data-action");
      if (aid == "" || aid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#adminDetails").valid()) {
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
          switch (selfobj.loadFrom) {
            case "TaskSingleView":{
              let de = {"last_id":res.data.last_id,"name":selfobj.model.get("name")};
              scanDetails.refreshview('assignee',de);
              break;
            }
            case "AppointmentView":{
              let de = {"last_id":res.data.last_id,"name":selfobj.model.get("name")};
              scanDetails.render('assignee',de);
              break;
            }
            case "ReceiptSingleView":{
              let de = {"last_id":res.data.last_id,"name":selfobj.model.get("name")};
              scanDetails.refreshview('assignee',de);
              break;
            }
            case "escalationView":{
              let de = {"last_id":res.data.last_id,"name":selfobj.model.get("name")};
              scanDetails.refreshview('assignee',de);
              break;
            }
            default:{
              scanDetails.filterSearch();
            }
              break;
          }
          // if (selfobj.loadFrom == "TaskSingleView") {
          //   let de = {"last_id":res.data.last_id,"name":selfobj.model.get("name")};
          //   scanDetails.refreshview('assignee',de);
          // }else if (selfobj.loadFrom == "AppointmentView") {
          //   scanDetails.render();
          // }else if (selfobj.loadFrom == "ReceiptSingleView") {
          //   scanDetails.refreshAdmin();
          // }else if (selfobj.loadFrom == "escalationView") {
          //   scanDetails.refreshAdmin();
          // } 
          // else{
          //   scanDetails.filterSearch();
          // }

          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.options.menuId });
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
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
        name: {
          required: true,
        },
        userName: {
          required: true,
        },
        email: {
          required: true,
          email: true,
        },
        password: {
          required: true,
        },
        roleID: {
          required: true,
        },
        whatsappNo: {
          minlength: 10,
          maxlength: 10
        },
        contactNo: {
          required: true,
          minlength: 10,
          maxlength: 10
        }
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {

        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        // ...feilds,
        // ...dynamicRules
        // };
      }
      var messages = {
        name: "Please enter name",
        userName: "Please enter username",
        email: "Please enter valid email-id ",
        password: "Please enter password",
        roleID: "Please select user role",
        whatsappNo: "Please enter valid number",
        contactNo: "Please enter valid number"
      };
      $('#contactNo,#whatsappNo,#myTarget').inputmask('Regex', { regex: "^[0-9](\\d{1,9})?$" });
      $("#adminDetails").validate({
        rules: feildsrules,
        messages: messages
      });
      startDate = $('#dateOfBirth').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        endDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#dateOfBirth').change();
        var valuetxt = $("#dateOfBirth").val();
        selfobj.model.set({ "dateOfBirth": valuetxt });
      });

      var input = document.getElementById('google_location');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (place == "") {
          selfobj.model.set({ "google_location": input.value() });
        } else {
          selfobj.model.set({ "google_location": place.formatted_address });
          selfobj.model.set({ "latitude": place.geometry['location'].lat() });
          selfobj.model.set({ "longitude": place.geometry['location'].lng() });
          selfobj.model.set({ "address_url": place.url });
          selfobj.initializeMap();
        }
      });
    },

    initializeMap : function(){
      var selfobj = this;
      let lat = selfobj.model.attributes.latitude;
      let long = selfobj.model.attributes.longitude
      if ( lat != null && long != null){
        $('#memberLocation').locationpicker({
          location: {
              latitude: lat, 
              longitude: long,
          },
          radius:0,
          inputBinding: {
            locationNameInput: $('#google_location'),
          },
          enableAutocomplete: true,
          markerIcon: 'images/map-marker-2-xl.png',
          markerDraggable: true,
          markerInCenter: true,
          markerVisible : true,
           onchanged: function (currentLocation, radius, isMarkerDropped) {
              var addressComponents = $(this).locationpicker('map').location.addressComponents;
              selfobj.model.set({latitude:$(this).locationpicker('map').location.latitude});
              selfobj.model.set({longitude:$(this).locationpicker('map').location.longitude});
              selfobj.model.set({city:addressComponents.city});
              selfobj.model.set({state:addressComponents.stateOrProvince});
              selfobj.model.set({country:addressComponents.country});
              selfobj.model.set({cityShort:addressComponents.cityShort});
              selfobj.model.set({stateShort:addressComponents.stateOrProvinceShort});
              selfobj.model.set({countryShort:addressComponents.countryShort});
              selfobj.model.set({pincode:addressComponents.streetNumber});
          }
        });
      } 
    },


    render: function () {
      var selfobj = this;
      var source = addAdminTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "userRoleList": this.userRoleList.models,"companyCollection" : selfobj.companyCollection.models, countryExtList: selfobj.countryExtList  }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $(".ws-select").selectpicker();
      $('#' + this.toClose).show();
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      $('#profilepic').slim({
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
        service: APIPATH + 'changeProfilePic/' + selfobj.model.get('adminID'),
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
          var memberID = selfobj.model.get('adminID');
          $.ajax({
            url: APIPATH + 'delProfilePic/' + memberID,
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F") {
                Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
              }

              if (res.statusCode == 994) { app_router.navigate("bareback-logout", { trigger: true }); }
            }
          });
          remove();
        },
        label: 'Click here to add new image or Drop your image here.',
        buttonConfirmLabel: 'Ok',
        meta: {
          memberID: selfobj.model.get('adminID')
        }
      });
      this.initializeValidate();
      this.initializeMap();
      this.setCountryCode();
      var dob = selfobj.model.get("dateOfBirth");
      if (dob == null || dob == "0000-00-00") {
        $('#dateOfBirth').val('');
      }
      this.setOldValues();
      this.attachEvents();
      rearrageOverlays(selfobj.form_label, this.toClose);
      return this;

    }, onDelete: function () {
      this.remove();
    }
  });

  return addAdminView;

});
