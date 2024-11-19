define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  '../collections/dynamicFormDataCollection',
  '../../category/collections/slugCollection',
  '../../category/views/categorySingleView',
  'text!../templates/textbox_temp.html',
  'text!../templates/textarea_temp.html',
  'text!../templates/numeric_temp.html',
  'text!../templates/password_temp.html',
  'text!../templates/datepicker_temp.html',
  'text!../templates/timepicker_temp.html',
  'text!../templates/dropdown_temp.html',
  'text!../templates/radio_temp.html',
  'text!../templates/checkbox_temp.html',
  'text!../templates/range_temp.html',
  'text!../templates/file_temp.html',
  'text!../templates/email_temp.html',
  'text!../templates/mobileNo_temp.html',
  'text!../templates/website_temp.html',
  'text!../templates/linkedDropdown.html',
  'text!../templates/linkedRadio.html',
  'text!../templates/linkedCheckbox.html',

], function ($, _, Backbone, validate, inputmask, datepickerBT,moment, dynamicFormData,slugCollection,categorySingleView,textbox_temp,textarea_temp,numeric_temp,password_temp,datepicker_temp,timepicker_temp,dropdown_temp,radio_temp,checkbox_temp,range_temp,file_temp,email_temp,mobileNo_temp,website_temp,linkedDropdown,linkedRadio,linkedCheckbox) {
  var dynamicFieldRender = Backbone.View.extend({
    metadata : {},
    formobj : [],
    fileObj : {},
    initialize: function (parentObj) {
      fileObj = this;
      var selfobj = this;
      this.rules = {};
      selfobj.parentView = parentObj.ViewObj;
      selfobj.parentData = parentObj.formJson;
      selfobj.categoryList = new slugCollection();
      this.collection = new dynamicFormData();
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: {"pluginId": selfobj.parentView.menuId ,"pluginName": selfobj.parentView.pluginName}
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if(res.metadata != undefined){
            if (res.metadata && res.metadata.trim() !== '') {
              selfobj.metadata  = JSON.parse(res.metadata);
            }
          }
        selfobj.prepareForm();
      });
    },
    prepareForm:function(){
      this.$el.empty();
      let selfobj = this;
      if(this.metadata != undefined){
        Object.entries(this.metadata).forEach(([key, value]) => {
          if(value.sectionHeader != '' && value.sectionHeader != null && value.sectionHeader != undefined){
            let sectionName = $("<div>",{
              id:key,
              class:"row pb-20 sectionName",
            });
            let sectionCol = $("<div>",{
              id:key,
              class:"col-md-12",
            });
            let sectionHeader = $("<h6>",{
              id:key,
              class:"sectionHeaders",
            });
            let secName = value.sectionHeader;
            sectionHeader.append(secName);
            sectionCol.append(sectionHeader);
            sectionName.append(sectionCol);
            selfobj.$el.append(sectionName);
          }

          let row = $("<div>",{
            id:key,
            class:"row pb-20",
          });
          let clearfix = $("<div>",{
            class:"clearfix",
          });
          if(selfobj.formobj[key] == undefined){
            selfobj.formobj[key]=[];
          }
          Object.entries(value).forEach(([key_sub, sub_value]) => {
              selfobj.collection.forEach((objectModel) => {
              if(objectModel.attributes.fieldID == sub_value.fieldID){
                row.append(selfobj.prepareCol(objectModel,key_sub,sub_value));
                selfobj.addValidationRule(objectModel.attributes);
                }
              });
          });
        if(!row.is(':empty')){
          selfobj.$el.append(row);
          selfobj.$el.append(clearfix);
        }
        });
      }
      selfobj.renderDone();
    },
    
    prepareCol:function(objectModel,key_sub,sub_value){
      var selfobj = this;
      if(objectModel.attributes.textareaType == "richTextarea"){
        var className = "col-"+sub_value.colSize + " " + "margin-b-Cls";
      }else{
        var className = "col-"+sub_value.colSize;
      }
      // let className = "col-"+sub_value.colSize;
      let col = $("<div>",{
        id:key_sub,
        class:className,
      });
      if (objectModel.attributes.isRequired == "Yes"){
        objectModel.attributes.isRqr = "*";
        objectModel.attributes.requiredHtml = "required";
      }else{
        objectModel.attributes.isRqr = "";
        objectModel.attributes.requiredHtml = "";
      }
      let tt = objectModel.attributes.fieldType ? (objectModel.attributes.fieldType).toLowerCase() : '';
      switch (tt) {
        case "text": {
          var template = _.template(textbox_temp);
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
        case "textarea": {
          var template = _.template(textarea_temp);
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
        case "numeric": {
          var template = _.template(numeric_temp);
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
        case "password": {
          var template = _.template(password_temp);
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
        case "datepicker": {
          var template = _.template(datepicker_temp);
          var dueDateMoment = moment( selfobj.parentView.model.get(""+objectModel.attributes.column_name));
          if (dueDateMoment.isValid()) {
            var newdetails = [];
            newdetails["" + objectModel.attributes.column_name] = dueDateMoment.format("DD-MM-YYYY");
            selfobj.parentView.model.set(newdetails);
          }
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
        case "timepicker": {
          var template = _.template(timepicker_temp);
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
        case "dropdown": {
          var selectOptions = objectModel.attributes.fieldOptions.split(",");
          if(objectModel.attributes.linkedWith != null && objectModel.attributes.linkedWith != "" && objectModel.attributes.linkedWith != 'undefined'){
            var template = _.template(linkedDropdown);
            col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes}));
          }else{
            var template = _.template(dropdown_temp);
            col.append(template({ elementDetails: objectModel.attributes,selectOptions:selectOptions,elementData:selfobj.parentView.model.attributes}));
          }
          break;
        }
        case "radiobutton": {
          var selectOptions = objectModel.attributes.fieldOptions.split(",");
          if(objectModel.attributes.linkedWith != null && objectModel.attributes.linkedWith != "" && objectModel.attributes.linkedWith != 'undefined'){
            var matcchedID = [];
            selfobj.categoryList.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', category_id: objectModel.attributes.parentCategory}
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".popupLoader").hide();
              var child =[];
                  for (var i = 0; i < res.data[0].sublist.length; i++) {
                    child[0] = res.data[0].sublist[i].category_id;
                    child[1] = res.data[0].sublist[i].categoryName;
                    matcchedID.push(child.slice());
                  }
              var template = _.template(linkedRadio);
              col.append(template({ elementDetails: objectModel.attributes,selectOptions:matcchedID,elementData:selfobj.parentView.model.attributes}));
            });
          }else{
            var template = _.template(radio_temp);
            col.append(template({ elementDetails: objectModel.attributes, selectOptions: selectOptions,elementData:selfobj.parentView.model.attributes}));  
          }
          break;
        }
        case "checkbox": {
          var selectOptions = objectModel.attributes.fieldOptions.split(",");
          if(objectModel.attributes.linkedWith != null && objectModel.attributes.linkedWith != "" && objectModel.attributes.linkedWith != 'undefined'){
            var matcchedID = [];
            selfobj.categoryList.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', category_id: objectModel.attributes.parentCategory}
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".popupLoader").hide();
              var child =[];
              for (var i = 0; i < res.data[0].sublist.length; i++) {
                child[0] = res.data[0].sublist[i].category_id;
                child[1] = res.data[0].sublist[i].categoryName;
                matcchedID.push(child.slice());
              }
              var template = _.template(linkedCheckbox);
              col.append(template({ elementDetails: objectModel.attributes,selectOptions:matcchedID,elementData:selfobj.parentView.model.attributes}));
            });
          }else{
            var template = _.template(checkbox_temp);
            col.append(template({ elementDetails: objectModel.attributes,selectOptions:selectOptions,elementData:selfobj.parentView.model.attributes }));
          }
          break;
        }
        case "range": {
          var template = _.template(range_temp);
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
        case "file": {
          var template = _.template(file_temp);
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
        case "email": {
          var template = _.template(email_temp);
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
        case "website": {
          var template = _.template(website_temp);
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
        case "mobileno": {
          var template = _.template(mobileNo_temp);
          col.append(template({ elementDetails: objectModel.attributes,elementData:selfobj.parentView.model.attributes }));
          break;
        }
      }
      return col;
    },
   
    renderDone: function () {
      var selfobj = this;
      if(this.parentView.makeRender){
        this.parentView.render();
      }
      
      $(".ws-select-dy").selectpicker();
      $(".ws-select-dy").selectpicker("refresh");
      $('.rangeSlider').unbind();
      $('body').off('input', '.rangeSlider');
      $('body').on('input', '.rangeSlider', function () {
        var value = $(this).val();
        $(this).next('.range-value').text(value);
        var valuetxt = $(this).val();
        var toID = $(this).attr("name");
        var newdetails = [];
        newdetails["" + toID] = value;
        selfobj.parentView.model.set(newdetails);
      });

      $('body').on('change', '.fileupload', function () {
        var fileName = $(this).val().split('\\').pop(); 
        $(this).next('span.file-name').text(fileName);
      });

      selfobj.setupTextArea();
      selfobj.dataList = [];
     
      $('.valChange').unbind();
      $('.selectField').unbind();
      $('.multiSelectField').unbind();
      $('body').off('input', '.valChange');
      $('body').off('click', '.selectField');
      $('body').off('click', '.multiSelectField');
      $('body').off('click', '.addNewCategory');

      $('body').on('input', '.valChange', function (e) {
         e.stopPropagation();
        let inputText = $(e.currentTarget).val();
        let lastCommaIndex = inputText.lastIndexOf(',');
        let name = (lastCommaIndex !== -1) ? inputText.substring(lastCommaIndex + 1).trim() : inputText.trim();
        let pluginID = $(e.currentTarget).attr("data-plugIn");
        let where = $(e.currentTarget).attr("name");
        let fieldID = $(e.currentTarget).attr("data-fieldID");
        let selection = $(e.currentTarget).attr("data-selection");
        let fieldOpt = $(e.currentTarget).attr("data-fieldOpt");
        let dropdownContainer = $("#field_" + fieldID);
        let selectedIDS = [];
        if(selection == 'yes'){
          var sendText = name;
        }else{
          var sendText = inputText;
        }

        $.ajax({
          url: APIPATH + 'dynamicgetList/',
          method: 'POST',
          data: { text: '', pluginID: pluginID, wherec: fieldOpt, fieldID: fieldID },
          datatype: 'JSON',
          beforeSend: function (request) {
              $(".textLoader").show();
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
              $(".textLoader").hide();
              if (res.msg === "sucess" && res.data.length > 0) {
                selfobj.dataList = res.data;
                let inputTextArray = inputText.split(',').map(item => item.trim());
                selfobj.dataList.forEach(item => {
                  let values = Object.values(item);
                  if (inputTextArray.includes(values[1])) {
                      if (!selectedIDS.includes(values[0])) {
                          selectedIDS.push(values[0]);
                      }
                  }
                });
              }
          }
        });
    
        $.ajax({
            url: APIPATH + 'dynamicgetList/',
            method: 'POST',
            data: { text: sendText, pluginID: pluginID, wherec: fieldOpt, fieldID: fieldID },
            datatype: 'JSON',
            beforeSend: function (request) {
                $(".textLoader").show();
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
                $(".textLoader").hide();
                dropdownContainer.empty();
                var dropdownClass = (selection == 'yes') ? 'multiSelectField' : 'selectField';
                if(fieldOpt == 'categoryName'){
                  dropdownContainer.append('<div class="dropdown-item addNewCategory" style="background-color: #3F51B5!important;color:#fff">Add Category</div>');
                }
                if (res.msg === "sucess" && res.data.length > 0) {
                    let pk = res.lookup.pKey;
                    let selectedValues = $(e.currentTarget).val().split(',');
                    $.each(res.data, function (index, value) {
                        var toSearch = [];
                        $.each(value, function (value1) {
                            if (pk != value1) {
                                toSearch.push(value["" + value1]);
                            }
                        });
                        let isSelected = toSearch.some(searchValue => selectedValues.includes(searchValue));
                        // if (isSelected) {
                        //     selectedIDS.push(value["" + pk]);
                        // }
                        dropdownContainer.append('<div class="dropdown-item ' + dropdownClass + (isSelected ? ' selected' : '') + '" data-fieldID="' + fieldID + '" data-cname="' + where + '" data-value="' + value["" + pk] + '">' + toSearch.join("  ") + '</div>');
                    });
                    dropdownContainer.show();
                }
               
                let newdetails = {};
                let selectedIDSString = selectedIDS.join(',');
                newdetails[where] = selectedIDSString;
                selfobj.parentView.model.set(newdetails);
            }
        });
      });

      $('body').on('click', '.addNewCategory', function (e) {
        new categorySingleView({ searchCategory: fileObj, loadfrom: "dynamicForm",form_label: "Category"});
      });
    
      $('body').on('click', '.selectField', function (e) {
        let Name = $(e.currentTarget).text();
        let cname = $(e.currentTarget).attr('data-cname');
        let value = $(e.currentTarget).attr('data-value');
        let fieldID = $(e.currentTarget).attr("data-fieldID");
          $(e.currentTarget).text(Name); 
          $("#field_" + fieldID).hide();
          $('.valChange[data-fieldID="' + fieldID + '"]').val(Name);
          let newdetails = [];
          newdetails["" + cname] = value;
          selfobj.parentView.model.set(newdetails);
      });
    
      $('body').on('click', '.multiSelectField', function (e) {
        e.stopPropagation();
        let name = $(e.currentTarget).text();
        let value = $(e.currentTarget).attr('data-value');
        let cname = $(e.currentTarget).attr('data-cname');
        let fieldID = $(e.currentTarget).attr("data-fieldID");
        let selectedOptions = [];
        let selectedIDS = [];

        let inputText = $('.valChange').val();
        let inputTextArray = inputText.split(',').map(item => item.trim());

        if($(e.currentTarget).hasClass("selected")){
          $(e.currentTarget).removeClass("selected");
          if(name){
            let indexToRemove = inputTextArray.indexOf(name);
            if (indexToRemove !== -1) {
                inputTextArray.splice(indexToRemove, 1);
            }
          } 
        }else{
          $(e.currentTarget).addClass("selected");
          $('.multiSelectField.selected[data-fieldID="' + fieldID + '"]').each(function () {
            if (!selectedIDS.includes($(this).attr('data-value'))) {
              selectedIDS.push($(this).attr('data-value'));
            }
          });
        }
        selfobj.dataList.forEach(item => {
          let values = Object.values(item);
          if (inputTextArray.includes(values[1])) {
            if (!selectedIDS.includes(values[0])) {
              selectedIDS.push(values[0]);
            }
            if (!selectedOptions.includes(values[1])) {
              selectedOptions.push(values[1]);
            }
          }
        });
        selfobj.dataList.forEach(item => {
          let values = Object.values(item);
          if (selectedIDS.includes(values[0])) {
            if (!selectedOptions.includes(values[1])) {
              selectedOptions.push(values[1]);
            }
          }
        });
        let selectedOptionsString = selectedOptions.join(',');
        let selectedIDSString = selectedIDS.join(',');
        $('.valChange[data-fieldID="' + fieldID + '"]').val(selectedOptionsString);
        let newdetails = {};
        newdetails[cname] = selectedIDSString;
        selfobj.parentView.model.set(newdetails);
      });

      $(window).click(function () {
        $('.dropdown-content').hide();
      });

      if(this.parentView.makeRender){
        // this.parentView.render();
        this.parentView.initializeValidate();
      }else{
        //  this.parentView.render();
        this.parentView.initializeValidate();
      }
      
    },

    refreshCat: function () {
      let selfobj = this;
      selfobj.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'task_priority,task_type,task_status' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.parentView.render();
        selfobj.parentView.attachEvents();
      });
    },

    setupTextArea:function(){
      var selfobj = this;
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],      
        [{ 'header': 1 }, { 'header': 2 }],            
        [{ 'direction': 'rtl' }],                         
        [{ 'size': ['small', false, 'large', 'huge'] }], 
        [{ 'align': [] }],
        ['link'],
        ['clean']                                       
      ];
      $('body').find('.ws_rich_text').each(function(index, element) {
        var editor = new Quill(element, {
            modules: {
                toolbar: __toolbarOptions
            },
            theme: 'snow'
        });

        editor.on('text-change', function(delta, oldDelta, source) {
            if (source === 'user') {
                var justHtml = editor.root.innerHTML;
                var columnName = $(element).attr('name');
                var newdetails = {};
                newdetails[columnName] = justHtml;
                selfobj.parentView.model.set(newdetails);
            }
        });
      });
    },

    addValidationRule: function (dynamicField) {
      try {
        var fieldRule = {};
        var objectDetails = [];
        if( dynamicField.column_name !="" && (this.parentView.model.get(dynamicField.column_name) =="") || this.parentView.model.get(dynamicField.column_name) ==undefined){
          objectDetails["" + dynamicField.column_name] = null;
          this.parentView.model.set(objectDetails);
        }
        if (typeof this.rules[id] !== 'object' && this.rules[id] == null) {
          this.rules[id] = {};
        }
        if (dynamicField.maxLength != "0") {
          fieldRule.maxlength = dynamicField.maxLength;
        }
        if (dynamicField.minLength != "0") {
          fieldRule.minlength = dynamicField.minLength;
        }
        if (dynamicField.isRequired == "Yes") {
          fieldRule.required = true;
        }
        this.rules[id] = fieldRule;
      } catch (ex) {
        
      }
    },
    getValidationRule: function () {
      let selfobj= this;
      $("body").find(".datepickerBT").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: true,
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on("changeDate", function (e) {
        var valuetxt = $(this).val();
        var toID = $(this).attr("name");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        selfobj.parentView.model.set(newdetails);
      });

      $("body").find(".futureDatepickerBT").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: true,
        clearBtn: true,
        todayHighlight: true,
        startDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on("changeDate", function (e) {
        var valuetxt = $(this).val();
        var toID = $(this).attr("name");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        selfobj.parentView.model.set(newdetails);
      });

      $("body").find(".pastDatepickerBT").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: true,
        clearBtn: true,
        todayHighlight: true,
        endDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
       }).on("changeDate", function (e,dateText, inst) {
          var valuetxt = $(this).val();
          var toID = $(this).attr("name");
          var newdetails = [];
          newdetails["" + toID] = valuetxt;
          selfobj.parentView.model.set(newdetails);
      });

      $("body").find('.timepicker').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: function (time) {
          var valuetxt = $(this).val();
          var toID = $(this).attr("name");
          var newdetails = [];
          newdetails["" + toID] = valuetxt;
          selfobj.parentView.model.set(newdetails);
        }
      });
      $('body').off('blur', '.mobileNoChange');
      $('body').on('blur', '.mobileNoChange', function () {
        var value = $(this).val();
        var toID = $(this).attr("name");
        var newdetails = [];
        newdetails["" + toID] = value;
        var mobileRegex = /^\d{10}$/;
        if (mobileRegex.test(value)) {
            selfobj.parentView.model.set(newdetails);
        } else {
        }
      });
      $('body').off('blur', '.emailChange');
      $('body').on('blur', '.emailChange', function () {
        var value = $(this).val();
        if (value != "") {
          function validateEmail(email) {
            var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // let regex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;
            return regex.test(email);
          }
          if (validateEmail(value)) {
            var toID = $(this).attr("name");
            var newdetails = [];
            newdetails["" + toID] = value;
            selfobj.parentView.model.set(newdetails);
          } else {  
            alert("Invalid email address. Please enter a valid email.");
          }
        }else{
          var toID = $(this).attr("name");
          var newdetails = [];
          newdetails["" + toID] = value;
          selfobj.parentView.model.set(newdetails);
        }
      });
      return this.rules;
    },
    getform: function () {
      return this.$el;//selfobj.frmHTML; 
    },
  })
  return dynamicFieldRender;
})