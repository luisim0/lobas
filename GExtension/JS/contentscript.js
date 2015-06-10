//SAT URLs
const login_con_url = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon";
const login_fiel_url = "SATx509Custom";//Token
const login_con_token = "SATUPCFDiCon";//Token
const login_1_pass = "https://cfdiau.sat.gob.mx/nidp/app/login?";
const login_2_pass = "https://cfdiau.sat.gob.mx/nidp/wsfed_redir_cont_portalcfdi.jsp?";
const logged_1_url = "https://portalcfdi.facturaelectronica.sat.gob.mx/";
const logged_2_url = "https://portalcfdi.facturaelectronica.sat.gob.mx/Consulta.aspx";
const emi_url = "https://portalcfdi.facturaelectronica.sat.gob.mx/ConsultaEmisor.aspx";
const rec_url = "https://portalcfdi.facturaelectronica.sat.gob.mx/ConsultaReceptor.aspx";
const logout_url = "https://cfdiau.sat.gob.mx/nidp/lofc.jsp";//Cuando termina la sesión
const logout_1_pass = "https://cfdiau.sat.gob.mx/nidp/logoutWreply.jsp";
const logout_2_pass = "https://cfdiau.sat.gob.mx/nidp/lodc.jsp";
const loguot_token = "Para terminar";
const iqaccess_url = "https://cfdiau.sat.gob.mx/nidp/app?";
//Constants
const clientY = 55;//How much the panel must scroll per client
const hide_unnactive_URL = chrome.extension.getURL("IMGs/hide_unnactive.png");
const hide_active_URL = chrome.extension.getURL("IMGs/hide_active.png");
const status_ready = chrome.extension.getURL("IMGs/ready.png");
const status_loading = chrome.extension.getURL("IMGs/loading.gif");
const status_wrong = chrome.extension.getURL("IMGs/wrong.png");
const fapp_logo = chrome.extension.getURL("IMGs/facturapp_logo_ver.png");
const office_generic = chrome.extension.getURL("IMGs/edificio.png");
const sidebar_URL = chrome.extension.getURL("/SrcHTML/sidebar.html");
const client_box = chrome.extension.getURL("/SrcHTML/client_box.html");
const popup_box = chrome.extension.getURL("/SrcHTML/client_input.html");
const add_client_php = "http://uberprototech.com/facturapp/PHP/addClient.php";
const edit_client_php = "http://uberprototech.com/facturapp/PHP/editClient.php";
const del_clients_php = "http://uberprototech.com/facturapp/PHP/deleteClient.php";
const get_clients_php = "http://uberprototech.com/facturapp/PHP/getClients.php";
const is_logged_php = "http://uberprototech.com/facturapp/PHP/isLogged.php";
const get_pass_php = "http://uberprototech.com/facturapp/PHP/getPassword.php";
const add_invoice_php = "http://uberprototech.com/facturapp/PHP/addInvoice.php";
const get_folios_php = "http://uberprototech.com/facturapp/PHP/getFolios.php";
//Globals
var json_arr;
var prev_search = "";
var sel_index = 0;
var acumY = 0;//The actual position of highlighted element
var count = 0;//Invoices counter for download
var val_changed = false;
//Event listeners
var uploadRequest = new CustomEvent('uprequested');

//Functions
function refresh_clients(listeners){
	var status_image = document.getElementById("fapp_status");
	status_image.src = status_loading;
	var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}'); jsoned.url = get_clients_php;
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
					client_data.innerHTML = "";
					for(i = 0;i < n;i++){
						var par_div = document.createElement("div");
						par_div.className = "fapp_client_box fapp_client_normal"; par_div.id = json_arr[i].id;
						par_div.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
						par_div.getElementsByClassName("fapp_client_name_holder")[0].innerHTML = json_arr[i].name;
						par_div.getElementsByClassName("fapp_client_RFC")[0].innerHTML = json_arr[i].rfc;
						client_data.appendChild(par_div);
					}
					if(listeners) add_listeners();
					add_client_listeners();
					set_selected_num();
					document.getElementById("fapp_search_input_field").value = "";
					sel_index = 0; acumY = 0;
					status_image.src = status_ready;					
				}
			});
		}
	});
	return true;
}

