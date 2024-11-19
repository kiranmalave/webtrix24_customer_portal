define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
  'customDashboard',
  'Swal',

  '../collections/dashboardCollection',

  '../models/dashboardSingleModel',

  '../views/dashboardElements',
  // INCLUDED DASHBOARD ELEMENTS FROM DASHBOARD COMPONENTS
  '../../finance_components/income/views/incomeView',

  // LEADS
  '../../lead_Components/stages_wise_lead/views/stagesWiseLeadView',
  '../../lead_Components/unattended_lead/views/unattendedLeadView',
  '../../lead_Components/source_wise_lead/views/sourceWiseLeadView',

  'text!../templates/dashboard_temp.html',
], function ($, _, Backbone, custom, customDashboard, Swal, dashboardCollection, dashboardSingleModel, dashboardElements,
  // INCLUDED DASHBOARD ELEMENTS FROM DASHBOARD COMPONENTS
  incomeView,
  stagesWiseLeadView,
  unattendedLeadView,
  sourceWiseLeadView,
  dashBoard_temp) {

  var dashboardView = Backbone.View.extend({
    tagName: "div",
    initialize: function (options) {
      selfobj = this;
      this.collection = new dashboardCollection();
      this.model = new dashboardSingleModel();
      this.dashboard_id = null;
      this.model.set({ 'user_id': $.cookie('authid') });
      this.getDashboard();
      selfobj.render();
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    events:
    {
      "click .create-dash-btn": "createNewDashboard",
      "blur #dashboard_title": "saveDashboardTitle",
      "click .tab_bar_action": "tabBarAction",
      "blur .dash_title_edit": "updateDashboard",
      "click .changeDashboard": "changeDashboard",
      "click .add_dash_elements": "addDashboardElements",
    },
    // GET DASHBOARD LISTS
    getModuleData: function () {
      var selfobj = this;
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post',
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },
    // CHANGE DASHBOARD
    changeDashboard: function (e) {
      var selfobj = this;
      var dash_id = $(e.currentTarget).attr('data-dash_id');
      if (dash_id) {
        selfobj.model.set({ dashboard_id: dash_id });
        selfobj.getDashboard();
      }
    },
    // GET ACTIVE DASHBOARD
    getDashboard: function () {
      var selfobj = this;
      selfobj.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, data: { menuId: selfobj.model.get("menuId") }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.getModuleData();
      });
    },
    // ADD DASHBOARD ELEMENTS
    addDashboardElements: function (e) {
      var selfobj = this;
      var dash_id = $(e.currentTarget).attr('data-id');
      if (dash_id) {
        var Dashele = new dashboardElements({ parentObj: selfobj, model: selfobj.model });
      }
    },
    // CREATE NEW DASHBOARD
    createNewDashboard: function (e) {
      e.stopPropagation();
      $('.create-dash').addClass('active');
      // Reset the model completely for new dashboard
      selfobj.model = new dashboardSingleModel();
      selfobj.model.set({
        'user_id': $.cookie('authid'),
        'dashboard_id': null,
        'details': '{}',  // Initialize with empty details
        'status': 'active'
      });
      $('#dashboard_title').focus();
    },
    // SAVE DASHBOARD TITLE
    saveDashboardTitle: function () {
      var dashTitle = $('#dashboard_title').val();
      if (dashTitle != '') {
        let selfobj = this;
        var dashboard_id = this.model.get("dashboard_id");

        // Set only the necessary attributes for a new dashboard
        this.model.set({
          'name': dashTitle,
          'body': ' ',
          'details': '{}' // Ensure new dashboard starts with empty details
        });

        if (dashboard_id == "" || dashboard_id == null) {
          var methodt = "PUT";
        } else {
          var methodt = "POST";
        }

        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'SadminID': $.cookie('authid'),
            'token': $.cookie('_bb_key'),
            'Accept': 'application/json'
          },
          error: selfobj.onErrorHandler,
          type: methodt,
          success: function (model, response) {
            if (response.flag == "F") {
              showResponse('', { flag: 'F', msg: response.msg }, '');
            }
            if (response.statusCode == 994) {
              app_router.navigate("logout", { trigger: true });
            }
            if (response.flag == 'S') {
              // Set this new dashboard as active
              const newDashId = response.data.dashboard_id;

              // First refresh the module data
              selfobj.getModuleData();

              // After a brief delay to ensure DOM is updated
              setTimeout(function () {
                // Find and activate the new dashboard tab
                const newTab = $('.nav-link[data-dash_id="' + newDashId + '"]');
                $('.nav-link').removeClass('active');
                newTab.addClass('active').tab('show');

                // Update URL to reflect new dashboard
                app_router.navigate(`dashboard/${newDashId}`, { trigger: true });

                // Add visual indicator for active state (underline)
                newTab.css('text-decoration', 'underline');
              }, 100);
            }
          }
        });
        $('#dashboard_title').val('');
      }
      $('.create-dash').removeClass('active');
    },
    updateDashboard: function (e) {
      e.stopPropagation();
      var editable_nav = $('.nav-item').find('.nav-link.dash_title_edit');
      var name = editable_nav.text();
      var dashboard_id = editable_nav.attr('data-dash_id');
      var dashTitle = $('#dashboard_title').val();
      if (name != '') {
        $.ajax({
          url: APIPATH + 'dashboard/update',
          method: 'POST',
          data: { name: name, dashboard_id: dashboard_id, },
          datatype: 'JSON',
          beforeSend: function (request) {
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") showResponse('', res, '');
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
              selfobj.getModuleData();
            }
          }
        });
      }
    },
    // EDIT DASHBOARD NAME AND DELETE DASHBOARD
    tabBarAction: function (e) {
      var selfobj = this;
      var action = $(e.currentTarget).attr('data-action');
      var dash_id = $(e.currentTarget).attr('data-dash_id');
      switch (action) {
        case 'edit':
          selfobj.editDashboardtitle(e);
          break;
        case 'delete':
          selfobj.deleteDashboard(dash_id);
          break;

        default:
          break;
      }
    },
    // EDIT DASHBOARD
    editDashboardtitle: function (e) {
      $('.nav-item').find('.nav-link').removeClass('dash_title_edit');
      var ele_a = $(e.currentTarget).closest('.nav-item').find('.nav-link');
      ele_a.attr({ contenteditable: "true" });
      ele_a.addClass('dash_title_edit');
      ele_a.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      const element = ele_a[0];
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    },
    // DELETE DASHBOARD
    deleteDashboard: function (dash_id) {
      if (dash_id) {
        Swal.fire({
          title: "Delete Dashboard",
          text: "",
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Delete',
          animation: "slide-from-top",
        }).then((result) => {
          if (result.isConfirmed) {
            $.ajax({
              url: APIPATH + 'dashboard/delete',
              method: 'POST',
              data: { dashboard_id: dash_id },
              datatype: 'JSON',
              beforeSend: function (request) {
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                if (res.flag == "F") showResponse('', res, '');
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                  selfobj.getModuleData();
                }
              }
            });
          }
        });
      }
    },
    // RENDER DASHBOARD ELEMENTS
    renderDashboard: function () {
      var selfobj = this;
      var elements = selfobj.model.get('details');
      if (elements && elements.length > 2) {
        elements = JSON.parse(elements);
        for (const [key1, value] of Object.entries(elements)) {
          switch (value.type) {
            case 'income':
              new incomeView({ dashboard_id: selfobj.model.get('dashboard_id'), dashboardObj: this, currentElement: value });
              break;
            // case 'expenses':
            //   new expensesView({ dashboard_id: selfobj.model.get('dashboard_id'), dashboardObj: this, currentElement: value });
            //   break;
            case 'stages_wise_list':
              new stagesWiseLeadView({ dashboard_id: selfobj.model.get('dashboard_id'), dashboardObj: this, currentElement: value });
              break;
            case 'unattended_leads':
              new unattendedLeadView({ dashboard_id: selfobj.model.get('dashboard_id'), dashboardObj: this, currentElement: value });
              break;
            case 'source_wise_list':
              new sourceWiseLeadView({ dashboard_id: selfobj.model.get('dashboard_id'), dashboardObj: this, currentElement: value });
              break;
            default:
              break;
          }
        }
      } else {
        $('#empty_temp_' + selfobj.model.get('dashboard_id')).show();
      }
    },
    // DRAGG AND DROP 
    setupSortable: function () {
      var selfobj = this;
      this.$el.find(".dash_temp").sortable({
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        items: '>.ui-sortable-handle',
        cursor: 'grabbing',
        start: function (event, ui) {
          ui.placeholder.height(ui.item.outerHeight());
          ui.placeholder.width(ui.item.outerWidth());
          ui.item.addClass('dragging');
        },
        stop: function (event, ui) {
          setTimeout(function () {
            selfobj.updateElementsIndex();
          }, 100);
        }
      });
    },
    updateElementsIndex: function () {
      var structure = this.model.get('details');
      var dashboard_id = this.model.get('dashboard_id');
      var serializedData = $(".dash_temp .ui-sortable-handle").map(function () {
        return $(this).attr("data-ele_id");
      }).get();
      if (structure) {
        var sortedStucture = {};
        structure = JSON.parse(structure);
        serializedData.map((struct, index) => {
          structure[struct].index = index + 1;
          sortedStucture[struct] = structure[struct];
        });
        sortedStucture = JSON.stringify(sortedStucture);
        if (sortedStucture != '') {
          $.ajax({
            url: APIPATH + 'dashboard/update',
            method: 'POST',
            data: { details: sortedStucture, dashboard_id: dashboard_id, },
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F") showResponse('', res, '');
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            }
          });
        }
      }
    },
    render: function () {
      var selfobj = this;
      var template = _.template(dashBoard_temp);
      var temp = template({ dashboardList: this.collection.models, model: selfobj.model.attributes });
      this.$el.html(temp);
      $(".main_container").append(this.$el);
      this.renderDashboard();
      this.setupSortable();
      return this;
    },
  });
  return dashboardView;
});
