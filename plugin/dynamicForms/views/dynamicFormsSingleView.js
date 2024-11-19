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
  '../collections/dynamicFormsCollection',
  '../collections/dynamicQuestionCollection',
  '../models/dynamicFormsSingleModel',
  '../../readFiles/views/readFilesView',
  '../views/questionSingleView',
  'text!../templates/dynamicFormsSingle_temp.html',
  'text!../templates/dynamicFormsQuestionRow.html',
  'text!../templates/addTitleFormsRow.html',
  'text!../templates/addVideoFormsRow.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Quill, Swal, multiselectOptions, dynamicFormsCollection, dynamicQuestionCollection, dynamicFormsSingleModel, readFilesView, questionSingleView, dynamicformtemp, QuestionRow_Temp, addTitleTemp, addVideoTemp) {
  var dynamicFormsSingleView = Backbone.View.extend({
    model: dynamicFormsSingleModel,
    addCount: 0,
    form_label:'',
    initialize: function (options) {
      this.form_label = options.form_label;
      this.cloneCount = 1;
      this.addextrawQuestionID = 1;
      this.addtitleTempID = 1;
      this.addvideoTempID = 1;
      this.addTempID = 1;
      this.toClose = "dynamicFormsSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "dynamicformsList";
      this.model = new dynamicFormsSingleModel();
      this.form_id = options.form_id;
      var selfobj = this;
      // this function is called to render the dynamic view
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchform;
      $(".popupLoader").show();

      this.collection = new dynamicQuestionCollection();
      // this.collection.fetch({
      //   headers: {
      //     'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
      //   }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      // }).done(function (res) {
      //   if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
      //   $(".popupLoader").hide();
      //   //selfobj.model.set("dynamicformsList", res.data);
      //   //selfobj.render();
      // });

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
          selfobj.setOldValues();
        });
      }

    },

    events:
    {
      "click .saveformDetails": "saveformDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "click .multiOptionSel": "multioption",
      "change .dropval": "updateOtherDetails",
      "click .questionImage": "loadMediaQuestion",
      "click .add-questions": "addExtraQuestions",
      "click .add-title": "addTextFields",
      "click .add-video": "addVideo",
      "click .add-duplicate-video": "AddDuplicateVideo",
      "change .showVideo": "embedVideo",
      "click .add-duplicate-title": "AddDuplicateTitle",
      "click .remove-title": "removeExtraTitle",
      "click .remove-video": "removeExtraVideo",
    },

    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveformDetails', this.saveformDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveformDetails', this.saveformDetails.bind(this));
      this.$el.off('change', '.multiSel', this.setValues);
      this.$el.on('change', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off("click", ".questionImage", this.loadMediaQuestion);
      this.$el.on("click", ".questionImage", this.loadMediaQuestion.bind(this));
      this.$el.off("click", ".add-questions", this.addExtraQuestions);
      this.$el.on("click", ".add-questions", this.addExtraQuestions.bind(this));
      this.$el.off("click", ".add-title", this.addTextFields);
      this.$el.on("click", ".add-title", this.addTextFields.bind(this));
      this.$el.off("click", ".add-video", this.addVideo);
      this.$el.on("click", ".add-video", this.addVideo.bind(this));
      this.$el.off("click", ".add-duplicate-video", this.AddDuplicateVideo);
      this.$el.on("click", ".add-duplicate-video", this.AddDuplicateVideo.bind(this));
      this.$el.off("change", ".showVideo", this.embedVideo);
      this.$el.on("change", ".showVideo", this.embedVideo.bind(this));
      this.$el.off("click", ".add-duplicate-title", this.AddDuplicateTitle);
      this.$el.on("click", ".add-duplicate-title", this.AddDuplicateTitle.bind(this));
      this.$el.off("click", ".remove-title", this.removeExtraTitle);
      this.$el.on("click", ".remove-title", this.removeExtraTitle.bind(this));
      this.$el.off("click", ".remove-video", this.removeExtraVideo);
      this.$el.on("click", ".remove-video", this.removeExtraVideo.bind(this));
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },

    updateOtherDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["type"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },

    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },

    checkRemainingOptions: function () {
      console.log("checkRemainingOptions");
    },

    AddDuplicateVideo: function () {
      let selfobj = this;
      let originalElement = $("#ws-addvideo");
      let cloneId = 'ws-addvideo' + this.cloneCount++;
      let clonedElement = originalElement.clone().attr('id', cloneId);
      clonedElement.insertAfter(originalElement);
      selfobj.scrollToBottom();
    },

    AddDuplicateTitle: function () {
      let selfobj = this;
      let originalElement = $("#ws-textfiled");
      let cloneId = 'ws-textfiled' + this.cloneCount++;
      let clonedElement = originalElement.clone().attr('id', cloneId);
      clonedElement.insertAfter(originalElement);
      selfobj.scrollToBottom();
    },

    embedVideo: function () {
      var youtubeUrl = document.getElementById('section-description').value;

      // Check if the input is a valid YouTube URL
      var youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

      if (youtubeRegex.test(youtubeUrl)) {
        // Extract the video ID from the URL
        var videoId = youtubeUrl.match(youtubeRegex)[4];

        // Construct the embed code
        var embedCode = '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';

        // Update the video container with the embed code
        document.getElementById('video-container').innerHTML = embedCode;
      } else {
        // Clear the video container if the URL is not valid
        document.getElementById('video-container').innerHTML = '';
      }
    },

    addExtraQuestions: function (e) {
      e.stopPropagation();
      let selfobj = this;
      selfobj.addCount++;
      new questionSingleView({ form_id: this.form_id, count: selfobj.addCount, searchForm: this });
    },
    check: function (e) {
      let selfobj = this;
      var updatedModel = e.clone()
      updatedModel.set({ question_id: null });
      new questionSingleView({ form_id: this.form_id, count: selfobj.addCount, searchForm: this, model: updatedModel });
    },

    addTextFields: function (e) {
      let selfobj = this;
      var template = _.template(addTitleTemp);
      $(e.currentTarget).closest(".row").find("#ws-textfiled").append(template({ "insertID": selfobj.addtitleTempID++ }));
      selfobj.scrollToBottom();
    },

    addVideo: function (e) {
      let selfobj = this;
      var template = _.template(addVideoTemp);
      $(e.currentTarget).closest(".row").find("#ws-addvideo").append(template({ "insertID": selfobj.addvideoTempID++ }));
      selfobj.scrollToBottom();
    },

    removeExtraTitle: function (e) {
      var el = $(e.currentTarget).closest(".even");
      Swal.fire({
        title: "Delete Title",
        text: "Do you want to delete the title?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          el.remove();
          Swal.fire("Deleted!", "The title has been deleted.", "success");
        }
      });
    },

    removeExtraVideo: function (e) {
      var el = $(e.currentTarget).closest(".even");
      Swal.fire({
        title: "Delete Video",
        text: "Do you want to delete the video?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          el.remove();
          Swal.fire("Deleted!", "The video has been deleted.", "success");
        }
      });
    },

    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view1").attr("src", url);
      $("#profile_pic_view1").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      // this.model.set({"option_media":url});
    },
    loadMediaQuestion: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
    },

    saveformDetails: function (e) {
      e.preventDefault();
      var elementsD = $(".pick");
      console.log(elementsD);
      let selfobj = this;
      var form_id = this.model.get("form_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if (form_id == "" || form_id == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#formDetails").valid()) {
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
          scanDetails.filterSearch();
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
        form_name: {
          required: true,
        },
        from_description: {
          required: true,
        },
      };
      var feildsrules = feilds;
     
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
      $('.ws-select').selectpicker();
      $("#" + this.toClose).show();

      this.initializeValidate();
      this.setOldValues();
      // this.attachEvents();
      // selfobj.setupSortable();
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

      var editor = new Quill($("#from_description").get(0), {
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
          selfobj.model.set({ "from_description": justHtml });
        }
      });
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return dynamicFormsSingleView;

});