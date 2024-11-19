define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  'RealTimeUpload',
  'Swal',
  '../../core/views/multiselectOptions',
  '../../category/views/categorySingleView',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/ticketCollection',
  '../../category/collections/slugCollection',
  "../../customer/collections/customerCollection",
  '../models/ticketSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/ticketSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, RealTimeUpload, Swal, multiselectOptions, categorySingleView, dynamicFieldRender, ticketCollection, slugCollection, customerCollection, ticketSingleModel, readFilesView, tickettemp) {

  var ticketSingleView = Backbone.View.extend({
    model: ticketSingleModel,
    attachedDocURLArray: [],
    form_label: '',
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "ticketSingleView";
      this.form_label = options.form_label;
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "ticketList";
      this.menuId = options.menuId;
      this.model = new ticketSingleModel();
      console.log(options);
      var selfobj = this;
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchticket;
      $(".popupLoader").show();
      var ticketList = new ticketCollection();
      ticketList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("ticketList", res.data);
        selfobj.render();
      });

      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'ticket_type,ticket_category,ticket_priority' }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      this.customerList = new customerCollection();
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active", is_approver: "yes" }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popuploader").hide();
        selfobj.render();
      });

      if (options.ticket_id != "") {
        this.model.set({ ticket_id: options.ticket_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          var expenseDate = selfobj.model.get("expense_date");
          if (expenseDate != null && expenseDate != "0000-00-00") {
            selfobj.model.set({ "expense_date": moment(expenseDate).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.model.set({ menuId: selfobj.menuId });
          selfobj.render();
        });
        console.log(this.model);
      }
    },
    events:
    {
      "click .saveticketDetails": "saveticketDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "click .multiOptionSel": "multioption",
      "change .dropval": "updateOtherDetails",
      "click .loadMedia": "loadMedia",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "change .claimReimburs": "claimReimburs",
      "input .custChange": "getcustomers",
      "click .selectCustomer": "setCustomer",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveticketDetails', this.saveticketDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveticketDetails', this.saveticketDetails.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('change', '.claimReimburs', this.claimReimburs);
      this.$el.on('change', '.claimReimburs', this.claimReimburs.bind(this));
      this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
      this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
      this.$el.off('input', '.expenseChange', this.getexpenseby);
      this.$el.on('input', '.expenseChange', this.getexpenseby.bind(this));
      this.$el.off('click', '.selectExpenseBy', this.setExpenseBy);
      this.$el.on('click', '.selectExpenseBy', this.setExpenseBy.bind(this));
      this.$el.off("click", ".loadMedia", this.loadMedia);
      this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
      this.$el.off('input', '.custChange', this.getcustomers);
      this.$el.on('input', '.custChange', this.getcustomers.bind(this));
      this.$el.off('click', '.selectCustomer', this.setCustomer);
      this.$el.on('click', '.selectCustomer', this.setCustomer.bind(this));
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      if (valuetxt == "addCustomer") {
        new categorySingleView({ searchCategory: this, loadfrom: "TaskSingleView" });
      }
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);

      if (toID == "paid_by" && valuetxt == "cheque") {
        $('.chequeNumbDiv').show();
        $('.payeeNameDiv').show();
        $('.transacNumbDiv').hide();
      } else if (toID == "paid_by" && valuetxt == "upi") {
        $('.chequeNumbDiv').hide();
        $('.transacNumbDiv').show();
        $('.payeeNameDiv').show();
      } else if (toID == "paid_by" && valuetxt == "cash") {
        $('.chequeNumbDiv').hide();
        $('.transacNumbDiv').hide();
        $('.payeeNameDiv').hide();
      }

      console.log(this.model);
    },

    claimReimburs: function (e) {
      e.stopPropagation();
      var selfobj = this;
      $('.claimReimburs input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          $('#paidMainDiv').hide();
          selfobj.model.set({ 'claim_reimbursement': "yes" });
        } else {
          $('#paidMainDiv').show();
          selfobj.model.set({ 'claim_reimbursement': "no" });
        }
      });
    },

    getSelectedFile: function (url) {
      let docUrl = "";
      let furl = url.split("/");
      fName = furl[furl.length - 1];
      this.attachedDocURLArray.push({ url: fName });
      ftext = fName.split(".");
      if (ftext[1] == "xls" || ftext[1] == "xlsx") {
        fName = "excel.png";
      } else if (ftext[1] == "pdf") {
        fName = "pdf.png";
      }
      docUrl = "<div class='col-xl-2 col-lg-3 col-md-4 col-sm-12 m-b-20' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><a href='" + url + "' target='_blank'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/" + fName + "' alt=''></a><span class='closeTab deleteAttachment'><span class='material-icons'>delete</span></span></div></div></div>";
      document.getElementById("attachedDoc").innerHTML += docUrl;
      $('#largeModal').modal('toggle');
      this.model.set({ "attachment": this.attachedDocURLArray });
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
    },

    getcustomers: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#customerDropdown");
      var table = "customer";
      var where = "name";
      var list = "customer_id, name, type, record_type";
      if (name != "") {
        $.ajax({
          url: APIPATH + 'getCustomerList/',
          method: 'POST',
          data: { text: name, tableName: table, wherec: where, list: list },
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
              showResponse(e,res,'');
            }
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.msg === "sucess" && res.data.length > 0) {
              $.each(res.data, function (index, value) {
                var firstLetterOfType = value.type.charAt(0);
                dropdownContainer.append('<div class="dropdown-item selectCustomer" style="background-color: #ffffff;" data-customerID=' + value.customer_id + '>' + value.name + '(' + firstLetterOfType + ') </div>');
              });
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
      e.preventDefault();
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

    updatemultiSelDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("name");
      var existingValues = this.model.get(toName);
      if (typeof existingValues !== 'string') {
        existingValues = '';
      }

      if ($(e.currentTarget).prop('checked')) {
        if (existingValues.indexOf(valuetxt) === -1) {
          existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
        }
      } else {
        existingValues = existingValues
          .split(',')
          .filter(value => value !== valuetxt)
          .join(',');
      }
      this.model.set({ [toName]: existingValues });
      console.log("this.model", this.model);
    },

    selectOnlyThis: function (e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("name");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
      console.log("this.model", this.model);
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

    saveticketDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var ticket_id = this.model.get("ticket_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }

      if (ticket_id == "" || ticket_id == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }

      if ($("#expenseDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse(e,res,'');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          scanDetails.filterSearch();
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

    getexpenseby: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#expenseByDropdown");
      var table = "admin";
      var where = "name";
      var list = "adminID, name";
      $.ajax({
        url: APIPATH + 'getAssigneeList/',
        method: 'POST',
        data: { text: name, tableName: table, wherec: where, list: list },
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
            showResponse(e,res,'');
          }
          $(".textLoader").hide();
          dropdownContainer.empty();
          if (res.msg === "sucess" && res.data.length > 0) {
            $.each(res.data, function (index, value) {
              dropdownContainer.append('<div class="dropdown-item selectExpenseBy" style="background-color: #ffffff;" data-adminID=' + value.adminID + '>' + value.name + '</div>');
            });
            dropdownContainer.show();
          }
        }
      });
    },

    setExpenseBy: function (e) {
      let selfobj = this;
      var Name = $(e.currentTarget).text();
      var adminID = $(e.currentTarget).attr('data-adminID');
      $('.expenseChange').val(Name);
      $("#expenseByDropdown").hide();
      selfobj.model.set({ "expense_by": adminID });
    },

    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        expense_title: {
          required: true,
        },
        expense_date: {
          required: true,
        },
        expense_by: {
          required: true,
        },

      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);

      }
      var messages = {
        expense_title: "Please enter Expense Title",
        expense_date: "Please enter Expense Date",
        expense_by: "Please enter Expense By",
      };

      $('#due_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#due_date').change();
        var valuetxt = $("#due_date").val();
        selfobj.model.set({ "due_date": valuetxt });
      });

      $("#expenseDetails").validate({
        rules: feildsrules,
        messages: messages
      });
    },
    render: function () {
      var selfobj = this;
      var source = tickettemp;
      var template = _.template(source);
      // var rout2 = APIPATH + 'expenseMediaReceipt/';
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models, "customerList": this.customerList.models }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      $(".ws-select").selectpicker();
      rearrageOverlays(selfobj.form_label, this.toClose);

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
      var editor = new Quill($("#description").get(0), {
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
      editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          selfobj.model.set({ "description": justHtml });
        }
      });
      return this;
    },
    onDelete: function () {
      this.remove();
    }
  });

  return ticketSingleView;

});
