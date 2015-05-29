//Globals
var hide_unnactive_URL = chrome.extension.getURL("IMGs/hide_unnactive.png");
var sidebar_URL = chrome.extension.getURL("/SrcHTML/sidebar.html");
var hide_active_URL = chrome.extension.getURL("IMGs/hide_active.png");
var status_ready = chrome.extension.getURL("IMGs/ready.png");
var status_loading = chrome.extension.getURL("IMGs/loading.gif");
var status_wrong = chrome.extension.getURL("IMGs/wrong.png");
var fapp_logo = chrome.extension.getURL("IMGs/facturapp_logo_ver.png");
var office_generic = chrome.extension.getURL("IMGs/edificio.png");

//Functions
function build_menu(){
	var get_side_bar = new XMLHttpRequest();
	get_side_bar.open("GET", sidebar_URL, true);
	get_side_bar.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	get_side_bar.onload = function(argument){
		var menu = document.createElement('div');
		menu.id = 'fapp_main_panel';
		menu.innerHTML = get_side_bar.responseText.replace(/[\r\n\t]/g, "");
		
		//Insert structure
		document.body.appendChild(menu);
		chrome.storage.sync.get("RFC",function(data){
			document.getElementsByClassName("fapp_office_RFC")[0].innerHTML = data["RFC"];
		});
		
		//Place/edit images		
		var status_image = document.getElementById("fapp_status");
		status_image.src = status_ready;
		document.getElementById("fapp_logo").src = fapp_logo;
		
		//Add Listeners
		add_listeners();
	};
	get_side_bar.send();
}

function add_listeners(){
	//Button to hide/show the sidepanel
	var hide_button = document.getElementById("fapp_hide_holder");
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
	
	//Category selectors - I think this must be restated!!
	var cat_links = document.getElementsByClassName("fapp_category_container");
	var n = cat_links.length;
	for(i = 0; i < n; i++){
		cat_links[i].addEventListener('click',function(){
			var i = parseInt(this.id.split("_")[2]);
			var siblings = this.parentNode.children;var n = siblings.length;var del = [];
			for(j = 0; j < n; j++){(siblings[j].className.indexOf("fapp_data_container") == 0) ? del.push(siblings[j]) : null;}
			
			var cat_links = document.getElementsByClassName(this.className);n = cat_links.length;
			var has_menu = [1]; //Add here all categories which has a menu 
			
			for(j = 0; j < n; j++){
				if(j != i){
					(has_menu.indexOf(j) > -1) ? cat_links[j].nextSibling.className = "fapp_menu_hidden" : null;
					del[j].className = "fapp_data_container";
					cat_links[j].firstChild.style.color = "#eaeaea";
					cat_links[j].firstChild.style.cursor = "pointer";
				}else{
					(has_menu.indexOf(j) > -1) ? cat_links[j].nextSibling.className = "fapp_menu_active" : null;
					(has_menu.indexOf(j) > -1) ? del[j].className = "fapp_data_container_wmenu" : del[j].className = "fapp_data_container_populated";
					cat_links[j].firstChild.style.color = "#16495C";
					cat_links[j].firstChild.style.cursor = "default";
				}
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
		
		//var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/pruebas.php","data":[]}');
		//var jsoned = JSON.parse('{"action":"get_php","method":"POST","url":"http://facturapp.eu.pn/login.php","data":[{"name":"Username","value":"UTE150219H68"},{"name":"Password","value":"latiendita"}]}');
		var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/getClients.php","data":[]}');
		//var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/logout.php","data":[]}');
		chrome.extension.sendMessage(jsoned,function(response){
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
}/*else{
	var ind = document.getElementsByClassName("contrasena")[0].getElementsByTagName("a")[0];
	ind.click();
}*/
