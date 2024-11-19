
define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'Swal',
  '../../menu/models/singleMenuModel',
], function ($, _, Backbone, moment, Swal, singleMenuModel) {

  var appSettings = Backbone.View.extend({
    parentObj: {},
    filterOption: {},
    menuCollection: {},
    initialize: function (options) {
      var selfobj = this;
      if (options) {
        this.parentObj = options.parentObj;
        this.filterOption = options.filterOption ? options.filterOption : '';
        this.menuCollection = options.menuCollection ? options.menuCollection : '';
      }
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire({ title: 'Failed !', text: "Something was wrong ! Try to refresh the page or contact administer. :(", timer: 2000, icon: 'error', showConfirmButton: false });
      $(".profile-loader").hide();
    },
    getTaskRelated:function(){
      return ["project","opportunity","ticket","AMC"]
    },
    getInvoiceRelated:function(){
      return ["project","opportunity","ticket","AMC","task"]
    },
    getFreeSearchList:function(e,data,callback){
      var name = $(e.currentTarget).val();
      if(name.trim() !=""){
        $.ajax({
          url: APIPATH + 'searchList/',
          method: 'POST',
          data: { text: name, tableName: data.source, wherec: data.check, list: data.list,status:data.stat },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") {
              showResponse('',res,'');
            }
            $(".textLoader").hide();
            callback(e,res);
          }
        });
      }
    },
    getMenuList: function (menuID, callback) {
      let selfobj = this;
      var label = null;
      selfobj.menuList = new singleMenuModel();
      selfobj.menuList.set({ "menuID": menuID });
      selfobj.menuList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (result) {
        if (result.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        if (result.data[0]) {
          plural_label = result.data[0].plural_label;
          module_desc = result.data[0].module_desc;
          form_label = result.data[0].label;
          // Pass the label to the callback
          callback(plural_label, module_desc, form_label, result);
        }
      })
    },
    getInitials: function (name) {
      if (!name || name.trim() === "") {
        return '-';
      }
      const words = name.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length === 1) {
        return words[0][0].toUpperCase();
      }
      return words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
    },
    sidebarUpdate: function () {
      let selfobj = this;
      if (selfobj.parentObj) {
        selfobj.parentObj.recordCount = 0;
        selfobj.parentObj.collection.reset();
        selfobj.parentObj.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.parentObj.onErrorHandler, type: 'post', data: selfobj.parentObj.filterOption ? selfobj.parentObj.filterOption.attributes : ''
        }).done(function (res) {
          if (res.flag == "F") { showResponse('', res, ''); }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();
          if (res.flag == "S") {
            ISMENUSET = res.data;
            getLocalData();
            console.log("ISMENUSET", res.data);
            var sidebarTemplate = _.template(SIDEBAR);
            $("#leftsidebarSection").remove();
            $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
            // selfobj.parentObj.resetModel();
          }
        });
      } else {
        selfobj.menuCollection.reset();
        selfobj.menuCollection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption ? selfobj.filterOption.attributes : ''
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();

          if (res.flag == "S") {
            ISMENUSET = res.data;
            console.log("ISMENUSET", res.data);
            var sidebarTemplate = _.template(SIDEBAR);
            $("#leftsidebarSection").remove();
            $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
          }

        });
      }
    },
    getColorByInitials:function(initials){
      const colors = [
        "#fce7f6",
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
        "#fce7f6",
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
        "#fce7f6",
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
        "#fce7f6",
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
      ];
      let sum = 0;
      if (initials) {
        for (let i = 0; i < initials.length; i++) {
          sum += initials.charCodeAt(i);
        }
        const index = sum % colors.length;
        return colors[index];
      }
    },
    capitalizeFirstLetter:function(colVal) {
      if (typeof colVal == 'string') {
        return colVal.charAt(0).toUpperCase() + colVal.slice(1);   
      }else{
        return colVal;
      }
    } 
  });
  return appSettings;
});
