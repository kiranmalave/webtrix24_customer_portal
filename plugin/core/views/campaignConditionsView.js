define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'Swal',
    '../models/filterSingleModel',
    '../../admin/collections/adminCollection',
    '../collections/columnsCollection',
    '../../category/collections/slugCollection',
    '../../dynamicForm/views/dynamicFieldRender',
    '../../core/views/multiselectOptions',
    'text!../templates/conditionsTemplate.html',
    'text!../templates/categoryTemplate.html',
    'text!../templates/conditionsDateTemplate.html',
    'text!../templates/filterdropdownTemp.html',
    'text!../templates/filterConditionLikned.html',
    'text!../templates/filterFieldListTemp.html',
    'text!../templates/conditionFieldSingle.html',
    'text!../templates/conditionFieldSingleEdit.html',
    'text!../templates/joinedFieldTemplate.html',

], function ($, _, Backbone, moment, Swal, filterSingleModel, adminCollection, columnsCollection, slugCollection, dynamicFieldRender, multiselectOptions, conditionsTemplate, categoryTemplate, dateConditionTemplate, dropdownTemp, filterConditionLikned, filterFieldListTemp, filterFieldSingle, filterFieldSingleEdit, joinedFieldTemplate) {

    var conditionsView = Backbone.View.extend({
        rowCounter: 1,
        model: filterSingleModel,
        default_filter: null,
        columnlist: [],
        metadata: [],

        staticJoined: [],
        extractedFields: [],
        initialize: function (options) {
            this.toClose = "conditionsView";
            this.skipCount = 0;
            this.appendTo = options.appendTo;
            this.parentObj = options.parentObj;
            this.index = options.index;
            this.campaingObj = options.campaingObj;
            this.menuId = this.parentObj.menuId;
            var currentCondition = this.campaingObj.conditions[this.menuId] ? this.campaingObj.conditions[this.menuId] : {} ;
            this.json_data = {};
            if (currentCondition != {}) { this.json_data = currentCondition.json_data ;}
            this.fromCampaign = (options.fromCampaign) ? 'yes' : 'no';
            this.columnsCollection = new columnsCollection();
            this.metadata = this.parentObj.metadata;
            this.staticJoined = this.parentObj.staticJoined ? this.parentObj.staticJoined : [];
            this.columnMappings = this.parentObj.columnMappings ? this.parentObj.columnMappings : [];
            this.skipFields = this.parentObj.skipFields ? this.parentObj.skipFields : [];
            this.conditionList = [
                { "label": "Condition", "value": "" },
                { "label": "Greater Than (>)", "value": ">" },
                { "label": "Less Than (<)", "value": "<" },
                { "label": "EqualTo (==)", "value": "=" },
                { "label": "Not equalTo (!=)", "value": "!=" },
                { "label": "Greater Than Equal To (>=)", "value": ">=" },
                { "label": "Less Than Equal To (<=)", "value": "<=" },
                { "label": "Change", "value": 'change' }
              ];
              this.logicalList = [
                { "label": "Logical", "value": "" },
                { "label": "AND(&&)", "value": "AND" },
                { "label": "OR(||)", "value": "OR" },
              ];
            this.skipFieldsDefaults = [];
            this.model = new filterSingleModel();
            this.model.set({ "menu_id": this.menuId });
            this.multiselectOptions = new multiselectOptions();
            this.categoryList = new slugCollection();
            this.adminlist = new adminCollection();
            this.getCategoryList();
            this.getAdmins();
            this.getColumnList();
            // DATE CONDITION LIST
            this.dateConditionList = [
                { "label": "Exact Date", "value": "exact_date" },
                { "label": "Date Range", "value": "date_range" },
                { "label": "After", "value": "after" },
                { "label": "before", "value": "before" },
            ]
            // SHOW FIELDS ACCORDING TO LIST
            this.showFieldsMap = {
                "datetime": '.value-date-time',
                "timestamp": '.value-date-time',
                "created_date": '.value-date-time',
                "modified_date": '.value-date-time',
                "start_date": '.value-date-time',
                "due_date": '.value-date-time',
                "completed_date": '.value-date-time',
                "end_on_date": '.value-date-time',
                "end_after_date": '.value-date-time',
                "last_activity_date": '.value-date-time',
                "birth_date": '.value-date-time',
                "company_id": '.value-company',
                "default_company": '.value-company',
                "assignee": '.value-admin',
                "created_by": '.value-admin',
                "modified_by": '.value-admin',
            };
        },
        attachEvents: function () {
            this.$el.off('change', '.dropval', this.updateOtherDetails);
            this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
            this.$el.off('input', '.txtchange', this.updateOtherDetails);
            this.$el.on('input', '.txtchange', this.updateOtherDetails.bind(this));
            this.$el.off('change', '.updateDetails', this.updateDetails);
            this.$el.on('change', '.updateDetails', this.updateDetails.bind(this));
            this.$el.off('click', '.addNewfield', this.addCondition);
            this.$el.on('click', '.addNewfield', this.addCondition.bind(this));
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
            this.$el.off('click', '.quick_search', this.saveCondition);
            this.$el.on('click', '.quick_search', this.saveCondition.bind(this));
            this.$el.off('click', '.multiSel', this.setValues);
            this.$el.on('click', '.multiSel', this.setValues.bind(this));
            this.$el.off('input', '.feildSearch', this.feildSearch);
            this.$el.on('input', '.feildSearch', this.feildSearch.bind(this));
            this.$el.off('change', '.field_logicalOp', this.changeLogicalOp);
            this.$el.on('change', '.field_logicalOp', this.changeLogicalOp.bind(this));
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
                    var row = $(e.currentTarget).closest('.row');
                    var nextValueRow = row.next('.value_row');
                    nextValueRow.find('.value-date-time #from_date, .value-date-time #to_date, .value-text-range #from_value, .value-text-range #to_value, .value-text .field_value, .value-date-range .field_value').val('');
                    nextValueRow.find('.value-text, .value-company, .value-category, .value-text, .value-enum, .value-text-range').hide();
                    (valuetxt == 'is_empty' || valuetxt == 'is_not_empty') ?
                        nextValueRow.hide() :
                        nextValueRow.show();
                    switch (valuetxt) {
                        case 'date_range':
                            nextValueRow.find('.value-date-time').hide();
                            nextValueRow.find('.value-text').hide();
                            nextValueRow.find('.value-date-range').show();
                            nextValueRow.find('.value-date-time #field_value').val('');
                            break;
                        case 'exact_date':
                        case 'after':
                        case 'before':
                            nextValueRow.find('.value-text').hide();
                            nextValueRow.find('.value-date-time').show();
                            nextValueRow.find('.value-date-range').hide();
                            break;
                        case '=':
                        case '!=':
                        case '>':
                        case '<':
                        case '<=':
                        case '>=':
                            var column = this.columnlist.find(column => column.Field === field);
                            let statCol = selfobj.staticJoined.find((colData) => {
                                if (colData.field == column.Field) {
                                    return colData;
                                }
                            });
                            nextValueRow.find('.value-text, .value-company, .value-text, .value-enum, .value-text-range').hide();
                            nextValueRow.find('.value-text #field_value').val('');
                            if (statCol) {
                                switch (statCol.fieldtype) {
                                    case 'category':
                                        nextValueRow.find('.value-category').show();
                                        nextValueRow.find('.value-joinedfield').hide();
                                        break;
                                    default:
                                        nextValueRow.find('.value-category').hide();
                                        nextValueRow.find('.value-joinedfield').show();
                                        break;
                                }
                            } else {
                                if (column.Type.includes('enum')) {
                                    nextValueRow.find('.value-enum').show();
                                } else if (nextValueRow.find('.dynamic-field').children().length > 0) {
                                    nextValueRow.find('.dynamic-field').show();
                                } else {
                                    let fieldSelector = (selfobj.showFieldsMap[field]) ? selfobj.showFieldsMap[field] : null;
                                    if (fieldSelector) {
                                        nextValueRow.find(fieldSelector).show();
                                    } else {
                                        nextValueRow.find('.value-text').show();
                                    }
                                }
                            }
                            break;
                        default:
                            nextValueRow.find('.value-date-time').hide();
                            nextValueRow.find('.value-date-range').hide();
                            break;
                    }
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
                selfobj.renderConditions(selfobj.json_data);
            });

            // selfobj.skipCount = selfobj.columnlist.length - selfobj.skipFields.length;
            // selfobj.extractedFields = [];
            // if (selfobj.metadata) {
            //     for (var rowKey in selfobj.metadata) {
            //         var row = selfobj.metadata[rowKey];
            //         for (var colKey in row) {
            //             var field = row[colKey];
            //             if (field.fieldID !== undefined) {
            //                 if (field.fieldType == 'File') {
            //                     selfobj.columnlist.pop(field);
            //                     selfobj.skipFields.push(field);
            //                 }
            //                 selfobj.extractedFields.push(field);
            //             }
            //         }
            //     }
            // }
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
        // CHANGE LOGICAL OPERATOR 
        changeLogicalOp: function (e) {
            var selfobj = this;
            var valTxt = $(e.currentTarget).val();
            $(e.currentTarget).closest('.logicalOp-dd').find('.logicalDropdownButton').text(valTxt);
            $(e.currentTarget).closest('.logical-op-menu').removeClass('show');
            selfobj.saveCondition();
        },
        // ADD NEW CONDITION
        addCondition: function () {
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
                selfobj.addCondition();
                var template = _.template(filterFieldSingle);
                this.$(".filter-fields").append(template({ rowCounter: selfobj.rowCounter, column: columnField, conditionList: selfobj.conditionList, adminList: selfobj.adminlist.models }));
                this.setShowHideElm(columnField, true, '');
                selfobj.rowCounter++;
                this.$(".addNewfield").dropdown('toggle');
            }
        },
        // REMOVE CONDITION
        removeColumnFields: function (e) {
            e.stopPropagation();
            var selfobj = this;
            let removeField = $(e.currentTarget).attr('data-removeField');
            let columnName = $(e.currentTarget).attr('data-columnName');
            this.$('#field_' + removeField).remove();
            selfobj.skipFields = selfobj.skipFields.filter(item => item !== columnName);
            selfobj.skipFieldsDefaults = selfobj.skipFieldsDefaults.filter(item => item !== columnName);
            selfobj.skipCount++;
            selfobj.saveCondition();
            selfobj.addCondition();
        },
        // FIELD DATA EXTRACTION
        fieldExtractor: function (row) {
            // FOR GENERAL FIELDS
            let valueToShow = valueElm = ''
            let valueElement = null;
            const conditionVal = $(row).find('#condition').val();
            const logicalOp = ($(row).find('#logical_condition').val()) ? ($(row).find('#logical_condition').val()) : 'AND';
            const fieldEnumSelect = row.querySelector('.value-enum #field_value');
            const fieldAdminSelect = row.querySelector('.value-admin #field_value');
            const fieldDateSelect = row.querySelector('.value-date-time #field_value');
            const fieldDateFrom = row.querySelector('.value-date-range #from_date');
            const fieldDateTo = row.querySelector('.value-date-range #to_date');
            const fieldValueFrom = row.querySelector('.value-text-range #from_value');
            const fieldValueTo = row.querySelector('.value-text-range #to_value');
            const fieldCategory = row.querySelector('.value-category #field_value');
            const fieldJoined = row.querySelector('.value-joinedfield #field_value');
            const fieldCompany = row.querySelector('.value-company #field_value');
            const fieldTextInput = row.querySelector('.value-text #field_value');
            // FOR DYNAMIC FEILDS
            const fieldDynamic_se = row.querySelector('.dynamic-se #field_value');
            const fieldDynamic_dd = row.querySelector('.dynamic-dd  #field_value');
            const optionsArray = [];
            optionsArray.length = 0;
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
            if (fieldDynamic_se && fieldDynamic_se.value) { valueElement = fieldDynamic_se; }
            if (fieldDynamic_dd && fieldDynamic_dd.value) { valueElement = fieldDynamic_dd; }
            if (fieldDateSelect && fieldDateSelect.value) { valueElement = fieldDateSelect; valueToShow = fieldDateSelect.value; }
            if (fieldAdminSelect && fieldAdminSelect.value) { valueElement = fieldAdminSelect; valueToShow = fieldAdminSelect.options[fieldAdminSelect.selectedIndex].text; }
            if (fieldCategory && fieldCategory.value) { valueElement = fieldCategory; valueToShow = fieldCategory.options[fieldCategory.selectedIndex].text; }
            if (fieldJoined && fieldJoined.value) { valueElement = fieldJoined; valueToShow = fieldJoined.options[fieldJoined.selectedIndex].text; }
            if (fieldCompany && fieldCompany.value) { valueElement = fieldCompany; valueToShow = fieldCompany.options[fieldCompany.selectedIndex].text; }
            if (fieldTextInput && fieldTextInput.value) { valueElement = fieldTextInput; valueToShow = fieldTextInput.value; }
            const valueElmDy = valueElement ? valueElement.classList.contains('dvalChange') : '';
            if (valueElmDy) {
                valueElm = valueElement ? valueElement.getAttribute('data-val') : '';
                valueToShow = valueElement ? valueElement.value : '';
            } else if ((fieldDateFrom && fieldDateFrom.value) && (fieldDateTo && fieldDateTo.value)) {
                valueToShow = fieldDateFrom.value + '/' + fieldDateTo.value;
                valueElm = valueToShow;
            } else if ((fieldValueFrom && fieldValueFrom.value) && (fieldValueTo && fieldValueTo.value)) {
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
                    jsonForm[rowId] = { columnName: fieldNameVal, conditionalOp: conditionVal, value: valueElm, logicalOp: logicalOp, optionsArray: optionsArray ? optionsArray : [], valueToShow: valueToShow };
                }
            });
            return [jsonForm, alertShown];
        },
        // CONDITION SAVING
        saveCondition: function () {
            var selfobj = this;
            var [jsonForm, alertShown] = selfobj.getConditionJSON();
            var jsonString = JSON.stringify(jsonForm);
            console.log('jsonForm : ', jsonForm);
            var conditionObj = {
                menuId : selfobj.parentObj.menuId,
                menuLink : selfobj.parentObj.menuLink,
                isDef : selfobj.parentObj.isDef,
                index : selfobj.index,
                json_data : jsonString,
            }
            console.log('conditions : ',selfobj.campaingObj.conditions);
            selfobj.campaingObj.conditions[selfobj.parentObj.menuId] = conditionObj;
        },
        // HIDE SHOW FIELD VALUES DROPDOWN/TEXT
        setShowHideElm: function (columnField, fieldDetail, dVal) {
            var selfobj = this;
            var feilds = (columnField.hasOwnProperty('Field')) ? columnField.Field : columnField.columnName;
            var currentRow = this.$('#field_' + selfobj.rowCounter);
            // CHECK IF CURRENT ROW IS EXISTS
            if (currentRow) {
                currentRow.find('#condition option').hide();
                currentRow.find('.value_row').show();
                if (this.columnlist && this.columnlist.length > 0) {
                    var column = this.columnlist.find(column => column.Field === feilds);
                    if (column) {
                        // HIDE ALL FIELDS
                        var columnType = '';
                        var dynamicColumn = this.extractedFields.find(column => column.column_name === feilds);
                        currentRow.find('.value-text, .value-enum, .value-admin, .value-date-time, .value-date-range, .value-company, .value-text-range, .dynamic-field').hide();
                        (fieldDetail == true) ? currentRow.find('#condition, #field_value').val("") : '';
                        currentRow.find('.value-category').remove();
                        // GET COLUMN TYPE
                        if (column.Type.includes('enum')) {
                            if (fieldDetail == true) {
                                currentRow.find('.select.field_value,.select#condition').val("");
                            }
                            currentRow.find('#condition option[value="="], option[value="!="], option[value="change"]').show();
                            currentRow.find('.value-enum').show();
                            currentRow.find('.value-text').hide();
                            currentRow.find('select.field_value').empty();
                            // ADD OPTION TO ENUM
                            let matches = column.Type.match(/'([^']*)'/g);
                            let enums = matches.map(match => match.replace(/'/g, ''));
                            currentRow.find('select.field_value').append($('<option>', { value: '', text: 'Select Value', }));
                            enums.forEach(enu => {
                                currentRow.find('select.field_value').append($('<option>', {
                                    value: enu,
                                    text: enu,
                                    selected: enu == dVal.value
                                }));
                            });
                        } else {
                            currentRow.find('#condition option[value="="], option[value="!="], option[value=">"], option[value="<"], option[value=">="], option[value="<="], option[value="change"]').show();
                            currentRow.find('.value-admin, .value-date-time, .value-enum, .value-text, .value-text-range').hide();
                            if (fieldDetail == true) {
                                currentRow.find('.value-text #field_value').val("");
                            }
                            // DYANAMIC COLUMS EXISTS
                            if (dynamicColumn) {
                                if (['Dropdown', 'Radiobutton', 'Checkbox'].includes(dynamicColumn.fieldType)) {
                                    let template = dynamicColumn.linkedWith ? _.template(filterConditionLikned) : _.template(dropdownTemp);
                                    let options = dynamicColumn.linkedWith ? dynamicColumn : dynamicColumn.fieldOptions.split(",");
                                    currentRow.find('.dynamic-field').empty().append(template({ options: options, dVal: dVal }));
                                    currentRow.find('.dynamic-field,.dynamic-field .dynamic-dd, .dynamic-field .dynamic-se').show();
                                } else {
                                    currentRow.find('.value-text').show().attr({ "data-lb": column.label });
                                }
                            } else {
                                let statCol = selfobj.staticJoined.find((colData) => {
                                    if (colData.field == column.Field) {
                                        return colData
                                    }
                                });
                                if ((column.Type.includes('int') || column.Type.includes('float'))) {
                                    currentRow.find('#condition option[value="range"]').show();
                                    currentRow.find('#condition option[value="is_in"]').hide();
                                }
                                if (statCol) {
                                    currentRow.find('#condition option[value="="], option[value="!="], option[value="change"]').show();
                                    switch (statCol.fieldtype) {
                                        case 'category':
                                            let template = _.template(categoryTemplate);
                                            currentRow.find('.value_row').append(template({ categoryList: selfobj.categoryList.models, slug: statCol.slug, dVal: dVal }));
                                            break;
                                        default:
                                            selfobj.getJoinedDropDownValues(currentRow, statCol, dVal);
                                            break;
                                    }
                                } else {
                                    let fieldSelector = selfobj.showFieldsMap[feilds];
                                    if (column.Type == 'datetime' || column.Type == 'timestamp' || column.Type == 'date') {
                                        currentRow.find('.condition_row').empty();
                                        let template = _.template(dateConditionTemplate);
                                        currentRow.find('.condition_row').append(template({ conditionList: selfobj.dateConditionList, dVal: dVal }));
                                    }
                                    if (fieldSelector) {
                                        if (dVal && dVal.condition == 'date_range') {
                                            currentRow.find('.value-date-range').show().attr({ "data-lb": column.label });
                                        } else {
                                            currentRow.find(fieldSelector).show().attr({ "data-lb": column.label });
                                        }
                                        currentRow.find('#condition option[value="="], option[value="!="], option[value=">"], option[value="<"], option[value=">="], option[value="<="], option[value="change"]').show();
                                        // currentRow.find('#condition option[value="range"],option[value="start_with"],option[value="end_with"],option[value="is_in"]').hide();
                                    } else {
                                        if (dVal.condition == 'range') {
                                            currentRow.find('.value_row .value-text-range').show();
                                        } else {
                                            currentRow.find('.value-text').show();
                                        }
                                    }
                                }
                            }
                        }
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
        renderConditions: function (filterJson) {
            var selfobj = this;
            if (filterJson) {
                this.$('.selected-filter').css({ "display": "flex" });
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
                                } else {
                                    columnField.mappedFieldName = columnName;
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
                                $('#field_' + rowCounter + ' .dropdownMenuButton').addClass("active");
                            }
                            rowCounter++;
                            selfobj.rowCounter++;
                        }
                    }
                }
                selfobj.skipCount = selfobj.columnlist.length - selfobj.skipFields.length;
                selfobj.addCondition();
            }
        },
        render: function () {
            var selfobj = this;
            var template = _.template(conditionsTemplate);
            this.$el.html(template({ model: selfobj.model.attributes }));
            if ($(".conditionsSelector ."+this.appendTo+' .conditions').length) {
                $(".conditionsSelector ."+this.appendTo+' .conditions').empty().append(this.$el);
                this.attachEvents();
                this.initializeDatePicker();
                setToolTip();
                $("body").on('click', '.fil-save, .fieldListDetails, .logical-op-menu', function (event) {
                    event.stopPropagation();
                });
            }
            return this;
        },
        onDelete: function () {
            this.remove();
        }
    });
    return conditionsView;
});
