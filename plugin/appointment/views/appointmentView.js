
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'fullcalendar',
  'calender',
  'Swal',
  '../../core/views/appSettings',
  '../../core/views/mailView',
  '../views/appointmentSingleView',
  '../collections/appointmentCollection',
  '../models/appointmentDateModel',
  '../models/appointmentFilterOptionModel',
  'text!../templates/appointmentRow.html',
  'text!../templates/appointment_temp.html',
  'text!../templates/appointmentFilterOption_temp.html',
], function ($, _, Backbone, datepickerBT, moment, fullCalendar, calender, Swal, appSettings, mailView, appointmentSingleView, appointmentCollection, appointmentDateModel, appointmentFilterOptionModel, appointmentRowTemp, appointmentTemp, appointmentFilterTemp) {

  var appointmentView = Backbone.View.extend({
    appointment_dates: [],
    completed: 0,
    initialize: function (options) {
      this.toClose = "appointmentFilterView";
      var selfobj = this;
      this.responceData = [];
      this.totalRec = 0;
      $(".profile-loader").show();
      $(".loder").show();
      this.mname = Backbone.history.getFragment();
      const match = this.mname.match(/^appointment(?:\/(\d+))?$/);
      this.appointmentID = options.action;
      this.loadFrom = options.loadfrom;
      if (match) {
        // If the pattern is matched, set this.mname to "appointment"
        this.mname = match[1] ? "appointment" : this.mname;
        this.mname = "appointment"
        // Continue with the rest of the code
        permission = ROLE[this.mname];
        this.pluginId = permission.menuID;
        this.appSettings = new appSettings();
        if (this.loadFrom == "customerActivity") {
          this.openSingleTemp(this.appointmentID);
        }
      }
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      readyState = true;
      this.appointmentList = new appointmentDateModel();
      this.render();
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.appointmentList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: 'active' }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        add_events(selfobj.appointmentList.get("events"));
        $(".profile-loader").hide();
        selfobj.render();
      });

      filterOption = new appointmentFilterOptionModel();
      filterOption.set({ company_id: DEFAULTCOMPANY });
      searchappointment = new appointmentCollection();
      searchappointment.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        setPagging(res.paginginfo, res.loadstate, res.msg);
        selfobj.totalRec = res.paginginfo.totalRecords;
        if (selfobj.totalRec == 0) {
          $('.appointment').hide();
          $('.emptyAppointmentImg').show();
        } else {
          $('.appointment').show();
          $('.emptyAppointmentImg').hide();
        }
      });
      this.collection = searchappointment;
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
    },
    events:
    {
      "blur #textval": "setFreeText",
      "change .range": "setRange",
      "change #textSearch": "settextSearch",
      "click .multiOptionSel": "multioption",
      "click .filterSearch": "filterSearch",
      "click #filterOption": "filterRender",
      "click .resetval": "resetSearch",
      "click .loadview": "loadSubView",
      "change .txtchange": "updateOtherDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "click .calendarbtn": "changeView",
      "click .listbtn": "changeView",
      "click .getEvent": "checkEvent",
      "click .appointmentDelete": "deleteAppointment",
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
    },
    changeView: function (e) {
      let selfobj = this;
      var View = $(e.currentTarget).val();
      if (View == "calendar") {
        $(".calenderView").show();
        $(".calenderListView").hide();
        $(".listbtn").removeAttr("disabled")
        $(".calendarbtn").attr('disabled', 'disabled');
      } else if (View == "list") {
        $(".calenderListView").show();
        $(".calendarbtn").removeAttr("disabled")
        $(".listbtn").attr('disabled', 'disabled');
        $(".calenderView").hide();
        selfobj.filterSearch();
      }
    },
    settextSearch: function (e) {
      var usernametxt = $(e.currentTarget).val();
      filterOption.set({ textSearch: usernametxt });
    },

    openSingleTemp: function (appointmentID) {
      let selfobj = this;
      if (appointmentID != "") {
        new appointmentSingleView({ appointmentID: appointmentID, searchappointment: this, pluginId:selfobj.pluginId });
      }
    },

    deleteAppointment: function (e) {
      e.stopPropagation();
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

      let selfobj = this;
      var id = $(e.currentTarget).attr("data-appointmentID");
      var g_eventID = $(e.currentTarget).attr("data-g-eventid");;
      var status = "delete";
      var action = "changeStatus";
      if (id != "") {
        $.ajax({
          url: APIPATH + 'appointmentMaster/status',
          method: 'POST',
          data: { list: id,g_event:g_eventID, action: action, status: status },
          datatype: 'JSON',
          beforeSend: function (request) {
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") {
              Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
              selfobj.refreshCalender();
              selfobj.filterSearch();
            }
            setTimeout(function () {
              $(e.currentTarget).html(status);
            }, 3000);

          }
        });
      }
    } else if (result.isDenied) {
      Swal.fire('Changes are not saved', '', 'info')
      $('#eventList input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          $(this).prop('checked', false);
        }
      });
      $(".listCheckbox").find('.checkall').prop('checked', false);
      // $(".deleteAll").hide();
    }
    })
  },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      if (!isNaN(Date.parse(e))) {
        new appointmentSingleView({ appointmentID: appointmentID, searchappointment: this, startDate: e,pluginId:selfobj.pluginId});
      }
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      $(".loder").show();
      switch (show) {
        case "singleappointmentData": {
          $('body').find(".loder");
          var appointmentID = $(e.currentTarget).attr("data-appointmentID");
          var appointmentsingleview = new appointmentSingleView({ appointmentID: appointmentID, searchappointment: this,pluginId:selfobj.pluginId });
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
    checkEvent: function (e) {
      var sdate = $(e.currentTarget).find("span").html() + '/' + $('.active-month').html() + '/' + $('.year').html();
      var testDate = moment(sdate).format("YYYY/MM/DD");
      filterOption.set({ textSearch: 'start_date' });
      filterOption.set({ textval: testDate });
      this.filterSearch(false);

    },
    resetSearch: function () {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      const formattedDate = `${year}-${month}-${day}`;
      filterOption.set({ curblog: 0, blogID: null, textval: formattedDate, textSearch: 'start_date', status: 'active,inactive', orderBy: "start_date", order: 'DESC',company_id: DEFAULTCOMPANY });
      $(".multiOptionSel").removeClass("active");
      $("#textval").val("");
      $('#textSearch option[value=appointmentID]').attr('selected', 'selected');
      this.filterSearch(false);
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      let selfobj = this;
      var template = _.template(appointmentRowTemp);
      if (objectModel.attributes.start_date != "0000-00-00") {
        objectModel.attributes.appointmentDay = moment(objectModel.attributes.start_date).format("DD");
        objectModel.attributes.appointmentMonth = moment(objectModel.attributes.start_date).format("MMM");
        objectModel.attributes.appointmentYear = moment(objectModel.attributes.start_date).format("YYYY");
        objectModel.attributes.appointmentStartDates = moment(objectModel.attributes.start_date).format("DD/MM/YYYY");
        objectModel.attributes.appointmentEndDates = moment(objectModel.attributes.end_date).format("DD/MM/YYYY");
      }
      $("#appointmentList").append(template({ appointmentDetails: objectModel }));
    },
    addAll: function () {
      $("#appointmentList").empty();
      let test = this.collection.models
      if (this.collection.models.length === 0) {
        $("#appointmentList").append("");/****<p>No data found</p> */
      }  else{
        this.collection.forEach(this.addOne, this);
      }
    },

    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);

      if (!isexits) {

        var source = appointmentFilterTemp;
        var template = _.template(source);

        var cont = $("<div>");
        cont.html(template());
        cont.attr('id', this.toClose);
        /*  
          INFO
          this line use to hide if any other overlay is open first close it.
        */
        $(".overlay-main-container").removeClass("open");
        // append filter html here
        $(".ws_filterOptions").append(cont);
        /*  
          INFO
          open filter popup by adding class open here
        */
        $(".ws_filterOptions").addClass("open");
        /* 
          INFO
          make current appointment active
        */
        $(e.currentTarget).addClass("active");

      } else {
        // check here we alreay open it or not. if open toggle that popup here
        var isOpen = $(".ws_filterOptions").hasClass("open");
        if (isOpen) {
          $(".ws_filterOptions").removeClass("open");
          $(e.currentTarget).removeClass("active");
          return;
        } else {
          $(e.currentTarget).addClass("active");
          // this function will handel other exiting open popus
        }
      }
      this.setValues();
      rearrageOverlays("Filter", this.toClose, "small");
    },
    setValues: function (e) {
      setvalues = ["status", "orderBy", "order"];
      var selfobj = this;
      $.each(setvalues, function (key, value) {
        var modval = filterOption.get(value);
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
      setTimeout(function () {
        if (e != undefined && e.type == "click") {
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
          if (0 < newsetval.length) {
            var newsetvalue = newsetval.toString();
          }
          else { var newsetvalue = ""; }

          objectDetails["" + classname[0]] = newsetvalue;
          $("#valset__" + classname[0]).html(newsetvalue);
          filterOption.model.set(objectDetails);
        }
      }, 3000);
    },

    refreshCalender: function () {
      let selfobj = this;
      this.appointmentList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: 'active' }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        add_events(selfobj.appointmentList.get("events"));
        console.log(selfobj.appointmentList);
        $(".profile-loader").hide();
        selfobj.render();
      });
    },

    multioption: function (e) {
      var selfobj = this;
      var issinglecheck = $(e.currentTarget).attr("data-single");
      if (issinglecheck == undefined) { var issingle = "N" } else { var issingle = "Y" }
      if (issingle == "Y") {
        var newsetval = [];
        var classname = $(e.currentTarget).attr("class").split(" ");
        newsetval["" + classname[0]] = $(e.currentTarget).attr("data-value");
        filterOption.set(newsetval);

      }
      if (issingle == "N") {
        setTimeout(function () {
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

          if (0 < newsetval.length) {
            var newsetvalue = newsetval.toString();
          }
          else { var newsetvalue = ""; }

          objectDetails["" + classname[0]] = newsetvalue;
          filterOption.set(objectDetails);
        }, 500);
      }
    },
    filterSearch: function (isClose = false) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      searchappointment.reset();
      var selfobj = this;
      readyState = true;
      filterOption.set({ curpage: 0 });
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);

      searchappointment.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();

        setPagging(res.paginginfo, res.loadstate, res.msg);
        selfobj.totalRec = res.paginginfo.totalRecords;
        if (selfobj.totalRec == 0) {
          $('.appointment').hide();
          $('.emptyAppointmentImg').show();
        } else {
          $('.appointment').show();
          $('.emptyAppointmentImg').hide();
        }
        $element.attr("data-currPage", 1);
        $element.attr("data-index", res.paginginfo.nextpage);

        //$(".page-info").html(recset);
        if (res.loadstate === false) {
          $(".profile-loader-msg").html(res.msg);
          $(".profile-loader-msg").show();
        } else {
          $(".profile-loader-msg").hide();
        }

        selfobj.setValues();
      });
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
        searchappointment.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        filterOption.set({ curpage: index });
        var requestData = filterOption.attributes;

        $(".profile-loader").show();
        searchappointment.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          $(".profile-loader").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
        });
      }
    },
    render: function () {
      let selfobj = this;
      var template = _.template(appointmentTemp);
      this.$el.html(template({ closeItem: this.toClose }));
      $(".app_playground").append(this.$el);
      var date = new Date();
      var today = date.getDate();
      $(".loder").hide();
      // Set click handlers for DOM elements
      $(".right-button").click({ date: date }, next_year);
      $(".left-button").click({ date: date }, prev_year);
      $(".month").click({ date: date }, month_click);
      $("#add-button").click({ date: date }, new_event);
      // Set current month as active
      $(".months-row").children().eq(date.getMonth()).addClass("active-month");
      $(".table-row").children().eq(date).addClass("active-date");
      init_calendar(date);
      var events = check_events(today, date.getMonth() + 1, date.getFullYear());
      show_events(events, months[date.getMonth()], today);
      if (selfobj.totalRec == 0) {
        $('.appointment').hide();
        $('.emptyAppointmentImg').show();
      } else {
        $('.appointment').show();
        $('.emptyAppointmentImg').hide();
      }


      var eventsArray = selfobj.appointmentList.get("events");
      var fullCalendarEvents = [];
      if (eventsArray != null) {
        for (var i = 0; i < eventsArray.length; i++) {
          var date = eventsArray[i].date;
          var title = eventsArray[i].title;

          fullCalendarEvents.push({
            title: title,
            start: date
          });
        }
      }

      $('#calendar').fullCalendar({
        header: {
          left: 'prev',
          center: 'title',
          right: 'next',
        },
        eventClick: function (event) {
          if (event.url) {
            window.open(event.url);
            return false;
          }
        },
        dayClick: function (date) {
          selfobj.loadSubView(date.format());
        },
        eventLimit: true, // allow "more" link when too many events
        events: fullCalendarEvents
      });

      setToolTip();

      return this;

    }
  });

  return appointmentView;

});
