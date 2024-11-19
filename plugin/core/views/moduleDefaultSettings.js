
define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'Swal',
  '../../core/views/listSliderView',
  '../collections/columnsCollection',
], function ($, _, Backbone, moment, Swal, listSliderView, columnsCollection) {
  var moduleDefaultSettings = Backbone.View.extend({
    userSettings: {},
    parentObj: null,
    initialize: function (options) {
      var selfobj = this;
      this.tableStructure = {},
      this.View = "traditionalList";
      this.parentObj = options.parentObj;
      this.parentObj.columnList = [];
      this.getColumnList();
      // GET USERSETTINGS FROM LOCAL STORAGE
      if (localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15) {
        selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
      }
      // CHECK FOR USERSETTINGS [ IF BLANK THEN SETDEFAULT USERSETTINGS ]
      if (selfobj.userSettings && selfobj.userSettings == {}) {
        selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.parentObj.menuId, "traditionalList", selfobj.tableStructure);
        if (localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15) {
          selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
        }
      }
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    // SET DEFAULT VIEW AS PER USERSETTINGS
    setModuleDefaultView: function (menuID, moduleView, tableStructure) {
      var existingSettings = localStorage.getItem("user_setting");
      if (existingSettings && existingSettings.length <= 15) {
        var jsonForm = {};
      } else {
        var jsonForm = existingSettings ? JSON.parse(existingSettings) : {};
      }
      // NEW USERSETTINGS JSON FORMATION
      jsonForm[menuID] = {
        displayView: moduleView,
        tableStructure: tableStructure
      };
      var updatedSettings = JSON.stringify(jsonForm);
      // UPDATE USERSETTINGS IN LOCAL STORAGE ALSO
      localStorage.setItem("user_setting", updatedSettings);
      $.ajax({
        url: APIPATH + 'setModuleDefaultView',
        method: 'POST',
        data: { 'jsonForm': updatedSettings },
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
            console.log('success..!');
          }
        }
      });
    },
    // SET DEFAULT VIEW [ CALLED WHEN PARENTVIEW RENDER IS INVOKED ]
    defaultViewSet: function () {
      var selfobj = this;
      selfobj.parentObj.$("#listView").hide();
      $(".noCustAdded").hide();
      $("#filterOption").hide();
      if (selfobj.userSettings && selfobj.userSettings.hasOwnProperty(this.parentObj.menuId)) {
        for (const rowKey in selfobj.userSettings) {
          if (rowKey == this.parentObj.menuId) {
            const displayView = selfobj.userSettings[rowKey].displayView;
            const tableStructure = selfobj.userSettings[rowKey].tableStructure;
            if (tableStructure) {
              selfobj.tableStructure = tableStructure;
            } else {
              selfobj.tableStructure = {};
            }
            if (displayView) {
              if (selfobj.parentObj.collection.length == 0) {
                selfobj.parentObj.$(".noCustAdded").show();
              } else {
                selfobj.parentObj.$("#listView").show();
                selfobj.parentObj.$("#filterOption").show();
              }
              selfobj.View = "traditionalList";
            }
            // IF TABLESTRUCTURE HAVING PROPERIES
            if (tableStructure && tableStructure != {} && Object.entries(tableStructure).length > 0) {
              for (const property in tableStructure) {
                if (tableStructure.hasOwnProperty(property)) {
                  let columns;

                  // CHECK IF TABLE NAME IS EXISTS
                  if (property == 0) {
                    const entry = tableStructure[property];
                    if (entry.hasOwnProperty('clist')) {
                      columns = entry['clist'];
                    }
                  } else {
                    columns = tableStructure['clist'];
                  }
                  if (columns) {
                    for (const columnName in columns) {
                      if (columns.hasOwnProperty(columnName)) {
                        var tableId = '#clist';
                      }
                    }
                    // ADJUST COLUMN WIDTH
                    selfobj.parentObj.arrangedColumnList.forEach((column) => {
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
                      // SELECT TABLE COLUMN [clist th]
                      const thElement = document.querySelector(`${tableId} th[data-column="${column.column_name}"]`);
                      if (thElement) {
                        thElement.style.minWidth = column.column_name.length * 8 + 'px';
                        if (parseFloat(thElement.style.minWidth) < 80) {
                          thElement.style.minWidth = 80 + 'px';
                        } else {
                          thElement.style.minWidth = thElement.style.minWidth;
                        }
                        if (value < (column.column_name.length * 8)) {
                          thElement.style.width = column.column_name.length * 8 + 'px';
                        } else {
                          thElement.style.width = value + 'px';
                        }
                      }
                    });
                    // GET ARRANGED COLUMNS IN TABLE
                    const unarrangedColumns = Object.keys(columns).filter(column => !selfobj.parentObj.arrangedColumnList.some(arrangedColumn => arrangedColumn.column_name === column));
                    unarrangedColumns.forEach((column) => {
                      if (column != 'tableWidth') {
                        if (columns.hasOwnProperty(column)) {
                          let value = columns[column];
                          if (value == null || value == "" || value == undefined) {
                            value = 190;
                          } else {
                            value = columns[column];
                          }
                          const thElement = document.querySelector(`${tableId} th[data-column="${column}"]`);
                          if (thElement) {
                            if (column == 'check-gap') {
                              thElement.style.minWidth = 50 + "px";
                              thElement.style.width = value + 'px';
                            } else if (column == 'action') {
                              thElement.style.minWidth = 90 + "px";
                              thElement.style.width = value + 'px';
                            } else {
                              thElement.style.minWidth = column.length * 8 + 'px';
                              if (parseFloat(thElement.style.minWidth) < 80) {
                                thElement.style.minWidth = 80;
                              } else {
                                thElement.style.minWidth = thElement.style.minWidth;
                              }
                              if (value < (column.length * 8)) {
                                thElement.style.width = column.length * 8 + 'px';
                              } else {
                                thElement.style.width = value + 'px';
                              }
                            }
                          }
                        }
                      }
                    });
                  } else {
                    if (displayView != 'grid') {
                      selfobj.setColumnWidth('tableList');
                    }
                  }
                }
              }
            } else {
              if (displayView != 'grid') {
                selfobj.setColumnWidth('tableList');
              }
            }
            selfobj.defaultTableSet('.tableList', 'tableList');
            selfobj.setTableWidth(false);
          }
        }
      } else {
        if (selfobj.parentObj.collection.length == 0) {
          $(".noCustAdded").show();
        } else {
          $("#listView").show();
          $("#filterOption").show();
        }
        selfobj.View = "traditionalList";
        selfobj.setColumnWidth('tableList');
        //selfobj.defaultTableSet('#clist', 'clist');
        selfobj.defaultTableSet('.tableList', 'tableList');
        selfobj.setTableWidth(false);
      }
      if (selfobj.parentObj.arrangedColumnList.length > 0) {
        selfobj.setListSliderView();
      }
    },
    // SET COLUMN WIDTH
    setColumnWidth: function (tableID) {
      var minWidth;
      var width;
      this.parentObj.$('.' + tableID + ' ' + '.column-title').each(function (index) {
        if (index !== $('.' + tableID + ' ' + '.column-title').length) {
          var fieldLabel = $(this).attr('data-column');
          if (fieldLabel !== 'action' && fieldLabel !== 'check-gap' && fieldLabel !== '') {
            var fieldLabelLength = fieldLabel.length;
            minWidth = fieldLabelLength * 8;
            if (minWidth < 80) {
              minWidth = 80
            } else {
              minWidth = minWidth;
            }
            width = 190;
          } else if (fieldLabel == 'action') {
            minWidth = 90;
            width = 90;
          } else if (fieldLabel == 'check-gap') {
            minWidth = 50;
            width = 50;
          }
          $(this).css('min-width', minWidth + 'px');
          if (width < minWidth) {
            $(this).css('width', minWidth + 'px');
          } else {
            $(this).css('width', width + 'px');
          }
        }
      });
    },
    // SET TABLE DEFAULT WIDTH [ TOTAL OF th WIDTH ]
    defaultTableSet: function (tableId, tableID) {
      var totalWidth = 0;
      var tableElement = document.querySelector(tableId);
      //var tableElement1 = document.getElementById(tableID);
      var tableElement1 = this.parentObj.$("." + tableID);
      if (tableElement1) {
        //var thElements = tableElement1.querySelectorAll('thead th.column-title');
        var thElements = tableElement1.find('thead th.column-title');
        thElements.each(function (index) {
          var thWidthString = $(this).width();
          var thWidth = parseFloat(thWidthString);
          totalWidth += thWidth;
        });
      }
      if (tableElement1) {
        tableElement1.width(totalWidth + 'px');
      } else {
        console.log(`Element with selector ${tableId} not found.`);
      }
    },
    setTableWidth: function (resize = false) {
      var selfobj = this;
      var tableElement = document.getElementById('clist');
      if (tableElement) {
        var customTableClassElements = tableElement.closest('.customTableClass');
        var thElements1 = tableElement.querySelectorAll('thead th.column-title');
        var totalWidth1 = 0;
        thElements1.forEach(function (th) {
          var thWidthString1 = th.style.width;
          var thWidth1 = parseFloat(thWidthString1);
          totalWidth1 += thWidth1;
        });
        if (customTableClassElements) {
          var customTableElement = customTableClassElements;
          if (customTableElement.offsetWidth > totalWidth1) {
            if (resize == true) {
              var differenceWidth = customTableElement.offsetWidth - totalWidth1 - 1;
              let existingDynamicTd = tableElement.querySelector('.dynamicThead');
              if (existingDynamicTd) {
                existingDynamicTd.style.width = differenceWidth + 'px';
              }
            } else {
              var differenceWidth = customTableElement.offsetWidth - totalWidth1 - 1;
            }
            if (differenceWidth > 5) {
              if (!tableElement.querySelector('.dynamicThead')) {
                var newTh = document.createElement('th');
                newTh.style.width = differenceWidth + 'px';
                newTh.textContent = '';
                newTh.classList.add('dynamicThead');
                var headingsRow = tableElement.querySelector('.headings');
                headingsRow.appendChild(newTh);
              }
              var rows = tableElement.querySelectorAll('.even.pointer');
              rows.forEach(function (row) {
                if (!row.querySelector('.dynamicTD')) {
                  var newTd = document.createElement('td');
                  newTd.style.width = differenceWidth + 'px';
                  newTd.textContent = '';
                  newTd.classList.add('dynamicTD');
                  row.appendChild(newTd);
                }
              });
            } else {
              var existingDynamicTh = tableElement.querySelector('.dynamicThead');
              if (existingDynamicTh) {
                existingDynamicTh.parentNode.removeChild(existingDynamicTh);
              }
              var existingDynamicTd = tableElement.querySelectorAll('tbody .dynamicTD');
              existingDynamicTd.forEach(function (td) {
                td.parentNode.removeChild(td);
              });
            }
          } else {
            var existingDynamicTh = tableElement.querySelector('.dynamicThead');
            if (existingDynamicTh) {
              existingDynamicTh.parentNode.removeChild(existingDynamicTh);
            }
            var existingDynamicTd = tableElement.querySelectorAll('tbody .dynamicTD');
            existingDynamicTd.forEach(function (td) {
              td.parentNode.removeChild(td);
            });
          }
        } else {
          console.log('No element found with class "customTableClass".');
        }
      }
    },
    // INVOKED FROM PARENT VIEW WHEN COLUMN RESIZED
    columnsResizeFunction: function () {
      var selfobj = this;
      var tables = selfobj.parentObj.$('.resizable');
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
            closestTable = $(e.target).closest('table');
            if (closestTable) {
              //tableName = closestTable. getAttribute('id');
              tableElement = tables; //selfobj.parentObj.$() document.getElementById(tableName);
              //tableWidth = parseFloat(tableElement.style.width);
              tableWidth = parseFloat(tableElement.width());
              curCol = col;
              pageX = e.pageX;
              var padding = paddingDiff(curCol);
              curColWidth = curCol.offsetWidth - padding;

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }
          }
          function onMouseOver(e) {
            $(e.target).css("borderRight", '2px solid #84888c');
          }
          function onMouseOut(e) {
            $(e.target).css("borderRight", 'unset');
            //e.target.style.borderRight = '';
          }
          function onMouseMove(e) {
            if (curCol) {
              var diffX = e.pageX - pageX;
              let minW = parseFloat(window.getComputedStyle(curCol).getPropertyValue("min-width"));
              if (minW < (curColWidth + diffX)) {
                curCol.style.width = (curColWidth + diffX) + 'px';
                withoutPX = tableWidth + diffX;
                //tableElement.style.width = (tableWidth + diffX) + "px";
                tableElement.width((tableWidth + diffX) + "px");
              }
            }
          }
          function onMouseUp(e) {
            curCol = undefined;
            pageX = undefined;
            curColWidth = undefined;
            if (tableElement) {
              $(tableElement).find('thead th').each(function () {
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
                  if (!selfobj.tableStructure['clist']) {
                    selfobj.tableStructure['clist'] = columnObj;
                  } else {
                    Object.assign(selfobj.tableStructure['clist'], columnObj);
                  }
                }
              });
              selfobj.setTableWidth(true);
              selfobj.setListSliderView();
              selfobj.setModuleDefaultView(selfobj.parentObj.menuId, selfobj.View, selfobj.tableStructure);
            } else {
              console.log("Table name not found.");
            }
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          }
        }
        // CREATE DIV 
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
        // ADDS PADDING WHEN MOUSE IS HOVERED ON TABLE HEAD
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
    setListSliderView: function (sectionID) {
      var selfobj = this;
      // if (sectionID == undefined || sectionID == '') {
      //   sectionID =  'listView';
      // }
      if (this.parentObj.tableName == 'courses') {
        sectionID = 'courseListView';
      } else if (this.parentObj.tableName == 'customer') {
        if (selfobj.View == "traditionalList") {
          var sectionID = 'leadlistview';
        } else if (selfobj.View == "modernlist") {
          var sectionID = 'modernlistview';
        }
      }
      if (sectionID != undefined && sectionID == '') {
        new listSliderView({ sectionID: sectionID });
      }
    },
    // COLUMNS DATA FOR MODULES
    getColumnData: function () {
      var selfobj = this;
      selfobj.parentObj.dynamicFormDatas.fetch({
        beforeSend: function() {
          $('.loder').show();    
        },
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.parentObj.onErrorHandler, type: 'post', data: { "pluginId": selfobj.parentObj.menuId }
      }).done(function (res) {
        $('.loder').hide();
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.metadata && res.metadata.trim() != '') {
          selfobj.parentObj.metadata = JSON.parse(res.metadata);
        }
        if (res.c_metadata && res.c_metadata.trim() != '') {
          // IF THE C-METADATA IS PRESENT
          selfobj.parentObj.c_metadata = JSON.parse(res.c_metadata);
          if (selfobj.parentObj.c_metadata.length != 0) {
            selfobj.parentObj.c_metadata.forEach((columnData) => {
              const index = selfobj.parentObj.columnMappings.findIndex(mapping => columnData.column_name in mapping);
              columnData.fieldLabel = index !== -1 ? selfobj.parentObj.columnMappings[index]["" + columnData.column_name] : columnData.fieldLabel;
              columnData.fieldLabel = columnData.fieldLabel.replace(/\b\w/g, char => char.toUpperCase());
            });
            selfobj.parentObj.arrangedColumnList = selfobj.parentObj.c_metadata;
          } else {
            // IF THE C-METADATA IS EMPTY THEN ADD DEFAULT COLUMNS IN arrangedColumnList
            var fieldDataArray = [];
            selfobj.parentObj.arrangedColumnList = [];
            console.log('selfobj.parentObj.defaultColumns : ',selfobj.parentObj.defaultColumns);
            selfobj.parentObj.columnlist.map((col) => {
              if (selfobj.parentObj.defaultColumns.includes(col.Field)) {
                var fieldLabel = selfobj.capitalizeFirstLetter(col.Field);
                // IF COLUMN PRESENT IN COLUMN MAPPING
                selfobj.parentObj.columnMappings.find((map) => {
                  if (map.hasOwnProperty(col.Field)) {
                    fieldLabel = map[col.Field];
                  }
                });               
                // PREPARE OBJECT FOR C-METADATA STRING
                fieldDataArray.push({
                  fieldID: "",
                  fieldLabel: fieldLabel,
                  fieldType: col.Type,
                  column_name: col.Field,
                  linkedWith: "",
                  fieldOptions: "",
                  dateFormat: "",
                  displayFormat: "",
                  parentCategory: "",
                });
              }
            });
            selfobj.parentObj.arrangedColumnList = fieldDataArray;
            var jsonData = JSON.stringify(fieldDataArray);
            selfobj.updateC_metaData(jsonData);
          }
        }
        var columnss = [];
        if (selfobj.parentObj.metadata) {
          for (const rowKey in selfobj.parentObj.metadata) {
            const row = selfobj.parentObj.metadata[rowKey];
            for (const colKey in row) {
              const column = row[colKey];
              if (column.column_name) {
                columnss.push(column.column_name);
              }
            }
          }
          const resDataFieldNames = res.data.map(item => item.column_name);
          selfobj.parentObj.filteredData = resDataFieldNames.filter(fieldName => !columnss.includes(fieldName));
        }
        selfobj.parentObj.render();
        selfobj.getModuleData();
      });
    },
    // UPDATE C-METADATA
    updateC_metaData: function (htmlContent) {
      var selfobj = this;
      let method = "POST";
      $.ajax({
        type: 'POST',
        url: APIPATH + 'c_metadata',
        data: { menuId: selfobj.parentObj.menuId, htmlContent: htmlContent, method: method },
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") showResponse(event, res, '');
          if (res.flag == "S") {
            // selfobj.getColumnData();
          }
        },
        error: function (error) {
          console.error('Error saving HTML structure:', error);
        }
      });
    },
    getModuleData: function () {
      var selfobj = this;
      var $element = $('#loadMember');
      selfobj.parentObj.collection.reset();
      selfobj.parentObj.collection.fetch({
        beforeSend: function () {
          $('.loder').show();
        },
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.parentObj.filterOption.attributes
      }).done(function (res) {
        $('.loder').hide();    
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == 'S') {
          (res.data.length > 0) ? $('.filter').show() : $('.filter').hide();
        }
        res.paginginfo.loadFrom = selfobj.parentObj.toClose;
        setPagging(res.paginginfo, res.loadstate, res.msg);
      });
      selfobj.parentObj.render();
    },
    // GET COLUMNLIST - USED FOR DEFAULT GETTING INFORMATION SCHEMA OF TABLE 
    // USED FOR COLUMN-CONFIGURATION AND DYNAMIC-FILTER ALSO
    getColumnList: function () {
      var selfobj = this;
      this.columnsCollection = new columnsCollection();
      this.columnsCollection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { menuID: this.parentObj.menuId, status: "active" }
      }).done(function (res) {
        if (res.flag == "F") { showResponse('', res, ''); }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        // THIS COLUMN LIST IS USED FOR DYNAMIC FILTER AND COLUMN-CONFIGURATION ALSO
        selfobj.parentObj.columnlist = res.data;
      });
    },
    // CAPITALIZE LETTERS  
    capitalizeFirstLetter: function (colVal) {
      if (typeof colVal == 'string') {
        colVal = colVal.replace(/_/g, ' ');
        return colVal.replace(/\b\w/g, char => char.toUpperCase());
      } else {
        return colVal;
      }
    },
  });

  return moduleDefaultSettings;
});
