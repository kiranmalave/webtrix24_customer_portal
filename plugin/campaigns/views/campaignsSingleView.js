define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  'Quill',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../../readFiles/views/readFilesView',
  '../collections/campaignsCollection',
  '../models/campaignsSingleModel',
  
  '../../core/views/campaingTemplateSelectorView',
  '../../core/views/conditionsView',
  '../views/conditionSelector',

  'text!../templates/campaignsSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Swal, Quill, multiselectOptions, dynamicFieldRender, readFilesView, campaignsCollection, campaignsSingleModel, templateSelectorView, conditionsView, conditionSelector,campaignstemp) {

  var campaignsSingleView = Backbone.View.extend({
    model: campaignsSingleModel,
    form_label: '',
    initialize: function (options) {
      var selfobj = this;
      this.uploadFileElArray = [];
      this.LastID = '';
      this.conditions = {};
      this.toClose = "campaignsSingleView";
      this.pluginName = Backbone.history.getFragment();
      this.model = new campaignsSingleModel();
      // selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.form_label = options.form_label;
      selfobj.menuId = options.menuId;
      selfobj.model.set({ menuId: options.menuId });
      scanDetails = options.searchCampaigns;
      this.menuAccess = scanDetails.menuAccess;
      this.multiselectOptions = new multiselectOptions();
      if (options.campaign_id && options.campaign_id != "") {
        this.recordID = options.campaign_id;
        this.model.set({ campaign_id: options.campaign_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, data: { menuId: selfobj.model.get("menuId") }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({ title: 'Failed !', text: res.msg, timer: 2000, icon: 'error', showConfirmButton: false });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.conditions = JSON.parse(selfobj.model.get('target_table_conditions'));
          // selfobj.templateSelectorView = new templateSelectorView({ parentObj: selfobj });
          selfobj.render();
        });
      }else{
        // this.templateSelectorView = new templateSelectorView({ parentObj: this });
        // selfobj.render();
      }
      $(".modelbox").hide();
      $(".popupLoader").show();
    },
    events:
    {
      "click .saveCampaignsDetails": "saveCampaignsDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "change .logoAdded": "updateImageLogo",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
      "click .wizard": "wizard",
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var newdetails = [];
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      newdetails["" + toName] = valuetxt;
      this.model.set(newdetails);
      switch (toName) {
        case 'end_on':
          $('.end_after_time, .end_on_date').hide();
          $('#end_after_time, #end_on_date').val('');
          switch (valuetxt) {
            case 'after_x_time':
              $('.end_after_time').show();
              break;
            case 'on_date':
              $('.end_on_date').show();
              break;
            default:
              break;
          }
          break;
        case 'end_on_date':
        case 'end_after_time':
          this.model.set({ 'specific_period_data': valuetxt });
          break;
        case 'target_audience' :
          this.conditions = {}
          this.conditionSelector.initialize({parentObj : this});
          break;
        default:
          break;
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
      setvalues = ["campaign_type"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    saveCampaignsDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("campaign_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      // if ($("#campaignsDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        if (this.conditions) {
          var json_codition = JSON.stringify(this.conditions);
          this.model.set({'target_table_conditions' : json_codition})
        }
        if (this.templateDetails) {
          var templateDetails = JSON.stringify(this.templateDetails);
          this.model.set({'templateDetails' : templateDetails})
        }
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") { showResponse('', res, ''); return; }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          selfobj.LastID = (res.lastID) ? res.lastID : mid;
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          scanDetails.filterSearch();
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId });
              selfobj.render();
              selfobj.attachEvents();
            } else {
              handelClose(selfobj.toClose);
            }
          }
        });
      // }
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        campaign_name: {
          required: true,
        },
        target_audience: {
          required: true,
        },
        start_date: {
          required: true,
        },
        end_on: {
          required: true,
        },
        execution_period: {
          required: true,
        },
      };
      var feildsrules = feilds;
      // var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      // if (!_.isEmpty(dynamicRules)) {
      //   var feildsrules = $.extend({}, feilds, dynamicRules);
      // }
      var messages = {
        campaign_name: "Please enter Name",
        target_audience: "Please enter Target Audience",
        start_date: "Please enter Start Date",
        end_on: "Please enter End On",
        execution_period: "Please Enter Execution Period",
      };
      $("#campaignsDetails").validate({
        rules: feildsrules,
        messages: messages
      });

      $("#start_date").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: true,
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on("changeDate", function () {
        var valuetxt = $("#start_date").val();
        selfobj.model.set({ start_date: valuetxt });
      });
      $("#end_on_date").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: true,
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on("changeDate", function () {
        var valuetxt = $("#end_on_date").val();
        selfobj.model.set({ specific_period_data: valuetxt });
      });

      var __toolbarOptions = [
        ["bold", "italic", "underline", "strike"],
        [{ header: 1 }, { header: 2 }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ align: [] }],
        ["link"],
        ["clean"],
      ];
      var editor = new Quill($("#campaign_details").get(0), {
        modules: {
          toolbar: __toolbarOptions,
        },
        theme: "snow",
      });
      if ($("#campaign_details").hasClass('ql-container')) {
        $(".ql-toolbar").remove();
      }
      editor.on('text-change', function (delta, oldDelta, source) {
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
    },
    wizard: function (e) {
      var selfobj = this;
      let current = $(e.currentTarget).attr("data-tab-current");
      let next = $(e.currentTarget).attr("data-tab-next");
      let prev = $(e.currentTarget).attr("data-tab-prev");
      let action = $(e.currentTarget).attr("data-tab-action");
      $(".tab-contents").hide();
      $(".tab-contents").removeClass("active-tab");
      if (action == "next") {
        $("body").find("#tab" + next).show();
        $("body").find("#tab" + next).addClass("active-tab");
        if (selfobj.model.get('notification_id') == null) {
          $(".step[data-step_id='" + current + "'] .step-circle").removeClass("progress").addClass("active");
          $(".step-line[data-step_id='" + current + "']").addClass("active");
          $(".step[data-step_id='" + next + "'] .step-circle").addClass("progress");
        }
        $(e.currentTarget).attr("data-tab-next", parseInt(next) + 1);
        $(e.currentTarget).attr("data-tab-current", parseInt(next));
        $(e.currentTarget).attr("data-tab-prev", parseInt(current));

        $('#btn-pre').attr("data-tab-prev", parseInt(current));
        $('#btn-pre').attr("data-tab-next", parseInt(next) + 1);
        $('#btn-pre').attr("data-tab-current", parseInt(next));
        $('#btn-pre img').attr("src", 'images/prev_active.png');
        if (next == '4') {
          $('#save, #skip_save').show();
          $('#btn-next, #skip').hide();
        } else if (next == '3') {
          $('#skip').show();
          this.templateSelectorView = new templateSelectorView({ parentObj: this });

        } else if (next == '2') {
          this.conditionSelector = new conditionSelector({parentObj: this}).render();
          // this.conditionSelector.render();
        }
        (parseInt(prev) + 1 == '0') ? $('#btn-pre').attr('disabled', true) : $('#btn-pre').removeAttr('disabled');

      } else if (action == "prev") {
        $("#tab" + prev).show();
        $("body").find("#tab" + prev).addClass("active-tab");
        $('#btn-next').attr("data-tab-prev", parseInt(prev) - 1);
        $('#btn-next').attr("data-tab-next", parseInt(prev) + 1);
        $('#btn-next').attr("data-tab-current", parseInt(prev));
        $(e.currentTarget).attr("data-tab-prev", parseInt(prev) - 1);
        $(e.currentTarget).attr("data-tab-current", parseInt(current) - 1);
        $(e.currentTarget).attr("data-tab-next", parseInt(current));
        if (current == '4') {
          $('#btn-next').show();
          $('#save, #skip_save').hide();
        } else if (next == '3') {
          this.templateSelectorView = new templateSelectorView({ parentObj: this }).render();
        } else if (next == '2') {
          this.conditionSelector = new conditionSelector({parentObj: this}).render();
          // this.conditionSelector.render();
        }
        (prev == '1') ? $('#btn-pre').attr('disabled', true) : $('#btn-pre').removeAttr('disabled');
      }
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = campaignstemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".tab-content").append(this.$el);
      $('#' + this.toClose).show();
      $(".ws-select").selectpicker();
      // $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.initializeValidate();
      this.setOldValues();
      rearrageOverlays(selfobj.form_label, this.toClose);
      this.delegateEvents();
      // this.templateSelectorView.render();
      // this.conditionSelector = new conditionSelector({parentObj: this});  
      // this.conditionSelector.render();
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return campaignsSingleView;

});