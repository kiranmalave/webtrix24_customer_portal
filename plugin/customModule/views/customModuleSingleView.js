define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'moment',
    'RealTimeUpload',
    'Swal',
    '../../core/views/multiselectOptions',
    '../../dynamicForm/views/dynamicFieldRender',
    '../models/customSingleModel',
    '../../readFiles/views/readFilesView',
    'text!../templates/customModuleSingle_temp.html',
  ], function ($, _, Backbone, validate, inputmask, datepickerBT,moment,RealTimeUpload,Swal,multiselectOptions, dynamicFieldRender,customSingleModel,readFilesView, customModuleSingletemp) {
  
    var customModuleSingleView = Backbone.View.extend({
      model: customSingleModel,
      menuId:'',
      makeRender:true,
      form_label:'',
      initialize: function (options) {
        var selfobj = this;
        this.uploadFileElArray = [];
        this.toClose = "customModuleSingleView";
        this.pluginName = Backbone.history.getFragment();
        if(options.menuId != undefined){
          this.menuId = options.menuId;
        }
        this.LastID = '';
        this.recordID = options.customModule_id ;
        this.form_label = options.form_label;
        this.model = new customSingleModel();
        this.scanDetails = options.searchCustomColumns;
        this.multiselectOptions = new multiselectOptions();
        $(".modelbox").hide();
          this.model.set({ id: options.customModule_id });
          this.model.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            },data:{menuId:this.menuId}, error: selfobj.onErrorHandler
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (options.menuId != "") {
              selfobj.model.set({ menuId: options.menuId });
              selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
            }
          });     
      },

      events:
      {
        "click .saveCustomModuleDetails": "saveCustomModuleDetails",
        "blur .txtchange": "updateOtherDetails",
        "blur .multiselectOpt": "updatemultiSelDetails",
        "click .singleSelectOpt": "selectOnlyThis",
        "click .multiSel": "setValues",
        "change .dropval": "updateOtherDetails",
        "click .loadAttachment": "loadAttachment",
        "click .hideUploadMedia": "hideUploadMedia",
        "click .deleteAttachment": "deleteAttachment",
      },
  
      attachEvents: function () {
        this.$el.off('click', '.saveCustomModuleDetails', this.saveCustomModuleDetails);
        this.$el.on('click', '.saveCustomModuleDetails', this.saveCustomModuleDetails.bind(this));
        this.$el.off('click', '.multiSel', this.setValues);
        this.$el.on('click', '.multiSel', this.setValues.bind(this));
        this.$el.off('change', '.dropval', this.updateOtherDetails);
        this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
        this.$el.off('blur', '.txtchange', this.updateOtherDetails);
        this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
        this.$el.off('blur', '.multiselectOpt', this.updatemultiSelDetails);
        this.$el.on('blur', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
        this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
        this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
        this.$el.off("click", ".loadAttachment", this.loadAttachment);
        this.$el.on("click", ".loadAttachment", this.loadAttachment.bind(this));
        this.$el.off('click', '.hideUploadMedia', this.hideUploadMedia);
        this.$el.on('click', '.hideUploadMedia', this.hideUploadMedia.bind(this));
        this.$el.off('click', '.deleteAttachment', this.deleteAttachment);
        this.$el.on('click', '.deleteAttachment', this.deleteAttachment.bind(this));
      },
  
      onErrorHandler: function (collection, response, options) {
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
      },

      loadAttachment: function (e) {
        let fieldID = $(e.currentTarget).attr("id");
        $('.upload_'+fieldID).show();
        $('.dotborder_'+fieldID).hide();
      },

      hideUploadMedia: function (e) {
        let fieldID = $(e.currentTarget).attr("id");
        $('.upload_'+fieldID).hide();
        $('.dotborder_'+fieldID).show();
      },

      deleteAttachment: function (e) {
        let file_id = $(e.currentTarget).attr("data-file_id");
        let record_id = this.model.get("id");
        let div = document.getElementById('removeIMG');
        let status = "delete";
        let selfobj = this;
        Swal.fire({
          title: "Delete Attachment ",
          text: "Do you want to delete Attachment ?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Delete',
          animation: "slide-from-top",
        }).then((result) => {
          if (result.isConfirmed) {
            if (file_id != null) {
              $.ajax({
                url: APIPATH + 'customModule/removeAttachment',
                method: 'POST',
                data: { fileID: file_id, status: status, recordID: record_id },
                datatype: 'JSON',
                beforeSend: function (request) {
                  request.setRequestHeader("token", $.cookie('_bb_key'));
                  request.setRequestHeader("SadminID", $.cookie('authid'));
                  request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                  request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                  if (res.flag == "F")
                    showResponse(e,res,'');
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  if (res.flag == "S") {
                    $('#' + file_id + 'removeDiv').remove();
                    selfobj.model.set({ "attachment_file": "" });
                  }
      
                }
              });
            } else {
              div.remove();
              selfobj.model.set({ "attachment_file": "" });
            }
          }else{
  
          }
        });
  
        
      },

      updateOtherDetails: function (e) {
        var selfobj = this;
        var valuetxt = $(e.currentTarget).val();
        var toName = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toName] = valuetxt;
        this.model.set(newdetails);
        if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
          this.model.set(toName, this.model.get(toName).join(","));
        };
      },

      updatemultiSelDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toName = $(e.currentTarget).attr("id");
        var existingValues = this.model.get(toName);
        if (existingValues === null || existingValues === undefined) {
            existingValues = '';
        } else if (typeof existingValues !== 'string') {
            existingValues = existingValues.toString();
        }
        existingValues = existingValues.replace(/NULL/ig, '');
        existingValues = existingValues.replace(/^,|,$/g, '');
        if ($(e.currentTarget).prop('checked')) {
            if (existingValues.indexOf(valuetxt) === -1) {
                existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
            }
        } else {
            existingValues = existingValues.split(',').filter(value => value !== valuetxt).join(',');
        }
        this.model.set({ [toName]: existingValues });
      },
    
      selectOnlyThis: function(e) {
        var clickedCheckbox = e.currentTarget;
        var valueTxt = $(clickedCheckbox).val();
        var toName = $(clickedCheckbox).attr("id");
        this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
        var existingData = this.model.get(toName);
        this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
      },
  
      setOldValues: function () {
        var selfobj = this;
        setvalues = ["type"];
        selfobj.multiselectOptions.setValues(setvalues, selfobj);
      },
  
      setValues: function (e) {
        var selfobj = this;
        var da = selfobj.multiselectOptions.setCheckedValue(e);
        selfobj.model.set(da);
      },
  
      initializeValidate: function () {
        var selfobj = this;
        var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
        if (!_.isEmpty(dynamicRules)) {
          var feildsrules = $.extend({}, dynamicRules);
        }
      },

      saveCustomModuleDetails: function (e) {
        e.preventDefault();
        let selfobj = this;
        var mid = this.model.get("id");
        // var fieldID = 659;
        let isNew = $(e.currentTarget).attr("data-action");
        if (mid == "" || mid == null) {
          var methodt = "PUT";
        } else {
          var methodt = "POST";
        }
        if ($("#customModuleDetails").valid()) {
          $(e.currentTarget).html("<span>Saving..</span>");
          $(e.currentTarget).attr("disabled", "disabled");
          this.model.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: methodt,menuID: selfobj.menuId,
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.lastID != undefined) {
              selfobj.LastID = res.lastID;
            }else{
              selfobj.LastID = mid;
            }
            if (isNew == "new") {
              showResponse(e, res, "Save & New");
            } else {
              showResponse(e, res, "Save");
            }
            selfobj.scanDetails.filterSearch();
            if (res.flag == "S") {
              if (isNew == "new") {
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.model.set({ menuId: selfobj.menuId});
                selfobj.makeRender = false;
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                var form_label = selfobj.form_label.replace(/ /g, '_');
              
                selfobj.uploadFileElArray.forEach(function(uploadFileEl, index) {
                  var fieldID = $(uploadFileEl.elements).attr('id').split('_')[1];
                  var fileTypes = [];
                  var uploadedFileTypes = $(uploadFileEl.elements).attr('data-fileTypes');
                  uploadedFileTypes.split(',').forEach(function(type) {
                      fileTypes.push(type.trim());
                  });
                  var noOfFiles = $(uploadFileEl.elements).attr('data-noOfFiles');
                  let url = APIPATH + 'customUpload/?menuID=' + selfobj.menuId + '&recordID=' + selfobj.LastID + '&fieldID=' + fieldID + '&module=' + form_label + '&fileTypes=' + fileTypes + '&noOfFiles=' + noOfFiles;
                  uploadFileEl.elements.parameters.action = url;
                  uploadFileEl.prepareUploads(uploadFileEl.elements);
                });

                handelClose("categorySingleView");
              } else {
                var form_label = selfobj.form_label.replace(/ /g, '_');
              
                selfobj.uploadFileElArray.forEach(function(uploadFileEl, index) {
                  var fieldID = $(uploadFileEl.elements).attr('id').split('_')[1];
                  var fileTypes = [];
                  var uploadedFileTypes = $(uploadFileEl.elements).attr('data-fileTypes');
                  uploadedFileTypes.split(',').forEach(function(type) {
                      fileTypes.push(type.trim());
                  });
                  var noOfFiles = $(uploadFileEl.elements).attr('data-noOfFiles');
                  let url = APIPATH + 'customUpload/?menuID=' + selfobj.menuId + '&recordID=' + selfobj.LastID + '&fieldID=' + fieldID + '&module=' + form_label + '&fileTypes=' + fileTypes + '&noOfFiles=' + noOfFiles;
                  uploadFileEl.elements.parameters.action = url;
                  uploadFileEl.prepareUploads(uploadFileEl.elements);
                });

                handelClose(selfobj.toClose);
                handelClose("categorySingleView");
              }
            }
          });
        }
      },

      render: function () {
        var selfobj = this;
        var source = customModuleSingletemp;
        var template = _.template(source);
        $("#" + this.toClose).remove();
        this.$el.html(template({ "model": this.model.attributes,dynamicFieldRenderobj : selfobj.dynamicFieldRenderobj }));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id', this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role", "tabpanel");
        this.$el.data("current", "yes");
        $(".tab-content").append(this.$el);
        $('#' + this.toClose).show();
        $("#dynamicFormFields").empty().append(selfobj.dynamicFieldRenderobj.getform());
        this.initializeValidate();
        this.setOldValues();
        // this.attachEvents();
        rearrageOverlays(selfobj.form_label, this.toClose);
        // Target all elements with class ".customUpload"
        $('body').find(".customUpload").each(function(index) {
          var uploadId = $(this).attr('id');
          var fileTypes = $(this).attr('data-fileTypes');
        
          var fileTypeArray = fileTypes.split(',').map(function(type) {
            return type.trim();
          });
          // var formattedFileTypes = fileTypeArray.map(function(type) {
          //   return "'" + type + "'";
          // });
          // var fileTypesArray = '[' + formattedFileTypes.join(', ') + ']';
          var fileTypesArray = fileTypeArray;
          var noOfFiles = $(this).attr('data-noOfFiles') ? $(this).attr('data-noOfFiles') : 0;
          
          // Initialize RealTimeUpload plugin for each element
          var uploadFileEl = $(this).RealTimeUpload({
              text: 'Drag and Drop or Select a File to Upload.',
              maxFiles: parseInt(noOfFiles),
              maxFileSize: 4194304,
              uploadButton: false,
              notification: true,
              autoUpload: false,
              extension: fileTypesArray,
              // extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf','docx', 'doc', 'xls', 'xlsx'],
              thumbnails: true,
              action: APIPATH + 'customUpload',
              element: uploadId, // Use a unique identifier for each element
              onSucess: function() {
                  selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
                  $('.modal-backdrop').hide();
              }
          });
          selfobj.uploadFileElArray.push(uploadFileEl);
        });

        const uploadedMedia = this.model.get("uploadedMedia");

        // Check if uploadedMedia is an array and has elements
        if (Array.isArray(uploadedMedia) && uploadedMedia.length > 0) {
            // Iterate over each object in the uploadedMedia array
            uploadedMedia.forEach(item => {
                const attachment_file = item.attachFile; // Array of file names
                const attachment_fieldID = item.attachment_fieldID; // Array of field IDs
                const attachment_id = item.attachment_id; // Array of attachment IDs
                
                // Check if attachment_file, attachment_fieldID, and attachment_id are arrays and have the same length
                if (Array.isArray(attachment_file) && Array.isArray(attachment_fieldID) && Array.isArray(attachment_id) && 
                    attachment_file.length === attachment_fieldID.length && attachment_file.length === attachment_id.length) {
                    
                    let docUrl = ""; // Initialize the docUrl variable

                    // Iterate over each file in the arrays
                    for (let i = 0; i < attachment_file.length; i++) {
                        const fName = attachment_file[i];
                        const ftext = fName.split(".");
                        let modifiedFName = fName;
                        var imgPath ;
                        const file_ids = attachment_id[i];

                        if (ftext[1] === "xls" || ftext[1] === "xlsx") {
                          modifiedFName = "excel.png";
                          imgPath = `${UPLOADS}${modifiedFName}`;
                        } else if (ftext[1] === "pdf") {
                            modifiedFName = "pdf.png";
                            imgPath = `${UPLOADS}${modifiedFName}`;
                        } else {
                            imgPath = `${UPLOADS}${selfobj.form_label}/${selfobj.recordID}/${modifiedFName}`;
                        }
                        // Construct the HTML for each file
                        docUrl += `<div id="${file_ids}removeDiv" class="attachedPic" data-show="singleFile">
                                        <div class="thumbnail">
                                            <div class="centered removeAttach">
                                                <img id="removeIMG" class="img-fluid fileImage img-thumbnail" src="${imgPath}" alt="">                
                                                <div class="buttonShow visableAttach">
                                                    <span class="attachView">
                                                        <a href="${UPLOADS}${selfobj.form_label}/${selfobj.recordID}/${modifiedFName}" target="_blank">
                                                            <span class="material-icons">visibility</span>
                                                        </a>
                                                    </span>
                                                    <span class="deleteAttach deleteAttachment" data-file_id="${file_ids}">
                                                        <span class="material-icons">delete</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
                    }

                    // Append the generated HTML to the "attachedDocs" div
                    $('body').find(".attachedDocs_"+attachment_fieldID).empty();
                    $(".attachedDocs_"+attachment_fieldID).append(docUrl);
                } else {
                    console.log("Attachment arrays have different lengths or are not arrays.");
                }
            });
        } else {
            console.log("uploadedMedia is not an array or it is empty.");
        }

        return this;
      },
      
      onDelete: function () {
        this.remove();
      }
    });
  
    return customModuleSingleView;
  
  });