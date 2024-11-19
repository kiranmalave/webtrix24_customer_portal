define([
  "jquery",
  "underscore",
  "backbone",
  "validate",
  "inputmask",
  "datepickerBT",
  'typeahead',
  'moment',
  'Swal',
  "../../core/views/multiselectOptions",
  "../../core/views/timeselectOptions",
  "../collections/commentCollection",
  "../../admin/collections/adminCollection",
  "../models/commentModelTask",
  '../models/commentsFilterOptionModel',
  "text!../templates/commentSingle_temp.html",
  "text!../templates/commentRow_temp.html",
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, moment, Swal, multiselectOptions,timeselectOptions, commentCollection,adminCollection, commentModelTask, commentsFilterOptionModel, commentTemp, commentRow) {
  var commentSingleView = Backbone.View.extend({
    nextPage: '',
    task_id: '',
    remaining: '',
    totalrec: '',
    pageLimit: '',
    loadstate:true,
    editor:null,
    commentsSorting: 'DESC',
    initialize: function (options) {
      var selfobj = this;
      this.dynamicData = null;
      this.toClose = "commentSingleView";
      this.appendto = options.appendto;
      
      filterOption = new commentsFilterOptionModel();
      this.multiselectOptions = new multiselectOptions();
      this.timeselectOptions = new timeselectOptions();
      this.singleComment = new commentModelTask();
      this.type = options.type;
      scanDetails = options.searchComment;
      this.record_id = options.record_id;
      this.commentsSorting = "DESC";
      
      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active", getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popuploader").hide();
        selfobj.render();
      });
      
      $(".popupLoader").show();
        this.commentList = new commentCollection();
        this.model1 = new commentModelTask();
        if (options.record_id !== "") {
          selfobj.commentList.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: 'post', data: { type:this.type,status: "active", record_id: options.record_id }
          }).done(function (res) {
            if (res.flag == "F") {
              showResponse('',res,'');
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
            selfobj.totalrec = res.paginginfo.totalRecords;
            selfobj.nextPage = res.paginginfo.nextpage;
            selfobj.loadstate = res.loadstate;
            selfobj.updateTime();
          });  
        }
      //}
    },
    events: {
      "click .saveComment": "saveComment",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .showPage": "loadData",
      "click .editBtn": "editComment",
      "click .comment-box": "editComment",
      "click .deleteBtn": "deleteComment",
      "click #readMoreBtn": "loadData",
      "click .cancel": "cancelPost",
      "click .listSortColumns" : "showListSortColumns",
      "click .sortColumns": "sortColumn",
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".column-loader").hide();
    },
    updateTime: function(){
      var selfobj = this;
      //this.historyList.forEach
      this.commentList.forEach(function(record){
        record.attributes.modified_date = selfobj.timeselectOptions.displayRelativeTime(record.attributes.modified_date);
        record.attributes.created_date = selfobj.timeselectOptions.displayRelativeTime(record.attributes.created_date);
      }, this);
      selfobj.render();
    },
    showListSortColumns: function (e) {
      e.preventDefault();
      let selfobj = this;
      var action = $(e.currentTarget).attr('data-action');
      var newsetval = [];
      if(action == "ASC"){
        $(e.currentTarget).hide();
        $('.taskCommentsSortingUpwards').show();
        selfobj.commentsSorting = "DESC";
        newsetval["order"] = "ASC";
      }else if(action == "DESC"){
        $(e.currentTarget).hide();
        $('.taskCommentsSortingDownwards').show();
        newsetval["order"] = "DESC";
        selfobj.commentsSorting = "ASC";
      }
      if(this.type == "project"){
        filterOption.set({ project_id: this.project_id });
      }else if(this.type == "task"){
        filterOption.set({ task_id: this.task_id });
      }
      filterOption.set(newsetval);
      selfobj.filterSearch();
    },

    sortColumn: function (e) {
      e.stopPropagation();
      selfobj.filterSearch();
    },

    filterSearch: function () {
      this.commentList.reset();
      var selfobj = this;
      $(".profile-loader").show();
      filterOption.set("type",this.type);
      filterOption.set("curpage",0);
      filterOption.set("record_id",this.record_id);
      filterOption.set("order",this.commentsSorting);
      console.log("after edit");
      selfobj.commentList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        
        selfobj.loadstate = res.loadstate;
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.updateTime();
        //selfobj.render();
      });
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      if (toID == "does_repeat") {
        if (valuetxt == "custom") {
          $(".ws-repeatTask").show();
        } else {
          $(".ws-repeatTask").hide();
        }
      }
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["is_custom", "category", "admin"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    cancelPost: function (e) {
    let cancel = $(e.currentTarget).attr("data-cal");
      if(cancel ==""){
        var quill = new Quill('#comment');
        quill.setText('');
        $(".comment-box").show();
        $(".commentEditor").hide();
        let element = document.querySelector(".buttonHide");
        element.classList.remove('showButton');
      }else{
        let closeone = this.$(e.currentTarget).closest(".text-right").closest(".commentTextSec").find(".inbox-item-infoHeader");
        let cancelId = $(e.currentTarget).prev(".saveComment").attr("data-commentid");
        console.log("cancelId",cancelId);
        this.$(".editCmtBtn_" + cancelId).hide();
        this.$(".ql-toolbar").remove();
        var justHtml = this.editor.root.innerHTML;
        this.$("#editCmt_" + cancelId).remove();
        let el = $("<div>",{
          id:"editCmt_" + cancelId,
        }).html(justHtml);
        closeone.after(el);
        
      }
    },
    editComment: function (e) {
      let selfobj = this;
      let newcomment = $(e.currentTarget).attr("data-new");
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];

      if(newcomment == "true"){
        $(e.currentTarget).hide();
        this.$(".commentEditor").show();
        this.$(".comment-editor").show();
        if (!$(".comment-editor").hasClass("ql-container")) {
          console.log("mention check");
          this.editor = new Quill(selfobj.$("#comment").get(0), {
            modules: {
              toolbar: __toolbarOptions,
              mention: {
                allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
                mentionDenotationChars: ["@", "#"],
                source: function (searchTerm, renderList, mentionChar) {
                  let values;
                  if (mentionChar === "@") {
  
                    values = selfobj.atValues;
  
                  } else {
                    values = selfobj.atValues;
                  }
  
                  if (searchTerm.length === 0) {
                    renderList(values, searchTerm);
                  } else {
                    const matches = [];
                    for (let i = 0; i < values.length; i++)
                      if (
                        ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                      )
                        matches.push(values[i]);
                    renderList(matches, searchTerm);
                  }
                }
              }
            },
            theme: 'snow'  // or 'bubble'
          });
  
          this.editor.on('text-change', function (delta, oldDelta, source) {
            if (source == 'api') {
              //console.log("An API call triggered this change.");
            } else if (source == 'user') {
              var delta =selfobj.editor.getContents();
              var text = selfobj.editor.getText();
              var justHtml = selfobj.editor.root.innerHTML;
              selfobj.singleComment.set({ "comment_text": justHtml });
  
            }
          });
        }
  
  
        let element = document.querySelector(".buttonHide");
        element.classList.add('showButton');
      }else{
      var $parentContainer = $(e.target).closest('.inbox-widget');
      $parentContainer.find('.inbox-message').hide();
      let commentID = $(e.currentTarget).attr("data-commentID");
      selfobj.singleComment.set({ "comment_id": $(e.currentTarget).attr("data-commentID") });
      this.$("#editCmt_" + commentID).show();
      this.$(".editCmtBtn_" + commentID).show();
      //this.$(".editCmtBtn_" + commentID).find(".cancelEditedComment").attr("data-cal",commentID);
      var myid = "editCmt_" + commentID;
      if (!$("#" + myid).hasClass("ql-container")) {
        // this.editor = new Quill($("#" + myid).get(0), {
        //   modules: {
        //     toolbar: __toolbarOptions
        //   },
        //   theme: 'snow'  // or 'bubble'
        // });
        this.editor =  new Quill(selfobj.$("#" + myid).get(0), {
          modules: {
            toolbar: __toolbarOptions,
            mention: {
              allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
              mentionDenotationChars: ["@", "#"],
              source: function (searchTerm, renderList, mentionChar) {
                let values;
                if (mentionChar === "@") {

                  values = selfobj.atValues;

                } else {
                  values = selfobj.atValues;
                }

                if (searchTerm.length === 0) {
                  renderList(values, searchTerm);
                } else {
                  const matches = [];
                  for (let i = 0; i < values.length; i++)
                    if (
                      ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                    )
                      matches.push(values[i]);
                  renderList(matches, searchTerm);
                }
              }
            }
          },
          theme: 'snow'  // or 'bubble'
        });
        this.editor.on('text-change', function (delta, oldDelta, source) {
          if (source == 'api') {
            //console.log("An API call triggered this change.");
          } else if (source == 'user') {
            var delta = selfobj.editor.getContents();
            var text = selfobj.editor.getText();
            var justHtml = selfobj.editor.root.innerHTML;
            selfobj.singleComment.set({ "comment_text": justHtml });
            console.log(selfobj.singleComment);
          }
        });
      }
    }
    },
    deleteComment: function (e) {
      let selfobj = this;
      let status = "delete";
      let action = "changeStatus";
      let id = $(e.currentTarget).attr("data-commentID");
      if(this.type == "project"){
        var apiEnd = "projectCommentDelete";
      }else if(this.type == "task"){
        var apiEnd = "taskCommentDelete";
      }
      Swal.fire({
        title: "Delete Comment ",
        text: "Do you want to delete this Comment ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          $.ajax({
            url: APIPATH + apiEnd,
            method: 'POST',
            data: { list: id, status: status, action: action },
            datatype: 'JSON',
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
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                selfobj.totalrec--;
                $("#commentRow_"+id).remove();
                $('#totalComments').empty().text($('#totalComments').text() + 'All Comments ('+selfobj.totalrec+')');
                if(selfobj.totalrec == 0){
                  $("#totalComments").hide();
                }
              }
            }
          });
        }else{

        }
      });
      
    },

    readMoreComments: function(e){
      var readMoreBtn = document.getElementById('readMoreBtn');
      var hiddenComments = document.querySelectorAll('.newComments');

      if (readMoreBtn) {
          readMoreBtn.addEventListener('click', function() {
              hiddenComments.forEach(function(comment) {
                  comment.style.display = 'block';
              });
              readMoreBtn.style.display = 'none';
          });
      }
    },
    saveComment: function (e) {
      e.preventDefault();
      let selfobj = this;
      let isNew = $(e.currentTarget).attr("data-action");
      var dataSele = [];
      var spanElements = $('#comment .ql-editor p span');
      spanElements.each(function () {
        if ($(this).attr('data-id') != undefined) {
          dataSele.push($(this).attr('data-id'));
        }
      });
      var commentID = $(e.currentTarget).attr("data-commentID");
      //var commentText = selfobj.model1.get("comment_text");
      selfobj.singleComment.set({ "mentions": dataSele });
      selfobj.singleComment.set({ "record_id": selfobj.record_id });
      selfobj.singleComment.set({ "type": selfobj.type });
      selfobj.singleComment.set({ "comment_id": commentID });
      
      if (isNew == "cpost") {
        var methodt = "POST";
      } else {
        var methodt = "PUT";
      }
      this.singleComment.save({},{
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: methodt,
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse(e,res,'');
        }
        if (res.flag == "S") {
          selfobj.filterSearch();
        }
      });
    },
    loadData: function (e) {
      e.stopPropagation();
      var selfobj = this;
      var index = selfobj.nextPage;
      this.commentList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: {status: "active", type:this.type, curpage: index,record_id:this.record_id }
      }).done(function (res){
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "F") {
          showResponse('',res,'');
        }else{
          $(".popupLoader").hide();
          selfobj.nextPage = res.paginginfo.nextpage;
          selfobj.loadstate = res.loadstate;
          if (!selfobj.loadstate) {
            $(e.currentTarget).hide();
          }
          var template = _.template(commentRow);
          res.data.forEach(function (objectModel) {
            objectModel.modified_date = selfobj.timeselectOptions.displayRelativeTime(objectModel.modified_date);
            objectModel.created_date = selfobj.timeselectOptions.displayRelativeTime(objectModel.created_date);
            $("#commentRow").append(template({ commentList: objectModel }));
          });
        }
      });
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        subject: {
          required: true
        },
        description: {
          required: true
        },
      };
      var feildsrules = feilds;
      var dynamicRules = '';

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
      }
      var messages = {
        subject: "Please enter Subject",
        description: "Please enter Deccription",

      };
      $("#commentDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
    },
    render: function () {
      //alert("tedf");
      $(".showPages").empty();
      var selfobj = this;
      this.undelegateEvents();
      var source = commentTemp;
      var template = _.template(source);
      this.$el.html(template({ "commentList": this.commentList.models, "total": this.totalrec, "commentsSorting": this.commentsSorting,loadstate:selfobj.loadstate }))  
      if(selfobj.appendto !="" && selfobj.appendto != null){
        selfobj.appendto.append(this.$el);
      }
      if(this.commentList.models.length == 0){
        $(".commentsSortingBtn").hide();
      }
      selfobj.atValues = [];
      _.each(selfobj.adminList.models, function (admin) {
        selfobj.atValues.push({
          'id': admin.attributes.adminID,
          'value': admin.attributes.name,
        });
      });
      $('.ws-select').selectpicker();
      this.delegateEvents();
      return this;
    },

  });
  return commentSingleView;
});


