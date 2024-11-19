define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Quill',
  'Swal',
  'moment',
  '../../core/views/multiselectOptions',
  '../../category/views/categorySingleView',
  '../../dynamicForm/views/dynamicFieldRender',
  "../../category/collections/slugCollection",
  '../../customer/views/customerSingleView',
  '../models/projectsSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/projectsSingle_temp.html',
  '../../core/views/appSettings',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Quill, Swal, moment, multiselectOptions, categorySingleView, dynamicFieldRender, slugCollection, customerSingleView, projectsSingleModel, readFilesView, projectSingleTemp,appSettings) {

  var projectsSingleView = Backbone.View.extend({
    model: projectsSingleModel,
    form_label:'',
    loadFrom: '',
    scanDetails:{},
    initialize: function(options){
      var selfobj = this;
      this.form_label = options.form_label;
      this.toClose = "projectsSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "projectsList";
      this.loadFrom = options.loadfrom;
      this.menuId = options.menuId;
      this.model = new projectsSingleModel();
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      selfobj.model.set({ menuId: options.menuId });
      // this function is called to render the dynamic view
      this.multiselectOptions = new multiselectOptions();
      if(options.parentObj !== undefined){
        this.scanDetails = options.parentObj;
      }
      $(".popupLoader").show();
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'project_type,project_priority,project_stages'}
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
      });
      this.appSettings = new appSettings();
      this.parentCatList = new slugCollection();
      this.parentCatList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', is_parent: 'yes'}
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
      });

      if(options.project_id != ""){
        this.model.set({project_id:options.project_id});
        this.model.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler}).done(function(res){
          if (res.flag == "F") 
            showResponse('',res,'');
          var startDate = selfobj.model.get("start_date");
          var end_date = selfobj.model.get("end_date");
          if (startDate != null && startDate != "0000-00-00") {
            selfobj.model.set({ "start_date": moment(startDate).format("DD-MM-YYYY") });
          }
          if (end_date != null && end_date != "0000-00-00") {
            selfobj.model.set({ "end_date": moment(end_date).format("DD-MM-YYYY") });
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
          selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.render();
        });
      }
    },
    events:
    {
      "click .saveProjectsDetails": "saveProjectsDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "click .multiOptionSel": "multioption",
      "change .dropval": "updateOtherDetails",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "input .custChange": "getcustomers",
      "click .selectCustomer": "setCustomer",
      "click .addNewRecord": "editCustomerDetails",
      "input .ws-freetxt": "getfreetext",
      "focus .ws-freetxt": "getfreetext",
      "click .selectFreeRecord": "updateDataFreeTxt",
    },
    
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
      var btnsave = $('.saveProjectsDetails[disabled]');
      var action = btnsave.attr('data-action');
      if (btnsave) {
        btnsave.removeAttr("disabled");
        if(action == "close"){
          btnsave.html("Save");
        }else{
          btnsave.html("Save & New");
        }
      }
    },
    getfreetext:function(e){
      let type = $(e.currentTarget).attr("id");
      console.log(type);
      switch (type) {
          case "customer_id":
            this.getcustomers(e);
          break;
        default:
          break;
      }
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      var newdetails = [];
      if (valuetxt == "addStatus" || valuetxt == "addPriority" || valuetxt == "addType") {
        this.categoryType = valuetxt;
        let category_id = $(e.currentTarget).attr("data-slug");
        new categorySingleView({ slug: category_id, searchCategory: this, loadfrom: "ProjectSingleView", form_label: "Category"});
      }
      newdetails["" + toName] = valuetxt;
      this.model.set(newdetails);
      if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
        this.model.set(toName, this.model.get(toName).join(","));
      }
    },

    refreshCat: function (lastID) {
      let selfobj = this;
      this.lastCatID = lastID;
      if(this.categoryType == 'addStages'){
        this.model.set({ project_stages: this.lastCatID })
      }else if(this.categoryType == 'addPriority'){
        this.model.set({ project_priority: this.lastCatID })
      }else if(this.categoryType == 'addType'){
        this.model.set({ project_type: this.lastCatID })
      }
      
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'project_type,project_priority,project_stages'}
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },

    refresh: function(customer_id){
      this.model.set({'customer_id': customer_id});
      this.render();
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
    setOldValues:function(){
      var selfobj = this;
      setvalues = ["status"];
      selfobj.multiselectOptions.setValues(setvalues,selfobj);
    },

    setValues:function(e){
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    saveProjectsDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var project_id = this.model.get("project_id");
      let isNew = $(e.currentTarget).attr("data-action");
      var methodt = '';
      if (project_id == "" || project_id == null || typeof(project_id) == undefined ) {
        methodt = "PUT";
      } else {
        methodt = "POST";
      }
      console.log(this.model);
      // return;
      if ($("#projectDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(isNew == "new"){
            showResponse(e,res,"Save & New");
          }else{
            showResponse(e,res,"Save");
          }
          
          if(res.flag == "S"){
            if(isNew == "new"){
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId});
              selfobj.dynamicFieldRenderobj.initialize({ViewObj:selfobj,formJson:{}});
              selfobj.render();
              
            }else{
              handelClose(selfobj.toClose);
            }
            switch (selfobj.loadFrom) {
              case "project":
                selfobj.scanDetails.refresh();
                break;
              case "TaskSingleView":
                let de = {"project_id":res.data.last_id,"title":selfobj.model.get("title")};
                selfobj.scanDetails.refreshview('project',de);
                break;
            
              default:{
                selfobj.scanDetails.filterSearch();
              }
                break;
            }
            
          }         
        });
      }
    },

    updateDataFreeTxt:function(e){
      e.stopPropagation();
      let selfobj = this;
      let toID = $(e.currentTarget).attr("data-update");
      let record_id = $(e.currentTarget).attr("data-record_id");
      let newdetails = [];
      newdetails["" + toID] = record_id;
      this.model.set(newdetails);
      $(e.currentTarget).closest(".form-group").find("input").val($(e.currentTarget).text());
      $(".freeSerachList").hide();
    },
    getcustomers:function(e){
      var selfobj = this;
      let data = {"source":'customer',"check":'name',"list":'name,customer_id,type',"stat":false};
      this.appSettings.getFreeSearchList(e,data,function(e,res){
        $(e.currentTarget).closest(".form-group").css("position","relative");
        var dropdownContainer = $(e.currentTarget).closest(".form-group").find(".freeSerachList");
        dropdownContainer.empty();
        dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view="customers"> Add New Customer </div>');
        if (res.msg === "sucess"){
          if (res.data.length > 0){
            $.each(res.data, function (index, value){
              dropdownContainer.append('<div class="dropdown-item selectFreeRecord" data-update="customer_id" data-record_id=' + value.customer_id + '>' + value.name +'(' + value.type.charAt(0) + ')'+'</div>');
              dropdownContainer.show();
            });
          }
        }else{
          selfobj.model.set("customer_id",null);
        }
        $(e.currentTarget).closest(".form-group").css("position","unset");
      });
    },

    setCustomer: function (e) {
      // e.preventDefault();
      let selfobj = this;
      if (selfobj.loadFrom == 'customer') {
        var Name = selfobj.customerName;
        var customerID = selfobj.customerID;
        selfobj.model.set({ "customerName": Name });
        selfobj.model.set({ "customer_id": customerID });
      } else {
        var Name = $(e.currentTarget).text();
        var customerID = $(e.currentTarget).attr('data-customerID');
        selfobj.model.set({ "customer_id": customerID });
        $("#customerDropdown").hide();
      }
      $('#customer_id').val(Name);
    },

    editCustomerDetails: function (e) {
      e.stopPropagation();
      var customer_id = $(e.currentTarget).attr('data-customer_id'); 
      new customerSingleView({ searchCustomer: this, customer_id:customer_id,loadfrom: "project", form_label:'Add Customer' });
    },

    initializeValidate:function(){
      var selfobj = this;
      var feilds = {
        title: {
          required: true,
        },
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if(!_.isEmpty(dynamicRules)){
        var feildsrules = $.extend({}, feilds, dynamicRules);
        
      }
      var messages  = {
        title: "Please enter Title",
      };
      $("#projectDetails").validate({
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
        var valuetxt2 = $("#end_date").val();
        var temp2 = moment(valuetxt2, 'DD-MM-YYYY').valueOf();
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
        var valuetxt2 = $("#start_date").val();
        var temp2 = moment(valuetxt2, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#start_date").val("");
        }
        selfobj.model.set({ "end_date": $('#end_date').val() });
      });
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = projectSingleTemp;
      var template = _.template(source);
      $("#"+this.toClose).remove();
      this.$el.html(template({"model":this.model.attributes, "categoryList": this.categoryList.models, "parentCatList":this.parentCatList.models}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id',this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role","tabpanel");
      this.$el.data("current","yes");
      $(".ws-tab").append(this.$el);
      $('#'+this.toClose).show();
      $(".ws-select").selectpicker("refresh");
      $(".ws-select").selectpicker();
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
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
  
      if($("#projectDescription").hasClass('ql-container')){ 
        $(".ql-toolbar").remove();
      }
      var editor = new Quill($("#projectDescription").get(0),{
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
    }, 
    onDelete: function () {
      this.remove();
    }
  });

  return projectsSingleView;

});
