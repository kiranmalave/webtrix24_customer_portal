define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var celebrateWithUsFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "celebrate_id",
  	 defaults:{
        textSearch:'celebrate_id',
        textval: null,
        confirmationStatus: null,
        fromDate:null,
        toDate:null,
        occasion:null,
        prefix:null,
        region:null,
        status:'active',
        orderBy:'confirmation_status,req_by_name',
        order:'ASC',
    }
  });
  return celebrateWithUsFilterOptionModel;
});