function add_client_listeners(){
	//Client selection - Clients must be loaded at the begining!!!!
	var cat_links = document.getElementsByClassName("fapp_client_icon"); n = cat_links.length;
	for(i = 0;i < n;i++){
		cat_links[i].addEventListener('click',function(){
			var class_parts = this.parentNode.className.split(" ");
			(class_parts[0] == "fapp_client_box") ? this.parentNode.className = "fapp_client_selected " + class_parts[1] : this.parentNode.className = "fapp_client_box " + class_parts[1];
			set_selected_num();
		});
	}
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
	
	//Link #of clients (the number in the profile category)
	document.getElementById("fapp_num_clients").addEventListener('click',function(){
		document.getElementById("fapp_cat_1").click();
	});
	
	//Category selectors
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
					if(has_menu.indexOf(j) > -1){
						del[j].className = "fapp_data_container_wmenu";
						document.getElementById("fapp_search_input_field").focus();
					}else{
						del[j].className = "fapp_data_container_populated";
					}
					cat_links[j].firstChild.style.color = "#16495C";
					cat_links[j].firstChild.style.cursor = "default";
				}
			}
		});
	}
	document.getElementById("fapp_cat_1").click();//Open clients automatically
	
	//Selection tools - Select all and none
	document.getElementById("fapp_client_all").addEventListener('click',function(){
		var cat_links = document.getElementsByClassName("fapp_client_icon"); n = cat_links.length;
		for(i = 0;i < n;i++){
			var class_parts = cat_links[i].parentNode.className.split(" ");
			(class_parts[1] != "fapp_client_hidden") ? cat_links[i].parentNode.className = "fapp_client_selected " + class_parts[1] : null;
		}
		set_selected_num();
	});
	
	document.getElementById("fapp_client_none").addEventListener('click',function(){
		var cat_links = document.getElementsByClassName("fapp_client_icon"); n = cat_links.length;
		for(i = 0;i < n;i++){
			var class_parts = cat_links[i].parentNode.className.split(" ");
			(class_parts[1] != "fapp_client_hidden") ? cat_links[i].parentNode.className = "fapp_client_box " + class_parts[1] : null;
		}
		set_selected_num();
	});
	
	//Search bar
	var search_event = new CustomEvent("search");
	document.getElementById("fapp_search_input_field").addEventListener('search',function(){
		var n = json_arr.length;
		var strFind = this.value.toLowerCase();
		for(i = 0;i < n;i++){
			var spec_node = document.getElementById(json_arr[i].id);
			var ndclass = spec_node.className.split(" ");
			if(strFind == ""){//Remove hidden from all
				spec_node.className = ndclass[0] + " fapp_client_normal";
			}else{
				if(json_arr[i].name.toLowerCase().indexOf(strFind) != -1 || json_arr[i].rfc.toLowerCase().indexOf(strFind) != -1){
					spec_node.className = ndclass[0] + " fapp_client_normal"; 
				}else{			
					spec_node.className = ndclass[0] + " fapp_client_hidden";
				}
			}
		}
		sel_index = 0; acumY = 0;
	});
	
	//Search bar tracking changes
	setInterval(function(){
		var bar = document.getElementById("fapp_search_input_field");
		if(bar.value != prev_search){
			bar.dispatchEvent(search_event);
			prev_search = bar.value;
		}
	}, 200);
	
	//Keyboard shortcuts for search bar
	document.getElementById("fapp_search_input_field").addEventListener('keydown',function(e){
		switch(e.keyCode){
			case 13: //Enter
				var res = get_search_results();
				var selected = res.selected;var n = res.n;var class_parts = res.class_parts;
				if(class_parts[1] == "fapp_client_normal"){//If not highlighted
					sel_index = 0; acumY = 0;
					selected[sel_index].className = class_parts[0] + " fapp_client_highlighted";
				}else{//If already highlighted
					(class_parts[0] == "fapp_client_box") ? selected[sel_index].className = "fapp_client_selected " + class_parts[1] : selected[sel_index].className = "fapp_client_box " + class_parts[1];
				}
				set_selected_num();
				var clients_panel = document.getElementById("fdc1");var ratio = Math.floor(clients_panel.offsetHeight/clientY)*clientY;//Page size
				if(acumY < clients_panel.scrollTop) animate_scroll_up(acumY - ratio + clientY);
				break;
			case 38: //Up arrow
				var res = get_search_results();
				var selected = res.selected;var n = res.n;var class_parts = res.class_parts;
				var clients_panel = document.getElementById("fdc1");
				if(sel_index > 0 && selected[sel_index].className.split(" ")[1] == "fapp_client_highlighted"){
					selected[sel_index].className = class_parts[0] + " fapp_client_normal";
					sel_index -= 1;
					class_parts = selected[sel_index].className.split(" ");
					selected[sel_index].className = class_parts[0] + " fapp_client_highlighted";
					acumY -= clientY;
				}	
				var ratio = Math.floor(clients_panel.offsetHeight/clientY)*clientY;//Page size
				if(acumY < clients_panel.scrollTop) animate_scroll_up(acumY - ratio + clientY);
				break;
			case 40: //Down arrow
				var res = get_search_results();
				var selected = res.selected;var n = res.n;var class_parts = res.class_parts;
				var clients_panel = document.getElementById("fdc1");
				if(sel_index < n - 1  && selected[sel_index].className.split(" ")[1] == "fapp_client_highlighted"){
					selected[sel_index].className = class_parts[0] + " fapp_client_normal";
					sel_index += 1;
					class_parts = selected[sel_index].className.split(" ");
					selected[sel_index].className = class_parts[0] + " fapp_client_highlighted";
					acumY += clientY;
				}
				var ratio = Math.floor(clients_panel.offsetHeight/clientY)*clientY;//Page size
				if(acumY >= clients_panel.scrollTop + ratio) animate_scroll_down(acumY);
				break;
			default:
				sel_index = 0; acumY = 0;
		}
	});
	
	//Client Add edit delete
	document.getElementById("fapp_client_add").addEventListener('click',function(e){
		throw_popup('add');
	});
	document.getElementById("fapp_client_edit").addEventListener('click',function(e){
		var clients = set_selected_num();
		if(clients.length == 1){
			throw_popup('edit',clients.items[0]);
		}else{
			alert("Seleccione un solo usuario por favor");
		}
		return false;
	});
	document.getElementById("fapp_client_bin").addEventListener('click',function(e){
		var clients = set_selected_num();
		if(clients.length > 0){
			if(confirm("¿En verdad quiere eliminar a los clientes seleccionados?")){
				var IDs = "["; var RFCs = "[";
				for(i = 0;i < clients.length;i++){
					IDs += clients.items[i].id + ",";
					RFCs += '"' + clients.items[i].getElementsByClassName("fapp_client_RFC")[0].innerHTML + '",';
				}
				IDs = IDs.replaceAt(IDs.length - 1, "]"); RFCs = RFCs.replaceAt(RFCs.length - 1, "]");
				send_delete(IDs, RFCs);
			}
		}else{
			alert("Por favor seleccione al menos un cliente");
		}
		return false;
	});
	
	//Add client input handlers
	document.getElementsByClassName("fapp_input_cross")[0].addEventListener('click',function(){
		document.getElementsByClassName("fapp_input_check")[0].removeEventListener('click', client_input_check);
		hide_popup();
	});
	document.getElementById("fapp_input_name").addEventListener('keypress',function(){
		var name = document.getElementById("fapp_input_name");
		name.style.backgroundColor = "rgba(255,255,255,0.2)";
	});
	document.getElementById("fapp_input_rfc").addEventListener('keypress',function(){
		var rfc = document.getElementById("fapp_input_rfc");
		rfc.style.backgroundColor = "rgba(255,255,255,0.2)";
	});
	document.getElementById("fapp_input_pass").addEventListener('keypress',function(){
		var pass = document.getElementById("fapp_input_pass");
		pass.style.backgroundColor = "rgba(255,255,255,0.2)";
	});
	document.getElementById("fapp_input_repass").addEventListener('keypress',function(){
		var repass = document.getElementById("fapp_input_repass");
		repass.style.backgroundColor = "rgba(255,255,255,0.2)";
	});
	
	//fapp_input_check - 'click' event is placed on throw-popup
	
	//Client input, password reveal
	document.getElementById("fapp_passcover").addEventListener('click',function(){
		document.getElementById("fapp_passcover").style.display = "none";
	});
	document.getElementById("fapp_input_pass").addEventListener('focus',function(){
		document.getElementById("fapp_passcover").style.display = "none";
	});
	
	//DOWNLOAD!
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth();
	document.getElementById("fapp_select_year")[year - 2014].selected = true;
	document.getElementById("fapp_select_month")[month].selected = true;
	document.getElementById("fapp_select_download").addEventListener('click',download_process);
}

