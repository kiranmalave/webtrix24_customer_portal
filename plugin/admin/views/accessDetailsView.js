define([
  "jquery",
  "underscore",
  "backbone",
  "select2",
  "moment",
  'Swal',
  "../../userRole/collections/userRoleCollection",
  "../collections/accessMenuCollection",
  "../../core/views/appSettings",
  "../../menu/models/menuFilterOptionModel",
  "../../menu/collections/menuCollection",
  "text!../templates/accessControl_temp.html",
], function ($, _, Backbone, select2, moment, Swal, userRoleCollection, accessList, appSettings, menuFilterOptionModel, menuCollections, accessControl) {
  var accessDetailsView = Backbone.View.extend({
    //model:reportOptionModel,
    initialize: function (options) {
      var selfobj = this;
      $(".modelbox").hide();
      $(".profile-loader").show();
      var roleList = new userRoleCollection();
      this.collection = new accessList();
      this.appSettings = new appSettings();
      this.filterOption = new menuFilterOptionModel();
      this.menuCollection = new menuCollections();
      this.appSettings.initialize({
        filterOption: this.filterOption,
        menuCollection: this.menuCollection,
      });
      // this.model = new singleCompanyCommercialsModel();
      roleList.fetch({
        headers: {
          contentType: "application/x-www-form-urlencoded",
          SadminID: $.cookie("authid"),
          token: $.cookie("_bb_key"),
          Accept: "application/json",
        },
        error: selfobj.onErrorHandler,
        type: "POST",
        data: { getAll: "Y", status: "active" },
      })
        .done(function (res) {
          if (res.flag == "F") {
            Swal.fire({
              title: "Failed !",
              text: res.msg,
              timer: 2000,
              icon: "error",
              showConfirmButton: false,
            });
          }
          if (res.statusCode == 994) {
            app_router.navigate("logout", { trigger: true });
          }
          $(".popupLoader").hide();
          selfobj.collection.roleList = res.data;
          selfobj.render();
        });
      $(".profile-loader").hide();
    },
    events: {
      "click .loadview": "loadSubView",
      //"change .switchChange": "updateOtherDetails",
      "click #saveAccessDetails": "saveAccessDetails",
      "change #roleID": "loadModuleList",
      "change .universalToggle": "handleUniversalToggle",
      "change .moduleAccessToggle": "updateAccessControl",
      "input #moduleSearch": "moduleSearch",
    },
    updateOtherDetails: function (e) {
      var collid = $(e.currentTarget).attr("data-modelID");
      var initID = $(e.currentTarget).attr("data-inID");
      var ischeck = $(e.currentTarget).is(":checked");
      if (ischeck) {
        var newsetval = [];
        newsetval["" + initID] = "yes";
      } else {
        var newsetval = [];
        newsetval["" + initID] = "no";
      }
      var mm = this.collection.get(collid);
      mm.set(newsetval);
      this.collection.set(mm, { remove: false });
      this.updateUniversalToggle(initID);
    },
    moduleCheckBox: function (e) {
      var checkBox = $(e.currentTarget).prop("checked");
      var modelIDToDisable = $(e.currentTarget).attr("data-modelID");
      var newsetval = [];
      var mm = this.collection.get(modelIDToDisable);
      if (checkBox) {
        // Uncheck the checkbox before disabling
        $('.checkChange[data-modelID="' + modelIDToDisable + '"]').prop("disabled", false);
      } else {
        // Enable the checkbox and leave it unchecked
        $('.checkChange[data-modelID="' + modelIDToDisable + '"]').prop("disabled", true).prop("checked", false);
        newsetval["" + "view"] = "no";
        $('.addCheckbox[data-modelID="' + modelIDToDisable + '"]').prop("disabled", true).prop("checked", false);
        newsetval["" + "add"] = "no";
        $('.editCheckbox[data-modelID="' + modelIDToDisable + '"]').prop("disabled", true).prop("checked", false);
        newsetval["" + "edit"] = "no";
        $('.deleteCheckbox[data-modelID="' + modelIDToDisable + '"]').prop("disabled", true).prop("checked", false);
        newsetval["" + "delete"] = "no";
        mm.set(newsetval);
        this.collection.set(mm, { remove: false });
      }
      this.updateAllUniversalToggles();
      this.checkAllcheckbox();
    },
    checkboxChange: function (e) {
      var isChecked = $(e.currentTarget).prop("checked");
      var modelIDToDisable = $(e.currentTarget).attr("data-modelID");
      var newsetval = [];
      var mm = this.collection.get(modelIDToDisable);
      if (isChecked) {
        // Uncheck the checkbox before disabling
        $('.addCheckbox[data-modelID="' + modelIDToDisable + '"]').prop("disabled", false);
        $('.editCheckbox[data-modelID="' + modelIDToDisable + '"]').prop("disabled", false);
        $('.deleteCheckbox[data-modelID="' + modelIDToDisable + '"]').prop("disabled", false);
      } else {
        // Enable the checkbox and leave it unchecked
        $('.addCheckbox[data-modelID="' + modelIDToDisable + '"]').prop("disabled", true).prop("checked", false);
        newsetval["" + "add"] = "no";
        $('.editCheckbox[data-modelID="' + modelIDToDisable + '"]').prop("disabled", true).prop("checked", false);
        newsetval["" + "edit"] = "no";
        $('.deleteCheckbox[data-modelID="' + modelIDToDisable + '"]').prop("disabled", true).prop("checked", false);
        newsetval["" + "delete"] = "no";
        mm.set(newsetval);
        this.collection.set(mm, { remove: false });
      }
      this.updateAllUniversalToggles();
      this.checkAllcheckbox();
    },
    updateAccessControl: function (e) {
      var selfobj = this;
      let isChecked = $(e.currentTarget).prop("checked");
      let type = $(e.currentTarget).attr("data-column");
      let column = $(e.currentTarget).attr("data-column");
      let universal = $(e.currentTarget).attr("data-universal");
      let pElm = $(e.currentTarget).closest(".subItem").prev(".accordion-item");
      switch (type) {
        case 'module_access':
          {
            if (universal == "yes") {
              if (!isChecked) {
                // disable all access for all modules
                $(".moduleAccessToggle[type=checkbox]").prop("checked", false).prop("disabled", true);
                $(".moduleAccessToggle[data-column=module_access]").prop("checked", false).prop("disabled", false);
                let newsetval = [];
                newsetval["module_access"] = "no";
                newsetval["view"] = "no";
                newsetval["add"] = "no";
                newsetval["edit"] = "no";
                newsetval["delete"] = "no";
                selfobj.updateAccessList(newsetval);
              } else {
                $("input[data-column=module_access]").prop("checked", true);
                $(".moduleAccessToggle[data-column=view]").prop("disabled", false);
                let newsetval = [];
                newsetval["module_access"] = "yes";
                newsetval["view"] = "no";
                newsetval["add"] = "no";
                newsetval["edit"] = "no";
                newsetval["delete"] = "no";
                selfobj.updateAccessList(newsetval);
              }
              $(".moduleAccessToggle[data-column=module_access]").prop("disabled", false);
            } else {
              // single item
              let pID = $(e.currentTarget).closest(".subItem").prev(".accordion-item").find(".moduleAccessToggle[data-column=view]").attr("data-modelID");
              let elm = $(e.currentTarget).closest(".item-row");
              if (!isChecked) {
                elm.find(".moduleAccessToggle[data-column=view]").prop("disabled", true).prop("checked", false);
                elm.find(".moduleAccessToggle[data-column=add]").prop("disabled", true).prop("checked", false);
                elm.find(".moduleAccessToggle[data-column=edit]").prop("disabled", true).prop("checked", false);
                elm.find(".moduleAccessToggle[data-column=delete]").prop("disabled", true).prop("checked", false);

                let newsetval = []; newsetval["module_access"] = "no"; newsetval["view"] = "no"; newsetval["add"] = "no"; newsetval["edit"] = "no"; newsetval["delete"] = "no";
                selfobj.updateSingleModule(pID, $(e.currentTarget).attr("data-modelID"), newsetval);
              } else {
                elm.find(".moduleAccessToggle[data-column=view]").prop("disabled", false);
                elm.find(".moduleAccessToggle[data-column=add]").prop("disabled", false);
                elm.find(".moduleAccessToggle[data-column=edit]").prop("disabled", false);
                elm.find(".moduleAccessToggle[data-column=delete]").prop("disabled", false);

                // IF SUB MENU HAVE MODULE ACCESS THEN PARENT MENU AUTO GRANTED  
                pElm.find(".moduleAccessToggle[data-column=module_access]").prop("checked", true);
                pElm.find(".moduleAccessToggle[data-column=view]").prop("disabled", false);
                pElm.find(".moduleAccessToggle[data-column=add]").prop("disabled", false);
                pElm.find(".moduleAccessToggle[data-column=edit]").prop("disabled", false);
                pElm.find(".moduleAccessToggle[data-column=delete]").prop("disabled", false);

                elm.find(".moduleAccessToggle[data-column=delete]").prop("disabled", true).prop("checked", false);
                let newsetval = [];
                newsetval["module_access"] = "yes";
                newsetval["view"] = "no";
                newsetval["add"] = "no";
                newsetval["edit"] = "no";
                newsetval["delete"] = "no";
                selfobj.updateSingleModule(pID, $(e.currentTarget).attr("data-modelID"), newsetval);
              }
            }
          }
          break;
        case 'view':
          {
            if (universal == "yes") {
              if (!isChecked) {
                // disable all access for all modules
                $("input[data-column=view]").prop("checked", false);
                $("input[data-column=add]").prop("checked", false).prop("disabled", true);
                $("input[data-column=edit]").prop("checked", false).prop("disabled", true);
                $("input[data-column=delete]").prop("checked", false).prop("disabled", true);
                let newsetval = []; newsetval["view"] = "no"; newsetval["add"] = "no"; newsetval["edit"] = "no"; newsetval["delete"] = "no";
                selfobj.updateAccessList(newsetval);
              } else {
                $("input[data-column=view]").prop("checked", true);
                $("input[data-column=add]").prop("disabled", false);
                $("input[data-column=edit]").prop("disabled", false);
                $("input[data-column=delete]").prop("disabled", false);
                let newsetval = []; newsetval["view"] = "yes"; newsetval["add"] = "no"; newsetval["edit"] = "no"; newsetval["delete"] = "no";
                selfobj.updateAccessList(newsetval);
              }
              $(".moduleAccessToggle[data-column=module_access]").prop("disabled", false);
            } else {
              // single item
              let pID = $(e.currentTarget).closest(".subItem").prev(".accordion-item").find(".moduleAccessToggle[data-column=view]").attr("data-modelID");
              if (!isChecked) {
                $(e.currentTarget).closest(".item-row").find(".moduleAccessToggle[data-column=add]").prop("checked", false).prop("disabled", true);
                $(e.currentTarget).closest(".item-row").find(".moduleAccessToggle[data-column=edit]").prop("checked", false).prop("disabled", true);
                $(e.currentTarget).closest(".item-row").find(".moduleAccessToggle[data-column=delete]").prop("checked", false).prop("disabled", true);
                let newsetval = []; newsetval["view"] = "no"; newsetval["add"] = "no"; newsetval["edit"] = "no"; newsetval["delete"] = "no";
                selfobj.updateSingleModule(pID, $(e.currentTarget).attr("data-modelID"), newsetval);
              } else {
                let newsetval = []; newsetval["view"] = "yes"; newsetval["add"] = "no"; newsetval["edit"] = "no"; newsetval["delete"] = "no";
                selfobj.updateSingleModule(pID, $(e.currentTarget).attr("data-modelID"), newsetval);
                $(e.currentTarget).closest(".item-row").find(".moduleAccessToggle[data-column=add]").prop("disabled", false);
                $(e.currentTarget).closest(".item-row").find(".moduleAccessToggle[data-column=edit]").prop("disabled", false);
                $(e.currentTarget).closest(".item-row").find(".moduleAccessToggle[data-column=delete]").prop("disabled", false);
              }
            }
          }
          break;
        case 'add':
          {
            if (universal == "yes") {
              if (!isChecked) {
                // disable all access for all modules
                $("input[data-column=add]").prop("checked", false).prop("disabled", true);
                let newsetval = []; newsetval["add"] = "no";
                selfobj.updateAccessList(newsetval);
              } else {

                $("input[data-column=add]").prop("checked", true).prop("disabled", false);
                let newsetval = []; newsetval["add"] = "yes";
                selfobj.updateAccessList(newsetval);
              }
              $(".moduleAccessToggle[data-column=add]").prop("disabled", false);
            } else {
              // single item
              let pID = $(e.currentTarget).closest(".subItem").prev(".accordion-item").find(".moduleAccessToggle[data-column=view]").attr("data-modelID");
              if (!isChecked) {
                let newsetval = []; newsetval["add"] = "no";
                selfobj.updateSingleModule(pID, $(e.currentTarget).attr("data-modelID"), newsetval);
              } else {
                let newsetval = []; newsetval["add"] = "yes";
                selfobj.updateSingleModule(pID, $(e.currentTarget).attr("data-modelID"), newsetval);
              }
            }
          }
          break;
        case 'edit':
          {
            if (universal == "yes") {
              if (!isChecked) {
                // disable all access for all modules
                $("input[data-column=edit]").prop("checked", false).prop("disabled", true);
                let newsetval = []; newsetval["edit"] = "no";
                selfobj.updateAccessList(newsetval);
              } else {
                $("input[data-column=edit]").prop("checked", true).prop("disabled", false);
                let newsetval = []; newsetval["edit"] = "yes";
                selfobj.updateAccessList(newsetval);
              }
              $(".moduleAccessToggle[data-column=edit]").prop("disabled", false);
            } else {
              // single item
              let pID = $(e.currentTarget).closest(".subItem").prev(".accordion-item").find(".moduleAccessToggle[data-column=edit]").attr("data-modelID");
              if (!isChecked) {
                let newsetval = []; newsetval["edit"] = "no";
                selfobj.updateSingleModule(pID, $(e.currentTarget).attr("data-modelID"), newsetval);
              } else {
                let newsetval = []; newsetval["edit"] = "yes";
                selfobj.updateSingleModule(pID, $(e.currentTarget).attr("data-modelID"), newsetval);
              }
            }
          }
          break;
        case 'delete':
          {
            if (universal == "yes") {
              if (!isChecked) {
                // disable all access for all modules
                $("input[data-column=delete]").prop("checked", false).prop("disabled", true);
                let newsetval = []; newsetval["delete"] = "no";
                selfobj.updateAccessList(newsetval);
              } else {
                $("input[data-column=delete]").prop("checked", true).prop("disabled", false);
                let newsetval = []; newsetval["delete"] = "yes";
                selfobj.updateAccessList(newsetval);
              }
              $(".moduleAccessToggle[data-column=delete]").prop("disabled", false);
            } else {
              // single item
              let pID = $(e.currentTarget).closest(".subItem").prev(".accordion-item").find(".moduleAccessToggle[data-column=delete]").attr("data-modelID");
              if (!isChecked) {
                let newsetval = []; newsetval["delete"] = "no";
                selfobj.updateSingleModule(pID, $(e.currentTarget).attr("data-modelID"), newsetval);
              } else {
                let newsetval = []; newsetval["delete"] = "yes";
                selfobj.updateSingleModule(pID, $(e.currentTarget).attr("data-modelID"), newsetval);
              }
            }
          }
          break;
      }
    },
    updateAccessList: function (newsetval) {
      var selfobj = this;
      this.collection.forEach(function (row) {
        var mm = selfobj.collection.get(row.attributes.menuID);
        mm.set(newsetval);
        var subList = mm.get("subMenu");
        if (subList.length > 0) {
          subList.forEach(function (row1, key) {
            let newsetval_sub = row1;
            if (newsetval["module_access"] != undefined) {
              subList[key]['module_access'] = newsetval["module_access"];
            }
            if (newsetval["view"] != undefined) {
              subList[key]['view'] = newsetval["view"];
            }
            if (newsetval["add"] != undefined) {
              subList[key]['add'] = newsetval["add"];
            }
            if (newsetval["edit"] != undefined) {
              subList[key]['edit'] = newsetval["edit"];
            }
            if (newsetval["delete"] != undefined) {
              subList[key]['delete'] = newsetval["delete"];
            }
          });
          mm.set("subMenu", subList);
        }
        selfobj.collection.set(mm, { remove: false });
      }, selfobj);
    },
    updateSingleModule: function (parentId, menuId, newsetval) {
      var selfobj = this;
      if (parentId == undefined) {
        var mm = selfobj.collection.get(menuId);
        parentId = menuId;
      } else {
        var mm = selfobj.collection.get(parentId);
      }
      if (parentId == menuId) {
        mm.set(newsetval);
        selfobj.collection.set(mm, { remove: false });
      } else {
        var subList = mm.get("subMenu");
        if (subList.length > 0) {

          if (newsetval["module_access"] != undefined) {
            newsetval["module_access"] = newsetval["module_access"];
            mm.set(newsetval);
          }

          subList.forEach(function (row1, key) {
            if (menuId == row1.menuID) {
              let newsetval_sub = row1;
              if (newsetval["module_access"] != undefined) {
                subList[key]['module_access'] = newsetval["module_access"];
              }
              if (newsetval["view"] != undefined) {
                subList[key]['view'] = newsetval["view"];
              }
              if (newsetval["add"] != undefined) {
                subList[key]['add'] = newsetval["add"];
              }
              if (newsetval["edit"] != undefined) {
                subList[key]['edit'] = newsetval["edit"];
              }
              if (newsetval["delete"] != undefined) {
                subList[key]['delete'] = newsetval["delete"];
              }
              mm.set("subMenu", subList);
              selfobj.collection.set(mm, { remove: false });
            }
          });
        }
      }
    },
    handleUniversalToggle: function (e) {
      let selfobj = this;
      var column = $(e.currentTarget).attr("data-column");
      var row = $(e.currentTarget).attr("data-modelID");
      var isChecked = $(e.currentTarget).prop("checked");
      selfobj.isChecked = isChecked;
      selfobj.column = column;
      selfobj.row = row;
      if (row == "view" && !isChecked) {
        let coldata = ["add", "edit", "delete"];
        coldata.forEach(function (value) {
          $(".ws-data-rows .row .col-md-2" + value).each(function () {
            $(this).find(".switchChange").prop("checked", false).prop("disabled", true);
          });
        });
      }

      if (column == "view" && !isChecked) {
        $('.universalToggle[data-column="add"]').prop("disabled", !isChecked).prop("checked", false);
        $('.universalToggle[data-column="edit"]').prop("disabled", !isChecked).prop("checked", false);
        $('.universalToggle[data-column="delete"]').prop("disabled", !isChecked).prop("checked", false);
      } else {
        $('.universalToggle[data-column="add"]').prop("disabled", false);
        $('.universalToggle[data-column="edit"]').prop("disabled", false);
        $('.universalToggle[data-column="delete"]').prop("disabled", false);
      }
      if (isChecked) {
        $(".ws-data-rows .row .col-md-2" + column).each(function () {
          console.log("this eleem1 : ", $(this).find(".switchChange").prop("checked", true));
        });

        if (column == "view") {
          let coldata = ["add", "edit", "delete"];
          coldata.forEach(function (value) {
            $(".ws-data-rows .row .col-md-2" + value).each(function () {
              $(this).find(".switchChange").prop("disabled", false);
            });
          });
        }
      } else {
        if (column == "view") {
          let coldata = ["add", "edit", "delete"];
          coldata.forEach(function (value) {
            $(".ws-data-rows .row .col-md-2" + value).each(function () {
              $(this).find(".switchChange").prop("checked", false).prop("disabled", true);
            });
          });
        }
        $(".ws-data-rows .row .col-md-2" + column).each(function () {
          console.log("this eleem2 : ", $(this).find(".switchChange").prop("checked", true).prop("checked", false));
        });
      }
      this.collection.forEach(function (row) {
        var mm = selfobj.collection.get(row.attributes.menuID);
        var newsetval = [];
        // var modelID = model.get("menuID");
        if (selfobj.isChecked) {
          newsetval["" + selfobj.column] = "yes";
        } else {
          if (selfobj.column == "view") {
            newsetval["add"] = "no";
            newsetval["edit"] = "no";
            newsetval["delete"] = "no";
          }
          newsetval["" + selfobj.column] = "no";
        }
        mm.set(newsetval);
        selfobj.collection.set(mm, { remove: false });
      }, selfobj);
    },
    updateUniversalToggle: function (column) {
      var allChecked = this.collection.every(function (row) {
        return (
          row.get(column) === "yes" &&
          (column === "view" || row.get("view") === "yes")
        );
      });
      $('.universalToggle[data-column="' + column + '"]').prop(
        "checked",
        allChecked
      );
    },
    updateAllUniversalToggles: function () {
      var columns = ["view", "add", "edit", "delete"];
      for (var i = 0; i < columns.length; i++) {
        this.updateUniversalToggle(columns[i]);
      }
    },

    checkAllcheckbox: function () {
      const allAddNo = this.collection.models.every(function (menu) {
        return menu.attributes.add === "yes";
      });
      const allEditNo = this.collection.models.every(function (menu) {
        return menu.attributes.edit === "yes";
      });
      const allViewNo = this.collection.models.every(function (menu) {
        return menu.attributes.view === "yes";
      });
      const allDeleteNo = this.collection.models.every(function (menu) {
        return menu.attributes.delete === "yes";
      });
      if (!allViewNo) {
        if (!allViewNo) {
          $('.universalToggle[data-column="view"]').attr('disabled', 'disabled');
        }
        if (!allAddNo) {
          $('.universalToggle[data-column="add"]').attr('disabled', 'disabled');
        }
        if (!allEditNo) {
          $('.universalToggle[data-column="edit"]').attr('disabled', 'disabled');
        }

        if (!allDeleteNo) {
          $('.universalToggle[data-column="delete"]').attr('disabled', 'disabled');
        }
      } else {
        $('.universalToggle[data-column="add"],.universalToggle[data-column="edit"],.universalToggle[data-column="delete"]').removeAttr('disabled');
      }

    },

    saveAccessDetails: function (e) {
      selfobj = this;
      var roleID = $("#roleID").val();
      if (roleID == "") {
        alert("Please select Role");
        return false;
      }
      $(e.currentTarget).attr("disabled", "disabled");
      method = "update";
      this.collection
        .sync(method, this.collection, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            SadminID: $.cookie("authid"),
            token: $.cookie("_bb_key"),
            Accept: "application/json",
          },
          error: selfobj.onErrorHandler,
        })
        .done(function (res) {
          if (res.statusCode == 994) {
            app_router.navigate("logout", { trigger: true });
          }
          if (res.flag == "F") {
            Swal.fire({
              title: "Failed !",
              text: res.msg,
              timer: 2000,
              icon: "error",
              showConfirmButton: false,
            });
          } else {
            $(e.currentTarget).html("<span>Saved</span>");
            //scanDetails.filterSearch();
            getLocalData(true);
            selfobj.appSettings.sidebarUpdate();
          }
          setTimeout(function () {
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);
        });
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire(
        "Something was wrong ! Try to refresh the page or contact administer. :(",
        "",
        "info"
      );
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-show");
      switch (show) {
        case "singleemployeeData": {
          var employeeID = $(e.currentTarget).attr("data-employeeID");
          var employeesingleview = new employeeSingleView({
            employeeID: employeeID,
            searchemployee: this,
          });
          break;
        }
      }
    },
    loadModuleList: function (e) {
      var selfobj = this;
      var roleID = $(e.currentTarget).val();
      if (roleID == "") {
        $("#moduleTable").remove();
        $('.menu-search-div').hide();
        return false;
      } else {
        $('.menu-search-div').show();
      }
      this.collection.roleID = roleID;
      this.collection
        .fetch({
          headers: {
            contentType: "application/x-www-form-urlencoded",
            SadminID: $.cookie("authid"),
            token: $.cookie("_bb_key"),
            Accept: "application/json",
          },
          error: selfobj.onErrorHandler,
        })
        .done(function (res) {
          if (res.flag == "F") {
            Swal.fire({
              title: "Failed !",
              text: res.msg,
              timer: 2000,
              icon: "error",
              showConfirmButton: false,
            });
          }
          if (res.statusCode == 994) {
            app_router.navigate("logout", { trigger: true });
          }
          $(".popupLoader").hide();
          $("#moduleTable").show();

          selfobj.render();
          $('#saveAccessDetails').removeAttr('disabled');
        });
    },
    moduleSearch: function (e) {
      let search = $(e.currentTarget).val().toLowerCase();
      if (search != '') {
        let searchCount = 0;
        // HIDE ALL ITEM-ROWS
        $('.access-control-list .subItem .item-row').removeClass('show');
        $('.access-control-list .accordion-item.item-row , .accordion-item.head, .noDataFound').hide();
        // SEARCH THROUGH EACH ITEM-ROW
        $('.access-control-list .item-row').each(function () {
          var optVal = $(this).attr('data-search-module').toLowerCase();
          if (optVal.includes(search)) {
            var parentDiv = $(this).closest('.subItem').attr('data-parent-module');
            $('.accordion-item.head').show();
            if ($(this).hasClass('accordion-item')) { 
              // PARENT
              $(this).show();
            } else {  
              // CHILD
              $('.access-control-list .accordion-item[data-search-module="' + parentDiv + '"]').show();
              $(this).addClass('show');
            }
            searchCount++;
          }
        });
        if (searchCount == 0) { $('.noDataFound').show();}
      } else {
        $('.access-control-list .accordion-item.item-row').show();
        $('.access-control-list .subItem .item-row').addClass('show');
      }
    },
    render: function () {
      var template = _.template(accessControl);
      this.$el.html(template({ accessDetails: this.collection, userRole: $.cookie("userRole") }));
      $(".main_container").append(this.$el);
      // $("#moduleTable").hide();
      $("#companyID").select2({ width: "100%" });
      this.updateAllUniversalToggles();
      this.checkAllcheckbox();
      return this;
    },
  });

  return accessDetailsView;
});
