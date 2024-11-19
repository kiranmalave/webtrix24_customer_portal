define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'minicolors',
  'Quill',
  'Swal',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../models/servicesSingleModel',
  '../../category/collections/slugCollection',
  '../collections/servicesCollection',
  '../../readFiles/views/readFilesView',
  'text!../templates/servicesSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, minicolors, Quill,Swal,multiselectOptions,dynamicFieldRender, servicesSingleModel, slugCollection, servicesCollection,readFilesView, servicestemp) {
  var servicesSingleView = Backbone.View.extend({
    initialize: function (options) {
      console.log(options);
      this.dynamicData = null;
      this.toClose = "servicesSingleView";
      var selfobj = this;
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      this.multiselectOptions = new multiselectOptions();
      // var mname = Backbone.history.getFragment();
      var service_id = options.action;
      readyState = true;
      this.pluginName = "servicesList";
      this.pluginId = options.pluginId;

      this.model = new servicesSingleModel();
      this.categoryList = new slugCollection();
      scanDetails = options.searchServices;
      $(".profile-loader").show();
      this.servicesList = new servicesCollection();
      this.servicesList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: "active", getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.render();
      });

      this.categoryList.fetch({headers:{
        'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler,type:'post', data:{status:'active',getAll:'Y'}}).done(function(res){
        if (res.flag == "F") {
          showResponse('',res,'');
        }
      if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
      $(".popupLoader").hide();
      selfobj.render();
    });

      if (options.service_id !="") {
        console.log(options.service_id);
        this.model.set({ service_id:options.service_id});
        this.model.fetch({headers: {'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          var category = selfobj.model.get("category");
          if(category){
            var arrayCategory = category.split(",");
            selfobj.model.set({ arrayCategory: arrayCategory })
          }
          selfobj.render();
          selfobj.dynamicData = res.data.dynamicFields;

        });
      }
    },
    events:
    {
      "click .saveServiceDetails": "saveServiceDetails",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "click .multiOptionSel": "multioption",
      "change .dropval": "updateOtherDetails",
      "change .fileAdded": "updateImage",
      "keyup .titleChange": "updateURL",
      "click .loadMedia": "loadMedia",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
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
      console.log(this.model);
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
      console.log("this.model", this.model);
    },

    selectOnlyThis: function(e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("name");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
      console.log("this.model", this.model);
    },

    setOldValues:function(){
      var selfobj = this;
      setvalues = ["status","service_type"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    getSelectedFile:function(url){
      $('.'+this.elm).val(url);
      $('.'+this.elm).change();
      $("#profile_pic_view").attr("src",url);
      $("#profile_pic_view").css({"max-width":"100%"});
      $('#largeModal').modal('toggle');
      this.model.set({"serviceImage":url});
    },
    loadMedia: function(e){
      e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({loadFrom:"addpage",loadController:this});
    },
    setValues:function(e){
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },

    updateURL: function (e) {
      console.log($(e.currentTarget).val());
      var url = $(e.currentTarget).val().trim().replace(/[^A-Z0-9]+/ig, "_");
      $("#serviceLink").val(url);
      this.model.set({ "serviceLink": url });
    },
    saveServiceDetails: function(e){
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("service_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if(permission.edit != "yes"){
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if(mid == "" || mid == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#serviceDetails").valid()){
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
    
          if(isNew == "new"){
            showResponse(e,res,"Save & New");
          }else{
            showResponse(e,res,"Save");
          }
          scanDetails.filterSearch();
          if(res.flag == "S"){
            if(isNew == "new"){
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.dynamicFieldRenderobj.initialize({ViewObj:selfobj,formJson:{}});
              selfobj.render();
            }else{
              handelClose(selfobj.toClose);
            }
          }         
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      var  feilds={
          serviceTitle: {
            required: true,
          },
          serviceLink:{
            required: true,
          },
          serviceDescription: {
            required: true,
          },
          category: {
            required: true,
          },
          service_type: {
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

      var messages= {
          serviceTitle: "Please enter service title",
          serviceDescription: "Please enter about service",
          category: "Please Select Category",
          service_type: "Please select Type",
        }
        $("#serviceDetails").validate({
          rules: feildsrules,
        messages: messages,
        });
        var dateFormat = "mm/dd/yy",
          from = $( "#start_date" )
            .datepickerBT({
              defaultDate: "+1w",
              changeMonth: true,
              changeYear: true,
            })
            .on( "change", function() {
              to.datepickerBT( "option", "minDate", getDate( this ) );
            }),
          to = $( "#end_date" ).datepickerBT({
            defaultDate: "+1w",
            changeMonth: true,
            changeYear: true,
          })
          .on( "change", function() {
            from.datepickerBT( "option", "maxDate", getDate( this ) );
          });
          
        function getDate( element ) {
          var date;
          try {
            date = $.datepickerBT.parseDate( dateFormat, element.value );
          } catch( error ) {
            date = null;
          }
     
          return date;
        };
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = servicestemp;
      var template = _.template(source);
      $("#"+this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models, "servicesList": this.servicesList.models }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id',this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role","tabpanel");
      this.$el.data("current","yes");
      $(".ws-tab").append(this.$el);
      $('#'+this.toClose).show();
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
            // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      $('.ws-select').selectpicker();
      rearrageOverlays("Services",this.toClose);
     
      var __toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ direction: "rtl" }], // text direction
        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ align: [] }],
        ["link"],
        ["clean"], // remove formatting button
      ];
      var editor = new Quill($("#serviceDescription").get(0), {
        modules: {
          toolbar: __toolbarOptions,
        },
        theme: "snow", // or 'bubble'
      });

      //const delta = editor.clipboard.convert();
      //editor.setContents(delta, 'silent');
      editor.on('text-change', function(delta, oldDelta, source) {
        if (source == "api") {
          console.log("An API call triggered this change.");
        } else if (source == "user") {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          selfobj.model.set({ "serviceDescription": justHtml });
        }
      });
      this.delegateEvents();
      return this;
    },onDelete: function(){
      this.remove();
    },
  });
  return servicesSingleView;
});