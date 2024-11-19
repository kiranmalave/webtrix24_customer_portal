define([
  "jquery",
  "underscore",
  "backbone",
  "validate",
  "inputmask",
  'Swal',
  "../../core/views/multiselectOptions",
  "../../dynamicForm/views/dynamicFieldRender",
  "../collections/sectionCollection",
  "../collections/lessonCollection",
  "../views/lessonSingleView",
  "../views/sectionView",
  "../models/singleSectionModel",
  "../models/singleCourseModel",
  "text!../templates/sectionSingle.html",
  "text!../templates/lessonList.html",
], function (
  $,
  _,
  Backbone,
  validate,
  inputmask,
  Swal,
  multiselectOptions,
  dynamicFieldRender,
  sectionCollection,
  lessonCollection,
  lessonSingleView,
  sectionView,
  singleSectionModel,
  courseSingleModel,
  sectiontemp,
  lessonListTemp
) {
  var sectionSingleView = Backbone.View.extend({
    model: singleSectionModel,
    courseModel : courseSingleModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "sectionSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "courseList";
      this.lessonsArray = [];
      this.course_id = options.course_id;
      this.model.course_id = options.course_id;
      this.model = new singleSectionModel();
      this.courseModel = new  courseSingleModel();
      this.courseModel.set({'course_id':options.course_id});
      var selfobj = this;
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({
        ViewObj: selfobj,
        formJson: {},
      });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchCourse;
      $(".popupLoader").show();
      this.sectionList = new sectionCollection();
      this.sectionList.course_id = this.course_id;
      // this.lessonList = new lessonCollection();
      // this.lessonList.fetch({
      //   headers: {
      //     'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
      //   }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      // }).done(function (res) {
      //   if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
      //   $(".popupLoader").hide();
      //   selfobj.model.set("lessonList", res.data);
      //   selfobj.render();
      // });
      this.courseModel.fetch({headers: {
        'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler}).done(function(res){
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        // $(".popupLoader").hide();
      });
      this.getSectionList();
      selfobj.render();

      
    },
    getSectionList: function () {
      var selfobj = this;
      // this.sectionList.clear();
      this.sectionList
        .fetch({
          headers: {
            contentType: "application/x-www-form-urlencoded",
            SadminID: $.cookie("authid"),
            token: $.cookie("_bb_key"),
            Accept: "application/json",
          },
          error: selfobj.onErrorHandler,
          type: "post",
          data: { course_id: this.course_id, status: "active" ,getAll:'Y'},
        })
        .done(function (res) {
          if (res.statusCode == 994) {
            app_router.navigate("logout", { trigger: true });
            setPagging(res.paginginfo,res.loadstate,res.msg);    
          }
          $(".popupLoader").hide();
          selfobj.model.set("sectionList", res.data);
          
          selfobj.render();
        });
    },

    events: {
      "click .saveSectionDetails": "saveSectionDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "change .paid": "paid",
      "click .sectionload": "sectionload",
      "click .loadLessons": "loadLessons",
      "click .changeStatus": "changeStatus",
      "click .loadview": "loadSubView",
      "click .changeLessonStatus": "changeLessonStatus",
      "hover h4": "editDeleteOperation",
    },
    attachEvents: function () {
      this.$el.off("click", ".saveSectionDetails", this.saveSectionDetails);
      this.$el.on("click",".saveSectionDetails",this.saveSectionDetails.bind(this));
      this.$el.off("click", ".multiSel", this.setValues);
      this.$el.on("click", ".multiSel", this.setValues.bind(this));
      this.$el.off("change", ".bDate", this.updateOtherDetails);
      this.$el.on("change", ".bDate", this.updateOtherDetails.bind(this));
      this.$el.off("change", ".dropval", this.updateOtherDetails);
      this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));
      this.$el.off("blur", ".txtchange", this.updateOtherDetails);
      this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".sectionload", this.sectionload);
      this.$el.on("click", ".sectionload", this.sectionload.bind(this));
      this.$el.off("click", ".changeStatus", this.changeStatus);
      this.$el.on("click", ".changeStatus", this.changeStatus.bind(this));
      this.$el.off("click", ".loadLessons", this.loadLessons);
      this.$el.on("click", ".loadLessons", this.loadLessons.bind(this));
      this.$el.off("click", ".changeLessonStatus", this.changeLessonStatus);
      this.$el.on("click",".changeLessonStatus", this.changeLessonStatus.bind(this));
      this.$el.off("click", ".loadview", this.loadSubView);
      this.$el.on("click", ".loadview", this.loadSubView.bind(this));
      this.$el.off("hover", "operation", this.editDeleteOperation);
      this.$el.on("hover", "operation", this.editDeleteOperation.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      alert(
        "Something was wrong ! Try to refresh the page or contact administer. :("
      );
      $(".profile-loader").hide();
    },
    sectionload: function (e) {
      var sectionID = $(e.currentTarget).attr("data-sectionID");
      var selfobj = this;
      this.model.set({ section_id: sectionID });
      this.model
        .fetch({
          headers: {
            contentType: "application/x-www-form-urlencoded",
            SadminID: $.cookie("authid"),
            token: $.cookie("_bb_key"),
            Accept: "application/json",
          },
          error: selfobj.onErrorHandler,
        })
        .done(function (res) {
          if (res.statusCode == 994) {
            app_router.navigate("logout", { trigger: true });
          }
          $(".popupLoader").hide();
          selfobj.render();
          $("#updatebtn").html("<span>Update</span>");
        });
    },
    editDeleteOperation: function (e) {
      // $(".operation").hide();
    },
    loadLessons: function (e) {
      // var s_id = $(e.currentTarget).attr("id");
      // var t = s_id.split('_');
      // var section_id = t[1];
      // var selfobj = this;
      // this.lessonList = new lessonCollection();
      // this.lessonList.section_id=this.section_id;
      // $.ajax({
      //   url: APIPATH + 'lessonMasterList/'+this.lessonList.section_id,
      //   method: 'POST',
      //   data: { },
      //   datatype: 'JSON',
      //   beforeSend: function (request) {
      //     //$(e.currentTarget).html("<span>Updating..</span>");
      //     request.setRequestHeader("token", $.cookie('_bb_key'));
      //     request.setRequestHeader("SadminID", $.cookie('authid'));
      //     request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
      //     request.setRequestHeader("Accept", 'application/json');
      //   },
      //   success: function (res) {
      //     $( "#putLessonList" ).append( res );
      //     setTimeout(function () {
      //       $(e.currentTarget).html(status);
      //     }, 3000);
      //   }
      // });
      // $.ajax({
      //   type: "GET",
      //   dataType: 'json',
      //   url: "lessonMasterList/"+this.lessonList.section_id,
      //   cache: true
      // })
      //   .done(function( html ) {
      //     $( "#putLessonList" ).append( html );
      //   });
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");

      switch (show) {
        case "singleLessonData": {
          var lesson_id = $(e.currentTarget).attr("data-lesson_id");
          var section_id = $(e.currentTarget).attr("data-section_id");
          var course_id = $(e.currentTarget).attr("data-course_id");
          new lessonSingleView({lesson_id: lesson_id,section_id: section_id,course_id: course_id,searchLesson: this,sectionView: selfobj,});
          break;
        }
        case "sectionView":{
          var section_id = $(e.currentTarget).attr("data-sectionID");
          var course_id = $(e.currentTarget).attr("data-courseID");
          new sectionView({section_id:section_id,course_id:this.course_id,sectionView:selfobj});
          break;
        }
      }
    },
  
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);

      var e = this.course_id;
    },

    changeLessonStatus: function (e) {
      Swal.fire({
        title: "Delete Lesson ",
        text: "Do you want to delete lesson!!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      
      }).then((result) => {
        if (result.isConfirmed) {
          var selfobj = this;
          var removeId = $(e.currentTarget).attr("data-lessonID");
          var status = $(e.currentTarget).attr("data-action");
          var action = $(e.currentTarget).attr("data-action");
          if (removeId == "") {
           Swal.fire('Failed !','','Please select Lesson To Delete Properly');
            // alert("Please select Lesson To Delete Properly");
            return false;
          }
          $.ajax({
            url: APIPATH + "lesson/status",
            method: "POST",
            data: { lesson_id: removeId, action: action, status: status },
            datatype: "JSON",
            beforeSend: function (request) {
              //$(e.currentTarget).html("<span>Updating..</span>");
              request.setRequestHeader("token", $.cookie("_bb_key"));
              request.setRequestHeader("SadminID", $.cookie("authid"));
              request.setRequestHeader(
                "contentType",
                "application/x-www-form-urlencoded"
              );
              request.setRequestHeader("Accept", "application/json");
            },
            success: function (res) {
              if (res.flag == "F") showResponse(e,res,'');
    
              if (res.statusCode == 994) {
                app_router.navigate("logout", { trigger: true });
              }
              if (res.flag == "S") {
                $(".lessonView_"+removeId).remove();
                selfobj.getSectionList();
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);
            },
          });

        }else{

        }});
          
    },

    changeStatus: function (e) {
      var removeId = $(e.currentTarget).attr("data-sectionID");
          var status = $(e.currentTarget).attr("data-action");
          var action = $(e.currentTarget).attr("data-action");
      Swal.fire({
        title: "Delete Section ",
        text: "Do you want to delete section !!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete Section',
        animation: "slide-from-top",
      
      }).then((result) => {
        if (result.isConfirmed) {
          var selfobj = this;
            if (removeId == "") {
            alert("Please select Section To Delete Properly");
            return false;
          }
          $.ajax({
            url: APIPATH + "sections/status",
            method: "POST",
            data: { section_id: removeId, action: action, status: status },
            datatype: "JSON",
            beforeSend: function (request) {
              //$(e.currentTarget).html("<span>Updating..</span>");
              request.setRequestHeader("token", $.cookie("_bb_key"));
              request.setRequestHeader("SadminID", $.cookie("authid"));
              request.setRequestHeader(
                "contentType",
                "application/x-www-form-urlencoded"
              );
              request.setRequestHeader("Accept", "application/json");
            },
            success: function (res) {
              if (res.flag == "F") showResponse(e,res,'');
    
              if (res.statusCode == 994) {
                app_router.navigate("logout", { trigger: true });
              }
              if (res.flag == "S") {
                selfobj.getSectionList();
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);
            },
          });

      }});
      
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    closedetails: function () {
      this.render();
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        title: {
          required: true,
        },
        section_name: {
          required: true,
        },
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        // ...feilds,
        // ...dynamicRules
        // };
      }
      var messages = {
        title: "Please enter Course Name",
        section_name: "Please enter Section Name",
      };
      $("#sectionDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
    },
    sortSection:function(){
      $( ".sortable-sectionlist" ).sortable({
        connectWith: ".sortable-sectionlist",
        revert:true,
        update : function(event,ui)
        {
          var sIDs =[];
          var inds=[];
          var order = $('.sortable-sectionlist').sortable('toArray',{attribute:'data-section-id'});
          // console.log(order);
          order.forEach(function(val ,index){
           if(val!=''){
            sIDs.push(val);
            inds.push(index);
           }
          });
   
          var action = "changePositions"
          $.ajax({
            url: APIPATH + 'updateSectionPositions',
            method: 'POST',
            data: { action: action,section_ids :sIDs,index:inds },
            datatype: 'JSON',
            beforeSend: function (request) {
              // $(e.currentTarget).html("<span>Updating..</span>");
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F")
                showResponse('',res,'');
    
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            }
          });
        },
      

    }); 

      // var serializedData = window.JSON.stringify($(this).nestable('serialize'));
      // // setTimeout(function () { selfobj.savePostions(); }, 100);
    },
    sortlesson:function(){
      $( ".sortable_list " ).sortable({
        connectWith: ".sortable_list",
        revert:true,
        update : function(event,ui)
        {
          var sIDs =[];
          var inds=[];
          var elID = ui.item[0].id;
          var section_id = $("#"+elID).attr('data-section_id');
          console.log(section_id);
          var order = $('#putLessonList-'+section_id).sortable('toArray',{attribute:'data-lesson_id'});
          console.log(order);
          order.forEach(function(val ,index){
           if(val!=''){
            sIDs.push(val);
            inds.push(index);
           }
          });
          
          var action = "changePositions"
          $.ajax({
            url: APIPATH + 'updateLessonPositions',
            method: 'POST',
            data: { action: action,lesson_ids :sIDs,index:inds },
            datatype: 'JSON',
            beforeSend: function (request) {
              // $(e.currentTarget).html("<span>Updating..</span>");
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F")
                showResponse('',res,'');
              
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            }
          });
        },
      

    }); 

      // var serializedData = window.JSON.stringify($(this).nestable('serialize'));
      // // setTimeout(function () { selfobj.savePostions(); }, 100);
    },
    draggLessons:function(){
      var selfobj = this;
      $( ".sortable_list" ).sortable({
        connectWith: ".connectedsorted",
        revert:false,
        receive: function(event, ui) {
          var sectionID = this.id.replace('putLessonList-','');
          var elID = ui.item[0].id;
          var lessonID =  $("#"+elID).attr('data-lesson_id');
          selfobj.updateLessonSection(sectionID,lessonID,selfobj);
          // var sIDs =[];
          // var inds=[];
          // var order = $('.sortable_list').sortable('toArray',{attribute:'data-lesson_id'});
          // console.log(order);
          // order.forEach(function(val ,index){
          //   if(val!=''){
          //    sIDs.push(val);
          //    inds.push(index);
          //   }
          // });
        },
      });
    },
    updateLessonSection:function(sectionID,lessonID,selfobj)
    {
      $.ajax({
        url: APIPATH + "lesson/changeLessonSection",
        method: "POST",
        data: { section_id: sectionID,lesson_id : lessonID, action: "changeLessonSection"},
        datatype: "JSON",
        beforeSend: function (request) {
          //$(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token", $.cookie("_bb_key"));
          request.setRequestHeader("SadminID", $.cookie("authid"));
          request.setRequestHeader(
            "contentType",
            "application/x-www-form-urlencoded"
          );
          request.setRequestHeader("Accept", "application/json");
        },
        success: function (res) {
          if (res.flag == "F") showResponse('',res,'');
            if (res.statusCode == 994) {
              app_router.navigate("logout", { trigger: true });
            }
            if (res.flag == "S") {
              selfobj.getSectionList();
              selfobj.render();
            }

        },
      });
    },
    saveSectionDetails: function (e) {
      e.stopPropagation();
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("section_id");
      this.model.set({ course_id: this.course_id });
      let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#sectionDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model
          .save(
            {},
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                SadminID: $.cookie("authid"),
                token: $.cookie("_bb_key"),
                Accept: "application/json",
              },
              error: selfobj.onErrorHandler,
              type: methodt,
            }
          )
          .done(function (res) {
            if (res.statusCode == 994) {
              app_router.navigate("logout", { trigger: true });
            }
            if (res.flag == "F") showResponse(e,res,'');
            if (isNew == "new") {
              showResponse(e, res, "Save & New");
            } else {
              showResponse(e, res, "Save");
            }
            //scanDetails.filterSearch();
            if (res.flag == "S") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              selfobj.getSectionList();
              selfobj.render();
            }
          });
      }
    },
    
    render: function () {
      var source = sectiontemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(
        template({
          course_id : this.course_id,
          model: this.model.attributes,
          sectionList: this.sectionList.models,
          courseModel: this.courseModel.attributes
        })
      ); //, "lessonList": this.lessonList.models
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      
      $(".ws-tab").append(this.$el);
      // =============== Hover On Section
      $('.toEdit').hide();
      $('.panel-heading').hover(function(e)
      {
        
        var sectionID = $(e.currentTarget).attr("data-section-id");
        $('.toEdit-'+sectionID).show();

      },function(e)
      {
        var sectionID = $(e.currentTarget).attr("data-section-id");
          $('.toEdit-'+sectionID).hide();
      });
      $("#" + this.toClose).show();
      // this is used to append the dynamic form in the Add view html
      $("#dynamicFormFields")
        .empty()
        .append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      // $('.tohide').hide();
      $("select").selectpicker();
      rearrageOverlays("Course Sections", this.toClose);
      this.draggLessons();
      this.sortSection();
      this.sortlesson();
      var obj = this.sectionList.models;
      //var arr = Object.keys(obj).map(function (key) { return obj[key]; });
      var arr = _.values(obj);
      if (arr.length > 0) {
        for (i = 0; i < arr.length; i++) {
          let sid = arr[i].attributes.section_id;
          $.ajax({
            url: APIPATH + "lessonMasterList/" + sid,
            method: "POST",
            data: { section_id: sid, status: "active" },
            datatype: "JSON",
            beforeSend: function (request) {
              request.setRequestHeader("token",$.cookie('_bb_key'));
              request.setRequestHeader("SadminID",$.cookie('authid'));
              request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", "application/json");
            },
            success: function (res) {
              $("#putLessonList-" + sid).empty();
              $("#putLessonList-" + sid).append(res);
              var childrenCount = $('#putLessonList-'+sid).children().length;
              if(childrenCount<=0)
              {
                // $("#putLessonList-" + sid).css('height','30px');
                var lastEnd = " <div class='card  text-center'><div class='card-body'></div><h4 class='card-title text-warning'>Lessons Not Added</h4><h6 class='card-text text-center'>Click To Add Lessons</h6></div></div>";
                $("#"+sid).html(lastEnd);
              }else
              {
                let url ="";
                url = "<span id='lessonCount-<%=model1.attributes.section_id%>' class='countCourse' data-toggle='tooltip' title='Available Lesson'>Lessons: "+childrenCount+"</span>";
                $("#section_heading-"+sid).append(url)
              }
              $(".deleteButton").hide();
              $(".lesson-panel").hover(
                function (e) {
                  var lessonId = $(e.currentTarget).attr("data-lesson_id");
                  $("#" + lessonId).show();
                },
                function (e) {
                  var lessonId = $(e.currentTarget).attr("data-lesson_id");
                  $("#" + lessonId).hide();
                }
              );
              setTimeout(function () {
                //$(e.currentTarget).html(status);
              }, 3000);
            },
          });
        }
      }
      
      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });
  return sectionSingleView;
});
