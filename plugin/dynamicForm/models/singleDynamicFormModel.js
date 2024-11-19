define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var singleDynamicFormModel = Backbone.Model.extend({
    idAttribute: "fieldID",
    defaults: {
      fieldID: null,
      fieldLabelold: '',
      fieldLabel: '',
      fieldType: null,
      placeholder: null,
      tooltip: null,
      defaultValue: '',
      isRequired: 'no',
      fieldOptions: null,
      fieldIndex: '',
      allowMultiSelect: 'no',
      minLength: null,
      maxLength: null,
      startDate: null,
      endDate: null,
      dateFormat: null,
      supportedFileTypes: null,
      numberOfFileToUpload: null,
      validationRules: null,
      startTime: "11:00 AM",
      endTime: "11:00 AM",
      displayFormat: "24-hours",
      minRangeValue: null,
      maxRangeValue: null,
      stepSize: null,
      numType: "INT",
      isNull: "FALSE",
      valDefault: "NULL",
      modified_by: null,
      created_date: null,
      modified_date: null,
      allowMultiSelect: 'no',
      status: 'active',
      menuID: null,
      itemAlign: 'vertical',
      textareaType: 'simpleTextarea',
      linkedWith: null,
      date_selection_criteria: 'both',
    },
    urlRoot: function () {
      return APIPATH + 'dynamicformfield/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return singleDynamicFormModel;
});