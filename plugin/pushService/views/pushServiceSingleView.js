define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  '../../core/views/multiselectOptions',
  "../../customer/collections/customerCollection",
  "../../category/collections/slugCollection",
  '../models/pushServiceSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/pushServiceSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, multiselectOptions, customerCollection, slugCollection, pushServiceSingleModel, readFilesView, pushServicetemp) {

  var pushServiceSingleView = Backbone.View.extend({
    model: pushServiceSingleModel,
    form_label:'',
    initialize: function (options) {
      this.form_label = options.form_label;
      this.dynamicData = null;
      this.toClose = "pushServiceSingleView";
      this.pluginName = "pushServiceList";
      this.loadFrom = options.loadfrom;
      this.model = new pushServiceSingleModel();
      var selfobj = this;
      this.multiselectOptions = new multiselectOptions();
      $(".modelbox").hide();
      scanDetails = options.searchpushService;
      $(".popupLoader").show();
      this.customerList = new customerCollection();
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'payment,donation' }
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      if (options.push_service_id != "") {
        this.model.set({ push_service_id: options.push_service_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          var date_of_donation = selfobj.model.get("date_of_donation");
          if (date_of_donation != null && date_of_donation != "0000-00-00") {
            selfobj.model.set({ "date_of_donation": moment(date_of_donation).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
          selfobj.setOldValues();
        });
      }
    },

    events: {
      "click .savepushServiceDetails": "savepushServiceDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "change .logoAdded": "updateImageLogo",
      "click .loadMedia": "loadMedia",
      "click .multiOptionSel": "setValues",
    },

    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off("click", ".savepushServiceDetails", this.savepushServiceDetails);
      // Reattach event bindings
      this.$el.on("click", ".savepushServiceDetails", this.savepushServiceDetails.bind(this));
      this.$el.off("click", ".multiSel", this.setValues);
      this.$el.on("click", ".multiSel", this.setValues.bind(this));
      this.$el.off("change", ".bDate", this.updateOtherDetails);
      this.$el.on("change", ".bDate", this.updateOtherDetails.bind(this));
      this.$el.off("change", ".dropval", this.updateOtherDetails);
      this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".iconSelection", this.setIconValues);
      this.$el.off("blur", ".txtchange", this.updateOtherDetails);
      this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".loadMedia", this.loadMedia);
      this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
      this.$el.off("click", ".multiOptionSel", this.setValues);
      this.$el.on("click", ".multiOptionSel", this.setValues.bind(this));
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
    },

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },

    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },

    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "pushService_image": url });
    },

    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      var menusingleview = new readFilesView({ loadFrom: "addpage", loadController: this });
    },

    savepushServiceDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("push_service_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#pushServiceDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          if (selfobj.loadFrom == "TaskSingleView") {
            scanDetails.refreshCust();
          } else {
            scanDetails.filterSearch();
          }
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
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
        email_id: {
          required: true,
          email: true,
        },
        date_of_donation: {
          required: true,
        },
        address: {
          required: true
        },
        pushService_in_name_of: {
          required: true
        },
        pan_number: {
          required: true
        },
        aadhar_number: {
          required: true,
          minlength: 12,
          maxlength: 12,
        },
        pan_number: {
          minlength: 10,
          maxlength: 10,
        },
      };
      var feildsrules = feilds;
      var messages = {

        name: "Donor Name required",
        email_id: "Email Required",
        date_of_donation: "Date of Donation Required",
        address: "Address Required",
        pushService_in_name_of: "Name For reciept Required",
        pan_number: "PAN number required",
        aadhar_number: "Aadhar Number Required"
      };
      $("#contact_number").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });

      $("#pushServiceDetails").validate({
        rules: feildsrules,
        messages: messages,
      });

      $("#date_of_donation").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (selected) {

        $('#date_of_donation').change();
        var valuetxt = $("#date_of_donation").val();
        selfobj.model.set({ date_of_donation: valuetxt });

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
      //var isexits = checkisoverlay(this.toClose);
      //if(!isexits){
      var selfobj = this;
      var source = pushServicetemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes ,"customerList": this.customerList.models, "categoryList": this.categoryList.models}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".tab-content").append(this.$el);
      $(".ws-select").selectpicker();
      $("#" + this.toClose).show();
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      rearrageOverlays(selfobj.form_label, this.toClose);
      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return pushServiceSingleView;
});
