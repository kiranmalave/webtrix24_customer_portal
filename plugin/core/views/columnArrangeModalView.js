define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'datepickerBT',
    'Swal',
    '../../dynamicForm/collections/dynamicFormDataCollection',
    '../../dynamicForm/collections/dynamicFormCollection',
    '../../dynamicForm/collections/dynamicStdFieldsCollection',
    '../../menu/models/singleMenuModel',
    'text!../templates/columnArrangemodelTemp.html',
  ], function ($, _, Backbone, validate, datepickerBT,Swal,dynamicFormData,dynamicFormCollection,dynamicStdFieldsCol,singleMenuModel,columnArrangemodelTemp) {

    var columnArrangeModalView = Backbone.View.extend({
      parentObj:null,
      initialize: function (options) {
        var selfobj = this;
        this.collectedData = [];
        this.filteredList = [];
        this.menuId = options.menuId;
        this.parentObj = options.ViewObj;
        this.stdColumn = options.stdColumn;
        this.arrangedColumnList = [];
        $(".popupLoader").show();
        $(".profile-loader").show();
        this.dynamicFormListt = new dynamicFormCollection();
        this.dynamicStdFieldsList = new dynamicStdFieldsCol();
        this.collection = new dynamicFormData();
        this.menuList = new singleMenuModel();
        selfobj.getModuleData();
        selfobj.getMenuList();
      },

      getMenuList: function (e) {
        var selfobj = this;
        selfobj.menuList.set({"menuID":this.menuId});
        this.menuList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded',
            'SadminID': $.cookie('authid'),
            'token': $.cookie('_bb_key'),
            'Accept': 'application/json'
          },
          error: selfobj.onErrorHandler
        }).done(function (result) {
          try{
          if (result.statusCode == 994) {
            app_router.navigate("logout", { trigger: true });
          }
          $(".popupLoader").hide();
          if(result.data[0] != undefined){
            selfobj.tableName = result.data[0].table_name;
           
          }
          if(selfobj.dynamicStdFieldsList && selfobj.dynamicStdFieldsList != undefined){
            selfobj.dynamicStdFieldsList.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded',
                'SadminID': $.cookie('authid'),
                'token': $.cookie('_bb_key'),
                'Accept': 'application/json'
              },
              error: selfobj.onErrorHandler,
              type: 'post',
              data: { "table": "ab_" + selfobj.tableName }
            }).done(function (res) {
              if (res.flag == "F") showResponse(e,res,'');
              if(selfobj.collectedData.data){
                const collectedDataFields = selfobj.collectedData.data.map(item => item.column_name);
                const filteredDynamicStdFieldsList = selfobj.dynamicStdFieldsList.filter(model => {
                  const field = model.attributes.Field;
                  return !collectedDataFields.includes(field);
                });
                var filteredList = filteredDynamicStdFieldsList.filter(item => {
                  if(selfobj.stdColumn){
                    const fieldInStdColumn = selfobj.stdColumn.includes(item.attributes.Field);
                    return !fieldInStdColumn;
                  }
                });

                filteredList.forEach(function(data) {
                  
                    const newField = {
                      fieldType : data.attributes.Type, 
                      fieldLabel: formatFieldLabel(data.attributes.Field),
                      column_name: data.attributes.Field, 
                    };
        
                    function formatFieldLabel(label) {
                      return label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                    }
                    selfobj.filteredList.push(newField);
                });
              }
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".popupLoader").hide();
              selfobj.render();
            });
          }
          }catch(error){
            console.log("errorrr",error);
          }
          selfobj.render();
        });
      },

      getModuleData: function(event){
        var selfobj = this;
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginId": this.menuId }
        }).done(function (res) {
          if (res.flag == "F") showResponse(event,res,'');
          selfobj.collectedData = res;
          $(".popupLoader").hide();
          $(".profile-loader").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
    
          if (res.metadata && res.metadata != undefined && res.metadata.trim() !== '') {
              selfobj.metadata  = JSON.parse(res.metadata);
          } 
          if (res.c_metadata && res.c_metadata != undefined && res.c_metadata.trim() !== '') {
              selfobj.c_metadata  = JSON.parse(res.c_metadata);
              selfobj.arrangedColumnList = selfobj.c_metadata;
          }
          if (res.metadata && res.metadata != undefined) {
          // if (res.metadata && res.metadata != undefined && res.c_metadata && res.c_metadata != undefined) {
            // for (const rowKey in selfobj.metadata) {
            //   const row = selfobj.metadata[rowKey];
            //   for (const colKey in row) {
            //     const column = row[colKey];
            //     if (column.fieldID) {
            //       const cMetadataItem = selfobj.c_metadata.find(item => item.fieldID == column.fieldID);
            //       if (cMetadataItem) {
            //         Object.assign(cMetadataItem, column);
            //       }
            //     }
            //   }
            // }
            // selfobj.c_metadata = selfobj.c_metadata.filter(item => {
            //   return Object.values(selfobj.metadata).some(row => {
            //     return Object.values(row).some(col => col.fieldID == item.fieldID);
            //   });
            // });
            // selfobj.arrangedColumnList = selfobj.c_metadata;
            var metadatas = selfobj.metadata;
            if(metadatas != undefined){
                const flatArray = Object.values(metadatas).flatMap(row => {
                  const fields = [];
                  if (row.col1 && row.col1.fieldID !== undefined) {
                    fields.push({ fieldID: row.col1.fieldID, fieldLabel: row.col1.fieldLabel, fieldType: row.col1.fieldType,column_name: row.col1.column_name,linkedWith: row.col1.linkedWith,fieldOptions: row.col1.fieldOptions,dateFormat: row.col1.dateFormat,displayFormat: row.col1.displayFormat,parentCategory: row.col1.parentCategory});
                  }
                  if (row.col2 && row.col2.fieldID !== undefined) {
                    fields.push({ fieldID: row.col2.fieldID, fieldLabel: row.col2.fieldLabel, fieldType: row.col2.fieldType,column_name: row.col2.column_name,linkedWith: row.col2.linkedWith,fieldOptions: row.col2.fieldOptions,dateFormat: row.col2.dateFormat,displayFormat: row.col2.displayFormat,parentCategory: row.col2.parentCategory});
                  }
                  if (row.col3 && row.col3.fieldID !== undefined) {
                    fields.push({ fieldID: row.col3.fieldID, fieldLabel: row.col3.fieldLabel, fieldType: row.col3.fieldType,column_name: row.col3.column_name,linkedWith: row.col3.linkedWith,fieldOptions: row.col3.fieldOptions,dateFormat: row.col3.dateFormat,displayFormat: row.col3.displayFormat,parentCategory: row.col3.parentCategory});
                  }
                  return fields;
                });
                selfobj.customColumnList = flatArray;
            }
          }
          selfobj.render();
        });
        selfobj.render();
      },

      events:
      {
        "click .changeStatus": "deleteField",
        "click .closeModalBtn": "closeModal",
      },

      attachEvents: function () {
        this.$el.off('click', '.changeStatus', this.deleteField);
        this.$el.on('click', '.changeStatus', this.deleteField.bind(this));
        this.$el.off('click', '.closeModalBtn', this.closeModal);
        this.$el.on('click', '.closeModalBtn', this.closeModal.bind(this));
      },

      onErrorHandler: function (collection, response, options) {
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
        $(".popupLoader").hide();
      },
      
      initializeValidate: function () {
        var selfobj = this;
      },

      setOldValues: function () {
        var selfobj = this;
      },

      setupDragable: function() {
        $("#customColumnListData .field_drag").draggable({
            containment: "document",
            helper: "clone",
            cursor: "move",
        });
      },
  
      setupSortable: function(event) {
        var selfobj = this;
        var $elm = $(".fieldsDroppable");
        var isSort = $elm.sortable("instance");
        if (isSort == undefined) {
            $elm.sortable({
                placeholder: "ui-state-highlight",
                forcePlaceholderSize: true,
                update: function(event, ui) {
                  setTimeout(function() {
                    selfobj.saveForm(event);
                  }, 1000);
                }
            });
        } else {
            $elm.sortable("refresh");
        }
      },
    

      setupDropable: function(){
        var selfobj = this; 
        $("body").find(".fieldsDroppable").droppable({
          accept: "#customColumnListData .field_drag",
          over: function(event, ui) {
              $(this).addClass("ui-state-highlight");
          },
          out: function(event, ui) {
              $(this).removeClass("ui-state-highlight");
          },
          drop: function(event, ui) {
            ui.draggable.addClass("dropped");
            ui.draggable.unbind();
            $(this).append(ui.draggable);
            $(this).removeClass("ui-state-highlight");
            ui.draggable.removeClass("ui-draggable-dragging");
            var fieldID = ui.draggable.data("fieldid");
            var deleteButton = $(
                "<span type='button' class='changeStatus deleteAll ws-btn-default fieldActionBtns' data-action='delete' data-fieldid='" +
                    fieldID +
                    "'><i class='material-icons' style='padding: 2px 5px;'>delete</i></span>"
            );
            ui.draggable.append(deleteButton);
            setTimeout(function() {
              selfobj.saveForm(event);
            }, 1000);
          },
        });
      },

      deleteField: function (e) {
        var selfobj = this;
        var column_name = $(e.currentTarget).data("column_name");
        var fieldElement = $(".fieldsDroppable .field_drag[data-column_name='" + column_name + "']");
        fieldElement.remove();
        fieldElement.find('.fieldActionBtns').remove();
        $("#customColumnListData").append(fieldElement);
        selfobj.saveForm(e);
      },

      closeModal: function(e) {
        var selfobj = this;
        $('#customColumnModal').modal('hide');
        $('#customColumnModal').on('hidden.bs.modal', function(e) {
            $('#customColumnModal').off('hidden.bs.modal');
            selfobj.parentObj.getColumnData();
            selfobj.parentObj.filterSearch();
        });
      },

      saveForm: function (event) {
        var selfobj = this;
        var draggedElements = $(".fieldsDroppable .field_drag");
        var fieldDataArray = [];
        draggedElements.each(function () {
          var fieldID = $(this).data("fieldid");
          var fieldLabel = $(this).data("fieldlabel");
          var fieldType = $(this).data("fieldtype");
          var column_name = $(this).data("column_name");
          var linkedWith = $(this).data("linkedwith");
          var fieldOptions = $(this).data("fieldoptions");
          var dateFormat = $(this).data("dateformat");
          var displayFormat = $(this).data("displayformat");
          var parentCategory = $(this).data("parentcategory");
          var fieldObject = {
            fieldID: fieldID,
            fieldLabel: fieldLabel,
            fieldType: fieldType,
            "column_name": column_name,
            linkedWith: linkedWith,
            fieldOptions: fieldOptions,
            dateFormat: dateFormat,
            displayFormat: displayFormat,
            parentCategory: parentCategory,
          };
          fieldDataArray.push(fieldObject);
        });
        var jsonData = JSON.stringify(fieldDataArray);
        let method = "POST";
        $.ajax({
            type: 'POST',
            url: APIPATH+'c_metadata',
            data: {menuId:selfobj.menuId, htmlContent: jsonData, method:method },
            beforeSend: function (request) {
              request.setRequestHeader("token",$.cookie('_bb_key'));
              request.setRequestHeader("SadminID",$.cookie('authid'));
              request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept",'application/json');
            },
            success: function (res) {
              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
              if (res.flag == "F") showResponse(event,res,'');
            },
            error: function (error) {
              console.error('Error saving HTML structure:', error);
            }
        });
        selfobj.setupDragable();
        selfobj.setupDropable();
        selfobj.setupSortable();
      },
      
      render: function () {
        $(".popupLoader").hide();
        $(".profile-loader").hide();
          var selfobj = this;  
          $("#customColumnModal").empty();
          var source = columnArrangemodelTemp;
          var template = _.template(source);
          if ((selfobj.customColumnList) && (selfobj.arrangedColumnList)) {
            selfobj.customColumnList = selfobj.customColumnList.filter(function (customField) {
                return !selfobj.arrangedColumnList.some(function (arrangedField) {
                    return customField.column_name === arrangedField.column_name;
                });
            });
          }
          if ((selfobj.filteredList) && (selfobj.arrangedColumnList)) {
            selfobj.filteredList = selfobj.filteredList.filter(function (customField) {
                return !selfobj.arrangedColumnList.some(function (arrangedField) {
                    return customField.column_name === arrangedField.column_name;
                });
            });
          }
        this.$el.html(template({"customColumnList": selfobj.customColumnList,"arrangedColumnList": selfobj.arrangedColumnList,"filteredList":selfobj.filteredList}));
        $("#customColumnModal").append(this.$el);
        this.initializeValidate();
        this.setOldValues();
        this.attachEvents();
        selfobj.setupDragable();
        selfobj.setupDropable();
        selfobj.setupSortable();
        $('#customColumnModal').modal('show');
        setToolTip();
        return this;
      },
        
      onDelete: function () {
      this.remove();
      },

    });
  
    return columnArrangeModalView;
  
  });
  