define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'moment',
    'Swal',
    '../../core/views/multiselectOptions',
    '../../dynamicForm/views/dynamicFieldRender',
    '../../customer/collections/customerCollection',
    '../../emailMaster/collections/emailMasterCollection',
    '../../emailMaster/models/emailMasterSingleModel',
    '../models/pushServiceNotificationModel',
    '../../readFiles/views/readFilesView',
    'text!../templates/pushServiceNotification_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment,Swal, multiselectOptions, dynamicFieldRender, customerCollection, emailMasterCollection, emailMasterSingleModel, pushServiceNotificationModel, readFilesView, pushServiceNotiftemp) {

    var pushServiceSingleView = Backbone.View.extend({
        model: pushServiceNotificationModel,
        initialize: function (options) {
            this.dynamicData = null;
            this.toClose = "pushServiceSingleView";
            this.pluginName = "pushServiceList";
            this.pluginId = options.pluginId;
            this.loadFrom = options.loadfrom;
            this.model = new pushServiceNotificationModel();
            var selfobj = this;
            this.dynamicFieldRenderobj = new dynamicFieldRender({
                ViewObj: selfobj,
                formJson: {},
            });
            this.multiselectOptions = new multiselectOptions();
            $(".modelbox").hide();
            scanDetails = options.searchpushService;
            $(".popupLoader").show();
            this.customerList = new customerCollection();
            this.customerList.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
            }).done(function (res) {
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".popupLoader").hide();
                selfobj.render();
            });

            this.emailList = new emailMasterCollection();
            this.emailList.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
            }).done(function (res) {
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".profile-loader").hide();
                selfobj.render();
            });

            if (options.push_service_id != "") {
                this.model.set({ push_service_id: options.push_service_id });
                this.model.fetch({
                    headers: {
                        'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler
                }).done(function (res) {
                    var date_of_donation = selfobj.model.get("date_of_donation");
                    if (date_of_donation != null && date_of_donation != "0000-00-00") {
                        selfobj.model.set({ "date_of_donation": moment(date_of_donation).format("DD-MM-YYYY") });
                    }
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    $(".popupLoader").hide();
                    selfobj.render();
                    selfobj.setOldValues();
                });
            }
        },
        events: {
            "click .savepushServiceDetails": "savepushServiceDetails",
            "click .item-container li": "setValues",
            "blur .txtchange": "updateOtherDetails",
            "click .multiSel": "setValues",
            "change .bDate": "updateOtherDetails",
            "change .dropval": "updateOtherDetails",
            "change .logoAdded": "updateImageLogo",
            "click .loadMedia": "loadMedia",
            "click .multiOptionSel": "setValues",
            "blur .multiselectOpt": "updatemultiSelDetails",
            "change .getTemplate": "getTemplate",
        },
        attachEvents: function () {
            // Detach previous event bindings
            this.$el.off("click", ".savepushServiceDetails", this.savepushServiceDetails);
            // Reattach event bindings
            this.$el.on("click", ".savepushServiceDetails", this.savepushServiceDetails.bind(this));
            this.$el.off("click", ".multiSel", this.setValues);
            this.$el.on("click", ".multiSel", this.setValues.bind(this));
            this.$el.off("change", ".bDate", this.updateOtherDetails);
            this.$el.on("change", ".bDate", this.updateOtherDetails.bind(this));
            this.$el.off("change", ".dropval", this.updateOtherDetails);
            this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));
            this.$el.off("click", ".iconSelection", this.setIconValues);
            this.$el.off("blur", ".txtchange", this.updateOtherDetails);
            this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));
            this.$el.off("click", ".loadMedia", this.loadMedia);
            this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
            this.$el.off("click", ".multiOptionSel", this.setValues);
            this.$el.on("click", ".multiOptionSel", this.setValues.bind(this));
            this.$el.off("change", ".getTemplate", this.getTemplate);
            this.$el.on("change", ".getTemplate", this.getTemplate.bind(this));
        },

        onErrorHandler: function (collection, response, options) {
            alert(
                "Something was wrong ! Try to refresh the page or contact administer. :("
            );
            $(".profile-loader").hide();
        },
        updateOtherDetails: function (e) {
            var valuetxt = $(e.currentTarget).val();
            var toID = $(e.currentTarget).attr("id");
            var newdetails = [];
            newdetails["" + toID] = valuetxt;
            this.model.set(newdetails);

            if (toID == "trigger_type" && valuetxt == "interval") {
                $('#triggerDate').hide();
                $('#intervalType').show();
            } else if (toID == "trigger_type" && valuetxt == "date") {
                $('#intervalType').hide();
                $('#triggerDate').show();
                $('#stopInterval').hide();
                $('#intervalSelect').hide();
            }

            if (toID == "interval_type" && valuetxt == "day") {
                $('.week-div').hide();
                $('.month-div').hide();
                $('#stopInterval').show();
                $('#intervalSelect').show();
                $('.day-div').show();
            } else if (toID == "interval_type" && valuetxt == "week") {
                $('.month-div').hide();
                $('.week-div').show();
                $('#intervalSelect').show();
                $('#stopInterval').show();
                $('.day-div').show();
            } else if (toID == "interval_type" && valuetxt == "month") {
                $('.week-div').show();
                $('.month-div').show();
                $('#intervalSelect').show();
                $('#stopInterval').show();
                $('.day-div').show();
            } else if (toID == "interval_type" && valuetxt == "year") {
                $('.week-div').hide();
                $('.month-div').hide();
                $('#intervalSelect').show();
                $('#stopInterval').show();
                $('.day-div').show();
            }

            if (toID == "stop_type" && valuetxt == "interval") {
                $('.end-date-div').hide();
                $('.total-comp-inte').show();
            } else if (toID == "stop_type" && valuetxt == "date") {
                $('.total-comp-inte').hide();
                $('.end-date-div').show();
            } else if (toID == "stop_type" && valuetxt == "infinite") {
                $('.total-comp-inte').hide();
                $('.end-date-div').hide();
            }
        },
        setOldValues: function () {
            var selfobj = this;
            setvalues = ["status"];
            selfobj.multiselectOptions.setValues(setvalues, selfobj);
        },
        setValues: function (e) {
            var selfobj = this;
            var da = selfobj.multiselectOptions.setCheckedValue(e);
            selfobj.model.set(da);
        },
        getSelectedFile: function (url) {
            $('.' + this.elm).val(url);
            $('.' + this.elm).change();
            $("#profile_pic_view").attr("src", url);
            $("#profile_pic_view").css({ "max-width": "100%" });
            $('#largeModal').modal('toggle');
            this.model.set({ "pushService_image": url });

        },
        loadMedia: function (e) {
            e.stopPropagation();
            $('#largeModal').modal('toggle');
            this.elm = "profile_pic";
            var menusingleview = new readFilesView({ loadFrom: "addpage", loadController: this });
        },

        getTemplate: function (e) {
            e.stopPropagation();
            var selfobj = this;
            let tempID = $(e.currentTarget).val();
            var tempDetails = new emailMasterSingleModel();
            tempDetails.set({ tempID: tempID });
            tempDetails.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler
            }).done(function (res) {
                if (res.flag == "F") showResponse('',res,'');
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".popupLoader").hide();
                selfobj.model.set({ message_body: tempDetails.attributes.emailContent });
                selfobj.model.set({ sms_body: tempDetails.attributes.smsContent });
                selfobj.model.set({ whats_app_body: tempDetails.attributes.whats_app_body });
                selfobj.render();
            });
        },

        savepushServiceDetails: function (e) {
            e.preventDefault();
            let selfobj = this;
            var mid = this.model.get("push_service_id");
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
            if ($("#pushServiceDetails").valid()) {
                $(e.currentTarget).html("<span>Saving..</span>");
                $(e.currentTarget).attr("disabled", "disabled");
                this.model.save({}, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: methodt
                }).done(function (res) {
                    if (res.flag == "F") showResponse('',res,'');
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    if (isNew == "new") {
                        showResponse(e, res, "Save & New");
                    } else {
                        showResponse(e, res, "Save");
                    }
                    if (selfobj.loadFrom == "TaskSingleView") {
                        scanDetails.refreshCust();
                    } else {
                        scanDetails.filterSearch();
                    }
                    if (res.flag == "S") {
                        if (isNew == "new") {
                            selfobj.model.clear().set(selfobj.model.defaults);
                            selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                            selfobj.render();
                        } else {
                            // alert("here");
                            handelClose(selfobj.toClose);
                        }
                    }
                });
            }
        },
        initializeValidate: function () {
            var selfobj = this;
            var feilds = {

                name: {
                    required: true,
                },
                email_id: {
                    required: true,
                    email: true,
                },
                date_of_donation: {
                    required: true,
                },
                address: {
                    required: true
                },
                pushService_in_name_of: {
                    required: true
                },
                pan_number: {
                    required: true
                },
                aadhar_number: {
                    required: true,
                    minlength: 12,
                    maxlength: 12,
                },
                pan_number: {
                    minlength: 10,
                    maxlength: 10,
                },
            };
            var feildsrules = feilds;
            var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

            if (!_.isEmpty(dynamicRules)) {
                var feildsrules = $.extend({}, feilds, dynamicRules);
                // var feildsrules = {
                //   ...feilds,
                //   ...dynamicRules
                //   };
            }
            var messages = {

                name: "Donor Name required",
                email_id: "Email Required",
                date_of_donation: "Date of Donation Required",
                address: "Address Required",
                pushService_in_name_of: "Name For reciept Required",
                pan_number: "PAN number required",
                aadhar_number: "Aadhar Number Required"
            };
            $("#contact_number").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });

            $("#pushServiceDetails").validate({
                rules: feildsrules,
                messages: messages,
            });


            $("#trigger_date").datepickerBT({
                format: "dd-mm-yyyy",
                todayBtn: "linked",
                clearBtn: true,
                todayHighlight: true,
                numberOfMonths: 1,
                autoclose: true,
            }).on('changeDate', function (selected) {
                $('#trigger_date').change();
                var valuetxt = $("#trigger_date").val();
                selfobj.model.set({ trigger_date: valuetxt });
            });

            $("#stop_date").datepickerBT({
                format: "dd-mm-yyyy",
                todayBtn: "linked",
                clearBtn: true,
                todayHighlight: true,
                numberOfMonths: 1,
                autoclose: true,
            }).on('changeDate', function (selected) {
                $('#stop_date').change();
                var valuetxt = $("#stop_date").val();
                selfobj.model.set({ stop_date: valuetxt });
            });

        },

        render: function () {
            var selfobj = this;
            var source = pushServiceNotiftemp;
            var template = _.template(source);
            $("#" + this.toClose).remove();
            this.$el.html(template({ "model": this.model.attributes, "emails": this.emailList.models }));
            this.$el.addClass("tab-pane in active panel_overflow");
            this.$el.attr("id", this.toClose);
            this.$el.addClass(this.toClose);
            this.$el.data("role", "tabpanel");
            this.$el.data("current", "yes");
            $(".tab-content").append(this.$el);
            $(".ws-select").selectpicker();
            $("#" + this.toClose).show();
            $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
            this.initializeValidate();
            this.setOldValues();
            this.attachEvents();
            rearrageOverlays("pushService", this.toClose);
            var __toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'direction': 'rtl' }],                         // text direction
                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'align': [] }],
                ['link'],
                ['clean'],
                ['image']                              // remove formatting button
            ];
            var editor1 = new Quill($("#message_body").get(0), {
                modules: {
                    imageResize: {
                        displaySize: true
                    },
                    toolbar: {
                        container: __toolbarOptions,
                        handlers: {
                            image: imageHandler
                        }
                    },
                },
                theme: 'snow'
            });
            function imageHandler() {
                var range = this.quill.getSelection();
                var value = prompt('please copy paste the image url here.');
                if (value) {
                    this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
                }
            }
            editor1.on('text-change', function (delta, oldDelta, source) {
                if (source == 'api') {
                    console.log("An API call triggered this change.");
                } else if (source == 'user') {
                    var delta = editor1.getContents();
                    var text = editor1.getText();
                    var justHtml = editor1.root.innerHTML;
                    selfobj.model.set({ "message_body": justHtml });
                }
            });
            var editor2 = new Quill($("#sms_body").get(0), {
                modules: {
                    imageResize: {
                        displaySize: true
                    },
                    toolbar: {
                        container: __toolbarOptions,
                        handlers: {
                            image: imageHandler
                        }
                    },
                },
                theme: 'snow'
            });
            function imageHandler() {
                var range = this.quill.getSelection();
                var value = prompt('please copy paste the image url here.');
                if (value) {
                    this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
                }
            }
            editor2.on('text-change', function (delta, oldDelta, source) {
                if (source == 'api') {
                    console.log("An API call triggered this change.");
                } else if (source == 'user') {
                    var delta = editor2.getContents();
                    var text = editor2.getText();
                    var justHtml = editor2.root.innerHTML;
                    selfobj.model.set({ "sms_body": justHtml });
                }
            });
            var editor3 = new Quill($("#whats_app_body").get(0), {
                modules: {
                    imageResize: {
                        displaySize: true
                    },
                    toolbar: {
                        container: __toolbarOptions,
                        handlers: {
                            image: imageHandler
                        }
                    },
                },
                theme: 'snow'
            });
            function imageHandler() {
                var range = this.quill.getSelection();
                var value = prompt('please copy paste the image url here.');
                if (value) {
                    this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
                }
            }
            editor3.on('text-change', function (delta, oldDelta, source) {
                if (source == 'api') {
                    console.log("An API call triggered this change.");
                } else if (source == 'user') {
                    var delta = editor3.getContents();
                    var text = editor3.getText();
                    var justHtml = editor3.root.innerHTML;
                    selfobj.model.set({ "whats_app_body": justHtml });
                }
            });
            return this;
        },
        onDelete: function () {
            this.remove();
        },
    });

    return pushServiceSingleView;
});
