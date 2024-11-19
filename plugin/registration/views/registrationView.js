define([
    "jquery",
    "underscore",
    "backbone",
    "datepickerBT",
    "Swal",
    "moment",
    "../views/registrationSingleView",
    "../collections/registrationCollection",
    "../models/registrationFilterModel",
    "../../core/views/configureColumnsView",
    "../../core/views/appSettings",
    "../../dynamicForm/collections/dynamicFormDataCollection",
    '../../category/collections/slugCollection',
    '../../core/views/moduleDefaultSettings',
    '../../core/views/timeselectOptions',
    '../../core/views/listSliderView',
    "text!../templates/registrationRow_temp.html",
    "text!../templates/registration_temp.html",
    "text!../templates/registrationFilterOption_temp.html",
    "text!../../dynamicForm/templates/linkedDropdown.html",
  ], function (
    $,
    _,
    Backbone,
    datepickerBT,
    Swal,
    moment,
    registrationSingleView,
    registrationCollection,
    registrationFilterModel,
    configureColumnsView,
    appSettings,
    dynamicFormData,
    slugCollection,
    moduleDefaultSettings,
    timeselectOptions,
    listSliderView,
    registrationRowTemp,
    registrationTemp,
    registrationFilterOptionTemp,
    linkedDropdown
  ) {
    var registrationView = Backbone.View.extend({
      collectionLength: "",
      module_desc: "",
      plural_label: "",
      form_label: "",
      currPage: 0,
      initialize: function (options) {
        var selfobj = this;
        this.toClose = "registrationFilterView";
        this.filteredSearch = false;
        this.totalRec = 0; 
        this.currPage = 0;
        this.tableStructure = {},
        this.View = "traditionalList";
        this.arrangedColumnList = [];
        this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
        this.skipFields = [];
        this.filteredFields = [];
        this.filteredData = [];
        $(".profile-loader").show();
        var mname = Backbone.history.getFragment();
        permission = ROLE[mname];
        if (permission.view == "no") {
          app_router.navigate("dashboard", { trigger: true });
        }
        var getmenu = permission.menuID;
        this.menuId = getmenu;
        var mname = Backbone.history.getFragment();
        readyState = true;
        selfobj.categoryList = new slugCollection();
        this.moduleDefaultSettings = new moduleDefaultSettings({parentObj:this});
        this.timeselectOptions = new timeselectOptions();
        this.appSettings = new appSettings();
        this.dynamicFormDatas = new dynamicFormData();
        this.appSettings.getMenuList(
          this.menuId,
          function (plural_label, module_desc, form_label, result) {
            selfobj.plural_label = plural_label;
            selfobj.module_desc = module_desc;
            selfobj.form_label = form_label;
            readyState = true;
            selfobj.moduleDefaultSettings.getColumnData();
            if (result.data[0] != undefined) {
              selfobj.tableName = result.data[0].table_name;
            }
          }
        );
  
        filterOption = new registrationFilterModel();
        filterOption.set({ menuId: this.menuId });
        this.collection = new registrationCollection();
        this.collection.on("add", this.addOne, this);
        this.collection.on("reset", this.addAll, this);
        selfobj.render();
      },
      getColumnData: function(){
        var selfobj = this;
        this.dynamicFormDatas.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginId": this.menuId }
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.metadata && res.metadata.trim() != '') {
                selfobj.metadata  = JSON.parse(res.metadata);
            } 
            if (res.c_metadata && res.c_metadata.trim() != '') {
                selfobj.c_metadata  = JSON.parse(res.c_metadata);
                selfobj.arrangedColumnList = selfobj.c_metadata;
            }
            var columnss = [];
            if(selfobj.metadata){
              for (const rowKey in selfobj.metadata) {
                const row = selfobj.metadata[rowKey];
                for (const colKey in row) {
                  const column = row[colKey];
                  if (column.column_name) {
                    columnss.push(column.column_name);
                  }
                }
              }
              const resDataFieldNames = res.data.map(item => item.column_name);
              selfobj.filteredData = resDataFieldNames.filter(fieldName => !columnss.includes(fieldName));
            }
          selfobj.render();
          selfobj.getModuleData();
        });
      },
      getModuleData:function(){
        var $element = $('#loadMember');
        var selfobj = this;
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $(".profile-loader").hide();
        });
        selfobj.render();
      },
      events: {
        "click .loadview": "loadSubView",
      },
      loadSubView: function (e) {
        var selfobj = this;
        var show = $(e.currentTarget).attr("data-view");
        switch (show) {
          case "singleregistrationData": {
            var registration_id = $(e.currentTarget).attr("data-registration_id");
            if(registration_id != "" && registration_id != null && registration_id != undefined ){
              if (permission.edit != "yes") {
              Swal.fire("You don't have permission to edit", '', 'error');
                return false;
              }else{
                 new registrationSingleView({ registration_id: registration_id, registration: this, menuId: selfobj.menuId, form_label: selfobj.form_label });
              }
            }else{
              if (permission.add != "yes") {
                Swal.fire("You don't have permission to add", '', 'error');
                return false;
              }else{
                 new registrationSingleView({registration_id: registration_id, registration: this, menuId: selfobj.menuId, form_label: selfobj.form_label });
              }
            }
            break;
          }
        }
      },

      defaultViewSet:function(){
        var selfobj = this;
        $("#listView").hide();
        $(".noCustAdded").hide();
        $("#filterOption").hide();
        if (selfobj.userSettings && selfobj.userSettings.hasOwnProperty(selfobj.menuId)) {
            for (const rowKey in selfobj.userSettings) {
              if(rowKey == selfobj.menuId){
                const displayView = selfobj.userSettings[rowKey].displayView;
                const tableStructure = selfobj.userSettings[rowKey].tableStructure;
                if(tableStructure){
                  selfobj.tableStructure = tableStructure;
                }else{
                  selfobj.tableStructure = {};
                }
                if(displayView){
                  if(selfobj.collection.length == 0){
                    $(".noCustAdded").show();
                  }else{
                    $("#listView").show();
                    $("#filterOption").show();
                  }
                  selfobj.View = "traditionalList";
                }
                if (tableStructure && tableStructure != {} && Object.entries(tableStructure).length > 0) {
                  for (const property in tableStructure) {
                      if (tableStructure.hasOwnProperty(property)) {
                        let columns;
                        if(property == 0){
                          const entry = tableStructure[property];
                          if (entry.hasOwnProperty('clist')) {
                              columns = entry['clist'];
                          }
                        }else{
                            columns = tableStructure['clist'];
                        }
                        
                          if (columns) {
                              for (const columnName in columns) {
                                  if (columns.hasOwnProperty(columnName)) {
                                    var tableId = '#clist';
                                  }
                              }
                              // Adjust column widths
                              selfobj.arrangedColumnList.forEach((column) => {
                                if (columns.hasOwnProperty(column.column_name)) {
                                  var value = columns[column.column_name];
                                  if (value == null || value == "" || value == undefined) {
                                    value = 190;
                                  } else {
                                    value = columns[column.column_name];
                                  }
                                } else {
                                  var value = 190;
                                }
                                  const thElement = document.querySelector(`${tableId} th[data-column="${column.column_name}"]`);
                                  if (thElement) {
                                    thElement.style.minWidth = column.column_name.length * 8 + 'px';
                                    if(parseFloat(thElement.style.minWidth) < 80){
                                      thElement.style.minWidth = 80 + 'px';
                                    }else{
                                      thElement.style.minWidth = thElement.style.minWidth;
                                    }
                                    if(value < (column.column_name.length * 8)){
                                      thElement.style.width = column.column_name.length * 8 + 'px';
                                    }else{
                                      thElement.style.width = value + 'px';
                                    }
                                  }
                              });
                              const unarrangedColumns = Object.keys(columns).filter(column => !selfobj.arrangedColumnList.some(arrangedColumn => arrangedColumn.column_name === column));
                              unarrangedColumns.forEach((column) => {
                                if(column != 'tableWidth'){
                                  if (columns.hasOwnProperty(column)) {
                                    let value = columns[column];
                                    if (value == null || value == "" || value == undefined) {
                                      value = 190;
                                    } else {
                                      value = columns[column];
                                    }
                                    const thElement = document.querySelector(`${tableId} th[data-column="${column}"]`);
                                    if (thElement) {
                                      if(column == 'check-gap'){
                                        thElement.style.minWidth = 50 + "px";
                                        thElement.style.width = value + 'px';
                                      }else if(column == 'action'){
                                        thElement.style.minWidth = 90 + "px";
                                        thElement.style.width = value + 'px';
                                      }else{
                                        thElement.style.minWidth = column.length * 8 + 'px';
                                        if(parseFloat(thElement.style.minWidth) < 80){
                                          thElement.style.minWidth = 80;
                                        }else{
                                          thElement.style.minWidth = thElement.style.minWidth;
                                        }
                                        if(value < (column.length * 8)){
                                          thElement.style.width = column.length * 8 + 'px';
                                        }else{
                                          thElement.style.width = value + 'px';
                                        }
                                      }
                                    }
                                  }
                                }
                              });                            
                          }else{
                            if(displayView != 'grid'){
                              selfobj.setColumnWidth('clist');
                            }
                          }
                      }
                  }
                }else{
                  if(displayView != 'grid'){
                    selfobj.setColumnWidth('clist');
                  }
                }
                selfobj.defaultTableSet('#clist','clist');
                selfobj.setTableWidth(false);
              }
            }
        } else {
              if(selfobj.collection.length == 0){
                $(".noCustAdded").show();
              }else{
                $("#listView").show();
                $("#filterOption").show();
              }
              selfobj.View = "traditionalList";
              selfobj.setColumnWidth('clist');
              selfobj.defaultTableSet('#clist','clist');
              selfobj.setTableWidth(false);
        }
        if(selfobj.arrangedColumnList.length > 0){
          var sectionID = 'listView';
          new listSliderView({sectionID : sectionID});
        }
      },

      setColumnWidth:function(tableID){
        var minWidth;
        var width;
        $('#'+tableID + ' ' + '.column-title').each(function(index) {
          if (index !== $('#'+tableID + ' ' + '.column-title').length) {
            var fieldLabel = $(this).attr('data-column');
            if (fieldLabel !== 'action' && fieldLabel !== 'check-gap' && fieldLabel !== '') {
              var fieldLabelLength = fieldLabel.length;
  
              minWidth = fieldLabelLength * 8;
              if(minWidth < 80){
                minWidth = 80
              }else{
                minWidth = minWidth;
              }
              width = 190 ;
            } else if(fieldLabel == 'action') {
              minWidth = 90;
              width = 105;
            } else if (fieldLabel == 'check-gap') {
              minWidth = 50;
              width = 50;
            }
            $(this).css('min-width', minWidth + 'px');
            if(width < minWidth){
              $(this).css('width', minWidth + 'px');
            }else{
              $(this).css('width', width + 'px');
            }
          }
        });  
      },
  
      defaultTableSet:function(tableId,tableID){
        var totalWidth = 0;
        var tableElement = document.querySelector(tableId);
        var tableElement1 = document.getElementById(tableID);
        if(tableElement1){
          var thElements = tableElement1.querySelectorAll('thead th.column-title');
          thElements.forEach(function(th) {
              var thWidthString = th.style.width;
              var thWidth = parseFloat(thWidthString); 
              totalWidth += thWidth;
          });
        }
        if (tableElement) {
            tableElement.style.width = totalWidth + 'px'; 
        } else {
            console.log(`Element with selector ${tableId} not found.`);
        }
      },
  
      setTableWidth:function(resize = false){
        var selfobj = this;
        var tableElement = document.getElementById('clist');
        if(tableElement){
          var customTableClassElements = tableElement.closest('.customTableClass');
          var thElements1 = tableElement.querySelectorAll('thead th.column-title');
          var totalWidth1 = 0;
          thElements1.forEach(function(th) {
              var thWidthString1 = th.style.width;
              var thWidth1 = parseFloat(thWidthString1); 
              totalWidth1 += thWidth1;
          });
          if (customTableClassElements) {
            var customTableElement = customTableClassElements;
              if(customTableElement.offsetWidth > totalWidth1){
                if(resize == true){
                  var differenceWidth = customTableElement.offsetWidth - totalWidth1 - 1;
                  let existingDynamicTd = tableElement.querySelector('.dynamicThead');
                  if (existingDynamicTd) {
                    existingDynamicTd.style.width = differenceWidth + 'px';
                  }
                }else{
                  var differenceWidth = customTableElement.offsetWidth - totalWidth1 - 1;
                  // var differenceWidth = customTableElement.offsetWidth - tableElement.offsetWidth;
                }
                if(differenceWidth > 5){
                  // Append <th> if it doesn't exist
                  if (!tableElement.querySelector('.dynamicThead')) {
                    var newTh = document.createElement('th');
                    newTh.style.width = differenceWidth + 'px';
                    newTh.textContent = '';
                    newTh.classList.add('dynamicThead');
                    var headingsRow = tableElement.querySelector('.headings');
                    headingsRow.appendChild(newTh);
                  }
      
                  // Append <td> in each <tr> if it doesn't exist
                  var rows = tableElement.querySelectorAll('.even.pointer');
                  rows.forEach(function(row) {
                      if (!row.querySelector('.dynamicTD')) {
                          var newTd = document.createElement('td');
                          newTd.style.width = differenceWidth + 'px';
                          newTd.textContent = '';
                          newTd.classList.add('dynamicTD');
                          row.appendChild(newTd);
                      }
                  });
                // }
                }else{
                  var existingDynamicTh = tableElement.querySelector('.dynamicThead');
                  if (existingDynamicTh) {
                      existingDynamicTh.parentNode.removeChild(existingDynamicTh);
                  }
                  var existingDynamicTd = tableElement.querySelectorAll('tbody .dynamicTD');
                  existingDynamicTd.forEach(function(td) {
                    td.parentNode.removeChild(td);
                  });
                }
              }else{
                var existingDynamicTh = tableElement.querySelector('.dynamicThead');
                if (existingDynamicTh) {
                    existingDynamicTh.parentNode.removeChild(existingDynamicTh);
                }
                var existingDynamicTd = tableElement.querySelectorAll('tbody .dynamicTD');
                existingDynamicTd.forEach(function(td) {
                  td.parentNode.removeChild(td);
                });
              }
          } else {
              console.log('No element found with class "customTableClass".');
          }
        }
      },
  
      columnsResizeFunction: function() {
        var selfobj = this;
        var tables = document.getElementsByClassName('resizable');
        for (var i = 0; i < tables.length; i++) {
            resizableGrid(tables[i]);
        }
    
        function resizableGrid(table) {
          var row = table.getElementsByTagName('tr')[0],
              cols = row ? row.children : undefined;
          if (!cols) return;
          var tableHeight = table.offsetHeight;
          for (var i = 0; i < cols.length; i++) {
              var div = createDiv(tableHeight);
              cols[i].appendChild(div);
              cols[i].style.position = 'relative';
              setListeners(div, cols[i]);
          }
      
          function setListeners(div, col) {
              var pageX, curCol, curColWidth, closestTable, tableName, tableWidth, tableElement, withoutPX;
      
              div.addEventListener('mousedown', onMouseDown);
              div.addEventListener('mouseover', onMouseOver);
              div.addEventListener('mouseout', onMouseOut);
      
              function onMouseDown(e) {
                  closestTable = e.target.closest('table');
                  if (closestTable) {
                      tableName = closestTable.getAttribute('id');
                      tableElement = document.getElementById(tableName);
                      tableWidth = parseFloat(tableElement.style.width);
                      curCol = col;
                      pageX = e.pageX;
                      var padding = paddingDiff(curCol);
                      curColWidth = curCol.offsetWidth - padding;
      
                      document.addEventListener('mousemove', onMouseMove);
                      document.addEventListener('mouseup', onMouseUp);
                  }
              }
      
              function onMouseOver(e) {
                  e.target.style.borderRight = '2px solid #84888c';
              }
      
              function onMouseOut(e) {
                  e.target.style.borderRight = '';
              }
      
              function onMouseMove(e) {
                  if (curCol) {
                      var diffX = e.pageX - pageX;
                      let minW = parseFloat(window.getComputedStyle(curCol).getPropertyValue("min-width"));
                      if (minW < (curColWidth + diffX)) {
                          curCol.style.width = (curColWidth + diffX) + 'px';
                          withoutPX = tableWidth + diffX;
                          tableElement.style.width = (tableWidth + diffX) + "px";
                      }
                  }
              }
      
              function onMouseUp(e) {
                  curCol = undefined;
                  pageX = undefined;
                  curColWidth = undefined;
                  if (tableName) {
                      $('#' + tableName + ' thead th').each(function() {
                          var datacolumn = $(this).attr('data-column');
                          var styleWidth = this.style.width;
                          var styleMinWidth = this.style.minWidth;
                          var width = parseFloat(styleWidth);
                          var minWidth = parseFloat(styleMinWidth);
                          if (width < minWidth) {
                              width = minWidth;
                          }
                          let columnObj = {};
                          if (datacolumn) {
                              columnObj[datacolumn] = width;
                              if (!selfobj.tableStructure[tableName]) {
                                  selfobj.tableStructure[tableName] = columnObj;
                              } else {
                                  Object.assign(selfobj.tableStructure[tableName], columnObj);
                              }
                          }
                      });
                      selfobj.setTableWidth(true);
                        var sectionID = 'listView';
                        new listSliderView({sectionID : sectionID});
                      selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId, selfobj.View, selfobj.tableStructure);
                  } else {
                      console.log("Table name not found.");
                  }
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
              }
          }
      
          function createDiv(height) {
              var div = document.createElement('div');
              div.style.top = 0;
              div.style.right = 0;
              div.style.width = '5px';
              div.style.position = 'absolute';
              div.style.cursor = 'col-resize';
              div.style.userSelect = 'none';
              div.style.height = '40px'; // Fixed height
              return div;
          }
      
          function paddingDiff(col) {
              if (getStyleVal(col, 'box-sizing') == 'border-box') {
                  return 0;
              }
              var padLeft = getStyleVal(col, 'padding-left');
              var padRight = getStyleVal(col, 'padding-right');
              return (parseInt(padLeft) + parseInt(padRight));
          }
      
          function getStyleVal(elm, css) {
              return (window.getComputedStyle(elm, null).getPropertyValue(css))
          }
        };
      
      },   
  
      render: function () {
        var selfobj = this;
        var template = _.template(registrationTemp);
        this.$el.html(
          template({
            closeItem: this.toClose,
            pluralLable: selfobj.plural_label,
            moduleDesc: selfobj.module_desc,
            arrangedColumnList: selfobj.arrangedColumnList,
            formLabel: selfobj.form_label || "",
            totalRec: this.totalRec,
          })
        );
        $(".app_playground").append(this.$el);
        $(".listCheckbox #cAll").hide();
        setToolTip();
        // console.log("user_setting",localStorage.getItem('user_setting'));
        if(localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15){
          selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
        }else{
          selfobj.userSettings = {};
        }

        setTimeout(function () {
          if(selfobj.userSettings && selfobj.userSettings != {} && Object.entries(selfobj.userSettings).length > 0) {
            selfobj.defaultViewSet();
          }else{
            selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId,"traditionalList",selfobj.tableStructure);
            if(localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15){
              selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
            }else{
              selfobj.userSettings = {};
            }
            selfobj.defaultViewSet();
          }
        }, 300);

        $(document).ready(function() {
          selfobj.columnsResizeFunction();
        });
        return this;
      },
    });
  
    return registrationView;
  });