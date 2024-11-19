define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'Swal',
    '../models/filterSingleModel',
    '../collections/filterCollection',
    '../collections/columnsCollection',
    '../../admin/collections/adminCollection',
    '../../category/collections/slugCollection',
    '../../dynamicForm/collections/dynamicFormDataCollection',
    '../../dynamicForm/views/dynamicFieldRender',
    '../../core/views/multiselectOptions',
    'text!../templates/dynamicFilterTemp.html',
    'text!../templates/categoryTemplate.html',
    'text!../templates/dateConditionTemplate.html',

    'text!../templates/filterdropdownTemp.html',
    'text!../templates/filterConditionLikned.html',

    'text!../templates/filterFieldListTemp.html',
    'text!../templates/filterFieldSingle.html',
    'text!../templates/filterFieldSingleEdit.html',
    'text!../templates/joinedFieldTemplate.html',
    // VALUE TEMPLATE 
    'text!../templates/inputTemplates/value-text.html',
    'text!../templates/inputTemplates/value-text-range.html',
    'text!../templates/inputTemplates/value-date-range.html',
    'text!../templates/inputTemplates/value-date-time.html',
    'text!../templates/inputTemplates/value-enum.html',
    'text!../templates/inputTemplates/value-dynamic-dropdown.html',
    'text!../templates/inputTemplates/value-dynamic-dropdown-likned.html',


], function ($, _, Backbone, moment, Swal, filterSingleModel, filterCollection, columnsCollection, adminCollection, slugCollection, dynamicFormDataCollection, dynamicFieldRender, multiselectOptions, dynamicFilterTemp, categoryTemplate, dateConditionTemplate, dropdownTemp, filterConditionLikned, filterFieldListTemp, filterFieldSingle, filterFieldSingleEdit, joinedFieldTemplate,
    valueTextTemp, valueTextRangeTemp, valueDateRangeTemp, valueDateTimeTemp, valueEnumTemp, valueDynamicDropdownTemp, valueDynamicDropdownLinkedTemp) {

    var dynamicFilterView = Backbone.View.extend({
        rowCounter: 1,
        model: filterSingleModel,
        default_filter: null,
        columnlist: [],
        metadata: [],
        totalRecCount: 0,
        staticJoined: [],
        extractedFields: [],
        initialize: function (options) {
            this.toClose = "dynamicFilterView";
            this.skipCount = 0;
            this.parentObj = options.parentView;
            if (this.parentObj.filterContainer == null || this.parentObj.filterContainer == "") {
                this.parentContainer = this.parentObj.toClose;
            } else {
                this.parentContainer = this.parentObj.filterContainer;
            }
            this.menuId = this.parentObj.menuId;
            this.module_name = this.parentObj.module_name;
            this.staticJoined = this.parentObj.staticJoined ? this.parentObj.staticJoined : [];
            this.columnMappings = this.parentObj.columnMappings ? this.parentObj.columnMappings : [];
            this.skipFields = this.parentObj.skipFields ? this.parentObj.skipFields : [];
            this.skipFieldsDefaults = [];
            this.model = new filterSingleModel();
            this.model.set({ "menu_id": this.menuId });
            this.filterCollection = new filterCollection();
            this.multiselectOptions = new multiselectOptions();
            this.columnsCollection = new columnsCollection();
            this.categoryList = new slugCollection();
            this.adminlist = new adminCollection();
            this.dynamicFormDatas = new dynamicFormDataCollection();
            this.getCategoryList();
            this.getAdmins();
            this.getMetaData();
            this.getColumnList();
            this.getFilterList();
            // CONDITION LIST
            this.conditionList = [
                { "label": "Is In", "value": "is_in" },
                { "label": "Start With", "value": "start_with" },
                { "label": "End With", "value": "end_with" },
                { "label": "Equal To", "value": "equal_to" },
                { "label": "Not Equal To", "value": "not_equal_to" },
                { "label": "Is Empty", "value": "is_empty" },
                { "label": "Is Not Empty", "value": "is_not_empty" },
                { "label": "Range", "value": "range" },
            ]
            // DATE CONDITION LIST
            this.dateConditionList = [
                { "label": "Exact Date", "value": "exact_date" },
                { "label": "This Month", "value": "this_month" },
                { "label": "This Week", "value": "this_week" },
                { "label": "Date Range", "value": "date_range" },
            ]
            // SHOW FIELDS ACCORDING TO LIST
            this.showFieldsMap = {
                "company_id": '.value-company',
                "default_company": '.value-company',
                "assignee": '.value-admin',
                "created_by": '.value-admin',
                "modified_by": '.value-admin',
            };
            this.permanentStaticJoined = [
                {
                    field: 'assignee',
                    fieldtype: 'assignee',
                    joinedTable: 'admin',
                    select: 'adminID,name',
                    primaryKey: 'adminID',
                    slug: ''
                },
                {
                    field: 'modified_by',
                    fieldtype: 'admin',
                    joinedTable: 'admin',
                    select: 'adminID,name',
                    primaryKey: 'adminID',
                    slug: ''
                },
                {
                    field: 'created_by',
                    fieldtype: 'admin',
                    joinedTable: 'admin',
                    select: 'adminID,name',
                    primaryKey: 'adminID',
                    slug: ''
                },
                {
                    field: 'company_id',
                    fieldtype: 'company',
                    joinedTable: 'info_settings',
                    select: 'infoID,companyName',
                    primaryKey: 'infoID',
                    slug: ''
                },
                {
                    field: 'default_company',
                    fieldtype: 'company',
                    joinedTable: 'info_settings',
                    select: 'infoID,companyName',
                    primaryKey: 'infoID',
                    slug: ''
                },
            ];
            this.staticJoined = this.staticJoined.concat(this.permanentStaticJoined);
            this.performSearch = _.debounce(this.performSearch, 500);
        },
        attachEvents: function () {
            this.$el.off('change', '.dropval', this.updateOtherDetails);
            this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
            this.$el.off('input', '.txtchange', this.updateOtherDetails);
            this.$el.on('input', '.txtchange', this.updateOtherDetails.bind(this));
            this.$el.off('change', '.updateDetails', this.updateDetails);
            this.$el.on('change', '.updateDetails', this.updateDetails.bind(this));
            this.$el.off('click', '.addNewfield', this.addFilterCondition);
            this.$el.on('click', '.addNewfield', this.addFilterCondition.bind(this));
            this.$el.off('input', '.dvalChange', this.getLinkedDropDownValue);
            this.$el.on('input', '.dvalChange', this.getLinkedDropDownValue.bind(this));
            this.$el.off('click', '.selectFieldValue', this.selectFieldValue);
            this.$el.on('click', '.selectFieldValue', this.selectFieldValue.bind(this));
            this.$el.off('click', '.multiSelectField', this.multiSelectFieldValue);
            this.$el.on('click', '.multiSelectField', this.multiSelectFieldValue.bind(this));
            this.$el.off('click', '.column-field', this.addColumnFields);
            this.$el.on('click', '.column-field', this.addColumnFields.bind(this));
            this.$el.off('click', '.removeField', this.removeColumnFields);
            this.$el.on('click', '.removeField', this.removeColumnFields.bind(this));
            this.$el.off('click', '.filter-save-btn', this.saveFilter);
            this.$el.on('click', '.filter-save-btn', this.saveFilter.bind(this));
            this.$el.off('click', '.selected-filter-clear', this.clearFilter);
            this.$el.on('click', '.selected-filter-clear', this.clearFilter.bind(this));
            this.$el.off('click', '.existing-filter-delete', this.deleteFilter);
            this.$el.on('click', '.existing-filter-delete', this.deleteFilter.bind(this));
            this.$el.off('click', '.quick_search', this.quick_search);
            this.$el.on('click', '.quick_search', this.quick_search.bind(this));
            this.$el.off('click', '.existing-filter-text', this.storedFilterSearch);
            this.$el.on('click', '.existing-filter-text', this.storedFilterSearch.bind(this));
            this.$el.off('click', '.multiSel', this.setValues);
            this.$el.on('click', '.multiSel', this.setValues.bind(this));
            this.$el.off('input', '.feildSearch', this.feildSearch);
            this.$el.on('input', '.feildSearch', this.feildSearch.bind(this));
            this.$el.off('input', '.freeTextSearch', this.freeTextSearch);
            this.$el.on('input', '.freeTextSearch', this.freeTextSearch.bind(this));
        },
        updateDetails: function (e) {
            var valuetxt = $(e.currentTarget).val();
            var toID = $(e.currentTarget).attr('id');
            var toID = $(e.currentTarget).attr('name');
            var newdetails = [];
            newdetails["" + toID] = valuetxt;
            this.model.set(newdetails);
        },
        setValues: function (e) {
            var selfobj = this;
            var valuetxt = $(e.currentTarget).val();
            var toID = $(e.currentTarget).attr('name');
            var newdetails = [];
            newdetails["" + toID] = valuetxt;
            selfobj.model.set(newdetails);
        },
        updateOtherDetails: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var selfobj = this;
            var valuetxt = $(e.currentTarget).val();
            var toID = $(e.currentTarget).attr("id");
            var currentRow = $(e.currentTarget).closest('.filterDropdown');
            var field = currentRow.attr('data-field');
            switch (toID) {
                case 'condition':
                    var template = '';
                    var row = $(e.currentTarget).closest('.row');
                    var nextValueRow = row.next('.value_row');
                    (valuetxt == 'is_empty' || valuetxt == 'is_not_empty') ? nextValueRow.hide() : nextValueRow.show();
                    switch (valuetxt) {
                        // FOR DATES
                        case 'date_range':
                            template = _.template(valueDateRangeTemp);
                            nextValueRow.empty().append(template({ dVal: null }));
                            break;
                        case 'exact_date':
                            template = _.template(valueDateTimeTemp);
                            nextValueRow.empty().append(template({ dVal: null }));
                            break;
                        case 'yesterday':
                        case 'today':
                        case 'tomorrow':
                        case 'this_month':
                        case 'this_week':
                            nextValueRow.empty();
                            break;
                        // FOR TEXTS
                        case 'range':
                            template = _.template(valueTextRangeTemp);
                            nextValueRow.empty().append(template({ dVal: null }));
                            break;
                        case 'is_in':
                        case 'equal_to':
                        case 'not_equal_to':
                        case 'start_with':
                        case 'end_with':
                            var column = this.columnlist.find(column => column.Field === field);
                            let statCol = selfobj.staticJoined.find((colData) => {
                                if (colData.field == column.Field) {
                                    return colData
                                }
                            });
                            if (statCol) {
                                dVal = null;
                                selfobj.getJoinedDropDownValues(nextValueRow, statCol, dVal);
                            } else {
                                if (column.Type.includes('enum')) {
                                    nextValueRow.find('.value-enum').show();
                                } else if (column.Type.includes('date') || column.Type.includes('time')) {
                                    template = _.template(valueDateTimeTemp);
                                    nextValueRow.find('.value_row').empty().append(template({ dVal: null }));
                                } else {
                                    template = _.template(valueTextTemp);
                                    nextValueRow.find('.value_row').empty().append(template({ dVal: null }));
                                }
                            }
                            break;
                        default:
                            break;
                    }
                    selfobj.initializeDatePicker();
                    break;
                default:
                    break;
            }
            var [conditionVal, valueElm] = (selfobj.fieldExtractor(currentRow[0]));
            if (conditionVal) {
                if (valueElm != '' && conditionVal != '') {
                    currentRow.find('.quick_search').attr({ 'disabled': false });
                } else if (conditionVal == 'is_empty' || conditionVal == 'is_not_empty' || conditionVal == 'this_week' || conditionVal == 'this_month') {
                    currentRow.find('.quick_search').attr({ 'disabled': false });
                } else {
                    currentRow.find('.quick_search').attr({ 'disabled': true });
                }
            } else {
                currentRow.find('.quick_search').attr({ 'disabled': true });
            }
        },
        // GET FILTERLIST
        getFilterList: function () {
            var selfobj = this;
            this.filterCollection.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: { 'menu_id': this.menuId, 'select': 'filter_id,filter_name,is_default,visibility' }
            }).done(function (res) {
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                selfobj.$(".profile-loader").hide();
                selfobj.totalRecCount = selfobj.filterCollection.length;
                if (res.flag == 'S') {
                    selfobj.default_filter = res.data.find((filter) => {
                        if (filter.is_default == 'yes')
                            return filter.filter_id;
                    });
                    selfobj.render();
                    if (selfobj.default_filter) {
                        selfobj.model.set({ filter_id: selfobj.default_filter.filter_id });
                        selfobj.editFilter('', true);
                    }
                }
            });
        },
        // SEARCH IN FIELDS
        feildSearch: function (e) {
            var selfobj = this;
            let id = $(e.currentTarget).attr('id');
            let search = $(e.currentTarget).val().toLowerCase();
            let searchCount = 0;
            let toHide = toShow = '';
            this.$('.search_clear').show();
            switch (id) {
                case 'feildSearch':
                    this.$('.column-fields-list .column-field').hide();
                    toHide = "column-fields-list";
                    toShow = 'no-fields';
                    this.$('.column-fields-list .column-field').each(function () {
                        var optVal = $(this).html().toLowerCase();
                        if (optVal.includes(search)) {
                            $(this).show();
                            searchCount++;
                        }
                    });
                    break;
                case 'filter-name-search':
                    this.$('.existing-filter').hide();
                    toHide = "existing-filter";
                    toShow = 'no-filters';
                    this.$('.existing-filter').each(function () {
                        var optVal = $(this).html().toLowerCase();
                        if (optVal.includes(search)) {
                            $(this).show();
                            searchCount++;
                        }
                    });
                    this.$('.column-fields-list:last-child').css({ 'border-bottom': "1px solid #ebf0ff" })
                    break;

                default:
                    break;
            }
            if (searchCount == 0) {
                this.$('.' + toShow).show();
                this.$('.' + toHide).hide();
            } else {
                this.$('.' + toShow).hide();
                this.$('.' + toHide).show();
            }
            $("body").on('click', '.search_clear', function (event) {
                selfobj.$('#filter-name-search,#feildSearch').val('');
                selfobj.$('.search_clear,.' + toShow).hide();
                selfobj.$('.existing-filter,.column-fields-list,.column-fields-list  .column-field').show();
            });
        },
        // GET METADATA [DYNAMIC COLUMNS]
        getMetaData: function () {
            var selfobj = this;
            selfobj.dynamicFormDatas.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginId": selfobj.menuId }
            }).done(function (res) {
                if (res.flag == "F") {
                    if (res.flag == "F") showResponse('', res, '');
                }
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.metadata && res.metadata.trim() != '') {
                    selfobj.metadata = JSON.parse(res.metadata);
                }
            });
        },
        // GET COLUMNLIST
        getColumnList: function () {
            var selfobj = this;
            this.columnsCollection.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: { menuID: this.menuId, status: "active" }
            }).done(function (res) {
                if (res.flag == "F") {
                    showResponse('', res, '');
                }
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                selfobj.columnlist = res.data;
                selfobj.skipCount = res.data.length - selfobj.skipFields.length;
                selfobj.extractedFields = [];
                if (selfobj.metadata) {
                    for (var rowKey in selfobj.metadata) {
                        var row = selfobj.metadata[rowKey];
                        for (var colKey in row) {
                            var field = row[colKey];
                            if (field.fieldID !== undefined) {
                                if (field.fieldType == 'File') {
                                    selfobj.columnlist.pop(field);
                                    selfobj.skipFields.push(field);
                                }
                                selfobj.extractedFields.push(field);
                            }
                        }
                    }
                }
            });
        },
        // GET ADMINLIST
        getAdmins: function (params) {
            var selfobj = this;
            this.adminlist.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', status: 'active', roleType: 'Admin' }
            }).done(function (res) {
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".profile-loader").hide();
                selfobj.render();
            });
        },
        // GET CATEGORYLIST
        getCategoryList: function () {
            let selfobj = this;
            var categoryJoin = selfobj.staticJoined.filter((joined) => joined.joinedTable == 'categories');
            let slug = '';
            categoryJoin.map((join) => {
                slug = (slug === '') ? join.slug : `${slug},${join.slug}`;
            });
            if (slug !== '') {
                this.categoryList.fetch({
                    headers: {
                        'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: slug }
                }).done(function (res) {
                    if (res.flag == "F") showResponse('', res, '');
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                });
            }
        },
        // ADD NEW FILTER CONDITION
        addFilterCondition: function () {
            var selfobj = this;
            let template = _.template(filterFieldListTemp);
            this.$(".fieldListDetails").empty().append(template({ fieldList: selfobj.columnlist, skipCount: selfobj.skipCount, skipFields: selfobj.skipFields, columnMappings: selfobj.columnMappings }));
        },
        addColumnFields: function (e) {
            var selfobj = this;
            let columnName = $(e.currentTarget).attr('data-field');
            if (columnName) {
                var columnField = selfobj.columnlist.find((column) => {
                    if (column.Field == columnName) {
                        selfobj.skipFieldsDefaults.push(columnName);
                        selfobj.skipFields.push(columnName);
                        selfobj.skipCount--;
                        return column;
                    }
                });
                selfobj.columnMappings.find((map) => {
                    if (map.hasOwnProperty(columnName.toLowerCase())) {
                        columnField.mappedFieldName = map[columnName.toLowerCase()];
                    }
                });
                selfobj.addFilterCondition();
                var template = _.template(filterFieldSingle);
                this.$(".filter-fields").append(template({ rowCounter: selfobj.rowCounter, column: columnField, conditionList: selfobj.conditionList, adminList: selfobj.adminlist.models }));
                this.setShowHideElm(columnField, true, '');
                selfobj.rowCounter++;
                this.$(".addNewfield").dropdown('toggle');
            }
        },
        // REMOVE FILTER CONDITION
        removeColumnFields: function (e) {
            e.stopPropagation();
            var selfobj = this;
            let removeField = $(e.currentTarget).attr('data-removeField');
            let columnName = $(e.currentTarget).attr('data-columnName');
            this.$('#field_' + removeField).remove();
            selfobj.skipFields = selfobj.skipFields.filter(item => item !== columnName);
            selfobj.skipFieldsDefaults = selfobj.skipFieldsDefaults.filter(item => item !== columnName);
            selfobj.skipCount++;
            selfobj.quick_search(e);
            selfobj.addFilterCondition();
            if (this.$('.filterDropdown').children().length == 0) {
                this.$('.filter-save').hide();
            }
        },
        // FIELD DATA EXTRACTION
        fieldExtractor: function (row) {
            // FOR GENERAL FIELDS
            let valueToShow = valueElm = ''
            let valueElement = null;
            const conditionVal = $(row).find('#condition').val();
            const logicalOp = ($(row).find('#logical_condition').val()) ? ($(row).find('#logical_condition').val()) : 'AND';
            const fieldEnumSelect = row.querySelector('.value-enum #field_value');
            const fieldDateSelect = row.querySelector('.value-date-time #field_value');
            const fieldJoined = row.querySelector('.value-joinedfield #field_value');
            const fieldTextInput = row.querySelector('.value-text #field_value');
            
            // DATE RANGE
            const fieldDateFrom = row.querySelector('.value-date-range #from_date');
            const fieldDateTo = row.querySelector('.value-date-range #to_date');
            // TEXT RANGE
            const fieldValueFrom = row.querySelector('.value-text-range #from_value');
            const fieldValueTo = row.querySelector('.value-text-range #to_value');
            // FOR DYNAMIC FEILDS
            const fieldDynamic_se = row.querySelector('.dynamic-se #field_value');
            const fieldDynamic_dd = row.querySelector('.dynamic-dd  #field_value');
            
            const optionsArray = [];
            if (fieldEnumSelect) {
                valueElement = fieldEnumSelect;
                var selectedOption = fieldEnumSelect.options[fieldEnumSelect.selectedIndex];
                if (selectedOption) {
                    valueToShow = fieldEnumSelect.options[fieldEnumSelect.selectedIndex].text;
                }
                const enumOptions = fieldEnumSelect.querySelectorAll('option');
                enumOptions.forEach(option => {
                    if (option.value) {
                        optionsArray.push(option.value);
                    }
                });
            }
            if (fieldDynamic_se) { valueElement = fieldDynamic_se; }
            if (fieldDynamic_dd) { valueElement = fieldDynamic_dd; }
            if (fieldDateSelect) { valueElement = fieldDateSelect; valueToShow = fieldDateSelect.value; }
            if (fieldJoined) { valueElement = fieldJoined; valueToShow = fieldJoined.options[fieldJoined.selectedIndex].text; }
            if (fieldTextInput) { valueElement = fieldTextInput; valueToShow = fieldTextInput.value; }
            const valueElmDy = valueElement ? valueElement.classList.contains('dvalChange') : '';
            if (valueElmDy) {
                valueElm = valueElement ? valueElement.getAttribute('data-val') : '';
                valueToShow = valueElement ? valueElement.value : '';
            } else if ((fieldDateFrom) && (fieldDateTo)) {
                valueElement = fieldDateFrom ; 
                valueToShow = fieldDateFrom.value + '/' + fieldDateTo.value;
                valueElm = valueToShow;
            } else if ((fieldValueFrom) && (fieldValueTo)) {
                valueElement = fieldValueFrom ; 
                valueToShow = fieldValueFrom.value + '-' + fieldValueTo.value;
                valueElm = valueToShow;
            } else {
                valueElm = valueElement ? valueElement.value : '';
            }
            if (valueElement) { return [conditionVal, valueElm, valueToShow, logicalOp, optionsArray]; } else { return null; }
        },
        // GET FILTER CONDITION JSON
        getConditionJSON: function () {
            var selfobj = this;
            var jsonForm = {};
            var alertShown = false;
            var disableFlag = true;
            this.$(".filter-fields").find('.filterDropdown').each(function (index, row) {
                var rowId = 'row' + (index + 1);
                var dd_id = $(row).attr('id');
                const fieldNameVal = $(this).attr('data-field');
                const mappedFieldName = ($(this).attr('data-mapped_field')) ? ($(this).attr('data-mapped_field')) : '';
                if (selfobj.fieldExtractor(row)) {
                    var [conditionVal, valueElm, valueToShow, logicalOp, optionsArray] = selfobj.fieldExtractor(row);
                    switch (true) {
                        case 'is_empty':
                        case 'is_not_empty':
                        case 'this_month':
                        case 'this_week':
                            valueElm = '';
                            disableFlag = false;
                            break;
                        default:
                            break;
                    }
                    if (valueElm && conditionVal) {
                        var dd_btn_Text = (mappedFieldName != '') ? selfobj.makeUpperCase(mappedFieldName) + ' : ' + valueToShow : selfobj.makeUpperCase(fieldNameVal) + ' : ' + valueToShow;
                        selfobj.$('#' + dd_id + ' .dropdownMenuButton').addClass("active");
                        row.querySelector('.dropdownMenuButton').textContent = dd_btn_Text;
                    } else {
                        var dd_btn_Text = (mappedFieldName != '') ? selfobj.makeUpperCase(mappedFieldName) : selfobj.makeUpperCase(fieldNameVal);
                        row.querySelector('.dropdownMenuButton').textContent = dd_btn_Text;
                        selfobj.$('#' + dd_id + ' .quick_search').attr({ 'disabled': disableFlag });
                        if (!disableFlag) {
                            selfobj.$('#' + dd_id + ' .dropdownMenuButton').addClass("active");
                        }
                        valueToShow = '';
                    }
                    jsonForm[rowId] = { columnName: fieldNameVal, mappedFieldName: mappedFieldName, condition: conditionVal, value: valueElm, logicalOp: logicalOp, optionsArray: optionsArray ? optionsArray : [], valueToShow: valueToShow };
                }
            });
            return [jsonForm, alertShown];
        },
        // QUICK SEARCH ON CONDITION ADDED
        quick_search: function (e) {
            var selfobj = this;
            if (!selfobj.model.get('filter_id')) {
                this.$('.selected-filter').css({ "display": "flex" });
                this.$('.selected-filter').attr({ 'data-filter_id': 'null' });
                this.$('.selected-filter .selected-filter_text').text('Unsaved Filter');
            }
            var [jsonForm, alertShown] = selfobj.getConditionJSON();
            var jsonString = JSON.stringify(jsonForm);
            this.parentObj.filterOption.set({ 'filterJson': jsonString, 'getAll': 'N' });
            this.parentObj.filterOption.set({ 'filter_id': selfobj.model.get('filter_id') });
            this.parentObj.filteredSearches();
        },
        // IT SEARCH DATA ALONG WITH SAVED FILTER
        storedFilterSearch: function (e) {
            var selfobj = this;
            var filter_id = $(e.currentTarget).attr('data-filter_id');
            this.model.set({ 'filter_id': filter_id });
            selfobj.search();
        },
        // FREE TEXT SEARCH
        performSearch: function (text) {
            var selfobj = this;
            selfobj.parentObj.filterOption.set({ 'freeTextSearch': text, 'getAll': 'N' });
            selfobj.parentObj.filteredSearches();
        },
        // FREE TEXT SEARCH
        freeTextSearch: function (e) {
            var query = $(e.currentTarget).val();
            this.performSearch(query);
        },
        // IT SEARCH DATA ALONG WITH SAVED FILTER
        search: function () {
            var selfobj = this;
            this.$('.selected-filter').css({ "display": "flex" });
            this.model.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler
            }).done(function (res) {
                if (res.flag == "F") {
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    showResponse(e, res, '');
                }
                // SEARCH ACCORDING TO FILTER SAVED CONDITIONS
                if (Object.entries(res.data[0].conditions).length > 2) {
                    selfobj.renderFilterConditions(selfobj.model.get('conditions'));
                    selfobj.parentObj.filterOption.set({ 'filterJson': res.data[0].conditions, 'getAll': 'N', filter_id: res.data[0].filter_id });
                    selfobj.parentObj.filterOption.set({ 'filter_id': selfobj.model.get('filter_id') });
                    selfobj.parentObj.filterOption.set({ 'filter_name': selfobj.model.get('filter_name') });
                    selfobj.parentObj.filteredSearches();
                } else {
                    selfobj.parentObj.filterOption.clear().set(selfobj.parentObj.filterOption.defaults);
                    selfobj.parentObj.filteredSearches();
                }
            });
        },
        // CLEAR FILTER
        clearFilter: function () {
            var selfobj = this;
            this.$(".filterDropdown").remove();
            this.$('.selected-filter, .filter-save').hide();
            this.$('.dropdown-menu #private,#public').prop('checked', false);
            this.$('#filter_name, #freeTextSearch, .dropdown-menu #filter_name').val('');
            selfobj.skipCount = 0;
            selfobj.model.set(selfobj.model.defaults);
            selfobj.model.set({ "menu_id": selfobj.menuId });
            selfobj.skipFields = selfobj.skipFields.filter(item => !selfobj.skipFieldsDefaults.includes(item));
            selfobj.skipCount = selfobj.columnlist.length - selfobj.skipFields.length;
            selfobj.addFilterCondition();
            selfobj.parentObj.filterOption.clear().set(selfobj.parentObj.filterOption.defaults);
            selfobj.parentObj.resetSearch();
        },
        // FILTER SEARCH
        saveFilter: function (e) {
            var selfobj = this;
            var [jsonForm, alertShown] = selfobj.getConditionJSON();
            var jsonString = JSON.stringify(jsonForm);
            if (this.model.get("filter_name") == "" || this.model.get("filter_name") == null) {
                showResponse('', { "flag": "F", "msg": "Filter Name required" }, '');
                return false;
            }
            if (alertShown) {
                return false;
            } else {
                selfobj.model.set({ 'conditions': jsonString })
                var mid = this.model.get("filter_id");
                var methodt = (mid == "" || mid == null) ? "PUT" : "POST";
                $(e.currentTarget).html("<span>Saving..</span>");
                $(e.currentTarget).attr("disabled", "disabled");
                this.model.save({}, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: methodt
                }).done(function (res) {
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    if (res.flag == "F") showResponse(e, res, '');
                    if (res.flag == "S") {
                        $(e.currentTarget).html("<span>Saved</span>");
                        selfobj.model.set({ "menu_id": selfobj.menuId });
                        if (res.filter_id) {
                            selfobj.model.set({ 'filter_id': res.filter_id });
                        }
                        selfobj.getFilterList();
                    }
                    setTimeout(function () {
                        $(e.currentTarget).html("<span>Save</span>");
                        $(e.currentTarget).removeAttr("disabled");
                    }, 2000);
                });
            }
        },
        // DELETE FILTERS
        deleteFilter: function (e) {
            selfobj = this;
            var filter_id = $(e.currentTarget).attr('id');
            if (filter_id && filter_id != '') {
                Swal.fire({
                    title: 'Do you want to delete Filter ?',
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'Delete',
                    denyButtonText: `Cancel`,
                }).then((result) => {
                    if (result.isConfirmed) {
                        $.ajax({
                            url: APIPATH + 'filterMaster/delete',
                            method: 'POST',
                            data: { filter_id: filter_id },
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
                                    Swal.fire({
                                        title: 'Filter Deleted!',
                                        timer: 1000,
                                        icon: 'success',
                                        showConfirmButton: false
                                    });
                                    selfobj.getFilterList();
                                }
                            }
                        });
                    }
                });
            } else {
                showResponse('', { "flag": "F", "msg": "Please Select Filter For Delete..!" }, ''); return;
            }
        },
        // HIDE SHOW FIELD VALUES DROPDOWN/TEXT
        setShowHideElm: function (columnField, fieldDetail, dVal) {
            var selfobj = this;
            var feilds = (columnField.hasOwnProperty('Field')) ? columnField.Field : columnField.columnName;
            var currentRow = this.$('#field_' + selfobj.rowCounter);
            // CHECK IF CURRENT ROW IS EXISTS
            if (currentRow) {
                if (this.columnlist && this.columnlist.length > 0) {
                    var column = this.columnlist.find(column => column.Field === feilds);
                    if (column) {
                        var conditions = [] ;
                        var conditionlist = selfobj.conditionList;
                        var dynamicColumn = this.extractedFields.find(column => column.column_name === feilds);
                        if (fieldDetail == true) { currentRow.find('.value-text #field_value').val(""); }
                        // DYANAMIC COLUMS EXISTS
                        if (dynamicColumn) {
                            if (['Dropdown', 'Radiobutton', 'Checkbox'].includes(dynamicColumn.fieldType)) {
                                conditions.push('equal_to','not_equal_to','is_empty','is_not_empty');
                                conditionlist = conditionlist.filter(item => conditions.includes(item.value));
                                let template = dynamicColumn.linkedWith ? _.template(valueDynamicDropdownLinkedTemp) : _.template(valueDynamicDropdownTemp);
                                let options = dynamicColumn.linkedWith ? dynamicColumn : dynamicColumn.fieldOptions.split(",");
                                currentRow.find('.value_row').empty().append(template({ options: options, dVal: dVal }));
                            } else {
                                let template = _.template(valueTextTemp);
                                currentRow.find('.value_row').empty().append(template({ dVal: dVal }));
                            }
                        } else {
                            let statCol = selfobj.staticJoined.find(colData => colData.field === column.Field );
                            if (statCol) {
                                conditions.push('equal_to','not_equal_to','is_empty','is_not_empty');
                                conditionlist = conditionlist.filter(item => conditions.includes(item.value));
                                selfobj.getJoinedDropDownValues(currentRow, statCol, dVal);
                            } else {
                                if ((column.Type.includes('int') || column.Type.includes('float'))) {
                                    conditions.push('equal_to','not_equal_to','is_empty','is_not_empty','start_with','end_with','greater_than','less_than','range');
                                }
                                if (column.Type.includes('date') || column.Type.includes('time')) {
                                    conditionlist = selfobj.dateConditionList;
                                    var templatec = _.template(dateConditionTemplate);
                                    let template = (dVal && dVal.condition == 'date_range') ? _.template(valueDateRangeTemp) : _.template(valueDateTimeTemp);
                                    currentRow.find('.value_row').empty().append(template({ dVal: dVal }));
                                } else if (column.Type.includes('enum')) {
                                    conditions.push('equal_to','not_equal_to');
                                    conditionlist = conditionlist.filter(item => conditions.includes(item.value));
                                    if (fieldDetail == true) {
                                        currentRow.find('.select.field_value,.select#condition').val("");
                                    }
                                    var template = _.template(valueEnumTemp);
                                    let matches = column.Type.match(/'([^']*)'/g);
                                    let enums = matches.map(match => match.replace(/'/g, ''));
                                    currentRow.find('.value_row').append(template({ dVal: dVal, options: enums }));
                                } else {
                                    conditions.push('equal_to','not_equal_to','is_empty','is_not_empty','start_with','is_in','end_with');
                                    let template = (dVal.condition === 'range') ? _.template(valueTextRangeTemp) : _.template(valueTextTemp);
                                    currentRow.find('.value_row').empty().append(template({ dVal: dVal }));
                                }
                            }
                        }
                        var templatec = _.template(dateConditionTemplate);
                        currentRow.find('.condition_row').empty().append(templatec({ conditionList: conditionlist, dVal: dVal }));
                    } else {
                        console.error("Column not found in columnlist for field:", feilds);
                    }
                } else {
                    console.error("Columnlist is undefined or empty");
                }
            } else {
                console.error("currentRow is undefined");
            }
            this.$('.filter-save').show();
            selfobj.initializeDatePicker();
        },
        // DATEPICKERS WHICH USED IN DATE
        initializeDatePicker: function () {
            var selfobj = this;
            this.$('.value-date-time #field_value').datepickerBT({
                format: "dd-mm-yyyy",
                todayBtn: "linked",
                clearBtn: true,
                todayHighlight: true,
                StartDate: new Date(),
                numberOfMonths: 1,
                autoclose: true,
            }).on('changeDate', function (ev) {
                selfobj.$('.value-date-time#field_value').change();
                selfobj.updateOtherDetails(ev);
            });
            this.$('.value-date-range #from_date').datepickerBT({
                format: "dd-mm-yyyy",
                todayBtn: "linked",
                clearBtn: true,
                todayHighlight: true,
                StartDate: new Date(),
                numberOfMonths: 1,
                autoclose: true,
            }).on('changeDate', function (ev) {
                selfobj.$('.value-date-range#from_date').change();
                selfobj.updateOtherDetails(ev);
            });
            this.$('.value-date-range #to_date').datepickerBT({
                format: "dd-mm-yyyy",
                todayBtn: "linked",
                clearBtn: true,
                todayHighlight: true,
                StartDate: new Date(),
                numberOfMonths: 1,
                autoclose: true,
            }).on('changeDate', function (ev) {
                selfobj.$('.value-date-range#to_date').change();
                selfobj.updateOtherDetails(ev);
            });
        },
        getJoinedDropDownValues: function (currentRow, statCol, dVal) {
            var selfobj = this;
            $.ajax({
                url: APIPATH + 'getJoinedValues/',
                method: 'POST',
                data: statCol,
                datatype: 'JSON',
                beforeSend: function (request) {
                    selfobj.$(".textLoader").show();
                    request.setRequestHeader("token", $.cookie('_bb_key'));
                    request.setRequestHeader("SadminID", $.cookie('authid'));
                    request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                    request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                    if (res.flag === "S" && res.data.length > 0) {
                        let template = _.template(joinedFieldTemplate);
                        currentRow.find('.value_row').append(template({ joinedDataList: res.data, dVal: dVal, statCol: statCol }));
                    }
                }
            });
        },
        // GET DYNAMIC DATA FOR DYNAMIC DROPDOWN
        getLinkedDropDownValue: function (e) {
            e.stopPropagation();
            let inputText = $(e.currentTarget).val();
            let lastCommaIndex = inputText.lastIndexOf(',');
            let name = (lastCommaIndex !== -1) ? inputText.substring(lastCommaIndex + 1).trim() : inputText.trim();
            let pluginID = $(e.currentTarget).attr("data-plugIn");
            let where = $(e.currentTarget).attr("name");
            let fieldID = $(e.currentTarget).attr("data-fieldID");
            let selection = $(e.currentTarget).attr("data-selection");
            let fieldOpt = $(e.currentTarget).attr("data-fieldOpt");
            let dataInType = $(e.currentTarget).attr("data-in-type");
            let dropdownContainer = this.$("#field_" + fieldID);
            let selectedIDS = [];
            if (selection == 'yes') {
                var sendText = name;
            } else {
                var sendText = inputText;
            }
            $.ajax({
                url: APIPATH + 'dynamicgetList/',
                method: 'POST',
                data: { text: sendText, pluginID: pluginID, wherec: fieldOpt, fieldID: fieldID },
                datatype: 'JSON',
                beforeSend: function (request) {
                    this.$(".textLoader").show();
                    request.setRequestHeader("token", $.cookie('_bb_key'));
                    request.setRequestHeader("SadminID", $.cookie('authid'));
                    request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                    request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                    this.$(".textLoader").hide();
                    dropdownContainer.empty();
                    var dropdownClass = (selection == 'yes') ? 'multiSelectField' : 'selectFieldValue';
                    if (fieldOpt == 'categoryName') {
                        dropdownContainer.append('<div class="dropdown-item addNewCategory" style="background-color: #3F51B5!important;color:#fff">Add Category</div>');
                    }
                    if (res.msg === "sucess" && res.data.length > 0) {
                        let pk = res.lookup.pKey;
                        let selectedValues = $(e.currentTarget).val().split(',');
                        $.each(res.data, function (index, value) {
                            var toSearch = [];
                            $.each(value, function (value1) {
                                if (pk != value1) {
                                    toSearch.push(value["" + value1]);
                                }
                            });
                            let isSelected = toSearch.some(searchValue => selectedValues.includes(searchValue));
                            if (isSelected) {
                                selectedIDS.push(value["" + pk]);
                            }
                            dropdownContainer.append('<div class="dropdown-item ' + dropdownClass + (isSelected ? ' selected' : '') + '" data-in-type="' + dataInType + '" style="background-color: #ffffff;" data-fieldID="' + fieldID + '" data-cname="' + where + '" data-value="' + value["" + pk] + '">' + toSearch.join("  ") + '</div>');
                        });
                        dropdownContainer.show();
                    }
                }
            });
        },
        // SELECT VALUE FOR DYNAMIC DROPDOWN
        selectFieldValue: function (e) {
            var selfobj = this;
            let Name = $(e.currentTarget).text();
            let cname = $(e.currentTarget).attr('data-cname');
            let value = $(e.currentTarget).attr('data-value');
            let fieldID = $(e.currentTarget).attr("data-fieldID");
            let dataInType = $(e.currentTarget).attr("data-in-type");
            $(e.currentTarget).text(Name);
            selfobj.updateOtherDetails(e);
            this.$("#field_" + fieldID).hide();
            if (dataInType == 'linkedField') {
                this.$('.dvalChange').attr({ 'data-val': value });
                this.$('.dvalChange[data-fieldID="' + fieldID + '"]').val(Name);
            }
        },
        multiSelectFieldValue: function () {
            let name = $(e.currentTarget).text();
            if ($(e.currentTarget).hasClass("selected")) {
                $(e.currentTarget).removeClass("selected");
            } else {
                $(e.currentTarget).addClass("selected");
            }
            let cname = $(e.currentTarget).attr('data-cname');
            let value = $(e.currentTarget).attr('data-value');
            let fieldID = $(e.currentTarget).attr("data-fieldID");
            let selectedOptions = [];
            let selectedIDS = [];

            this.$('.multiSelectField.selected').each(function () {
                selectedIDS.push($(this).attr('data-value'));
                selectedOptions.push($(this).text());
            });
            let selectedOptionsString = selectedOptions.join(',');
            let selectedIDSString = selectedIDS.join(',');
            this.$('.valChange[data-fieldID="' + fieldID + '"]').val(selectedOptionsString);
            this.$('.dvalChange').attr({ 'data-val': selectedIDSString });
        },
        // MAKE UPPERCASE
        makeUpperCase: function (str) {
            str = str.replace(/_/g, " ");
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        // RENDER FILTER CONDITIONS ON MODEL FETCH OR EXISTING FILTER RENDER
        renderFilterConditions: function (filterJson) {
            var selfobj = this;
            if (filterJson) {
                this.$('.selected-filter').css({ "display": "flex" });
                var filter_name = (selfobj.model.get('filter_name') ? selfobj.model.get('filter_name') : 'Unsaved Filter');
                if (Object.entries(filterJson).length > 2) {
                    // ACTIVE FILTER
                    this.$('.dropdown-menu #filter_name').val(filter_name);
                    this.$('.dropdown-menu #' + selfobj.model.get('visibility') + '').prop('checked', true);
                    this.$('.selected-filter').attr({ 'data-filter_id': selfobj.model.get('filter_id') });
                    this.$('.selected-filter .selected-filter_text').text(filter_name);
                    // APPENDING FIELDS TO LIST
                    let filterData = JSON.parse(filterJson);
                    var template = _.template(filterFieldSingleEdit);
                    this.$(".filterDropdown.ws-filter-items").remove();
                    rowCounter = 1;
                    for (const [key, value] of Object.entries(filterData)) {
                        let columnName = value.columnName;
                        var columnField = selfobj.columnlist.find((column) => {
                            if (column.Field === columnName) {
                                selfobj.skipFields.push(columnName);
                                selfobj.skipFieldsDefaults.push(columnName);
                                return column;
                            }
                        });
                        if (columnField) {
                            selfobj.columnMappings.find((map) => {
                                if (map.hasOwnProperty('' + columnName)) {
                                    columnField.mappedFieldName = map['' + columnName];
                                }
                            });
                            this.$(".filter-fields").append(template({
                                rowCounter: rowCounter,
                                column: value,
                                conditionList: selfobj.conditionList,
                                adminList: selfobj.adminlist.models
                            }));
                            selfobj.rowCounter = rowCounter
                            selfobj.setShowHideElm(columnField, false, value);
                            this.$('#field_' + rowCounter + ' .quick_search').attr({ 'disabled': true });
                            if (value.value != '' && value.condition != '') {
                                this.$('#field_' + rowCounter + ' .dropdownMenuButton').addClass("active");
                            }
                            rowCounter++;
                            selfobj.rowCounter++;
                        }
                    }
                }
                selfobj.skipCount = selfobj.columnlist.length - selfobj.skipFields.length;
                selfobj.addFilterCondition();
            }
        },
        // SHOW SORTING ARROWS
        showListSortColumns: function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            var $showSortOptions = $target.siblings('.showSortOptions');
            var $allSortOptions = $('.showSortOptions');
            if ($showSortOptions.is(':visible')) {
                $showSortOptions.hide();
            } else {
                $allSortOptions.hide();
                $showSortOptions.show();
            }
        },
        // SORT COLUMNS ACCORDING TO ORDERBY
        sortColumn: function (e) {
            e.stopPropagation();
            var order = $(e.currentTarget).attr("data-value");
            var selfobj = this;
            var newsetval = [];
            this.parentObj.$(".tableList").find(".listSortColumnUp, .listSortColumnDown").removeClass("selected");
            this.parentObj.$(".tableList").find(".up, .down").removeClass("active");
            var currentField = $(e.currentTarget).attr("data-field");
            newsetval["orderBy"] = currentField;
            if (order == undefined) {
                this.parentObj.$('.showSortOptions').hide();
                var currentSortOrder = selfobj.parentObj.filterOption.get("order");

                if (currentSortOrder === "ASC") {
                    order = "DESC";
                } else {
                    order = "ASC";
                }
            }
            if (order == "DESC") {
                $(e.currentTarget).closest('th').find(".clearSorting").removeAttr("disabled")
                $(e.currentTarget).closest('th').find(".sortarrow.down").addClass("active");
                $(e.currentTarget).closest('th').find(".listSortColumnDown").addClass("selected");
                newsetval["order"] = order;
            }
            else if (order == "ASC") {
                $(e.currentTarget).closest('th').find(".clearSorting").removeAttr("disabled")
                $(e.currentTarget).closest('th').find(".sortarrow.up").addClass("active");
                $(e.currentTarget).closest('th').find(".listSortColumnUp").addClass("selected");
                newsetval["order"] = order;
            }
            else {
                $(e.currentTarget).closest(".clearSorting").attr('disabled', 'disabled');
                newsetval["order"] = 'DESC';
                newsetval["orderBy"] = 't.created_date';
            }
            selfobj.parentObj.filterOption.set(newsetval);
            selfobj.parentObj.filterSearch();
        },
        render: function () {
            var selfobj = this;
            var template = _.template(dynamicFilterTemp);
            this.$el.html(template({ totalRecCount: selfobj.totalRecCount, model: selfobj.model.attributes, formLabel: this.module_name, filterList: this.filterCollection.models, fieldList: selfobj.columnlist, conditionList: selfobj.conditionList }));
            if (this.parentObj.$("#" + this.parentContainer).length) {
                this.parentObj.$("#" + this.parentContainer).empty().append(this.$el);
                this.attachEvents();
                this.initializeDatePicker();
                if (selfobj.model.get('filter_id')) {
                    selfobj.search();
                } else {
                    this.$('.filter-save').hide();
                }
                setToolTip();
            }
            $("body").on('click', '.fil-save, .fieldListDetails', function (event) {
                event.stopPropagation();
            });
            return this;
        },
        onDelete: function () {
            this.remove();
        }
    });
    return dynamicFilterView;
});
