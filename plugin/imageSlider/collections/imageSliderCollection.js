define([
    'underscore',
    'backbone',
    '../models/imageSliderModel'
  ], function(_, Backbone,imageSliderModel){
  
    var imageSliderCollection = Backbone.Collection.extend({
        slider_id:null,
        model: imageSliderModel,
        initialize : function(){
  
        },
        url : function() {
          return APIPATH+'imageSliderMasterList';
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
  
    return imageSliderCollection;
  
  });