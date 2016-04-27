$(document).ready(function(){
  $("form#summ-by-name").submit(function(event){
   event.preventDefault();
   var submission = $(this).serializeArray();

   var summonerName = submission[0].value;
   var platformId = submission[1].value;

//   console.log(platformId + " " + summonerName);
   window.location.href = window.location.href + platformId + "/sname/" + summonerName;

  });
});