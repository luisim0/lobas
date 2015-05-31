//SAT URLs
var iqaccess_url = "https://cfdiau.sat.gob.mx/nidp/app?";
var weird_sat_login = "https://cfdiau.sat.gob.mx/nidp/lofc.jsp";
var valid_sat_login = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon&sid=0&option=credential&sid=0";
var logged_sat_url = "https://portalcfdi.facturaelectronica.sat.gob.mx/";
var valid_sat_token = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon";

//Globals
var hide_unnactive_URL = chrome.extension.getURL("IMGs/hide_unnactive.png");
var sidebar_URL = chrome.extension.getURL("/SrcHTML/sidebar.html");
var client_box = chrome.extension.getURL("/SrcHTML/client_box.html");
var hide_active_URL = chrome.extension.getURL("IMGs/hide_active.png");
var status_ready = chrome.extension.getURL("IMGs/ready.png");
var status_loading = chrome.extension.getURL("IMGs/loading.gif");
var status_wrong = chrome.extension.getURL("IMGs/wrong.png");
var fapp_logo = chrome.extension.getURL("IMGs/facturapp_logo_ver.png");
var office_generic = chrome.extension.getURL("IMGs/edificio.png");
var json_arr;

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
		
		//Change status loading
		status_image.src = status_loading;
		
		//Insert Clients
		var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/PHP/getClients.php","data":[]}');
		chrome.extension.sendMessage(jsoned,function(response){//Obtenemos clientes
			if(response.answer == 'Error'){
				status_image.src = status_wrong;
				alert("No se ha procesado correctamente la respuesta del servidor, por favor refresce la página para intentarlo de nuevo.");
			}else{
				json_arr = JSON.parse(response.answer);
				document.getElementById("fapp_num_clients").innerHTML = json_arr.length;
				jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}'); jsoned.url = client_box;
				chrome.extension.sendMessage(jsoned,function(response){//Obtenemos template para el contenedor
					if(response.answer == 'Error'){
						alert("No se ha procesado correctamente la respuesta de la extensión, por favor refresce la página para intentarlo de nuevo.");
						status_image.src = status_wrong;
					}else{
						var n = json_arr.length;
						var client_data = document.getElementById("fdc1");
						for(i = 0;i < n;i++){
							var par_div = document.createElement("div");
							par_div.className = "fapp_client_box"; par_div.id = json_arr[i].id;
							par_div.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
							par_div.getElementsByClassName("fapp_client_name_holder")[0].innerHTML = json_arr[i].name;
							par_div.getElementsByClassName("fapp_client_RFC")[0].innerHTML = json_arr[i].rfc;
							client_data.appendChild(par_div);
						}
						add_listeners();
						status_image.src = status_ready;					
					}
				});
			}
		});
		
		//Add Listeners, this is performed inside the call for clients
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
	
	//Link #of clients
	document.getElementById("fapp_num_clients").addEventListener('click',function(){
		document.getElementById("fapp_cat_1").click();
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
	
	//Client selection - recycle above variables - Clients must be loaded at the begining!!!!
	cat_links = document.getElementsByClassName("fapp_client_box"); n = cat_links.length;
	for(i = 0;i < n;i++){
		cat_links[i].addEventListener('click',function(){
			(this.className == "fapp_client_box") ? this.className = "fapp_client_box_selected" : this.className = "fapp_client_box";
		});
	}
}

function check_page(){
	if(window.location.href.indexOf(iqaccess_url) == 0){
		//We reached the netiq access manager... :(
		window.location.replace(logged_sat_url);
		return false;
	}else if(window.location.href.indexOf(weird_sat_login) == 0){
		//Ended session
		window.location.replace(valid_sat_login);
		return false;
	}/*else{
		var ind = document.getElementsByClassName("contrasena")[0].getElementsByTagName("a")[0];
		if(ind.innerHTML == "Fiel"){//Good page
			return true;
		}else{//Bad page
			return false;
		}
	}*/
	is_session_active();
	return true;
}

function is_session_active(){
	var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/PHP/isLogged.php","data":[]}');
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			alert("Los servidores de Facturapp están temporalmente fuera de servicio. Por favor intente más tarde.");
			//window.close();
			return false;
		}else{
			var yesno = response.answer.split("_")[1];
			if(yesno == "0"){//There's no session
				//instruct to open session
				if(window.location.href.indexOf(valid_sat_token) == 0){
					jsoned = JSON.parse('{"action":"prompt_message"}');
					chrome.extension.sendMessage(jsoned);
				}
				return false;
			}else{//There's session
				build_menu();
				return true;
			}
		}
	});
}

//Event listeners
chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
	alert("Aquí oyendo!");
});

//Main! - It goes check_page() >> is_session_active() >> build_menu()
check_page();