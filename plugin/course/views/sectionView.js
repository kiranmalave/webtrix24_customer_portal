define([
  "jquery",
  "underscore",
  "backbone",
  "validate",
  "inputmask",
  "../../core/views/multiselectOptions",
  "../../dynamicForm/views/dynamicFieldRender",
  "../collections/sectionCollection",
  "../collections/lessonCollection",
  "../views/lessonSingleView",
  "../models/singleSectionModel",
  "text!../templates/sectionSingleTemp.html",
  "text!../templates/lessonList.html",
], function (
  $,
  _,
  Backbone,
  validate,
  inputmask,
  multiselectOptions,
  dynamicFieldRender,
  sectionCollection,
  lessonCollection,
  lessonSingleView,
  singleSectionModel,
  sectiontemp,
  lessonListTemp
) {
  var sectionView = Backbone.View.extend({
    model: singleSectionModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "sectionView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "sectionList";
      this.lessonsArray = [];
      // this.model.set({section_id:options.section_id});
      course_id = options.course_id;
      sectionviewReturn = options.sectionView;

      this.model = new singleSectionModel();
      var selfobj = this;
      this.model.set({'course_id':options.course_id});
      // this.model.section_id = options.section_id;
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({
        ViewObj: selfobj,
        formJson: {},
      });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchCourse;
      selfobj.render();
      $(".popupLoader").show();

      if (options.section_id != "") {
        this.model.set({ section_id: options.section_id });
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
      this.sectionList = new sectionCollection();
      this.sectionList.course_id = this.course_id;
      
      console.log(this.model.attributes);
      // this.getSectionList();
    },
    events: {
      // "click .saveSectionDetails": "saveSectionDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
      "click .loadview": "loadSubView",
    },
    attachEvents: function () {
      this.$el.off("click", ".saveSectionDetails", this.saveSectionDetails);
      this.$el.on("click",".saveSectionDetails",this.saveSectionDetails.bind(this));
      this.$el.off("click", ".multiSel", this.setValues);
      this.$el.on("click", ".multiSel", this.setValues.bind(this));
      this.$el.off("change", ".dropval", this.updateOtherDetails);
      this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));
      this.$el.off("blur", ".txtchange", this.updateOtherDetails);
      this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".loadview", this.loadSubView);
      this.$el.on("click", ".loadview", this.loadSubView.bind(this));

    },
    onErrorHandler: function (collection, response, options) {
      alert(
        "Something was wrong ! Try to refresh the page or contact administer. :("
      );
      $(".profile-loader").hide();
    },
    sectionload: function (e) {
      var sectionID = $(e.currentTarget).attr("data-sectionID");
      var selfobj = this;
      this.model.set({ section_id: options.section_id });
      this.model
        .fetch({
          headers: {
            contentType: "application/x-www-form-urlencoded",
            SadminID: $.cookie("authid"),
            token: $.cookie("_bb_key"),
            Accept: "application/json",
          },
          error: selfobj.onErrorHandler,
        })
        .done(function (res) {
          if (res.statusCode == 994) {
            app_router.navigate("logout", { trigger: true });
          }
          $(".popupLoader").hide();
          // selfobj.render();
          // $("#updatebtn").html("<span>Update</span>");
        });
    },
    editDeleteOperation: function (e) {
      alert("alert");
      // $(".operation").hide();
    },
   
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");

      switch (show) {
       
      }
    },

    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);

      var e = this.course_id;
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
    closedetails: function () {
      this.render();
    },
    
    saveSectionDetails: function (e) {
      e.stopPropagation();
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("section_id");
      this.model.set({ course_id: course_id });
      // console.log(this.course_id);
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
      if ($("#sectionDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model
          .save(
            {},
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                SadminID: $.cookie("authid"),
                token: $.cookie("_bb_key"),
                Accept: "application/json",
              },
              error: selfobj.onErrorHandler,
              type: methodt,
            }
          )
          .done(function (res) {
            if (res.statusCode == 994) {
              app_router.navigate("logout", { trigger: true });
            }
            if (isNew == "new") {
              showResponse(e, res, "Save & New");
            } else {
              showResponse(e, res, "Save");
            }
            //scanDetails.filterSearch();
            if (res.flag == "S") {
              if (isNew == "new") {
                // alert("here");
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                selfobj.render();
                sectionviewReturn.getSectionList();
                sectionviewReturn.render();
              }else
              {
                handelClose(selfobj.toClose);
                sectionviewReturn.getSectionList();
                sectionviewReturn.render();
              }
          
            }
          });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {

        section_name: {
          required: true,
        },
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
        section_name: "Please enter Section Name",
      };
      $("#sectionDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
    },

    render: function () {
      var source = sectiontemp;
      var template = _.template(source);
      // console.log(this.model );
      $("#" + this.toClose).remove();
      this.$el.html(
        template({
          model: this.model.attributes,
          // sectionList: this.sectionList.models,
        })
      ); //, "lessonList": this.lessonList.models
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");

      $(".ws-tab").append(this.$el);
      // =============== Hover On Section
    
     
      $("#" + this.toClose).show();
      // this is used to append the dynamic form in the Add view html
      $("#dynamicFormFields")
        .empty()
        .append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      // $('.tohide').hide();
      $("select").selectpicker();
      rearrageOverlays("Add Section", this.toClose);

      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });
  return sectionView;
});
