define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'text!../templates/bulkEditTemplate.html',
    'text!../templates/editFormTemp.html',
], function ($, _, Backbone, validate, inputmask, bulkEditTemplate, editFormTemp) {
    var bulkEditView = Backbone.View.extend({
        initialize: function (options) {
            this.dynamicData = null;
            this.details = [];
            this.formdata = {};
            var selfobj = this;
            this.model = options.model ? options.model : null;
            this.parentObj = options.parentObj ? options.parentObj : null;
            this.toClose = "bulkEditView";
            this.mainContent = document.querySelector(".app_playground");
            this.removeoverlay = document.querySelector(".overlay-main-container");
            this.prepareStructure();
            this.render();
        },
        events: {
            'click .closeFlyout': 'closeFlyout',
            'click .dropdown-toggle': 'removePanelOverflow',
            'click .dropdown-menu.inner': 'addPanelOverflow', 
            'change #due_date': 'validateDueDate', 
            'change #start_date': 'validateStartDate', 
        },

        attachEvents: function () {
            this.$el.off('click', '.settingsDetails', this.editData);
            this.$el.on('click', '.settingsDetails', this.editData.bind(this));
            this.$el.off('change', '.dropval', this.updateOtherDetails);
            this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
            this.$el.off('blur', '.txtchange', this.updateOtherDetails);
            this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
            this.$el.off('input change', '.txtchange, .dropval', this.checkFormFields);
            this.$el.on('input change', '.txtchange, .dropval', this.checkFormFields.bind(this));
            this.disableSaveButton(true);
        },
        clearField: function (fieldSelector) {
            this.$el.find(fieldSelector).val("");
        },
        validateDueDate: function (e) {
            const selectedDate = new Date($(e.currentTarget).val());
            const startDateValue = this.$el.find('#start_date').val();
            const startDate = new Date(startDateValue);
            if (startDateValue && selectedDate < startDate) {
                alert("Due date cannot be earlier than the start date. Please select a valid date.");
                $(e.currentTarget).val("");
                this.clearField('#start_date'); 
            }
        },  
        validateStartDate: function (e) {
            const selectedStartDate = new Date($(e.currentTarget).val());
            const dueDateValue = this.$el.find('#due_date').val();
            const dueDate = new Date(dueDateValue);
            if (dueDateValue && selectedStartDate > dueDate) {
                alert("Start date cannot be later than the due date. Please select a valid date.");
                $(e.currentTarget).val(""); 
                this.clearField('#due_date'); 
            }
        }, 
        removePanelOverflow: function () {
            this.$el.removeClass('panel_overflow');
        },
        addPanelOverflow: function () {
            this.$el.addClass('panel_overflow');
        },
        disableSaveButton: function (disable) {
            const saveButton = this.$el.find('.settingsDetails');
            saveButton.prop('disabled', disable);
            saveButton.toggleClass('disabled-icon', disable);
        },
        checkFormFields: function () {
            const hasValue = this.$el.find('.txtchange, .dropval').toArray().some(field => $(field).val().trim() !== "");
            this.disableSaveButton(!hasValue);
        },
        onErrorHandler: function (collection, response, options) {
            Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
            $(".loder").hide();
        },
        updateOtherDetails: function (e) {
            var valuetxt = $(e.currentTarget).val();
            var toName = $(e.currentTarget).attr("id");
            var newdetails = [];
            newdetails["" + toName] = valuetxt;
            if (valuetxt != "") {
                this.formdata["" + toName] = valuetxt;
            }else {
                delete this.formdata[toName];
            }
        },
        prepareStructure: function () {
            var selfobj = this;
            var promises = [];                
            if (selfobj.parentObj.bulkeditfields) {
                selfobj.parentObj.bulkeditfields.map((field, index) => {                 
                    var column = selfobj.parentObj.columnlist.find(column => column.Field === field);                  
                    if (column) {
                        var staticCol = selfobj.parentObj.staticJoined.find(staticColumn => staticColumn.field === field);
                        if (staticCol) {
                            staticCol.inputType = 'select';
                            staticCol.index = index;  
                            promises.push(selfobj.getJoinedOtionValues(staticCol));
                        } else {
                            if (column.Type.includes("date") || column.Type.includes("time")) {
                                column.inputType = 'date';
                            } else if (column.Type.includes("varchar")) {
                                column.inputType = 'text';  
                            } else if (column.Type.includes('enum')) {
                                let matches = column.Type.match(/'([^']*)'/g);
                                let enums = matches.map(match => match.replace(/'/g, ''));
                                column.inputType = 'enum';
                                column.options = enums;
                            }
                            column.index = index;  
                            selfobj.details.push(column);
                        }
                    }
                });       
                Promise.all(promises).then(() => {                   
                    selfobj.details.sort((a, b) => a.index - b.index);                   
                    selfobj.renderform();
                    $('.ws-select').selectpicker();
                }).catch(error => {
                    console.error('Error fetching data:', error);
                });         
            }
        },       
        renderform: function () {
            var selfobj = this;
            var template = _.template(editFormTemp);
            $(".editform").empty();
            selfobj.details.forEach(detail => {
                $(".editform").append(template({ data: detail }));
            });
        },
        editData: function (e) {
            var selfobj = this;
            var editdata = JSON.stringify(this.formdata);
            let isNew = $(e.currentTarget).attr("data-action");
            $.ajax({
                url: APIPATH + 'editdata/',
                method: 'POST',
                data: { list: this.parentObj.idsToRemove, formdata: editdata, menuId: this.parentObj.menuId },
                datatype: 'JSON',
                beforeSend: function (request) {
                    $('.loder').show();
                    request.setRequestHeader("token", $.cookie('_bb_key'));
                    request.setRequestHeader("SadminID", $.cookie('authid'));
                    request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                    request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                    $('.loder').hide();
                    if (res.flag == "F") {
                        showResponse('', res, '');
                    }
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    if (res.flag == "S") {
                        if (isNew == "close") {
                            showResponse(e, res, "Save");
                        }
                        handelClose(selfobj.toClose);
                        $('.toolbar').hide();
                        $('#clist input[type="checkbox"]:checked').prop('checked', false);
                        selfobj.parentObj.resetSearch();
                    }
                }
            });
        },
        getJoinedOtionValues: function (statCol) {
            return new Promise((resolve, reject) => {
                selfobj = this;
                $.ajax({
                    url: APIPATH + 'getJoinedValues/',
                    method: 'POST',
                    data: statCol,
                    datatype: 'JSON',
                    beforeSend: function (request) {
                        $('.loder').show();
                        request.setRequestHeader("token", $.cookie('_bb_key'));
                        request.setRequestHeader("SadminID", $.cookie('authid'));
                        request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                        request.setRequestHeader("Accept", 'application/json');
                    },
                    success: function (res) {
                        $('.loder').hide();
                        if (res.flag === "S" && res.data.length > 0) {
                            statCol.options = res.data;
                            selfobj.details.push(statCol);
                        }
                        resolve();
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        },
        openFlyout: function () {
            $("#" + this.toClose).show();
            this.mainContent.classList.add("blur-background");
        },
        closeFlyout: function () {
            $("#" + this.toClose).hide();
            this.removeoverlay.classList.remove("settings-overlays");
            this.mainContent.classList.remove("blur-background");
        },
        render: function () {
            var selfobj = this;
            var source = bulkEditTemplate;
            var template = _.template(source);
            this.$el.html(template({ number: selfobj.parentObj.checkedCount }));
            $("#" + this.toClose).remove();
            this.$el.addClass("tab-pane in active panel_overflow");
            this.$el.attr('id', this.toClose);
            this.$el.addClass(this.toClose);
            this.$el.data("role", "tabpanel");
            this.$el.data("current", "yes");
            $(".ws-tab").append(this.$el);
            $('.overlay-main-container').addClass('editoverlays');
            $('.overlay-main-container.editoverlays').addClass('open settings-overlays');
            $('.ws-select').selectpicker();
            rearrageOverlays('Bulk Edit', this.toClose);
            this.attachEvents();
            $('#' + this.toClose).show();
            this.openFlyout();
            return this;
        }, onDelete: function () {
            alert();
            $('.overlay-main-container').removeClass('settings-overlays');
            $('.overlay-main-container').removeClass('editoverlays');
            this.mainContent.classList.remove("blur-background");
            this.remove();
        }
    });
    return bulkEditView;
});
