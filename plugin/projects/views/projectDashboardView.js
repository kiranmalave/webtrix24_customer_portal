define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'Swal',
    'moment',
    'slim',
    "../../core/models/commentModelProject",
    '../../customer/views/customerSingleView',
    '../../core/views/commentSingleView',
    '../../core/views/historySingleView',
    '../../core/views/multiselectOptions',
    '../../core/views/timeselectOptions',
    '../../dynamicForm/views/dynamicFieldRender',
    '../../category/collections/slugCollection',
    '../../task/views/taskSingleView',
    '../../task/views/taskView',
    '../views/projectNotesView',
    '../views/projectsSingleView',
    '../views/projectCompleteView',
    '../collections/projectNotesCollection',
    '../../appointment/collections/appointmentCollection',
    '../../expenses/collections/expensesCollection',
    '../../receipt/collections/receiptCollection',
    '../../taxInvoice/collections/taxInvoiceCollection',
    '../../taxInvoice/views/taxInvoiceSingleView',
    '../../expenses/views/expensesSingleView',
    '../../taxInvoice/views/quotationToInvoiceView',
    '../../receipt/views/receiptSingleView',
    '../models/projectsSingleModel',
    '../../readFiles/views/readFilesView',
    'text!../templates/projectDashboard_temp.html',
    'text!../templates/projectfinance_temp.html',
    'text!../templates/projectAppointment_temp.html',
    'text!../templates/projectsNotesGrid_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Swal, moment, slim, commentModelProject, customerSingleView, commentSingleView, historySingleView, multiselectOptions, timeselectOptions, dynamicFieldRender, slugCollection, taskSingleView, taskView, projectNotesView, projectsSingleView, projectCompleteView, projectNotesCollection, appointmentCollection, expensesCollection, receiptCollection, taxInvoiceCollection, taxInvoiceSingleView, expensesSingleView, quotationToInvoiceView, receiptSingleView, projectsSingleModel, readFilesView, dashboardTemp, projectFinance, appointmentTemp, noteTemp, completeProject) {

    var projectDashboardView = Backbone.View.extend({
        model: projectsSingleModel,
        form_label: '',
        // projectNotes:[],
        initialize: function (options) {
            var selfobj = this;
            this.form_label = options.form_label;
            this.toClose = "projectDashboardView";
            // use this valiable for dynamic fields to featch the data from server
            this.pluginName = "projectsList";
            this.menuId = options.menuId;
            this.model = new projectsSingleModel();
            this.permission = options.permissions;
            var customer = ROLE["customer"];
            this.customerMenuId = customer.menuID;
            this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
            selfobj.model.set({ menuId: options.menuId });
            // this function is called to render the dynamic view
            this.multiselectOptions = new multiselectOptions();
            this.timeselectOptions = new timeselectOptions();
            this.invoiceCollection = new taxInvoiceCollection();
            this.quotationCollection = new taxInvoiceCollection();
            this.projectNotes = new projectNotesCollection();
            this.expensesCollection = new expensesCollection();
            this.receiptCollection = new receiptCollection();
            this.appointmentCollection = new appointmentCollection();
            this.scanDetails = options.searchprojects;
            this.project_id = options.project_id;
            $(".popupLoader").show();
            this.categoryList = new slugCollection();
            this.model1 = new commentModelProject();
            // this.categoryList.fetch({
            //     headers: {
            //         'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            //     }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'project_type,project_priority,project_status' }
            // }).done(function (res) {
            //     if (res.flag == "F") {
            //         showResponse('', res, '');
            //     }
            //     if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            //     $(".popupLoader").hide();
            //     $('body').find(".loder").hide();
            // });
            if (options.project_id != "") {
                this.model.set({ project_id: options.project_id });
                this.model.fetch({
                    headers: {
                        'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, data: { menuId: selfobj.model.get("menuId") }, error: selfobj.onErrorHandler
                }).done(function (res) {
                    if (res.flag == "F")
                        showResponse('', res, '');
                    var startDate = selfobj.model.get("start_date");
                    var end_date = selfobj.model.get("end_date");
                    if (startDate != null && startDate != "0000-00-00") {
                        selfobj.model.set({ "start_date": selfobj.timeselectOptions.changeTimeFormat(startDate) });
                    }
                    if (end_date != null && end_date != "0000-00-00") {
                        selfobj.model.set({ "end_date": selfobj.timeselectOptions.changeTimeFormat(end_date) });
                    }
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    $(".popupLoader").hide();
                    selfobj.dynamicFieldRenderobj.prepareForm();

                    selfobj.render();
                    //selfobj.getCommentList();
                });
            }
        },

        getCommentList: function () {
            this.commentSingleView = new commentSingleView({type:"project",appendto:this.$("#projectComments"),record_id: this.project_id, searchComment: this, loadFrom: 'project' });
        },

        events:
        {
            "click .saveProjectsDetails": "saveProjectsDetails",
            "click .item-container li": "setValues",
            "blur .txtchange": "updateOtherDetails",
            "change .multiSel": "setValues",
            "click .multiOptionSel": "multioption",
            "change .dropval": "updateOtherDetails",
            "blur .multiselectOpt": "updatemultiSelDetails",
            "input .custChange": "getcustomers",
            "click .selectCustomer": "setCustomer",
            "click .completeProject": "completeProject",
            "click .loadmodule": "loadmodule",
            "click .loadSubView": "loadSubView",
            "blur .editField": "editField",
            "click .editDate": "editField",
            "click .comment-box": "showCommentBox",
            "click .cancelPost": "cancelPost",
            "click .navModuleLoad": "navModuleLoad",
            "click .savetaskComment": "saveComment",
            "click .deleteProjectNote": "deleteNote",
        },

        onErrorHandler: function (collection, response, options) {
            Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
            $(".profile-loader").hide();
        },

        editField: function (e) {
            let selfobj = this;
            var action = $(e.currentTarget).attr('data-action');
            if (action == 'date') {
                $(e.currentTarget).hide();
                $('.dateTitle').hide();
                $('.dateProgressBar').hide();
                $('.dateList').show();
                $('.dateList').parent().removeClass('col');
            } else {
                var valuetxt = $(e.currentTarget).text();
                var toName = action;
                var newdetails = {};
                newdetails[toName] = valuetxt;
                selfobj.model.set(newdetails);
                selfobj.saveModel();
            }
        },

        showCommentBox: function (e) {
            let selfobj = this;
            $(e.currentTarget).hide();
            $(".commentEditor").show();
            $(".comment-editor").show();
            let element = document.querySelector(".buttonHide");
            element.classList.add('showButton');
            var __toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'direction': 'rtl' }],                         // text direction
                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'align': [] }],
                ['link'],
                ['clean']                                         // remove formatting button
            ];

            if (!$(".comment-editor").hasClass("ql-container")) {
                var editor = new Quill($("#projectComment").get(0), {
                    modules: {
                        toolbar: __toolbarOptions,
                        mention: {
                            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
                            mentionDenotationChars: ["@", "#"],
                            source: function (searchTerm, renderList, mentionChar) {
                                let values;
                                if (mentionChar === "@") {
                                    values = selfobj.atValues;
                                } else {
                                    values = selfobj.atValues;
                                }

                                if (searchTerm.length === 0) {
                                    renderList(values, searchTerm);
                                } else {
                                    const matches = [];
                                    for (let i = 0; i < values.length; i++)
                                        if (
                                            ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                                        )
                                            matches.push(values[i]);
                                    renderList(matches, searchTerm);
                                }
                            }
                        }
                    },
                    theme: 'snow'  // or 'bubble'
                });

                editor.on('text-change', function (delta, oldDelta, source) {
                    if (source == 'api') {
                        console.log("An API call triggered this change.");
                    } else if (source == 'user') {
                        var delta = editor.getContents();
                        var text = editor.getText();
                        var justHtml = editor.root.innerHTML;
                        selfobj.model1.set({ "comment_text": justHtml });
                        if (text.length != 1) {
                            $(".savetaskComment").prop('disabled', false);
                        } else {
                            $(".savetaskComment").prop('disabled', true);
                        }
                    }
                });
            }
        },
        loadSubView: function (e) {
            var selfobj = this;
            var show = $(e.currentTarget).attr("data-view");
            $(".loder").show();
            switch (show) {
                case "singlereceiptData": {
                    var receiptMenuId = ROLE['receipts'];
                    receiptMenuId = receiptMenuId.menuID;
                    var receipt_id = $(e.currentTarget).attr("data-receipt_id");
                    if (receipt_id != "" && receipt_id != null && receipt_id != undefined) {
                        if (selfobj.permission.edit != "yes") {
                            Swal.fire("You don't have permission to edit", '', 'error');
                            return false;
                        } else {
                            new receiptSingleView({ receipt_id: receipt_id, searchreceipt: this, menuId: receiptMenuId, loadFrom: "project", form_label: "Revenue", menuName: 'receipts' });
                            // new receiptSingleView({ receipt_id: receipt_id, searchreceipt: this, menuId:this.menuId,form_label:selfobj.form_label});
                            $(".loder").hide();
                        }
                    }
                    break;
                }
                case "singletaxInvoiceData": {
                    var invoiceMenuId = ROLE['invoice'];
                    invoiceMenuId = invoiceMenuId.menuID;
                    var invoiceID = $(e.currentTarget).attr("data-invoiceID");
                    new taxInvoiceSingleView({ invoiceID: invoiceID, menuId: invoiceMenuId, searchtaxInvoice: this, loadFrom: "project", form_label: "Invoice", menuName: 'invoice' });
                    break;
                }
                case "singletaxQuotationData": {
                    var quotationMenuId = ROLE['quotation'];
                    quotationMenuId = quotationMenuId.menuID;
                    var invoiceID = $(e.currentTarget).attr("data-invoiceID");
                    new taxInvoiceSingleView({ invoiceID: invoiceID, menuId: quotationMenuId, searchtaxInvoice: this, loadFrom: "project", form_label: "Quotation", menuName: 'quotation' });
                    break;
                }
                case "singleExpenseData": {
                    var expemseMenuId = ROLE['expences'];
                    expemseMenuId = expemseMenuId.menuID;
                    var expense_type = 'general';
                    var expenses_id = $(e.currentTarget).attr("data-expenses_id");
                    if (expenses_id != "" && expenses_id != null && expenses_id != undefined) {
                        new expensesSingleView({ expenses_id: expenses_id, searchexpenses: this,revenueType: expense_type,loadFrom: "project", menuId: expemseMenuId,form_label: "Expense",menuName: 'expences'});
                    }
                }
            }
        },

        deleteNote: function (e) {
            e.stopPropagation();
            let selfobj = this;
            if (selfobj.permission.delete != "yes") {
                Swal.fire("You don't have permission to Delete", '', 'error');
                  return false;
            }else{
                Swal.fire({
                    title: 'Are you sure you want to delete this note? This action cannot be undone.',
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'Yes',
                    denyButtonText: `No`,
                  }).then((result) => {
                    if (result.isConfirmed) {
                    Swal.fire('Deleted!', '', 'success')
                    var action = "delete";
                    var id = $(e.currentTarget).attr("data-id");
                    if (id != "" && id != null) {
                      $.ajax({
                        url: APIPATH + 'projectNote/delete',
                        method: 'POST',
                        data: { id: id, action: action },
                        datatype: 'JSON',
                        beforeSend: function (request) {
                          request.setRequestHeader("token", $.cookie('_bb_key'));
                          request.setRequestHeader("SadminID", $.cookie('authid'));
                          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                          request.setRequestHeader("Accept", 'application/json');
                        },
                        success: function (res) {
                          if (res.flag == "F")
                            showResponse(e,res,'');
            
                          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                          if (res.flag == "S") {
                            selfobj.model.clear().set(selfobj.model.defaults);
                            $("#title").val("");
                            selfobj.getprojectNotes();
                          }
                        }
                      });
                    }
                  } else if (result.isDenied) {
                    Swal.fire('Changes are not saved', '', 'info')
                  }
                })
            }
          },

        saveComment: function (e) {
            e.preventDefault();
            let selfobj = this;
            let isNew = $(e.currentTarget).attr("data-action");
            var dataSele = [];
            let projectID = selfobj.model.get("project_id");

            var spanElements = $('#comment .ql-editor p span');
            spanElements.each(function () {
                if ($(this).attr('data-id') != undefined) {
                    dataSele.push($(this).attr('data-id'));
                }
            });
            selfobj.model1.set({ "mentions": dataSele });
            selfobj.model1.set({ "project_id": projectID });
            if (isNew == "cpost") {
                var methodt = "POST";
            } else {
                var methodt = "PUT";
            }
            this.model1.save({}, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: methodt,
            }).done(function (res) {
                if (res.flag == "F") {
                    showResponse(e, res, '');
                }
                if (res.flag == "S") {
                    selfobj.getCommentList();
                }
            });
        },

        cancelPost: function (e) {
            var quill = new Quill('#projectComment');
            quill.setText('');
            $(".comment-box").show();
            $(".commentEditor").hide();
            let element = document.querySelector(".buttonHide");
            element.classList.remove('showButton');
        },

        navModuleLoad: function (e) {
            let selfobj = this;
            var action = $(e.currentTarget).attr('data-action');
            var projectID = this.model.get('project_id');
            switch (action) {
                case 'task':
                    this.taskView = new taskView({ appendto:selfobj.$("#projectTask"),loadfrom: "project", searchtask: this, menuName: 'task', project_id: projectID });
                    break;
                case 'finance':
                    selfobj.getFinenceDetails();
                    break;
                case 'events':
                    selfobj.getAppointmentDetails();
                    break;
                case 'notes':
                    selfobj.getprojectNotes();
                    break;
                default:
                    break;
            }
        },

        loadmodule: function (e) {
            e.stopPropagation();
            let selfobj = this;
            var action = $(e.currentTarget).attr('data-action');
            var projectID = this.model.get('project_id');
            var customerID = this.model.get('customer_id');
            var customerName = this.model.get('customerName');
            switch (action) {
                case 'task':
                    this.taskSingleView = new taskSingleView({customer_id: customerID, customerName: customerName, loadFrom: "project", project_id: projectID, searchtask: this, menuName: 'task' });
                    break;
                case 'invoice':
                    new taxInvoiceSingleView({ searchtaxInvoice: this, loadFrom: "project", form_label: "Invoice", menuName: 'invoice', project_id: projectID, customer_id: customerID });
                    break;
                case 'expenses':
                    var expense_type = $(e.currentTarget).attr('data-expense_type');
                    console.log('expense_type : ', expense_type);
                    if (expense_type == 'expected') {
                        new expensesSingleView({ searchexpenses: this, loadFrom: "project", revenueType: expense_type, related_to: 'project', form_label: "Expected Expense", menuName: 'expences', project_id: projectID, customer_id: customerID });
                    } else {
                        new expensesSingleView({ searchexpenses: this, loadFrom: "project", revenueType: expense_type, related_to: 'project', form_label: "Expense", menuName: 'expences', project_id: projectID, customer_id: customerID });
                    }
                    // new expensesSingleView({searchexpenses: this, loadFrom: "project", form_label: "Expenses", menuName: 'expences', project_id: projectID, customer_id: customerID});
                    break;
                case 'qutation':
                    new taxInvoiceSingleView({ searchtaxInvoice: this, loadFrom: "project", form_label: "Quotation", menuName: 'quotation', project_id: projectID, customer_id: customerID });
                    break;
                case 'revenues':
                    var revenueType = $(e.currentTarget).attr('data-revenue_type');
                    if (revenueType == 'expected') {
                        new receiptSingleView({ searchreceipt: this, loadFrom: "project", revenueType: revenueType, related_to: 'project', form_label: "Expected Revenue", menuName: 'receipts', project_id: projectID, customer_id: customerID });
                    } else {
                        new receiptSingleView({ searchreceipt: this, loadFrom: "project", revenueType: revenueType, related_to: 'project', form_label: "Revenue", menuName: 'receipts', project_id: projectID, customer_id: customerID });
                    }
                    break;
                case 'singleHistoryData':
                    $(".showComment").hide();
                    $('.showHistory').show();
                    $('#navScrollHistory').addClass('active');
                    $('#navScrollComment').removeClass('active');
                    this.historySingleView = new historySingleView({ appendto:this.$(".showHistory"),loadFrom: 'project',record_id:projectID, type: 'project' });
                    break;
                case 'singleCommentData':
                    $('.showHistory').hide();
                    $(".showComment").show();
                    $('#navScrollComment').addClass('active');
                    $('#navScrollHistory').removeClass('active');
                    this.getCommentList();
                    //this.commentSingleView = new commentSingleView({ loadFrom: 'project', project_id: projectID, searchComment: this });
                    break;
                case "singlecustomerview":
                    var customer_id = $(e.currentTarget).attr("data-customer_id");
                    new customerSingleView({ customer_id: customer_id, loadfrom: "project", searchCustomer: this, form_label: "Customer" });
                    break;
                case "notes":
                    $('#NoteModal').modal('toggle');
                    let noteID = $(e.currentTarget).attr("data-noteID");
                    new projectNotesView({ project_id: projectID, searchProjectNotes: this, note_id: noteID });
                    break;
                case "singleprojectview":
                    new projectsSingleView({project_id:projectID, menuId:this.menuId,form_label:"Project", loadfrom:"project", searchprojects: selfobj});
                    break;
                default:
                    break;
            }
        },

        getprojectNotes: function () {
            $('body').find(".loder").show();
            let selfobj = this;
            var source = noteTemp;
            var template = _.template(source);
        
            let notesPromise = this.projectNotes.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 
                    'SadminID': $.cookie('authid'), 
                    'token': $.cookie('_bb_key'), 
                    'Accept': 'application/json'
                }, 
                error: selfobj.onErrorHandler, 
                type: 'post', 
                data: { project_id: selfobj.project_id, record_type: 'project' }
            }).done(function (res) {
                if (res.flag == "F") {
                    showResponse('', res, '');
                }
                if (res.statusCode == 994) { 
                    app_router.navigate("logout", { trigger: true }); 
                }
                $(".popupLoader").hide();
                $('body').find(".loder").hide();
            });
        
            // Wait for all collections to be fetched
            Promise.all([notesPromise]).then(function () {
                // Iterate and change the format of created_date for each model
                let updatedNotes = selfobj.projectNotes.models.map(function(model) {
                    let noteData = model.toJSON();
                    // Assuming `created_date` is in a known format (e.g., 'YYYY-MM-DD HH:mm:ss')
                    let createdDate = selfobj.timeselectOptions.changeTimeFormat(noteData.created_date)
                    // Format the date as needed, e.g., 'MM/DD/YYYY'
                    let formattedDate = createdDate;
                    noteData.created_date = formattedDate;
                    return noteData;
                });
                // Render the template with the updated notes
                var templ = template({
                    "projectNotes": updatedNotes,
                });
        
                // Update the DOM
                $("#projectsNotes").empty();
                $("#projectsNotes").append(templ);
                
                if(selfobj.projectNotes.length > 0){
                    $('#noNotesAdded').hide();
                    $('#notesMainDiv').show();
                }
            }).catch(function(err) {
                console.error("Error fetching collections:", err);
            });
        },
        

        getFinenceDetails: function () {
            let selfobj = this;
            var source = projectFinance;
            var template = _.template(source);

            // Fetch all the collections
            let invoicePromise = this.invoiceCollection.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                },
                error: selfobj.onErrorHandler,
                type: 'post',
                data: { record_type: "invoice", getAll: 'Y', project_id: selfobj.project_id }
            });

            let quotationPromise = this.quotationCollection.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                },
                error: selfobj.onErrorHandler,
                type: 'post',
                data: { record_type: "quotation", getAll: 'Y', project_id: selfobj.project_id }
            });

            let expensesPromise = this.expensesCollection.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                },
                error: selfobj.onErrorHandler,
                type: 'post',
                data: { getAll: 'Y', project_id: selfobj.project_id }
            });
            let receiptPromise = this.receiptCollection.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                },
                error: selfobj.onErrorHandler,
                type: 'post',
                data: { getAll: 'Y', project_id: selfobj.project_id }
            });

            let expectedIncomePromise = $.ajax({
                url: APIPATH + 'getExpectedIncomeList/',
                method: 'GET',
                data: { customer_id: selfobj.model.get('customer_id'), record_type: 'revenue' ,project_id: selfobj.project_id},
                datatype: 'JSON',
                beforeSend: function (request) {
                    request.setRequestHeader("token", $.cookie('_bb_key'));
                    request.setRequestHeader("SadminID", $.cookie('authid'));
                    request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                    request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                    if (res.flag == 'S' && res.data != []) {
                        selfobj.expectedIncomeList = res.data;
                    }
                },
                error: function (err) {
                    console.error('Error fetching expected income list:', err);
                }
            });

            let expectedExpensePromise = $.ajax({
                url: APIPATH + 'getExpectedExpenseList/',
                method: 'GET',
                data: { project_id: selfobj.project_id, record_type: 'expenses' },
                datatype: 'JSON',
                beforeSend: function (request) {
                    request.setRequestHeader("token", $.cookie('_bb_key'));
                    request.setRequestHeader("SadminID", $.cookie('authid'));
                    request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                    request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                    if (res.flag == 'S' && res.data != []) {
                        selfobj.expectedExpenseList = res.data;
                    }
                },
                error: function (err) {
                    console.error('Error fetching expected expense list:', err);
                }
            });

            Promise.all([invoicePromise, quotationPromise, expensesPromise, receiptPromise, expectedIncomePromise, expectedExpensePromise]).then(function () {
                var templ = template({
                    "expensesList": selfobj.expensesCollection.models,
                    "invoiceList": selfobj.invoiceCollection.models,
                    "quotation": selfobj.quotationCollection.models,
                    "receipts": selfobj.receiptCollection.models,
                    "expectedIncomeList": selfobj.expectedIncomeList,
                    "expectedExpenseList": selfobj.expectedExpenseList,
                });
                $("#projectFinance").empty();
                $("#projectFinance").append(templ);
                selfobj.$el.addClass("tab-pane in active panel_overflow");
                selfobj.$el.attr("id", this.toClose);
                selfobj.$el.addClass(this.toClose);
                selfobj.$el.data("role", "tabpanel");
                $('.navModuleLoad[data-action="finance"] a').addClass('active');
            }).catch(function (err) {
                console.error("Error fetching collections:", err);
            });
        },

        getAppointmentDetails: function () {
            let selfobj = this;
            var source = appointmentTemp;  // Your Underscore template
            var template = _.template(source);

            // Fetch the appointments
            let appointmentPromise = this.appointmentCollection.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded',
                    'SadminID': $.cookie('authid'),
                    'token': $.cookie('_bb_key'),
                    'Accept': 'application/json'
                },
                error: selfobj.onErrorHandler,
                type: 'post',
                data: { getAll: 'Y', project_id: selfobj.project_id }
            });

            // Wait for the promise to resolve
            Promise.all([appointmentPromise]).then(function () {
                // Split the appointments into categories: Today, Upcoming, and Past
                let today = new Date();
                today.setHours(0, 0, 0, 0);  // Set to start of the day for comparison

                let todayList = [];
                let upcomingList = [];
                let pastList = [];

                // Iterate over appointments and categorize
                selfobj.appointmentCollection.models.forEach(function (appointment) {
                    let startDate = new Date(appointment.attributes.start_date);
                    startDate.setHours(0, 0, 0, 0);  // Normalize for date-only comparison

                    if (startDate.getTime() === today.getTime()) {
                        todayList.push(appointment);
                    } else if (startDate > today) {
                        upcomingList.push(appointment);
                    } else {
                        pastList.push(appointment);
                    }
                });

                // Render the categorized data into the template
                var templ = template({
                    "todayList": todayList,
                    "upcomingList": upcomingList,
                    "pastList": pastList
                });

                // Update the DOM
                $("#projectAppointment").empty();
                $("#projectAppointment").append(templ);
            }).catch(function (err) {
                console.error("Error fetching collections:", err);
            });
        },

        completeProject: function (e) {
            e.stopPropagation();
            let selfobj = this;
            var projectID = $(e.currentTarget).attr("data-project");
            $('#completeProjectModal').modal('toggle');
            new projectCompleteView({project_id: projectID, menuID : selfobj.menuId, searchproject: selfobj})
        },

        updateOtherDetails: function (e) {
            let selfobj = this;
            var valuetxt = $(e.currentTarget).val();
            var toName = $(e.currentTarget).attr("id");
            if (toName == 'title') {
                $('.getTitle').hide();
                $('.editField').show();
            } else if (toName == 'description') {
                $('.getDesc').hide();
                $('.editField').show();
            } else if (toName == 'expected_revenue') {
                $('.getRevenue').hide();
                $('.editField').show();
            } else if (toName == 'expected_expences') {
                $('.getExpenses').hide();
                $('.editField').show();
            } else if (toName == "start_date" || toName == "end_date") {
                $('.dateList').hide();
                $('.editField').show();
                $('.dateProgressBar').show();
            }
            var newdetails = [];
            newdetails["" + toName] = valuetxt;
            this.model.set(newdetails);
            selfobj.saveModel();
        },

        saveModel: function () {
            let selfobj = this;

            this.model.save({}, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'POST'
            }).done(function (res) {
                if (res.flag == "F") {
                    showResponse('', res, '');
                }
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                    selfobj.refresh();
                    // selfobj.render();
                    // selfobj.scanDetails.filterSearch();
                }
            });
        },

        refresh: function () {
            let selfobj = this;
            this.model.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, data: { menuId: selfobj.model.get("menuId") }, error: selfobj.onErrorHandler
            }).done(function (res) {
                if (res.flag == "F")
                    showResponse('', res, '');
                var startDate = selfobj.model.get("start_date");
                var end_date = selfobj.model.get("end_date");
                if (startDate != null && startDate != "0000-00-00") {
                    selfobj.model.set({ "start_date": selfobj.timeselectOptions.changeTimeFormat(startDate) });
                }
                if (end_date != null && end_date != "0000-00-00") {
                    selfobj.model.set({ "end_date": selfobj.timeselectOptions.changeTimeFormat(end_date) });
                }
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".popupLoader").hide();
                selfobj.dynamicFieldRenderobj.prepareForm();
                selfobj.scanDetails.filterSearch();
                selfobj.render();
            });
        },

        updatemultiSelDetails: function (e) {
            var valuetxt = $(e.currentTarget).val();
            var toName = $(e.currentTarget).attr("id");
            var existingValues = this.model.get(toName);
            if (existingValues === null || existingValues === undefined) {
                existingValues = '';
            } else if (typeof existingValues !== 'string') {
                existingValues = existingValues.toString();
            }
            existingValues = existingValues.replace(/NULL/ig, '');
            existingValues = existingValues.replace(/^,|,$/g, '');
            if ($(e.currentTarget).prop('checked')) {
                if (existingValues.indexOf(valuetxt) === -1) {
                    existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
                }
            } else {
                existingValues = existingValues.split(',').filter(value => value !== valuetxt).join(',');
            }
            this.model.set({ [toName]: existingValues });
        },

        selectOnlyThis: function (e) {
            var clickedCheckbox = e.currentTarget;
            var valueTxt = $(clickedCheckbox).val();
            var toName = $(clickedCheckbox).attr("name");
            this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
            var existingData = this.model.get(toName);
            this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
        },
        updateImage: function (e) {
            var ob = this;
            var toID = $(e.currentTarget).attr("id");
            var newdetails = [];
            var reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("output").src = e.target.result;
                newdetails["" + toID] = reader.result;
                ob.model.set(newdetails);
            };
            reader.readAsDataURL(e.currentTarget.files[0]);

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

        saveProjectsDetails: function (e) {
            e.preventDefault();
            let selfobj = this;
            var project_id = this.model.get("project_id");
            let isNew = $(e.currentTarget).attr("data-action");
            var methodt = '';
            if (project_id == "" || project_id == null || typeof (project_id) == undefined) {
                methodt = "PUT";
            } else {
                methodt = "POST";
            }
            if ($("#projectDetails").valid()) {
                $(e.currentTarget).html("<span>Saving..</span>");
                $(e.currentTarget).attr("disabled", "disabled");
                this.model.save({}, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: methodt
                }).done(function (res) {
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    if (isNew == "new") {
                        showResponse(e, res, "Save & New");
                    } else {
                        showResponse(e, res, "Save");
                    }
                    selfobj.scanDetails.filterSearch();
                    if (res.flag == "S") {
                        if (isNew == "new") {
                            selfobj.model.clear().set(selfobj.model.defaults);
                            selfobj.model.set({ menuId: selfobj.menuId });
                            selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                            selfobj.render();
                        } else {
                            handelClose(selfobj.toClose);
                        }
                    }
                });
            }
        },

        getcustomers: function (e) {
            var name = $(e.currentTarget).val();
            var dropdownContainer = $("#customerDropdown");
            var table = "customer";
            var where = "name";
            var type = "customer";
            var list = "customer_id, name, record_type";
            if (name != "") {
                $.ajax({
                    url: APIPATH + 'getCustomerList/',
                    method: 'POST',
                    data: { text: name, tableName: table, type: type, wherec: where, list: list },
                    datatype: 'JSON',
                    beforeSend: function (request) {
                        $(".textLoader").show();
                        request.setRequestHeader("token", $.cookie('_bb_key'));
                        request.setRequestHeader("SadminID", $.cookie('authid'));
                        request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                        request.setRequestHeader("Accept", 'application/json');
                    },
                    success: function (res) {
                        if (res.flag == "F") {
                            showResponse('', res, '');
                        }
                        $(".textLoader").hide();
                        dropdownContainer.empty();
                        if (res.msg === "sucess") {

                            if (res.data.length > 0) {
                                $.each(res.data, function (index, value) {
                                    dropdownContainer.append('<div class="dropdown-item selectCustomer" style="background-color: #ffffff;" data-customerID=' + value.customer_id + '>' + value.name + '</div>');
                                });
                                dropdownContainer.show();
                            }
                        } else {
                            dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "customer" style="background-color: #5D60A6; color:#ffffff;" > Add New Customer </div>');
                            dropdownContainer.show();
                        }
                    }
                });
            } else {
                dropdownContainer.hide();
            }
            if (!$(e.currentTarget).is(':focus')) {
                dropdownContainer.hide();
            }
        },

        setCustomer: function (e) {
            let selfobj = this;
            if (selfobj.loadFrom == 'customer') {
                var Name = selfobj.customerName;
                var customerID = selfobj.customerID;
                selfobj.model.set({ "customerName": Name });
                selfobj.model.set({ "customer_id": customerID });
            } else {
                var Name = $(e.currentTarget).text();
                var customerID = $(e.currentTarget).attr('data-customerID');
                selfobj.model.set({ "customer_id": customerID });
                $("#customerDropdown").hide();
            }
            $('#customer_id').val(Name);
        },

        getFinancialDetails: function () {
            var expRevenue = this.model.get("expected_revenue");
            var totalIncome = this.model.get("invoiceAmount");
            var incomePercentage = (totalIncome / expRevenue) * 100;
            if (incomePercentage) {
                if (incomePercentage != "Infinity") {
                    $('#incomeProgressBar').css('width', incomePercentage + '%');
                    $('#incomePercentage').text(Math.round(incomePercentage) + '%');
                    // Set the progress bar color based on percentage
                    if (incomePercentage <= 30) {
                        $('#incomeProgressBar').css('background-color', 'red');
                    } else if (incomePercentage > 30 && incomePercentage <= 60) {
                        $('#incomeProgressBar').css('background-color', 'orange');
                    } else {
                        $('#incomeProgressBar').css('background-color', 'green');
                    }
                } else {
                    $('#incomeProgressBar').css('width', '0%');
                    $('#incomePercentage').text('0%');
                }
            } else {
                $('#incomeProgressBar').css('width', '0%');
                $('#incomePercentage').text('0%');
            }

            var expExpense = this.model.get("expected_expences");
            var totalexpense = this.model.get("expenseAmount");
            var expensePercentage = (totalexpense / expExpense) * 100;
            if (expensePercentage) {
                if (expensePercentage != "Infinity") {
                    $('#expenseProgressBar').css('width', expensePercentage + '%');
                    $('#expensePercentage').text(Math.round(expensePercentage) + '%');
                    // Set the progress bar color based on percentage
                    if (expensePercentage <= 30) {
                        $('#expenseProgressBar').css('background-color', 'red');
                    } else if (expensePercentage > 30 && expensePercentage <= 60) {
                        $('#expenseProgressBar').css('background-color', 'orange');
                    } else {
                        $('#expenseProgressBar').css('background-color', 'green');
                    }
                } else {
                    $('#expenseProgressBar').css('width', '0%');
                    $('#expensePercentage').text('0%');
                }
            } else {
                $('#expenseProgressBar').css('width', '0%');
                $('#expensePercentage').text('0%');
            }

            var taskCompleteCount = this.model.get("taskCompleteCount");
            var totaltask = this.model.get("taskCount");
            var taskPercentage = (totaltask / taskCompleteCount) * 100;
            if (taskPercentage) {
                if (taskPercentage != "Infinity") {
                    $('#taskProggressBar').css('width', taskPercentage + '%');
                    $('#taskPercentage').text(Math.round(taskPercentage) + '%');
                    // Set the progress bar color based on percentage
                    if (taskPercentage <= 30) {
                        $('#taskProggressBar').css('background-color', 'red');
                    } else if (taskPercentage > 30 && taskPercentage <= 60) {
                        $('#taskProggressBar').css('background-color', 'orange');
                    } else {
                        $('#taskProggressBar').css('background-color', 'green');
                    }
                } else {
                    $('#taskProggressBar').css('width', '0%');
                    $('#taskPercentage').text('0%');
                }
            } else {
                $('#taskProggressBar').css('width', '0%');
                $('#taskPercentage').text('0%');
            }

            var startDate = this.model.get("start_date");
            var endDate = this.model.get("end_date");
            var now = new Date();
            // Parse the dates
            var start = this.parseDate(startDate);
            var end = this.parseDate(endDate);
            var totalTime = end - start;
            var elapsedTime = now - start;
            var datePercentage = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);

            if (datePercentage) {
                $('#dateProggressBar').css('width', datePercentage + '%');
                $('#datePercentage').text(Math.round(datePercentage) + '%');
                // Set the progress bar color based on percentage
                if (datePercentage <= 30) {
                    $('#dateProggressBar').css('background-color', 'red');
                } else if (datePercentage > 30 && datePercentage <= 60) {
                    $('#dateProggressBar').css('background-color', 'orange');
                } else {
                    $('#dateProggressBar').css('background-color', 'green');
                }
            } else {
                $('#dateProggressBar').css('width', '0%');
                $('#datePercentage').text('0%');
            }
        },
        parseDate: function (dateString) {
            if (dateString) {
                var cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
                return new Date(cleanedDateString);
            }
        },

        initializeValidate: function () {
            var selfobj = this;
            var feilds = {
                title: {
                    required: true,
                },
            };
            var feildsrules = feilds;
            var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

            if (!_.isEmpty(dynamicRules)) {
                var feildsrules = $.extend({}, feilds, dynamicRules);

            }
            var messages = {
                title: "Please enter Title",
            };
            $("#projectDetails").validate({
                rules: feildsrules,
                messages: messages
            });

            startDate = $('#project_start_date').datepickerBT({
                format: "dd-mm-yyyy",
                todayBtn: "linked",
                clearBtn: true,
                todayHighlight: true,
                StartDate: new Date(),
                numberOfMonths: 1,
                autoclose: true,
            }).on('changeDate', function (ev) {
                $('#project_start_date').change();
                var valuetxt = $("#project_start_date").val();
                var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
                var valuetxt2 = $("#project_end_date").val();
                var temp2 = moment(valuetxt2, 'DD-MM-YYYY').valueOf();
                if (temp > temp2) {
                    $("#project_end_date").val("");
                    return
                }
                setTimeout(function () {
                    selfobj.model.set({ "start_date": valuetxt });
                    selfobj.saveModel();
                }, 150);

            });
            endDate = $('#project_end_date').datepickerBT({
                format: "dd-mm-yyyy",
                todayBtn: "linked",
                clearBtn: true,
                todayHighlight: true,
                numberOfMonths: 1,
                autoclose: true,
            }).on('changeDate', function (ev) {
                $('#project_end_date').change();
                var valuetxt = $("#project_end_date").val();
                var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
                var valuetxt2 = $("#project_start_date").val();
                var temp2 = moment(valuetxt2, 'DD-MM-YYYY').valueOf();

                if (temp2 > temp) {
                    $("#project_start_date").val("");
                    return
                }
                setTimeout(function () {
                    selfobj.model.set({ "end_date": valuetxt });
                    selfobj.saveModel();
                }, 150);
            });
        },

        render: function () {
            var selfobj = this;
            this.undelegateEvents();
            var source = dashboardTemp;
            var template = _.template(source);
            $("#" + this.toClose).remove();
            this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models }));
            this.$el.addClass("tab-pane in active panel_overflow");
            this.$el.attr('id', this.toClose);
            this.$el.addClass(this.toClose);
            this.$el.data("role", "tabpanel");
            this.$el.data("current", "yes");
            $(".ws-tab").append(this.$el);
            $('#' + this.toClose).show();
            $('#' + this.toClose).parent().addClass('p-0');
            $('.overlay-main-container').addClass('invoice');
            $(".ws-select").selectpicker("refresh");
            $(".ws-select").selectpicker();
            // this is used to append the dynamic form in the single view html
            $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
            // Do call this function from dynamic module it self.
            this.initializeValidate();
            this.setOldValues();
            this.getFinancialDetails();
            this.getCommentList();
            rearrageOverlays(selfobj.form_label, this.toClose);
            var slim = $('.slim').slim();
            // Listen for the Slim's onUpload event
            slim.on('slim.upload', function (e, data) {
                // Handle onUpload event here
                console.log('Image has been uploaded.');
                console.log('Uploaded data:', data); // Data contains information about the uploaded image
            });
            $('#owl-carousel').owlCarousel({
                margin: 10,
                loop: true,
                nav: false,
                item: 4,
            })
            $('#clientProjectProfilePic').slim({
                ratio: '1:1',
                minSize: {
                    width: 100,
                    height: 100,
                },
                size: {
                    width: 100,
                    height: 100,
                },
                push: true,
                rotateButton: true,
                service: APIPATH + 'changeClientPic/' + this.customerID,
                download: false,
                willSave: function (data, ready) {
                    //alert('saving!');
                    ready(data);
                },

                didUpload: function (error, data, response) {
                    var expDate = new Date();
                    $(".overlap").css("display", "block");
                    var newimage = $("#profilepic").find('img').attr("src");
                    var fileName = response.newFileName
                    $.cookie('photo', fileName);
                    $.cookie('avtar', newimage, { path: COKI, expires: expDate });
                    $("#myAccountRight").css("background-image", "url('" + newimage + "')");
                },
                willTransform: function (data, ready) {
                    if ($("#profilepic").hasClass("pending")) {
                        $(".overlap").css("display", "block");
                    } else {
                        var expDate = new Date();
                        var newimage = $("#profilepic").find('img').attr("src");
                        $.cookie('avtar', newimage, { path: COKI, expires: expDate });
                        $("#myAccountRight").css("background-image", "url('" + newimage + "')");
                    }
                    ready(data);
                },
                willRemove: function (data, remove) {
                    remove();
                    var memberID = selfobj.customerID;
                    console.log(selfobj.customerID);
                    $.ajax({
                        url: APIPATH + 'delClientPic/' + memberID,
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

                            if (res.statusCode == 994) { app_router.navigate("bareback-logout", { trigger: true }); }
                        }
                    });
                    remove();
                },
                label: 'Click here to add new image or Drop your image here.',
                buttonConfirmLabel: 'Ok',
                meta: {
                    memberID: selfobj.customerID
                }
            });
            $('.nav-item[data-action="basic"] a').addClass('active');
            $('#navScrollComment').addClass('active');
            this.delegateEvents();
            return this;
        },
        onDelete: function () {
            this.remove();
        }
    });

    return projectDashboardView;

});
