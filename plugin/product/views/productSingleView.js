define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'minicolors',
  'moment',
  'Quill',
  'Swal',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../models/productSingleModel',
  '../../category/collections/slugCollection',
  '../../category/views/categorySingleView',
  '../../readFiles/views/readFilesView',
  'text!../templates/productSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, minicolors, moment, Quill, Swal, multiselectOptions, dynamicFieldRender, productSingleModel, slugCollection, categorySingleView, readFilesView, producttemp) {
  var productSingleView = Backbone.View.extend({
    form_label: '',
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "productSingleView";
      var selfobj = this;
      this.form_label = options.form_label;
      this.menuId = options.menuId;
      this.loadfrom = options.loadfrom ? options.loadfrom : '';
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      // var mname = Backbone.history.getFragment();
      var service_id = options.action;
      readyState = true;
      this.pluginName = "productList";
      this.pluginId = options.pluginId;
      this.model = new productSingleModel();
      this.categoryList = new slugCollection();
      this.scanDetails = options.searchProduct;
      if (options.product_id != "") {
        this.model.set({ product_id: options.product_id });
        this.model.fetch({
          beforeSend: function () {$('.loder').show();},
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          $('.loder').hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }           
          var category = selfobj.model.get("category");
          if (category) {
            var arrayCategory = category.split(",");
            selfobj.model.set({ menuId: selfobj.menuId });
            selfobj.model.set({ arrayCategory: arrayCategory })
          }
          if (res.data[0] && res.data[0].margin) {
            selfobj.model.set({ margin_in_per:res.data[0].margin + ' %' });
          }
          selfobj.dynamicData = res.data.dynamicFields;
          selfobj.render();
        });
      }
      selfobj.refreshCat();
    },
    events:
    {
      "click .productDetails": "saveProductDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "click .multiOptionSel": "multioption",
      "change .dropval": "updateOtherDetails",
      "change .fileAdded": "updateImage",
      "keyup .titleChange": "updateURL",
      "click .loadMedia": "loadMedia",
      "click .singleSelectOpt": "selectOnlyThis",
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire({ title: 'Failed !', text: "Something was wrong ! Try to refresh the page or contact administer. :(", timer: 2000, icon: 'error', showConfirmButton: false });
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      if (valuetxt == "addCategory") {
        var category_id = $(e.currentTarget).attr("data-slug");
        new categorySingleView({ slug: category_id, searchCategory: this, loadfrom: "ProductSingleView", form_label: "Category" });
      }
      this.model.set(newdetails);
      if (toID == 'price') {
        this.model.set({ 'actual_cost': valuetxt })
        this.comaparePrice();
      }
      if (toID == 'gst' || toID == 'compare_price') {
        this.comaparePrice();
      }
    },
    comaparePrice: function () {
      let price = this.model.get('price') || 0;
      price = parseInt(price);
      let actual_price = parseInt(this.model.get('actual_cost'));
      let compare_price = parseInt(this.model.get('compare_price'));
      let with_gst = this.model.get('with_gst');
      let gst = parseInt(this.model.get('gst') || 0);
      if (with_gst === 'yes') {
        gstAmt = (price * 100) / (gst + 100);
        actualCost = price - gstAmt;
        gstAmt = numberFormat(gstAmt, 2)
        this.model.set({ 'actual_cost': gstAmt });
      }
      const profit = actual_price - compare_price;
      const margin = calculateMargin(compare_price, actual_price);
      this.model.set({ 'profit': numberFormat(profit, 2), 'margin': numberFormat(margin, 2),'margin_in_per' : numberFormat(margin, 2)+' %' });
      if (compare_price == 0) {
        this.model.set({ 'profit': '0.00', 'margin': '0.00' });
      }
      this.render();
      function calculateMargin(actualPrice, sellingPrice) {
        if (actualPrice === 0) { return 0; }
        return ((sellingPrice - actualPrice) / sellingPrice) * 100;
      }
    },
    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        beforeSend: function () {
          $('.loder').show();
        },
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'product_types,unit' }
      }).done(function (res) {
        $('.loder').hide();
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
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

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status", "shipping", "track_quantity", "with_gst", "is_amc", "shipping", "discount_type"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "serviceImage": url });
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      var selfobj = this;
      if ($(e.currentTarget).attr("id") == 'with_gst') {
        $('.gstDiv').show();
        this.comaparePrice();
      } else {
        $('.gstDiv').hide();
        selfobj.model.set({ "gst": 0 });
        this.comaparePrice();
      }
      selfobj.render();
    },

    updateURL: function (e) {
      var url = $(e.currentTarget).val().trim().replace(/[^A-Z0-9]+/ig, "_");
      $("#serviceLink").val(url);
      this.model.set({ "serviceLink": url });
    },
    saveProductDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("product_id");
      let isNew = $(e.currentTarget).attr("data-action");
      let isAmc = this.model.get("is_amc");
      if (isAmc == "yes") {
        let duration = $('#duration_time').val();
        let amc_duration = this.model.get("amc_duration");
        amc_duration += + " " + duration;
        selfobj.model.set({ amc_duration: amc_duration });
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#productDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          beforeSend: function () { $('.loder').show(); },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json' }
          , error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          $('.loder').hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            showResponse(e, res, "Error");
            $(e.currentTarget).html("<span>Error</span>");
          } else {
            $(e.currentTarget).html("<span>Saved</span>");
            if (res.flag == "S") {
              if (isNew == "new") {
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.model.set({ menuId: selfobj.menuId });
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
                selfobj.render();
              } else {
                if (selfobj.loadfrom == 'TaxInvoice') {
                  selfobj.scanDetails.render();
                } else {
                  selfobj.scanDetails.filterSearch();
                }
                handelClose(selfobj.toClose);
              }
            }
          }
          setTimeout(function () {
            (isNew == "new") ? $(e.currentTarget).html("<span>Save & New</span>") : $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;

      var feilds = {
        product_name: {
          required: true,
        },
        product_type: {
          required: true,
        },
        gst: {
          required: true,
          min: 1
        },
        discount: {
          required: true,
          number: true,
          min: 0,
          max: 100
        }
      };
      if (selfobj.model.get('discount_type') == 'amt') {
        delete feilds.discount.max;
      }
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
      }

      var messages = {
        product_name: "Please enter Product Name",
        product_type: "Please enter Product Type",
        gst: {
          required: "Please enter GST",
          min: "Please enter GST greter Than 0",
        },
        discount: {
          required: "Please select discount type ",
          max: "Please enter discount less than 100",
        }
      }
      var r = $("#productDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = producttemp;
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

      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.initializeValidate();
      this.setOldValues();
      if (selfobj.model.get('with_gst') == 'no') {
        $('.gstDiv').hide();
      }
      $('.ws-select').selectpicker();
      rearrageOverlays(selfobj.form_label, this.toClose);

      var __toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ direction: "rtl" }], // text direction
        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ align: [] }],
        ["link"],
        ["clean"], // remove formatting button
      ];
      var editor = new Quill(this.$("#product_description").get(0), {
        modules: {
          toolbar: __toolbarOptions,
        },
        theme: "snow", // or 'bubble'
      });
      editor.on('text-change', function (delta, oldDelta, source) {
        if (source == "api") {
          console.log("An API call triggered this change.");
        } else if (source == "user") {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          text = text.replace(/\n/g, '');
          selfobj.model.set({ "product_description": text });
        }
      });
      this.delegateEvents();
      return this;
    }, onDelete: function () {
      this.remove();
    },
  });
  return productSingleView;
});