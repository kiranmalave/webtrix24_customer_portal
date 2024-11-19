define([
    "jquery",
    "underscore",
    "backbone",
    "datepickerBT",
    "Swal",
    "moment",
    "../../core/views/multiselectOptions",
    "../models/singleSliderSectionModel",
    '../collections/sliderSectionCollection',
    '../views/sliderSectionSingleView',
    "text!../templates/sliderSection_temp.html",
  ], function (
    $,
    _,
    Backbone,
    datepickerBT,
    Swal,
    moment,
    multiselectOptions,
    singleSliderSectionModel,
    sliderSectionCollection,
    sliderSectionSingleView,
    sliderSectionTemp
  ) {
    var sliderSectionView = Backbone.View.extend({
      initialize: function (options) {
        var selfobj = this;
        this.multiselectOptions = new multiselectOptions();
        this.model = new singleSliderSectionModel();
        this.slider_id = options.slider_id;
        this.skipFields = [] ;
        this.toClose = "sliderSectionView";
        this.sliderSectionList = new sliderSectionCollection;
        
        this.getSectionList();

        this.render();
      },
  
      events: {
        "click .saveSectionDetails": "saveSectionDetails",
        "blur .txtchange": "updateOtherDetails",
        "click .changeStatus": "changeStatus",
        "click .loadview": "loadSubView",
      },
  
      attachEvents: function () {
        this.$el.off("click", ".saveSectionDetails", this.saveSectionDetails);
        this.$el.on(
          "click",
          ".saveSectionDetails",
          this.saveSectionDetails.bind(this)
        );
        this.$el.off("blur", ".txtchange", this.updateOtherDetails);
        this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));
        this.$el.off("click", ".changeStatus", this.changeStatus);
        this.$el.on("click", ".changeStatus", this.changeStatus.bind(this));
        this.$el.off("click", ".loadview", this.loadSubView);
        this.$el.on("click", ".loadview", this.loadSubView.bind(this));
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
  
      initializeValidate: function () {
        var selfobj = this;
        var feilds = {
          title: {
            required: true,
          },
        };
        var feildsrules = feilds;
  
        var messages = {
          title: "Please enter Title ",
        };
  
        $("#sectionDetails").validate({
          rules: feildsrules,
          messages: messages,
        });
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
      saveSectionDetails: function (e) {
        e.stopPropagation();
        e.preventDefault();
        let selfobj = this;
        var mid = this.model.get("item_id");
        this.model.set({ slider_id: this.slider_id });
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
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.render();
                selfobj.getSectionList(); 
               
              }
            });
        }
      },
     
      changeStatus: function (e) {
        var removeId = $(e.currentTarget).attr("data-sectionID");
            var status = $(e.currentTarget).attr("data-action");
            var action = $(e.currentTarget).attr("data-action");
          
        Swal.fire({
          title: "Delete Section ",
          text: "Do you want to delete section !!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Delete Section',
          animation: "slide-from-top",
        
        }).then((result) => {
          if (result.isConfirmed) {
            var selfobj = this;
              if (removeId == "") {
                showResponse('',{ flag:'F' , msg: 'Please select Section To Delete Properly' },'');
              return false;
            }
            $.ajax({
              url: APIPATH + "sliderSections/status",
              method: "POST",
              data: { item_id: removeId, action: action, status: status },
              datatype: "JSON",
              beforeSend: function (request) {
                //$(e.currentTarget).html("<span>Updating..</span>");
                request.setRequestHeader("token", $.cookie("_bb_key"));
                request.setRequestHeader("SadminID", $.cookie("authid"));
                request.setRequestHeader(
                  "contentType",
                  "application/x-www-form-urlencoded"
                );
                request.setRequestHeader("Accept", "application/json");
              },
              success: function (res) {
                if (res.flag == "F") showResponse(e,res,'');
      
                if (res.statusCode == 994) {
                  app_router.navigate("logout", { trigger: true });
                }
                if (res.flag == "S") {
                  selfobj.getSectionList();
                }
                setTimeout(function () {
                  $(e.currentTarget).html(status);
                }, 3000);
              },
            });
  
        }});
        
      },
      getSectionList:function(){
        var selfobj = this;
        selfobj.sliderSectionList.fetch({headers:
          {'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
         }, error: selfobj.onErrorHandler, data: { status: 'active', getAll: 'Y',slider_id:selfobj.slider_id }
       }).done(function (res) { 
         if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
         $(".profile-loader").hide();
         selfobj.render();
       });
      },
      loadSubView: function (e) {
        var selfobj = this;
        var show = $(e.currentTarget).attr("data-view");
  
        switch (show) {
          case "sliderSectionSingleView": {
            var item_id = $(e.currentTarget).attr("data-item_id");
            new sliderSectionSingleView({item_id: item_id,searchSlide: this ,slider_id: this.slider_id});
            break;
          }
        }
      },
      render: function () {
        var selfobj = this;
        var source = sliderSectionTemp;
        var template = _.template(source);
        $("#" + this.toClose).remove();
        this.$el.html(template({ model: this.model.attributes , sliderSectionList:selfobj.sliderSectionList.models }));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr("id", this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role", "tabpanel");
        this.$el.data("current", "yes");
        $(".ws-tab").append(this.$el);
        $("#" + this.toClose).show();
  
        this.initializeValidate();
        this.setOldValues();
        this.attachEvents();
        $(".ws-select").selectpicker();
        rearrageOverlays("Image Slider", this.toClose);
        return this;
      },
      onDelete: function () {
        this.remove();
      },
    });
    return sliderSectionView;
  });