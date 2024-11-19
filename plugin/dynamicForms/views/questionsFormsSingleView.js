define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/dynamicFormsCollection',
  '../models/dynamicFormsSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/dynamicFormsQuestionRow.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, multiselectOptions, dynamicFieldRender, dynamicFormsCollection, dynamicFormsSingleModel, readFilesView, dynamicformtemp, QuestionRow_Temp) {

  var questionsFormsSingleView = Backbone.View.extend({
    model: dynamicFormsSingleModel,
    addCount: 0,
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "questionsFormsSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "dynamicformsList";
      this.model = new dynamicFormsSingleModel();
      var selfobj = this;
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchform;
      $(".popupLoader").show();

      var dynamicformsList = new dynamicFormsCollection();
      dynamicformsList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("dynamicformsList", res.data);
        selfobj.render();
      });

      if (options.form_id != "") {
        this.model.set({ form_id: options.form_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      }
    },
    events:
    {
      "blur .txtchange": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .loadMedia": "loadMedia",
      "click .add-questions": "addExtraQuestions",
      "click .remove-questions": "removeExtraQuestions",
      "click .add-options": "AddRowOptions",
      "click .add-duplicate": "AddDuplicate",
    },
    attachEvents: function () {
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off("click", ".loadMedia", this.loadMedia);
      this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
      this.$el.off("click", ".add-questions", this.addExtraQuestions);
      this.$el.on("click", ".add-questions", this.addExtraQuestions.bind(this));
      this.$el.off("click", ".remove-questions", this.removeExtraQuestions);
      this.$el.on("click", ".remove-questions", this.removeExtraQuestions.bind(this));
      this.$el.off("click", ".add-options", this.AddRowOptions);
      this.$el.on("click", ".add-options", this.AddRowOptions.bind(this));
      this.$el.off("click", ".add-duplicate", this.AddDuplicate);
      this.$el.on("click", ".add-duplicate", this.AddDuplicate.bind(this));
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },
    AddRowOptions: function () {
      $('.questionView').on('scroll', function () {
        if ($(this).scrollBottom() >= $('.ws-btn-sidebar').position().bottom) {
          do_something();
        }
      });
    },
    AddDuplicate: function () {
      $('.questionView').clone().appendTo('#duplicates');
    },
    addExtraQuestions: function (e) {
      alert("HERE Question");
      t = $(e.currentTarget).closest(".row").find(".questionView").attr('id');
      st = 0;
      var template = _.template(QuestionRow_Temp);
      $(e.currentTarget).closest(".row").find(".questionView").append(template({}));

    },
    removeExtraQuestions: function (e) {
      var el = $(e.currentTarget).closest(".ws-even")
      $(e.currentTarget).closest(".ws-even").remove();
    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "option_media": url });
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        form_name: {
          required: true,
        },
        from_description: {
          required: true,
        },
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        //   ...feilds,
        //   ...dynamicRules
        //   };
      }
      var messages = {
        form_name: "Please enter Name",
        from_description: "Please enter Descriptions",

      };
      $("#formDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
    },
    render: function () {
      var selfobj = this;
      var source = dynamicformtemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $("#" + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      $("#dynamicForms").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      $("select").selectpicker();
      this.initializeValidate();
      this.attachEvents();
      $('.ws-select').selectpicker();
      rearrageOverlays("Forms", this.toClose);
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return questionsFormsSingleView;

});
