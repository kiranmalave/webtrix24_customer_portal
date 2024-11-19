define([
  'underscore',
  'backbone',
  '../models/emailMasterModel'
], function(_, Backbone,emailMasterModel){

  var emailMasterCollection = Backbone.Collection.extend({
      faqID:null,
      model: emailMasterModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'emailMasterList';
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

  return emailMasterCollection;

});