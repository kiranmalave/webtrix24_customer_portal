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
  '../../dynamicForm/views/dynamicFieldRender',
  '../models/courseTriggerModel',
  '../collections/triggersCollection',
  '../collections/lessonsCollection',
  'text!../templates/courseTriggerTemp.html',
  'text!../templates/triggerRowTemp.html',

], function($,_, Backbone,validate,inputmask,datepickerBT,Swal,Quill,moment,multiselectOptions,dynamicFieldRender,courseTriggersModel,triggersCollection,lessonCollection,courseTriggerTemp,triggerRowTemp){


var triggerView = Backbone.View.extend({ 
    model:courseTriggersModel,
    initialize: function(options){
      this.toClose = "triggerView";
      this.course_id = options.course_id;
      // this.pluginName = "triggerList";
      // console.log(this.course_id);
      this.model = new courseTriggersModel();
      console.log(this.model.attributes);
      this.multiselectOptions = new multiselectOptions();
      this.model.set({"module_id":options.course_id});
      // this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}}); 
      this.lessons = new lessonCollection();
      var selfobj = this ;
      this.tempModel = new courseTriggersModel();
      this.triggerCollection = new triggersCollection();
      this.getTriggerList();
      // console.log(this.triggerCollection);
      this.lessons.course_id = options.course_id;
      this.lessons.fetch({headers: {
        'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler,type:'post',data:filterOption.attributes}).done(function(res){
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".profile-loader").hide();
        selfobj.render();
      });      
      this.render();
    },
    events:
    {
      "click .saveTrigger":"saveTrigger",
      "blur .txtchange":"updateOtherDetails",
      "click .multiSel":"setValues",
      "change .dropval":"updateOtherDetails",
      "blur .multiselectOpt": "updatemultiSelDetails",
    },
    attachEvents: function() {
      this.$el.off('click', '.saveTrigger', this.saveTrigger);
      this.$el.on('click', '.saveTrigger', this.saveTrigger.bind(this));
      this.$el.off('click', '.deleteTrigger', this.deleteTrigger);
      this.$el.on('click', '.deleteTrigger', this.deleteTrigger.bind(this));
      this.$el.off('click','.multiSel', this.setValues);
      this.$el.on('click','.multiSel', this.setValues.bind(this));
      this.$el.off('change','.dropval', this.updateOtherDetails);
      this.$el.on('change','.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('change','.dropval-i', this.updateDetails);
      this.$el.on('change','.dropval-i', this.updateDetails.bind(this));
      this.$el.off('blur','.txtchange', this.updateOtherDetails);
      this.$el.on('blur','.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('click', '.btnTriger', this.showTriger);
      this.$el.on('click', '.btnTriger', this.showTriger.bind(this));
      this.$el.off('click', '.btncancelTriger', this.cancelTriger);
      this.$el.on('click', '.btncancelTriger', this.cancelTriger.bind(this));
      this.$el.off('click', '.editTrigger', this.editTrigger);
      this.$el.on('click', '.editTrigger', this.editTrigger.bind(this));
      // this.$el.off('click', '.addNewTrigger', this.addNewTrigger);
      // this.$el.on('click', '.addNewTrigger', this.addNewTrigger.bind(this));
    },
    editTrigger:function(e){
      var schema_id =  $(e.currentTarget).attr('data-schemaID');

      if(typeof(schema_id) != undefined)
      {
        $('#fromEditDetails-'+schema_id).toggle();
      }
    },

    onErrorHandler: function(collection, response, options){
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
    },
    updateDetails: function(e){
      e.stopPropagation();
      var selfobj = this;
      
      if($(e.currentTarget).attr('data-triggerID')!== undefined)
      { 
        var triggerID = $(e.currentTarget).attr('data-triggerID');
        if(this.tempModel.get('schema_id')!= triggerID )
        {
          this.tempModel.clear().set(this.tempModel.defaults);
          this.tempModel.set({'schema_id': triggerID});
          var elements = $("#trigger-"+triggerID).find('.trigger-id-'+triggerID);
          var newdetails = [] ;
          elements.each(function(index,element){
            var val = $(element).val();
            var id = $(element).attr('id');
            newdetails[""+id] = val ;   
            selfobj.tempModel.set(newdetails);
          });
        }      

        if(this.tempModel.get('schema_id')== triggerID)
        {
          var valuetxt = $(e.currentTarget).val();
          var toID = $(e.currentTarget).attr("id");
          var newdetail = [];
          if(toID== 'end_date')         
          {
            const [month, day, year] = valuetxt.split('/');
            const date = year+"-"+month+"-"+day;
            newdetail[""+toID] = date;
          }else{
            newdetail[""+toID] = valuetxt;
          }
          this.tempModel.set(newdetail);
        }
        
        if(this.tempModel.get("action") === "complete")
        {
          $("#triggerDetails-"+triggerID+" #send_on option[value='before']").hide(); 
        }
        else
        {
          $("#triggerDetails-"+triggerID+" #send_on option[value='before']").show(); 
        }
          

        //interval type
        if( this.tempModel.get('inteval_type') == "week" )
        {
          $("#week-div-"+triggerID).show();
          $("#month-div-"+triggerID).hide();
          $("#day-div-"+triggerID).show();
          $("#year-div-"+triggerID).hide();
        }else if(this.tempModel.get('inteval_type') == "month" )
        {
          $("#week-div-"+triggerID).show();
          $("#month-div-"+triggerID).show();
          $("#day-div-"+triggerID).show();
          $("#year-div-"+triggerID).hide();
        }else if(this.tempModel.get('inteval_type') == "day")
        {
          $("#week-div-"+triggerID).hide();
          $("#month-div-"+triggerID).hide();
          $("#day-div-"+triggerID).show();
          $("#year-div-"+triggerID).hide();
        }else
        {
          $("#week-div-"+triggerID).hide();
          $("#month-div-"+triggerID).hide();
          $("#day-div-"+triggerID).hide();
          $("#year-div-"+triggerID).hide();
        }

      }
      //date condition
      if(this.tempModel.get('send_on')== "before" || this.tempModel.get('send_on')== "after" ){
        $("#interval-div-"+triggerID).show();
          if(this.tempModel.get("send_on") != "before")
            $("#stop-t-div-"+triggerID).show();
          else
            $("#stop-t-div-"+triggerID).hide();
      }else
      {
        $("#interval-div-"+triggerID).hide();
        $("#stop-t-div-"+triggerID).hide();
        $("#week-div-"+triggerID).hide();
        $("#month-div-"+triggerID).hide();
        $("#day-div-"+triggerID).hide();
        $("#year-div-"+triggerID).hide();
      }

      if(this.tempModel.get('stop_type') == "interval")
        $('.total-comp-inte-'+triggerID).show();
      else
        $(".total-comp-inte-"+triggerID).hide();
      
      if(this.tempModel.get('stop_type') == "date")
        $('.end-date-div-'+triggerID).show();
      else
        $(".end-date-div-"+triggerID).hide();

      setTimeout(this.saveCurrentDetails(e),1000);
    },
    // addNewTrigger : function(e){

    //   if( $(e.currentTarget).attr('toggle-val') == 'opn')
    //   {
    //     $('.newTriggerForm').show();
    //     $(e.currentTarget).attr('toggle-val','cls');
    //   }
    //  else
    //   {
    //     $('.newTriggerForm').hide();
    //     $(e.currentTarget).attr('toggle-val','opn') ;
    //   }
      
    // },
    showTriger : function(e)
    {
      $('#triggerDetails').show();
      $('.trigerCreate').hide();
      $('.btncancelTriger').show();
      $(e.currentTarget).hide();
    },
    cancelTriger:function(e){
      $('#triggerDetails').hide();
      $('.trigerCreate').hide();
      $(e.currentTarget).hide();
      $(".btnTriger").show();
    },
    saveCurrentDetails : function(e)
    {
      e.preventDefault();
      let selfobj = this;
      var methodt = 'POST';
      var tempModel = new courseTriggersModel();
      
      var schema_id = $(e.currentTarget).attr('data-triggerID');
      tempModel.set({'schema_id':schema_id});
      tempModel.set({'module_id':selfobj.course_id});
      
      var elements = $("#trigger-"+schema_id).find('.trigger-id-'+schema_id);
      var newdetails = [] ;
      elements.each(function(index,element){
        var val = $(element).val();
        var id = $(element).attr('id');
        if(id== 'end_date')         
        {
          var date = val;
          if(val.includes("/"))
          {
              const [month, day, year] = val.split('/');
              date = year+"-"+month+"-"+day;
          }
          newdetails[""+id] = date;
        }else{
          newdetails[""+id] = val;
        }
        tempModel.set(newdetails);
      });
      
      if($("#triggerDetails-"+schema_id).valid()){

        tempModel.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
      
          if(res.flag == "S"){
            selfobj.getTriggerList();
            // selfobj.tem.clear().set(selfobj.model.defaults);   
            }
        });
      }
  
    },

    updateOtherDetails: function(e){
      e.stopPropagation();
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
    
        var newdetails=[];
        if(toID== 'end_date')         
        {
          const [day, month, year] = valuetxt.split('/');
          const date = year+"-"+month+"-"+day;
          newdetails[""+toID] = date;
        }else{
          newdetails[""+toID] = valuetxt;
        }
        // newdetails[""+toID]= valuetxt;
        this.model.set(newdetails);
        // console.log(this.model);
        this.arrangeDropDown();
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

  arrangeDropDown : function()
  {
    var intervaltype = this.model.get("inteval_type");  
    var dateCondition = this.model.get("date_condition");
    if(this.model.get("trigger_type") == "on_lesson")
      $(".lessons-div").show();
    else
      $(".lessons-div").hide();

      if(this.model.get("send_on") == "before" || this.model.get("send_on") == "after"){
        $(".interval-t-div").show();
        if(this.model.get("send_on") != "before")
          $(".stop-t-div").show();
        else
          $(".stop-t-div").hide();
      }else{
        $(".interval-t-div").hide();  
        $(".stop-t-div").hide();
        $(".week-div").hide();
        $(".month-div").hide();
        $(".year-div").hide();
        $(".day-div").hide();
      } 
      
      if(this.model.get("action") === "complete")
        $("#triggerDetails #send_on option[value='before']").hide(); 
      else
        $("#triggerDetails #send_on option[value='before']").show(); 
  

    
    if(this.model.get("stop_type") == "date")
      $(".end-date-div").show();
    else
      $(".end-date-div").hide();
    
    if(this.model.get("stop_type") == "interval")
      $(".total-comp-inte").show();
    else
      $(".total-comp-inte").hide();

    switch (intervaltype) {
      case "week":

            $(".week-div").show();
            $(".month-div").hide();
            $(".day-div").show();
            $(".year-div").hide();
          
        break;
      case "day":
     
          $(".week-div").hide();
          $(".month-div").hide();
          $(".day-div").show();
          $(".year-div").hide(); 
        
        break;
      case "month":
 
          $(".week-div").show();
          $(".month-div").show();
          $(".day-div").show();
          $(".year-div").hide();
        
        break;
      case "year":
      
          $(".week-div").hide();
          $(".month-div").hide();
          $(".year-div").show();
          $(".day-div").hide();
        
        break;
      default:
        $(".week-div").hide();
        $(".month-div").hide();
        $(".year-div").hide();
        $(".day-div").hide();
      break;
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
      console.log("this.model", this.model);
    },

    getTriggerList : function () {
    var selfobj = this;
    this.triggerCollection.fetch({headers: {
      'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
    },error: selfobj.onErrorHandler,type:'post',data:{'module_id' : selfobj.course_id,'status':'active'}}).done(function(res){
      if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
      $(".profile-loader").hide();
      selfobj.render();
    });
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

    deleteTrigger : function(e)
    {
      var selfobj = this;
      var schema_id = $(e.currentTarget).attr('data-schemaID');
      var status = 'delete';
      var action = 'changeStatus';
      $.ajax({
        url:APIPATH+'triggerChangeStatus',
        method:'POST',
        data:{schema_id :schema_id ,action:action,status:status},
        datatype:'JSON',
         beforeSend: function(request) {
          //$(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token",$.cookie('_bb_key'));
          request.setRequestHeader("SadminID",$.cookie('authid'));
          request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept",'application/json');
        },
        success:function(res){
          if(res.flag == "F")
            Swal.fire('Failed', '', ''+res.msg);
          
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "S"){
            selfobj.getTriggerList();
            $('.changeStatus').hide();
            $('.checkall').prop('checked', false);
          }
          setTimeout(function(){
              $(e.currentTarget).html(status);
          }, 3000);
        }
      });
    },

    saveTrigger: function(e){
      e.preventDefault();
      let selfobj = this;
      if(permission.edit != "yes"){
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }

      if($(e.currentTarget).attr('data-schemaID')!== undefined)
      {
    
      }else{
        var mid = this.model.get("schema_id");
        if(mid == "" || mid == null){
          var methodt = "PUT";
        }else{
          var methodt = "POST";
        }
        if($("#triggerDetails").valid()){
          $(e.currentTarget).html("<span>Saving..</span>");
          $(e.currentTarget).attr("disabled", "disabled");
          this.model.save({},{headers:{
            'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            
            if(res.flag == "S"){
                // selfobj.model.clear().set(selfobj.model.defaults);
                $(e.currentTarget).html("<span>Save</span>");
                selfobj.getTriggerList();
                selfobj.render();
            }
          });
        }
      }
      // this.addtriggerRows();
      return;
    
    },

    initializeValidate:function(){
      
      var selfobj = this;
      var feilds = {
        trigger_name :{
          required:true
        },
        notification_type :{
          required:true
        },
        trigger_type:{
          required:true
        },
        action:{
          required:true
        },
        send_on:
        {
          required:true
        }

      };
      var feildsrules = feilds;
      var messages  = {
        notification_type: "Please select Notification Type ",
        trigger_type: "Please select Trigger Type ",
        action: "Please  select Action Type ",
        send_on: "Please select send on",
      };
      
      $("#triggerDetails").validate({
        rules: feilds,
        messages: messages
      });

    },

    addtriggerRows : function()
    {
      var template = _.template(triggerRowTemp);
      // console.log(this.triggerCollection.models);
      $('#triggerslist').empty().append(template({triggerslist : this.triggerCollection.models,lessonList: this.lessons.models}));
    },

    render: function(){
        var selfobj = this;
        var source = courseTriggerTemp;
        var template = _.template(source);
        $("#"+this.toClose).remove();
        this.$el.html(template({lessons : this.lessons.models }));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id',this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role","tabpanel");
        this.$el.data("current","yes");
        $(".ws-tab").append(this.$el);
        // $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
        $('#'+this.toClose).show();
        // $('.newTriggerForm').hide();
        this.addtriggerRows();

        // this is used to append the dynamic form in the single view html
        // Do call this function from dynamic module it self.
        this.initializeValidate();
        this.setOldValues();
        this.attachEvents();
        $('.ws-select').selectpicker();
        rearrageOverlays("Course Triggers",this.toClose);


        var truncateElements = document.querySelectorAll('.truncate');
        truncateElements.forEach(function(element) {
        var maxLength = 60;
            var text = element.textContent;
            if (text.length > maxLength) {
                element.textContent = text.substring(0, maxLength) + '...';
            }
        });

        return this;
    },
    onDelete: function(){
        this.remove();
    }
});
  return triggerView;
  
});
