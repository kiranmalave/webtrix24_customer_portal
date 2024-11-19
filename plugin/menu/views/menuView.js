
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'Swal',
  '../views/menuSingleView',
  '../collections/menuCollection',
  '../models/menuFilterOptionModel',
  '../../core/views/appSettings',
  '../../core/views/mailView',
  'text!../templates/menuRow.html',
  'text!../templates/menuRowDragble.html',
  'text!../templates/menu_temp.html',
  'text!../templates/menuFilterOption_temp.html',
], function ($, _, Backbone, datepickerBT,Swal, menuSingleView, menuCollection, menuFilterOptionModel,appSettings, mailView, menuRowTemp, menuRowDragable, menuTemp, menuFilterTemp) {

  var menuView = Backbone.View.extend({
    recordCount: 0,
    setupNest:null,
    initialize: function (options) {
      this.toClose = "menuFilterView";
      var selfobj = this;
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      getLocalData();
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.menuId = permission.menuID;
      this.appSettings = new appSettings();
      this.appSettings.initialize({parentObj:this});
      this.render();
      this.filterOption = new menuFilterOptionModel();
      this.collection = new menuCollection();
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
      });
      
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
      "click .deleteModule": "deleteModule",
      "click .row-action": "minimizeChild",
      "click .refreshMenu": "sidebarUpdates",
    },
    updateOtherDetails: function (e) {

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.filterOption.set(newdetails);
    },
    settextSearch: function (e) {
      var usernametxt = $(e.currentTarget).val();
      this.filterOption.set({ textSearch: usernametxt });
    },
    deleteModule:function(e){
      var selfobj = this;
      var menuID = $(e.currentTarget).attr("data-menuID");
      var custom_module = '';
      var menuCollection = [];
      var swalText = '';
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") showResponse(e,res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        menuCollection = res.data;
        var menuItem = menuCollection.find((item) => {
          if (item.menuID == menuID) {
            return true; 
          } else {
            return item.subMenu.find((menu) => {
              return menu.menuID == menuID;
            });
          }
        });
        custom_module = menuItem ? menuItem.custom_module : '';
        if(custom_module == 'yes'){
          swalText = "After you delete this menu, all the associated data removed from our system .";
        }else{
          swalText ="After you delete this menu, all associated data will be permanently removed from our system and cannot be restored. Please ensure that you have backed up any crucial data and double-check your decision before proceeding with the deletion.";
        }
        Swal.fire({
          title: 'Are you Sure you want to delete?',
          text: swalText, 
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Delete',
          denyButtonText: `Cancel`,
          icon: "question",
        }).then((result) => {
          if (result.isConfirmed) {
            $.ajax({
              url: APIPATH + 'menuMaster/status',
              method: 'POST',
              data: { list: menuID, action:"permanentDelete" },
              datatype: 'JSON',
              beforeSend: function (request) {
                //$(e.currentTarget).html("<span>Updating..</span>");
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
                  // selfobj.filterSearch();
                  selfobj.sidebarUpdates();
                }
                setTimeout(function () {
                  $(e.currentTarget).html(status);
                }, 3000);
              }
            });
          }
        });
      });
    },
    changeStatusListElement: function (e) {
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      $('#menuList input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-menuID"));
        }
      });

      $(".action-icons-div").hide();
      $(".memberlistcheck").click(function () {
        if ($(this).is(":checked")) {
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
        url: APIPATH + 'menuMaster/status',
        method: 'POST',
        data: { list: idsToRemove, action: action, status: status },
        datatype: 'JSON',
        beforeSend: function (request) {
          //$(e.currentTarget).html("<span>Updating..</span>");
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
            // selfobj.filterSearch();
            selfobj.sidebarUpdates();
          }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 3000);

        }
      });
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "singlemenuData": {
          var menuID = $(e.currentTarget).attr("data-menuID");
          var menusingleview = new menuSingleView({ menuID: menuID, searchmenu: this });
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
    resetSearch: function (e) {
      var selfobj = this;
      //filterOption.set({curpage:0,menuID:null,textval: null,textSearch:'menuName',status:'active',orderBy:'createdDate',order:'DESC'});
      //filterOption.reset();
      this.filterOption.clear().set(this.filterOption.defaults);
      $(".multiOptionSel").removeClass("active");
      $("#textval").val("");
      $('#textSearch option[value=menuID]').attr('selected', 'selected');
      // this.filterSearch(false);
      selfobj.sidebarUpdates();
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      // //var template3 = _.template(menuRowTemp);
      // var template = _.template(menuRowDragable);
      // //$("#menuList").append(template3({menuDetails:objectModel}));
      // $("#dd-list").append(template({ menuDetails: objectModel }));
      // this.recordCount++;
      // if (this.recordCount >= this.collection.models.length && this.setupNest != true) {
      //   this.createNestable();
      // }


      var template = _.template(menuRowDragable);
      var permissions = ROLE[objectModel.get('menuName')];
      $("#dd-list").append(template({ menuDetails: objectModel,permissions:permissions }));
      this.recordCount++;
      if (this.recordCount >= this.collection.models.length && this.setupNest != true) {
        this.createNestable();
      }   
    },

    createNestable: function () {
      let selfobj = this;
      
      $('#nestableMenu').nestable({
        maxDepth: 2,
        group: $(this).prop('id')
      });
      $('#nestableMenu').on('change', function () {
        var $this = $(this);
        var serializedData = window.JSON.stringify($(this).nestable('serialize'));
        setTimeout(function () { selfobj.savePositions(); }, 100);
      });
      this.setupNest= true;
    
    },

    addAll: function () {
      //$("#menuList").empty();
      $("#dd-list").empty();
      this.collection.forEach(this.addOne, this);

    },
    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);

      if (!isexits) {

        var source = menuFilterTemp;
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
          make current menu active
        */
        $(e.currentTarget).addClass("active");
        // $("#installDateFrom").datepickerBT({
        //   todayBtn:  1,
        //   autoclose: true,
        //   format:"yyyy/mm/dd",
        // }).on('changeDate', function (selected) {
        //   var minDate = new Date(selected.date.valueOf());
        //   $('#installDateTo').datepickerBT('setStartDate', minDate);
        // });

        // $("#installDateTo").datepickerBT({format:"yyyy/mm/dd",autoclose: true})
        //   .on('changeDate', function (selected) {
        //       var minDate = new Date(selected.date.valueOf());
        //       $('#installDateFrom').datepickerBT('setEndDate', minDate);
        // });
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
        var modval = selfobj.filterOption.get(value);
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
          this.filterOption.model.set(objectDetails);
        }
      }, 3000);
    },
    multioption: function (e) {
      var selfobj = this;
      var issinglecheck = $(e.currentTarget).attr("data-single");
      if (issinglecheck == undefined) { var issingle = "N" } else { var issingle = "Y" }
      if (issingle == "Y") {
        var newsetval = [];
        var classname = $(e.currentTarget).attr("class").split(" ");
        newsetval["" + classname[0]] = $(e.currentTarget).attr("data-value");
        selfobj.filterOption.set(newsetval);

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
          selfobj.filterOption.set(objectDetails);
        }, 500);
      }
    },
    filterSearch: function (isClose = false) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      this.recordCount = 0;
      this.collection.reset();
      var selfobj = this;
      readyState = true;
      this.filterOption.set({ curpage: 0 });
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);

      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        //setPagging(res.paginginfo,res.loadstate,res.msg);  
        $element.attr("data-currPage", 1);
        // $element.attr("data-index", res.paginginfo.nextpage);
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
        this.collection.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        selfobj.filterOption.set({ curpage: index });
        var requestData = selfobj.filterOption.attributes;

        $(".profile-loader").show();
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          $(".profile-loader").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          //setPagging(res.paginginfo,res.loadstate,res.msg);  
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
        });
      }
    },

    savePositions: function () {
      var selfobj = this;
      var positions = [];
      $('.updated').each(function () {
        positions.push([$(this).attr('data-index'), $(this).attr('data-position')])
        $(this).removeClass('updated');
      })
      var positionsToSave = positions;
 
      var action = "changePositions";

      var serializedData = window.JSON.stringify($("#nestableMenu").nestable('serialize'));

      $.ajax({
        url: APIPATH + 'systemMenuUpdatePositions',
        method: 'POST',
        data: { positions: positionsToSave, action: action, menuIDs: serializedData },
        datatype: 'JSON',
        beforeSend: function (request) {
          // $(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          // selfobj.sidebarUpdates();
          $('#refreshMenu').show();
          if (res.flag == "F")
            showResponse(e,res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        }
      });

    },

    minimizeChild: function(e) {
      var state = $(e.currentTarget).attr("data-state");
      if (state === "minimize") {
          $(e.currentTarget).html("expand_less");
          $(e.currentTarget).parents('li.dd-item').find('.submenuList').addClass("hide");
          $(e.currentTarget).attr("data-state", "maximize");
          $(e.currentTarget).attr("title", "Maximize");
      } else {
          $(e.currentTarget).html("expand_more");
          $(e.currentTarget).attr("data-state", "minimize");
          $(e.currentTarget).attr("title", "Minimize");
          $(e.currentTarget).parents('li.dd-item').find('.submenuList').removeClass("hide");
      }
    },

    sidebarUpdates: function(){
      this.appSettings.sidebarUpdate();
      $('#refreshMenu').hide();
    },
  
    render: function () {
      var selfobj = this;
      var template = _.template(menuTemp);
      this.$el.html(template({ closeItem: this.toClose }));
      $(".app_playground").append(this.$el);
      console.log("here render Called!!");
      setToolTip();
      return this;
    }
  });

  return menuView;

});