String.prototype.addLeftZero = function(){
	if(this.length == 1){return "0" + this;}else{return this;} 
};

function client_input_check(){
	var name = document.getElementById("fapp_input_name");
	var rfc = document.getElementById("fapp_input_rfc");
	var pass = document.getElementById("fapp_input_pass");
	var repass = document.getElementById("fapp_input_repass");
	
	var client = set_selected_num().items[0];
	var addedit = document.getElementsByClassName("fapp_input_main_visible")[0].id;
	
	trim_whites(name, true);
	trim_whites(rfc, false);
	rfc.value = rfc.value.toUpperCase();
				
	if(name.value != ""){
		if(rfc.value != "" && (rfc.value.length == 12 || rfc.value.length == 13)){
			if(pass.value == repass.value){
				if(addedit == 'add' && pass.value != ""){
					var duplicated = client_exists(name.value, rfc.value, null);
					if(!duplicated){
						document.getElementsByClassName("fapp_input_check")[0].removeEventListener('click', client_input_check);
						query_client_change(addedit, client);
						return true;
					}else{
						alert('El campo: "' + duplicated + '" ya existe en su lista de clientes');
					}
				}else if(addedit == 'edit'){
					var duplicated = client_exists(name.value, rfc.value, client.id);
					if(!duplicated){
						document.getElementsByClassName("fapp_input_check")[0].removeEventListener('click', client_input_check);
						query_client_change(addedit, client);
						return true;
					}else{
						alert('El campo: "' + duplicated + '" ya existe en su lista de clientes');
					}
				}else{
					pass.style.backgroundColor = "rgba(255,166,155,0.5)";
				}
			}else{
				repass.style.backgroundColor = "rgba(255,166,155,0.5)";
			}
		}else{
			rfc.style.backgroundColor = "rgba(255,166,155,0.5)";
		}
	}else{
		name.style.backgroundColor = "rgba(255,166,155,0.5)";
	}
	return false;
}

function client_exists(name, rfc, omitID){
	for(i = 0;i < json_arr.length;i++){
		if(omitID == json_arr[i].id) continue;
		if(name == json_arr[i].name) return name;
		if(rfc == json_arr[i].rfc) return rfc;
	}
	return false;
}

function trim_whites(inputElement, extra){
	if(extra){
		inputElement.value = inputElement.value.replace(/\s\s+/g," ");
		while(inputElement.value[0] == " "){inputElement.value = inputElement.value.replaceAt(0,"");};
		while(inputElement.value[inputElement.value.length - 1] == " "){inputElement.value = inputElement.value.replaceAt(inputElement.value.length - 1,"");};
	}else{
		inputElement.value = inputElement.value.replace(/ /g,"");
	}
}

function send_delete(IDs, RFCs){
	var status_image = document.getElementById("fapp_status");
	status_image.src = status_loading;
	var jsoned = JSON.parse('{"action":"get_php","method":"POST","url":"","data":[]}');
	jsoned.url = del_clients_php;
	jsoned.data[0] = {name:"ID", value:IDs};
	jsoned.data[1] = {name:"RFC", value:RFCs};
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			alert("No se ha podido procesar la respuesta del servidor. Inténtelo más tarde");
			return false;
		}else{
			if('Scs_1'){
				refresh_clients(false);
				return false;
			}else{
				alert("Los clientes no se pudieron eliminar. Por favor inténtelo nuevamente");
				return false;
			}
		}
	});
	return false;
}

