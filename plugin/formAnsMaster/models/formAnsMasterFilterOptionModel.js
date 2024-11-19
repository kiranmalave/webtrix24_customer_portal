define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formAnsMasterFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "qaID",
  	 defaults:{
        textSearch:'qaID',
        textval: null,
        status:'active',
        orderBy:'created_date',
        order:'DESC',
    }
  });
  return formAnsMasterFilterOptionModel;
});

