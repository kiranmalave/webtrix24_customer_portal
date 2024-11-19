define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'typeahead',
  'icheck',
  'select2',
  'moment',
  'Swal',
  //'../../company/collections/companyCollection',
  '../../core/views/multiselectOptions',
  '../../product/collections/productCollection',
  '../../vendorMaster/collections/vendorCollection',
  '../models/singleProductStockModel',
  '../../dynamicForm/views/dynamicFieldRender',
  'text!../templates/productStockSingle_temp.html',
  'text!../templates/productStockNewRow.html',
  '../collections/purchaseItems',
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, icheck, select2, moment,Swal, multiselectOptions, productCollection, vendorCollection, singleProductStockModel, dynamicFieldRender, productStock_temp,productStockNewRow,purchaseItems) {

  var productStockSingleView = Backbone.View.extend({
    model: singleProductStockModel,
    form_label:'',
    s_state : 'false',
    row_product : [],
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "productStockSingleView";
      var selfobj = this;
      this.form_label = options.form_label;
      $('#productStockData').remove();
      this.menuId = options.menuId;
      this.menuName = options.menuName;
      scanDetails = options.searchproductStock;
      $(".popupLoader").show();
      $(".modal-dialog").addClass("modal-lg");
      // var companyList = new companyCollection();
      purchaseItemsDetails = new purchaseItems();
      this.getnarration();
      this.vendorList = new vendorCollection();
      this.vendorList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' ,'fetchFrom':'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("expensesList", res.data);
        $('body').find(".loder").hide();
        selfobj.render();
      });
      this.model = new singleProductStockModel();
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      // this.customerList = new customerCollection();
      scanDetails = options.searchproductStock;
      $(".popupLoader").show();
      this.model.set({ year: moment().year(), reportYear: moment().year() });
      
      if (options.purchase_id != "" && options.purchase_id != null) {
        this.model.set({ purchase_id: options.purchase_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.model.set({ menuId: selfobj.menuId});
          selfobj.render();
          selfobj.getnarration();
          selfobj.setValues();
        });
      } else {
        // selfobj.getinfoSetting();
        selfobj.render();
        $(".popupLoader").hide();
      }
    },
    events:
    {
      "click .saveProductStockDetails": "saveProductStockDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click #addRow": "addemptyRow",
      "click .multiSel": "setValues",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis"
    },
    attachEvents: function () {
      this.$el.off('click', '.saveProductStockDetails', this.saveProductStockDetails);
      this.$el.on('click', '.saveProductStockDetails', this.saveProductStockDetails.bind(this));
      this.$el.off('click', '.item-container li', this.setValues);
      this.$el.on('click', '.item-container li', this.setValues.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('change', '.setnarr', this.setnarration);
      this.$el.on('change', '.setnarr', this.setnarration.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
      this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
      this.$el.off('click', '#addRow', this.addemptyRow);
      this.$el.on('click', '#addRow', this.addemptyRow.bind(this));
      this.$el.off('click', '.del-row', this.delRow);
      this.$el.on('click', '.del-row', this.delRow.bind(this));
      this.$el.off('input', '.pdChange', this.getProducts);
      this.$el.on('input', '.pdChange', this.getProducts.bind(this));
      this.$el.off('click', '.selectProduct', this.setProduct);
      this.$el.on('click', '.selectProduct', this.setProduct.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    // ADD EMPTY ROW
    addemptyRow: function (e) {
      e.preventDefault();
      var lastID = $("tr.item-list-box:last").attr("id");
      var lastDetails = parseInt(lastID.split("-")[1]);
      var newRowNumber = lastDetails + 1;
      var template = _.template(productStockNewRow);
      $(".items-holder").append(template({ row_number: newRowNumber }));
      setTimeout(function () {
          $("#itemName_" + newRowNumber).focus();
      }, 100);
      $('.digits').inputmask({ regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask({ regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });
      this.rowTotal(e);
      this.reArrangeIndex();
      $('.ws-select').selectpicker();
    },
    // ADD EMPTY ROW
    addRow: function (e) {
      e.preventDefault();
      var lastDetails = 0;
      var template = _.template(productStockNewRow);
      $(".items-holder").append(template({row_number : (lastDetails+1) ,}));
      setTimeout(function () {
        var di = "itemName_" + (lastDetails + 1);
        $("#" + di).focus();
      }, 100);
      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });
      this.reArrangeIndex();
      $('.ws-select').selectpicker();
    },
    // DELETE ROW
    delRow: function (e) {
      e.preventDefault();
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      let tr_length = $("tr.item-list-box").length;
      this.reArrangeIndex();
      $("#item-" + lastDetails).remove();
      if(tr_length == 1){
        this.addRow(e);
      }
    },
    // REARRANGE ROW INDEXES
    reArrangeIndex: function () {
      var i = 1;
      $("tr.item-list-box").each(function (key, value) {
        $(this).find(".sno").html(i);
        i++;
      });
    }, 
    // GET PRODUCT NARRATIONS
    getnarration: function () {
      selfobj = this;
      $.ajax({
        url: APIPATH + 'getNarration',
        method: 'GET',
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.flag == "S") {
            selfobj.model.set({ "narrList": res.data });
            selfobj.render();
          }
        }
      });
    },
    // SET PRODUCT WHEN LOADED
    setnarration: function (e) {
      var id = $(e.currentTarget).val();
      var tid = $(e.currentTarget).attr("id").split("_");
      var nlist = selfobj.model.get("narrList");
      this.row_product.push(id);
      $.each(nlist, function (key, value) {
        if (id == value.product_id) {
          $("#itemName_" + tid[1]).val(value.product_description);
        }
      });
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
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
    selectOnlyThis: function(e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("name");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status"];
      // selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      // var da = selfobj.multiselectOptions.setCheckedValue(e);
      // selfobj.model.set(da);
    },
    getProducts: function (e) {
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#productDropdown_"+lastDetails);
      var table = "customer";
      if (name != "") {
        $.ajax({
          url: APIPATH + 'getSearchedProduct',
          method: 'POST',
          data: { text: name },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.flag === "S") { 
              if(res.data.length > 0) {
              $.each(res.data, function (index, value) {
                dropdownContainer.append('<div data-productID="'+value.product_id+'" id= "sd_'+lastDetails  +'" class="dropdown-item selectProduct" style="background-color: #ffffff;"  data-with_gst="' + value.with_gst + '" data-actual_cost="' + value.actual_cost + '"  data-price="' + value.price + '" data-discount="' + value.discount + '" data-product_description	="' + value.product_description	 + '" data-unit="' + value.unit + '" data-gst="' + value.gst + '" data-discount_type="' + value.discount_type+'" >' + value.product_name+'</div>');
              });
              dropdownContainer.show();
            }
          }else {
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "product" style="background-color: #5D60A6; color:#ffffff;" > Product Not found </div>');
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
    setProduct: function (e) {
      e.preventDefault();
      let selfobj = this;
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      var productID = $(e.currentTarget).attr('data-productID');
      var product_name = $(e.currentTarget).clone().find('span').remove().end().text();   
      $("#productDropdown_"+lastDetails).hide();
      $('#narr_'+lastDetails).val(product_name);
      $('#narr_'+lastDetails).attr({'product_id':productID});
      $('#itemQuantity_'+lastDetails).val(1);
      selfobj.setnarration(productID,lastDetails);
    },

    saveProductStockDetails: function (e) {
      e.preventDefault();
      purchaseItemsDetails.reset();
      var selfobj = this;
      var tmppurchase_id = this.model.get("purchase_id");
      var purchase_id = selfobj.model.get("purchase_id");
      var store_id =  $("#store_id").val();
      var vender_id = $("#vender_id").val();
      var purchase_date = $("#purchase_date").val();
      var challan_date = $("#challan_date").val();
      var challan_number = $("#challan_number").val();      
      var remark = $("#remark").val();
      if (tmppurchase_id != '' || tmppurchase_id != 0) {
        var purchase_id = tmppurchase_id;
      } else {
        var purchase_id = null;
      }
      var error = [];
      var POheaderInfo = { "purchase_id": purchase_id, "store_id": store_id, "vender_id": vender_id, "purchase_date": purchase_date, "challan_date": challan_date, "challan_number": challan_number,"remark":remark,"menu_name":this.menuName };
      purchaseItemsDetails.add(POheaderInfo);
      $("tr.item-list-box").each(function (key, value) {
        var lastID = $(this).attr("id");
        var row = $(this).find(".sno").html();
        var lasts = lastID.split("-");
        var lastDetails = lasts[1];
        var product_qty = $("#itemQuantity_" + lastDetails).val();
        var product_id = ($("#narr_" + lastDetails).attr('product_id')) ? $("#narr_" + lastDetails).attr('product_id') : '' ;;
        if (product_id == "") {
          error.push("Item type can not blank. Row No." + row);
        }
        if (product_qty == "" || product_qty == 0) {
          error.push("Item quantity can not blank. Row No." + row);
        }
        var nerow = { "purchase_id": purchase_id, "sr_no": lastDetails, "product_qty": product_qty, "product_id": product_id };
        purchaseItemsDetails.add(nerow);
      });
      if (error.length > 0) {
        var er = "";
        $.each(error, function (key, val) {
          er = er + val + "\n";
        });
        alert(er);
        return false;
      }
      if (purchase_id != null) {
        if (permission.edit == "yes") {
          method = "update";
        }
        else {
          alert("You don`t have permission to edit");
          return false;
        }
      } else {
        method = "create";
      }
      $(e.currentTarget).html("<span>Saving..</span>");
      $(e.currentTarget).attr("disabled", "disabled");
      purchaseItemsDetails.sync(method, purchaseItemsDetails, { 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "F") {
          showResponse(e,res,'');
          $(e.currentTarget).html("<span>Error</span>");
        } else {
          $(e.currentTarget).html("<span>Saved</span>");
          handelClose(selfobj.toClose);
          scanDetails.filterSearch();
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId});
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
            }
          }
        }
        setTimeout(function () {
          $(e.currentTarget).html("<span>Save</span>");
        }, 3000);
      });

    },
    initializeValidate: function () {
      var selfobj = this;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });
      $('#purchase_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true
      }).on('changeDate', function (ev) {
        $('#purchase_date').change();
        var valuetxt = $("#purchase_date").val();
        selfobj.model.set({ purchase_date: valuetxt });
      });
      $('#challan_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true
      }).on('changeDate', function (ev) {
        $('#challan_date').change();
        var valuetxt = $("#challan_date").val();
        selfobj.model.set({ challan_date: valuetxt });
      });
    },
    render: function () {
      selfobj = this;
      var source = productStock_temp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes , menuName : this.menuName , vendorList:this.vendorList.models}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.initializeValidate();
      this.reArrangeIndex();
      this.setOldValues();
      this.attachEvents();
      $('.ws-select').selectpicker();
      rearrageOverlays(selfobj.form_label, this.toClose);
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });
  return productStockSingleView;
});
