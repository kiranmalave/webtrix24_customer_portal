define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
], function ($, _, Backbone, moment) {

  var timeMoment = Backbone.View.extend({
    displayRelativeTime: function (timestamp) {
      if(timestamp == null || timestamp == "" || timestamp == "null"){
        return;
      }
      var time = moment(timestamp);
      var now = moment();
      var diffInSeconds = now.diff(time, 'seconds');
      var diffInMinutes = now.diff(time, 'minutes');
      var diffInHours = now.diff(time, 'hours');
      var diffInDays = now.diff(time, 'days');
      if (diffInSeconds < 60) {
        return 'Just Now';
      } else if (diffInMinutes < 60) {
        return diffInMinutes + (diffInMinutes === 1 ? ' min ago' : ' mins ago');
      } else if (diffInHours < 24) {
        return diffInHours + (diffInHours === 1 ? ' hr ago' : ' hrs ago');
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 30) {
        return diffInDays + ' days ago';
      } else if (diffInDays < 365) {
        var monthsAgo = Math.floor(diffInDays / 30);
        return monthsAgo + (monthsAgo === 1 ? ' month ago' : ' months ago');
      } else {
        var yearsAgo = Math.floor(diffInDays / 365);
        return yearsAgo + (yearsAgo === 1 ? ' year ago' : ' years ago');
      }
    },

    changeTimeFormat: function(date) {
      var parsedDate = moment(date, [moment.ISO_8601, "DD-MM-YYYY", "YYYY-MM-DD", "YY-MM-DD","Do MMMM YYYY","MMMM Do YYYY"]);
      if (!parsedDate.isValid()) {
          return;
      }
      var timeFormat = TIMEFORMAT;
      var formattedDate = '';
      switch (timeFormat) {
          case "DD-MM-YYYY":
              formattedDate = parsedDate.format("DD-MM-YYYY");
              break;
          case "YYYY:MM:DD":
              formattedDate = parsedDate.format("YYYY:MM:DD");
              break;
          case "YY:MM:DD":
              formattedDate = parsedDate.format("YY:MM:DD");
              break;
          case "Do MMMM YYYY":
              formattedDate = parsedDate.format("Do MMMM YYYY");
              break;
          case "MMMM Do YYYY":
              formattedDate = parsedDate.format("MMMM Do YYYY");
              break;
          case "DD:MM:YY":
              formattedDate = parsedDate.format("DD:MM:YY");
              break;
          default:
              formattedDate = "Invalid time format";
      }
      return formattedDate;
  },
  changeOnlyTime:function(time,displayFormat){
    if (time != "00:00:00") {
      var timeFormat = displayFormat === '12-hours' ? 'hh:mm' : 'HH:mm';
      return moment(time, 'HH:mm');
    } else {
      return "-";
    }
  },
  });

  return timeMoment;

});
