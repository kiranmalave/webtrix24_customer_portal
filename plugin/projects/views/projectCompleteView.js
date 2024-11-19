
define([
    'jquery',
    'underscore',
    'backbone',
    'Swal',
    'moment',
    "../../core/views/timeselectOptions",
    '../models/projectsSingleModel',
    'text!../templates/projectComplete_temp.html',
  ], function ($, _, Backbone, Swal, moment, timeselectOptions, projectsSingleModel, completeProject) {
  
    var projectCompleteView = Backbone.View.extend({
      editor:null,
      initialize: function (options) {
        var selfobj = this;
        $(".profile-loader").show();
        this.scanDetails = options.searchproject;
        this.model = new projectsSingleModel();
        this.render();
        this.project_id = options.project_id;
        var today = new Date();
        var day = today.getDate();
        var month = today.getMonth() + 1;
        var year = today.getFullYear();
        var formattedDate = day + '/' + month + '/' + year;
        this.timeselectOptions = new timeselectOptions();
        if (options.project_id != "") {
            this.model.set({ project_id: options.project_id });
            this.model.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, data: { menuId: options.menuID }, error: selfobj.onErrorHandler
            }).done(function (res) {
                if (res.flag == "F")
                    showResponse('', res, '');
                var project_status_date = selfobj.model.get("project_status_date");
                if (project_status_date != null && project_status_date != "0000-00-00") {
                    selfobj.model.set({ "project_status_date": selfobj.timeselectOptions.changeTimeFormat(project_status_date) });
                }else{
                  selfobj.model.set({ "project_status_date": formattedDate });
                }
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".popupLoader").hide();
                selfobj.render();
            });
        }
      },

      events:
      {
        "click .changeStatus": "changeStatusListElement",
        "click .completeProject": "saveProjectCompleteDetails",
        "click .editNote": "editNote",
        "click .deleteNote": "deleteNote",
        "change .txtchange": "updateOtherDetails",
        "click .closeprojectModal": "closeModal",
        "click .newNote":"newNote",
        "click .projectStatus": "setProjectStatus",
      },
  
      updateOtherDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        this.model.set(newdetails);
      },

      setProjectStatus: function (e){
        e.stopPropagation();
        let selfobj = this;
        var action = $(e.currentTarget).attr("data-action");
        switch (action) {
          case 'complete':
            selfobj.model.set({project_status:"completed"});
            $('.projectStatusDate').text('Completed Date');
            break;
          
          case 'failed':
            selfobj.model.set({project_status:"failed"});
            $('.projectStatusDate').text('Failed Date');
            break;

          case 'paused':
            selfobj.model.set({project_status:"paused"});
            $('.projectStatusDate').text('Paused Date');
            break;
        
          default:
            break;
        }
      },
  
      closeModal: function(){
        $('#completeProjectModal').modal('toggle');
      },

      showProjectStatus: function(){
        var status = this.model.get('project_status');
        console.log("status",status);
        if(status == "completed"){
          $(".projectStatusBtn").removeClass("active");
          $("#complete").addClass("active");
        }else if(status == "failed"){
          $(".projectStatusBtn").removeClass("active");
          $("#failed").addClass("active");
        }else if(status == "paused"){
          $(".projectStatusBtn").removeClass("active");
          $("#paused").addClass("active");
        }
      },
  
      saveProjectCompleteDetails: function (e) {
        let selfobj = this;
        var id = this.model.get("project_id");
        if (id == "" || id == null) {
          var methodt = "PUT";
        } else {
          var methodt = "POST";
        }
        if ($("#completeProjectFrom").valid()) {
          $(e.currentTarget).html("Saving..");
          this.model.save({}, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded','SadminID': $.cookie('authid'),'token': $.cookie('_bb_key'),'Accept': 'application/json'
            },
            error: selfobj.onErrorHandler, type: methodt
          }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                $('#completeProjectModal').modal('toggle');
                selfobj.scanDetails.refresh();
              }
          });
        }
      },
      
      initializeDatepicker: function () {
        let selfobj = this;
        $('#project_status_date').datepickerBT({
          format: "dd-mm-yyyy",
          todayBtn: "linked",
          clearBtn: true,
          todayHighlight: true,
          numberOfMonths: 1,
          autoclose: true,
          startDate: new Date(),
        }).on('changeDate', function (ev) {
          $('#project_status_date').change();
          var valuetxt = $(this).val();
          var toID = $(this).attr("id");
          var newdetails = {};
          newdetails[toID] = valuetxt;
          selfobj.model.set(newdetails);
        });
      },
  
      render: function () {
        var selfobj = this;
        this.undelegateEvents();
        var template = _.template(completeProject);
        console.log(this.model.attributes);
        this.$el.html(template({ "model": this.model.attributes}));
        $('#completeProj').empty();
        $("#completeProj").append(this.$el);
        setToolTip();
        $(".profile-loader").hide();
        selfobj.initializeDatepicker();
        selfobj.showProjectStatus();
        var __toolbarOptions = [
          ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'direction': 'rtl' }],                         // text direction
          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'align': [] }],
          // ['link'],
          // ['clean'],
          // ['image']                              // remove formatting button
        ];
        this.editor = new Quill($("#additionalDetails").get(0), {
          modules: {
           
            imageResize: {
              displaySize: true
            },
            toolbar: {
              container: __toolbarOptions,
              
              handlers: {
                image: imageHandler
              }
            },
            
          },
          theme: 'snow'
        });
        function imageHandler() {
          var range = this.quill.getSelection();
          var value = prompt('please copy paste the image url here.');
          if (value) {
            this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
          }
        }
        this.editor.on('text-change', function (delta, oldDelta, source) {
          if (source == 'api') {
            console.log("An API call triggered this change.");
          } else if (source == 'user') {
            var justHtml = selfobj.editor.root.innerHTML;
            selfobj.model.set({ "additional_details": justHtml });
          }
        });
        this.delegateEvents();
        return this;
      }
    });
  
    return projectCompleteView;
  
  });
  