//Global Vars
var tabid = -1;
var satlink = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon&sid=0&option=credential&sid=0";

//Initialize
function main(){
	//Place images
	document.getElementById("fapp_ext_logo").src = chrome.extension.getURL("IMGs/facturapp_logo.png");
}

//Functions
function loadSATPage(e){
	chrome.tabs.create({url:satlink});
}

//Event Listeners
document.addEventListener('DOMContentLoaded', function() {
	//Listeners
  	document.getElementById("open_SAT").addEventListener('click', loadSATPage);
  	document.getElementById("fapp_ext_login").addEventListener('click',function(){
  		var form = document.getElementById("fapp_ext_form");
  		form.submit();
  	});
  	document.getElementById("fapp_ext_pss").addEventListener('keypress',function(e){
  		if(e.keyCode == 13){
  			var form = document.getElementById("fapp_ext_form");
  			form.submit();
  		}
  	});
  	//Initialize
  	main();
});