String.prototype.replaceAt = function(index, character){
	if(character != ""){
		return this.substr(0,index) + character + this.substr(index+character.length);
	}else{
		return this.substr(0,index) + character + this.substr(index+1);
	}	
};

function set_selected_num(){
	var items = document.getElementsByClassName("fapp_client_selected"); 
	var n = items.length;
	document.getElementById("fapp_client_count").innerHTML = n;
	return {items:items, length:n};
}

function get_search_results(){
	var clients = document.getElementById("fdc1").children;var n = clients.length;
	var selected = [];
	for(i = 0;i < n;i++){
		var class_parts = clients[i].className.split(" ");
		if(class_parts[1] != "fapp_client_hidden"){
			selected.push(clients[i]);
		}
	}
	return {selected:selected, n:selected.length, class_parts:selected[sel_index].className.split(" ")};
}

function animate_scroll_down(ratio){
	var clients_panel = document.getElementById("fdc1");
	setTimeout(function(){
		var old_scroll = clients_panel.scrollTop;var change = true;
		clients_panel.scrollTop += 5;
		if(old_scroll == clients_panel.scrollTop) change = false;
		if(clients_panel.scrollTop < ratio && change) animate_scroll_down(ratio);
	}, 1);
}

function animate_scroll_up(ratio){
	var clients_panel = document.getElementById("fdc1");
	setTimeout(function(){
		var old_scroll = clients_panel.scrollTop;var change = true;
		clients_panel.scrollTop -= 5;
		if(old_scroll == clients_panel.scrollTop) change = false;
		if(clients_panel.scrollTop > ratio && change) animate_scroll_up(ratio);
	}, 1);
}

function throw_popup(addedit, client){	
	//Fill form if Edit mode
	var name = document.getElementById("fapp_input_name");
	var rfc = document.getElementById("fapp_input_rfc");
	var pass = document.getElementById("fapp_input_pass");
	var repass = document.getElementById("fapp_input_repass");
	
	if(addedit == 'edit'){
		name.value = client.getElementsByClassName("fapp_client_name_holder")[0].innerHTML;
		rfc.value = client.getElementsByClassName("fapp_client_RFC")[0].innerHTML;
		document.getElementById("fapp_passcover").style.display = "block";
	}else{
		name.value = "";
		rfc.value = "";
		document.getElementById("fapp_passcover").style.display = "none";
	}
	pass.value = "";
	repass.value = "";
	
	//Remove red marks
	name.style.backgroundColor = "rgba(255,255,255,0.2)";
	rfc.style.backgroundColor = "rgba(255,255,255,0.2)";
	pass.style.backgroundColor = "rgba(255,255,255,0.2)";
	repass.style.backgroundColor = "rgba(255,255,255,0.2)";
	
	//Show it
	document.getElementsByClassName("fapp_cover_page")[0].className = "fapp_cover_page_visible";
	document.getElementsByClassName("fapp_input_main")[0].className = "fapp_input_main_visible";
	
	//Identify it
	document.getElementsByClassName("fapp_input_main_visible")[0].id = addedit;
	
	//Special non-bouncing listeners:
	document.getElementsByClassName("fapp_input_check")[0].addEventListener('click',client_input_check);
}

function hide_popup(){
	document.getElementsByClassName("fapp_cover_page_visible")[0].className = "fapp_cover_page";
	document.getElementsByClassName("fapp_input_main_visible")[0].className = "fapp_input_main";
}

function query_client_change(option, client){
	var status_image = document.getElementById("fapp_status");
	status_image.src = status_loading;
	var jsoned = JSON.parse('{"action":"get_php","method":"POST","url":"","data":[]}');
	jsoned.data[0] = {name:"Name", value:document.getElementById("fapp_input_name").value};
	jsoned.data[1] = {name:"Username", value:document.getElementById("fapp_input_rfc").value};
	jsoned.data[2] = {name:"Password", value:document.getElementById("fapp_input_pass").value};
	switch(option){
		case 'add':
			jsoned.url = add_client_php; 
			break;
		case 'edit':
			jsoned.url = edit_client_php;
			jsoned.data[3] = {name:"ID", value:client.id};
			break;
		default:
			return false;
	}
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			status_image.src = status_wrong;
			alert("Ocurrió un problema al enviar su solicitud, por favor intente más tarde");
		}else{
			switch(response.answer){
				case 'Scs_1'://Todo chingón
					refresh_clients(false);
					break;
				case 'Scs_0'://No se pudo
					status_image.src = status_wrong;
					alert("No es posible realizar la acción en este momento. Por favor intente más tarde");
					break;
				case 'Err_7'://No se agrega porque ya hay!
					status_image.src = status_ready;
					alert("¡Ya tienes registrado este RFC!");
					break;
				default:
					status_image.src = status_wrong;
			}
			hide_popup();
		}
	});
	return false;
}

function create_stack(){
	var year = document.getElementById("fapp_select_year").value;
	var month = document.getElementById("fapp_select_month").value;
	month = month.addLeftZero();
	return {
			current_elem: 0,
			current_state: 0,
			download_active: false,
			ids: [],
			rfcs: [],
			state_urls:[
				login_con_url,
				logged_1_url,
				emi_url,
				rec_url
			],
			error: false,
			tries: 0,
			finished: false,
			date_start: "01/" + month + "/" + year,
			date_end: daysInMonth(month,year) + "/" + month + "/" + year
			};
}
	
