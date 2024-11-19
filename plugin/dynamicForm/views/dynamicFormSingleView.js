
define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  '../../core/views/multiselectOptions',
  '../collections/linkedFormCollection',
  '../models/singleDynamicFormModel',
  '../collections/dynamicStdFieldsCollection',
  '../../menu/models/singleMenuModel',
  '../../category/collections/categoryCollection',
  '../../menu/models/iconListModel',
  'text!../templates/dynamicFormSingle_temp.html',
  
], function ($, _, Backbone, validate, inputmask, datepickerBT,Swal,multiselectOptions, linkedFormCollection, singleDynamicFormModel,dynamicStdFieldsCol,singleMenuModel,categoryCollection,iconListModel,dynamicFormtemp) {

  var dynamicFormSingleView = Backbone.View.extend({
    model: singleDynamicFormModel,
    parentObj:null,
    fieldList:[],
    formList:[],
    linkedMenuName : '',
    initialize: function (options) {
      var selfobj = this;
      this.parentCategory = false;
      this.toClose = "dynamicFormSingleView";
      this.multiselectOptions = new multiselectOptions();
      $(".modelbox").hide();
      this.parentObj = options.searchFields;
      this.model = new singleDynamicFormModel();
      this.menuList = new singleMenuModel();
      this.dynamicStdFieldsList = new dynamicStdFieldsCol();
      this.iconList = new iconListModel();
      this.numberInfo = [{"TINYINT":"A 1-byte integer, signed range is -128 to 127, unsigned range is 0 to 255"},
        {"SMALLINT":"A 2-byte integer, signed range is -32,768 to 32,767, unsigned range is 0 to 65,535"},
        {"MEDIUMINT":"A 3-byte integer, signed range is -8,388,608 to 8,388,607, unsigned range is 0 to 16,777,215"},
        {"INT":"A 4-byte integer, signed range is -2,147,483,648 to 2,147,483,647, unsigned range is 0 to 4,294,967,295"},
        {"BIGINT":"An 8-byte integer, signed range is -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807, unsigned range is 0 to 18,446,744,073,709,551,615"},
        {"DECIMAL":"A fixed-point number (M, D) - the maximum number of digits (M) is 65 (default 10), the maximum number of decimals (D) is 30 (default 0)"},
        {"FLOAT":"A small floating-point number, allowable values are -3.402823466E+38 to -1.175494351E-38, 0, and 1.175494351E-38 to 3.402823466E+38"},
        {"DOUBLE":"A double-precision floating-point number, allowable values are -1.7976931348623157E+308 to -2.2250738585072014E-308, 0, and 2.2250738585072014E-308 to 1.7976931348623157E+308"},
        {"REAL":"Synonym for DOUBLE (exception: in REAL_AS_FLOAT SQL mode it is a synonym for FLOAT)"},
        {"BIT":"A bit-field type (M), storing M of bits per value (default is 1, maximum is 64)"},
        {"BOOLEAN":"A synonym for TINYINT(1), a value of zero is considered false, nonzero values are considered true"},
        {"SERIAL":"An alias for BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE"}];
      this.linkedFormList = new linkedFormCollection();
      this.linkedFormList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
      this.menuId = options.menuId;
      this.model.set({ menuId: options.menuId });
      this.model.set({ fieldID: options.fieldID });
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        //selfobj.getMenuList();
        selfobj.setValues();
      });

      this.categoryList = new categoryCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', is_parent: 'yes', isSub: 'N' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
    },

    getMenuList: function () {
      var selfobj = this;
      let menuID = selfobj.model.get("linkedWith");
      if (menuID != null && menuID != ""){
        selfobj.menuList.set({"menuID":menuID});
        this.menuList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded',
            'SadminID': $.cookie('authid'),
            'token': $.cookie('_bb_key'),
            'Accept': 'application/json'
          },
          error: selfobj.onErrorHandler
        }).done(function (result) {
          if (result.statusCode == 994) {
            app_router.navigate("logout", { trigger: true });
          }
          $(".popupLoader").hide();
          selfobj.tableName = result.data[0].table_name;
          try{
            if(selfobj.dynamicStdFieldsList && selfobj.dynamicStdFieldsList != undefined){
              selfobj.dynamicStdFieldsList.fetch({
                headers: {
                  'contentType': 'application/x-www-form-urlencoded',
                  'SadminID': $.cookie('authid'),
                  'token': $.cookie('_bb_key'),
                  'Accept': 'application/json'
                },
                error: selfobj.onErrorHandler,
                type: 'post',
                data: { "table": "ab_" + selfobj.tableName }
              }).done(function (res) {
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".popupLoader").hide();
                selfobj.render();
              });
            }
          }catch(error){
            console.log("errorrr",error);
          }
          selfobj.render();
        });
      }else{
        selfobj.render();
      }
    },

    events:
    {
      "click #savedynamicFormDetails": "savedynamicFormDetails",
      "click #canceldynamicFormDetails": "canceldynamicFormDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .drop-fieldType": "updateFieldVisibility",
      "change .drop-fieldTypeDef": "visibleUserDef",
      "change .dropval": "updateOtherDetails",
      "blur .multiSelect": "updateOtherDetails",
      "click .iconSelection": "setIconValues",
    },
   onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },

    updateOtherDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      if(toID == 'fieldType'){
        selfobj.model.set("linkedWith",'');
        selfobj.model.set("fieldOptions",'');
        selfobj.model.set("parentCategory",'');
      }else{
        selfobj.model.set("linkedWith",selfobj.model.get("linkedWith"));
        selfobj.model.set("fieldOptions",selfobj.model.get("fieldOptions"));
        selfobj.model.set("parentCategory",selfobj.model.get("parentCategory"));
      }
      if(toID == 'fieldType' &&  valuetxt != 'Numeric'){
        selfobj.model.set("maxLength",null);
        selfobj.model.set("minLength",null);
      }
      var newdetails = [];
      if(valuetxt ==""){
        newdetails["" + toID] = selfobj.model.defaults["" + toID]
      }else{
        newdetails["" + toID] = valuetxt;  
      }
      

      selfobj.model.set(newdetails);
      if(selfobj.model.get("fieldOptions") && Array.isArray(selfobj.model.get("fieldOptions"))) {
        selfobj.model.set("fieldOptions",selfobj.model.get("fieldOptions").join(",")
        );
      }
      console.log(valuetxt);
      if(valuetxt =="Dropdown" || valuetxt =="RadioButton" || valuetxt =="Checkbox" || (valuetxt !="" && toID =="linkedWith")){
        selfobj.getMenuList();
      }else if(valuetxt !=""){
        selfobj.render();
      }
      
    },
  
    setValues: function (e) {
      setvalues = ["status", "allowMultiSelect", "isRequired","itemAlign","textareaType","date_selection_criteria","isNull"];
      var selfobj = this;
      $.each(setvalues, function (key, value) {
        var modval = selfobj.model.get(value);
        if (modval != null) {
          var modeVal = modval.split(",");
        } else { var modeVal = {}; }

        $(".item-container li." + value).each(function () {
          var currentval = $(this).attr("data-value");
          var selecterobj = $(this);
          $.each(modeVal, function (key, dbvalue) {
            if (dbvalue.trim().toLowerCase() == currentval.toLowerCase()) {
              $(selecterobj).addClass("active");
            }
          });
        });
      });

      setTimeout(function () {
        if (e != undefined && e.type == "click") {
          var newsetval = [];
          var objectDetails = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          $(".item-container li." + classname[0]).each(function () {
            var isclass = $(this).hasClass("active");
            if (isclass) {
              var vv = $(this).attr("data-value");
              newsetval.push(vv);
            }
          });

          if (0 < newsetval.length) {
            var newsetvalue = newsetval.toString();
          }
          else { var newsetvalue = ""; }

          objectDetails["" + classname[0]] = newsetvalue;
          $("#valset__" + classname[0]).html(newsetvalue);
          selfobj.model.set(objectDetails);
          if(selfobj.model.get("isNull") == 'TRUE'){
            selfobj.model.set("isRequired",'yes');
          }else{
            selfobj.model.set("isRequired",selfobj.model.get("isRequired"));
          }
          if(selfobj.model.get("isRequired") == 'no'){
            selfobj.model.set("isNull",'FALSE');
          }else{
            selfobj.model.set("isNull",selfobj.model.get("isNull"));
          }
          selfobj.render();
        }
      }, 1000);
      this.updateFieldVisibility();
      
    },

    savedynamicFormDetails: function (e) {
      e.preventDefault();
      var selfobj = this;
      let isNew = $(e.currentTarget).attr("data-action");
      var mid = this.model.get("fieldID");
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if(this.model.get("linkedWith") != '' && this.model.get("linkedWith") != undefined && this.model.get("linkedWith") != null && selfobj.linkedMenuName && selfobj.linkedMenuName == 'Category'){
        // if((this.model.get("fieldType") == 'Radiobutton' || this.model.get("fieldType") == 'Checkbox' || (this.model.get("fieldType") == 'Dropdown'))){
          this.model.set("fieldOptions",'categoryName');
        // }else{
          // this.model.set("fieldOptions",this.model.get("fieldOptions"));
        // }
      }else{
        this.model.set("fieldOptions",this.model.get("fieldOptions"));
      }
      if(this.model.get("icon_name") == '' || this.model.get("icon_name") == undefined || this.model.get("icon_name") == null){
        this.model.set("icon_name",'short_text');
      }else{
        this.model.set("icon_name",this.model.get("icon_name"));
      }
      if ($("#dynamicFormDetails").valid()) {
        var selfobj = this;
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
           if (res.flag == "F") {
            showResponse(e,res,'');
          } else if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId});
              selfobj.parentObj.initialize({menuId:selfobj.menuId});
              setTimeout(function () {
                selfobj.parentObj.saveForm(e);
              }, 1000);
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
              selfobj.parentObj.initialize({menuId:selfobj.model.get("menuId")});
              setTimeout(function () {
                selfobj.parentObj.saveForm(e);
              }, 1000);
            }
          }
        });
      }
    },

    updateFieldVisibility: function () {
      var selectedValue = $("#fieldType").val();
      $(".other-fields").addClass("hidden");
      $(".fields-type-" + selectedValue).removeClass("hidden");
    },

    visibleUserDef: function () {
      var selectedValue = $("#valDefault").val();
      if (selectedValue == "USER_DEFINED"){
        $(".fields-type-Def").removeClass("hidden");
      }else{
        $(".fields-type-Def").addClass("hidden");
      }
    },

    canceldynamicFormDetails: function (e) {
      var selfobj = this;
      var menuId = this.model.get("menuId");
      this.model.clear({ silent: true });
      this.model.set({ menuId: menuId });
      selfobj.render();
      selfobj.setValues();
    },

    initializeValidate: function () {
      var selfobj = this;
      $("#dynamicFormDetails").validate({
        rules: {
          fieldLabel: {
            required: true,
            alpha:true,
          },
          fieldType: {
            required: true,
          },
          fieldOptions: {
            required: true,
          },
          status: {
            required: true,
          },
          parentCategory: {
            required: true,
          },
          stepSize: {
            required: true,
          },
          minRangeValue: {
            required: true,
          },
          maxRangeValue: {
            required: true,
          },
          supportedFileTypes: {
            required: true,
          },
          numberOfFileToUpload: {
            required: true,
          },

        },
        messages: {
          fieldLabel: {
            required:"Please enter field label",
            alpha:"Please enter only alphanumeric values",
          },
          fieldType: "Please select Field Type",
          fieldOptions: "Please select field options",
          status: "Please enter status",
          parentCategory: "Please select category",
          stepSize: "Please enter Step size",
          minRangeValue: "Please enter min range",
          maxRangeValue: "Please enter max range",
          supportedFileTypes: "Please enter File Types",
          numberOfFileToUpload: "Please enter No of Files",
        }
        
      });
      $(".ws-select").selectpicker('refresh');
      //$('.ws-select').selectpicker();
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["event_type", "appointment_schedule"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },

    setIconValues: function (e) {
      selfobj = this;
      var objectDetails = [];
      if($(e.currentTarget).closest(".iconSelection").hasClass("active")){
        $(e.currentTarget).closest(".iconSelection").removeClass("active"); 
        objectDetails["icon_name"] = '';
        selfobj.model.set(objectDetails);
      }else{
        $(".iconSelection").removeClass("active");
        $(e.currentTarget).closest(".iconSelection").addClass("active");
        objectDetails["icon_name"] = $(e.currentTarget).attr("data-value");
        selfobj.model.set(objectDetails);
      }
    },

    searchIcon: function (e) {
      var searchValue = $(e.currentTarget).val().toLowerCase();
      $('.iconsectioName').each(function () {
          var iconSection = $(this);
          var hasVisibleIcons = false;
          iconSection.next('.setIconList').find('.iconName').each(function () {
              var iconNameElement = $(this);
              var iconName = iconNameElement.text().toLowerCase();
              if (iconName.includes(searchValue)) {
                  hasVisibleIcons = true;
                  return false;
              }
          });
          var clearfix = iconSection.next('.setIconList').next('.iconClearfix');
          if (hasVisibleIcons) {
              iconSection.show();
              clearfix.show();
              $('.defaultMessage').hide();
          } else {
            $('.defaultMessage').show();
              iconSection.hide();
              clearfix.hide();
          }
      });
      $('.iconName').each(function () {
        var iconNameElement = $(this);
        var iconName = iconNameElement.text().toLowerCase();
        var iconContainer = iconNameElement.closest('.iconList');
        if (iconName.includes(searchValue)) {
            iconContainer.show();
            $('.defaultMessage').hide();
        } else {
            iconContainer.hide();
        }
      });
    },

    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = dynamicFormtemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      console.log("render called");
      const fieldType = selfobj.model.get("fieldType");
      const linked = selfobj.model.get("linkedWith");
      if(linked != null && linked != '' && linked != undefined){
        var matchLink = selfobj.linkedFormList.models.filter(item => item.attributes.menuID == linked);
        if (matchLink.length > 0) {
          selfobj.linkedMenuName = matchLink[0].attributes.menuName;
        } 
      }
      if (fieldType != null && fieldType != '' && fieldType != undefined){
        if(fieldType == "Radiobutton" || fieldType == "Checkbox") {
          selfobj.formList = selfobj.linkedFormList.models.filter(item => item.attributes.menuName == 'Category' && item.attributes.linked == 'y' && (item.attributes.menuID !== selfobj.model.get("menuId")));
          if(selfobj.linkedMenuName == 'Category'){
            selfobj.parentCategory = true;
          }else{
            selfobj.parentCategory = false;
          }
        }else if(fieldType === "Dropdown"){
          selfobj.formList = selfobj.linkedFormList.models.filter(item =>
            item.attributes.linked === 'y' && item.attributes.is_custom == 'n' && (item.attributes.menuID !== selfobj.model.get("menuId"))
          );
          if(selfobj.linkedMenuName == 'Category'){
            selfobj.parentCategory = true;
          }else{
            selfobj.parentCategory = false;
          }
        }
        else{
          selfobj.formList = selfobj.linkedFormList.models.filter(item => item.attributes.linked == 'y' && item.attributes.is_custom == 'n' && (item.attributes.menuID !== selfobj.model.get("menuId")));
          selfobj.parentCategory = false;
        }
      } 
      
      if(this.dynamicStdFieldsList != []){
        const textFields = this.dynamicStdFieldsList.models.filter(field => {
        const fieldType = field.attributes.Type;
        const startIndex = fieldType.indexOf("(");
        const extractedType = startIndex !== -1 ? fieldType.substring(0, startIndex) : fieldType;
          return extractedType === 'varchar' || extractedType === 'text' || extractedType === 'Text';
        });
        const textFieldNames = textFields.map(field => field.attributes.Field);
        selfobj.fieldList = textFieldNames;
      }
    
        this.$el.html(template({ "model": this.model.attributes, "formList": selfobj.formList, "fieldList":selfobj.fieldList,"parentCategory":selfobj.parentCategory,"categoryList":selfobj.categoryList.models,"linkedMenuName":selfobj.linkedMenuName,"iconList": selfobj.iconList.attributes.icons}));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id', this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role", "tabpanel");
        this.$el.data("current", "yes");
        $(".ws-tab").append(this.$el);
        $('#' + this.toClose).show();
        // Do call this function from dynamic module it self.
        this.setOldValues();
        rearrageOverlays("Custom Fields", this.toClose);
        selfobj.initializeValidate();
        selfobj.setValues();
      if (selfobj.model.get("valDefault") == "USER_DEFINED"){
        $(".fields-type-Def").removeClass("hidden");
      }else{
        $(".fields-type-Def").addClass("hidden");
      }
      $('#iconSearch').on('input', function (e) {
        selfobj.searchIcon(e);
      });
      if($("#fieldLabel").val() == '' || $("#fieldLabel").val() == null || $("#fieldLabel").val() == undefined){
        $(".fieldLabelError").hide();
      }else{
        if($("#fieldLabel").val().length > 250){
          $(".fieldLabelError").show();
        }else{
          $(".fieldLabelError").hide();
        }
      }
      if($("#placeholder").val() == '' || $("#placeholder").val() == null || $("#placeholder").val() == undefined){
        $(".placeholderError").hide();
      }else{
        if($("#placeholder").val().length > 250){
          $(".placeholderError").show();
        }else{
          $(".placeholderError").hide();
        }
      }
      if(this.model.get("numType") != null){
        console.log("test",this.numberInfo.find(obj => obj.hasOwnProperty(this.model.get("numType"))));
        $(".numberDesc").html(this.numberInfo.find(obj => obj.hasOwnProperty(this.model.get("numType")))[this.model.get("numType")]);
      }
      if(this.model.get("supportedFileTypes") != null && this.model.get("supportedFileTypes") !=""){
        let selectedArray;
        if(typeof(this.model.get("supportedFileTypes")) == "String"){
          selectedArray = this.model.get("supportedFileTypes").split(',');
        }else{
          selectedArray = this.model.get("supportedFileTypes");
        }
        // Reference to the multi-select element
        const selectElement = document.getElementById('supportedFileTypes');
        // Loop through the options and set selected if the value matches
        for (let i = 0; i < selectElement.options.length; i++) {
            if (selectedArray.includes(selectElement.options[i].value)) {
                selectElement.options[i].selected = true;
                $(".ws-select").selectpicker("refresh");
            }
        }
      }
      this.delegateEvents();
      return this;

    }, 
    onDelete: function () {
      this.remove();
    },

  });

  return dynamicFormSingleView;

});