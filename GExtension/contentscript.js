function build_menu(){
	var menu = document.createElement('div');
	menu.id = 'fapp_main_panel';
	menu.className = 'fapp_main_panel';
	menu.innerHTML = "<div id='fapp_frame_manipulate'><div id='fapp_hide_holder'><img src='' id='fapp_hide_button'/></div><div id='fapp_logo_holder'><img src='' id='fapp_logo'/></div><div id='fapp_frame_contents'></div>";
	
	//Insert structure
	document.body.appendChild(menu);
	
	//Place/edit images
	var hide_button = document.getElementById("fapp_hide_button"); 
	hide_button.src = chrome.extension.getURL("IMGs/hide.png");
	hide_button.width = "40"; hide_button.height = "40";
	document.getElementById("fapp_logo").src = chrome.extension.getURL("IMGs/facturapp_logo_ver.png");
}

build_menu();