function gen_stack(){
	var selected = document.getElementsByClassName("fapp_client_selected");
	if(selected.length != 0){
		var stack = create_stack();
		for(i = 0;i < selected.length;i++){
			stack.ids.push(parseInt(selected[i].id));
			stack.rfcs.push(selected[i].getElementsByClassName("fapp_client_RFC")[0].innerHTML);
		}
		stack.current_elem = 0;
		stack.download_active = true;
		return stack;
	}else{
		alert("Seleccione al menos un cliente para iniciar la descarga");
		return false;
	}
}

function download_process(){
	var stack = gen_stack();
	if(stack){
		chrome.storage.local.set({stack:stack},function(){
			window.location.href = login_con_url;
		});
	}
}

function check_page(){
	chrome.storage.local.get("stack",function(data){
		if(data["stack"]){//stack exists - it may be new or an error stack
			var stack = data["stack"];
			if(stack.download_active && !stack.error){//A fine stack
				console.log(Date.now() + " - Stack detected, current state: " + stack.current_state);
				switch(stack.current_state){//Save stack process must be included inside each function
					case 0: state_login(stack); break;
					/*case 1: state_logged_emi(stack); break;*/
					case 2: state_emi_down(stack); break;
					case 3: state_rec_down(stack); break;
					case 4: state_logout(stack); break;
					default: null;//Error
				}
			}else if(stack.download_active && window.location.href.indexOf(login_con_url)){//Error stack - this should depart from login page exclusively!!
				if(confirm('Ocurrió un error pero existe un proceso de descarga no completado. ¿Desea continuar ahora?')){
					stack.error = false;
					console.log(Date.now() + " - User wanted to continue process, page will reload");
					chrome.storage.local.set({stack:stack},function(){//try to reach page again
						window.location.href = stack.state_urls[stack.current_state];
					});
				}else{
					console.log(Date.now() + " - User does not want to continue, stack removed");
					chrome.storage.local.remove("stack");
					is_session_active();
				}
			}else{//Normal Entrace
				chrome.storage.local.remove("stack");
				console.warn(Date.now() + " - Something weird happened with stack and it's been eliminated");
				is_session_active();
			}
		}else{//Normal Entrace - no stack
			console.log(Date.now() + " - No stack detected, checking for session active");
			window.location.href.indexOf(login_con_url) != -1 ? is_session_active() : null;
		}
	});
}

function onServerError(stack,msg){
	if(stack.tries == 3){
		console.warn("%c" + Date.now() + " - state_" + stack.current_state + ": Server error: " + msg + " - Propting user to retry","color:red");
		if(confirm("Ocurrió un problema con los servidores de Facturapp. ¿Desea intentarlo de nuevo?")){
			console.log("%c" + Date.now() + " - state_" + stack.current_state + ": User will retry","color:green");
			stack.tries = 0;
			chrome.storage.local.set({stack:stack},function(){
				window.location.href = stack.state_urls[stack.current_State];
			});
		}else{
			console.log("%c" + Date.now() + " - state_" + stack.current_state + ": User won't retry","color:orange");
			stack.error = false; stack.tries = 0;
			if(document.getElementById("ctl00_LnkBtnCierraSesion")){//Session was already started
				stack.current_state = 4;//Prepare logout routine
				chrome.storage.local.set({stack:stack},function(){
					document.getElementById("ctl00_LnkBtnCierraSesion").click();
				});
			}else{//No session started - Back to basics
				stack.current_state = 0;
				current.storage.local.set({stack:stack},function(){
					window.location.href = stack.state_urls[stack.current_state];
				});
			}
		}
	}else{
		stack.tries += 1;
		chrome.storage.local.set({stack:stack},function(){
			window.location.href = stack.state_urls[stack.current_state];
		});
	}
}

function state_login(stack){
	if(window.location.href.indexOf(login_con_url) != -1){//Todo en orden
		console.log(Date.now() + " - state_login: Reached login page");
		var jsoned = JSON.parse('{"action":"get_php","method":"POST","url":"","data":[]}');
		jsoned.url = get_pass_php;
		jsoned.data[0] = {name:"ClientID",value:stack.ids[stack.current_elem]};
		chrome.extension.sendMessage(jsoned,function(response){//Ask for password
			if(response.answer == 'Error' || response.answer.indexOf('<br>') != -1){
				onServerError(stack,"Could not retrieve password");
			}else{
				console.log(Date.now() + " - state_login: Pasting user data values");
				if(document.getElementsByName('Ecom_User_ID')){//This prevents the system to throw error if page is redirected by SAT
					document.getElementsByName('Ecom_User_ID')[0].value = stack.rfcs[stack.current_elem];
					document.getElementsByName('Ecom_Password')[0].value = response.answer;
					stack.current_state = 2;//I'm skipping one page...
					chrome.storage.local.set({stack:stack},function(){
						document.getElementById('submit').click();
					});
				}
			}
		});
		return true;
	}else if(window.location.href.indexOf(login_fiel_url) != -1){//Cambiar a acceso por contraseña
		console.warn(Date.now() + " - state_login: Wrong URL, reached FIEL page. Redirecting...");
		window.location.href = stack.state_urls[stack.current_state];
		return true;	
	}else{//Error
		console.warn(Date.now() + " - state_login: Reached weird page: " + window.location.href);
		stack.error = true;
		chrome.storage.local.set({stack:stack},function(){
			console.log(Date.now() + " - state_login: Moving to login page");
			window.location.href = stack.state_urls[stack.current_state];
		});
		return true;
	}
}

