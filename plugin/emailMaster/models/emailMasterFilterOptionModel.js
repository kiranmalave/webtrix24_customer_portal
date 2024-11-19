define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var emailMasterFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "tempID",
  	 defaults:{
        // textSearch:'tempName',
        // textval: null,
        // status:'active',
        // orderBy:'tempID',
        // order:'ASC',
        status:'active',
        textSearch: '',
        textval: null,
        orderBy:'created_date' ,
        order:'DESC' ,
    }
  });
  return emailMasterFilterOptionModel;
});

