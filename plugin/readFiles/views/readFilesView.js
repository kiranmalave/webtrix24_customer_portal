
define([
  'jquery',
  'underscore',
  'backbone',
  'jqueryUI',
  'Swal',
  'RealTimeUpload',
  '../views/addNewFileView',
  '../collections/readFilesCollection',
  '../../core/views/mailView',
  '../models/addNewDIRModel',
  '../models/readFilesFilterOptionModel',
  'text!../templates/readFilesTemp.html',
], function ($, _, Backbone, jqueryUI,Swal, RealTimeUpload, addNewFileView, readFilesCollection, mailView, addNewDIRModel, readFilesFilterOptionModel, readFilesTemp) {

  var readFilesView = Backbone.View.extend({
    initialize: function (options) {
      var selfobj = this;
      this.folderID = "";
      this.folderName = "";
      this.loadFrom = "";
      this.fPath = UPLOADS;
      this.elementID = options.elementID;
      this.loadController = options.loadController;
      if (options.loadFrom != "" && options.loadFrom != undefined) {
        this.loadFrom = options.loadFrom;
        $("#mediaLoad").empty();
      }
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);
      this.addDIR = new addNewDIRModel();
      this.mname = Backbone.history.getFragment();
      if(this.mname.search("addnewpage")){
        this.mname = "media";
      }
      let permission = ROLE["media"];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      readyState = true;
      this.filterOption = new readFilesFilterOptionModel();
      // if(typeof(options.folderName) != "undefined" && options.folderName !== null) {
      //   console.log(options.loadFrom);
      // }
      if(this.mname == "media"){
        this.filterOption.set({ cmp_type: "media" });  
      }else if(this.mname == "gallery"){
        this.filterOption.set({ cmp_type: "gallery" });  
      }
      this.filterOption.set({ fPath: this.fPath });
      this.filterOption.set({ folderID: this.folderID });
      this.filterOption.set({ folderName: this.folderName });
      // console.log(options.mnFolder);
      if (typeof (options.mnFolder) == "undefined" || options.mnFolder == 'Y') {
        //console.log(options);          
      }
      // else {
      //   this.fPath = COURSE;
      //   this.filterOption.set({ fPath: this.fPath });
      //   this.filterOption.set({ folderID: options.folderID });
      //   this.filterOption.set({ folderName: options.folderName });
      //   this.folderName = options.folderName;
      // }
      // console.log(this.filterOption);
      this.searchreadFiles = new readFilesCollection();
      this.filterSearch();
    },
    events:
    {
      "click .loadview": "loadSubView",
      "click .readFolder": "readFolder",
      "click .fileImage": "copyfileImagePath",
      "click #createFolder": "createFolder",
      "click .showpage": "loadData",
      "click .returnFile": "returnFile",

    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    loadData: function (e) {
      var selfobj = this;
      var $element = $('#loadMember');
      var cid = $(e.currentTarget).attr("data-dt-idx");
      var isdiabled = $(e.currentTarget).hasClass("disabled");
      if (isdiabled) {
        //
      } else {

        $element.attr("data-index", cid);
        this.searchreadFiles.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        this.filterOption.set({ curpage: index });
        var requestData = this.filterOption.attributes;
        //console.log(requestData);
        $(".profile-loader").show();
        this.searchreadFiles.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
        }).done(function (res) {
          $(".profile-loader").hide();
          if (res.flag == "F") { showResponse('',res,'');}
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          selfobj.render();
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
        });
      }
    },
    returnFile: function (e) {
      var url = $(e.currentTarget).attr("data-url");
      this.loadController.getSelectedFile(url, this.elementID);
    },
    createFolder: function (e) {

      e.preventDefault();
      var selfobj = this;
      let name = $("#folderName").val().trim();
      if (name == "") {
        alert("please enter folder name");
        return;
      }
      this.addDIR.set({ "dirName": name });
      $(e.currentTarget).html("<span>Saving..</span>");
      $(e.currentTarget).attr("disabled", "disabled");
      this.addDIR.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: "POST"
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "F") {
          showResponse('',res,'');
          $(e.currentTarget).html("<span>Error</span>");
        } else {
          $(e.currentTarget).html("<span>Saved</span>");
          selfobj.filterSearch();
        }

        setTimeout(function () {
          $(e.currentTarget).html("<span>Save</span>");
          $(e.currentTarget).removeAttr("disabled");
        }, 3000);

      });
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-show");
      switch (show) {
        case "singleFile": {
          let path = $(e.currentTarget).attr("data-url");
          let iId = $(e.currentTarget).attr("data-id");
          let fname = $(e.currentTarget).attr("data-fname");
          if (fname == '')
            fname = "Main";

          var folderPath = this.realpath;
          var addNewFileview = new addNewFileView({ folderPath: folderPath, searchVideos: this, filepath: path, fileId: iId, fname: fname });
          break;
        }
        case "mail": {
          $(".customMail").show();
          $('.customMail').remove('maxActive');
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          var cust_mail = $(e.currentTarget).attr("data-custMail");
          new mailView({ customer_id: customer_id, customerName: cust_name, customer_mail: cust_mail });
          $('body').find(".loder").hide();
          break;
        }
      }
    },
    copyfileImagePath: function (e) {
      var imagePath = $(e.currentTarget).attr("src");
      var $inp = $("<input/>");

      $("body").append($inp);
      $inp.val(imagePath).select();

      document.execCommand("copy");
      $inp.remove();
      $(".alterMesage").fadeIn(800, function () {
        $(".alterMesage").fadeOut(800);
      })

    },
    readFolder: function (e) {
      var selfobj = this;
      var readfolder = $(e.currentTarget).attr("data-readfolder");
      this.filterOption.set({ folderID: readfolder });
      this.filterOption.set({ folderName: $(e.currentTarget).attr("data-folderName") });
      this.filterOption.set({ curpage: 0 });
      selfobj.filterSearch();
    },

    filterSearch: function () {
      this.searchreadFiles.reset();
      var selfobj = this;
      var $element = $('#loadMember');
      var requestData = this.filterOption.attributes;
      this.searchreadFiles.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: requestData
      }).done(function (res) {
        if (res.flag == "F") { showResponse('',res,'');}
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
        setPagging(res.paginginfo, res.loadstate, res.msg);
        $element.attr("data-currPage", 1);
        $element.attr("data-index", res.paginginfo.nextpage);

        //$(".page-info").html(recset);
        if (res.loadstate === false) {
          $(".profile-loader-msg").html(res.msg);
          $(".profile-loader-msg").show();
        } else {
          $(".profile-loader-msg").hide();
        }
      });
    },
    render: function () {
      var selfobj = this;
      var template = _.template(readFilesTemp);
      this.$el.html(template({ pagemodel: this.filterOption.attributes, searchreadFiles: this.searchreadFiles.models, fName: this.folderName, loadFrom: this.loadFrom }));
      if (this.loadFrom !== "") {
        $("#mediaLoad").append(this.$el);
      } else {
        $(".main_container").append(this.$el);
      }
      $("#fileupload").RealTimeUpload({
        text: 'Drag and Drop or Select a images to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: true,
        notification: true,
        autoUpload: true,
        extension: ['webp','png', 'jpg', 'jpeg', 'svg', 'gif', 'pdf', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav', 'docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: APIPATH + 'mediaUpload/' + selfobj.filterOption.get("folderID") +"?cmsType="+selfobj.mname,
        element: 'fileupload',
        onSucess: function () {
          // alert("hello")
          $('.modal-backdrop').hide();
          selfobj.filterSearch();
        }
      });

      return this;
    }
  });

  return readFilesView;

});
