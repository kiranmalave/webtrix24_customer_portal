define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  'Quill',
  'Swal',
  '../views/avablitySingleView',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../../readFiles/views/readFilesView',
  '../collections/scheduleListCollection',
  '../collections/eventCollection',
  '../models/eventSingleModel',
  'text!../templates/eventSingletemp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, Quill, Swal, avablitySingleView, multiselectOptions, dynamicFieldRender, readFilesView, scheduleListCollection, eventCollection, eventSingleModel, eventTemp) {

  var eventSingleView = Backbone.View.extend({
    model: eventSingleModel,
    scheduleList: null,
    result: null,
    startDate: null,
    endDate: null,
    form_label:'',
    initialize: function (options) {
      var selfobj = this;
      this.toClose = "eventSingleView";
      this.form_label = options.form_label;
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "eventList";
      this.menuId = options.menuId;
      this.model = new eventSingleModel();
      this.model.set({ menuId: options.menuId });
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchevent;
      $(".popupLoader").show();
      this.scheduleList = new scheduleListCollection();
      selfobj.render();
      this.getScheduleList();

      this.eventList = new eventCollection();
      this.eventList.fetch({
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
        selfobj.model.set("eventList", res.data);
        selfobj.render();
      });

      if (options.event_id != "") {
        this.model.set({ event_id: options.event_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          },  data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          var startDate = selfobj.model.get("start_date");
          var endDate = selfobj.model.get("end_date");
          if (endDate != null && endDate != "0000-00-00" || startDate != null && startDate != "0000-00-00") {
            selfobj.model.set({ "end_date": moment(endDate).format("DD-MM-YYYY") });
            selfobj.model.set({ "start_date": moment(startDate).format("DD-MM-YYYY") });
            selfobj.render();
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          $('body').find(".loder").hide();
          selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.render();
        });
      }
      //this.listenTo(this.model, 'sync',this.render);
      //this.listenTo(this.eventList, 'sync', this.render);
    },
    getScheduleList: function () {
      var selfobj = this;
      this.scheduleList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("scheduleList", res.data);
        selfobj.render();
      });
    },
    events:
    {
      "click .saveeventDetails": "saveeventDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
      "click .loadview": "loadSingleView",
      "change .paid": "paid",
      "click .loadMedia": "loadMedia",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
    },  
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    paid: function (e) {
      var selfobj = this;
      $('.paid input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          $(".ws-amount").hide();
          $(".ws-discount").hide();
          selfobj.model.set({ 'price_type': "unpaid" });
        } else {
          $(".ws-amount").show();
          $(".ws-discount").show();
          selfobj.model.set({ 'price_type': "paid" });
        }
      });
    },
    updateOtherDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      if (valuetxt == "in_person_meet") {
        $(".ws-location").show();
        $(".ws-webinar").hide();
        selfobj.model.set({ 'meeting_option': "in_person_meet" });
      } else if (valuetxt == "webinar") {
        $(".ws-location").hide();
        $(".ws-webinar").show();
        selfobj.model.set({ 'meeting_option': "webinar" });
      }

      if (this.model.get(toID) && Array.isArray(this.model.get(toID))) {
        this.model.set(toID, this.model.get(toID).join(","));
      }
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

    selectOnlyThis: function(e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("name");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
    },

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["event_type", "appointment_schedule"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      if (da.event_type == "appointment") {
        $(".ws-person-details").hide();
        $(".ws-schedule-details").show();
      } else if (da.event_type == "site_event") {
        $(".ws-person-details").show();
        $(".ws-schedule-details").hide();
      }
    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "event_image": url });
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
    },

    loadSingleView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "singleeventData": {
          var event_id = $(e.currentTarget).attr("data-event_id");
          new eventSingleView({ event_id: event_id, searchevent: this });
          break;
        }
        case "singleavablityData": {
          var eventID = $(e.currentTarget).attr("data-eventID");
          new avablitySingleView({ eventID: eventID, searchavablity: this, loadFrom: selfobj.model.get("event_type") });
          break;
        }
      }
    },

    saveeventDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("event_id");
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
      if ($("#eventDetails").valid()) {
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
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: options.menuId });
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
        title: {
          required: true,
        },
        location: {
          required: true,
        },
        webinar_link: {
          required: true,
        },
        start_date: {
          required: true,
        },
        end_date: {
          required: true,
        },
        contact_person_name: {
          required: true,
        },
        contact_person_phone: {
          minlength: 10,
          maxlength: 10,
          required: true,
        },
        contact_person_email: {
          required: true,
          email: true,
        },
        amount: {
          required: true,
        },
        discount: {
          required: true,
        }
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
      $("#contact_person_phone").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
      if (!_.isEmpty(dynamicRules)) {

        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        // ...feilds,
        // ...dynamicRules
        // };
      }
      var messages = {
        title: "Please enter event Title",
        location: "Please Enter Event Location",
        webinar_link: "Please Enter Webinar Link",
        start_date: "Please Enter Start Date",
        end_date: "Please Enter End Date",
        contact_person_name: "Please enter Name",
        contact_person_phone: "Please enter Contact No.",
        contact_person_email: "Please enter Email",
        amount: "Please Enter Amount",
        discount: "Please Enter Discount",
      };
      $("#eventDetails").validate({
        rules: feildsrules,
        messages: messages
      });
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


      var input = document.getElementById('location');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function () {

        var place = autocomplete.getPlace();
        if (place == "") {

          selfobj.model.set({ "location": input.value() });
        } else {
          selfobj.model.set({ "location": place.formatted_address });
          selfobj.model.set({ "latitude": place.geometry['location'].lat() });
          selfobj.model.set({ "longitude": place.geometry['location'].lng() });
          selfobj.model.set({ "address_url": place.url });
        }
      });

    },
    differenceBetweenTwoDates: function () {
      var selfobj = this;
      var val1 = $("#start_date").val();
      var val2 = $("#end_date").val();
      var start = moment(val1, 'DD-MM-YYYY');
      var end = moment(val2, 'DD-MM-YYYY');
      var result = end.diff(start, 'days');
      selfobj.result = result;
      selfobj.startDate = $('#start_date').val();
      selfobj.endDate = $("#end_date").val();
      selfobj.model.set({ "result": result });
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = eventTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "scheduleList": this.scheduleList.models }));
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
      this.setOldValues();
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
    }, onDelete: function () {
      this.remove();
    }
  });
  return eventSingleView;

});
