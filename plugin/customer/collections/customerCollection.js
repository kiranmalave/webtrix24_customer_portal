define([
  'underscore',
  'backbone',
  '../models/customerModel'
], function(_, Backbone,customerModel){

  var customerCollection = Backbone.Collection.extend({
    customer_id:null,
      model: customerModel,
      loadstate: true,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'customerMasterList';
      },
      parse : function(response){
        this.pageinfo = response.paginginfo;
        this.totalRecords = response.totalRecords;
        this.endRecords = response.end;
        this.flag = response.flag;
        this.msg = response.msg;
        this.loadstate = response.loadstate;
        return response.data;
      }
  });

  return customerCollection;

});