define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'Swal',
  'text!../templates/deleteCardTemplate.html',
  '../../core/views/bulkEditView',
], function ($, _, Backbone, moment, Swal, deleteCardTemplate,bulkEditView) {
  var deleteCardView = Backbone.View.extend({
    initialize: function (options) {
      var selfobj = this;
      this.parentObj = options.parentView;
      this.deleteOff = (this.parentObj.deleteOff) ? this.parentObj.deleteOff : false;
      this.activeOff = (this.parentObj.activeOff) ? this.parentObj.activeOff : false;
      this.inactiveOff = (this.parentObj.inactiveOff) ? this.parentObj.inactiveOff : false;
      this.editOff = (this.parentObj.editOff) ? this.parentObj.editOff : false;
      selfobj.render();
    },

    events:
    {
      "click .close": "closeCard",
      "click .delete": "deleteRecords",
      "click .inactive": "makeRecordsInactive",
      "click .active": "makeRecordsActive",
    },

    attachEvents: function () {
      this.$el.off("click", ".close", this.closeCard);
      this.$el.on("click", ".close", this.closeCard.bind(this));
      this.$el.off("click", ".editRecord", this.editRecord);
      this.$el.on("click", ".editRecord", this.editRecord.bind(this));
    },
    closeCard: function () {
      $('.toolbar').hide();
      this.parentObj.$el.find('#clist input[type="checkbox"]:checked').prop('checked', false);
      handelClose("bulkEditView");
    },
    editRecord: function (e) {
      let selfobj = this;
      var action = $(e.currentTarget).attr('data-action');
      var recordsList = this.parentObj.idsToRemove;
      var url_api = APIPATH + selfobj.parentObj.statusChangeURL;
      var text = '';
      var title = '';
      var btn_text = '';
      if (recordsList) {
        switch (action) {
          case "inactive":
            title = "Make Records Inactive";
            btn_text = 'Inactive';
            text = "Do you want to make the Records Inactive !";
            break;
          case "active":
            title = "Make Records Active";
            btn_text = 'Active';
            text = "Do you want to make the Records Active !";
            break;
          case "edit":
              if (permission.edit != "yes") {
                Swal.fire("You don't have permission to edit", '', 'error');
                return false;
              } else {
                new bulkEditView({parentObj: this.parentObj, recordsList: recordsList});
              }
              return;
            break;
          default:
            title = 'Delete Records';
            btn_text = 'Delete';
            text = "This action is irreversible and will permanently remove all associated data. Please confirm that you wish to proceed with this critical action.";
            break;
        }
        Swal.fire({
          title: title,
          text: text,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: btn_text,
          animation: "slide-from-top",
        }).then((result) => {
          if (result.isConfirmed) {
            $.ajax({
              url: url_api,
              method: 'POST',
              data: { list: recordsList, action: action },
              datatype: 'JSON',
              beforeSend: function (request) {
                $('.loder').show();
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                $('.loder').show();
                if (res.flag == "F") {
                  showResponse('', res, '');
                }
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                  selfobj.parentObj.filterSearch();
                  selfobj.parentObj.isdataupdated = true;
                  $(".deleteAll").hide();
                  $('.checkall').prop('checked', false);
                  $('.memberlistcheck').prop('checked', false);
                }
              }
            });
          } else {
            $('.changeStatus').hide();
            $('.checkall').prop('checked', false);
            $('.memberlistcheck').prop('checked', false);
          }
        });
      } else {
        Swal.fire('Failed', 'Please select at least one record.', 'error');
      }
      $('.toolbar').hide();
    },
    render: function () {
      var selfobj = this;
      if ($("#actionToolbar").length) {
        var template = _.template(deleteCardTemplate);
        this.$el.html(template({ number: selfobj.parentObj.checkedCount, deleteOff: this.deleteOff, activeOff: this.activeOff, inactiveOff: this.inactiveOff, editOff: this.editOff }));
        $('#actionToolbar').empty();
        $("#actionToolbar").append(this.$el);
        if (selfobj.parentObj.checkedCount == 0) {
          $('.toolbar').hide();
        }
      }
      selfobj.attachEvents();
      return this;
    },

  });
  return deleteCardView;
});
