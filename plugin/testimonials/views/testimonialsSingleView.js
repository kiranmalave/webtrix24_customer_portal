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
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/testimonialsCollection',
  '../models/testimonialsSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/testimonialsSingle_temp.html',
], function ($,_,Backbone,validate,inputmask,datepickerBT, Quill, Swal, multiselectOptions,dynamicFieldRender,testimonialsCollection,testimonialsSingleModel,readFilesView,testimonialstemp) {
  var testimonialsSingleView = Backbone.View.extend({
    model: testimonialsSingleModel,
    form_label:'',
    initialize: function (options) {
      var selfobj = this;
      this.form_label = options.form_label;
      this.toClose = "testimonialsSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "testimonialsList";
      this.menuId = options.menuId;
      this.model = new testimonialsSingleModel();
      selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      selfobj.model.set({ menuId: options.menuId });
      // this function is called to render the dynamic view
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchtestimonials;
      $(".popupLoader").show();
      var testimonialsList = new testimonialsCollection();
      testimonialsList.fetch({headers: {contentType: "application/x-www-form-urlencoded",SadminID: $.cookie("authid"),token: $.cookie("_bb_key"), Accept: "application/json",
          },error: selfobj.onErrorHandler,type: "post",data: { status: "active", getAll: "Y" },
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          if (res.statusCode == 994) {app_router.navigate("logout", { trigger: true });
          }
          $(".popupLoader").hide();
          selfobj.model.set("testfimonialsList", res.data);
          selfobj.render();
        });

      if (options.testimonial_id != "") {
        this.model.set({ testimonial_id: options.testimonial_id });
        this.model.fetch({ headers: {contentType: "application/x-www-form-urlencoded",SadminID: $.cookie("authid"),token: $.cookie("_bb_key"),Accept: "application/json",
          },data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler,
          }).done(function (res) {
            if (res.flag == "F") {
              showResponse('',res,'');
            }
            if (res.statusCode == 994) {app_router.navigate("logout", { trigger: true });}
            $(".popupLoader").hide();
            selfobj.dynamicFieldRenderobj.prepareForm();
            selfobj.render();
          });
      }
    },
    events: {
      "click .savetestimonialsDetails": "savetestimonialsDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
      "click .loadMedia": "loadMedia",   
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".column-loader").hide();
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
    updateImage: function (e) {
      var ob = this;
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("output").src = e.target.result;
        newdetails["" + toID] = reader.result;
        ob.model.set(newdetails);
      };
      reader.readAsDataURL(e.currentTarget.files[0]);

    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["type","designation_show_on_website","status"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      selfobj.render();
    },
    getSelectedFile:function(url){
      $('.'+this.elm).val(url);
      $('.'+this.elm).change();
      $("#profile_pic_view").attr("src",url);
      $("#profile_pic_view").css({"max-width":"100%"});
      $('#largeModal').modal('toggle');
      this.model.set({"testimonial_image":url});
      this.render();
    },
    loadMedia: function(e){
      e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({loadFrom:"addpage",loadController:this});   
    },
    savetestimonialsDetails: function(e){
      e.preventDefault();
      let selfobj = this;
      var testimonial_id = this.model.get("testimonial_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if(testimonial_id == "" || testimonial_id == null){
        var methodt = "POST";
      }else{
        var methodt = "PUT";
      }
      if($("#testimonialsDetails").valid()){
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt
      }).done(function(res){
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
              selfobj.model.set({ menuId: options.menuId });
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
      var feilds = {
        testimonial_name: {
          required: true,
        },
        testimonial_message: {
          required: true,
        },
      
      };
      if (selfobj.model.get('designation_show_on_website') == 'yes') {
        feilds.designation = {
          required: true,
        };
      }
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules); 
      }
      var messages = {
        testimonial_name: "Please enter Testimonials Name",
        testimonial_message: "Please enter Testimonials Message",
        testimonial_image: "Please enter Testimonials Image",
        designation: "Please enter Testimonials Designation",
      };
      $("#testimonialsDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
      $("#dob").datepickerBT({
        todayBtn: 1,
        autoclose: true,
        dateFormat: "yy-mm-dd",
        onSelect: function (dateText) {
          selfobj.model.set({ dob: this.value });
          var minDate = new Date(this.value);
        },
      });

    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = testimonialstemp;
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
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      setToolTip();
      this.initializeValidate();
      this.setOldValues();
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
  
    var editor = new Quill($("#testimonial_message").get(0),{
      modules: {
          toolbar: __toolbarOptions
      },
      theme: 'snow'  // or 'bubble'
      });

      //const delta = editor.clipboard.convert();
      //editor.setContents(delta, 'silent');
      editor.on('text-change', function(delta, oldDelta, source) {
          if (source == 'api') {
              console.log("An API call triggered this change.");
            } else if (source == 'user') {
              var delta = editor.getContents();
              var text = editor.getText();
              var justHtml = editor.root.innerHTML;
              selfobj.model.set({"testimonial_message":justHtml});
            }
      });
      this.delegateEvents();
      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return testimonialsSingleView;
});