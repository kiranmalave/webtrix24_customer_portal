(function ($) {
  var RealTimeUploadFormsArray = [];
  $.fn.RealTimeUpload = function (options) {
    var totalUploaded = 0;
    var elements = document.getElementById(options.element);
    var settings = $.extend({}, $.fn.RealTimeUpload.defaults, options), filelist = [];
    var onSucess = settings.onSucess;

    if (typeof elements === 'undefined') {
      var inputs = document.getElementsByTagName('input');

      elements = [];
      for (var i = 0, l = inputs.length; i < l; i++) {
        if (typeof inputs[i].type !== 'undefined' && inputs[i].type == 'file') {
          elements.push(inputs[i]);
        }
      }
    } else {
      // nothing to do here, the elements parameter is already specified
    }
    //this.initialize();
    init = function () {
      if (!this instanceof init) {
        return new init(file, options);
      }
      this.elements = elements;
      this.settings = $.extend({}, settings);
      this.initialize();
    }

    init.prototype = {
      initialize: function () {
        if (this.elements instanceof Array) { // array of file elements
          for (var i = 0, l = this.elements.length; i < l; i++) {
            this.configureUploadElement(this.elements[i], i);
          }
        } else { // single file element
          this.configureUploadElement(this.elements, 0);
        }
      },

      configureUploadElement: function (element, id) {

        // Add the current element and configuration to the list of all upload input
        RealTimeUploadFormsArray.push([this.settings, element]);


        // Object that will contain all elements associated to the upload input
        element.objects = {};


        // Set parameter of the upload input
        element.parameters = {
          'debug': false,
          'text': 'Drag and Drop or Select a file to Upload', // the text shown on the button
          'method': 'POST',
          'action': window.location.href,
          'sendForm': false,
          'data': {},
          'callbackSuccess': '',
          'callbackError': '',
          'dropzone': undefined,
          'autoUpload': true,
          'uploadButton': false,
          'files': 0, // the number of files that are being uploaded
          'maxFiles': 0, // the maximum number of files to upload allowed
          'started': 0,
          'finished': 0,
          'remaining': 0,
          'size': 0, // total size of all items uploaded
          'maxFileSize': 0, // maximum size in kilobytes allowed per file (0 means no limit)
          'maxTotalSize': 0, // maximum size in kilobytes allowed for all files (0 means no limit)
          'concurrentUploads': 3, // maximum number of files that can be uploaded simultaneously
          'slice': true, // enable file-slicing (reduce upload error occurence for large files, allow pausing upload)
          'sliceSize': 400, // slice size in KB
          'notification': false, // show notification when upload finished or failed
          'notificationIcon': '', // icon url for the notifications
          'extension': [],
          'grid': false,
          'thumbnails': true, // display a thumbnail if the file uploaded is an image
          'maxWidth': 0, // if image, max width allowed (0 means no limit)
          'maxHeight': 0, // if image, max width allowed
        };

        // Object that will contain all files that are being uploaded
        element.uploadList = [];

        // If debug is activated, informations and datas will be sent to the browser console (console.log())
        if (typeof this.settings.debug === 'boolean') {
          element.parameters.debug = this.settings.debug;
        }

        if (typeof this.settings.text !== 'undefined') {
          element.parameters.text = this.settings.text;
        }

        if (element.form != null) {
          if (element.form.getAttribute('method') != null) {
            element.parameters.method = element.form.getAttribute('method');
          }
          if (element.form.getAttribute('action') != null && element.form.getAttribute('action') != '#') {
            console.log("Open URL 1" + element.parameters.action);
            element.parameters.action = element.form.getAttribute('action');
            console.log("Open URL 2" + element.parameters.action);
          }
        }
        else {
          if (typeof this.settings.action != null) {
            element.parameters.action = this.settings.action;
          }
        }
        // if set to true, the value of all the other input in the same form than the file input will be sent along the file to upload
        if (typeof this.settings.sendForm === 'boolean') {
          element.parameters.sendForm = this.settings.sendForm;
        }

        // if an object containing different key with associated values is specified, send it will the file being uploaded
        if (typeof this.settings.data !== 'undefined') {
          element.parameters.data = this.settings.data;
        }

        // if a function is specified, it will be called when an upload is done
        if (typeof this.settings.callbackSuccess !== 'undefined' && this.settings.callbackSuccess != '') {
          element.parameters.callbackSuccess = this.settings.callbackSuccess;
        }

        // if a function is specified, it will be called when an upload fail
        if (typeof this.settings.callbackError !== 'undefined' && this.settings.callbackError != '') {
          element.parameters.callbackError = this.settings.callbackError;
        }

        // if one or multiple alternative drop zone are defined, use them
        if (typeof this.settings.dropzone !== 'undefined') {
          element.parameters.dropzone = this.settings.dropzone;
        }

        // if automatic upload is disabled
        if (typeof this.settings.autoUpload === 'boolean' && !this.settings.autoUpload) {
          element.parameters.autoUpload = this.settings.autoUpload;
        }

        // if specified an upload button will be added
        if (typeof this.settings.uploadButton === 'boolean' && this.settings.uploadButton) {
          element.parameters.uploadButton = this.settings.uploadButton;
        }

        // if a value maximum number of file is specified, use it as the default value
        if (typeof this.settings.maxFiles !== 'undefined' && !isNaN(this.settings.maxFiles)) {
          element.parameters.maxFiles = this.settings.maxFiles;
        }

        // if a value is specified, use it as the default value (size of previously uploaded files)
        if (typeof this.settings.size !== 'undefined' && !isNaN(this.settings.size)) {
          element.parameters.size = this.settings.size;
        }

        // if a value for the maximum size per file is specified, use it as the default value
        if (typeof this.settings.maxFileSize !== 'undefined' && !isNaN(this.settings.maxFileSize)) {
          element.parameters.maxFileSize = (this.settings.maxFileSize * 1024);
        }

        // if a value for the maximum size for all files is specified, use it as the default value
        if (typeof this.settings.maxTotalSize !== 'undefined' && !isNaN(this.settings.maxTotalSize)) {
          element.parameters.maxTotalSize = (this.settings.maxTotalSize * 1024);
        }

        // maximum number of files that can be uploaded simultaneously, 0 means no limit
        if (typeof this.settings.concurrentUploads !== 'undefined' && !isNaN(this.settings.concurrentUploads)) {
          element.parameters.concurrentUploads = this.settings.concurrentUploads;
        }

        // enable file-slicing (reduce upload error occurence for large files, allow pausing upload)
        if (typeof this.settings.slice === 'boolean') {
          element.parameters.slice = this.settings.slice;
        }

        // slice size in KB
        if (typeof this.settings.sliceSize !== 'undefined' && !isNaN(this.settings.sliceSize)) {
          element.parameters.sliceSize = this.settings.sliceSize;
        }

        // set notifcation if parameter is specified
        if (typeof this.settings.notification === 'boolean' && this.settings.notification) {
          element.parameters.notification = this.settings.notification;
          this.askNotificationPermission();
        }

        // set the notifcation icon url if specified
        if (typeof this.settings.notificationIcon !== 'undefined') {
          element.parameters.notificationIcon = this.settings.notificationIcon;
        }

        // create a whitelist of extension if specified (else every extension will be allowed)
        if (typeof this.settings.extension !== 'undefined' && this.settings.extension instanceof Array) {
          element.parameters.extension = this.settings.extension;
        }

        // display upload elements as grid instead of list
        if (typeof this.settings.grid === 'boolean' && this.settings.grid) {
          element.parameters.grid = this.settings.grid;
        }

        // show thumbnails for image if parameter is specified
        if (typeof this.settings.thumbnails === 'boolean' && this.settings.thumbnails) {
          element.parameters.thumbnails = this.settings.thumbnails;
        }

        // if image, max width allowed (0 means no limit)
        if (typeof this.settings.maxWidth !== 'undefined' && !isNaN(this.settings.maxWidth)) {
          element.parameters.maxWidth = this.settings.maxWidth;
        }

        // if image, max width allowed
        if (typeof this.settings.maxHeight !== 'undefined' && !isNaN(this.settings.maxHeight)) {
          element.parameters.maxHeight = this.settings.maxHeight;
        }


        // Hide file input
        this.addClass(element, 'RTU-hiddenFile');

        // Create the upload container and label
        element.objects.uploadContainer = document.createElement('div');
        if (element.parameters.grid) {
          element.objects.uploadContainer.className = 'RTU-gridContainer'; // display upload list as grid
        } else {
          element.objects.uploadContainer.className = 'RTU-uploadContainer'; // display upload list as list (default)
        }

        element.objects.uploadLabel = document.createElement('label');
        element.objects.uploadLabel.className = 'RTU-uploadLabel upload-left';

        if (typeof element.id === 'undefined' || element.getAttribute('id') == null) {
          element.id = 'RealTimeUpload-' + id + '-' + RealTimeUploadFormsArray.length;
        }
        element.objects.uploadLabel.htmlFor = element.id;

        element.objects.uploadLabelImage = document.createElement('div');
        element.objects.uploadLabelImage.className = 'RTU-uploadLabelImage';

        element.objects.uploadLabelText = document.createElement('div');
        element.objects.uploadLabelText.className = 'RTU-uploadLabelText';
        element.objects.uploadLabelText.innerHTML = element.parameters.text;

        element.objects.uploadLabel.appendChild(element.objects.uploadLabelImage);
        element.objects.uploadLabel.appendChild(element.objects.uploadLabelText);

        element.objects.uploadContainer.appendChild(element.objects.uploadLabel);
        element.parentNode.insertBefore(element.objects.uploadContainer, element.nextSibling);

        // Resize the upload list
        /* var w = element.objects.uploadLabel.offsetWidth;
         if(!isNaN(w) && w > 0) {
           element.objects.uploadContainer.style.width = w+'px';
         }*/


        element.objects.uploadItemsList = document.createElement('div');
        element.objects.uploadItemsList.className = 'RTU-uploadItemsList';

        if (typeof element.objects.uploadItemsList.dataset === 'undefined') {
          element.objects.uploadItemsList.dataset = {};
        }
        //element.objects.uploadItemsList.dataset.upload = 0; // not working with css in ie 11, 
        element.objects.uploadItemsList.setAttribute("data-upload", 0);
        element.objects.uploadContainer.appendChild(element.objects.uploadItemsList);


        // Add a button to start the uploads if the option 'uploadButton' is specified
        if (element.parameters.uploadButton) {
          element.objects.uploadButtonHolder = document.createElement('div');
          element.objects.uploadButtonHolder.className = 'RTU-uploadButtonHolder';
          element.objects.uploadButton = document.createElement('div');
          element.objects.uploadButton.className = 'RTU-uploadButton';
          element.objects.uploadButton.innerHTML = 'Start Upload';
          element.objects.uploadButtonHolder.appendChild(element.objects.uploadButton);
          element.objects.uploadContainer.appendChild(element.objects.uploadButtonHolder);

          var self = this;
          element.objects.uploadButton.addEventListener('click', function () { self.prepareUploads(element); }, false)
        }


        // Create events attached to the upload button
        this.addDropEvent(element);
      },

      addDropEvent: function (element) {

        var self = this;

        // Add event to upload files when input value change
        element.addEventListener("change", function (e) {
          self.fileAdded(element, e);
        }, false);


        // Add events to show when the file input is focused (for keyboard navigation)
        element.addEventListener("focus", function (e) {
          self.addClass(element.objects.uploadLabel, 'RTU-uploadLabelActive');
        }, false);
        element.addEventListener("blur", function (e) {
          self.removeClass(element.objects.uploadLabel, 'RTU-uploadLabelActive');
        }, false);


        // Events to upload files when files are drag and dropped
        document.addEventListener('dragover', function (e) {
          self.cancelDefaultEvent(e);
          self.addClass(element.objects.uploadLabel, 'RTU-droppable');
        }, false);

        document.addEventListener('dragleave', function (e) {
          self.cancelDefaultEvent(e);
          self.removeDropBorder();
        }, false);

        element.objects.uploadContainer.addEventListener('drop', function (e) {
          self.cancelDefaultEvent(e);
          self.removeDropBorder();
          self.fileAdded(element, e);
        }, false);

        document.addEventListener('drop', function (e) {
          self.removeDropBorder();
        }, false);


        // If one or multiple dropzone are defined, attach a drop event to them
        if (typeof element.parameters.dropzone !== 'undefined') {
          if (element.parameters.dropzone.constructor === Array) {
            for (var i = 0, l = element.parameters.dropzone.length; i < l; i++) {
              element.parameters.dropzone[i].addEventListener('drop', function (e) {
                self.cancelDefaultEvent(e);
                self.fileAdded(element, e);
                self.removeDropBorder();
              }, false);
            }
          } else {
            element.parameters.dropzone.addEventListener('drop', function (e) {
              self.cancelDefaultEvent(e);
              self.fileAdded(element, e);
              self.removeDropBorder();
            }, false);
          }
        }
      },

      removeDropBorder: function () { // Remove borders around drop zone
        for (var i = 0, l = RealTimeUploadFormsArray.length; i < l; i++) {
          if (typeof RealTimeUploadFormsArray[i][1].objects !== 'undefined' && typeof RealTimeUploadFormsArray[i][1].objects.uploadLabel !== 'undefined') {
            this.removeClass(RealTimeUploadFormsArray[i][1].objects.uploadLabel, 'RTU-droppable');
          }
        }
      },

      fileAdded: function (element, e) {
        var files = e.target.files || e.dataTransfer.files;
        if (typeof files !== 'undefined') {
          for (var i = 0, f; f = files[i]; i++) {
            var position = element.uploadList.length;
            var uploadElements = {};

            // Add the object containing the uploadItem and its childs
            element.uploadList.push(uploadElements);

            element.uploadList[position].file = f;

            this.getFileInformations(element, position);
            this.addFileToList(element, position);
          }
        } else {
          // if browser does not support the HTML files API
        }
      },

      getFileInformations: function (element, position) {
        element.uploadList[position].name = element.uploadList[position].file.name;
        element.uploadList[position].type = element.uploadList[position].file.type;
        element.uploadList[position].size = element.uploadList[position].file.size;
        element.uploadList[position].extension = this.fileExtension(element.uploadList[position].file.name);
        element.uploadList[position].error = 0;
        element.uploadList[position].status = 'pending'; // awaiting
      },

      addFileToList: function (element, position) {
        var self = this;

        element.uploadList[position].uploadItem = document.createElement('div');
        element.uploadList[position].uploadItem.className = 'RTU-uploadItem';


        // if the file is an image create a thumbnail (only if specified)
        if (element.parameters.thumbnails && element.uploadList[position].type.indexOf('image') == 0) {
          element.uploadList[position].uploadItemIcon = document.createElement('img');
          var img = new Image();
          img.onload = function () {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var dataURL;
            canvas.height = 120;
            canvas.width = 120;

            // size of the image after resize
            var imageRatio = (this.width / this.height);
            var sizeRatio = 0;
            if (imageRatio <= 1) {
              sizeRatio = (this.width / canvas.width);
            } else {
              sizeRatio = (this.height / canvas.height);
            }
            var imageRW = (this.width / sizeRatio);
            var imageRH = (this.height / sizeRatio);
            var centerW = (canvas.width - imageRW) / 2;
            var centerH = (canvas.height - imageRH) / 2;
            ctx.drawImage(this, centerW, centerH, imageRW, imageRH);

            dataURL = canvas.toDataURL();
            element.uploadList[position].uploadItemIcon.src = dataURL;
            canvas = null;
          };
          img.src = URL.createObjectURL(element.uploadList[position].file);

        } else {
          element.uploadList[position].uploadItemIcon = document.createElement('div');
          element.uploadList[position].uploadItemIcon.innerHTML = element.uploadList[position].extension;
        }
        element.uploadList[position].uploadItemIcon.className = 'RTU-uploadItemIcon';
        element.uploadList[position].uploadItem.appendChild(element.uploadList[position].uploadItemIcon);


        element.uploadList[position].uploadItemText = document.createElement('div');
        element.uploadList[position].uploadItemText.className = 'RTU-uploadItemText';
        element.uploadList[position].uploadItemText.innerHTML = element.uploadList[position].name;
        element.uploadList[position].uploadItem.appendChild(element.uploadList[position].uploadItemText);


        element.uploadList[position].uploadItemControls = document.createElement('div');
        element.uploadList[position].uploadItemControls.className = 'RTU-uploadItemControls';
        element.uploadList[position].uploadItem.appendChild(element.uploadList[position].uploadItemControls);

        element.uploadList[position].uploadItemSize = document.createElement('div');
        element.uploadList[position].uploadItemSize.className = 'RTU-uploadItemSize';
        element.uploadList[position].uploadItemSize.innerHTML = '0 / ' + this.sizeConverter(element.uploadList[position].size);
        element.uploadList[position].uploadItemControls.appendChild(element.uploadList[position].uploadItemSize);



        element.uploadList[position].controlsContainer = document.createElement('div');
        element.uploadList[position].controlsContainer.className = 'RTU-controlsContainer';



        // Add a pause button only if the file can be sliced
        if (element.parameters.slice) {
          element.uploadList[position].uploadItemPause = document.createElement('div');
          element.uploadList[position].uploadItemPause.className = 'RTU-uploadItemPause RTU-paused';
          element.uploadList[position].uploadItemPause.title = 'Start Upload';
          element.uploadList[position].controlsContainer.appendChild(element.uploadList[position].uploadItemPause);
          element.uploadList[position].uploadItemPause.addEventListener('click', function () {
            self.switchPause(element, position);
          }, false);
        }

        element.uploadList[position].uploadItemCancel = document.createElement('div');
        element.uploadList[position].uploadItemCancel.className = 'RTU-uploadItemCancel';
        element.uploadList[position].uploadItemCancel.title = 'Cancel upload';
        element.uploadList[position].controlsContainer.appendChild(element.uploadList[position].uploadItemCancel);
        element.uploadList[position].uploadItemCancel.addEventListener('click', function () {
          self.removeFile(element, position);
        }, false);

        element.uploadList[position].uploadItemControls.appendChild(element.uploadList[position].controlsContainer);

        element.uploadList[position].uploadItemBar = document.createElement('div');
        element.uploadList[position].uploadItemBar.className = 'RTU-uploadItemBar';
        element.uploadList[position].uploadItem.appendChild(element.uploadList[position].uploadItemBar);

        element.uploadList[position].uploadItemBarUploaded = document.createElement('div');
        element.uploadList[position].uploadItemBarUploaded.className = 'RTU-uploadItemBarUploaded';
        element.uploadList[position].uploadItemBar.appendChild(element.uploadList[position].uploadItemBarUploaded);


        element.objects.uploadItemsList.appendChild(element.uploadList[position].uploadItem);
        element.objects.uploadItemsList.setAttribute("data-upload", parseInt(element.objects.uploadItemsList.dataset.upload) + 1);


        if (element.uploadList[position].type.indexOf('image') == 0 && (element.parameters.maxWidth != 0 || element.parameters.maxHeight != 0)) {
          var self = this;
          var img = new Image();
          img.onload = function () {
            if (element.parameters.maxWidth != 0 && this.width > element.parameters.maxWidth) {
              element.uploadList[position].error++;
            }
            if (element.parameters.maxHeight != 0 && this.height > element.parameters.maxHeight) {
              element.uploadList[position].error++;
            }
            if (element.uploadList[position].error > 0) {
              self.uploadFailed(element, position, 'Image cannot exceeds ' + element.parameters.maxWidth + 'px on ' + element.parameters.maxHeight + 'px', 0);
            } else {
              self.uploadFile(element, position);
            }
          };
          img.src = URL.createObjectURL(element.uploadList[position].file);
        } else if (element.parameters.extension.length > 0 && element.parameters.extension.indexOf(element.uploadList[position].extension) == -1) {
          this.uploadFailed(element, position, 'File extension not allowed: ' + element.uploadList[position].extension, 0);
        } else {
          this.uploadFile(element, position);
        }
      },

      resetElement: function (element, position) {
        element.uploadList[position].uploadItemBarUploaded.className = 'RTU-uploadItemBarUploaded';
        element.uploadList[position].uploadItemBarUploaded.style.width = '0%';
        element.uploadList[position].uploadItemSize.innerHTML = '0 / ' + this.sizeConverter(element.uploadList[position].size);
      },

      uploadProgress: function (e, element, position) {
        if (element.parameters.slice) {
          var percent = parseInt(((element.uploadList[position].currentSlice + (e.loaded / e.total)) / element.uploadList[position].totalSlice) * 100);
          element.uploadList[position].uploadItemBarUploaded.style.width = percent + '%';

          var uploaded = ((element.uploadList[position].currentSlice * element.parameters.sliceSize * 1024) + e.loaded);
          if (uploaded > element.uploadList[position].size) {
            uploaded = element.uploadList[position].size;
          }
          element.uploadList[position].uploadItemSize.innerHTML = this.sizeConverter(uploaded) + ' / ' + this.sizeConverter(element.uploadList[position].size);
        } else {
          var percent = parseInt((e.loaded / e.total) * 100);
          element.uploadList[position].uploadItemBarUploaded.style.width = percent + '%';
          var uploaded = e.loaded;
          if (uploaded > element.uploadList[position].size) {
            uploaded = element.uploadList[position].size;
          }
          element.uploadList[position].uploadItemSize.innerHTML = this.sizeConverter(uploaded) + ' / ' + this.sizeConverter(element.uploadList[position].size);
        }

      },

      uploadSuccess: function (element, position, result) {
        if (element.parameters.slice) {
          this.sliceUploaded(element, position, result);
        } else {
          this.validateUpload(element, position, result);
        }
      },

      validateUpload: function (element, position, result) {

        element.uploadList[position].status = 'finished';
        element.uploadList[position].uploadItemSize.innerHTML = this.sizeConverter(element.uploadList[position].size) + ' ';
        this.addClass(element.uploadList[position].uploadItemBarUploaded, 'RTU-uploadItemBarSucceed');

        // Hide the pause/start button
        if (typeof element.uploadList[position].uploadItemPause !== 'undefined') {
          this.addClass(element.uploadList[position].uploadItemPause, 'RTU-done');
        }

        // Remove the delete button
        this.addClass(element.uploadList[position].uploadItemCancel, 'RTU-done');

        // if the server returned the url of the uploaded file, show it
        if (typeof result !== 'undefined' && typeof result.url !== 'undefined') {
          var link = document.createElement('a');
          link.title = 'View'
          link.className = 'RTU-uploadItemView';
          link.href = element.parameters.action + '/../' + result.url;
          link.target = '_blank'
          element.uploadList[position].controlsContainer.appendChild(link);
          element.uploadList[position].link = element.parameters.action + '/../' + result.url;
        }

        // if a callback function is set for successful upload, call it
        if (typeof onSucess === 'function') {
          //console.log("call callback");
          //element.parameters.callbackSuccess(element, position);
          totalUploaded++;
          if (element.uploadList.length == totalUploaded) {
            onSucess.call(this, 'test');
          }

        }

        // if activated, show a notification once upload is complete
        if (element.parameters.notification) {
          this.showNotification('Upload Successful', element.uploadList[position].name + ' has been uploaded', element.parameters.notificationIcon);
        }

        element.parameters.finished++;
        this.startUploads(element); // check if there are still files to upload
      },

      uploadFailed: function (element, position, value, status) {
        this.addClass(element.uploadList[position].uploadItemBarUploaded, 'RTU-uploadItemBarFailed');

        // Hide the start/pause button if the upload has failed
        this.addClass(element.uploadList[position].uploadItemPause, 'RTU-done');

        element.uploadList[position].uploadItemBarUploaded.style.width = '100%';
        element.uploadList[position].uploadItemSize.innerHTML = value;
        if (status == 0) {
          element.uploadList[position].status = 'rejected';
        } else if (status == 1 || status == 2) {
          element.uploadList[position].status = 'failed';
          if (element.parameters.notification) { // show a notification if upload failed
            this.showNotification('Upload Failed', element.uploadList[position].name + ' upload failed', element.parameters.notificationIcon);
          }
        }

        // if a callback function is set for failed upload, call it
        if (typeof element.parameters.callbackError === 'function') {
          element.parameters.callbackError(element, position, value);
        }
      },

      uploadFile: function (element, position) {
        var self = this;
        element.uploadList[position].xhr = new XMLHttpRequest();

        if (element.uploadList[position].file.mozSlice) {
          element.uploadList[position].sliced = true;
          element.uploadList[position].sliceMethod = 'mozSlice';
        } else if (element.uploadList[position].file.webkitSlice) {
          element.uploadList[position].sliced = true;
          element.uploadList[position].sliceMethod = 'webkitSlice';
        } else if (element.uploadList[position].file.slice) {
          element.uploadList[position].sliced = true;
          element.uploadList[position].sliceMethod = 'slice';
        } else {
          // file slice not supported
          element.uploadList[position].chunk = element.uploadList[position].file;
          element.uploadList[position].sliced = false;
        }

        // Slice the file if chunk mode is activated  
        this.sliceFile(element, position);

        this.uploadEvents(element, position);


        if (element.uploadList[position].file.size <= element.parameters.maxFileSize || element.parameters.maxFileSize <= 0) {
          if ((element.parameters.size + element.uploadList[position].file.size) <= element.parameters.maxTotalSize || element.parameters.maxTotalSize <= 0) {
            if ((element.parameters.files + 1) <= element.parameters.maxFiles || element.parameters.maxFiles <= 0) {

              // Add current file size to the total uploaded size
              element.parameters.size += element.uploadList[position].file.size;

              // Add file to the number of uploaded file
              element.parameters.files++;

              // Open 
              console.log("Open URL" + element.parameters.action);
              element.uploadList[position].xhr.open(element.parameters.method, element.parameters.action, true);

              if (element.parameters.autoUpload) {
                element.uploadList[position].status = 'awaiting';

                // Add a waiting time to avoid forced synchronous function delay (bug when selecting file with file input)
                setTimeout(function () { self.startUploads(element, position); }, 1);
              }

            } else {
              // max number of files allowed reached (client side)
              this.uploadFailed(element, position, 'Maximum number of files reached (max ' + element.parameters.maxFiles + ' files)', 0);
            }
          } else {
            // total size allowed reached (detected client side)
            this.uploadFailed(element, position, 'Total size allowed reached', 0);
          }
        } else {
          // file is too big (detected client side)
          this.uploadFailed(element, position, 'File is too big (max ' + this.sizeConverter(element.parameters.maxFileSize) + ')', 0);
        }
      },

      uploadEvents: function (element, position) {
        var self = this;

        element.uploadList[position].xhr.upload.addEventListener("progress", function (e) {
          self.uploadProgress(e, element, position);
        }, false);

        element.uploadList[position].xhr.addEventListener("error", function (e) {
          //console.log('error');
        }, false);

        element.uploadList[position].xhr.addEventListener("abort", function (e) {
          // When the request has been aborted. 
          // For instance, by invoking the abort() method.
        }, false);



        element.uploadList[position].xhr.onreadystatechange = function () {
          if (element.uploadList[position].xhr.readyState == 4) {
            if (element.uploadList[position].xhr.status == 200 || element.uploadList[position].xhr.status == 0) { // 200 for normal browser, 0 for nw.js
              // Remove event
              element.uploadList[position].onreadystatechange = null;

              // Show the server response in the browser console if debug mode is on
              if (element.parameters.debug) {
                console.log(element.uploadList[position].xhr.responseText);
              }

              try {
                var result = JSON.parse(element.uploadList[position].xhr.responseText);
                if (typeof result.error !== 'undefined') {
                  self.uploadFailed(element, position, result.error, 1);
                } else if (typeof result.status !== 'undefined') {
                  self.uploadSuccess(element, position, result);
                } else {
                  self.uploadFailed(element, position, 'A server error has occured', 2);
                }
              } catch (e) {
                self.uploadFailed(element, position, 'A server error has occured', 2);
              }

            } else {
              if (element.parameters.debug) {
                console.log(element.uploadList[position].xhr.responseText);
              }
              self.uploadFailed(element, position, element.uploadList[position].xhr.responseText, 2);
            }
          }
        }.bind(this);
      },

      prepareUploads: function (element) {
        for (var i = 0, l = element.uploadList.length; i < l; i++) {
          if (element.uploadList[i].status == 'pending') {
            element.uploadList[i].status = 'awaiting';
            this.startUploads(element, i);
          }
        }
      },

      startUploads: function (element, position) {
        // Reset the upload button value to avoid reuploading the file if the form is submitted
        if (window.FormData !== 'undefined') { // make sure to not reset the file input if the browser does not support xmlHttpRequest 2
          element.value = '';
        }/* else {
      this.addClass(element.uploadList[position].uploadItemPause, 'RTU-done');
      element.uploadList[position].status = 'finished';
    }*/

        if (element.parameters.slice) { // upload in slices
          if (typeof position !== 'undefined') {
            if (element.parameters.concurrentUploads == 0 || element.parameters.concurrentUploads > (element.parameters.started - element.parameters.finished)) {
              element.parameters.started++;
              this.uploadSlice(element, position);
            }
          } else {
            for (var i = 0, l = element.uploadList.length; i < l; i++) {
              if (typeof element.uploadList[i].status !== 'undefined' && element.uploadList[i].status == 'awaiting' && (element.parameters.concurrentUploads == 0 || element.parameters.concurrentUploads > (element.parameters.started - element.parameters.finished))) {
                element.parameters.started++;
                this.uploadSlice(element, i);
              }
            }
          }
        } else { // upload without slices
          if (typeof position !== 'undefined') {
            if (element.parameters.concurrentUploads == 0 || element.parameters.concurrentUploads > (element.parameters.started - element.parameters.finished)) {
              this.upload(element, position);
            }
          } else {
            for (var i = 0, l = element.uploadList.length; i < l; i++) {
              if (element.uploadList[i].status == 'pending') {
                element.uploadList[i].status = 'awaiting';
              }
              if (element.parameters.concurrentUploads == 0 || element.parameters.concurrentUploads > (element.parameters.started - element.parameters.finished)) {
                this.upload(element, i);
              }
            }
          }
        }
      },

      upload: function (element, position) {
        if (typeof element.uploadList[position].status !== 'undefined' && element.uploadList[position].status == 'awaiting') {
          if (window.FormData !== 'undefined') {
            if (element.form != null && element.parameters.sendForm) {
              element.uploadList[position].formData = new FormData(element.form);
            } else {
              element.uploadList[position].formData = new FormData();
            }
            if (element.parameters.data !== null && typeof element.parameters.data === 'object') {
              for (key in element.parameters.data) {
                element.uploadList[position].formData.append(key, element.parameters.data[key]);
              }
            }
            element.uploadList[position].formData.append("file", element.uploadList[position].file);
            element.uploadList[position].xhr.send(element.uploadList[position].formData);
          } else { // for older browser without xmlhttprequest 2 support

            element.uploadList[position].xhr.setRequestHeader("X-FILENAME", element.uploadList[position].name);
            element.uploadList[position].xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            // custom changes to check is user is login or not.
            element.uploadList[position].xhr.setRequestHeader("SadminID", $.cookie('authid'));
            element.uploadList[position].xhr.setRequestHeader("token", $.cookie('_bb_key'));

            element.uploadList[position].xhr.send(element.uploadList[position].file);

            //this.uploadFallback(element, position);
          }
          element.uploadList[position].status = 'started';
        }
      },

      switchPause: function (element, position) {
        if (element.uploadList[position].status == 'started') {
          element.uploadList[position].status = 'paused';
          this.addClass(element.uploadList[position].uploadItemPause, 'RTU-paused');
          element.uploadList[position].uploadItemPause.title = 'Continue Upload';
        } else if (element.uploadList[position].status == 'paused') {
          element.uploadList[position].status = 'started';
          this.removeClass(element.uploadList[position].uploadItemPause, 'RTU-paused');
          element.uploadList[position].uploadItemPause.title = 'Pause Upload';
          this.sliceUploaded(element, position);
        } else if (element.uploadList[position].status == 'pending') {
          element.uploadList[position].status = 'awaiting';
          this.startUploads(element, position);
          this.removeClass(element.uploadList[position].uploadItemPause, 'RTU-paused');
          element.uploadList[position].uploadItemPause.title = 'Pause Upload';
        }
      },

      sliceFile: function (element, position) {
        element.uploadList[position].slices = [];
        element.uploadList[position].currentSlice = 0;
        element.uploadList[position].totalSlice = 0;

        var chunkSize = element.parameters.sliceSize * 1024; // slice size in KB
        var lastChunk = (element.uploadList[position].size % chunkSize);
        var chunks = (element.uploadList[position].size - lastChunk) / chunkSize;

        for (var i = 0; i < chunks; i++) {
          var obj = {};
          obj.start = (i * chunkSize);
          obj.end = ((i + 1) * chunkSize);
          obj.status = 0;
          element.uploadList[position].slices.push(obj);
        }

        if (lastChunk != 0) {
          var obj = {};
          obj.start = chunks * chunkSize;
          obj.end = element.uploadList[position].size;
          obj.status = 0;
          element.uploadList[position].slices.push(obj);
        }

        element.uploadList[position].totalSlice = element.uploadList[position].slices.length;
      },

      uploadSlice: function (element, position) {
        var i = element.uploadList[position].currentSlice;
        var method = element.uploadList[position].sliceMethod;
        var start = element.uploadList[position].slices[i].start;
        var end = element.uploadList[position].slices[i].end;

        var chunk = element.uploadList[position].file[method](start, end);

        // If the file upload has been canceled, upload one last 1 byte chunk with a remove flag to remove the file
        if (element.uploadList[position].status == 'canceled') {
          element.uploadList[position].xhr = new XMLHttpRequest();
          element.uploadList[position].xhr.open(element.parameters.method, element.parameters.action, true);
          element.uploadList[position].xhr.setRequestHeader("X-REMOVE", true);
          chunk = element.uploadList[position].file[method](0, 1);
        }
        // added this to override the action url for each element- kiran
        element.uploadList[position].xhr.open(element.parameters.method, element.parameters.action, true);
        element.uploadList[position].xhr.setRequestHeader("SadminID", $.cookie('authid'));
        element.uploadList[position].xhr.setRequestHeader("token", $.cookie('_bb_key'));
        element.uploadList[position].xhr.setRequestHeader("X-FILENAME", element.uploadList[position].name);
        element.uploadList[position].xhr.setRequestHeader("X-FILESIZE", element.uploadList[position].size);
        // custom changes to check is user is login or not.

        console.log("sending XHR");
        console.log(element.uploadList[position].xhr.getRe);
        if (window.FormData !== 'undefined') {
          if (element.form != null && element.parameters.sendForm) {
            element.uploadList[position].formData = new FormData(element.form);
          } else {
            element.uploadList[position].formData = new FormData();
          }
          if (element.parameters.data !== null && typeof element.parameters.data === 'object') {
            for (var key in element.parameters.data) {
              element.uploadList[position].formData.append(key, element.parameters.data[key]);
            }
          }
          element.uploadList[position].formData.append("file", chunk);
          element.uploadList[position].xhr.send(element.uploadList[position].formData);
        } else { // for older browser without xmlhttprequest 2 support

          element.uploadList[position].xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          element.uploadList[position].xhr.send(chunk);

          //this.uploadFallback(element, position);
        }
        element.uploadList[position].status = 'started';
        this.removeClass(element.uploadList[position].uploadItemPause, 'RTU-paused');
        element.uploadList[position].uploadItemPause.title = 'Pause Upload';
      },

      sliceUploaded: function (element, position, result) {
        if ((element.uploadList[position].currentSlice + 1) >= element.uploadList[position].totalSlice) { // if last slice has been uploaded
          if (typeof result !== 'undefined') {
            this.validateUpload(element, position, result);
          } else {
            this.validateUpload(element, position);
          }
        } else {
          // next slice
          if (element.uploadList[position].status == 'started' || element.uploadList[position].status == 'canceled') {
            element.uploadList[position].currentSlice++;
            element.uploadList[position].xhr = new XMLHttpRequest();
            this.uploadEvents(element, position);
            element.uploadList[position].xhr.open(element.parameters.method, element.parameters.action, true);
            this.uploadSlice(element, position);
          }
        }
      },

      removeFile: function (element, position) {
        // Cancel the current upload request
        if (typeof element.uploadList[position].xhr !== 'undefined') {
          element.uploadList[position].xhr.abort();
        }


        // Remove the upload item
        this.removeElement(element.uploadList[position].uploadItem);

        element.objects.uploadItemsList.setAttribute("data-upload", parseInt(element.objects.uploadItemsList.dataset.upload) - 1);

        element.uploadList[position].status = 'canceled';

        this.uploadSlice(element, position);

        if (element.uploadList[position].status != 'rejected') {
          element.parameters.files--;
          this.refreshList(element);
        }
      },

      refreshList: function (element) { // try to reupload files if a previous file was removed
        if (element.parameters.maxFiles > 0) {
          for (var i = 0, l = element.uploadList.length; i < l; i++) {
            if (typeof element.uploadList[i].status !== 'undefined' && element.uploadList[i].status == 'rejected') {
              if (element.parameters.extension.length > 0 && element.parameters.extension.indexOf(element.uploadList[i].extension) == -1) {
                this.uploadFailed(element, i, 'File extension not allowed: ' + element.uploadList[i].extension, 0);
              } else {
                element.uploadList[i].status = 'pending';
                this.removeClass(element.uploadList[i].uploadItemPause, 'RTU-done');
                this.resetElement(element, i);
                this.uploadFile(element, i);
              }
            }
          }
        }
      },

      // This function is a fallback for older browsers (IE < 10) that don't support formData
      uploadFallback: function (element, position) {
        var iframe = document.createElement('iframe');
        if (element.form != null && element.parameters.sendForm) {
          var form = element.form.cloneNode(true);
        } else {
          var form = document.createElement('form');
        }
        form.action = element.parameters.action;
        form.method = element.parameters.method;
        form.appendChild(element);

        //iframe.frameBorder = 0;
        iframe.onload = function () {
          iframe.contentDocument.body.appendChild(form);
        };

        document.body.appendChild(iframe);

        form.submit();
        /*
            element.addEventListener("change", function(e) {
              self.fileAdded(element, e);
            }, false);
        */
      },

      //////////////////////////////////////////////////////////////////////
      //  Basic functions                                                 //
      //////////////////////////////////////////////////////////////////////

      fileExtension: function (filename) {
        return (filename.substr(filename.lastIndexOf('.') + 1)).toLowerCase();
      },

      sizeConverter: function (bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
      },

      cancelDefaultEvent: function (event) {
        event.stopPropagation();
        event.preventDefault();
      },

      askNotificationPermission: function () {
        if ("Notification" in window && Notification.permission !== 'denied') { // check if notifications are supported
          Notification.requestPermission(function (permission) {
            if (!('permission' in Notification)) { // store the user permission (positive or negative)
              Notification.permission = permission;
            }

          });
        }
      },

      showNotification: function (title, message, icon) {
        if ("Notification" in window && Notification.permission !== 'denied' && typeof message !== 'undefined') {
          if (typeof icon !== 'undefined' && icon !== '') {
            var options = {
              'icon': icon,
              'body': message
            }
          } else {
            var options = {
              'body': message
            };
          }
          if (Notification.permission === "granted") {
            if (typeof title !== 'undefined' && title != '') {
              var notification = new Notification(title, options);
            } else {
              var notification = new Notification(message);
            }
            setTimeout(notification.close.bind(notification), 5000);
          } else {
            Notification.requestPermission(function (permission) {
              if (!('permission' in Notification)) { // store the user permission (positive or negative)
                Notification.permission = permission;
              }

              if (typeof title !== 'undefined' && title != '') {
                var notification = new Notification(title, options);
              } else {
                var notification = new Notification(message);
              }
              setTimeout(notification.close.bind(notification), 5000);
            });
          }
        }
      },

      removeElement: function (element) {
        if (typeof element.parentNode !== 'undefined') {
          element.parentNode.removeChild(element);
          return true;
        } else {
          return false;
        }
      },

      addClass: function (element, classList) {
        var classes = classList.split(" ");
        for (var i = 0, l = classes.length; i < l; i++) {
          if (!this.hasClass(element, classes[i])) {
            element.className = element.className + ' ' + classes[i];
          }
        }
      },
      removeClass: function (element, classList) {
        var result = element.className;
        var classes = classList.split(" ");
        for (var i = 0, l = classes.length; i < l; i++) {
          if (this.hasClass(element, classes[i])) {
            result = (' ' + result + ' ').replace((' ' + classes[i] + ' '), ' ');
          }
        }
        result = result.replace(/ {2,}/g, ' ');
        element.className = result;
      },
      hasClass: function (element, classTo) {
        if (typeof element !== 'undefined') {
          return ((' ' + element.className + ' ').indexOf(' ' + classTo + ' ') > -1);
        } else {
          return false;
        }
      },

      //////////////////////////////////////////////////////////////////////
      //  External control API                                            //
      //////////////////////////////////////////////////////////////////////

      start: function () {
        if (typeof this.elements !== 'undefined' && this.elements.length > 0) {
          for (var i = 0, l = this.elements.length; i < l; i++) {
            this.startUploads(this.elements[i]);
          }
        }
      },

      pause: function () {
        if (typeof this.elements !== 'undefined' && this.elements.length > 0) {
          for (var i = 0, l = this.elements.length; i < l; i++) {

            if (typeof this.elements[i].uploadList !== 'undefined' && this.elements[i].uploadList.length > 0) {
              for (var m = 0, n = this.elements[i].uploadList.length; m < n; m++) {
                if (this.elements[i].uploadList[m].status == 'started') {
                  this.switchPause(this.elements[i], m);
                }
              }
            }
          }
        }
      },

      stop: function (notice) {
        if (typeof notice === 'undefined') {
          notice = 'Stopped';
        }
        if (typeof this.elements != 'undefined' && this.elements.length > 0) {
          for (var i = 0, l = this.elements.length; i < l; i++) {

            if (typeof this.elements[i].uploadList !== 'undefined' && this.elements[i].uploadList.length > 0) {
              for (var m = 0, n = this.elements[i].uploadList.length; m < n; m++) {
                if (typeof this.elements[i].uploadList[m].xhr !== 'undefined') {
                  this.elements[i].uploadList[m].xhr.abort();
                }
                this.elements[i].uploadList[m].status = 'canceled';
                this.uploadFailed(this.elements[i], m, notice, 1);
              }
            }
          }
        }
      },

      clear: function () {
        if (typeof this.elements != 'undefined' && this.elements.length > 0) {
          for (var i = 0, l = this.elements.length; i < l; i++) {

            if (typeof this.elements[i].uploadList !== 'undefined' && this.elements[i].uploadList.length > 0) {
              for (var m = 0, n = this.elements[i].uploadList.length; m < n; m++) {
                this.removeFile(this.elements[i], m);
              }
            }
          }
        }
      }
    };
    $.fn.RealTimeUpload.defaults = {
      'debug': false,
      'text': 'Drag and Drop or Select a file to Upload', // the text shown on the button
      'method': 'POST',
      'action': window.location.href,
      'sendForm': false,
      'data': {},
      'callbackSuccess': '',
      'callbackError': '',
      'dropzone': undefined,
      'autoUpload': true,
      'uploadButton': false,
      'files': 0, // the number of files that are being uploaded
      'maxFiles': 0, // the maximum number of files to upload allowed
      'started': 0,
      'finished': 0,
      'remaining': 0,
      'size': 0, // total size of all items uploaded
      'maxFileSize': 0, // maximum size in kilobytes allowed per file (0 means no limit)
      'maxTotalSize': 0, // maximum size in kilobytes allowed for all files (0 means no limit)
      'concurrentUploads': 3, // maximum number of files that can be uploaded simultaneously
      'slice': true, // enable file-slicing (reduce upload error occurence for large files, allow pausing upload)
      'sliceSize': 400, // slice size in KB
      'notification': false, // show notification when upload finished or failed
      'notificationIcon': '', // icon url for the notifications
      'extension': [],
      'grid': false,
      'thumbnails': false, // display a thumbnail if the file uploaded is an image
      'maxWidth': 0, // if image, max width allowed (0 means no limit)
      'maxHeight': 0, // if image, max width allowed
      onsucess: function () { },
    };
    var uploader = document.getElementById('fileupload');
    var obj = new init();
    return obj;
  }

})(jQuery);