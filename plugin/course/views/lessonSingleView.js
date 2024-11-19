define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  'timepicker',
  'moment',
  'Quill',
  'RealTimeUpload',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../models/courseFilterOptionModel',
  '../collections/lessonCollection',
  '../collections/courseMediaCollection',
  '../models/singleLessonModel',
  '../views/sectionsingleView',
  '../../readFiles/views/readFilesView',
  'text!../templates/lessonSingle.html',

], function ($, _, Backbone, validate, inputmask, datepickerBT,Swal, timepicker, moment,Quill, RealTimeUpload, multiselectOptions, dynamicFieldRender, courseFilterOptionModel, lessonCollection,courseMediaCollection, singleLessonModel,sectionSingleView, readFilesView, lessonSingle) {


  var lessonSingleView = Backbone.View.extend({
    model: singleLessonModel,
    lessonId:'',
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "lessonSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "lessonList";
      //this.model.set({course_id:options.course_id});
      
      this.section_id = options.section_id;
      this.course_id = options.course_id;
     
      this.model = new singleLessonModel();
      this.model.set({"mediaArr":[]});
      var selfobj = this;
      selfobj.data = Array();
      
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchLesson;
      sectionView = options.sectionView;
      this.mediaFiles = new courseMediaCollection();                   
      // this.filterOption = new courseFilterOptionModel();

      // this.filterOption.set({ folderID: this.course_id });
      // this.filterOption.set({ mType: "course" });
      // reqData = this.filterOption;
      this.mediaFiles.reset();
     

      $(".popupLoader").show();

      if (options.lesson_id != "") {
        this.model.set({ lesson_id: options.lesson_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      }
      
      this.lessonId = this.model.lesson_id;
      this.getMediaList();
      this.render();
      //this.listenTo(this.model, 'sync',this.render);
      //this.listenTo(this.courseList, 'sync', this.render);
    },
    getMediaList:function()
    {
      selfobj = this;
      this.mediaFiles.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: { 'course_id' :this.course_id,'lesson_id':this.model.attributes.lesson_id}
      }).done(function (res) {
        selfobj.data = res.data;
        $(".profile-loader").hide();
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        
        selfobj.render();
        // setPagging(res.paginginfo, res.loadstate, res.msg);
        // $element.attr("data-currPage", index);
        // $element.attr("data-index", res.paginginfo.nextpage);
      });
    }
    ,
    events:
    {
      "click .saveLessonDetails": "saveLessonDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
      "click .loadMedia": "loadMedia",
      "click .loadMedia1": "loadMedia",
      "click .changeLessonStatus": "changeLessonStatus",
      "click #closeTab": "loadSection",
    },
    attachEvents: function () {
      this.$el.off('click', '.saveLessonDetails', this.saveLessonDetails);
      this.$el.on('click', '.saveLessonDetails', this.saveLessonDetails.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off("click", ".loadMedia", this.loadMedia);
      this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
      this.$el.off("click", ".loadMedia1", this.loadMedia);
      this.$el.on("click", ".loadMedia1", this.loadMedia.bind(this));
      this.$el.off("click", "#closeTab", this.loadSection);
      this.$el.on("click", "#closeTab", this.loadSection.bind(this));
      this.$el.off('click', '.changeLessonStatus', this.changeLessonStatus);
      this.$el.on('click', '.changeLessonStatus', this.changeLessonStatus.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["upload_type", "video_type", "live_type", "start_date"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    showAttached: function (model) {
      var selfobj = this;
      $(".ws-datatype").hide();
      $(".ws-live_type").hide();
      $(".ws-youtube").hide();
      $(".ws-custom_link").hide();
      $(".ws-vimeo").hide();
      $(".ws-dragbox1").hide();
      $(".ws-start-available").hide();
      $(".ws-live_class").hide();
      $(".ws-webinar").hide();
      $(".ws-youtube_class").hide();
      $(".ws-meeting").hide();
      $(".ws-zoom_webinar").hide();
      $(".ws-end-available").hide();
      $(".ws-dragbox").hide();
      if (model.upload_type == "pdf") {
        $(".ws-dragbox").show();
      }else if (model.upload_type == "custom_link") {
        $(".ws-custom_link").show();
      } else if (model.upload_type == "video") {
        $(".ws-datatype").show();
        if (model.video_type == "youtube") {
          $('#youtube').prop(':checked',true);
          $(".ws-youtube").show();
          $(".ws-datatype").show();
        } else if (model.video_type == "vimeo") {
          $(".ws-vimeo").show();
          $(".ws-datatype").show();
        } else if (model.video_type == "frame") {
          $(".ws-dragbox1").show();
          $(".ws-datatype").show();
        } 
      } else if (model.upload_type == "live") {
        $(".ws-live_type").show();
        if (model.live_type == "live_class") {
          $(".ws-live_class").show();
          $(".ws-start-available").show();
          // $("#start_date").val("");
          // $("#start_time").val("");
          $(".ws-live_type").show();
        } else if (model.live_type == "webinar") {
          $(".ws-webinar").show();
          $(".ws-start-available").show();
          // $("#start_date").val("");
          // $("#start_time").val("");
          $(".ws-live_type").show();
        } else if (model.live_type == "youtube_class") {
          $(".ws-youtube_class").show();
          $(".ws-start-available").show();
          // $("#start_date").val("");
          // $("#start_time").val("");
          $(".ws-end-available").show();
          $(".ws-live_type").show();
        } else if (model.live_type == "meeting") {
          $(".ws-meeting").show();
          $(".ws-start-available").show();
          //  $("#start_date").val("");
          //  $("#start_time").val("");
          $(".ws-live_type").show();
        } else if (model.live_type == "zoom_webinar") {
          $(".ws-zoom_webinar").show();
          $(".ws-start-available").show();
          // $("#start_date").val("");
          // $("#start_time").val("");
          $(".ws-live_type").show();
        }
      } 
     
    
    },
    setValues: function (e) {
      var selfobj = this;
      var model = this.model.attributes;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      $(".ws-datatype").hide();
      $(".ws-live_type").hide();
      $(".ws-youtube").hide();
      $(".ws-custom_link").hide();
      $(".ws-vimeo").hide();
      $(".ws-dragbox1").hide();
      $(".ws-start-available").hide();
      $(".ws-live_class").hide();
      $(".ws-webinar").hide();
      $(".ws-youtube_class").hide();
      $(".ws-meeting").hide();
      $(".ws-zoom_webinar").hide();
      $(".ws-end-available").hide();
      $(".ws-dragbox").hide();
      //------------------------------------------------- upload
      if (da.upload_type == "pdf") {
        $(".ws-dragbox").show();
      }else if (da.upload_type == "custom_link") {
        $(".ws-custom_link").show();

      } else if (da.upload_type == "video") {
        $(".ws-datatype").show();
        if (model.video_type == "youtube") {
          $('#youtube').prop(':checked',true);
          $(".ws-youtube").show();
          $(".ws-datatype").show();
        } else if (model.video_type == "vimeo") {
          $(".ws-vimeo").show();
          $(".ws-datatype").show();
        } else if (model.video_type == "frame") {
          $(".ws-dragbox1").show();
          $(".ws-datatype").show();
        } 
      } else if (da.upload_type == "live") {
        $(".ws-live_type").show();
        if (model.live_type == "live_class") {
          $(".ws-live_class").show();
          $(".ws-start-available").show();
          $(".ws-live_type").show();
        } else if (model.live_type == "webinar") {
          $(".ws-webinar").show();
          $(".ws-start-available").show();
          $(".ws-live_type").show();
        } else if (model.live_type == "youtube_class") {
          $(".ws-youtube_class").show();
          $(".ws-start-available").show();
          $(".ws-end-available").show();
          $(".ws-live_type").show();
        } else if (model.live_type == "meeting") {
          $(".ws-meeting").show();
          $(".ws-start-available").show();
          $(".ws-live_type").show();
        } else if (model.live_type == "zoom_webinar") {
          $(".ws-zoom_webinar").show();
          $(".ws-start-available").show();
          $(".ws-live_type").show();
        }
      } 

      //------------------------------------------------- video
      if (da.video_type == "youtube") {
        $(".ws-youtube").show();
        $(".ws-datatype").show();
        selfobj.render();
      } else if (da.video_type == "vimeo") {
        $(".ws-vimeo").show();
        $(".ws-datatype").show();
        selfobj.render();

      } else if (da.video_type == "frame") {
        $(".ws-dragbox1").show();
        $(".ws-datatype").show();
        selfobj.render();

      }
      //-------------------------------------------------live
      if (da.live_type == "live_class") {
        $(".ws-live_class").show();
        $(".ws-start-available").show();
        $(".ws-live_type").show();
      } else if (da.live_type == "webinar") {
        $(".ws-webinar").show();
        $(".ws-start-available").show();
        $(".ws-live_type").show();
      } else if (da.live_type == "youtube_class") {
        $(".ws-youtube_class").show();
        $(".ws-start-available").show();
        $(".ws-end-available").show();
        $(".ws-live_type").show();
      } else if (da.live_type == "meeting") {
        $(".ws-meeting").show();
        $(".ws-start-available").show();
         $(".ws-live_type").show();
      } else if (da.live_type == "zoom_webinar") {
        
        $(".ws-zoom_webinar").show();
        $(".ws-start-available").show();
        $(".ws-live_type").show();
      }
      //----------------------------------------------live
    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      // if (url.indexOf('course') > -1)
      // {
      //   alert("hello found inside your_string");
      //   $("#lesson_pic_view").attr("src",url);
      //   $("#lesson_pic_view").css({"max-width":"100%"});
      //   $('#largeModal1').modal('toggle');
      // }
      // else{
      //   $("#profile_pic_view").attr("src",url);
      //   $("#profile_pic_view").css({"max-width":"100%"});
      //   $('#largeModal').modal('toggle');
      // }
      if (this.elm == 'lesson_pic')
        this.model.set({ "course_file": url });
      else
        this.model.set({ "cover_image": url });
      $('#largeModal').modal('toggle');
      this.render();
    },
    loadMedia: function (e) {
      e.stopPropagation();
      let wid = $(e.currentTarget).attr("id");
      $('#largeModal').modal('toggle');
      if (wid == 'typehead') {
        this.elm = "lesson_pic";
        new readFilesView({ loadFrom: "addpage", loadController: this, folderID: 2, folderName: 'course' });
      }
      else {
        this.elm = "profile_pic";
        new readFilesView({ loadFrom: "addpage", loadController: this, mnFolder: 'Y' });
      }
      //console.log(this.elm);
      //this.render();        
    },
    returnFile: function (e) {
      var url = $(e.currentTarget).attr("data-url");
      this.loadController.getSelectedFile(url);
    },
    // uploadFiles :function()
    // {
    //   console.log(this.model.attributes);
    //   var newName = UPLOADS +"/course/"+this.model.attributes.course_id+"/"+this.model.attributes.section_id+"/"+this.model.attributes.lesson_id;
    //   var oldName = UPLOADS+"/course/"+this.model.attributes.course_id+"/"+this.model.attributes.section_id+"/temp-"+this.model.attributes.course_id+"-"+this.model.attributes.section_id;

    //   console.log(newName);
    //   console.log(oldName);return;
    //   $.ajax({
    //     url: APIPATH + "renameDir/"+oldName+"/"+newName,
    //     method: "POST",
    //     data: {},
    //     datatype: "JSON",
    //     beforeSend: function (request) {
    //       //$(e.currentTarget).html("<span>Updating..</span>");
    //       request.setRequestHeader("token", $.cookie("_bb_key"));
    //       request.setRequestHeader("SadminID", $.cookie("authid"));
    //       request.setRequestHeader(
    //         "contentType",
    //         "application/x-www-form-urlencoded"
    //       );
    //       request.setRequestHeader("Accept", "application/json");
    //     },
    //     success: function (res) {
    //       if (res.flag == "F") showResponse(e,res,'');
    //       if (res.statusCode == 994) {
    //         app_router.navigate("logout", { trigger: true });
    //       }
    //       if (res.flag == "S") {
    //         // alert("Section Deleted Successfully!");
    //         // selfobj.getSectionList();
    //         // selfobj.render();
    //       }
    //       setTimeout(function () {
    //         $(e.currentTarget).html(status);
    //       }, 3000);
    //     },
    //   });

    // },
    saveLessonDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("lesson_id");
      this.model.set({ "section_id": this.section_id });
      this.model.set({ "course_id": this.course_id });
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
      // this.uploadFiles();
      if ($("#lessonDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") showResponse(e,res,'');
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          //scanDetails.filterSearch();
          if (res.flag == "S") {
              if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              selfobj.render();
            } else {
              sectionView.render();  
              handelClose(selfobj.toClose);
              
            }
          //  selfobj.updateMedia();
              // new sectionSingleView({section_id:selfobj.section_id,course_id:selfobj.course_id,searchCourse:this}); 
          }
        });
      }
    },

    changeLessonStatus:function(e){
      var selfobj = this;
      var removeId = $(e.currentTarget).attr("lessonID");
      var status = $(e.currentTarget).attr("data-action");
      var action = $(e.currentTarget).attr("data-action");
      if(removeId == ''){
        alert("Please select Lesson To Delete Properly");
        return false;
      }
        $.ajax({
            url:APIPATH+'lesson/status',
            method:'POST',
            data:{lesson_id:removeId,action:action,status:status},
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
                showResponse(e,res,'');
    
              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
              if(res.flag == "S"){
                selfobj.getSectionList();
              }
              setTimeout(function(){
                  $(e.currentTarget).html(status);
              }, 3000);
              
            }
          });
    },  

    loadSection:function(){
     // new sectionSingleView({section_id:selfobj.section_id,course_id:selfobj.course_id,searchCourse:this});
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        lesson_title: {
          required: true,
        },
        introduction: {
          required: true,
        },
        cover_image: {
          required: true,
        },
        youtube_link: {
          required: true,
        },
        youtube_title: {
          required: true,
        },
        viemo_link: {
          required: true,
        },
        viemo_title: {
          required: true
        },
        class_title: {
          required: true,
        },
        webinar_title: {
          required: true,
        },
        youtube_live: {
          required: true,
        },
        youtubelive_title: {
          required: true,
        },
        meeting_title: {
          required: true,
        },
        zoom_webinar: {
          required: true,
        },
        duration: {
          required: true,
        },
        password: {
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
        lesson_title: "Please enter lesson Name",
        introduction: "Please enter Introduction",
        cover_image: "Please enter Image",
        youtube_link: "Please enter Youtube Link",
        youtube_title: "Please enter Youtube Title",
        viemo_link: "Please enter VIEMO Link",
        custom_link: "Please enter Custom Link",
        custom_link_title: "Please enter Custom Link Title",
        viemo_title: "Please enter VIEMO Title",
        class_title: "Please enter Title",
        webinar_title: "Please enter Webinar title",
        youtube_live: "Please enter Youtube Link",
        youtubelive_title: "Please enter Youtube Title",
        meeting_title: "Please enter Zoom Meeting Title",
        zoom_webinar: "Please enter Zoom Webinar Link",
        duration: "Please enter Duration",
        password: "Please enter Password",
      };
      $("#lessonDetails").validate({
        rules: feildsrules,
        messages: messages
      });
      var dateFormat = "dd/mm/yy";
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
        var valuetxt = $("#end_date").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
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
        var valuetxt = $("#start_date").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#start_date").val(" ");
        }
        selfobj.model.set({ "end_date": $('#end_date').val() });
      });

      $('#start_time').timepicker({
        timeFormat: 'hh:mm a',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: function (e) {
          var st = $("#start_time").val();
          var et = $("#end_time").val(); // Corrected selector
          var tempsTime = moment(st, "HH:mm:ss").valueOf();
          var tempeTime = moment(et, "HH:mm:ss").valueOf();

          if (tempsTime > tempeTime) {
            $("#end_time").val("");
          }

          var t = moment(st, "hh:mm a").format("HH:mm:ss");
          selfobj.model.set({ "start_time": t });
        },
      });
      
      $('#end_time').timepicker({
        timeFormat: 'hh:mm a',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: function (e) {
          var st = $("#start_time").val();
          var et = $("#end_time").val();
          var tempsTime = moment(st, "HH:mm:ss").valueOf();
          var tempeTime = moment(et, "HH:mm:ss").valueOf();

          if (tempsTime > tempeTime) {
            $("#start_time").val("");
          }

          var t = moment(et, "hh:mm a").format("HH:mm:ss");
          selfobj.model.set({ "end_time": t });
        },
      });

      $("#duration").spinner({
        min: 1,
      });
      $("#webinar_number").spinner({
        min: 1,
      });

    },
    updateMedia :function(){

    },
    render: function () {
      var selfobj = this;
      var source = lessonSingle;
      var rout  = "";
      var rout2 = ""
      // console.log(this.model);
      var template = _.template(source);
      $("#" + this.toClose).remove();
      let fPath = UPLOADS;
      if(typeof(this.model.attributes.lesson_id)=='undefined')
      {
        rout = APIPATH + 'courseMediaUpload/' + this.course_id+'/'+this.section_id+"";
        rout2 = APIPATH + 'courseMediaUpload/' + this.course_id+'/'+this.section_id+"";
      }
      else{
        rout = APIPATH + 'courseMediaUpload/' + this.course_id+'/'+this.section_id+"/"+this.model.attributes.lesson_id;
        rout2 = APIPATH + 'courseMediaUpload/' + this.course_id+'/'+this.section_id+"/"+this.model.attributes.lesson_id;
      }
      //var arr = _.values(this.mediaFiles.models);
      // console.log(selfobj.data);
      //console.log(arr['e.models']);
      //console.log(arr);
      //console.log(this.mediaFiles.models);
      this.$el.html(template({ "model": this.model.attributes, "media": this.data, "ppath": fPath ,"section":this.section_id ,'lesson' :this.model.attributes.lesson_id,'courseID':this.course_id}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
     
      // this is used to append the dynamic form in the Lesson view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      this.showAttached(this.model.attributes);
      $('select').selectpicker();
      // $(".ws-dragbox").show();
      // $(".ws-dragurl").show();
      
      rearrageOverlays("Lesson", this.toClose);
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];
      var editor = new Quill($("#introduction").get(0), {
        modules: {
          toolbar: __toolbarOptions
        },
        theme: 'snow'
      });
      //const delta = editor.clipboard.convert();
      //editor.setContents(delta, 'silent');
      editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          selfobj.model.set({ "introduction": justHtml });
        }
      });
      // alert( APIPATH + 'courseMediaUpload/course/' + this.course_id+'/'+this.model.lesson_id);
      $("#fileupload").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: true,
        notification: true,
        autoUpload: true,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav', 'docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: rout,
        //action: APIPATH + 'mediaUpload/',
        element: 'fileupload',
        onSucess: function () {
          // console.log(this.elements.uploadList[0].name);
          selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
          //  selfobj.render();
          selfobj.getMediaList();
        }
      });
      $("#fileupload2").RealTimeUpload({
        text: 'Drag or Drop video here !',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: true,
        notification: true,
        autoUpload: true,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav', 'docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: rout2,
        //action: APIPATH + 'mediaUpload/',
        element: 'fileupload2',
        onSucess: function () {
          selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          selfobj.model.attributes.course_file=this.elements.uploadList[0].name;
          $('.modal-backdrop').hide();
          console.log("Video Uploaded..");          
        }
      });
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });
  return lessonSingleView;

});