function request_invoice(facs,folio,valid,link,stack){
	var xmlReq = new XMLHttpRequest();
	
	chrome.storage.local.get("folios",function(data){//Retrieving folios!
		if(data["folios"] == "[]"){
			var folios = []; var valids = [];
		}else{
			var dashed = data["folios"].split("/");
			var folios = JSON.parse(dashed[0]); var valids = JSON.parse(dashed[1]);
		}
		if(folios.indexOf(folio) == -1){//Not registered - so this is a new invoice
			val_changed = false;
			xmlReq.open("GET",link,true);
			xmlReq.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
			xmlReq.send();
		}else if(parseInt(valids[folios.indexOf(folio)]) != valid){//Validity changed
			val_changed = true;
			xmlReq.open("GET",link,true);
			xmlReq.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
			xmlReq.send();
		}else{//Existent invoice, unchanged. Skip to next
			console.log("%c" + Date.now() + " - state_req: Repeated folio. Skipping: " + count, "color: orange");
			moveNextState(stack);
		}
	});
	
	xmlReq.onload = function(){//El servidor entregó el xml
		console.log(Date.now() + " - state_req: Server delivered XML file of: " + count);
		var jsoned = JSON.parse('{"action":"get_php","method":"POST","url":"","data":[]}'); jsoned.url = add_invoice_php;
		jsoned.data[0] = {name:"Folio",value:folio};
		jsoned.data[1] = {name:"Validity",value:valid};
		jsoned.data[2] = {name:"XML",value:xmlReq.responseText.decodeHtmlEntity()};
		val_changed ? jsoned.data[3] = {name:"Cambio",value:1} : jsoned.data[3] = {name:"Cambio",value:0};
		val_changed = false;
		chrome.extension.sendMessage(jsoned,function(response){//Write to database
			if(response.answer.indexOf('Scs') == -1){//Error writing database
				onServerError(stack,"Database could not be written");
			}else{//Dispatch to next invoice or finish!
				jsoned.data[3].value == 1 ? console.log("%c" + Date.now() + " - state_req: Effectively changed invoice: " + count, "color:purple") : console.log("%c" + Date.now() + " - state_req: Effectively captured invoice: " + count, "color:blue");
				moveNextState(stack);
			}
		});
	};
	xmlReq.onerror = function(){//No se pudo acceder a la factura
	console.warn(Date.now() + " - state_req: The invoice was not delivered from server. Reloading...");
		window.location.href = stack.state_urls[stack.current_state];
	};
}

function moveNextState(stack){
	count += 1;
	var allfacs = document.getElementsByName('BtnDescarga');
	var jsoned = JSON.parse('{"action":"show_progress","progress":"","title":"Guardando Facturas","msg":"Factura: ' + count + " de " + allfacs.length + '"}');
	jsoned.progress = parseInt(100/allfacs.length * count);	
	chrome.extension.sendMessage(jsoned);
	if(count == allfacs.length){
		console.log("%c" + Date.now() + " - state_req: All invoices have been captured","color:green");
		stack.current_state += 1;
		chrome.storage.local.set({stack:stack},function(){
			console.log(Date.now() + " - state_req: process ended!");
			//Decide if logout or navigate
			stack.current_state == 4 ? document.getElementById("ctl00_LnkBtnCierraSesion").click() : window.location.href = stack.state_urls[stack.current_state];
		});
	}else{
		document.dispatchEvent(uploadRequest);
	}
}

