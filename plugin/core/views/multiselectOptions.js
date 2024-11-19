
define([
  'jquery',
  'underscore',
  'backbone',
], function ($, _, Backbone) {

  var multiselectOptions = Backbone.View.extend({

    setValues: function (setvalues, obj) {
     
      $.each(setvalues, function (key, value) {
        var modval = obj.model.get(value);
        if (modval != null) {
          var modeVal = modval.split(",");
        } else { var modeVal = {}; }

        $(".item-container li." + value).each(function () {
          var currentval = $(this).attr("data-value");
          var selecterobj = $(this);
          $.each(modeVal, function (key, dbvalue) {
            if (dbvalue.trim().toLowerCase() == currentval.toLowerCase()) {
              $(selecterobj).addClass("active");
            }
          });
        });
      });
    },
    setCheckedValue: function (e,obj) {
      
      var issinglecheck = $(e.currentTarget).attr("data-single");
      if (issinglecheck == undefined) { var issingle = "Y"; } else { issingle = issinglecheck; }
      if (issingle == "Y") {
        var newsetval = [];
        var classname = $(e.currentTarget).attr("class").split(" ");
        newsetval["" + classname[0]] = $(e.currentTarget).attr("data-value");
        return newsetval;
      }else if (issingle.trim() == "N") {
        // setTimeout(function () {
          var newsetval = [];
          var objectDetails = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          $(".item-container li." + classname[0]).each(function () {
            var isclass = $(this).hasClass("active");
            if (isclass) {
              var vv = $(this).attr("data-value");
              newsetval.push(vv);
            }
          });
          if ( newsetval.length >= 0) {
            var newsetvalue = newsetval.toString();
          }
          else { var newsetvalue = ""; }

          console.log (newsetvalue);
          objectDetails["" + classname[0]] = newsetvalue;
          return objectDetails;
        // }, 100);
      }
    },
    getlookupDropDown:function(parameters,callback){
      console.log(parameters);
      $.ajax({
        url: parameters.url,
        method: 'POST',
        data: { text: parameters.search, tableName: parameters.table, wherec: parameters.where, list: parameters.list },
        datatype: 'JSON',
        beforeSend: function (request) {
          $(".textLoader").show();
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          var listdetails = $("<div/>",{class:"ws-select dropdown-menu bootstrap-select dropdown-content input-group-btn show"});
          $(".textLoader").hide();
          if (res.msg === "sucess" && res.data.length > 0) {
            $.each(res.data, function (index, value) {
              // Assuming value.photo contains the URL of the photo
              var photoUrl = value.photo ? value.photo : 'default-image-url'; // Fallback to a default image if no photo
              listdetails.append(
                '<li><a class="dropdown-item lookupValueSet" data-setto="'+parameters.setto+'" data-record_id="' + value.adminID + '" data-image="'+ PROFILEPHOTOUPLOAD + value.adminID +'/profilePic/'+ photoUrl +'">' +
                '<img src="'+ PROFILEPHOTOUPLOAD + value.adminID +'/profilePic/'+ photoUrl + '" alt="' + value.name + '" style="width:30px;height:30px;margin-right:10px;border-radius:50%;">' +
                value.name + '</a></li>'
              );
            });
          } else {
            listdetails.append('<li><a class="dropdown-item addNewRecord" data-view = "asignee" style="background-color: #5D60A6; color:#ffffff;" > Add New Assignee </a></li>');
          }
          callback(listdetails);
        }
      });
    },
  });

  return multiselectOptions;

});
