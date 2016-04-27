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
   $.getJSON(window.location.href + region + "/sname/" + playerName)
   .done(function(json){
   	$("#response-zone").text(JSON.stringify(json));
   	playerId = json.id;
   })
   .then(function(){
   	$.getJSON(window.location.href + region + "/pid/" + playerId)
   	.done(function(score){
   		playerScore = score;
   	})
   	.then(function(){
   		$("#player-score").text(playerScore);
   	});
   	$("button").removeAttr("disabled");
   });

  });
  
  $("button#leaderboards-button").click(function(){
  	$.getJSON("")
  	.done(function(data){
  		
  	});
  });
  
  $("button#progression-button").click(function(){
  	$.getJSON(window.location.href + region + "/pid/" + playerId + "/champions")
  	.done(function(arr){
  	var text = "";
   	arr.forEach(function(champion){
   		text += text ? "<br>ID : " + champion.championId + " Grade : " + (champion.highestGrade||"None") : "ID : " + champion.championId + " Grade : " + (champion.highestGrade||"None");
   	});
   	$("#progression-zone").append(text);
  	});
  });
  
  $("button#get-top-ten").click(function(){
  	$.getJSON(window.location.href + region + "/pid/" + playerId + "/top" + "?n=10")
  	.done(function(arr){
  		var text = "";
		arr.forEach(function(champion){
			text += text ? "<br>ID : " + champion.championId + " Grade : " + (champion.highestGrade||"None") : "ID : " + champion.championId + " Grade : " + (champion.highestGrade||"None");
		});
  		$("#top-zone").append(text);
  	});
  });
});