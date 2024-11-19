define([
    'plugin/course/views/courseView',
  ], function (courseView) {
    return {
      templates:{
      // courseView:courseView,
      // formAnsMasterView:formAnsMasterView,
      // ticketView:ticketView,
      },
      routes:{
        'course': 'courseView_',
      },
       courseView_:function(action){
        if (this.preTemp()) {
           new courseView({ action: action });
         }
       },
    };
});  