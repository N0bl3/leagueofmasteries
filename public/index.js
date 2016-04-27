$(document).ready(function(){
	var playerId,
	playerName,
	region,
	playerScore;
	
  $("form#summ-by-name").submit(function(event){
   event.preventDefault();
   var submission = $(this).serializeArray();

   playerName = submission[0].value;
   region = submission[1].value;
   $.get(window.location.href + region + "/sname/" + playerName)
   .done(function(data){
   	console.log(data);
   	$("#response-zone").text(data);
   	data = JSON.parse(data);
   	playerId = data.id;
   })
   .then(function(){
   	$.get(window.location.href + region + "/pid/" + playerId)
   	.done(function(data){
   		playerScore = data;
   	})
   	.then(function(){
   		$("#player-score").text(playerScore);
   	});
   });

  });
  
  $("button#leaderboards-button").click(function(){
  	$.get("")
  	.done(function(data){
  		
  	});
  });
  
  $("button#progression-button").click(function(){
  	console.log(region, playerId);
  	$.get(window.location.href + region + "/pid/" + playerId + "/champions")
  	.done(function(data){
   	console.log(data);
   	$("#progression-zone").text(data);
  	});
  });
});