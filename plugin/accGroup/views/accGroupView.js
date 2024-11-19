
define([
  'jquery',
  'underscore',
  'backbone',
  'datepicker',
  '../views/accGroupSingleView',
  '../collections/accGroupCollection',
  '../models/accGroupFilterOptionModel',
  'text!../templates/accGroupRow.html',
  'text!../templates/accGroup_temp.html',
  'text!../templates/accGroupFilterOption_temp.html',
], function($,_, Backbone,datepicker,accGroupSingleView,accGroupCollection,accGroupFilterOptionModel,accGroupRowTemp,accGroupTemp,accGroupFilterTemp){

var accGroupView = Backbone.View.extend({
     
    initialize: function(options){

        var selfobj = this;
        $(".profile-loader").show();
        var mname = Backbone.history.getFragment();
        permission = ROLE[mname];
        console.log(permission);
        readyState = true;
        this.render();
        filterOption = new accGroupFilterOptionModel();
        searchAccGroup = new accGroupCollection();
        searchAccGroup.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:'get'}).done(function(res){
          
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".profile-loader").hide();
          setPagging(res.paginginfo,res.loadstate,res.msg);
        });

      this.collection = searchAccGroup;
      this.collection.on('add',this.addOne,this);
      this.collection.on('reset',this.addAll,this);
    },
    events:
    {
      "blur #textval":"setFreeText",
      "change .range":"setRange",
      "change #textSearch":"settextSearch",
      "click .multiOptionSel":"multioption",
      "click #filterSearch": "filterSearch",
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
      console.log(filterOption);
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
      $('#accGroupList input:checkbox').each(function(){
          if($(this).is(":checked"))
          {
            console.log($(this).attr("data-accGroupID"));
            removeIds.push($(this).attr("data-accGroupID"));
          }
      });
      var idsToRemove = removeIds.toString();
      if(idsToRemove == ''){
        showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
        return false;
      }
        $.ajax({
            url:APIPATH+'accGroupMaster/status',
            method:'POST',
            data:{list:idsToRemove,action:action,status:status},
            datatype:'JSON',
             beforeSend: function(request) {
              $(e.currentTarget).html("<span>Updating..</span>");
              request.setRequestHeader("token",$.cookie('_bb_key'));
              request.setRequestHeader("SadminID",$.cookie('authid'));
              request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept",'application/json');
            },
            success:function(res){
              if(res.flag == "F")
                showResponse(e,res,'');

              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
              if(res.flag == "S"){
                 selfobj.collection.fetch({headers: {
                  'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
                    },error: selfobj.onErrorHandler}).done(function(res){
                      if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                      $(".profile-loader").hide();
                      selfobj.filterSearch();
                  });
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
          case "singleAccGroupData":{
            var accGroupID = $(e.currentTarget).attr("data-accGroupID");
            var accGroupsingleview = new accGroupSingleView({accGroupID:accGroupID,searchAccGroup:this});
            break;
          }
        }
    },
    resetSearch: function()
    {
      
        filterOption.set({curpage:0,accGroupID:null,textval: null,textSearch:'accGroupID',status:null,orderBy:'created_date',order:'DESC'});
        $(".multiOptionSel").removeClass("active");
        $("#textval").val("");
        $('#textSearch option[value=accGroupID]').attr('selected','selected');
        this.filterSearch();
    },
    loaduser:function(){
      var memberDetails  = new singlememberDataModel();
    },
    addOne: function(objectModel){
        var template = _.template(accGroupRowTemp);
        $("#accGroupList").append(template({accGroupDetails:objectModel}));
    },
    addAll: function(){
        $("#accGroupList").empty();
        this.collection.forEach(this.addOne,this);
    },
    filterRender:function(){
      $(".modal-dialog").removeClass("modal-lg");
      $(".modal-title").html("Filter Data");
      $(".modelbox").hide();
      if($('#filterData').length){
        $('#filterData').css("display","block");
      }else{
        var template = _.template(accGroupFilterTemp);
        $("#modalBody").append(template());
        $("#installDateFrom").datepicker({
          todayBtn:  1,
          autoclose: true,
          format:"yyyy/mm/dd",
        }).on('changeDate', function (selected) {
          var minDate = new Date(selected.date.valueOf());
          $('#installDateTo').datepicker('setStartDate', minDate);
        });
      
        $("#installDateTo").datepicker({format:"yyyy/mm/dd",autoclose: true})
          .on('changeDate', function (selected) {
              var minDate = new Date(selected.date.valueOf());
              $('#installDateFrom').datepicker('setEndDate', minDate);
        });
      }
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
            //console.log(classname[0]);
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
        //console.log(filterOption);
    },
    filterSearch: function(){
        $('#myModal').modal('hide');
        searchAccGroup.reset();
        var selfobj = this;
        readyState = true;
        filterOption.set({curpage: 0});
        var $element = $('#loadMember');
        
        $(".profile-loader").show();
       
        $element.attr("data-index",1);
        $element.attr("data-currPage",0);
       
        
        searchAccGroup.fetch({ headers:{
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
            } ,add: true, remove: false, merge: false,error: selfobj.onErrorHandler ,type:'post', data:filterOption.attributes}).done(function(res){
                if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                $(".profile-loader").hide();
                setPagging(res.paginginfo,res.loadstate,res.msg);  
                $element.attr("data-currPage",index);
                $element.attr("data-index",res.paginginfo.nextpage);

                $(".page-info").html(recset);
                if(res.loadstate === false){
                    $(".profile-loader-msg").html(res.msg);
                    $(".profile-loader-msg").show();
                }else{
                    $(".profile-loader-msg").hide();
                }
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
        searchAccGroup.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");
        
        filterOption.set({curpage: index});
        var requestData = filterOption.attributes;
        
          $(".profile-loader").show();
          searchAccGroup.fetch({ headers: {
              'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
            },add: true, remove: false, merge: false,type:'post',error: selfobj.onErrorHandler,data:requestData}).done(function(res){
              
              $(".profile-loader").hide();
              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
              setPagging(res.paginginfo,res.loadstate,res.msg);
              $element.attr("data-currPage",index);
              $element.attr("data-index",res.paginginfo.nextpage);
          });
      }
    },
    render: function(){
       
        var template = _.template(accGroupTemp);
        this.$el.html(template());
        $(".app_playground").append(this.$el);
        return this;
    }
});

  return accGroupView;
  
});
