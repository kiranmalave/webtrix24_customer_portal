define([
  'jquery',
  'underscore',
  'backbone',
  'RealTimeUpload',
  '../models/addFilesModel',
  'text!../templates/addNewFileTemp.html',
], function ($, _, Backbone, RealTimeUpload, addFilesModel, addNewFileTemp) {

  var addNewFileView = Backbone.View.extend({
    initialize: function (options) {
      var selfobj = this;

      this.dynamicData = null;
      console.log(options);
      this.toClose = "addNewFileView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "media";
      this.model = new addFilesModel()
      scanDetails = options.searchVideos;
      //var pathToSave=options.folderPath;
      this.fileDelID = options.fileId;
      this.fPath = options.fname;
      //this.model.set({folderPath:pathToSave});
      this.model.set({ fileURL: options.filepath });
      this.model.set({ fname: options.fname });
      console.log(this.model.attributes)
      this.render();
    },
    events:
    {
      "click #delImage": "delImage",
      "click #copyToClipboard": "copyToClipboard",
      "change .fileAdded": "updateImage",
      "click #saveuserRoleDetails": "saveuserRoleDetails",

    },
    copyToClipboard: function (e) {
      document.execCommand("copy");
    },
    //
    updateImage: function (e) {
      var newdetails = [];
      $(e.currentTarget.files).each(function (index, data) {
        var reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onload = function (e) {
          newdetails.push(reader.result)
        };

      })
      this.model.set({ fileList: newdetails })
    },

    delImage: function (e) {
      e.preventDefault();
      let selfobj = this;
      let idsToRemove1 = this.fileDelID;
      let fPath1 = this.fPath;
      let filepath = "";
      let action = "delImage";
      let flg = false;
      if (idsToRemove1 != '') {
        showResponse('',{ flag:'F' , msg: 'Please confirm.' },'');
        flg = true;
      }
      else
        return;
      if (flg == true) {
        $.ajax({
          url: APIPATH + 'deleteFile',
          method: 'POST',
          data: { idsToRemove: idsToRemove1, filepath: fPath1 },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(e.currentTarget).html("<span>Updating...</span>");
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") showResponse('',res,'');
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
              $(e.currentTarget).html("<span>Delete</span>");
              scanDetails.filterSearch();
              handelClose(selfobj.toClose);
            }
            setTimeout(function () {
              $(e.currentTarget).html(status);
            }, 3000);

          }
        });
      }
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },

    render: function () {
      var source = addNewFileTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".tab-content").append(this.$el);
      $('#' + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      //$("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.

      rearrageOverlays("Media File", this.toClose);
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return addNewFileView;

});
