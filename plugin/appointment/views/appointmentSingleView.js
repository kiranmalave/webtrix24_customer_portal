define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'timepicker',
  'typeahead',
  'tagmanager',
  'moment',
  'Quill',
  'Swal',
  '../views/appointmentCustomView',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  "../../customer/collections/customerCollection",
  "../../projects/collections/projectsCollection",
  '../collections/appointmentCollection',
  '../models/singleappointmentModel',
  'text!../templates/appointmentSingle_temp.html',
  '../../customer/views/customerSingleView',
  '../../admin/views/addAdminView',
  "../../admin/collections/adminCollection",
], function ($, _, Backbone, validate, inputmask, datepickerBT, timepicker, typeahead, tagsManager, moment, Quill, Swal, appointmentCustomView, multiselectOptions, dynamicFieldRender, customerCollection, projectsCollection, appointmentCollection, singleappointmentModel, appointmenttemp, customerSingleView, addAdminView, adminCollection) {

  var appointmentSingleView = Backbone.View.extend({
    model: singleappointmentModel,
    enteredEmailsArray: [],
    newEmails: [],
    tempRes: [],
    initialize: function (options) {
      // console.log(options);
      this.dynamicData = null;
      this.toClose = "appointmentSingleView";
      this.tagID = null;
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "appointmentList";
      this.pluginId = options.pluginId;
      this.customerID = options.customer_id;
      this.customerName = options.customerName;
      this.customerEmail = options.cust_mail;
      this.model = new singleappointmentModel();
      this.loadFrom = options.loadFrom;
      this.notifCount = null;
      var selfobj = this;
      // this function is called to render the dynamic viewv
      this.dynamicFieldRenderobj = new dynamicFieldRender({
        ViewObj: selfobj,
        formJson: {},
      });
      this.enteredEmailsArray = [];
      this.multiselectOptions = new multiselectOptions();

      scanDetails = options.searchappointment;
      $(".popupLoader").show();

      this.projectList = new projectsCollection();
      this.projectList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y'}
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      this.appointmentList = new appointmentCollection();
      this.appointmentList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
      });
      this.adminList = new adminCollection();
      this.customerList = new customerCollection();
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      if (options.appointmentID != "") {
        this.model.set({ appointmentID: options.appointmentID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          var startDate = selfobj.model.get("start_date");
          var endDate = selfobj.model.get("end_date");
          var customEndDate = selfobj.model.get("end_on_date");
          var startTime = selfobj.model.get("start_time");
          var endTime = selfobj.model.get("end_time");
          if (endDate != null && endDate != "0000-00-00" || startDate != null && startDate != "0000-00-00" || customEndDate != null && customEndDate != "0000-00-00") {
            selfobj.model.set({ "end_date": moment(endDate).format("DD/MM/YYYY") });
            selfobj.model.set({ "start_date": moment(startDate).format("DD/MM/YYYY") });
            selfobj.model.set({ "end_on_date": moment(customEndDate).format("DD/MM/YYYY") });
            selfobj.render();
          } else {
            // Set current date as start and end date
            const currentDate = moment().format("DD/MM/YYYY");
            selfobj.model.set({ "end_date": currentDate });
            selfobj.model.set({ "start_date": currentDate });
            selfobj.model.set({ "end_on_date": currentDate });
            selfobj.render();
          }
          if (startTime != null && startTime != "00:00:00" || endTime != null && endTime != "00:00:00") {
            selfobj.model.set({ "start_time": moment(startTime, "HH:mm:ss").format("hh:mm a") });
            selfobj.model.set({ "end_time": moment(endTime, "HH:mm:ss").format("hh:mm a") });
          } else {
            const currentTime = moment().format("hh:mm a");
            selfobj.model.set({ "start_time": currentTime });
            const endTimeWithDelay = moment().add(30, 'minutes').format("hh:mm a");
            selfobj.model.set({ "end_time": endTimeWithDelay });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      }
      // let test = this.model.get(extra_notif);
      console.log(this.model.attributes);
      if (this.model.attributes.appointment_guest == null) {
        this.enteredEmailsArray = [];
      }

      if (this.loadFrom == 'customer') {
        selfobj.setCustomer();
        selfobj.render();
      }

      selfobj.model.set({ start_date: options.startDate });
    },
    events:
    {
      "click .saveAppointmentDetails": "saveAppointmentDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .loadCustom": "loadCustomModal",
      "change .allDay": "allDay",
      "change .guest_mail": "getGuestList",
      "click .selectGuest": "setGuest",
      "click .removeGuest": "removeGuest",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "input .custChange": "getcustomers",
      "click .selectCustomer": "setCustomer",
      "click .moreNotif": "extraNotif",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveAppointmentDetails', this.saveAppointmentDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveAppointmentDetails', this.saveAppointmentDetails.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.bDate', this.updateOtherDetails);
      this.$el.on('change', '.bDate', this.updateOtherDetails.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.loadCustom', this.loadCustomModal);
      this.$el.on('click', '.loadCustom', this.loadCustomModal.bind(this));
      this.$el.off('change', '.allDay', this.allDay);
      this.$el.on('change', '.allDay', this.allDay.bind(this));
      this.$el.off('input', '.guest_mail', this.getGuestList);
      this.$el.on('input', '.guest_mail', this.getGuestList.bind(this));
      this.$el.off('click', '.selectGuest', this.setGuest);
      this.$el.on('click', '.selectGuest', this.setGuest.bind(this));
      this.$el.off('click', '.removeGuest', this.removeGuest);
      this.$el.on('click', '.removeGuest', this.removeGuest.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('input', '.custChange', this.getcustomers);
      this.$el.on('input', '.custChange', this.getcustomers.bind(this));
      this.$el.off('click', '.selectCustomer', this.setCustomer);
      this.$el.on('click', '.selectCustomer', this.setCustomer.bind(this));
      this.$el.off('click', '.addNewRecord', this.addNew);
      this.$el.on('click', '.addNewRecord', this.addNew.bind(this));
      this.$el.off('click', '.moreNotif', this.extraNotif);
      this.$el.on('click', '.moreNotif', this.extraNotif.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    allDay: function (e) {
      var selfobj = this;
      $('.allDay input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          $(".ws-startTime").hide();
          $(".ws-EndTime").hide();
          selfobj.model.set({ 'all_day': "yes" });
        } else {
          $(".ws-startTime").show();
          $(".ws-EndTime").show();
          selfobj.model.set({ 'all_day': "no" });
        }
      });
    },
    extraNotif: function (e) {
      var action = $(e.currentTarget).attr('data-action');
      if (action == "add") {
        if (this.notifCount <= 4) {
          this.notifCount++;
          $('.appointNotif').show();
          $('.notif' + this.notifCount).show();
        }
      } else if (action == "remove") {
        var dataremoveID = $(e.currentTarget).attr('data-removeID');
        $('#' + dataremoveID).hide();
        this.notifCount--;
        if (this.notifCount == 0) {
          $('.appointNotif').hide();
        }
      }
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      if (toID == "does_repeat") {
        if (valuetxt == "custom") {
          $(".ws-customModal").show();
        } else {
          $(".ws-customModal").hide();
        }
      }
      if (valuetxt == "in_person_meet") {
        $(".ws-address").show();
        $(".ws-zoom").hide();
        $(".ws-google").hide();
        $("#google").val("");
        $("#zoom").val("");
      } else if (valuetxt == "google_meet") {
        $(".ws-address").hide();
        $(".ws-zoom").hide();
        $("#zoom").val("");
        $("#address").val("");
        $(".ws-google").show();
      } else if (valuetxt == "zoom_meet") {
        $("#address").val("");
        $("#google").val("");
        $(".ws-address").hide();
        $(".ws-zoom").show();
        $(".ws-google").hide();
      }
    },
    addNew: function (e) {
      var view = $(e.currentTarget).attr('data-view');
      switch (view) {
        case 'customer':
          new customerSingleView({ searchCustomer: this, loadfrom: "AppointmentView", form_label: 'Add Customer' });
          break;
        case 'admin':
          new addAdminView({ searchadmin: this, loadfrom: "AppointmentView", form_label: 'Add Guest' });
          break;

        default:
          break;
      }
    },
    updatemultiSelDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("name");
      var existingValues = this.model.get(toName);
      if (typeof existingValues !== 'string') {
        existingValues = '';
      }

      if ($(e.currentTarget).prop('checked')) {
        if (existingValues.indexOf(valuetxt) === -1) {
          existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
        }
      } else {
        existingValues = existingValues
          .split(',')
          .filter(value => value !== valuetxt)
          .join(',');
      }
      this.model.set({ [toName]: existingValues });
      // console.log("this.model", this.model);
    },
    getcustomers: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#customerDropdown");
      var table = "customer";
      var where = "name";
      var list = "customer_id, name, type, email";
      if (name != null) {
        $.ajax({
          url: APIPATH + 'getCustomerList/',
          method: 'POST',
          data: { text: name, tableName: table, wherec: where, list: list },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") {
              Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
            }
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.msg === "sucess" && res.data.length > 0) {
              $.each(res.data, function (index, value) {
                var firstLetterOfType = value.type.charAt(0);
                dropdownContainer.append('<div class="dropdown-item selectCustomer" style="background-color: #ffffff;" data-customerID=' + value.customer_id + ' data-customer_email=' + value.email + '>' + value.name + '(' + firstLetterOfType + ') </div>');
              });
              dropdownContainer.show();
            } else {
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "customer" style="background-color: #5D60A6; color:#ffffff;" > Add New Customer </div>');
              dropdownContainer.show();
            }
          }
        });
      }
    },
    setCustomer: function (e) {
      let selfobj = this;
      var newArr = [];
      if (selfobj.loadFrom == 'customer') {
        var Name = selfobj.customerName;
        var customerID = selfobj.customerID;
        var custEmail = selfobj.customerEmail;
        if (custEmail != "") {
          var email = [];
          selfobj.enteredEmailsArray.push({ email: custEmail });
          newArr.push({ email: custEmail });
          email.push(custEmail);
          selfobj.model.set({ "customerName": Name, "appointment_guest": email, "new_guest": newArr, "customer_ID": customerID });
        } else {
          selfobj.model.set({ "customerName": Name, "customer_ID": customerID });
        }
      } else {
        var Name = $(e.currentTarget).text();
        var customerID = $(e.currentTarget).attr('data-customerID');
        var custEmail = $(e.currentTarget).attr('data-customer_email');
        var htmlToAppend = '<span class="tm-tag">  <span>' + custEmail + '</span> <a data-to-remove = ' + custEmail + ' class="removeGuest"><i class="material-icons">close</i></a></span>';
        $(".tm-inputGuest").append(htmlToAppend);
        $('.custChange').val(Name);
        $("#customerDropdown").hide();
        selfobj.enteredEmailsArray.push({ email: custEmail });
        newArr.push({ email: custEmail });
        selfobj.model.set({ "appointment_guest": selfobj.enteredEmailsArray, "new_guest": newArr, "customer_ID": customerID });
      }

    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["all_day", "ends"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    loadCustomModal: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "customModal": {
          let appointmentID = $(e.currentTarget).attr("data-appointmentID");
          new appointmentCustomView({ appointmentID: appointmentID, model: this });
          break;
        }
      }
    },
    saveAppointmentDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      let date = new Date();
      var result = {};
      for (var i = 1; i <= 4; i++) {
        var rowKey = 'notif' + i;
        var rowSelector = '.notif' + i;

        var notificationType = $(rowSelector + ' select[name="notif"]').val();
        var time = $(rowSelector + ' input[name="time"]').val();
        var notifIn = $(rowSelector + ' select[name="time_format"]').val();

        result[rowKey] = {
          "notificationType": notificationType,
          "time": time,
          "notifIn": notifIn,
        };
      }
      var resultJson = JSON.stringify(result, null, 2);
      this.model.set({ extra_notif: resultJson });
      this.model.set({ "company_id": DEFAULTCOMPANY });
      var mid = this.model.get("appointmentID");
      let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#appointmentDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          scanDetails.filterSearch();
          scanDetails.refreshCalender();
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
            }
          }
        });
      }
    },

    getGuestList: function (e) {
      let selfobj = this;
      var email = $(e.currentTarget).val();
      var dropdownContainer = $("#guestDiv");
      if (email != "") {
        $.ajax({
          url: APIPATH + 'getSystemUsers/',
          method: 'POST',
          data: { text: email },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") {
              Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
            }
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.msg === "sucess" && res.data.length > 0) {
              result = [];
              $.each(res.data, function (index, value) {
                result.push(value.email);
                dropdownContainer.append('<div class="dropdown-item selectGuest" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
              });
              // selfobj.model.set({ 'appointment_guest': result });
              dropdownContainer.show();
            } else {
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "admin" style="background-color: #5D60A6; color:#ffffff;" > Add New Guest </div>');
              dropdownContainer.show();
            }
          }
        });

        $("#guest_mail").on("keyup", function (event) {
          // if (selfobj.model.get('appointment_guest') == null)
          //   selfobj.enteredEmailsArray = [];
          // else
          //   selfobj.enteredEmailsArray = selfobj.model.get('appointment_guest');
          var newArr = [];
          if (event.keyCode === 13) {

            var enteredEmail = $(this).val();

            if (enteredEmail) {
              if (validateEmail(enteredEmail)) {

                var item = { email: enteredEmail };
                var htmlToAppend = '<span class="tm-tag"><span>' + enteredEmail + '</span> <a data-to-remove = ' + enteredEmail + ' class="removeGuest"><i class="material-icons">close</i></a></span>';
                $(".tm-inputGuest").append(htmlToAppend);
                $("#guest_mail").val('');
                // console.log(enteredEmail);
                selfobj.enteredEmailsArray.push({ email: enteredEmail });
                newArr.push({ email: enteredEmail });
                selfobj.model.set({ "appointment_guest": selfobj.enteredEmailsArray });
                console.log("previous list", selfobj.enteredEmailsArray);
                console.log("new emial : ", newArr);
                selfobj.model.set({ "new_guest": newArr });
                $(this).val("");
              } else {
                alert("Please enter a valid email address.");
              }
            }
          }
        });
        function validateEmail(email) {
          var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return re.test(email);
        }

      } else {
        $("#guestDiv").hide();
      }
      // console.log(this.model.attributes);
    },

    setGuest: function (e) {
      let selfobj = this;
      if (selfobj.model.get('appointment_guest') == null) {
        selfobj.enteredEmailsArray = [];
      } else {
        selfobj.enteredEmailsArray = selfobj.model.get('appointment_guest');
      }
      var test = selfobj.model.get('appointment_guest');

      console.log("previous list", test);
      var email = $(e.currentTarget).text();
      // var adminID = $(e.currentTarget).attr('data-adminid');
      var htmlToAppend = '<span class="tm-tag alinecenter"> <span>' + email + '</span> <a data-to-remove = ' + email + ' class="removeGuest"><i class="material-icons">close</i></a></span>';
      $(".tm-inputGuest").append(htmlToAppend);
      $("#guest_mail").val('');
      $("#guestDiv").hide();
      selfobj.enteredEmailsArray.push({ email: email });
      selfobj.newEmails.push({ email: email });
      console.log("new email : ", selfobj.enteredEmailsArray);
      selfobj.model.set({ "appointment_guest": selfobj.enteredEmailsArray });
      selfobj.model.set({ "new_guest": selfobj.newEmails });

      let length = selfobj.enteredEmailsArray.length;
      // alert(length)
      if (length != 0) {
        $('.noGuestcontainer').hide();
        $('.showGuestDetails').show();
      }
    },

    removeGuest: function (e) {
      let selfobj = this;
      var emailSpan = $(e.currentTarget).attr('data-to-remove');
      console.log(selfobj.enteredEmailsArray);
      var status = "delete";
      var action = "changeStatus";
      $.ajax({
        url: APIPATH + 'appointmentMaster/removeGuest',
        method: 'POST',
        data: { list: emailSpan, action: action, status: status },
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
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            $(e.currentTarget).closest('.tm-tag').remove();

            selfobj.enteredEmailsArray = selfobj.enteredEmailsArray.filter(emails => emails.email !== emailSpan);
            selfobj.model.set({ "appointment_guest": selfobj.enteredEmailsArray });
            console.log(selfobj.enteredEmailsArray + " main Console");
            let length = selfobj.enteredEmailsArray.length;

            if (length == 0) {
              $('.noGuestcontainer').show();
              $('.showGuestDetails').hide();
            } else {
              $('.noGuestcontainer').hide();
              $('.showGuestDetails').show();
            }


            // selfobj.model.attributes.appointment_guest = selfobj.model.attributes.appointment_guest.filter(function (emails) {
            //   return emails !== emailSpan;
            // });
            // if (typeof (selfobj.model.attributes.new_guest) != undefined)
            //   selfobj.model.attributes.new_guest = selfobj.model.attributes.new_guest.filter(function (emails) {
            //     return emails !== emailSpan;
            //   });
          }
        }
      });
    },

    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        title: {
          required: true,
        },
        start_date: {
          required: true,
        },
        start_time: {
          required: true,

        },
        end_date: {
          required: true,

        },
        end_time: {
          required: true,

        },
        google: {
          required: true,
        },
        zoom: {
          required: true,
        },
        does_repeat: {
          required: true,
        },
        notif: {
          required: true,
        },
        time: {
          required: true,
        },
        time_format: {
          required: true,
        },
        address: {
          required: true,
        },
        description: {
          required: true,
        },
        typehead: {
          email: false,
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
        title: "Please enter Title",
        start_date: "Date Required",
        start_time: "Time Required",
        end_date: "Date Required",
        end_time: "Time Required",
        google: "Please Enter Google meet Link",
        zoom: "Please Enter Zoom Meeting Link",
        all_day: "Please enter All Day",
        notif: "Please enter Status",
        time: "Please enter Status",
        time_format: "Please enter Status",
        address: "Please enter a Location",
        description: "Please Enter Description",
        typehead: "Please Enter Guest's Email Id",
      };
      $("#appointmentDetails").validate({
        rules: feildsrules,
        messages: messages
      });
      $("#time").spinner({
        min: 1,
        change: function (event, ui) {
          console.log("change has occurred");
        },
      });

      $("#time1").spinner({
        min: 1,
        change: function (event, ui) {
          console.log("change has occurred");
        },
      });

      $("#time2").spinner({
        min: 1,
        change: function (event, ui) {
          console.log("change has occurred");
        },
      });
      $("#time3").spinner({
        min: 1,
        change: function (event, ui) {
          console.log("change has occurred");
        },
      });
      $("#time4").spinner({
        min: 1,
        change: function (event, ui) {
          console.log("change has occurred");
        },
      });
      var dateFormat = "mm/dd/yy";

      startDate = $('#start_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#start_date').change();
        var valuetxt = $("#start_date").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        var valuetxt = $("#end_date").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#end_date").val("");
        }
        selfobj.model.set({ "start_date": $('#start_date').val() });
      });
      endDate = $('#end_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#end_date').change();
        var valuetxt = $("#end_date").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        var valuetxt = $("#start_date").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#start_date").val("");
        }
        selfobj.model.set({ "end_date": $('#end_date').val() });
      });

      $('#start_time').timepicker({
        timeFormat: 'hh:mm a',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: function (e) {
          var st = $("#start_time").val();
          var et = $("#end_time").val(); // Corrected selector
          var tempsTime = moment(st, "HH:mm:ss").valueOf();
          var tempeTime = moment(et, "HH:mm:ss").valueOf();

          // if (tempsTime > tempeTime) {
          //   $("#end_time").val("");
          // }

          var t = moment(st, "hh:mm a").format("HH:mm:ss");
          selfobj.model.set({ "start_time": t });
          // console.log(selfobj.model);
        },
      });

      $('#end_time').timepicker({
        timeFormat: 'hh:mm a',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: function (e) {
          var st = $("#start_time").val();
          var et = $("#end_time").val();
          var tempsTime = moment(st, "HH:mm:ss").valueOf();
          var tempeTime = moment(et, "HH:mm:ss").valueOf();

          // if (tempsTime > tempeTime) {
          //   $("#start_time").val("");
          // }

          var t = moment(et, "hh:mm a").format("HH:mm:ss");
          console.log("time", t);
          selfobj.model.set({ "end_time": t });
          // console.log(selfobj.model);
        },
      });

      var input = document.getElementById('address');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function () {

        var place = autocomplete.getPlace();
        if (place == "") {

          selfobj.model.set({ "address": input.value() });
        } else {
          selfobj.model.set({ "address": place.formatted_address });
          selfobj.model.set({ "latitude": place.geometry['address'].lat() });
          selfobj.model.set({ "longitude": place.geometry['address'].lng() });
          selfobj.model.set({ "address_url": place.url });
        }
      });
    },
    render: function () {
      var selfobj = this;
      var source = appointmenttemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "projectList": this.projectList.models }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      // this.addGuest();
      this.setOldValues();
      this.attachEvents();
      $('select').selectpicker();
      rearrageOverlays("Appointment", this.toClose);
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

      this.enteredEmailsArray = []
      var guestToAdd = this.model.get("appointment_guest");
      if (guestToAdd != null) {
        for (let i = 0; i < guestToAdd.length; i++) {
          var email = guestToAdd[i];
          var htmlToAppend = '<span class="tm-tag"><span>' + email + '</span><a data-to-remove = ' + email + ' class="removeGuest"><i class="material-icons">close</i></a></span>';
          $(".tm-inputGuest").append(htmlToAppend);
          selfobj.enteredEmailsArray.push({ email: email });
        }
      }

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
      let length = selfobj.enteredEmailsArray.length;

      if (length == 0) {
        $('.noGuestcontainer').show();
        $('.showGuestDetails').hide();
      } else {
        $('.noGuestcontainer').hide();
        $('.showGuestDetails').show();
      }
      $(window).click(function () {
        $('.dropdown-content').hide();
      });
      return this;
    },
  });
  return appointmentSingleView;

});
