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
  '../collections/courseCollection',
  '../../category/collections/slugCollection',
  '../../category/views/categorySingleView',
  '../models/singleCourseModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/courseSingle_temp.html',

], function($,_, Backbone,validate,inputmask,datepickerBT,Swal,Quill,multiselectOptions,dynamicFieldRender,courseCollection,slugCollection,categorySingleView,singleCourseModel,readFilesView,coursetemp){


var courseSingleView = Backbone.View.extend({ 
    model:singleCourseModel,
    form_label:'',
    initialize: function(options){
      var selfobj = this;
      this.toClose = "courseSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "courseList";
      this.menuId= options.menuId;
      this.model = new singleCourseModel();
      this.model.set({ menuId: options.menuId });
      this.form_label = options.form_label;
      this.model.set({'course_paid':'paid'});
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      this.multiselectOptions = new multiselectOptions();
      this.categoryList = new slugCollection();
      scanDetails = options.searchCourse;
      $(".popupLoader").show();
      this.courseList = new courseCollection();
      this.categoryList.fetch({headers:
         {'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: 'active', getAll: 'Y',slug:'course_list ' }
      }).done(function (res) { 
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.render();
      });

      this.courseList.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler,type:'post', data:{status:'active',getAll:'Y'}}).done(function(res){
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".popupLoader").hide();
        selfobj.model.set("courseList",res.data);
        selfobj.render();
      });

      if(options.course_id != ""){
        this.model.set({course_id:options.course_id});
        this.model.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".popupLoader").hide();
          selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.render();
        });
      }
    },
    events:
    {
      "click .saveCourseDetails":"saveCourseDetails",
      "blur .txtchange":"updateOtherDetails",
      "click .multiSel":"setValues",
      "change .dropval":"updateOtherDetails",
      "change .paid":"paid",
      "click .loadMedia": "loadMedia",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
    },
    onErrorHandler: function(collection, response, options){
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
    },
    paid: function(e){        
      $('.changeStatus').hide();
      $('.checkall').prop('checked', false);
      var selfobj = this;
      if($('#ig_checkbox').is(":checked")){
        $(".ws-amount").hide();
        $(".ws-discount").hide();
        selfobj.model.set({'course_paid':"free",'selling_price':'0'});
        selfobj.render();
      }else{
        $(".ws-amount").show();
        $(".ws-discount").show();
        selfobj.model.set({'course_paid':"paid"});
        selfobj.render();
      }
     
    //   $('#ig_checkbox').each(function(){
    //     if($(this).is(":checked"))
    //     {
    //       $(".ws-amount").hide();
    //       $(".ws-discount").hide();
    //       selfobj.model.set({'course_paid':"free",'selling_price':'0'});
    //       selfobj.render();
    //     }else{
    //       $(".ws-amount").show();
    //       $(".ws-discount").show();
    //       selfobj.model.set({'course_paid':"paid"});
    //       selfobj.render();
    //     }
    // });
    },
    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'course_list' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        // $(".popupLoader").hide();
        selfobj.render();
      });
    },
    updateOtherDetails: function(e){
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];
      if(valuetxt=="addCourseCategory")
      {
        new categorySingleView({ searchCategory: this, loadfrom: "courseSingleView" });
      }
      if(toID == 'discount')
      {
        valuetxt = valuetxt.replace(/%/g, '');
        ds = valuetxt+"%";
        console.log(ds);
        $(e.currentTarget).val(ds);
        valuetxt = valuetxt.replace(/%/g, '');
      }
      newdetails[""+toID]= valuetxt;
      this.setSellingPrice();  
      this.model.set(newdetails);
      console.table([this.model.attributes]);
     
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

    setSellingPrice: function()
    {
      var disc = $("#discount").val();
      disc = disc.replace(/%/g, '');
      var amt = $("#amount").val();
      var discountPrice = amt - ((amt * disc)/100) ;
      this.model.set({'selling_price' : Math.round(discountPrice) });
    },

    setOldValues:function(){
      var selfobj = this;
      setvalues = ["course_paid","status"];
      selfobj.multiselectOptions.setValues(setvalues,selfobj);
    },
    setValues:function(e){
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    getSelectedFile:function(url){
      $('.'+this.elm).val(url);
      $('.'+this.elm).change();
      $("#profile_pic_view1").attr("src",url);
      $("#profile_pic_view1").css({"max-width":"100%"});
      $('#largeModal').modal('toggle');
      this.model.set({"cover_image":url});
    },
    loadMedia: function(e){
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({loadFrom:"addpage",loadController:this});
    },
    saveCourseDetails: function(e){
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("course_id");
      this.setSellingPrice();
      let isNew = $(e.currentTarget).attr("data-action");
      if(mid == "" || mid == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#courseDetails").valid()){
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if (res.flag == "F") showResponse(e,res,'');
          scanDetails.filterSearch();
          if(res.flag == "S"){
            if(isNew == "new"){
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId});
              selfobj.dynamicFieldRenderobj.initialize({ViewObj:selfobj,formJson:{}});
              selfobj.render();
        
            }else{
              handelClose(selfobj.toClose);
              scanDetails.filterSearch();
            }
          }
        });
      }
      },
    initializeValidate:function(){
      var selfobj = this;
      var feilds = {
      
      
       cover_image:{
        required: true,
       },
       course_paid:{
        required: false,
       },
       category_id:{
        required: true,
       },
       author_id:{
        required: true,
       },
       discount :{
      //   max : 100,
      //   min:0
       },
       amount :{
        number:true,
        min:0
       },
     
         title:{
           required: true,
        },
        description:{
          required: true,
       },
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
     
      if(!_.isEmpty(dynamicRules)){
      
        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        // ...feilds,
        // ...dynamicRules
        // };
      }
      var messages  = {
        title: "Please enter Course Name",
        description: "Please enter Description Name",
        cover_image: "Please upload Image",
        category_id: "Please select Category",
        author_id: "Please select Author",  
      };
      
      $.validator.addMethod("discPattern", function(value, element) {
        var discepattern = /^(100|[1-9]?[0-9])%?$/;
        console.log(value,element);
        return this.optional(element) || discepattern.test(value);
      }, "number required");

      $("#courseDetails").validate({
        rules: feildsrules,
        messages: messages
      });
    },
   
    render: function(){
        var selfobj = this;
        this.undelegateEvents();
        var source = coursetemp;
        var template = _.template(source);
        $("#"+this.toClose).remove();
        this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models}));
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
        this.setSellingPrice();
        this.setOldValues();
        $('.ws-select').selectpicker();
        rearrageOverlays(selfobj.form_label,this.toClose);
        var __toolbarOptions = [
          ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'direction': 'rtl' }],                         // text direction
          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'align': [] }],
          ['link'],
            ['clean']                                         // remove formatting button
        ];
    
      var editor = new Quill($("#description").get(0),{
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
                selfobj.model.set({"description":justHtml});
              }
        });
        this.delegateEvents();
        return this;
    },onDelete: function(){
        this.remove();
    }
    
});
  return courseSingleView;
  
});
