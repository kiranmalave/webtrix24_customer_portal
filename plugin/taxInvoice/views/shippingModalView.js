
define([
    'jquery',
    'underscore',
    'backbone',
    'text!../templates/shippingModalTemp.html',
    '../../core/views/countryExtList'

], function ($, _, Backbone, shippingModalTemp,countryExtList) {

    var shippingModalView = Backbone.View.extend({
        initialize: function (options) {
            this.jsonForm = {};
            var selfobj = this;
            this.taxInvoice = options.taxInvoice;
            this.countryListView = new countryExtList();
            this.countryExtList = this.countryListView.countryExtList;
            $(".modal-dialog.forShipping").removeClass("modal-lg");
            this.render();
        },
        events:
        {
            "click .closeModal": "closeModal",
            "click .saveModal": "saveModal",
        },

        closeModal: function () {
            $('#shippingModal').modal('toggle');
        },

        saveModal: function () {
            var selfobj = this;
            if ($("#customerActivity").valid()) {
                $('#shippingModal').modal('toggle');
                var address = $("#address").val();
                var zipcode = $("#zipcode").val();
                var mobile_no = $("#mobile_no").val();
                var country_code = $("#country_code").val().trim();
                mobile_no = country_code+' '+mobile_no;
                selfobj.jsonForm = {
                    address: address,
                    zipcode: zipcode,
                    country_code:country_code,
                    mobile_no: mobile_no,
                    full_address: address + ',' + zipcode
                };
                selfobj.taxInvoice.model.set({ shipping_address: JSON.stringify(selfobj.jsonForm), shipping_mobile : mobile_no });
                address = address + ',' + zipcode
                if (selfobj.jsonForm != {} && selfobj.jsonForm != '') {
                    $('.customerShippingDetails .custAddress').empty().append(address);
                    $('#ship_to').prop("checked", false);
                    selfobj.taxInvoice.model.set({ 'ship_to': 'no' });
                }
            }
        },

        initializeValidate: function () {
            var selfobj = this;
            $(".ws-select").selectpicker('refresh');
            var feilds = {
                address: {
                    required: true,
                },
                mobile_no: {
                    required: true,
                    digits: true,      // Ensures only numbers are allowed
                    minlength: 10,     // Minimum length of 10 digits
                    maxlength: 10, 
                }
            };
            var feildsrules = feilds;
            var messages = {
                address: "Please enter Address",
                mobile_no:{
                    required: "Please enter Mobile no",
                    digits: "Please enter only numbers",
                    minlength: "Mobile number must be exactly 10 digits",
                    maxlength: "Mobile number must be exactly 10 digits",
                },
            };
            $("#customerActivity").validate({
                rules: feildsrules,
                messages: messages,
            });
        },

        render: function () {
            var selfobj = this;
            var template = _.template(shippingModalTemp);
            if (selfobj.taxInvoice.model && selfobj.taxInvoice.model.attributes.shipping_address) {
                var shippingAddress = JSON.parse(selfobj.taxInvoice.model.attributes.shipping_address);
                if (shippingAddress && shippingAddress.mobile_no) {
                    let mob = shippingAddress.mobile_no.split(' ');
                    if (mob.length == 2) {
                        mob.shift();
                    }
                    shippingAddress.mobile_no = mob;
                }
            }
            this.$el.html(template({
                model: {
                    address: shippingAddress ? shippingAddress.address : "",
                    zipcode: shippingAddress ? shippingAddress.zipcode : "",
                    mobile_no: shippingAddress ? shippingAddress.mobile_no : "",
                    country_code: shippingAddress ? shippingAddress.country_code : "",
                },
                countryExtList: selfobj.countryExtList
            }));
            $('#shippingMedia').empty();
            $("#shippingMedia").append(this.$el);
            setToolTip();
            $(".profile-loader").hide();
            this.initializeValidate();

            return this;
        }
    });

    return shippingModalView;

});
