//Globals
var hide_unnactive_URL = chrome.extension.getURL("IMGs/hide_unnactive.png");
var hide_active_URL = chrome.extension.getURL("IMGs/hide_active.png");
var status_ready = chrome.extension.getURL("IMGs/ready.png");
var status_loading = chrome.extension.getURL("IMGs/loading.gif");
var status_wrong = chrome.extension.getURL("IMGs/wrong.png");

//Functions
function build_menu(){
	var menu = document.createElement('div');
	menu.id = 'fapp_main_panel';
	menu.innerHTML = "<div id='fapp_frame_manipulate'><div id='fapp_hide_holder'><img src='' id='fapp_hide_button' class='no_rotate'/></div><div id='fapp_status_holder'><img src='' id='fapp_status'/></div><div id='fapp_logo_holder'><img src='' id='fapp_logo'/></div></div><div id='fapp_frame_contents' class='fapp_frame_contents'></div>";
	
	//Insert structure
	document.body.appendChild(menu);
	
	//Place/edit images
	var hide_button = document.getElementById("fapp_hide_button"); 
	hide_button.src = hide_unnactive_URL;
	hide_button.width = "40"; hide_button.height = "40";
	
	var status_image = document.getElementById("fapp_status");
	status_image.src = status_ready;
	status_image.height = "30";
	status_image.width = "30";
	
	document.getElementById("fapp_logo").src = chrome.extension.getURL("IMGs/facturapp_logo_ver.png");
	
	//Title, recycle menu
	menu = document.createElement("div");
	menu.id = "fapp_contents_heading";
	menu.innerHTML = "<p>Menú Principal</p>";
	document.getElementById("fapp_frame_contents").appendChild(menu);
	
	//Profile management
	menu = document.createElement("div");
	menu.id = "fapp_cat_0";
	menu.className = "fapp_category_container";
	menu.innerHTML = "<p>Información de Cuenta</p>";
	document.getElementById("fapp_frame_contents").appendChild(menu);
	//Contents div
	menu = document.createElement("div");
	menu.className = "fapp_data_container";
	document.getElementById("fapp_frame_contents").appendChild(menu);
	
	//RFC Registry
	menu = document.createElement("div");
	menu.id = "fapp_cat_1";
	menu.className = "fapp_category_container";
	menu.innerHTML = "<p>Registro de RFCs</p>";
	document.getElementById("fapp_frame_contents").appendChild(menu);
	//Contents div
	menu = document.createElement("div");
	menu.className = "fapp_data_container";
	menu.innerHTML = "<a id='test'>Place RFC</a>";
	document.getElementById("fapp_frame_contents").appendChild(menu);
	
	//Explorer Settings
	menu = document.createElement("div");
	menu.id = "fapp_cat_2";
	menu.className = "fapp_category_container";
	menu.innerHTML = "<p>Descargar</p>";
	document.getElementById("fapp_frame_contents").appendChild(menu);
	//Contents div
	menu = document.createElement("div");
	menu.className = "fapp_data_container";
	document.getElementById("fapp_frame_contents").appendChild(menu);
}

function add_listeners(){
	//Button to hide/show the sidepanel
	var hide_button = document.getElementById("fapp_hide_button");
	hide_button.addEventListener('click',function(){
		var main_panel = document.getElementById("fapp_frame_contents"); 
		if (main_panel.className == "fapp_frame_contents"){
			main_panel.className = "fapp_frame_contents_collapsed";
			hide_button.className = "rotate";
		}else{
			main_panel.className = "fapp_frame_contents";
			hide_button.className = "no_rotate";
		}
	});
	hide_button.addEventListener('mouseover',function(){
		hide_button.src = hide_active_URL;
	});
	hide_button.addEventListener('mouseout',function(){
		hide_button.src = hide_unnactive_URL;
	});
	
	//Category selectors
	var cat_links = document.getElementsByClassName("fapp_category_container");
	var n = cat_links.length;
	for(i = 0; i < n; i++){
		cat_links[i].addEventListener('click',function(){
			var i = parseInt(this.id.split("_")[2]);
			var cat_links = document.getElementsByClassName(this.className);
			for(j = 0; j < n; j++){
				(j != i) ? cat_links[j].nextSibling.className = "fapp_data_container" : cat_links[j].nextSibling.className = "fapp_data_container_populated"; 
			}
		});
	}
	
	//This is a php message test
	var test_link = document.getElementById("test");
	var status_image = document.getElementById("fapp_status");
	test_link.addEventListener('click',function(){
		//Change the status image
		status_image.src = status_loading;
		//Send image to background
		chrome.extension.sendMessage({action:'get_php'},function(response){
			if(response.answer == 'Error'){
				status_image.src = status_wrong;
			}else{
				var rfc_box = document.getElementsByName("Ecom_User_ID")[0];
				rfc_box.value = response.answer;
				status_image.src = status_ready;
			}
		});
	});
}

function check_page(){
	if(window.location.href.indexOf("https://cfdiau.sat.gob.mx/nidp/app?") == 0){
		//We reached the netiq access manager... :(
		window.location.replace("https://portalcfdi.facturaelectronica.sat.gob.mx/");
		return false;
	}else if(window.location.href.indexOf("https://cfdiau.sat.gob.mx/nidp/lofc.jsp") == 0){
		//Ended session
		window.location.replace("https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon&sid=0&option=credential&sid=0");
		return false;
	}/*else{
		var ind = document.getElementsByClassName("contrasena")[0].getElementsByTagName("a")[0];
		if(ind.innerHTML == "Fiel"){//Good page
			return true;
		}else{//Bad page
			return false;
		}
	}*/
	return true;
}

//Main!
if(check_page()){
	build_menu();
	add_listeners();
}/*else{
	var ind = document.getElementsByClassName("contrasena")[0].getElementsByTagName("a")[0];
	ind.click();
}*/
