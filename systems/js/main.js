// Author: kiran Malave <kiran.malave@gmail.com>
// Filename: main.js

// All Global Path for images and API call
APPNAME = "Webtrix Solutions Customer";
COKI = "/";
APPPATH = "https://"+window.location.host+"/";
APIPATH = "https://"+window.location.host+"/API/";
APPPFRONTATH = "https://"+window.location.host+"/";

// APPPATH = "http://localhost/webtrix24_customer_portal/";
// APIPATH = "http://localhost/webtrix24_customer_portal/admin/";
// APPPFRONTATH = "http://localhost/webtrix24_customer_portal/admin/";

IMAGES = APPPATH + "images";
UPLOADS = APPPFRONTATH + "uploads";
PROFILEPHOTOUPLOAD = APPPFRONTATH + "uploads/profilephoto/";
AUPLOADS = APPPATH + "auploads";
COURSE = APPPFRONTATH + "course";

require.config({
 
  shim: {
    'bootstrap': {
      deps: ['jquery']
    },
    'jqueryUI': {
      deps: ['bootstrap', 'jquery']
    },
    'jqueryCookie': {
      deps: ['jquery']
    },
    'magnificPopup': {
      deps: ['jquery']
    },
    'flot': {
      deps: ['jquery']
    },
    'datepickerBT': {
      deps: ['jquery']
    },
    'timepicker': {
      deps: ['jquery']
    },
    'moment': {
      deps: ['jquery']
    },
    'wysiwyg': {
      deps: ['jquery', 'hotkeys']
    },
    'curvedLines': {
      deps: ['jquery', 'flot']
    },
    'typeahead': {
      deps: ['jquery']
    },
    'tagmanager': {
      deps: ['jquery']
    },
    'validate': {
      deps: ['jquery']
    },
    'inputmask': {
      deps: ['jquery']
    },
    'icheck': {
      deps: ['jquery']
    },
    'select2': {
      deps: ['jquery']
    },
    'slim': {
      deps: ['jquery']
    },
    'multiselect': {
      deps: ['jquery']
    },
    'RealTimeUpload': {
      deps: ['jquery']
    },
    'minicolors': {
      deps: ['jquery']
    },
    'Quill': {
      deps: ['jquery']
    },
    'templateEditor': {
      deps: ['jquery', 'Quill', 'minicolors']
    },
    'customDashboard': {
      deps: ['jquery', 'Quill', 'minicolors']
    },
    'admin': {
      deps: ['jquery', 'moment', 'Waves']
    },
    'jqueryNestable': {
      deps: ['jquery']
    },
    'bootstrapSelect': {
      deps: ['jquery', 'bootstrap']
    },
    'notify': {
      deps: ['jquery', 'bootstrap']
    },
    'custom': {
      deps: ['jquery', 'moment', 'Waves', 'notify']
    },
    'fullcalendar': {
      deps: ['jquery', 'bootstrap']
    },
    'adminjs': {
      deps: ['jquery', 'bootstrap']
    },
    'calender': {
      deps: ['jquery', 'bootstrap']
    },
    'Swal': {
      deps: ['jquery', 'bootstrap']
    },
    'owlcarousal': {
      deps: ['jquery', 'bootstrap']
    },
  },
  paths: {
    bootstrap: '../../assets/bootstrap/js/bootstrap.bundle.min',
    jquery: '../libs/jquery/jquery-min',
    underscore: '../libs/underscore/underscore-min',
    backbone: '../libs/backbone/backbone-min',
    jqueryCookie: '../../assets/jquery.cookies/jquerycookie',
    bootstrapSlider: '../../assets/range_slider/bootstrap-slider',
    magnificPopup: '../../assets/magnific-popup/jquery.magnific-popup-min',
    locationpicker: '../../assets/map/locationpicker',
    fastclick: 'fastclick/lib/fastclick',
    datepickerBT: '../../assets/datepicker/dist/js/bootstrap-datepicker',
    timepicker: '../../assets/timepicker/timepicker',
    hotkeys: '../../assets/bootstrapWysiwyg/jquery.hotkeys',
    wysiwyg: '../../assets/bootstrapWysiwyg/bootstrap-wysiwyg',
    tagmanager: '../../assets/tagmanager/tagmanager.min',
    typeahead: '../../assets/tagmanager/bootstrap3-typeahead.min',
    flot: '../../assets/Flot/jquery.flot',
    curvedLines: '../../assets/flot.curvedlines/curvedLines',
    validate: '../../assets/jquery.validate/jquery.validate.min',
    inputmask: '../../assets/inputMask/jquery.inputmask.bundle',
    icheck: '../../assets/iCheck/icheck.min',
    select2: '../../assets/select2/js/select2.full.min',
    moment: '../../assets/datepicker/moment.min',
    jqueryUI: '../../assets/jquery-ui/jquery-ui.min',
    plugin: '../../plugin',
    slim: '../../assets/slim/slim.jquery.min',
    multiselect: '../../assets/multiselect/js/multiselect.min',
    RealTimeUpload: '../../assets/realTimeUpload/js/RealTimeUpload',
    Waves: '../../assets/theme-setup/plugins/node-waves/waves.min',
    adminjs: '../../assets/theme-setup/js/admin',
    jqueryNestable: '../../assets/jquery-nestable/jquery.nestable',
    custom: 'custom',
    xlsx: '../../assets/SheetJS/xlsx.full.min',
    xlsprocess: '../../assets/SheetJS/xlsProcess',
    minicolors: '../../assets/Color-Picker/jquery.minicolors',
    Quill: '../../assets/quill-1.3.6/quill.min',
    templateEditor: '../../assets/templateEditor/dragDrop',
    customDashboard: '../../assets/customDashboard/customDashboard',
    bootstrapSelect: '../../assets/bootstrap-select-1.13.14/dist/js/bootstrap-select.min',
    notify: '../../assets/theme-setup/plugins/bootstrap-notify/bootstrap-notify.min',
    fullcalendar: '../../assets/theme-setup/plugins/fullcalendar/fullcalendar.min',
    calender: '../../assets/bootstrap-calendar/calender/main',
    Swal: '../../assets/theme-setup/plugins/sweetalert/sweetalert2.min',
    owlcarousal: '../../assets/owlcarousal/owl.carousel',
    jquery360: '../../assets/jquery-ui/jquery-ui.min',
  }
});


require([
  // Load our app module and pass it to our definition function
  'app',

], function (App) {
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  App.initialize();
});