function getFolios(stack){
	var jsoned = JSON.parse('{"action":"get_php","method":"POST","url":"","data":[]}'); jsoned.url = get_folios_php;
	jsoned.data[0] = {name:"fechaInicial",value:stack.date_start.replace(/\//g,"-")};
	jsoned.data[1] = {name:"fechaFinal",value:stack.date_end.replace(/\//g,"-")};
	jsoned.data[2] = {name:"clientRFC",value:stack.rfcs[stack.current_elem]};
	//Distinguishing emited = 0 recieved = 1
	stack.current_state == 2 ? jsoned.data[3] = {name:"tipo",value:0} : jsoned.data[3] = {name:"tipo",value:1};
	 
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == "Error"){
			onServerError(stack,"Could not retrieve folios");
		}else{
			chrome.storage.local.set({folios:response.answer},function(){
				document.dispatchEvent(uploadRequest);
			});
		}
	});
}

function state_emi_down(stack){
	if(window.location.href.indexOf(emi_url) != -1){//Todo bien!
		console.log(Date.now() + " - state_emi: Reached the right page");
		var folioDisabled = new CustomEvent('isNowDisabled');
		var resultsUpdated = new CustomEvent('updated');
		
		console.log(Date.now() + " - state_emi: Loading listeners...");
		document.addEventListener('isNowDisabled',function(){//Once the page is in date mode
			console.log(Date.now() + " - state_emi: Page is in date mode, getting invoices...");
			document.getElementById('ctl00_MainContent_CldFechaInicial2_Calendario_text').value = stack.date_start;
			document.getElementById('ctl00_MainContent_CldFechaFinal2_Calendario_text').value = stack.date_end;
			document.getElementsByClassName('sbSelector')[3].innerHTML = '23';
			document.getElementsByClassName('sbSelector')[4].innerHTML = '59';
			document.getElementsByClassName('sbSelector')[5].innerHTML = '59';
			document.getElementById('ctl00_MainContent_BtnBusqueda').click();
		});
		
		document.addEventListener('uprequested',function(){//This is synced with xmlReq.onload
			var facs = document.getElementsByName('BtnDescarga');
			var data = facs[count].parentNode.parentNode.parentNode.children;
			var folio = data[1].children[0].innerHTML;var valid;
			data[data.length-1].children[0].innerHTML == "Vigente" ? valid = 1 : valid = 0;
			var link = "https://portalcfdi.facturaelectronica.sat.gob.mx/" + facs[count].attributes[6].value.split("'")[1];
			
			request_invoice(facs,folio,valid,link,stack);
		});
		
		document.addEventListener('updated',function(){//Actions to perform once invoices are shown
			var facs = document.getElementsByName('BtnDescarga');
			if(facs.length != 0){//If there are invoices..
				count = 0;
				console.log(Date.now() + " - state_emi: Invoices have been displayed, acquiring...");
				var jsoned = JSON.parse('{"action":"show_progress","progress":"","title":"Guardando Facturas","msg":"Facturas totales: ' + facs.length + '"}'); jsoned.progress = 0;
				chrome.extension.sendMessage(jsoned);
				getFolios(stack);
				return false;
			}else{//No results -- Ask for next step in stack
				console.warn(Date.now() + " - state_emi: There are no invoices");
				stack.current_state = 3;
				chrome.storage.local.set({stack:stack},function(){
					console.log(Date.now() + " - state_emi: Redirecting to 'Recibidas', state: " + stack.current_state);
					window.location.href = stack.state_urls[stack.current_state];
				});
				return false;
			}
		});
		
		//The actual process------------------------------------------------------------------------------------
		var track_changes = false;
		var fac_number = 0;
		var noDisp = "none";
		setInterval(function(){
			if(document.getElementById('ctl00_MainContent_TxtUUID').disabled != track_changes){//toggle
				track_changes = document.getElementById('ctl00_MainContent_TxtUUID').disabled;
				document.dispatchEvent(folioDisabled);
			}
			if(document.getElementsByName('BtnDescarga').length != fac_number || document.getElementById("ctl00_MainContent_PnlNoResultados").style.display != noDisp){
				fac_number = document.getElementsByName('BtnDescarga').length;
				noDisp = document.getElementById("ctl00_MainContent_PnlNoResultados").style.display;
				document.dispatchEvent(resultsUpdated);
			}
		},1000);
		
		document.getElementById('ctl00_MainContent_RdoFechas').click();//Select date mode - this triggers everything
		
	}else if(window.location.href.indexOf(iqaccess_url) != -1){//Reached iq access manager
		console.warn(Date.now() + " - state_emi: Reached the iqaccess page. Redirecting...");
		window.location.href = emi_url;
	}else if(window.location.href.indexOf(login_1_pass) != -1 && document.getElementById("msgError")){
		console.warn(Date.now() + " - state_emi: Wrong password. Prompting user to skip...");
		if(confirm("El password no parece funcionar ¿Desea saltar al siguiente usuario?")){
			if(stack.current_elem + 1 == stack.ids.length){//No more users to track
				chrome.storage.local.remove("stack");
				console.log("%c" + Date.now() + " - state_emi: User skipped and process finished","color:red");
				alert("No hay más usuarios en la lista");
				window.location.href = login_con_url;
			}else{
				stack.current_elem += 1;stack.current_state = 0;
				chrome.storage.local.set({stack:stack},function(){
					console.log("%c" + Date.now() + " - state_emi: User skipped but process continues...","color:red");
					window.location.href = login_con_url;
				});
			}
		}else{
			console.log("%c" + Date.now() + " - state_emi: User killed the process","color:red");
			chrome.storage.local.remove("stack");
			window.location.href = login_con_url;
		}
	}else if(window.location.href.indexOf(login_1_pass) != -1 || window.location.href.indexOf(login_2_pass) != -1){
		console.warn(Date.now() + " - state_emi: Reached a known unharmful page. SAT site is redirecting...");
		null;//Wait for it to reload... stupid SAT!
	}else{//Sepa la chingada
		console.warn(Date.now() + " - state_emi: Reached a weird page " + window.location.href);
		stack.error = true; stack.current_state = 2;
		chrome.storage.local.set({stack:stack},function(){
			window.location.href = stack.state_urls[stack.current_state];
		});
		return false;
	}
}

function state_rec_down(stack){
	if(window.location.href.indexOf(rec_url) != -1){//Todo bien!
		console.log(Date.now() + " - state_rec: Reached the right page");
		var folioDisabled = new CustomEvent('isNowDisabled');
		var resultsUpdated = new CustomEvent('updated');
		var uploadRequest = new CustomEvent('uprequested');
		
		console.log(Date.now() + " - state_rec: Loading listeners, waiting for SAT page");
		document.addEventListener('isNowDisabled',function(){//Once the page is in date mode
			console.log(Date.now() + " - state_rec: Page is in date mode, getting invoices...");
			//Page accepts both string and integer values. ParseInt is used to kill left zeros
			document.getElementById('ctl00_MainContent_CldFecha_DdlMes').value = parseInt(stack.date_start.split("/")[1]);
			document.getElementById('DdlAnio').value = parseInt(stack.date_start.split("/")[2]);
			document.getElementById('ctl00_MainContent_BtnBusqueda').click();
		});
		
		document.addEventListener('uprequested',function(){//This is synced with xmlReq.onload
			var facs = document.getElementsByName('BtnDescarga');
			var data = facs[count].parentNode.parentNode.parentNode.children;
			var folio = data[1].children[0].innerHTML;var valid;
			data[data.length-2].children[0].innerHTML == "Vigente" ? valid = 1 : valid = 0;
			var link = "https://portalcfdi.facturaelectronica.sat.gob.mx/" + facs[count].attributes[6].value.split("'")[1];
			
			request_invoice(facs,folio,valid,link,stack);
		});
		
		document.addEventListener('updated',function(){//Actions to perform once invoices are shown
			var facs = document.getElementsByName('BtnDescarga');
			if(facs.length != 0){//If there are invoices..
				count = 0;
				console.log(Date.now() + " - state_rec: Invoices have been displayed, acquiring...");
				var jsoned = JSON.parse('{"action":"show_progress","progress":"","title":"Guardando Facturas","msg":"Facturas totales: ' + facs.length + '"}'); jsoned.progress = 0;
				chrome.extension.sendMessage(jsoned);
				getFolios(stack);
				return false;
			}else{//No results -- Ask for next step in stack
				console.warn(Date.now() + " - state_rec: There are no invoices");
				stack.current_state = 4;
				chrome.storage.local.set({stack:stack},function(){
					console.log(Date.now() + " - state_rec: Logging out. State: " + stack.current_state);
					document.getElementById("ctl00_LnkBtnCierraSesion").click();
				});
				return false;
			}
		});
		
		//The actual process------------------------------------------------------------------------------------
		var track_changes = false;
		var fac_number = 0;
		var noDisp = "none";
		setInterval(function(){
			if(document.getElementById('ctl00_MainContent_TxtUUID').disabled != track_changes){//toggle
				track_changes = document.getElementById('ctl00_MainContent_TxtUUID').disabled;
				document.dispatchEvent(folioDisabled);
			}
			if(document.getElementsByName('BtnDescarga').length != fac_number || document.getElementById("ctl00_MainContent_PnlNoResultados").style.display != noDisp){
				fac_number = document.getElementsByName('BtnDescarga').length;
				noDisp = document.getElementById("ctl00_MainContent_PnlNoResultados").style.display;
				document.dispatchEvent(resultsUpdated);
			}
		},1000);
		
		document.getElementById('ctl00_MainContent_RdoFechas').click();//Select date mode - this triggers everything
		
	}else{//Sepa la chingada
		console.warn(Date.now() + " - state_rec: Reached a weird page " + window.location.href);
		stack.error = true; stack.current_state = 2;
		chrome.storage.local.set({stack:stack},function(){
			console.log(Date.now() + " - state_rec: Trying to keep in track: Moving to state: " + stack.current_state);
			//Remember folios must be checked at the beggining
			window.location.href = stack.state_urls[stack.current_state];
		});
		return false;
	}	
}

function state_logout(stack){
	if(window.location.href.indexOf(logout_url) != -1 || window.location.href.indexOf(logout_1_pass) != -1 || window.location.href.indexOf(logout_2_pass) != -1){//Reached a known logout page
		if(document.body.innerText.indexOf(loguot_token) != -1){//Reached the last logout page
			console.log(Date.now() + " - state_logout: Reached the logout page");
			var n = stack.ids.length - 1;
			var i = stack.current_elem;
			if(stack.error){//Error
				console.log("%c" + Date.now() + " - state_logout: Redirecting due to error...","color:red");
				window.location.href = login_con_url;
			}else if(i != n){//Not the end
				console.log(Date.now() + " - state_logout: Updating stack element...");
				stack.current_elem += 1; stack.current_state = 0;
				chrome.storage.local.set({stack:stack},function(){
					console.log(Date.now() + " - state_logout: Updated stack to element: " + stack.update_elem + ", and state: " + stack.current_state);
					window.location.href = stack.state_urls[stack.current_state];
				});
			}else{//The end
				chrome.storage.local.remove("stack",function(){
					console.log("%c" + Date.now() + " - state_logout: Happily ended!","color:green");
					window.location.href = login_con_url;
				});
			}
		}else{
			console.log(Date.now() + " - state_logout: SAT page is redirecting...");
			null; //Let stupid sat to redirect
		}
	}else{
		console.warn(Date.now() + " - state_logout: Reached a werid page: " + window.location.href);
		chrome.storage.local.remove("stack");
	}
}

String.prototype.decodeHtmlEntity = function() {
	var res = this.replace(/&#(\d+);/g,function(match, dec){return String.fromCharCode(dec);});
	return res.replace(/&#(\w+);/g,"");
};

function is_session_active(){
	if(window.location.href.indexOf(login_con_url) != -1){
		var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}'); jsoned.url = is_logged_php;
		chrome.extension.sendMessage(jsoned,function(response){
			if(response.answer == 'Error'){
				alert("Los servidores de Facturapp están temporalmente fuera de servicio. Por favor intente más tarde.");
				return false;
			}else{
				var yesno = response.answer.split("_")[1];
				if(yesno == "0"){//There's no session -- instruct to open session
					if(window.location.href.indexOf(login_con_url) == 0){
						jsoned = JSON.parse('{"action":"prompt_message","title":"Inicie sesión en Facturapp","msg":"Inicie sesión en Facturapp usando el ícono en la barra de navegación."}');
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
}

function build_menu(){
	var get_side_bar = new XMLHttpRequest();
	get_side_bar.open("GET", sidebar_URL, true);
	get_side_bar.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	get_side_bar.onload = function(argument){
		//Insert structure
		document.body.innerHTML += get_side_bar.responseText.replace(/[\r\n\t]/g, "");
		
		//Save RFC options
		chrome.storage.sync.get("RFC",function(data){
			document.getElementsByClassName("fapp_office_RFC")[0].innerHTML = data["RFC"];
		});
		
		//Place/edit images
		document.getElementById("fapp_logo").src = fapp_logo;
		
		//Insert Clients
		refresh_clients(true);
	};
	get_side_bar.send();
}

function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}

//Main
check_page();