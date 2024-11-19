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
    '../models/notificationSingleModel',
    '../collections/notificationCollection',
    '../../admin/collections/adminCollection',
    'text!../templates/notify_temp.html',
    'text!../templates/notifyTable.html',
    'text!../templates/notifyAddFields.html',
    'text!../templates/notifyFields.html',
], function($,_, Backbone,validate,inputmask,datepickerBT,Swal,Quill,moment,multiselectOptions,notificationSingleModel,notificationCollection,adminCollection,notify_temp,notifyTable,notifyAddFields,notifyFields){
  
    var notifyView = Backbone.View.extend({ 
        model:notificationSingleModel,
        valid : false ,
        editor : {},
        columnlist : [],
        rowCounter : 1,
        initialize: function(options){
            this.toClose = "notifyView";
            this.filteredData = options.filteredData;
            this.menuID = options.menuID;
            this.module_name = options.module_name;
            this.model = new notificationSingleModel();
            this.model.set({'module_name': this.module_name});
            this.model.set({ "record_type": "notification" });
            this.notificationCollection = new notificationCollection();
            this.adminCollection = new adminCollection();
            this.multiselectOptions = new multiselectOptions();
    
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
                
            this.getNotificationList();
            this.getColumnList();
            this.setSystemUser();
            this.render();
        },

        events:
        {
            "blur .txtchange":"updateOtherDetails",
            "click .multiSel":"setValues",
            "change .dropval":"updateOtherDetails",
            "click #btnNotifications":"showCreateNot",    
            "change .notification_type":"notificationTypeUpdate",
            "click .addFieldsToTrigger":"addFieldsToTrigger",
            "click .removeFields":"removeFields",    
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
            this.$el.off('click', '.btnNext', this.btnNext);
            this.$el.on('click', '.btnNext', this.btnNext.bind(this));
            this.$el.off('click', '.previous', this.previous);
            this.$el.on('click', '.previous', this.previous.bind(this));
            this.$el.off('change','.notification_type', this.notificationTypeUpdate);
            this.$el.on('change','.notification_type', this.notificationTypeUpdate.bind(this));
            this.$el.off('click','#btnNotifications', this.showCreateNot);
            this.$el.on('click','#btnNotifications', this.showCreateNot.bind(this));  
            this.$el.off('click','.addFieldsToTrigger', this.addFieldsToTrigger);
            this.$el.on('click','.addFieldsToTrigger', this.addFieldsToTrigger.bind(this));
            this.$el.off('click','.removeFields', this.removeFields);
            this.$el.on('click','.removeFields', this.removeFields.bind(this));  
        },

        showCreateNot : function(){
            $('#notificationDetails').show();
            $('.emptyNotificationImg').hide();
            $('#notification_div').hide();
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
            var template = _.template(notifyFields);
            var id = $(e.currentTarget).attr('data-notificationID');
            this.model.set({ notification_id: id });
            this.model.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler
            }).done(function (res) {
                if (res.flag == "F") showResponse(e,res,'');
                selfobj.render();
                $('#notificationDetails').show();
                $('#notification_div').hide();
                var fields = [];
                // console.log("json_data...",Object.entries(res.data[0].json_data).length);
                if (Object.entries(res.data[0].json_data).length > 2) {
                // if (res.data[0].json_data != "" && res.data[0].json_data != null && res.data[0].json_data != undefined && res.data[0].json_data != {}) {
                // console.log("json_data...334454",res.data[0].json_data);
                $('.on_FieldSelect').show();
                $(".on_addFields").show();
                $(".addRecords").hide();
                $(".notifyBtn").show();
                    let tempData = JSON.parse(res.data[0].json_data);
                    for (const [key, value] of Object.entries(tempData)) {
                        fields.push(value);
                        $(".selectFields").append(template({
                            rowCounter: key,
                            fieldDetails: fields,
                            columnlist: selfobj.columnlist,
                            conditionList: selfobj.conditionList,
                            logicalList: selfobj.logicalList,
                        })).show();
                        fields = [];
                    }
                }
            });
        },
        
        onErrorHandler: function(collection, response, options){
            Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
            $(".profile-loader").hide();
        },

        validateNotification : function(activeTab){
            if(activeTab == "tab1"){
                if(this.model.get('name') == '' || this.model.get('name') == null ){
                    showResponse('',{"flag":"F","msg":'notification Name required'},'');
                    return false;
                }
                if(this.model.get('user_type') == '' || this.model.get('user_type') == null){
                    showResponse('',{"flag":"F","msg":'user type required'},'');
                    return false;
                }
                if(this.model.get('user_type') == 'system_user'){
                    if( this.model.get('sys_user_id') == '' || this.model.get('sys_user_id') == null || !this.model.has('sys_user_id')){
                        showResponse('',{"flag":"F","msg":'system user required'},'');
                        return false;
                    }
                }
                return true;
            }
            if(activeTab == "tab2"){
                if(this.model.get('notification_type') == '' || this.model.get('notification_type') == null ){
                    showResponse('',{"flag":"F","msg":'notification type required'},'');
                    return false;
                }
                return true;
            }
            if(activeTab == "tab3"){
                return true;
            }
        },

        getColumnList : function() {
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
                        if (res.flag == "F") showResponse('',res,'');
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
            this.notificationCollection.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
            },error: selfobj.onErrorHandler,type:'post',data:{'module_name' : selfobj.module_name,'record_type' : selfobj.model.get("record_type")}}).done(function(res){
                if (res.flag == "F") showResponse('',res,'');
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
            this.model.set(newdetails);
            if(toID == "field_name"){
            $('.on_FieldSelect').show();
            var currentRow = $(e.currentTarget).closest('.fieldsSelection');
            this.setShowHideElm(currentRow);
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
    
        setSystemUser : function() {
            var selfobj = this;
            this.adminCollection.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
            },error: selfobj.onErrorHandler,type:'post',data: {getAll : 'Y',status : 'active', roleType : 'Admin'}}).done(function(res){
                if (res.flag == "F") showResponse('',res,'');
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".profile-loader").hide();
            selfobj.render();
            });
        },
        
        setShowHideElm: function (currentRow) {
            if (currentRow) {
                var feildval = '';
                var feilds = currentRow.find('#field_name').val();
                if (this.columnlist && this.columnlist.length > 0) {
                    var column = this.columnlist.find(column => column.Field === feilds);
                    if (column) {
                            currentRow.find('#condition_value').val("");
                            currentRow.find('#logical_value').val("");
                            currentRow.find('#field_value').val("");
                        if (column.Type.includes('enum')) {
                            currentRow.find('.field-enum #field_value').val("");
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
                            currentRow.find('.field-text #field_value').val("");
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
    
        appendNotficationList : function() {      
            var template = _.template(notifyTable);
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

        deleteNotification : function(e){
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
                if (res.flag == "F") showResponse(e,res,'');
                
                if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                if(res.flag == "S"){
    
                selfobj.model.set(selfobj.model.defaults);
                selfobj.model.set({'module_name':selfobj.module_name});
                selfobj.model.set({ "record_type": "notification" });
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
            $("#notificationDetails").hide();
            let selfobj = this;
            if(permission.edit != "yes"){
            Swal.fire("You don't have permission to edit", '', 'error');
            return false;
            }
            var alertShown = false;
            var jsonForm = {};
            var rowCount = $("body").find(".fieldsSelection").length;
            if(rowCount == 0){
                showResponse('',{"flag":"F","msg":'Please add atleast one record'},'');
                alertShown = true;
              }
            if(rowCount > 0){
            $("body").find('.fieldsSelection').each(function (index, row) {
                var rowId = 'row' + (index + 1);
                const columnNameElement = $(row).find('#field_name');
                const columnName = columnNameElement.val();
                if(!columnName){
                    showResponse('',{"flag":"F","msg":'field name required'},'');
                    alertShown = true;
                    return false;
                }else{
                    alertShown = false;
                }
                const selectedOption = columnNameElement.find('option:selected');
                const columnType = selectedOption.attr('data-type');
                const startIndex = columnType.indexOf("(");
                const extractedType = startIndex !== -1 ? columnType.substring(0, startIndex) : columnType;
                const conditionalOpElement = row.querySelector('#condition_value');
                const conditionalOp = conditionalOpElement ? conditionalOpElement.value : '';
                if(!conditionalOp){
                    showResponse('',{"flag":"F","msg":'field condition required'},'');
                    alertShown = true;
                    return;
                }else{
                    alertShown = false;
                }
                let valueElement = null;
            
                const fieldTextInput = row.querySelector('.field-text #field_value');
                const fieldEnumSelect = row.querySelector('.field-enum #field_value');
                const optionsArray = [];
                optionsArray.length = 0;
                if (fieldTextInput && fieldTextInput.value) {
                    valueElement = fieldTextInput;
                } else if (fieldEnumSelect && fieldEnumSelect.value) {
                    valueElement = fieldEnumSelect;
                    const enumOptions = fieldEnumSelect.querySelectorAll('option');
                    enumOptions.forEach(option => {
                        if(option.value){
                        optionsArray.push(option.value);
                        }
                    });
                }
                const valueElm = valueElement ? valueElement.value : '';
                if(!valueElm){
                    showResponse('',{"flag":"F","msg":'field value required'},'');
                    alertShown = true;
                    return;
                }else{
                    alertShown = false;
                }
                const logicalOpElement = row.querySelector('#logical_value');
                const logicalOp = logicalOpElement ? logicalOpElement.value : '';
                if(document.querySelectorAll('.fieldsSelection').length > 1){
                    if (index !== document.querySelectorAll('.fieldsSelection').length - 1) {
                    if(!logicalOp){
                        showResponse('',{"flag":"F","msg":'field logical operator required'},'');
                        alertShown = true;
                        return false; 
                    }else{
                        alertShown = false;
                    }
                    }
                }
                jsonForm[rowId] = { columnName: columnName,columnType: extractedType, conditionalOp: conditionalOp, value: valueElm, logicalOp: logicalOp, optionsArray: optionsArray ? optionsArray : []};
            }); 
            }       
            if (alertShown) {
            $("#notificationDetails").show();
            return false;
            } else {
            var jsonString = JSON.stringify(jsonForm);
            selfobj.model.set({'json_data': jsonString})
            selfobj.model.set({ "record_type": "notification" });
            var mid = this.model.get("notification_id");
            if(mid == "" || mid == null){
                var methodt = "PUT";
            }else{
                var methodt = "POST";
            }
            if($("#notificationDetails").valid() && this.validateNotification("tab3")){
                $(e.currentTarget).html("<span>Saving..</span>");
                $(e.currentTarget).attr("disabled", "disabled");
                this.model.save({},{headers:{
                'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
                },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
                if (res.flag == "F") showResponse(e,res,'');
                if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                if(res.flag == "S"){
                    $(e.currentTarget).html("<span>Save</span>");
                    selfobj.model.set(selfobj.model.defaults);
                    selfobj.model.set({'module_name': selfobj.module_name});
                    selfobj.model.set({ "record_type": "notification" });
                    $('#notificationDetails').hide();
                    selfobj.getNotificationList();
                    selfobj.render();
                }
                });
            }else
            {
                $('#notificationDetails').show();
                return;
            }
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
            user_type:
            {
                required:true
            }
    
            };
            var messages  = {
            notification_type: "Please select Notification Type ",
            user_type: "Please select User Type ",
            name: "Please Enter Name",
            };
            
            $("#triggerDetails").validate({
            rules: feilds,
            messages: messages
            });
    
        },
    
        addFieldsToTrigger:function(){
            $(".on_addFields").show();
            $(".addRecords").hide();
            $(".notifyBtn").show();
            var selfobj = this;
            var lastChildId = $('.selectFields .fieldsSelection:last').attr('id');
            if(lastChildId){
            var numericPart = lastChildId.match(/\d+/);
            this.rowCounter = numericPart[0];
            }else{
            this.rowCounter = 0;
            }
            this.rowCounter++;
            var template = _.template(notifyAddFields);
            $(".selectFields").append(template({columnlist: selfobj.columnlist,rowCounter : this.rowCounter,conditionList: selfobj.conditionList,logicalList: selfobj.logicalList}));
            $('.ws-select').selectpicker();
        },
    
        removeFields: function (e) {
            e.preventDefault();
            var container = $(e.currentTarget).closest(".selectFields");
            var rowCount = container.find(".fieldsSelection").length;
            $(e.currentTarget).closest(".fieldsSelection").remove();
            if (rowCount == 1) {
            $('.on_FieldSelect').hide();
            $(".on_addFields").hide();
            $(".addRecords").show();
            $(".notifyBtn").hide();
            }
        },
        
        render: function(){
            var selfobj = this;
            $("#notificationView").remove();
            handelClose('notificationView');
            $(".loder").hide();
            var source = notify_temp;
            var template = _.template(source);
            $("#"+this.toClose).remove();
            this.$el.html(template({notificationList : this.notificationCollection.models ,columnlist:selfobj.columnlist ,model : this.model.attributes , adminList : this.adminCollection.models}));
            this.$el.addClass("tab-pane in active panel_overflow");
            this.$el.attr('id',this.toClose);
            this.$el.addClass(this.toClose);
            this.$el.data("role","tabpanel");
            this.$el.data("current","yes");
            $(".ws-tab").append(this.$el);
            $('#'+this.toClose).show();
            rearrageOverlays("Notification",this.toClose);
            this.initializeValidate();
            this.setOldValues();
            this.attachEvents();
            $('.ws-select').selectpicker();
            this.appendNotficationList();
            $('.saveNotification').hide();
            return this;
        },

        onDelete: function(){
            this.remove();
        }
    });
    return notifyView; 
});
  