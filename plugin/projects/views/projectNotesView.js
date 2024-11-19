
define([
  'jquery',
  'underscore',
  'backbone',
  'Swal',
  'moment',
  "../../core/views/timeselectOptions",
  '../collections/projectNotesCollection',
  '../models/projectNoteSingleModel',
  'text!../templates/projectNotesRow_temp.html',
  'text!../templates/projectNotes_temp.html',
], function ($, _, Backbone, Swal, moment, timeselectOptions, projectNotesCollection, projectNoteSingleModel, projectNotesRow_temp, projectNotes_temp) {

  var projectView = Backbone.View.extend({
    editor:null,
    initialize: function (options) {
      var selfobj = this;
      $(".profile-loader").show();
      scanDetails = options.searchProjectNotes;
      this.render();
      this.model = new projectNoteSingleModel();
      this.project_id = options.project_id;
      this.stage_id = options.stageID;
      this.noteID = options.note_id;
      this.timeselectOptions = new timeselectOptions();
      this.collection = new projectNotesCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      selfobj.getNotesDetails();
      if(this.noteID){
        selfobj.editProjectNote(this.noteID);
      }
    },

    getNotesDetails: function () {
      var selfobj = this;
      var data = { project_id: this.project_id, record_type: 'project' };
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: data
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        $('body').find(".loder").hide();
      });
    },
    events:
    {
      "click .changeStatus": "changeStatusListElement",
      "click .saveNote": "saveNoteDetails",
      "click .editNote": "editNote",
      "click .deleteNote": "deleteNote",
      "change .txtchange": "updateOtherDetails",
      "click .closeModal": "closeModal",
      "click .newNote":"newNote",
    },

    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },

    closeModal: function(){
      $('#NoteModal').modal('toggle');
      scanDetails.getprojectNotes();
    },

    newNote: function(e){
      let selfobj = this;
      $("#saveNotes").html("Save");
      $("#title").val("");
      selfobj.editor.root.innerHTML = "";
      selfobj.model.clear().set(selfobj.model.defaults);
      $('.pointer').removeClass('active');
      $(e.currentTarget).addClass('activeNew');
      $('#reminder_date').val('');
      $(".form-line").removeClass("focused");
      $('#reminder_time').val('');
    },

    addOne: function (objectModel) {
      let selfobj = this;
      objectModel.set({ "timeString": selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.created_date) });
      var template = _.template(projectNotesRow_temp);
      $("#notesRow").append(template({ notesDetails: objectModel }));
    },
    addAll: function () {
      $("#notesRow").empty();
      this.collection.forEach(this.addOne, this);
    },
    editNote: function (e) {
      let selfobj = this;
      var id = $(e.currentTarget).attr("data-id");
      $('.pointer').removeClass('active');
      $(e.currentTarget).addClass('active');
      $('.newNote').removeClass('activeNew');
      this.model.set({ "note_id": id });
      var reminderDate = $(e.currentTarget).attr('data-time');
      if(reminderDate){
        var dateTimeArray = reminderDate.split(' ');
        var datePart = moment(dateTimeArray[0]).format("DD-MM-YYYY");
        var timePart = moment(reminderDate).format("h:mm a");
        selfobj.model.set({"reminder_date":dateTimeArray[0]});
        selfobj.model.set({"reminder_time":dateTimeArray[1]});
        $('#reminder_date').val(datePart);
        $('#reminder_time').val(timePart);
        selfobj.refreshDatepicker();
      }else{
        $('#reminder_date').val('');
        $('#reminder_time').val('');
      }
      // console.log("selfobj.model editnote",selfobj.model);
      var desc = $.trim($(e.currentTarget).find('.editNoteDesc').html());
      var title = $.trim($(e.currentTarget).find('.editnotestHeading').text());
      $("#title").val(title);
      this.editor.root.innerHTML = desc;
      $("#saveNotes").html("Update");
    },

    editProjectNote: function (id) {
      let selfobj = this;
      var id = id;
      $('.pointer').removeClass('active');
      $('.newNote').removeClass('activeNew');
      this.model.set({ "note_id": id });
      // var reminderDate = $(e.currentTarget).attr('data-time');
      // if(reminderDate){
      //   var dateTimeArray = reminderDate.split(' ');
      //   var datePart = moment(dateTimeArray[0]).format("DD-MM-YYYY");
      //   var timePart = moment(reminderDate).format("h:mm a");
      //   selfobj.model.set({"reminder_date":dateTimeArray[0]});
      //   selfobj.model.set({"reminder_time":dateTimeArray[1]});
      //   $('#reminder_date').val(datePart);
      //   $('#reminder_time').val(timePart);
      //   selfobj.refreshDatepicker();
      // }else{
      //   $('#reminder_date').val('');
      //   $('#reminder_time').val('');
      // }
      // console.log("selfobj.model editnote",selfobj.model);
      var desc = $.trim($(id+'EditDesc').html());
      var title = $.trim($(id+'Heading').text());
      $("#title").val(title);
      this.editor.root.innerHTML = desc;
      $("#saveNotes").html("Update");
    },

    deleteNote: function (e) {
      e.stopPropagation();
      Swal.fire({
        title: 'Are you sure you want to delete this note? This action cannot be undone.',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
        Swal.fire('Deleted!', '', 'success')
        let selfobj = this;
        var action = "delete";
        var id = $(e.currentTarget).attr("data-id");
        if (id != "" && id != null) {
          $.ajax({
            url: APIPATH + 'projectNote/delete',
            method: 'POST',
            data: { id: id, action: action },
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F")
                showResponse(e,res,'');

              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                selfobj.model.clear().set(selfobj.model.defaults);
                $("#title").val("");
                selfobj.editor.root.innerHTML = "";
                selfobj.collection.reset();
                selfobj.getNotesDetails();
              }
            }
          });
        }
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
      }
      })
    },



    changeStatusListElement: function (e) {
      Swal.fire({
        title: 'Do you want to delete ?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
         if (result.isConfirmed) {
         Swal.fire('Deleted!', '', 'success')
        var selfobj = this;
        var removeIds = [];
        var status = $(e.currentTarget).attr("data-action");
        var action = "changeStatus";

      $('#clist input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-form_id"));
        }
      });
      $(".deleteAll").hide();
      
      $(".action-icons-div").hide();
      $(".listCheckbox").click(function() {
          if($(this).is(":checked")) {
              $(".action-icons-div").show(300);
          } else {
              $(".action-icons-div").hide(200);
          }
      });
      var idsToRemove = removeIds.toString();
      if (idsToRemove == '') {
        showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
        return false;
      }
      $.ajax({
        url: APIPATH + 'dynamicForms/status',
        method: 'POST',
        data: { list: idsToRemove, action: action, status: status },
        datatype: 'JSON',
        beforeSend: function (request) {
          $(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F")
            showResponse(e,res,'');

          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            selfobj.collection.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".profile-loader").hide();
              selfobj.filterSearch();
            });
          }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 3000);

        }
      });
    } else if (result.isDenied) {
      Swal.fire('Changes are not saved', '', 'info')
      $('#clist input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          $(this).prop('checked', false);
        }
      });
      $(".listCheckbox").find('.checkall').prop('checked', false);
      $(".deleteAll").hide();
    }
    })
    },

    saveNoteDetails: function (e) {
      let selfobj = this;
      var id = this.model.get("note_id");
      this.model.set({"record_type":"project"})
      var title = $("#title").val();
      var description = $("#notes_description1").text();
      if (!title.trim() && !description.trim()) {
        console.log("Title and description cannot be empty");
        return; 
      }
    
      if (id == "" || id == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
    
      if ($("#projectNotes").valid()) {
        $(e.currentTarget).html("Saving..");
        this.model.set({ "project_id": selfobj.project_id, "title": title, "description": description });
    
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'SadminID': $.cookie('authid'),
            'token': $.cookie('_bb_key'),
            'Accept': 'application/json'
          },
          error: selfobj.onErrorHandler,
          type: methodt
        }).done(function (res) {
          if (methodt == "PUT") {
            selfobj.model.set({ note_id: res.lastID });
          }
          $('.notesRow').empty();
          selfobj.collection.reset();
          selfobj.getNotesDetails();
          $(e.currentTarget).html("Update");
          $("#saveNotes").html("Save");
          $("#title").val("");
          selfobj.editor.root.innerHTML = "";
          selfobj.model.clear().set(selfobj.model.defaults);
          scanDetails.getprojectNotes();
          $('.pointer').removeClass('active');
          $('#reminder_date').val('');
          $(".form-line").removeClass("focused");
        });
      }
      $('.newNote').removeClass('activeNew');
    },

    refreshDatepicker: function () {
      let selfobj = this;
      $('#reminder_date').datepickerBT('destroy');
      selfobj.initializeDatepicker();
    },
    
    initializeDatepicker: function () {
      let selfobj = this;
      $('#reminder_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
        startDate: new Date(),
      }).on('changeDate', function (ev) {
        $('#reminder_date').change();
        var valuetxt = $(this).val();
        var toID = $(this).attr("id");
        var newdetails = {};
        newdetails[toID] = valuetxt;
        selfobj.model.set(newdetails);
      });
    },

    render: function () {
      var selfobj = this;
      var template = _.template(projectNotes_temp);
      this.$el.html(template({ projectNotes: selfobj.collection, name: this.custName}));
      $('#noteMedia').empty();
      $("#noteMedia").append(this.$el);
      setToolTip();
      // this.initializeValidate();
      $(".profile-loader").hide();
      selfobj.initializeDatepicker();
      $('#reminder_time').timepicker({
        timeFormat: 'hh:mm a',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: function (e) {
          var st = $("#reminder_time").val();
          var tempsTime = moment(st, "hh:mm a").format("HH:mm:ss");
          selfobj.model.set({ reminder_time: tempsTime });
          console.log(tempsTime);
        },
      });

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
      this.editor = new Quill($("#notes_description1").get(0), {
        placeholder: 'Type your notes here...',
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
          selfobj.model.set({ "note_desc": justHtml });
        }
      });

      return this;
    }
  });

  return projectView;

});
