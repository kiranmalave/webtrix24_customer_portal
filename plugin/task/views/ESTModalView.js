
define([
    'jquery',
    'underscore',
    'backbone',
    'text!../templates/ESTModalTemp.html',
    '../../core/views/timeselectOptions',
], function ($, _, Backbone, ESTModalTemp,timeselectOptions) {

    var ESTModalView = Backbone.View.extend({
        initialize: function (options) {
            var selfobj = this;
            this.jsonForm = {};
            this.logs = [] ;
            this.taskObj = options.taskObj;
            this.timeselectOptions = new timeselectOptions();
            $(".modal-dialog.forEST").removeClass("modal-lg");
            this.estLog('GET');
            this.render();
        },
        events: {
            "click .closeModal": "closeModal",
            "click .saveModal": "saveModal",
            "change #day_modal, #hours_modal, #minute_modal": "updateTotalTimePreview" 
        },
        closeModal: function () {
            $('#EstModal').modal('toggle');
        },
        saveModal: function () {
            var selfobj = this;
            var day = $("#day_modal").val() ? parseInt($("#day_modal").val()) : 0;
            var hours = $("#hours_modal").val() ? parseInt($("#hours_modal").val()) : 0;
            var minute = $("#minute_modal").val() ? parseInt($("#minute_modal").val()) : 0;
            var note = $("#note").val() ? $("#note").val() : '';
            if (day == 0 && hours == 0 && minute == 0) {
                alert("Please Enter Spend Time");
                return;
            }
            selfobj.jsonForm = {
                    day : day,
                    hours : hours,
                    minute : minute,
                };
                selfobj.note = note;
                if (selfobj.jsonForm != {} && selfobj.jsonForm != '') {
                    selfobj.jsonForm = JSON.stringify(selfobj.jsonForm);
                    selfobj.estLog('put');
                }
            var newLog = {
                day: day,
                hours: hours,
                minute: minute,
                note: note || '',
                log_date: new Date().toLocaleDateString()
            };
            selfobj.logs.push(newLog);
            var totalTimeSpent = selfobj.calculateTotalTime(selfobj.logs);
            selfobj.updateTotalTimeDisplay(totalTimeSpent);
            $("#day_modal, #hours_modal, #minute_modal, #note").val('');
            this.render();
        },
        calculateTotalTime: function(logs) {
            var totalDays = 0, totalHours = 0, totalMinutes = 0;
            // Sum each entry in `logs`
            _.each(logs, function(log) {  
                var stime = JSON.parse(log.spend_time);                        
                totalDays += parseInt(stime.day) || 0;
                totalHours += parseInt(stime.hours) || 0;
                totalMinutes += parseInt(stime.minute) || 0;
            });
        
            // Convert excess minutes into hours and hours into days
            totalHours += Math.floor(totalMinutes / 60);
            totalMinutes = totalMinutes % 60;
        
            totalDays += Math.floor(totalHours / 24);
            totalHours = totalHours % 24;
        
            return {
                days: totalDays,
                hours: totalHours,
                minutes: totalMinutes
            };
        },
        updateTotalTimeDisplay: function(totalTime) {
            var selfobj = this;
            var timeDisplay = totalTime.days + " days " + totalTime.hours + " hrs " + totalTime.minutes + " min";
            $(".total-time").html(timeDisplay);
            console.log("jjjjjj",$(".total-time"));          
            var estimatedTime = this.taskObj.model.get("estimate_time");
            var etime = JSON.parse(estimatedTime);
            var estimatedDays = parseInt(etime.day, 10) || 0;
            var estimatedHours = parseInt(etime.hours, 10) || 0;
            var estimatedMinutes = parseInt(etime.minute, 10) || 0;
            // Display Estimated Time
            var estimatedTimeDisplay = estimatedDays + " days " + estimatedHours + " hrs " + estimatedMinutes + " min";
            $(".estimated-time").html(estimatedTimeDisplay);
            //time exceeds estimated time and applying color indicator           
            if (totalTime.days > estimatedDays || 
                (totalTime.days === estimatedDays && totalTime.hours > estimatedHours) || 
                (totalTime.days === estimatedDays && totalTime.hours === estimatedHours && totalTime.minutes > estimatedMinutes)) {
                $(".total-time").css("color", "red"); 
                $(".red").css("color", "red"); 
                $(".footer-summary").css("background", "#F1F3F9");
            } else {
                $(".footer-summary").css("background", "#42AB09"); 
                $(".white").css("color", "#ffffff");
            }
        },
        // Updating the preview of total time as the user enters values
        updateTotalTimePreview: function() {
            var day = parseInt($("#day_modal").val()) || 0;
            var hours = parseInt($("#hours_modal").val()) || 0;
            var minutes = parseInt($("#minute_modal").val()) || 0;
            // Create a temporary log entry based on the current input
            var previewLog = { day: day, hours: hours, minute: minutes };
            var totalTimeSpent = this.calculateTotalTime([...this.logs, previewLog]);
            // Update the display with the preview total time
            this.updateTotalTimeDisplay(totalTimeSpent);
        },
        
        initializeValidate: function () {
            var selfobj = this;
            $(".ws-select").selectpicker('refresh');
            var feilds = {

            };
            var feildsrules = feilds;
            var messages = {
            };
            $("#customerActivity").validate({
                rules: feildsrules,
                messages: messages,
            });
        },
        estLog: function (type) {
            var selfobj = this;            
            $.ajax({
                url: APIPATH + 'taskMaster/timeEstimation',
                method: 'POST',
                data: { taskID: selfobj.taskObj.taskID , type :type , EstLog :this.jsonForm,note : this.note },
                datatype: 'JSON',
                beforeSend: function (request) {
                    request.setRequestHeader("token", $.cookie('_bb_key'));
                    request.setRequestHeader("SadminID", $.cookie('authid'));
                    request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                    request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                    if (res.flag == "F") {
                        showResponse('', res, '');
                    }
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    if (res.flag == "S") {
                        if (type == 'put') {
                            $('#EstModal').modal('toggle');
                            $("#day_modal, #hours_modal, #minute_modal, #note").val('')
                            selfobj.jsonForm = {};
                            selfobj.note = '';
                        }else{
                            selfobj.logs = res.data || [];                        
                            selfobj.render();
                            console.log('data : ',res.data);   
                        }
                    }
                }
            });
        },
        
        render: function () {
            var selfobj = this;
            this.undelegateEvents();
            var template1 = _.template(ESTModalTemp);
            this.$el.html(template1({logs : selfobj.logs, timechange: this.timeselectOptions}));
            $('#EstMedia').empty();
            $("#EstMedia").append(this.$el);
            setToolTip();
            $(".profile-loader").hide();  
            if (!selfobj.logs || selfobj.logs.length === 0) {
                $('.history-table').hide();
                $('.history-table').after('<div class="no-history-message">No time logs available yet. Add your first time entry above.</div>');
            } else {
                $('.history-table').show();
                $('.no-history-message').remove();
            }        
            this.updateTotalTimeDisplay(this.calculateTotalTime(this.logs));
            this.initializeValidate();
            this.delegateEvents();
            return this;
        }
    });
    return ESTModalView;
});
