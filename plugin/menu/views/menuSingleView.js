define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  '../../core/views/multiselectOptions',
  '../models/iconListModel',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/menuCollection',
  '../models/singleMenuModel',
  'text!../templates/menuSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT,Swal, multiselectOptions, iconData, dynamicFieldRender, menuCollection, singleMenuModel, menutemp) {

  var menuSingleView = Backbone.View.extend({
    model: singleMenuModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "menuSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "menuList";
      this.model = new singleMenuModel();
      var selfobj = this;
      selfobj.pluginId = options.menuID;
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchmenu;
      this.iconList = new iconData();
      $(".popupLoader").show();
      $(".profile-loader").show();
      // selfobj.render();
      this.menuList = new menuCollection();
      this.menuList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $(".profile-loader").hide();
        selfobj.model.set("menuList", res.data);
        selfobj.render();
      });
      if (options.menuID != "") {
        this.model.set({ menuID: options.menuID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          $(".profile-loader").hide();
          selfobj.render();
        });
      }
      //this.listenTo(this.model, 'sync',this.render);
      //this.listenTo(this.menuList, 'sync', this.render);
    },
    events:
    {
      "click .saveMenuDetails": "saveMenuDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .iconSelection": "setIconValues",
      // "keyup #iconSearch": "searchIcon",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveMenuDetails', this.saveMenuDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveMenuDetails', this.saveMenuDetails.bind(this));

      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.bDate', this.updateOtherDetails);
      this.$el.on('change', '.bDate', this.updateOtherDetails.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.iconSelection', this.setIconValues);
      this.$el.on('click', '.iconSelection', this.setIconValues.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      // this.$el.off('keyup', '#iconSearch', this.searchIcon);
      // this.$el.on('keyup', '#iconSearch', this.searchIcon.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
      // $(e.currentTarget).removeAttr("disabled");
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      console.log(this.model);
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status", "isParent", "isClick", "linked", "is_custom", "custom_module","show_on_website",'mobile_screen'];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      // console.log(da);
      selfobj.model.set(da);
      if(selfobj.model.get("isParent") == 'yes'){
        selfobj.model.set("parentID",'');
      }
      let isRender = $(e.currentTarget).attr("data-render");
      if (isRender == "yes") {
        selfobj.render();
      }
    },
    setIconValues: function (e) {
      selfobj = this;
      var objectDetails = [];
      if($(e.currentTarget).closest(".iconSelection").hasClass("active")){
        $(e.currentTarget).closest(".iconSelection").removeClass("active"); 
        objectDetails["iconName"] = '';
        selfobj.model.set(objectDetails);
      }else{
        $(".iconSelection").removeClass("active");
        $(e.currentTarget).closest(".iconSelection").addClass("active");
        objectDetails["iconName"] = $(e.currentTarget).attr("data-value");
        selfobj.model.set(objectDetails);
      }
    },
    saveMenuDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("menuID");
      let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#menuDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if(res.statusCode == 994){app_router.navigate("logout", { trigger: true }); }
          let re=false;
          if(isNew == "new") {
            re = showResponse(e, res, "Save & New");
          } else {
            re = showResponse(e, res, "Save");
          }
          scanDetails.sidebarUpdates();
          setTimeout(function () {
            selfobj.resetModel(re,res,isNew);
          }, 1000);
          // if(re){
          //   if (res.flag == "S") {
          //     if(isNew == "new") {
          //       selfobj.model.clear().set(selfobj.model.defaults);
          //       selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
          //       selfobj.render();
          //     } else {
          //       handelClose(selfobj.toClose);
          //     }
          //   }
          // }
          $(e.currentTarget).removeAttr("disabled");
        });
      }
    },

    resetModel:function(re,res,isNew){
      let selfobj = this;
      // let re=false;
      // let isNew = $(e.currentTarget).attr("data-action");
        if(re){
            console.log("after sidebarUpdates");
            if (res.flag == "S") {
              if(isNew == "new") {
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                selfobj.render();
              } else {
                handelClose(selfobj.toClose);
              }
            }
        }
    },

    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        menuName: {
          required: true,
        },
        menuLink: {
          required: true,
        },
        module_name: {
          required: true,
          onlyalpha: true,
        },
        status: {
          required: true,
        },
        table_name: {
          required: true,
        },
        menu_custom_link: {
          required: true,
        },
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {

        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        // ...feilds,
        // ...dynamicRules
        // };
      }
      var messages = {
        menuName: "Please enter Menu Name",
        menuLink: "Please enter Menu link",
        status: "Please enter Status",
        table_name: "Please enter Table Name",
        module_name:{
          required:"Please enter Module Name",
          onlyalpha:"Please enter only aplha Numeric",
        }
      };
      $("#menuDetails").validate({
        rules: feildsrules,
        messages: messages
      });
    },

    searchIcon: function (e) {
      var searchValue = $(e.currentTarget).val().toLowerCase();
      $('.iconsectioName').each(function () {
          var iconSection = $(this);
          var hasVisibleIcons = false;
          iconSection.next('.setIconList').find('.iconName').each(function () {
              var iconNameElement = $(this);
              var iconName = iconNameElement.text().toLowerCase();
              if (iconName.includes(searchValue)) {
                  hasVisibleIcons = true;
                  return false;
              }
          });
          var clearfix = iconSection.next('.setIconList').next('.iconClearfix');
          if (hasVisibleIcons) {
              iconSection.show();
              clearfix.show();
              $('.defaultMessage').hide();
          } else {
            $('.defaultMessage').show();
              iconSection.hide();
              clearfix.hide();
          }
      });
      $('.iconName').each(function () {
        var iconNameElement = $(this);
        var iconName = iconNameElement.text().toLowerCase();
        var iconContainer = iconNameElement.closest('.iconList');
        if (iconName.includes(searchValue)) {
            iconContainer.show();
            $('.defaultMessage').hide();
        } else {
            iconContainer.hide();
        }
      });
    },
  
    render: function () {
      var selfobj = this;
      var source = menutemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      $(".profile-loader").hide();
      if(this.model.attributes.menuList){
        this.model.attributes.menuList = this.model.attributes.menuList.filter(item => item.menuID !== this.model.attributes.menuID);
      }
      this.$el.html(template({ "model": this.model.attributes, "iconList": this.iconList.attributes.icons }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      //$("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      $('#iconSearch').on('input', function (e) {
        selfobj.searchIcon(e);
      });
      rearrageOverlays("Menu", this.toClose);
      setToolTip();
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });
  return menuSingleView;

});
