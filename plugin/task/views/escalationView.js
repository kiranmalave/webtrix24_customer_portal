define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  'Quill',
  'moment',
  '../../core/views/multiselectOptions',
  '../../core/models/notificationSingleModel',
  '../../emailMaster/models/emailMasterSingleModel',
  '../../core/collections/notificationCollection',
  '../../admin/collections/adminCollection',
  '../../emailMaster/collections/emailMasterCollection',
  '../../emailMaster/views/emailMasterSingleView',
  '../../menu/collections/menuCollection',
  'text!../templates/escalation_temp.html',
  'text!../templates/escalationTable.html',
], function($,_, Backbone,validate,inputmask,datepickerBT,Swal,Quill,moment,multiselectOptions,notificationSingleModel,emailTempModel,notificationCollection,adminCollection,emailMasterCollection,emailMasterSingleView,menuCollection,escalation_temp,escalationTable){


var escalationView = Backbone.View.extend({ 
    model:notificationSingleModel,
    module_name : '',
    valid : false ,
    editor : {},
    assigneeEditor : {},
    columnlist : [],
    initialize: function(options){
      console.log(options);
      var selfobj = this;
      this.toClose = "escalationView";
      this.menuID = options.menuID;
      this.emailMenuID = '';
      this.emailTempID = '';
      this.filteredData = options.filteredData;
      module_name = selfobj.module_name;
      this.module_name = options.module_name;
      this.model = new notificationSingleModel();
      this.model.set({'module_name': this.module_name});
      this.model.set({ "record_type": "escalation" });
      this.emailTempModel = new emailTempModel();
      this.menuList = new menuCollection();
      this.notificationCollection = new notificationCollection();
      this.adminCollection = new adminCollection();
      this.multiselectOptions = new multiselectOptions();
      this.emailMasterList = new emailMasterCollection();
      this.menuList.fetch({
        headers: {
        'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
          res.data.forEach(function (menu) {
              if(menu.menuLink == 'emailMaster'){
                selfobj.emailMenuID = menu.menuID;
              }else{
                if(menu.subMenu.length > 0) {
                  menu.subMenu.forEach(menu1 => {
                    if(menu1.menuLink == 'emailMaster'){
                      selfobj.emailMenuID = menu1.menuID;
                    }
                  })
                }
              }
          });
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
      });

      this.conditionList = [
                            {"label": "Condition", "value": ""},
                            {"label": "Greater-than(>)", "value": ">"},
                            {"label": "Less-than(<)", "value": "<"},
                            {"label": "EqualTo(==)", "value": "="},
                            {"label": "Not equalTo(!=)", "value": "!="},
                            {"label": "Greater-than equalTo(>=)", "value": ">="},
                            {"label": "Less-than equalTo (<=)", "value": "<="},
                          ]
      this.logicalList = [
                          {"label": "Logical", "value": ""},
                          {"label": "AND(&&)", "value": "AND"},
                          {"label": "OR(||)", "value": "OR"},
                        ]
          
      this.getEmailTemp();
      this.getNotificationList();
      this.getColumnList();
      this.setSystemUser();
      this.render();
    },
    events:
    {
      "click .saveTrigger":"saveTrigger",
      "blur .txtchange":"updateOtherDetails",
      "click .multiSel":"setValues",
      "change .dropval":"updateOtherDetails",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "change .getTemplate": "updateTemplateDetails",
      "change .notifyDetails":"updateNotifyDetails",    
      "click #btnNotifications":"showCreateNot",    
      "change .notification_type":"notificationTypeUpdate",
      "input .assignChange": "getassignee",
      "click .selectAssignee": "setAssignee",
    },
    attachEvents: function() {
      this.$el.off('click', '.saveNotification', this.saveNotification);
      this.$el.on('click', '.saveNotification', this.saveNotification.bind(this));
      this.$el.off('click', '.editNotification', this.editNotification);
      this.$el.on('click', '.editNotification', this.editNotification.bind(this));
      this.$el.off('click', '.deleteNotification', this.deleteNotification);
      this.$el.on('click', '.deleteNotification', this.deleteNotification.bind(this));
      this.$el.off('click','.multiSel', this.setValues);
      this.$el.on('click','.multiSel', this.setValues.bind(this));
      this.$el.off('change','.dropval', this.updateOtherDetails);
      this.$el.on('change','.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur','.txtchange', this.updateOtherDetails);
      this.$el.on('blur','.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('click', '.btnNext', this.btnNext);
      this.$el.on('click', '.btnNext', this.btnNext.bind(this));
      this.$el.off('click', '.previous', this.previous);
      this.$el.on('click', '.previous', this.previous.bind(this));
      this.$el.off('change', '.getTemplate', this.updateTemplateDetails);
      this.$el.on('change', '.getTemplate', this.updateTemplateDetails.bind(this));
      this.$el.off('change','.notifyDetails', this.updateNotifyDetails);
      this.$el.on('change','.notifyDetails', this.updateNotifyDetails.bind(this));
      this.$el.off('change','.notification_type', this.notificationTypeUpdate);
      this.$el.on('change','.notification_type', this.notificationTypeUpdate.bind(this));
      this.$el.off('click','.column-field-val', this.setTemplateField);
      this.$el.on('click','.column-field-val', this.setTemplateField.bind(this));  
      this.$el.off('click','#btnNotifications', this.showCreateNot);
      this.$el.on('click','#btnNotifications', this.showCreateNot.bind(this));
      this.$el.off('input','.escAssignChange', this.getescAssignee);
      this.$el.on('input','.escAssignChange', this.getescAssignee.bind(this));  
      this.$el.off('click','.selectescAssignee', this.setescAssignee);
      this.$el.on('click','.selectescAssignee', this.setescAssignee.bind(this));
      this.$el.off('input','.assignChange', this.getassignee);
      this.$el.on('input','.assignChange', this.getassignee.bind(this));  
      this.$el.off('click','.selectAssignee', this.setAssignee);
      this.$el.on('click','.selectAssignee', this.setAssignee.bind(this));
    },

    getescAssignee: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#escAssigneeDropdown");
      var table = "admin";
      var where = "name";
      var list = "adminID, name";
      $.ajax({
        url: APIPATH + 'getAssigneeList/',
        method: 'POST',
        data: { text: name, tableName: table, wherec: where, list: list },
        datatype: 'JSON',
        beforeSend: function (request) {
          $(".textLoader").show();
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") {
            showResponse(e,res,'');
          }
          $(".textLoader").hide();
          dropdownContainer.empty();
          if (res.msg === "sucess" && res.data.length > 0) {
            $.each(res.data, function (index, value) {
              dropdownContainer.append('<div class="dropdown-item selectescAssignee" style="background-color: #ffffff;" data-assigneeID=' + value.adminID + '>' + value.name + '</div>');
            });
            dropdownContainer.show();
          }else{
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "asignee" style="background-color: #5D60A6; color:#ffffff;" > Add New Assignee </div>');
              dropdownContainer.show();
          }
        }
      });
    },

    setescAssignee: function (e) {
      let selfobj = this;
      var Name = $(e.currentTarget).text();
      var assigneeID = $(e.currentTarget).attr('data-assigneeID');
      $('.escAssignChange').val(Name);
      $("#escAssigneeDropdown").hide();
      selfobj.model.set({ "escalate_to": assigneeID });
    },

    getassignee: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#assigneeDropdown");
      var table = "admin";
      var where = "name";
      var list = "adminID, name";
      $.ajax({
        url: APIPATH + 'getAssigneeList/',
        method: 'POST',
        data: { text: name, tableName: table, wherec: where, list: list },
        datatype: 'JSON',
        beforeSend: function (request) {
          $(".textLoader").show();
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") {
            showResponse(e,res,'');
          }
          $(".textLoader").hide();
          dropdownContainer.empty();
          if (res.msg === "sucess" && res.data.length > 0) {
            $.each(res.data, function (index, value) {
              dropdownContainer.append('<div class="dropdown-item selectAssignee" style="background-color: #ffffff;" data-assigneeID=' + value.adminID + '>' + value.name + '</div>');
            });
            dropdownContainer.show();
          }else{
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "asignee" style="background-color: #5D60A6; color:#ffffff;" > Add New Assignee </div>');
              dropdownContainer.show();
          }
        }
      });
    },

    setAssignee: function (e) {
      let selfobj = this;
      var Name = $(e.currentTarget).text();
      var assigneeID = $(e.currentTarget).attr('data-assigneeID');
      $('.assignChange').val(Name);
      $("#assigneeDropdown").hide();
      selfobj.model.set({ "assignee_id": assigneeID });
      console.log("selfobj.model",selfobj.model);
    },

    showCreateNot : function(e){
      $(e.currentTarget).hide();
      $('.escalationTable').hide();
      $("#escalationDetails").show();
      $('.defaultAssignee').hide();
    },

    updateTemplateDetails: function () { 
      var selfobj = this;
      var valuetxt = selfobj.model.get('template_id'); 
      selfobj.emailTempModel.set({'tempID' : valuetxt}); 
      if(selfobj.emailTempModel.get('tempID') != '')
      {
        selfobj.emailTempModel.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },data:{ menuId:selfobj.emailMenuID },error: selfobj.onErrorHandler}).done(function(res){
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          var emailCnt = res ? res.data[0] ? res.data[0].emailContent : undefined : undefined;
          var smsContent = res ? res.data[0] ? res.data[0].smsContent : undefined : undefined;
          $("#emailContentN").val('');
          
          $("#emailContentN").empty().append(emailCnt);
          $("#PreviewSMS").empty().append(smsContent);

          $("#assigneeEmailContentN").val('');
          $("#assigneePreviewSMS").empty().append(smsContent);
          
          var __toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'align': [] }],
            ['link'],
              ['clean']                                         // remove formatting button
          ]; 

          // if($("#emailContentN").hasClass('ql-container'))
          // { 
          //   $(".ql-toolbar").remove();
          // }

          selfobj.editor = new Quill($("#emailContentN").get(0),{
            modules: {
                toolbar: __toolbarOptions
            },  
            theme: 'snow'  // or 'bubble'
          });  

          selfobj.editor.on('text-change', function(delta, oldDelta, source) {
            if (source == 'api') {
                console.log("An API call triggered this change.");
              } else if (source == 'user') {
                var delta = selfobj.editor.getContents();
                var text = selfobj.editor.getText();
                var justHtml = selfobj.editor.root.innerHTML;
                selfobj.emailTempModel.set({"menuId":selfobj.emailMenuID});
                selfobj.emailTempModel.set({"emailContent":justHtml});
                selfobj.emailTempModel.save({},{headers:{
                  'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
                },error: selfobj.onErrorHandler,type:"POST" }).done(function(res){
                  if (res.flag == "F") {
                    showResponse('',res,'');
                  }
                  if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                  if(res.flag == "S"){
                    // selfobj.getEmailTemp();
                  }        
                });
            }
          });

          if($("#assigneeEmailContentN").hasClass('ql-container'))
          { 
            $(".ql-toolbar").remove();
          }

          selfobj.assigneeEditor = new Quill($("#assigneeEmailContentN").get(0),{
            modules: {
                toolbar: __toolbarOptions
            },  
            theme: 'snow'  // or 'bubble'
          });  

          selfobj.assigneeEditor.on('text-change', function(delta, oldDelta, source) {
            if (source == 'api') {
                console.log("An API call triggered this change.");
              } else if (source == 'user') {
                var delta = selfobj.editor.getContents();
                var text = selfobj.editor.getText();
                var justHtml = selfobj.editor.root.innerHTML;
                selfobj.emailTempModel.set({"menuId":selfobj.emailMenuID});
                selfobj.emailTempModel.set({"emailContent":justHtml});
                selfobj.emailTempModel.save({},{headers:{
                  'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
                },error: selfobj.onErrorHandler,type:"POST" }).done(function(res){
                  if (res.flag == "F") {
                    showResponse('',res,'');
                  }
                  if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                  if(res.flag == "S"){
                    // selfobj.getEmailTemp();
                  }        
                });
            }
          });
        });
      }
    },

    previous: function () {
      var activeTab = document.querySelector('.active-tab');
      var previousTab;
      $('.saveNotification').hide();
      $('.btnNext').show();
      if (activeTab) {
          previousTab = activeTab.previousElementSibling;
          if (previousTab && previousTab.classList.contains('tab-contents')) {             
              activeTab.classList.remove('active-tab');
              previousTab.classList.add('active-tab');
              if(previousTab.getAttribute('id') == 'tab1'){
                $('.previous').attr('disabled', true);
              }
          } else {
              console.log("No next tab available");
          }
      } else {
          // If no tab is currently active, add active-tab to the first tab
          var firstTab = document.querySelector('.tab-contents');
          if (firstTab) {
              firstTab.classList.add('active-tabPre');
          } else {
              console.log("No tab is currently available");
          }
      }
    },
  
    btnNext: function () {
      var activeTab = document.querySelector('.active-tab');
      var nextTab;
      this.valid= this.validateNotification(activeTab.id)
      if(!this.valid)
        return;     
      if (activeTab) {
          nextTab = activeTab.nextElementSibling;
          if (nextTab && nextTab.classList.contains('tab-contents')) {
              activeTab.classList.remove('active-tab');
              nextTab.classList.add('active-tab');
              if($(nextTab).attr('id') == 'tab3')
              {
                $('.saveNotification').show();
                $('.btnNext').hide();
              }
              if($(activeTab).attr('id') == 'tab1')
              {
                $('.previous').removeAttr('disabled');
              }
            
          } else {
              console.log("No next tab available");             
          }

      } else {
          // If no tab is currently active, add active-tab to the first tab
          var firstTab = document.querySelector('.tab-contents');
          if (firstTab) {
              firstTab.classList.add('active-tab');
          } else {
              console.log("No tab is currently available");
          }
      }
    },

    editNotification: function (e) {
      selfobj = this;
      var id = $(e.currentTarget).attr('data-notificationID');
      this.model.set({ notification_id: id });
      this.model.fetch({
          headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse(e,res,'');
        }
          selfobj.render();
          $('#escalationDetails').show();
          $('.escalationTable').hide();
          $('#btnNotifications').hide();
      });
      
    },
    
    getEmailTemp : function(){
      selfobj = this;
      this.emailMasterList.fetch({
      headers: {
        'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
      }, error: selfobj.onErrorHandler, data: { getAll: 'Y',status:'active'}
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
    },

    onErrorHandler: function(collection, response, options){
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
    },
    
    validateNotification : function(activeTab)
    {
      if(activeTab == "tab1")
      {
        if(this.model.get('name') == '' || this.model.get('name') == null )
        {
          showResponse('',{ flag:'F' , msg: 'Escalation Name required' },'');
          return false;
        }
        // if(this.model.get('esc_time_hrs') == '' || this.model.get('esc_time_hrs') == null)
        // {
        //   alert('user type required');
        //   return false;
        // }
        // if(this.model.get('user_type') == 'system_user')
        // {
        //   if( this.model.get('sys_user_id') == '' || this.model.get('sys_user_id') == null || !this.model.has('sys_user_id'))
        //   {
        //     alert('system user required');
        //     return false;
        //   }
        // }
        return true;
      }
      if(activeTab == "tab2")
      {
        if(this.model.get('notification_type') == '' || this.model.get('notification_type') == null )
        {
          showResponse('',{ flag:'F' , msg: 'notification type required' },'');
          return false;
        }
        if(this.model.get('template_id') == '' || this.model.get('template_id') == null )
        {
          showResponse('',{ flag:'F' , msg: 'template required' },'');
          return false;
        }
        return true;
      }
      if(activeTab == "tab3")
      {
        // if(this.model.get('action_on') == '' || this.model.get('action_on') == null )
        // {
        //   alert('action type required');
        //   return false;
        // }else{
        //   if(this.model.get('action_on') == 'update'){
        //     // if(this.model.get('field_name') == '' ||this.model.get('field_name') == null ){
        //     //   alert('field name required');
        //     //   return false;
        //     // }
        //     // if(this.model.get('field_value') == '' ||this.model.get('field_value') == null ){
        //     //   alert('Field value required');
        //     //   return false;
        //     // }
        //   }
        // } 
        return true;
      }
    },
    getColumnList : function()
    {
      var selfobj = this ;
      $.ajax({
        url: APIPATH + "getDefinations",
        method: "POST",
        data: { menuID: this.menuID, status: "active" },
        datatype: "JSON",
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          selfobj.columnlist = res.data; 
          selfobj.columnlist = selfobj.columnlist.filter(model => {
            const field = model.Field;
            return !selfobj.filteredData.includes(field);
          });
          selfobj.render();
        },
      });
    },

    getNotificationList : function () {
      var selfobj = this;
      this.model.set({ "record_type": "escalation" });
      this.notificationCollection.fetch({headers: {
        'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler,type:'post',data:{'module_name' : selfobj.module_name,'record_type' : selfobj.model.get("record_type")}}).done(function(res){
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".profile-loader").hide();
        selfobj.render();
      });
    },
  
    updateOtherDetails: function(e){
      e.stopPropagation();
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];    
      newdetails[""+toID] = valuetxt;
      if(toID == 'template_id'){
        if (valuetxt == "addEmailTemp") {
          new emailMasterSingleView({ searchemailMaster: this, loadfrom: "escalationView" , form_label : "Email Templates", notification_id : this.model.get('notification_id') });
          return;
        }
        selfobj.emailTempID = valuetxt;
        this.emailTempModel.set({'tempID' : valuetxt});
      }
      this.model.set(newdetails);
      if(toID =="field_name"){
        $('.on_FieldSelect').show();
        var currentRow = $(e.currentTarget).closest('.fieldsSelection');
        this.setShowHideElm(currentRow,true);
        // this.arrangeDropDown();
      }
      if(this.model.get('user_type') == "system_user")
      {
        $('.sys-user-div').show();
      }else{
        $('.sys-user-div').hide();
      }
    },
   
    notificationTypeUpdate:function(e){
      e.stopPropagation();
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("class");
      var newdetails=[];
      
      if($(e.currentTarget).is(':checked')){
        newdetails[""+toID] = valuetxt;  
      }else{
        newdetails[""+toID] = "";
      }
      this.model.set(newdetails);

      if(this.model.get('notification_type') == 'Email' ){
        {
          $('#checkbox1').prop('checked', false);
          $('#checkbox2').prop('checked', false);
        }
      }
      if(this.model.get('notification_type') == 'SMS' ){
        {
          
          $('#checkbox2').prop('checked', false);
          $('#checkbox').prop('checked', false);
        }
      }
      if(this.model.get('notification_type') == 'Both' ){
        {
          $('#checkbox1').prop('checked', true);
          $('#checkbox').prop('checked', true);
        }
      }
      if(this.model.get('notification_type') == '' ){
        {
          $('#checkbox2').prop('checked', false);
          $('#checkbox1').prop('checked', false);
          $('#checkbox').prop('checked', false);
        }
      }
      
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
      
    },

    updateRadioValues:function() {
      var selectedOption = document.getElementById("action_on").value;
      document.getElementById("Add").value = selectedOption;
      document.getElementById("Update").value = selectedOption;
      document.getElementById("delete").value = selectedOption;
    },

    // Example of event binding
    updateNotifyDetails:function(e) {
      var value  = $(e.currentTarget).val();
      if(value == "yes"){
        $('.assigneeDiv').show();
        $('.assigneeEmailTemp').show();
      }else{
        $('.assigneeDiv').hide();
        $('.assigneeEmailTemp').hide();
      }
      this.model.set('is_assignee_change', $(e.currentTarget).val());
    },

    setTemplateField : function(e){
      selfobj = this;
      $('.column-field-val .toolt').remove();
      text = $(e.currentTarget).text();
      $(e.currentTarget).append('<span class="toolt" >copied</span>');
      text = "{{"+text+"}}";
      selfobj.copyToClipboard(text);
    },
    copyToClipboard :function(element) {
      var $temp = $("<input>");
      $("body").append($temp);
      $temp.val(element).select();
      document.execCommand("copy");
      $temp.remove();
    },

    setSystemUser : function()
    {
      var selfobj = this;
      this.adminCollection.fetch({headers: {
        'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler,type:'post',data: {getAll : 'Y',status : 'active', roleType : 'Admin'}}).done(function(res){
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".profile-loader").hide();
        selfobj.render();
      });
    },
    arrangeDropDown : function(){
      $(".notifyBtn").hide();
      var action_type = this.model.get("action_on"); 
      if(action_type == 'update'){
        $('.on_update').show();
        $(".addRecords").show();
        // this.setEnums();
      }else {
        $('.on_FieldSelect').hide();
        $(".on_addFields").hide();
        // $('.field-condition').hide();
        // $('.field-enum').hide();
        // $('.field-text').hide();
        // $('.on_status').hide();
        // $('.field_value').empty();
        $('.on_update').hide();
      }
    },
    setEnums : function()
    {
      var feilds = this.model.get("field_name"); 
      var feildval = this.model.get("field_value"); 
      this.columnlist.forEach(column => {
        if(column.Field == feilds)
        {
          if(column.Type.includes('enum') )
          {
            $('.field-condition').show();
            $('.field-enum').show();
            $('.field-text').hide();
            $('.on_status').show();
            $('select.field_value').empty();
            let matches = column.Type.match(/'([^']*)'/g);
            let enums =  matches.map(match => match.replace(/'/g, '')); 
            enums.forEach(enu => {
              if(feildval != enu)
              { 
                $('select.field_value').append($('<option>', {
                  value: enu,
                  text: enu
                }));
              }else
              {
                $('select.field_value').append($('<option>', {
                  value: enu,
                  text: enu,
                  selected : true
                }));
              }
            });
          }else {
            $('.field-condition').show();
            $('.on_status').hide();
            // $('.field-text').show();
            $('.field-value').val('');
            $('.field-enum').hide();
          }
        }
      });
    },
    setShowHideElm: function (currentRow,fieldDetail) {
      // Check if currentRow is defined
      if (currentRow) {
          var feildval = '';
          var feilds = currentRow.find('#field_name').val();
          if (this.columnlist && this.columnlist.length > 0) {
              var column = this.columnlist.find(column => column.Field === feilds);
              if (column) {
                  if(fieldDetail == true){
                    currentRow.find('#condition_value').val("");
                    currentRow.find('#logical_value').val("");
                    currentRow.find('#field_value').val("");
                  }
                  if (column.Type.includes('enum')) {
                    if(fieldDetail == true){
                      currentRow.find('.field-enum #field_value').val("");
                    }
                      currentRow.find('.field-condition, .field-enum').show();
                      currentRow.find('.field-text').hide();
                      currentRow.find('.on_status').show();
                      currentRow.find('select.field_value').empty();
  
                      let matches = column.Type.match(/'([^']*)'/g);
                      let enums = matches.map(match => match.replace(/'/g, ''));
  
                      enums.forEach(enu => {
                          if (feildval !== enu) {
                              currentRow.find('select.field_value').append($('<option>', {
                                  value: enu,
                                  text: enu
                              }));
                          } else {
                              currentRow.find('select.field_value').append($('<option>', {
                                  value: enu,
                                  text: enu,
                                  selected: true
                              }));
                          }
                      });
                  } else {
                    if(fieldDetail == true){
                      currentRow.find('.field-text #field_value').val("");
                    }
                      currentRow.find('.field-condition').show();
                      currentRow.find('.on_status').hide();
                      currentRow.find('.field-text').show();
                      currentRow.find('.field-enum').hide();
                  }
              } else {
                  console.error("Column not found in columnlist for field:", feilds);
              }
          } else {
              console.error("Columnlist is undefined or empty");
          }
      } else {
          console.error("currentRow is undefined");
      }
    },

    appendNotficationList : function()
    {      
      var template = _.template(escalationTable);
      $('#notification_div').append(template({notificationList : this.notificationCollection.models}));
      
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
    deleteNotification : function(e)
    {
      var selfobj = this;
      var notification_id = $(e.currentTarget).attr('data-notificationid');
      var status = 'delete';
      var action = 'changeStatus';
      $.ajax({
        url:APIPATH+'notificationMaster/status',
        method:'POST',
        data:{list :notification_id ,action:action,status:status},
        datatype:'JSON',
         beforeSend: function(request) {
          //$(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token",$.cookie('_bb_key'));
          request.setRequestHeader("SadminID",$.cookie('authid'));
          request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept",'application/json');
        },
        success:function(res){
          if (res.flag == "F") {
            showResponse(e,res,'');
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "S"){

            selfobj.model.set(selfobj.model.defaults);
            selfobj.model.set({'module_name':selfobj.module_name});
            selfobj.model.set({ "record_type": "escalation" });
            selfobj.getNotificationList();
            selfobj.render();
          }
          setTimeout(function(){
              $(e.currentTarget).html(status);
          }, 3000);
        }
      });
    },

    saveNotification: function(e){
      e.preventDefault();
      $("#escalationDetails").hide();
      
      let selfobj = this;
      if(permission.edit != "yes"){
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      selfobj.model.set({ "record_type": "escalation" });

      var hours = $('#esc_time_hrs').val();
      var minutes = $('#esc_time_mins').val();
      var days = $('#esc_time_days').val();

      var escalationTime = days + "," + hours + "," + minutes;

      selfobj.model.set({"escalation_time": escalationTime});

      var mid = this.model.get("notification_id");
      if(mid == "" || mid == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#escalationDetails").valid() && this.validateNotification("tab3")){
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if (res.flag == "F") {
            showResponse(e,res,'');
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          
          if(res.flag == "S"){
              // selfobj.model.clear().set(selfobj.model.defaults);
              $(e.currentTarget).html("<span>Save</span>");
              selfobj.model.set(selfobj.model.defaults);
              selfobj.model.set({'module_name': selfobj.module_name});
              selfobj.model.set({ "record_type": "escalation" });
              $('#escalationDetails').hide();
              selfobj.getNotificationList();
              selfobj.render();
          }
        });
      }else
      {
        $('#escalationDetails').show();
        return;
      }
      return;
    },
    initializeValidate:function(){
      var selfobj = this;
      var feilds = {
        name :{
          required:true
        },
        notification_type :{
          required:true
        },
        template_id:{
          required:true
        },
        action_on:{
          required:true
        },
        user_type:
        {
          required:true
        }

      };
      var feildsrules = feilds;
      var messages  = {
        notification_type: "Please select Notification Type ",
        user_type: "Please select User Type ",
        action_on: "Please  select Action  ",
        template_id: "Please select Template",
        name: "Please Enter Name",
      };
      
      $("#triggerDetails").validate({
        rules: feilds,
        messages: messages
      });

    },
  
    render: function(){
        var selfobj = this;
        $(".loder").hide();
        var source = escalation_temp;
        var template = _.template(source);
        $("#"+this.toClose).remove();
        this.$el.html(template({notificationList : this.notificationCollection.models ,emailTemps : this.emailMasterList.models,columnlist:selfobj.columnlist ,model : this.model.attributes , adminList : this.adminCollection.models}));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id',this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role","tabpanel");
        this.$el.data("current","yes");
        $(".ws-tab").append(this.$el);
        $('#'+this.toClose).show();
        $("#notifyView").remove();
        handelClose('notifyView');
        rearrageOverlays("Escalation",this.toClose);
        this.initializeValidate();
        this.arrangeDropDown();
        this.setOldValues();
        this.attachEvents();
        $('.ws-select').selectpicker();
        this.appendNotficationList();
        this.updateTemplateDetails();
        $('.saveNotification').hide();
        return this;
    },
    onDelete: function(){
        this.remove();
    }
});
  return escalationView;
  
});
