define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'Swal',
    '../collections/dynamicFormsFieldsCollection',
    '../models/dynamicFormsSingleModel',
    '../models/questionSingleModel',
    '../../readFiles/views/readFilesView',
    'text!../templates/dynamicFormsQuestionRow.html',
    'text!../templates/dynamicQuestionSingle_temp.html',
    'text!../templates/addExtrawMultiple_temp.html',
    'text!../templates/addExtrawCheckbox_temp.html',
    'text!../templates/addExtrawDropdown_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Swal, dynamicFormsFieldsCollection, dynamicFormsSingleModel, questionSingleModel, readFilesView, QuestionRow_Temp, dynamicQuestion, addExtrawMultiple_temp, addExtrawCheckbox_temp, addExtrawDropdown_temp) {

    var questionSingleView = Backbone.View.extend({
        model: dynamicFormsSingleModel,
        addCount: 0,
        addMultipleCount: 0,
        options: [],
        initialize: function (options) {
            var selfobj = this;
            this.dynamicData = null;
            this.cloneCount = 1;
            this.addCount++;
            this.addMultipleCount++;
            this.options = [];
            this.count = options.count;
            this.form_id = options.form_id;
            this.scanDetails = options.searchForm;
            this.toClose = "questionsFormsSingleView";
            this.pluginName = "dynamicQuestion";
            this.updatedModel = options.model;
            if(this.updatedModel != undefined){
                this.model = this.updatedModel;
                selfobj.saveQuestionDetails();
                // console.log(this.model);
            }else{
                this.model = new questionSingleModel();
            }
            formfields = new dynamicFormsFieldsCollection();
            formfields.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', form_id: this.form_id }
            }).done(function (res) {
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".profile-loader").hide();
            });
            var selfobj = this;
            $(".popupLoader").show();
            console.log(formfields);
            selfobj.render();
        },
        events:
        {
            "blur .txtchange": "updateOtherDetails",
            "change .dropval": "updateOtherDetails",
            "click .loadMedia": "loadMedia",
            "click .text-description": "textdescribe",
            "click .add-questions": "addExtraQuestions",
            "click .remove-questions": "removeExtraQuestions",
            "click .add-options": "AddRowOptions",
            "click .add-duplicate-question": "AddDuplicate",
            "click .add-checkbox": "Addcheckbox",
            "click .removemultiple": "removemultiple",
            "click .checkBoxRemove": "checkBoxRemove",
            "click .add-options-dropDown": "AdddropDown",
            "click .removeDropdown": "removefield",
            "change .optionChange": "optionChange",
            "click .closeButtonMultiple": "removeImage",
        },
        attachEvents: function () {
            this.$el.off('change', '.dropval', this.updateOtherDetails);
            this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
            this.$el.off('blur', '.txtchange', this.updateOtherDetails);
            this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
            this.$el.off("click", ".loadMedia", this.loadMedia);
            this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
            this.$el.off("click", ".text-description", this.textdescribe);
            this.$el.on("click", ".text-description", this.textdescribe.bind(this));
            this.$el.off("click", ".add-questions", this.addExtraQuestions);
            this.$el.on("click", ".add-questions", this.addExtraQuestions.bind(this));
            this.$el.off("click", ".remove-questions", this.removeExtraQuestions);
            this.$el.on("click", ".remove-questions", this.removeExtraQuestions.bind(this));
            this.$el.off("click", ".add-options", this.AddRowOptions);
            this.$el.on("click", ".add-options", this.AddRowOptions.bind(this));
            this.$el.off("click", ".add-duplicate-question", this.AddDuplicate);
            this.$el.on("click", ".add-duplicate-question", this.AddDuplicate.bind(this));
            this.$el.off("click", ".add-checkbox", this.Addcheckbox);
            this.$el.on("click", ".add-checkbox", this.Addcheckbox.bind(this));
            this.$el.off("click", ".add-options-dropDown", this.AdddropDown);
            this.$el.on("click", ".add-options-dropDown", this.AdddropDown.bind(this));
            this.$el.off("click", ".removemultiple", this.removemultiple);
            this.$el.on("click", ".removemultiple", this.removemultiple.bind(this));
            this.$el.off("click", ".checkBoxRemove", this.checkBoxRemove);
            this.$el.on("click", ".checkBoxRemove", this.checkBoxRemove.bind(this));
            this.$el.off("click", ".removeDropdown", this.removefield);
            this.$el.on("click", ".removeDropdown", this.removefield.bind(this));
            this.$el.off('change', '.optionChange', this.optionChange);
            this.$el.on('change', '.optionChange', this.optionChange.bind(this));
            this.$el.off('click', '.closeButtonMultiple', this.removeImage);
            this.$el.on('click', '.closeButtonMultiple', this.removeImage.bind(this));
        },

        onErrorHandler: function (collection, response, options) {
            Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
            $(".profile-loader").hide();
        },
        updateOtherDetails: function (e) {
            let selfobj = this;
            var valuetxt = $(e.currentTarget).val();
            var toID = $(e.currentTarget).attr("id");
            var newdetails = [];
            newdetails["" + toID] = valuetxt;
            this.model.set(newdetails);
            var grandparent = $(e.currentTarget).closest('div#registrationForm');
            if (valuetxt == "short_answer") {
                grandparent.find(".short-answer-show").show();
                grandparent.find(".change-question-box").hide();
                grandparent.find(".change-question-checkbox").hide();
                grandparent.find(".paragraph-show").hide();
                grandparent.find(".date-show").hide();
                grandparent.find(".time-show").hide();
                grandparent.find(".change-question-dropdown").hide();
                selfobj.model.set({ 'question_type': "short_answer" });
            } else if (valuetxt == "choice") {
                grandparent.find(".change-question-box").show();
                grandparent.find(".short-answer-show").hide();
                grandparent.find(".change-question-checkbox").hide();
                grandparent.find(".paragraph-show").hide();
                grandparent.find(".date-show").hide();
                grandparent.find(".time-show").hide();
                grandparent.find(".change-question-dropdown").hide();
                selfobj.model.set({ 'question_type': "choice" });
            } else if (valuetxt == "paragraph") {
                grandparent.find(".paragraph-show").show();
                grandparent.find(".short-answer-show").hide();
                grandparent.find(".change-question-box").hide();
                grandparent.find(".change-question-checkbox").hide();
                grandparent.find(".date-show").hide();
                grandparent.find(".time-show").hide();
                grandparent.find(".change-question-dropdown").hide();
                selfobj.model.set({ 'question_type': "paragraph" });
            } else if (valuetxt == "checkboxes") {
                grandparent.find(".change-question-checkbox").show();
                grandparent.find(".short-answer-show").hide();
                grandparent.find(".change-question-box").hide();
                grandparent.find(".paragraph-show").hide();
                grandparent.find(".date-show").hide();
                grandparent.find(".time-show").hide();
                grandparent.find(".change-question-dropdown").hide();
                selfobj.model.set({ 'question_type': "checkboxes" });
            } else if (valuetxt == "question_date") {
                grandparent.find(".date-show").show();
                grandparent.find(".short-answer-show").hide();
                grandparent.find(".change-question-box").hide();
                grandparent.find(".change-question-checkbox").hide();
                grandparent.find(".paragraph-show").hide();
                grandparent.find(".time-show").hide();
                grandparent.find(".change-question-dropdown").hide();
                selfobj.model.set({ 'question_type': "question_date" });
            } else if (valuetxt == "question_time") {
                grandparent.find(".time-show").show();
                grandparent.find(".short-answer-show").hide();
                grandparent.find(".change-question-box").hide();
                grandparent.find(".change-question-checkbox").hide();
                grandparent.find(".paragraph-show").hide();
                grandparent.find(".date-show").hide();
                grandparent.find(".change-question-dropdown").hide();
                selfobj.model.set({ 'question_type': "question_time" });
            } else if (valuetxt == "dropdown") {
                grandparent.find(".time-show").hide();
                grandparent.find(".short-answer-show").hide();
                grandparent.find(".change-question-box").hide();
                grandparent.find(".change-question-checkbox").hide();
                grandparent.find(".paragraph-show").hide();
                grandparent.find(".date-show").hide();
                grandparent.find(".change-question-dropdown").show();
                selfobj.model.set({ 'question_type': "dropdown" });
            }
            selfobj.saveQuestionDetails();
        },

        removeImage: function (e) {
            $(e.currentTarget).closest('.hoverShow').find('img').attr('src', '');
            this.optionChange(e);
        },

        optionChange: function (e) {
            var choice = this.model.get("question_type");
            if (choice == "choice") {
                var parent = $(e.currentTarget).closest('.change-question-box');
                var questionOptions = [];
                $(parent).find(".ws-question-change").each(function (index) {
                    let option = $(this).find('.optionChange').val();
                    let element = $(this).closest(".ws-option-holder");
                    let image = $(element).find(".hoverShow").find("img").attr("src");
                    var jsonObject = {
                        "option": option,
                        "image": image || "",
                    };

                    questionOptions.push(jsonObject);
                });
            } else if (choice == "dropdown") {
                var parent = $(e.currentTarget).closest('.change-question-dropdown');
                var questionOptions = [];
                $(parent).find(".ws-question-change").each(function (index) {
                    let option = $(this).find('.optionChange').val();
                    var jsonObject = {
                        "option": option
                    };

                    questionOptions.push(jsonObject);
                });
            } else if (choice == "checkboxes") {
                var parent = $(e.currentTarget).closest('.change-question-checkbox');
                var questionOptions = [];
                $(parent).find(".ws-question-change").each(function (index) {
                    let option = $(this).find('.optionChange').val();
                    let element = $(this).closest(".ws-option-holder");
                    let image = $(element).find(".hoverShow").find("img").attr("src");
                    var jsonObject = {
                        "option": option || "",
                        "image": image || "",
                    };

                    questionOptions.push(jsonObject);
                });

            }
            var appJSON = JSON.stringify(questionOptions);
            this.model.set({ "question_options": appJSON });
            console.log(this.model);
            this.saveQuestionDetails();

        },

        AddRowOptions: function () {
            let selfobj = this;
            var source = addExtrawMultiple_temp;
            var template = _.template(source);
            let holder = $("<div>", {
                class: "ws-option-holder",
            });
            holder.append(template());
            $('.customer_records_multiple').append(holder);
        },

        Addcheckbox: function () {
            var source = addExtrawCheckbox_temp;
            var template = _.template(source);
            let holder = $("<div>", {
                class: "ws-option-holder",
            });
            holder.append(template());
            $('.customer_records_checkbox').append(holder);
        },

        AdddropDown: function () {
            var source = addExtrawDropdown_temp;
            var template = _.template(source);
            let holder = $("<div>", {
                class: "ws-option-holder",
            });
            holder.append(template());
            $('.customer_records_dropdown').append(holder);
        },

        removefield: function (e) {
            e.preventDefault();
            $(e.currentTarget).closest('.dropdownCls').remove();
            var dropdownCount = $('.dropdownCls').length;
            console.log("dropdownCount:", dropdownCount);
            if (dropdownCount === 1) {
                var addElement = document.querySelector(".removeDropdown")
                addElement.classList.add('btn-remove-customer');
            }
        },

        AddDuplicate: function () {
            let selfobj = this;
            selfobj.scanDetails.check(selfobj.model);
            // let originalElement = $(".questionView");
            // let cloneId = 'ws-even' + this.cloneCount++;
            // let clonedElement = originalElement.clone().attr('id', cloneId);
            // clonedElement.insertAfter(originalElement);
            // selfobj.model.clone()
        },

        scrollToBottom: function () {
            var div = $('.panel_overflow');
            console.log("scrollToBottom", div);
            div.scrollTop(div.prop('scrollHeight'));
        },

        addExtraQuestions: function (e) {
            t = $(e.currentTarget).closest(".row").find(".questionView").attr('id');
            st = 0;
            var template = _.template(QuestionRow_Temp);
            $(e.currentTarget).closest(".row").find(".questionView").append(template({}));
        },

        removemultiple: function (e) {
            e.preventDefault();
            $(e.currentTarget).closest('.multipleCls').remove();
            var dropdownCount = $('.multipleCls').length;
            console.log("dropdownCount:", dropdownCount);
            if (dropdownCount === 1) {
                var addElement = document.querySelector(".removeCheck")
                addElement.classList.add('btn-remove-customer');
            }
        },

        removeExtraQuestions: function (e) {
            var el = $(e.currentTarget).closest(".even");
            Swal.fire({
                title: "Delete Question",
                text: "Do you want to delete the question?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Delete',
                animation: "slide-from-top",
            }).then((result) => {
                if (result.isConfirmed) {
                    el.remove();
                    Swal.fire("Deleted!", "The question has been deleted.", "success");
                }
            });
        },
        checkBoxRemove: function (e) {
            e.preventDefault();
            $(e.currentTarget).closest('.checkboxCls').remove();
            var dropdownCount = $('.checkboxCls').length;
            console.log("dropdownCount:", dropdownCount);
            if (dropdownCount === 1) {
                var addCheckbox = document.querySelector(".removeCheckBox");
                addCheckbox.classList.add('btn-remove-customer');
            }
        },

        getSelectedFile: function (url) {
            let element = $(this.elm.currentTarget).closest(".ws-option-holder");
            $(element).find(".hoverShow").removeClass('d-none');
            $(element).find(".hoverShow").find("img").attr("src", url);
            $("#profile_pic_view").css({ "max-width": "100%" });
            $('#largeModal').modal('toggle');
            this.optionChange(this.elm);
        },

        loadMedia: function (e) {
            e.stopPropagation();
            $('#largeModal').modal('toggle');
            this.elm = e;
            new readFilesView({ loadFrom: "addpage", loadController: this });
        },

        saveQuestionDetails: function () {
            let selfobj = this;
            var id = this.model.get("question_id")
            if (id == "" || id == null) {
                var methodt = "PUT";
            } else {
                var methodt = "POST";
            }
            this.model.set({ "form_id": selfobj.form_id });
            this.model.save({}, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: methodt
            }).done(function (res) {
                if (methodt == "PUT") {
                    selfobj.model.set({ question_id: res.lastID });
                }
                console.log(selfobj.model);
            });

        },

        textdescribe: function (e) {
            let selfobj = this;
            var ID = $(e.currentTarget).attr("data-id"); //1_question
            var count = $(e.currentTarget).attr("data-count"); //1
            $(e.currentTarget).hide();
            $("." + ID).show();

            var __toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],
                ['link'],
                ['clean']
            ];
            if (!$("#" + count + "-editor").hasClass("ql-container")) {
                var editor = new Quill($("#" + count + "-editor").get(0), {
                    modules: {
                        toolbar: __toolbarOptions
                    },
                    theme: 'snow'  // or 'bubble'
                });
                editor.on('text-change', function (delta, oldDelta, source) {
                    if (source == 'api') {
                        console.log("An API call triggered this change.");
                    }
                });
                editor.on('selection-change', function (range, oldRange, source) {
                    if (range === null && oldRange !== null) {
                        $("." + ID).hide();
                        $(e.currentTarget).show();
                        $("." + ID + count).empty();
                        $("." + ID + count).append(editor.root.innerHTML);
                        selfobj.model.set({ question: editor.root.innerHTML });
                        console.log(selfobj.model);
                        selfobj.saveQuestionDetails();
                    }
                });
            }

        },

        initializeValidate: function () {
            var selfobj = this;
            var feilds = {
                form_name: {
                    required: true,
                },
                from_description: {
                    required: true,
                },
            };

            var messages = {
                form_name: "Please enter Name",
                from_description: "Please enter Descriptions",

            };
            $("#formDetails").validate({
                messages: messages,
            });
        },

        render: function () {
            var selfobj = this;
            var source = dynamicQuestion;
            var template = _.template(source);
            this.$el.html(template({ "model": this.model.attributes, count: this.count }));
            $(".questionView").append(this.$el);
            $("#" + this.toClose).show();
            $("ws-select").selectpicker();
            this.initializeValidate();
            // this.attachEvents();
            $('.ws-select').selectpicker();
            return this;
        }, onDelete: function () {
            this.remove();
        }
    });

    return questionSingleView;

});
