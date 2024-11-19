define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  'Quill',
  '../../core/views/campaignConditionsView',

  '../../customer/views/customerView',      // Leads, Customers
  '../../admin/views/adminView',
  '../../taxInvoice/views/taxInvoiceView',   // Quotations, Invoices
  '../../task/views/taskView',               // Tasks, AMC, Tickets
  '../../appointment/views/appointmentView', // Appointment
  '../../projects/views/projectsView',       // Projects

  'text!../templates/conditionSelectorTemp.html',
  'text!../templates/addModuleRow.html',
  'text!../templates/addModule.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Swal, Quill, conditionsView, customerView, adminView, taxInvoiceView, taskView, appointmentView, projectsView, conditionSelectorTemp, addModuleRow, addModule) {

  var conditionSelector = Backbone.View.extend({
    form_label: '',
    initialize: function (options) {
      this.rowCounter = 2;
      this.moduleList = [];
      this.moduleObjList = {
        // leads : {},
        // customers : {},
        // app_users : {},
        // task:{}
      };
      this.parentObj = (options.parentObj) ? options.parentObj : null;
      this.target_table_conditions = {};
      this.menuAccess = (this.parentObj.menuAccess) ? this.parentObj.menuAccess : null;
      this.target_audience = (this.parentObj.model.get("target_audience")) ? this.parentObj.model.get("target_audience") : null;
      this.configMap = {
        leads: {
          module: 'leads',
          viewType: 'leadsView',
          viewClass: customerView,
          appendTo: 'leads',
          campaignModule: 'leads'
        },
        customers: {
          module: 'customers',
          viewType: 'customerView',
          viewClass: customerView,
          appendTo: 'customers',
          campaignModule: 'customer'
        },
        app_users: {
          module: 'app_users',
          viewType: 'adminView',
          viewClass: adminView,
          appendTo: 'app_users',
          campaignModule: 'usersList'
        },
        task: {
          module: 'task',
          viewType: 'taskView',
          viewClass: taskView,
          appendTo: 'task',
          campaignModule: 'task'
        },
        ticket: {
          module: 'task',
          viewType: 'taskView',
          viewClass: taskView,
          appendTo: 'ticket',
          campaignModule: 'ticket'
        },
        amc: {
          module: 'amc',
          viewType: 'taskView',
          viewClass: taskView,
          appendTo: 'amc',
          campaignModule: 'amc'
        },
        invoice: {
          module: 'invoice',
          viewType: 'taxInvoiceView',
          viewClass: taxInvoiceView,
          appendTo: 'invoice',
          campaignModule: 'invoice'
        },
        quotation: {
          module: 'quotation',
          viewType: 'taxInvoiceView',
          viewClass: taxInvoiceView,
          appendTo: 'quotation',
          campaignModule: 'quotation'
        },
        appointment: {
          module: 'appointment',
          viewType: 'appointmentView',
          viewClass: appointmentView,
          appendTo: 'appointment',
          campaignModule: 'appointment'
        },
      };
      this.getMenuList();
      this.render();
    },
    events:
    {
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "change .logoAdded": "updateImageLogo",
      "click .addNewModuleRow": "addNewModule",
      "click .removeModule": "removeModule",
      // "click .defModuleName": "removeModule",
      "change  #select_module": "selectModule",

    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    getMenuList: function () {
      this.filteredModules = [];
      if (this.target_audience == 'leads') {
        this.moduleList = ['quotation', 'task']
      } else if (this.target_audience == 'customers') {
        this.moduleList = ['quotation', 'task', 'appointment', 'invoice', 'projects', 'amc', 'ticket'];
      } else if (this.target_audience == 'app_users') {
        this.moduleList = ['quotation', 'task', 'appointment', 'invoice', 'projects', 'amc', 'ticket', 'leads', 'customer'];
      }
      this.moduleList.forEach(element => {
        if (this.menuAccess) {
          Object.entries(this.menuAccess).forEach(([key, value]) => {
            if (key == element) {
              this.filteredModules.push({
                menuName: value.menuName,
                menuID: value.menuID,
                menuLink: value.menuLink,
              });
            }
          });
        }
      });
    },
    updateOtherDetails: function (e) {
      var newdetails = [];
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      newdetails["" + toName] = valuetxt;
    },
    addNewModule: function (e) {
      var selfobj = this;
      selfobj.undelegateEvents();
      var source = addModuleRow;
      var template = _.template(source);
      $(".campaign_details_view .addedModuleRow").show().append(template({ modules: this.filteredModules }));
      this.$('.addNewModuleRow').hide();
      selfobj.delegateEvents();
    },
    removeModule: function (e) {
      var selfobj = this;
      var menuIdDelete = $(e.currentTarget).attr('data-id');
      if (menuIdDelete) {
        if (this.parentObj.conditions != {}) {
          if (this.parentObj.conditions[menuIdDelete]) {
            delete this.parentObj.conditions[menuIdDelete];
            $(e.currentTarget).closest('.addModuleRowDef').remove();
            this.$('.addNewModuleRow').show();
          }
        }
      }
    },
    selectModule: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      if (valuetxt != '') {
        const config = this.configMap[valuetxt];
        if (config) {
          var obj = {};
          obj[config.viewType] = new config.viewClass({ fromCampaign: 'yes', campaignModule: config.campaignModule, isDef: false });
          config.menuID = obj[config.viewType].menuId;
          config.isDef = false;
          config.index = Math.round(Math.random() * (5 - 1) + 1);
          obj.conditionsView = new conditionsView({ parentObj: obj[config.viewType], appendTo: config.appendTo, campaingObj: this.parentObj, index: config.index });
          this.moduleObjList[config.module] = obj;
          this.parentObj.moduleList = this.moduleObjList;
          selfobj.addModule(config, this.moduleObjList[config.module]);
        }
      }
      console.assert('Module Obj List :', this.moduleObjList);
    },
    addModule: function (config, moduleObjList) {
      var selfobj = this;
      var source = addModule;
      var template = _.template(source);
      $(".addNewModuleRow").before(template({ module: config.module, menuID: config.menuID, isDef: config.isDef }));
      this.$('.addedModuleRow').hide();
    },
    renderConditions: function () {
      var selfobj = this;
      selfobj.parentObj.conditions = Object.fromEntries(
        Object.entries(selfobj.parentObj.conditions).sort(([, a], [, b]) => a.index - b.index)
      );
      if (Object.keys(selfobj.parentObj.conditions).length !== 0) {
        Object.entries(selfobj.parentObj.conditions).forEach(([key, value]) => {
          var link = value.menuLink;
          var source = addModule;
          var template = _.template(source);
          if (value.menuLink == 'usersList') {
            link = 'app_users';
          } else if (value.menuLink == 'customer') {
            link = 'customers';
          }
          var config = this.configMap[link];
          if (config) {
            var obj = {};
            obj[config.viewType] = new config.viewClass({ fromCampaign: 'yes', campaignModule: config.campaignModule, isDef:value.isDef  });
            config.menuID = obj[config.viewType].menuId;
            config.isDef = value.isDef;
            obj.conditionsView = new conditionsView({ parentObj: obj[config.viewType], appendTo: config.appendTo, campaingObj: this.parentObj, index: value.index });
            this.moduleObjList[config.module] = obj;
            this.parentObj.moduleList = this.moduleObjList;
            $(".addNewModuleRow").before(template({ module: config.module, menuID: config.menuID, isDef: config.isDef }));
            $('.addModuleRow.addModuleRowDef #addMod_1').remove();
          }
        });
      }
    },
    // USED FOR MODULE THAT IS SELECT ED FOR CAMPAIGN
    getInitialConditions: function () {
      if (this.target_audience) {
        const config = this.configMap[this.target_audience];
        if (config) {
          var obj = {};
          obj[config.viewType] = new config.viewClass({ fromCampaign: 'yes', campaignModule: config.campaignModule, isDef: true });
          config.index = 1;
          obj.conditionsView = new conditionsView({ parentObj: obj[config.viewType], appendTo: config.appendTo, campaingObj: this.parentObj, index: config.index });
          this.moduleObjList[config.module] = obj;
        }
      }
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = conditionSelectorTemp;
      var template = _.template(source);
      var prevConditionLength = Object.keys(selfobj.parentObj.conditions).length;
      this.$el.html(template({ target_audience: this.target_audience, prevConditionLength: prevConditionLength }));
      $(".campaign_details_view .conditionsSelector").empty().append(this.$el);
      $('#' + this.toClose).show();
      $(".ws-select").selectpicker();
      this.delegateEvents();
      (Object.keys(selfobj.parentObj.conditions).length !== 0) ?
        this.renderConditions() :
        this.getInitialConditions();
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });
  return conditionSelector;
});