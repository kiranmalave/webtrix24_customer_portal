define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'jqueryCookie',
    'Waves',
    'adminjs',
    'bootstrapSelect',
    'notify',
    'custom',
    'Swal',
    'plugin/login/views/loginView',
    'plugin/login/views/verificationView',
    'plugin/login/views/resetPasswordRequestView',
    'plugin/login/views/registerView',
    'plugin/dashboard/views/dashboardView',
    'plugin/userProfile/views/userProfileView',
    'plugin/admin/views/adminView',
    'plugin/userRole/views/userRoleView',
    'plugin/menu/views/menuView',
    'plugin/emailMaster/views/emailMasterView',
    'plugin/category/views/categoryView',
    'plugin/pagesMaster/views/pagesMasterView',
    'plugin/pagesMaster/views/pagesMasterSingleDesign',
    'plugin/blogsMaster/views/blogsMasterView',
    'plugin/blogsMaster/views/blogsMasterSingleDesign',
    'plugin/dynamicForm/views/dynamicFormView',
    'plugin/admin/views/accessDetailsView',
    'plugin/pagesMenuMaster/views/pagesMenuMasterView',
    'plugin/themeOption/views/themeOptionView',
    'plugin/campaigns/views/campaignsView',
    'plugin/appointment/views/appointmentView',
    'plugin/task/views/taskView',
    'plugin/task/views/taskSingleView',
    'plugin/customer/views/customerView',
    'plugin/receipt/views/receiptView',
    'plugin/pushService/views/pushServiceView',
    'plugin/taxInvoice/views/taxInvoiceView',
    'plugin/deliveryChallan/views/deliveryChallanView',
    'plugin/event/views/eventView',
    'plugin/event/views/avablityView',
    'plugin/readFiles/views/readFilesView',
    'plugin/services/views/servicesView',
    'plugin/career/views/careerView',
    'plugin/ourclients/views/ourClientsView',
    'plugin/expenses/views/expensesView',
    'plugin/ourteam/views/ourTeamView',
    'plugin/testimonials/views/testimonialsView',
    'plugin/faq/views/faqView',
    'plugin/contactUs/views/contactUsView',
    'plugin/dynamicForms/views/dynamicFormsView',
    'plugin/services/views/servicesMasterSingleDesign',
    'plugin/customModule/views/customModuleView',
    'plugin/productStock/views/productStockView',
    'plugin/product/views/productView',
    'plugin/customer/views/dashboardView',
    'plugin/companyMaster/views/companyView',
    'plugin/accounts/views/accountView',
    'plugin/currencyMaster/views/currencyView',
    'plugin/vendorMaster/views/vendorView',
    'plugin/imageSlider/views/imageSliderView',
    'plugin/templates/views/templatesView',
    'plugin/loginTemplate/views/loginTemplateView',
    'plugin/errorLog/views/errorLogView',
    'plugin/registration/views/registrationView',
    'plugin/opportunity/views/opportunityView',
    'plugin/projects/views/projectsView',
    'text!../templates/appMain_temp.html',
    'text!../templates/appFull_temp.html',
    'text!../templates/sideNav_temp.html',
    'text!../templates/topNav_temp.html',
  ], function ($, _, Backbone, bootstrap, jqueryCookie, Waves, adminjs, bootstrapSelect, notify, custom, Swal, loginView, verificationView, resetPasswordRequestView,registerView, dashboardView, userProfileView, adminView, userRoleView, menuView, emailMasterView, categoryView, pagesMasterView, pagesMasterSingleDesign, blogsMasterView, blogsMasterSingleDesign, dynamicFormView, accessDetailsView, pagesMenuMasterView, themeOptionView, campaignsView, appointmentView, taskView, taskSingleView, customerView, receiptView, pushServiceView, taxInvoiceView, deliveryChallanView, eventView, avablityView, readFilesView, servicesView, careerView, ourClientsView, expencesView, ourTeamView, testimonialsView, faqView, contactUsView, dynamicFormsView, servicesMasterSingleDesign,customModuleView,productStockView, productView, customerdashboardView,companyView,accountView,currencyView,vendorView,imageSliderView,templatesView,loginTemplateView,errorLogView,registrationView, opportunityView,projectsView,appMain_temp, appFull_temp, sidebar, topNav) {
    return {
        routes: {
          'logout': 'logoutlink_',
          'login': 'loginlink_',
          'register':'registerView_',
          'userVerification': 'verificationView_',
          'resetpasswordrequest':"resetPasswordRequest_",
          'dashboard':"dashboardview_",
          'userProfile':"userProfileView_",
          'usersList':"adminView_",
          'roleList':"userRoleView_",
          'emailMaster':"emailMasterView_",
          'pages': "pages_",
          'blogs': "pages_",
          'services': "pages_",
          'access-control':"accessDetailsView_",
          'pagesMenuMaster':"pagesMenuMaster_",
          'menuList':"menuView_",
          'pageCustomFields/:menuID': "addCustomField_",
          'addnewpage/:pageID': "addpage_",
          'addnewblog/:blogID': "addblog_",
          'addnewservices/:service_id': "addservices_",
          'customer':"customerView_",
          'leads':"customerView_",
          'receipts':"receiptView_",
          'pushService':"pushServiceView_",
          'theme-option':"themeOptionView_",
          'media':"readFilesView_",
          'gallery':"readFilesView_",
          'category':"categoryView_",
          'campaigns':"campaignsView_",
          'appointment':"appointmentView_",
          'task':"taskView_",
          'task/:taskID':"taskActivityView_",
          'appointment/:appointmentD':"appointmentActivityView_",
          'invoice':"invoiceView_",
          'proforma':"invoiceView_",
          'quotation':"invoiceView_",
          'receipt':"invoiceView_",
          'delivery':"invoiceView_",
          'event':"eventView_",
          'avablity':"avablityView_",
          'products':"productView_",
          'productStock':"productStockView_",
          'addnewservice': "addservice_",
          'career':"careerView_",
          'ourclients':"ourClientsView_",
          'expences':"expencesView_",
          'amc':"taskView_",
          'ourteam':"ourTeamView_",
          'testimonials':"testimonialsView_",
          'faqs':"faqView_",
          'contactUs':"contactUsView_",
          'dynamicForms':"dynamicFormsView_",
          'formMaster':"formMasterView_",
          'formQuestions/:formID':"formQuestionsView_",
          'app/:menuID':"customModuleView_",
          'customerDashboard/:customer_id/:menu_id':"customerdashboardView_",
          'companyMaster':"companyView_",
          'accounts':"accountView_",
          'currencyMaster':"currencyView_",
          'vendorMaster':"vendorView_",
          'ImageSlider':"imageSliderView_",
          'Templates':"templatesView_",
          'login_view':"loginTemplateView_",
          'ErrorLog':"errorLogView_",
          'Registration':"registrationView_",
          'opportunity':"opportunityView_",
          'projects':"projectsView_",
        },
        templates:{
          appMain_temp:appMain_temp,
          appFull_temp:appFull_temp,
          sidebar:sidebar,
          topNav:topNav,
      },
      dashboardview_:function(){
       if (this.preTemp()) {
          new dashboardView();
          }
      },
      verificationView_:function(){
        var loc = window.location.pathname;
        var template = _.template(appFull_temp);
        $("#master__load").addClass("login");
        $("#master__load").empty().append(template());
        new verificationView();
      },
      userProfileView_:function(){
       if (this.preTemp()) {
          new userProfileView();
          }
      },
      accessDetailsView_:function(){
       if (this.preTemp()) {
          new accessDetailsView();
        }
      },
      adminView_:function(){
       if (this.preTemp()) {
          new adminView({});
          }
      },
      userRoleView_:function(){
       if (this.preTemp()) {
          new userRoleView();
          }
      },menuView_:function(){
       if (this.preTemp()) {
          new menuView();
          }
      }
  
      ,infoSettingsView_:function(actions){
       if (this.preTemp()) {
          new infoSettingsView();
          }
      }
  
      ,emailMasterView_:function(actions){
  
       if (this.preTemp()) {
          new emailMasterView();
          }
      },
      categoryView_:function(action){
       if (this.preTemp()) {
          new categoryView({ action: action });
        }
      },
      pages_:function(action){
  
       if (this.preTemp()) {
          new pagesMasterView({ action: action });
        }
      },
      addpage_:function(action){
  
       if (this.preTemp()) {
          new pagesMasterSingleDesign({ action: action });
        }
      },
      addservices_:function(action){
  
       if (this.preTemp()) {
          new servicesMasterSingleDesign({ action: action });
        }
      },
      blogs_:function(action){
       if (this.preTemp()) {
          new blogsMasterView({ action: action });
        }
      },
      services_:function(action){
       if (this.preTemp()) {
          new blogsMasterView({ action: action });
        }
      },
      addblog_:function(action){
  
       if (this.preTemp()) {
          new blogsMasterSingleDesign({ action: action });
        }
      },
      addCustomField_:function(action){
       if (this.preTemp()) {
          new dynamicFormView({ menuId: action });
        }
      },
      receiptView_:function(action){
       if (this.preTemp()) {
          new receiptView({ action: action });
        }
      },
      pushServiceView_:function(action){
       if (this.preTemp()) {
          new pushServiceView({ action: action });
        }
      },
      themeOptionView_:function(action){
       if (this.preTemp()) {
          new themeOptionView({ action: action });
        }
      },
      campaignsView_:function(action){
       if (this.preTemp()) {
          new campaignsView({ action: action });
        }
      },
      customerView_:function (action) {
        if (this.preTemp()) {
          new customerView({ action: action });
        }
      },
      appointmentView_:function(action){
       if (this.preTemp()) {
          new appointmentView({ action: action });
        }
      },
      taskView_:function(action){
       if (this.preTemp()) {
          new taskView({ action: action });
        }
      },
      taskActivityView_:function(action){
       if (this.preTemp()) {
          new taskView({ action: action, loadfrom: 'customerActivity' });
        }
      },
      appointmentActivityView_:function(action){
       if (this.preTemp()) {
          new appointmentView({ action: action, loadfrom: 'customerActivity' });
        }
      },
      loginlink_:function(actions){
        var loc = window.location.pathname;
        var template = _.template(appFull_temp);
        $("#master__load").addClass("login");
        $("#master__load").empty().append(template());
        new loginView();
      },
      resetPasswordRequest_:function(){
        var loc = window.location.pathname;
        var template = _.template(appFull_temp);
        $("#master__load").empty().append(template());
        var resetPasswordRequest = new resetPasswordRequestView({});
      },
      registerView_:function(){
        var loc = window.location.pathname;
        var template = _.template(appFull_temp);
        $("#master__load").addClass("login");
        $("#master__load").empty().append(template());
        new registerView();
      },
      pagesMenuMaster_:function(action){
       if (this.preTemp()) {
          new pagesMenuMasterView({ action: action });
        }
      },
      readFilesView_:function(action){
       if (this.preTemp()) {
          new readFilesView({ action: action, mnFolder: 'Y' });
        }
      },
      invoiceView_:function(action){
       if (this.preTemp()) {
          new taxInvoiceView({ action: action });
        }
      },
      eventView_:function(action){
       if (this.preTemp()) {
          new eventView({ action: action });
        }
      },
      avablityView_:function(action){
       if (this.preTemp()) {
          new avablityView({ action: action });
        }
      },
      servicesView_:function(action){
       if (this.preTemp()) {
          new servicesView({ action: action });
        }
      },
      careerView_:function(action){
       if (this.preTemp()) {
          new careerView({ action: action });
        }
      },
      ourClientsView_:function(action){
       if (this.preTemp()) {
          new ourClientsView({ action: action });
        }
      },
      customerdashboardView_:function (action, menuID) {
       if (this.preTemp()) {
          new customerdashboardView({ action: action, menuId: menuID});
        }
      },
      expencesView_:function(action){
       if (this.preTemp()) {
          new expencesView({ action: action });
        }
      },
      ourTeamView_:function(action){
       if (this.preTemp()) {
          new ourTeamView({ action: action });
        }
      },
      testimonialsView_:function(action){
       if (this.preTemp()) {
          new testimonialsView({ action: action });
        }
      },
      faqView_:function(action){
       if (this.preTemp()) {
          new faqView({ action: action });
        }
      },
      contactUsView_:function(action){
       if (this.preTemp()) {
          new contactUsView({ action: action });
        }
      },
      dynamicFormsView_:function(action){
       if (this.preTemp()) {
          new dynamicFormsView({ action: action });
        }
      },
      formMasterView_:function(action){
       if (this.preTemp()) {
          new formMasterView({ action: action });
        }
      },
      productView_:function(action){
       if (this.preTemp()) {
          new productView({ action: action });
        }
      },
      productStockView_:function(action){
       if (this.preTemp()) {
          new productStockView({ action: action });
        }
      },
      formQuestionsView_:function(action){
       if (this.preTemp()) {
          new formQuestionsView({ action: action });
        }
      },
      customModuleView_:function(action){
       if (this.preTemp()) {
          new customModuleView({ menuId: action });
        }
      },
      companyView_:function(action){
       if (this.preTemp()) {
          new companyView({ action: action });
        }
      },
      accountView_:function(action){
       if (this.preTemp()) {
          new accountView({ action: action });
        }
      },
      currencyView_:function(action){
       if (this.preTemp()) {
          new currencyView({ action: action });
        }
      },
      vendorView_:function(action){
       if (this.preTemp()) {
          new vendorView({ action: action });
        }
      },
      imageSliderView_:function(action){
       if (this.preTemp()) {
          new imageSliderView({ action: action });
        }
      },
      templatesView_:function(action){
       if (this.preTemp()) {
          new templatesView({ action: action });
        }
      },
      loginTemplateView_:function(action){
       if (this.preTemp()) {
          new loginTemplateView({ action: action });
        }
      },
      errorLogView_:function(action){
       if (this.preTemp()) {
          new errorLogView({ action: action });
        }
      },
      registrationView_:function(action){
       if (this.preTemp()) {
          new registrationView({ action: action });
        }
      },
      opportunityView_:function(action){
       if (this.preTemp()) {
          new opportunityView({ action: action });
        }
      },
      projectsView_:function(action){
        if (this.preTemp()) {
           new projectsView({ action: action });
         }
       },
      logoutlink_:function(){
        Swal.fire({
          title: 'Are you sure you want to Logout?',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Yes',
          denyButtonText: `No`,
        }).then((result) => {
          if (result.isConfirmed) {
            $.ajax({
              url: APIPATH + 'logout',
              method: 'POST',
              data: { adminID: $.cookie("authid"), key: $.cookie("_bb_key") },
              datatype: 'JSON',
              beforeSend: function (request) {
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SmemberID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                $.removeCookie('_bb_key', { path: COKI });
                $.removeCookie('fname', { path: COKI });
                $.removeCookie('lname', { path: COKI });
                $.removeCookie('authid', { path: COKI });
                $.removeCookie('avtar', { path: COKI });
                $.removeCookie('bbauth', { path: COKI });
                $.removeCookie('name', { path: COKI });
                $.removeCookie('uname', { path: COKI });
                delete $.cookie('authid');
                delete $.cookie('_bb_key');
                localStorage.removeItem("roleDetails");
                app_router.navigate("login", { trigger: true });
              }
            });
          } else if (result.isDenied) {
            if (selfobj.historyStack.length >= 1) {
              var previousView = selfobj.historyStack.pop(); // Get the previous view
              app_router.navigate(previousView, { trigger: true });
            }
          }
        })
        }
    }
});  