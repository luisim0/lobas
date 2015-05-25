//Global Vars
var tabid = -1;
var satlink = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon&sid=0&option=credential&sid=0";

//Initialize
function main(){
	chrome.tabs.getSelected(null, function(e){
		var status = document.getElementById("status");
		if (satlink.localeCompare(e.url) == 0) {
			status.innerHTML = "Sí es la puta página";
		}else{
			status.innerHTML = "Hay que usar botón SAT";
		};
	});
}

//Functions
function loadSATPage(e){
	chrome.tabs.create({url:satlink});
}

//Callbacks


//Event Listeners
document.addEventListener('DOMContentLoaded', function() {
	//Listeners
  	document.getElementById("open_SAT").addEventListener('click', loadSATPage);
  	//Initialize
  	main();
});