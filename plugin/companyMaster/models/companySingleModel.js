define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var companySingleModel = Backbone.Model.extend({
      idAttribute: "infoID",
      defaults: {
        infoID:null,
        companyName:null,
        company_address:null,
        fromEmail:null,
        ccEmail:null,
        fromName:null,
        bank_acc_no:null,
        ifsc_code:null,
        record_per_page: "50",
        pan:null,
        gst_no:null,
        msme_no:null,
        lut_no:null,
        mcir_code:null,
        bank_details:null,
        is_display_payment:null,
        country:null,
        state:null,
        city:null,
        stateGst:null,
        centralGst:null,
        interGst:null,
        mobile_number:null,
        zip:null,
        sacCode:null,
        ourTarget:null,
        date_format:"DD-MM-YYYY",
        email_provider:null,
        smtp_host:null,
        smtp_user:null,
        smtp_pass:null,
        smtp_post:null,
        sendgrid_API:null,
        brevo_API:null,
        email_logo:null,
        quotation_terms_conditions:null,
        invoice_terms_condotions:null,
        receipt_terms_condotions:null,
        invoice_logo:null,
        email_logo:null,
        is_gst_billing: "no",
        status: "active",
        wa_token:null,
        wa_ids:null,
        wa_from:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
    },
        urlRoot:function(){
        return APIPATH+'companyMaster/'
      },
      parse : function(response) {
          return response.data[0];
        }
    });
    return companySingleModel;
  });
  
  