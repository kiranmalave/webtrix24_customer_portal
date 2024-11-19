define([
    'jquery',
    'underscore',
    'backbone',
    'custom',
    'Swal',
    'moment',
    'slim',
    "../../core/views/multiselectOptions",
    "../../core/views/timeselectOptions",
    '../../core/views/mailView',
    '../../task/views/taskSingleView',
    '../../appointment/views/appointmentSingleView',
    '../collections/customerActivityCollection',
    '../models/dashboardModel',
    '../views/customerSingleView',
    '../views/customerNotesView',
    '../models/customerSingleModel',
    '../../core/collections/historyCollection',
    '../../task/views/taskViewDashbord',
    '../../taxInvoice/views/taxInvoiceView',
    'text!../templates/clientdashboard_temp.html',

  ], function ($, _, Backbone, custom, Swal, moment, slim, multiselectOptions, timeselectOptions, mailView, taskSingleView, appointmentSingleView, customerActivityCollection, dashboardModel, customerSingleView, customerNotesView, customerSingleModel, historyCollection, taskViewDashbord, taxInvoiceView, clientdashBoard_temp ) {
  
    var dashboardView = Backbone.View.extend({
      model: dashboardModel,
      tagName: "div",
      customerName:"",
      initialize: function (options) {
        this.customerID = options.action;
        this.multiselectOptions = new multiselectOptions();
        this.customerModel = new customerSingleModel();
        this.timeselectOptions = new timeselectOptions();
        this.menuId = options.menuId;
        var selfobj = this;
        if (this.customerID != "") {
          this.customerModel.set({ customer_id: this.customerID });
          this.customerModel.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            },data:{menuId:this.menuId}, error: selfobj.onErrorHandler
          }).done(function (res) {
            var birthDate = selfobj.customerModel.get("birth_date");
            if (birthDate != null && birthDate != "0000-00-00") {
              selfobj.customerModel.set({ "birth_date": moment(birthDate).format("DD-MM-YYYY") });
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
            selfobj.render();
          });
        }
        
          this.pastHistoryList = new customerActivityCollection();
          this.pastHistoryList.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: 'post', data: {historyType:'past', customer_id:selfobj.customerID}
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
            selfobj.preparePasttime();
          });
          this.upcomingHistoryList = new customerActivityCollection();
          this.upcomingHistoryList.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: 'post', data: {historyType:'upcoming', customer_id:selfobj.customerID}
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
            selfobj.prepareUpcomingtime();
            selfobj.render();
          });
      },
      events:
      {
        "change .saveOtherDetail": "updateDetails",
        "click .getPaymentData": "getPaymentDetails",
        "click .showOverlay": "showOverlay",
        "click .loadview" : "loadSubView",
        "click .tablinks": "tablinks",
        "click .multiSel": "setValues",
      },
      onErrorHandler: function (collection, response, options) {
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
      },
      addOne: function (objectModel) {
        console.log(this.model);
      },
      preparePasttime: function () {
        let selfobj = this;
        var models = this.pastHistoryList.models;
        for (var i = 0; i < models.length; i++) {
          var model = models[i];
          var timestamp = model.get('activity_date');
          selfobj.timeselectOptions.displayRelativeTime(timestamp);
          model.set({ "timeString": selfobj.timeselectOptions.displayRelativeTime(timestamp) });
        }
        this.customerName = this.customerModel.get('name');
        this.render();
      },
      prepareUpcomingtime: function () {
        let selfobj = this;
        var models = this.upcomingHistoryList.models;
        for (var i = 0; i < models.length; i++) {
          var model = models[i];
          var timestamp = model.get('activity_date');
          selfobj.timeselectOptions.displayRelativeTime(timestamp);
          model.set({ "timeString": selfobj.timeselectOptions.displayRelativeTime(timestamp) });
        }
        this.customerName = this.customerModel.get('name');
        this.render();
      },
      updateNote: function (e) {
        var note = $(e.currentTarget).val();
        this.model.set({ note: note });
      },
      loadSubView:function(e){
        var show = $(e.currentTarget).attr("data-view");
        switch(show){
          case "singlecustomerview":{
            var customer_id = $(e.currentTarget).attr("data-customer_id");
            new customerSingleView({customer_id: customer_id,loadfrom:"dashboard", searchCustomer:this, menuId: this.menuId });
            break;
          }
          case "mailView":{
            $(".customMail").show();
            $('.customMail').remove('maxActive');
            var customer_id = $(e.currentTarget).attr("data-customer_id");
            var cust_name = $(e.currentTarget).attr("data-first_name");
            var cust_mail = $(e.currentTarget).attr("data-custMail");
            new mailView({ customer_id: customer_id, customerName: cust_name, customer_mail: cust_mail });
            $('body').find(".loder").hide();
            break;
          }
          case "notes": {
            $('#NoteModal').modal('toggle');
            var customer_id = $(e.currentTarget).attr("data-customer_id");
            var cust_name = $(e.currentTarget).attr("data-first_name");
            var stage_id = $(e.currentTarget).attr("data-stageid");
            new customerNotesView({ customer_id: customer_id, customerName: cust_name, stageID: stage_id, searchCustomer: this });
            $('body').find(".loder").hide();
            break;
          }
          case "task": {
            var customer_id = $(e.currentTarget).attr("data-customer_id");
            var cust_name = $(e.currentTarget).attr("data-first_name");
            new taskSingleView({ customer_id: customer_id, customerName: cust_name, loadFrom: "customer", searchtask: this, menuName: 'task' });
            $('body').find(".loder").hide();
            break;
          }
          case "appointment": {
            var customer_id = $(e.currentTarget).attr("data-customer_id");
            var cust_name = $(e.currentTarget).attr("data-first_name");
            var cust_mail = $(e.currentTarget).attr("data-email");
            new appointmentSingleView({ customer_id: customer_id, customerName: cust_name, cust_mail: cust_mail, loadFrom: "customer", searchappointment: this })
            $('body').find(".loder").hide();
            break;
          }
        }
      },
  
      showOverlay: function (e) {
        var view = $(e.currentTarget).data("view");
        switch (view) {
          
        }
      },
      getBannersDetails: function (e) {
        $.ajax({
          url: APIPATH + 'bannersCountDetails/',
          method: 'GET',
          data: {},
          datatype: 'JSON',
          beforeSend: function (request) {
            $(e.currentTarget).find("i").addClass("rotating");
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
  
            $.each(res.data, function (key, val) {
              $(".bannersinfo__" + key).html(val);
            });
            $(e.currentTarget).find("i").removeClass("rotating");
  
          }
        });
      },

      refreshDashboard: function(customerID){
        let selfobj = this;
        this.customerModel.set({ customer_id: customerID });
        this.customerModel.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          },data:{menuId:this.menuId}, error: selfobj.onErrorHandler
        }).done(function (res) {
          var birthDate = selfobj.customerModel.get("birth_date");
          if (birthDate != null && birthDate != "0000-00-00") {
            selfobj.customerModel.set({ "birth_date": moment(birthDate).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      },
  
      tablinks:function(e){
        let selfobj = this;
        let ctab = $(e.currentTarget).attr("data-type");
        $(".tablinks").removeClass("active");
        $(".taskcard").hide();
        $(e.currentTarget).addClass("active");
        $("#"+ctab).show();
        if(ctab =="projects"){
          $("#projectListOther").empty();
          $("#invoice").hide();
          new projectViewOther({ action:"", customerID: selfobj.customerID, loadFrom:"dashboard"});
        }else if(ctab =="task"){
          $("#invoice").hide();
          new taskViewDashbord({ action:"", customerID: selfobj.customerID, custName: this.customerName});
        }else if(ctab == "invoice"){
          $("#invoice").empty();
          new taxInvoiceView({action: "", customerID: selfobj.customerID, loadFrom: "custDashboardInvoice"}) 
        }
      }, 

      setValues: function (e) {
        var selfobj = this;
        var da = selfobj.multiselectOptions.setCheckedValue(e);
        selfobj.model.set(da);


      },
  
      render: function () {
        var selfobj = this;
        var template = _.template(clientdashBoard_temp);
        var res = template({"customerModel":this.customerModel, "pastHistoryList":this.pastHistoryList.models, "upcomingHistoryList":this.upcomingHistoryList.models});
        this.$el.html(res);
        $(".app_playground").append(this.$el);
        setToolTip();
        if(this.pastHistoryList.models.length == 0){
          $('.pastActivitiesTimeline').append('<li><div class="clientNoPastActivities"><h5>No Past Activities</h5></div></li>')
        }
        if(this.upcomingHistoryList.models.length == 0)[
          $('.upcomingActivitiesTimeline').append('<li><div class="clientNoUpcomingActivities"><h5>No Upcoming Activities</h5></div></li>')
        ]
        var slim = $('.slim').slim();
        // Listen for the Slim's onUpload event
        slim.on('slim.upload', function (e, data) {
          // Handle onUpload event here
          console.log('Image has been uploaded.');
          console.log('Uploaded data:', data); // Data contains information about the uploaded image
        });
        $('#clientProfilePic').slim({
          ratio: '1:1',
          minSize: {
            width: 100,
            height: 100,
          },
          size: {
            width: 100,
            height: 100,
          },
          push: true,
          rotateButton: true,
          service: APIPATH + 'changeClientPic/' + this.customerID,
          download: false,
          willSave: function (data, ready) {
            //alert('saving!');
            ready(data);
          },
          
          didUpload: function (error, data, response) {
            var expDate = new Date();
            $(".overlap").css("display", "block");
            var newimage = $("#profilepic").find('img').attr("src");
            var fileName = response.newFileName
            $.cookie('photo', fileName);
            $.cookie('avtar', newimage, { path: COKI, expires: expDate });
            $("#myAccountRight").css("background-image", "url('" + newimage + "')");
          },
          willTransform: function (data, ready) {
            if ($("#profilepic").hasClass("pending")) {
              $(".overlap").css("display", "block");
            } else {
              var expDate = new Date();
              var newimage = $("#profilepic").find('img').attr("src");
              $.cookie('avtar', newimage, { path: COKI, expires: expDate });
              $("#myAccountRight").css("background-image", "url('" + newimage + "')");
            }
            ready(data);
          },
          willRemove: function (data, remove) {
            remove();
            var memberID = selfobj.customerID;
            console.log(selfobj.customerID);
            $.ajax({
              url: APIPATH + 'delClientPic/' + memberID,
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
  
                if (res.statusCode == 994) { app_router.navigate("bareback-logout", { trigger: true }); }
              }
            });
            remove();
          },
          label: 'Click here to add new image or Drop your image here.',
          buttonConfirmLabel: 'Ok',
          meta: {
            memberID: selfobj.customerID
          }
        });
        new taskViewDashbord({ action:"", customerID: this.customerID, custName: this.customerName}); 
        return this;
      },
  
  
    });
  
    return dashboardView;
  
  });
  