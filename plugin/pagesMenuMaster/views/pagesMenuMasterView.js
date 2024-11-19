
define([
  'jquery',
  'underscore',
  'backbone',
  'jqueryUI',
  'jqueryNestable',
  'Swal',
  '../collections/pagesMenuMasterCollection',
  '../collections/menuPagesCollection',
  '../../pagesMaster/collections/pagesMasterCollection',
  '../../pagesMaster/models/pagesMasterSingleModel',
  '../models/pagesMenuMasterFilterOptionModel',
  '../models/selectedMenuIDModel',
  '../models/pagesMenuMasterSingleModel',
  'text!../templates/pageLinkEdit.html',
  'text!../templates/pagesMenuMasterTemp.html',
], function ($, _, Backbone, jqueryUI, jqueryNestable, Swal, pagesMenuMasterCollection, menuPagesCollection, pagesMasterCollection, pagesMasterSingleModel, pagesMenuMasterFilterOptionModel, selectedMenuIDModel, pagesMenuMasterSingleModel, pageLinkEdit, pagesMenuMasterTemp) {

  var pagesMenuMasterView = Backbone.View.extend({

    initialize: function (options) {
      var selfobj = this;
      this.pageMenuID = '';
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      readyState = true;
      filterOption = new pagesMenuMasterFilterOptionModel();
      this.pagesMenuMasterSinglemodel = new pagesMenuMasterSingleModel();
      this.selectedMenu = new selectedMenuIDModel();
      this.searchpagesMenuMaster = new pagesMenuMasterCollection();
      this.menuPagesList = new menuPagesCollection();
      this.pagesList = new pagesMasterCollection();
      this.pagesMasterSingleModel = new pagesMasterSingleModel();

      this.pagesList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
        $(".profile-loader").hide();
      });

      this.searchpagesMenuMaster.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
        $(".profile-loader").hide();
      });

      this.render();
    },
    events:
    {
      "click #saveuserRoleDetails": "saveuserRoleDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .changeMenu": "changeMenu",
      "click .add-new-menu-action": "showCreateNew",
      "click .clacel": "clacel",
      "click #deleteMenuList": "deleteMenuList",
      "click .deletePage": "deletePageFromSelectedMenu",
      "click .addCustomLinks": "addCustomLinks",
      "click .ws-itempage": "editPageDetails",
      "click .submitcancel": "editPageDetails",
      "blur .updatePageDetails": "updatePageDetails",
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },

    updatePageDetails: function (e) {
      var selfobj = this;
      var pageID = $(e.currentTarget).attr("data-pageID");
      var setID = $(e.currentTarget).attr("data-id");
      var valueTxt = $(e.currentTarget).val();
      if (pageID != 0 && pageID != "" && pageID != null) {
        selfobj.pagesMasterSingleModel.set({ pageID: pageID });
        selfobj.pagesMasterSingleModel.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") showResponse('', res, '');
          selfobj.pagesMasterSingleModel.set({ "pageTitle": valueTxt });
          selfobj.pagesMasterSingleModel.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: "POST"
          }).done(function (res) {
            if (res.flag == "F") showResponse('', res, '');
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
            }
          });
        });
      } else {
        var position = $(e.currentTarget).data("position");
        var menuPageID = $(e.currentTarget).data("menupageid");
        var customLink = $(e.currentTarget).attr("data-customlink");
        if (typeof (customLink) != "undefined") {
          customLink = JSON.parse($(e.currentTarget).attr("data-customlink"));
        } else {
          customLink = {};
        }
        var newTitle = customLink.title.replace(/\s+/g, '_');
        var menuId = selfobj.pagesMenuMasterSinglemodel.get("menuID");
        if (menuId != "") {
          if (setID == 'c_title') {
            var c_url = customLink.url;
            var c_title = valueTxt;
            var c_newTab = customLink.newTab;
          } else if (setID == 'c_url') {
            var c_url = valueTxt;
            var c_title = customLink.title;
            var c_newTab = customLink.title;
            var c_newTab = customLink.newTab;
          } else {
            var c_url = customLink.url;
            var c_title = customLink.title;
            var c_newTab = $('#c_newTab_' + newTitle).prop('checked');
          }

          var customlink = {
            'url': c_url,
            'title': c_title,
            'newTab': c_newTab
          };

          var custom_link = JSON.stringify(customlink);

          $.ajax({
            url: APIPATH + 'addCustomLinks',
            method: 'POST',
            data: { menuID: menuId, custom_link: custom_link, position: position, menuPageID: menuPageID },
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F") showResponse(e, res, '');
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                selfobj.menuPagesList.fetch({
                  headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                  }, error: selfobj.onErrorHandler, type: 'post', data: { menuID: menuId, status: 'active', getAll: 'Y' }
                }).done(function (res) {

                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  selfobj.render();
                  $(".profile-loader").hide();
                });
              }
              setTimeout(function () {
                $(e.currentTarget).html("Added link");
              }, 3000);
            }
          });
        } else {
          showResponse('', { flag: 'F', msg: 'select Menu first !' }, '');
        }
      }
    },

    showCreateNew: function () {
      this.pagesMenuMasterSinglemodel.clear().set(this.pagesMenuMasterSinglemodel.defaults);
      this.menuPagesList.reset();
      this.render();
      $("#menuID").prop("selectedIndex", 0);
      $(".current-nav-div").hide();
      $(".create-new-nav").show();
      $("#saveuserRoleDetails").show();
      $("#menuName").val("");
      $(".ws-create-menu").hide();

    },

    clacel: function () {
      $(".ws-create-menu").show();
      $(".create-new-nav").hide();
    },
    updateOtherDetails: function (e) {

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.pagesMenuMasterSinglemodel.set(newdetails);
    },

    addCustomLinks: function (e) {
      e.preventDefault();
      selfobj = this;
      var position = 0;
      var menuId = this.pagesMenuMasterSinglemodel.get("menuID");
      if (menuId != "") {
        if (this.menuPagesList.length != 0) {
          position = Number(this.menuPagesList.last().get('position'));
        }
        position = position + 1;
        var c_url = $('#c_url').val();
        var c_title = $('#c_title').val();
        var c_newTab = $('#c_newTab').prop('checked');
        // console.log("c_newTab",c_newTab);

        var customlink = {
          'url': c_url,
          'title': c_title,
          'newTab': c_newTab
        };

        // console.log("customlink...",customlink);

        var custom_link = JSON.stringify(customlink);

        $.ajax({
          url: APIPATH + 'addCustomLinks',
          method: 'PUT',
          data: { menuID: menuId, custom_link: custom_link, position: position },
          datatype: 'JSON',
          beforeSend: function (request) {
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F")
              showResponse(e, res, '');

            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
              selfobj.menuPagesList.fetch({
                headers: {
                  'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: { menuID: menuId, status: 'active', getAll: 'Y' }
              }).done(function (res) {
                if (res.flag == "F") showResponse('', res, '');
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                selfobj.render();
                $(".profile-loader").hide();
              });
            }
            setTimeout(function () {
              $(e.currentTarget).html("Added link");
            }, 3000);

          }
        });
      } else {
        showResponse('', { flag: 'F', msg: 'select Menu first !' }, '');
      }

    },
    deleteMenuList: function (e) {
      var selfobj = this;
      var menuID = this.pagesMenuMasterSinglemodel.get("menuID");
      if (menuID != "") {
        Swal.fire({
          title: "Delete Menu ",
          text: "Do you want to delete Menu !! After you delete this menu, all the associated data removed from our system .",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Delete',
          animation: "slide-from-top",

        }).then((result) => {
          if (result.isConfirmed) {
            $.ajax({
              url: APIPATH + 'deleteMenuList',
              method: 'POST',
              data: { menuID: menuID },
              datatype: 'JSON',
              beforeSend: function (request) {
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                if (res.flag == "F")
                  showResponse(e, res, '');

                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {

                  selfobj.searchpagesMenuMaster.fetch({
                    headers: {
                      'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
                  }).done(function (res) {
                    if (res.flag == "F") showResponse('', res, '');
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    selfobj.pagesMenuMasterSinglemodel.clear().set(selfobj.pagesMenuMasterSinglemodel.defaults);
                    selfobj.menuPagesList.reset();
                    selfobj.render();
                    $(".create-new-nav").hide();
                    $("#menuID").prop("selectedIndex", 0);
                    $(".current-nav-div").hide();
                    $("#saveuserRoleDetails").hide();
                    $("#deleteMenuList").hide();
                    $("#menuName").val("");
                    $(".profile-loader").hide();
                  });
                  selfobj.render();
                }
                setTimeout(function () {
                  $(e.currentTarget).html("Menu Deleted");
                }, 3000);
              }
            });
          } else { }
        });
      } else {
        showResponse('', { flag: 'F', msg: 'Select menu to delete !' }, '');
      }

    },
    deletePageFromSelectedMenu: function (e) {
      var selfobj = this;
      var pageID = $(e.currentTarget).attr("data-menuPageID");
      var menuID = $('#menuID').val();
      Swal.fire({
        title: "Delete Page ",
        text: "Do you want to delete Page !!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",

      }).then((result) => {
        if (result.isConfirmed) {
          $.ajax({
            url: APIPATH + 'deletePageFromSelectedMenu',
            method: 'POST',
            data: { menuID: menuID, pageID: pageID },
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F")
                showResponse(e, res, '');

              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {

                filterOption.set({ menuID: menuID });
                selfobj.menuPagesList.fetch({
                  headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                  }, error: selfobj.onErrorHandler, data: filterOption.attributes
                }).done(function (res) {
                  if (res.flag == "F") showResponse('', res, '');
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  $(".profile-loader").hide();
                  selfobj.filterSearch();
                });
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);

            }
          });
        } else {

        }
      });

    },
    saveuserRoleDetails: function (e) {
      e.preventDefault();
      var menuID = this.pagesMenuMasterSinglemodel.get("menuID");
      var isPrimary = $('#isPrimary').prop('checked');
      var isNew = $('#isNew').prop('checked');
      var isSecondary = $('#isSecondary').prop('checked');
      var isFooter = $('#isFooter').prop('checked');
      this.pagesMenuMasterSinglemodel.set({ menuID: menuID, isPrimary: isPrimary, isSecondary: isSecondary, isFooter: isFooter })
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }

      if (isNew || menuID == "" || menuID == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#userRoleDetails").valid()) {
        var selfobj = this;
        $(e.currentTarget).html("<span>Updating..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.pagesMenuMasterSinglemodel.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            showResponse(e, res, '');
            $(e.currentTarget).html("<span>Error</span>");
          } else {
            $(e.currentTarget).html("<span>Saved</span>");
            selfobj.menuID = '';
            filterOption.clear().set(filterOption.defaults);
            selfobj.menuPagesList.reset();
            selfobj.searchpagesMenuMaster.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, data: filterOption.attributes
            }).done(function (res) {
              if (res.flag == "F") showResponse('', res, '');
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".profile-loader").hide();
              selfobj.render();
              $("#menuID").prop("selectedIndex", 0);
              // selfobj.filterSearch();
            });


            // selfobj.filterSearch();
          }

          setTimeout(function () {
            $(e.currentTarget).html("<span>Update</span>");
            $(e.currentTarget).removeAttr("disabled");
            $('#isPrimary').prop('checked', false);
            $('#isSecondary').prop('checked', false);
            $('#isFooter').prop('checked', false);
          }, 1000);

        });
      }
    },
    filterSearch: function () {

      this.searchpagesMenuMaster.reset();
      var selfobj = this;
      readyState = true;
      filterOption.set({ curpage: 0 });
      var $element = $('#loadMember');

      $(".profile-loader").show();

      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);

      this.searchpagesMenuMaster.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.render();
      });


      // this.pagesList.fetch({headers: {
      //   'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      // },error: selfobj.onErrorHandler,type:'post',data:{status:'active',getAll:'Y'}}).done(function(res){

      //   if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
      //   selfobj.render(); 
      // });
    },
    changeMenu: function (e) {
      var selfobj = this;
      var menuID = $(e.currentTarget).val();
      this.menuID = menuID;
      filterOption.set({ menuID: menuID });
      this.selectedMenu.set({ menuID: menuID })
      if (menuID == "") {
        this.menuPagesList.reset();
        this.pagesMenuMasterSinglemodel.clear().set(this.pagesMenuMasterSinglemodel.defaults);
        this.filterSearch();
        return;
      }
      var menudata = this.searchpagesMenuMaster.get(menuID);
      this.pagesMenuMasterSinglemodel.set({
        menuID: menudata.attributes.menuID,
        isPrimary: menudata.attributes.isPrimary,
        isSecondary: menudata.attributes.isSecondary,
        isFooter: menudata.attributes.isFooter,
        menuName: menudata.attributes.menuName
      })
      this.menuPagesList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { menuID: menuID, status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
        $(".profile-loader").hide();
      });
      // if(menuID != "")
      // { 
      //   $(".create-new-nav").show();
      //   $("#saveuserRoleDetails").show();
      //   $("#deleteMenuList").show();
      // }
    },

    handleDropEvent: function (event, ui) {
      var selfobj = this;
      $(this).removeClass("ui-state-highlight");
      var checkisDrag = $(ui.draggable).attr("data-act");
      if (checkisDrag == "no-drag") {
        return;
      }
      var menuID = $('#menuID').val();
      if (menuID == "") {
        showResponse('', { flag: 'F', msg: 'Please Select Menu' }, '');
        return false;
      }
      var pageIDs = [];
      var pageID = $(ui.draggable).attr("data-pageId");
      $('#selected-pages li').each(function (i) {
        pageIDs.push($(this).attr("data-pageID"));
      });
      if (pageIDs.includes(pageID)) {
        return false;
      }
      var templatePage = _.template(pageLinkEdit);
      var pageID = $(ui.draggable).attr("data-pageID");
      var pageTitle = $(ui.draggable).attr("data-pageTitle");
      var pageLink = $(ui.draggable).attr("data-pageLink");
      var item = $('<li>', {
        class: "dd-item dd3-item classForCloseButton",
        "data-pageID": pageID,
        "data-pageTitle": pageTitle,
        "data-pageLink": pageLink,
        "data-act": "no-drag",
      });
      item.html($("<div class='dd-handle dd3-handle ws-handle'></div><div class='dd3-content ws-newpage ws-itempage' data-pageId='" + pageID + "' data-pageTitle='" + pageTitle + "' data-pageLink='" + pageLink + "'>" + $(ui.draggable).html() + "</div><span class='symbols-outline'><a href='javascript:void(0);' data-pageID='" + pageID + "' class='deletePage'><span class='material-symbols-outlined'>Delete</span></a></span>" + templatePage({
        id: pageID,
        pagetitle: pageTitle,
        pagelink: pageLink
      })));
      $(this).append(item);
      pageIDs.push(pageID);
      var toAddpageIDs = pageIDs.toString();
      var serializedData = window.JSON.stringify($("#dd-selected-pages").nestable('serialize'));
      console.log(serializedData);
      $.ajax({
        url: APIPATH + 'updatemenuPagesList',
        method: 'POST',
        data: {
          updatedList: toAddpageIDs,
          menuID: menuID,
          pageIDs: serializedData
        },
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F")
            showResponse('', res, '');

          if (res.statusCode == 994) {
            app_router.navigate("logout", {
              trigger: true
            });
          }
          if (res.flag == "S") {
            if (selfobj.menuPagesList) {
              selfobj.menuPagesList.fetch({
                headers: {
                  'contentType': 'application/x-www-form-urlencoded',
                  'SadminID': $.cookie('authid'),
                  'token': $.cookie('_bb_key'),
                  'Accept': 'application/json'
                },
                error: selfobj.onErrorHandler,
                type: 'post',
                data: {
                  menuID: menuID,
                  status: 'active',
                  getAll: 'Y'
                }
              }).done(function (res) {
                if (res.flag == "F") showResponse('', res, '');
                if (res.statusCode == 994) {
                  app_router.navigate("logout", {
                    trigger: true
                  });
                }
                selfobj.render();
                $(".profile-loader").hide();
              });
            }
          }
          setTimeout(function () {
            $(event.currentTarget).html(status);
          }, 3000);
        }
      });
    },

    editPageDetails: function (event) {
      event.stopImmediatePropagation();
      let id = $(event.currentTarget).data('pageid');
      if (id) {
        let currentItemVisible = $('.menuIdCls_' + id).is(':visible');
        $('.menu-item-setting').hide();
        if (!currentItemVisible) {
          $('.menuIdCls_' + id).show();
        }
      } else {
        let pagetitle = $(event.currentTarget).data('pagetitle');
        pagetitle = pagetitle.replace(/\s+/g, '_');
        let currentItemVisible = $('.menuIdCls_' + pagetitle).is(':visible');
        $('.menu-item-setting').hide();
        if (!currentItemVisible) {
          $('.menuIdCls_' + pagetitle).show();
        }
      }
    },

    savePostions: function () {

      var selfobj = this;
      var positions = [];
      $('.updated').each(function () {
        positions.push([$(this).attr('data-index'), $(this).attr('data-position')])
        $(this).removeClass('updated');
      })
      var positionsToSave = positions;
      var menuID = $('#menuID').val();
      var action = "changePositions";

      var serializedData = window.JSON.stringify($("#dd-selected-pages").nestable('serialize'));
      console.log(serializedData);
      $.ajax({
        url: APIPATH + 'menuPagesMaster/updatePositions',
        method: 'POST',
        data: { positions: positionsToSave, action: action, menuID: menuID, pageIDs: serializedData },
        datatype: 'JSON',
        beforeSend: function (request) {
          // $(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") showResponse(e, res, '');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            selfobj.menuPagesList.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post', data: { menuID: selfobj.menuID, status: 'active', getAll: 'Y' }
            }).done(function (res) {
              if (res.flag == "F") showResponse('', res, '');
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              selfobj.render()
              $(".profile-loader").hide();
            });
            $(".profile-loader").hide();
          }
          setTimeout(function () {
            // $(e.currentTarget).html(status);
          }, 3000);
        }
      });

    },
    createNestable: function () {
      let selfobj = this;
      $('.dd').nestable({
        maxDepth: 2,
        group: $(this).prop('id')
      });
      $('.dd').on('change', function () {
        var $this = $(this);
        var serializedData = window.JSON.stringify($(this).nestable('serialize'));
        setTimeout(function () { selfobj.savePostions(); }, 100);
      });
    },

    render: function () {
      var selfobj = this;
      // console.log("this.menuPagesList.models",this.menuPagesList.models);
      var template = _.template(pagesMenuMasterTemp);
      this.$el.html(template({ singleMenuDetails: this.pagesMenuMasterSinglemodel.attributes, selectedMenu: this.selectedMenu, searchpagesMenuMaster: this.searchpagesMenuMaster.models, pagesList: this.pagesList.models, menuPagesList: this.menuPagesList.models }));
      $(".main_container").append(this.$el);
      $("body").find(".drag-drop-item").draggable({
        revert: false,
        cursor: 'move',
        containment: 'document',
        helper: "clone",
        cursor: "move",
        zIndex: 9,
        start: function (event, ui) {
          console.log('dragging');
          ui.helper.css('width', '300px'); // Set the desired width for the dragged helper
        },
      });
      $("body").find("#selected-pages").droppable({
        accept: ".drag-drop-item",
        over: function (event, ui) {
          //oldID =  $(this).attr('id');
          $(this).addClass("ui-state-highlight");
        },
        out: function (event, ui) {
          $(this).removeClass("ui-state-highlight");
        },
        drop: selfobj.handleDropEvent,
        draggable: 'disable',
      });
      if (typeof (this.menuID) == "undefined" || this.menuID == "") {
        $(".create-new-nav").hide();
        $("#saveuserRoleDetails").hide();
        $("#deleteMenuList").hide();
        $(".current-nav-div").hide();
      } else {
        $(".current-nav-div").show();
        // $("#saveuserRoleDetails").show();
        // $("#deleteMenuList").show();
      }

      // $('.dd').nestable({
      //   maxDepth: 2,
      //   group: $(this).prop('id')
      // });
      // $('.dd').on('change', function () {
      //     var $this = $(this);
      //     var serializedData = window.JSON.stringify($(this).nestable('serialize'));
      //     setTimeout(function(){selfobj.savePostions();}, 100);

      // });
      // $("body").find( "#dd-selected-pages" ).sortable();
      this.createNestable();
      return this;
    }
  });
  return pagesMenuMasterView;
});