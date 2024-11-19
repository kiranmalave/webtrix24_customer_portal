
define([
  'jquery',
  'underscore', 
  'backbone',
  'datepickerBT',
  'Swal',
  '../views/avablitySingleView',
  '../collections/avablityCollection',
  '../models/avablityFilterOptionModel',
  'text!../templates/avablityRow_temp.html',
  'text!../templates/avablity_temp.html',
  'text!../templates/avablityFilterOption_temp.html',
], function($,_, Backbone,datepickerBT,Swal,avablitySingleView,avablityCollection,avablityFilterOptionModel,avablityRow_Temp,avablityTemp,avablityFilterTemp){
 
var avablityView = Backbone.View.extend({
     
    initialize: function(options){
      this.toClose = "avablityFilterView";
        var selfobj = this;
        $(".profile-loader").show();
        var mname = Backbone.history.getFragment();
        permission = ROLE[mname];

        readyState = true;
        this.render();
        filterOption = new avablityFilterOptionModel();
        searchavablity = new avablityCollection();
        searchavablity.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:'post',data:filterOption.attributes}).done(function(res){
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".profile-loader").hide();
          $('body').find(".loder").hide();
          setPagging(res.paginginfo,res.loadstate,res.msg);
        });

      this.collection = searchavablity;
      this.collection.on('add',this.addOne,this);
      this.collection.on('reset',this.addAll,this);
    },
    events:
    {
      "blur #textval":"setFreeText",
      "change .range":"setRange",
      "change #textSearch":"settextSearch",
      "click .multiOptionSel":"multioption",
      "click .filterSearch": "filterSearch",
      "click #filterOption": "filterRender",
      "click .resetval":"resetSearch",
      "click .loadview":"loadSubView",
      "change .txtchange":"updateOtherDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
    },
    updateOtherDetails: function(e){

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];
      newdetails[""+toID]= valuetxt;
      filterOption.set(newdetails);
    },
    settextSearch: function(e){
      var usernametxt = $(e.currentTarget).val();
      filterOption.set({textSearch: usernametxt});
    },
    changeStatusListElement:function(e){
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      $('#avablityList input:checkbox').each(function(){
          if($(this).is(":checked"))
          {
            removeIds.push($(this).attr("data-eventID"));
          }
      });

      $(".action-icons-div").hide();
      $(".memberlistcheck").click(function() {
          if($(this).is(":checked")) {
              $(".action-icons-div").show(300);
          } else {
              $(".action-icons-div").hide(200);
          }
      });

      var idsToRemove = removeIds.toString();
      if(idsToRemove == ''){
        showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
        return false;
      }
        $.ajax({
            url:APIPATH+'avablityMaster/status',
            method:'POST',
            data:{list:idsToRemove,action:action,status:status},
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
                Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
              }
              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
              if(res.flag == "S"){
                selfobj.filterSearch();
              }
              setTimeout(function(){
                  $(e.currentTarget).html(status);
              }, 3000);
              
            }
          });
    },
    
    onErrorHandler: function(collection, response, options){
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
    },
    loadSubView:function(e){
        var selfobj = this;
        var show = $(e.currentTarget).attr("data-view");
        switch(show)
        {
          case "singleavablityData":{
            var eventID = $(e.currentTarget).attr("data-eventID");
            var avablitysingleView = new avablitySingleView({eventID:eventID,searchavablity:this});
            break;
          }
        }
    },
    resetSearch: function()
    {
        //filterOption.set({curpage:0,eventID:null,textval: null,textSearch:'avablityName',status:'active',orderBy:'createdDate',order:'DESC'});
        //filterOption.reset();
        filterOption.clear().set(filterOption.defaults);
        $(".multiOptionSel").removeClass("active");
        $("#textval").val("");
        $('#textSearch option[value=eventID]').attr('selected','selected');
        this.filterSearch(false);
    },
    loaduser:function(){
      var memberDetails  = new singlememberDataModel();
    },
    addOne: function(objectModel){
        var template = _.template(avablityRow_Temp);
        $("#avablityList").append(template({avablityDetails:objectModel}));
    },
    addAll: function(){
        $("#avablityList").empty();
        this.collection.forEach(this.addOne,this);
    },
    filterRender:function(e){
      var isexits = checkisoverlay(this.toClose);
      
      if(!isexits){
        
        var source = avablityFilterTemp;
        var template = _.template(source);
       
        var cont = $("<div>");
        cont.html(template());
        cont.attr('id',this.toClose);
        /*  
          INFO
          this line use to hide if any other overlay is open first close it.
        */
        $(".overlay-main-container").removeClass("open");
        // append filter html here
        $(".ws_filterOptions").append(cont);
        /*  
          INFO
          open filter popup by adding class open here
        */
        $(".ws_filterOptions").addClass("open");
        /* 
          INFO
          make current avablity active
        */
        $(e.currentTarget).addClass("active");
        // $("#installDateFrom").datepickerBT({
        //   todayBtn:  1,
        //   autoclose: true,
        //   format:"yyyy/mm/dd",
        // }).on('changeDate', function (selected) {
        //   var minDate = new Date(selected.date.valueOf());
        //   $('#installDateTo').datepickerBT('setStartDate', minDate);
        // });
      
        // $("#installDateTo").datepickerBT({format:"yyyy/mm/dd",autoclose: true})
        //   .on('changeDate', function (selected) {
        //       var minDate = new Date(selected.date.valueOf());
        //       $('#installDateFrom').datepickerBT('setEndDate', minDate);
        // });
      }else{
        // check here we alreay open it or not. if open toggle that popup here
        var isOpen = $(".ws_filterOptions").hasClass("open");
        if(isOpen){
          $(".ws_filterOptions").removeClass("open");
          $(e.currentTarget).removeClass("active");
          return;
        }else{
          $(e.currentTarget).addClass("active");
           // this function will handel other exiting open popus
        }
      }
      this.setValues();
      rearrageOverlays("Filter",this.toClose,"small");
    },
    setValues:function(e){
      setvalues = ["status","orderBy","order"];
      var selfobj = this;
      $.each(setvalues,function(key,value){
        var modval = filterOption.get(value);
        if(modval != null){
          var modeVal = modval.split(",");
        }else{ var modeVal = {};}

        $(".item-container li."+value).each(function(){
          var currentval = $(this).attr("data-value");
          var selecterobj = $(this);
          $.each(modeVal,function(key,dbvalue){
            if(dbvalue.trim().toLowerCase() == currentval.toLowerCase()){
              $(selecterobj).addClass("active");
            }
          });
        });
        
      });
      setTimeout(function(){
      if(e != undefined && e.type == "click")
      {
        var newsetval = [];
        var objectDetails = [];
        var classname = $(e.currentTarget).attr("class").split(" ");
        $(".item-container li."+classname[0]).each(function(){
          var isclass = $(this).hasClass("active");
          if(isclass){
            var vv = $(this).attr("data-value");
            newsetval.push(vv);
          }
        });
        if (0 < newsetval.length) {
          var newsetvalue = newsetval.toString();
        }
        else{var newsetvalue = "";}

        objectDetails[""+classname[0]] = newsetvalue;
        $("#valset__"+classname[0]).html(newsetvalue);
        filterOption.model.set(objectDetails);
      }
    }, 3000);
  },
    multioption: function(e){
      var selfobj = this;
        var issinglecheck = $(e.currentTarget).attr("data-single");
        if(issinglecheck == undefined){var issingle ="N"}else{var issingle ="Y"}
        if(issingle=="Y")
        {
          var newsetval = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          newsetval[""+classname[0]] = $(e.currentTarget).attr("data-value");
          filterOption.set(newsetval);
          
        }
        if(issingle=="N")
        {
          setTimeout(function(){
            var newsetval = [];
            var objectDetails = [];
            var classname = $(e.currentTarget).attr("class").split(" ");
            $(".item-container li."+classname[0]).each(function(){
              var isclass = $(this).hasClass("active");
              if(isclass){
                var vv = $(this).attr("data-value");
                newsetval.push(vv);
              }
            });

            if (0 < newsetval.length) {
              var newsetvalue = newsetval.toString();
            }
            else{var newsetvalue = "";}

            objectDetails[""+classname[0]] = newsetvalue;
            filterOption.set(objectDetails);
            }, 500);
        }
    },
    filterSearch: function(isClose=false){
      if(isClose && typeof isClose != 'object'){
        $('.'+this.toClose).remove();
        rearrageOverlays();
        //alert("sdfsf 222");
      }
      
      searchavablity.reset();
      var selfobj = this;
      readyState = true;
      filterOption.set({curpage: 0});
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index",1);
      $element.attr("data-currPage",0);
      
      searchavablity.fetch({ headers:{
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          } ,add: true, remove: false, merge: false,error: selfobj.onErrorHandler ,type:'post', data:filterOption.attributes}).done(function(res){
            if (res.flag == "F") {
              Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
            }
              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
              $(".profile-loader").hide();
              
            setPagging(res.paginginfo,res.loadstate,res.msg);  
            $element.attr("data-currPage",1);
            $element.attr("data-index",res.paginginfo.nextpage);

            //$(".page-info").html(recset);
            if(res.loadstate === false){
                $(".profile-loader-msg").html(res.msg);
                $(".profile-loader-msg").show();
            }else{
                $(".profile-loader-msg").hide();
            }
            
            selfobj.setValues();
      });
    },
      loadData: function(e){
        var selfobj = this;
        var $element = $('#loadMember');
        var cid = $(e.currentTarget).attr("data-dt-idx");
        var isdiabled = $(e.currentTarget).hasClass("disabled");
        if(isdiabled){
          //
        }else{

        $element.attr("data-index",cid);
        searchavablity.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");
        
        filterOption.set({curpage: index});
        var requestData = filterOption.attributes;
        
          $(".profile-loader").show();
          searchavablity.fetch({ headers: {
              'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
            },add: true, remove: false, merge: false,type:'post',error: selfobj.onErrorHandler,data:requestData}).done(function(res){
              if (res.flag == "F") {
                Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
              }
              $(".profile-loader").hide();
              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
              
              setPagging(res.paginginfo,res.loadstate,res.msg);  
              $element.attr("data-currPage",index);
              $element.attr("data-index",res.paginginfo.nextpage);
          });
      }
    },
    render: function(){
        var template = _.template(avablityTemp);
        this.$el.html(template({closeItem:this.toClose}));
        $(".app_playground").append(this.$el);
        return this;
    }
});

  return avablityView;
  
});
