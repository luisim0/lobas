String.prototype.replaceAt = function(index, character){
	if(character != ""){
		return this.substr(0,index) + character + this.substr(index+character.length);
	}else{
		return this.substr(0,index) + character + this.substr(index+1);
	}	
};

String.prototype.roundToInt = function(){
	if(this){
		return String(parseInt(this));
	}else{
		return "0";
	}
};

String.prototype.makeVaro = function(){
	if(this){
		return ("$" + String(Math.round(parseFloat(this)*100)/100)).replace("$-","-$");
	}else{
		return "$0.00";
	}
};

String.prototype.makePercent = function(){
	return String(Math.round(parseFloat(this)*100)/100) + "%";
};

function total17(total){
	var res = total.split("."); if(!res[1]) res[1] = "00";
	var n = res[0].length;
	var intpart = "";var decpart = "";
	for(i = 9;i >= 0;i--){
		(i < n) ? intpart += res[0][n-i-1] : intpart += "0";
	}
	var n = res[1].length;
	for(i = 0;i < 6;i++){
		(i < n) ? decpart += res[1][i] : decpart += "0";
	}
	
	return intpart + "." + decpart;
}

function isNull(obj,escape){
	if(obj == null){
		return escape;
	}else{
		return obj;
	}
}

function buildChain(objs){
	var chain = "||" + objs["version"].value + "|" + objs["UUID"].value + "|" + objs["FechaTimbrado"].value + "|" + objs["selloCFD"].value + "|" + objs["noCertificadoSAT"].value + "||";
	return chain.replace(/[\r\n\t]/g, "").replace(/ /g, "");
}

function getData(){
var facData = {};
var xmlFac = document.getElementById("collapsible0").innerText;
var parser = new DOMParser();
var xmlFac = parser.parseFromString(xmlFac,"text/xml").documentElement;
//Namespaces
var cfdi = xmlFac.getAttribute("xmlns:cfdi");
var xsi = xmlFac.getAttribute("xmlns:xsi");
var tfd = xmlFac.getAttribute("xmlns:tfd");
if(!tfd) tfd = xmlFac.getElementsByTagNameNS(cfdi,"Complemento")[0].getElementsByTagNameNS("*","TimbreFiscalDigital")[0].getAttribute("xmlns:tfd");
//General
facData.LugarExpedicion = xmlFac.getAttribute("LugarExpedicion");
facData.fecha = xmlFac.getAttribute("fecha");
facData.noCertificado = xmlFac.getAttribute("noCertificado");
facData.UUID = xmlFac.getElementsByTagNameNS(tfd,"TimbreFiscalDigital")[0].getAttribute("UUID");
//Emisor
facData.Enombre = isNull(xmlFac.getElementsByTagNameNS(cfdi,"Emisor")[0].getAttribute("nombre"),"No se encontró un nombre!");
facData.Erfc = xmlFac.getElementsByTagNameNS(cfdi,"Emisor")[0].getAttribute("rfc");
var domFis = xmlFac.getElementsByTagNameNS(cfdi,"DomicilioFiscal")[0].attributes;
var domFisStr = "";
for(i = 0;i < domFis.length;i++){
	switch(domFis[i].nodeName){
		case "calle":
			domFisStr += (" " + domFis[i].value + " ");break;
		case "noExterior":
			domFisStr += (" #" + domFis[i].value + " ");break;
		case "noInterior":
			domFisStr += (" int. " + domFis[i].value + ",");break;
		case "colonia":
			domFisStr += (" Col. " + domFis[i].value + ",");break;
		case "referencia":
			domFisStr += (" Referencia: '" + domFis[i].value + "',");break;
		case "municipio":
			domFisStr += (" Mpio. " + domFis[i].value + ",");break;
		case "codigoPostal":
			domFisStr += (" C.P. " + domFis[i].value + ",");break;
		default:
			domFisStr += (" " + domFis[i].value + ", ");
	}
}
domFisStr = domFisStr.replaceAt(0, "");
domFisStr = domFisStr.replaceAt(domFisStr.length - 1, ".");
facData.DomicilioFiscal = domFisStr;
facData.Regimen = xmlFac.getElementsByTagNameNS(cfdi,"RegimenFiscal")[0].getAttribute("Regimen");
//Receptor
facData.Rnombre = isNull(xmlFac.getElementsByTagNameNS(cfdi,"Receptor")[0].getAttribute("nombre"),"No se encontró un nombre!");
facData.Rrfc = xmlFac.getElementsByTagNameNS(cfdi,"Receptor")[0].getAttribute("rfc");
var domFis = xmlFac.getElementsByTagNameNS(cfdi,"Domicilio")[0].attributes;
var domFisStr = "";
for(i = 0;i < domFis.length;i++){
	switch(domFis[i].nodeName){
		case "calle":
			domFisStr += (" " + domFis[i].value + " ");break;
		case "noExterior":
			domFisStr += (" #" + domFis[i].value + " ");break;
		case "noInterior":
			domFisStr += (" int. " + domFis[i].value + ",");break;
		case "colonia":
			domFisStr += (" Col. " + domFis[i].value + ",");break;
		case "referencia":
			domFisStr += (" Referencia: '" + domFis[i].value + "',");break;
		case "municipio":
			domFisStr += (" Mpio. " + domFis[i].value + ",");break;
		case "codigoPostal":
			domFisStr += (" C.P. " + domFis[i].value + ",");break;
		default:
			domFisStr += (" " + domFis[i].value + ", ");
	}
}
domFisStr = domFisStr.replaceAt(0, "");
domFisStr = domFisStr.replaceAt(domFisStr.length - 1, ".");
facData.Domicilio = domFisStr;
//Conceptos
var conceptos = xmlFac.getElementsByTagNameNS(cfdi,"Concepto");
facData.conceptos = [];
for(i = 0;i < conceptos.length;i++){
	facData.conceptos[i] = {cantidad:conceptos[i].getAttribute("cantidad").roundToInt(),
		unidad:conceptos[i].getAttribute("unidad"),
		descripcion:conceptos[i].getAttribute("descripcion"),
		valorUnitario:conceptos[i].getAttribute("valorUnitario").makeVaro(),
		importe:conceptos[i].getAttribute("importe").makeVaro()};
}
//Impuestos trasladados
var traslados = xmlFac.getElementsByTagNameNS(cfdi,"Traslado");
facData.traslados = [];
for(i = 0;i < traslados.length;i++){
	facData.traslados[i] = {impuesto:traslados[i].getAttribute("impuesto"),
		tasa:traslados[i].getAttribute("tasa").makePercent(),
		importe:traslados[i].getAttribute("importe").makeVaro()};
}
//Impuestos retenidos
var retenciones = xmlFac.getElementsByTagNameNS(cfdi,"Retencion");
facData.retenciones = [];
for(i = 0;i < retenciones.length;i++){
	facData.retenciones[i] = {impuesto:retenciones[i].getAttribute("impuesto"),
		importe:retenciones[i].getAttribute("importe").makeVaro()};
}
//Varo General
facData.subTotal = xmlFac.getAttribute("subTotal").makeVaro();
facData.descuento = isNull(xmlFac.getAttribute("descuento"),"0").makeVaro();
facData.totalImpuestosTrasladados = isNull(xmlFac.getElementsByTagNameNS(cfdi,"Impuestos")[0].getAttribute("totalImpuestosTrasladados")).makeVaro();
facData.totalImpuestosRetenidos = isNull(xmlFac.getElementsByTagNameNS(cfdi,"Impuestos")[0].getAttribute("totalImpuestosRetenidos"),"0").makeVaro();
facData.total = xmlFac.getAttribute("total").makeVaro();
//Características del Varo
facData.formaDePago = xmlFac.getAttribute("formaDePago");
facData.metodoDePago = xmlFac.getAttribute("metodoDePago");
//Timbre y sellos
facData.selloCFD = xmlFac.getElementsByTagNameNS(tfd,"TimbreFiscalDigital")[0].getAttribute("selloCFD");
facData.selloSAT = xmlFac.getElementsByTagNameNS(tfd,"TimbreFiscalDigital")[0].getAttribute("selloSAT");
facData.cadena = buildChain(xmlFac.getElementsByTagNameNS(tfd,"TimbreFiscalDigital")[0].attributes);
//Timbrado
facData.noCertificadoSAT = xmlFac.getElementsByTagNameNS(tfd,"TimbreFiscalDigital")[0].getAttribute("noCertificadoSAT");
facData.FechaTimbrado = xmlFac.getElementsByTagNameNS(tfd,"TimbreFiscalDigital")[0].getAttribute("FechaTimbrado");
//QR Code
var re = "?re=" + xmlFac.getElementsByTagNameNS(cfdi,"Emisor")[0].getAttribute("rfc");
var rr = "&rr=" + xmlFac.getElementsByTagNameNS(cfdi,"Receptor")[0].getAttribute("rfc");
var tt = "&tt=" + total17(xmlFac.getAttribute("total"));
var id = "&id=" + xmlFac.getElementsByTagNameNS(tfd,"TimbreFiscalDigital")[0].attributes["UUID"].value;
facData.qrcode = re+rr+tt+id;

return facData;
}

function setData(dummyDoc, facData){
	dummyDoc.getElementById("fac_lugarFecha").innerHTML = facData.LugarExpedicion + "<br/>" + facData.fecha;
	dummyDoc.getElementById("fac_certCSD").innerHTML = facData.noCertificado;
	dummyDoc.getElementById("fac_uuid").innerHTML = facData.UUID;
	dummyDoc.getElementById("fac_enombre").innerHTML = facData.Enombre;
	dummyDoc.getElementById("fac_edir").innerHTML = facData.DomicilioFiscal;
	dummyDoc.getElementById("fac_erfc").innerHTML = facData.Erfc;
	dummyDoc.getElementById("fac_eregime").innerHTML = facData.Regimen;
	dummyDoc.getElementById("fac_rnombre").innerHTML = facData.Rnombre;
	dummyDoc.getElementById("fac_rdir").innerHTML = facData.Domicilio;
	dummyDoc.getElementById("fac_rrfc").innerHTML = facData.Rrfc;
	//Fill Concepts
	var classes = ["fac_tb_center","fac_tb_center","","fac_tb_right","fac_tb_right"];
	for(i = 0;i < facData.conceptos.length;i++){
		var row = dummyDoc.createElement("tr");
		for(j = 0;j < 5;j++){
			var col = dummyDoc.createElement("td");
			col.className = classes[j];
			switch(j){
				case 0: col.innerHTML = facData.conceptos[i].cantidad; break;
				case 1: col.innerHTML = facData.conceptos[i].unidad; break;
				case 2: var div = dummyDoc.createElement("div"); div.innerHTML = facData.conceptos[i].descripcion; col.appendChild(div); break;
				case 3: col.innerHTML = facData.conceptos[i].valorUnitario; break;
				case 4: col.innerHTML = facData.conceptos[i].importe; break;
			}
			row.appendChild(col);
		}
		dummyDoc.getElementById("fac_addConcepto").appendChild(row);
	}
	//Fill Trasladados
	var classes = ["fac_tb_center","fac_tb_center","fac_tb_right"];
	for(i = 0;i < facData.traslados.length;i++){
		var row = dummyDoc.createElement("tr");
		for(j = 0;j < 3;j++){
			var col = dummyDoc.createElement("td");
			col.className = classes[j];
			switch(j){
				case 0: col.innerHTML = facData.traslados[i].impuesto; break;
				case 1: col.innerHTML = facData.traslados[i].tasa; break;
				case 2: col.innerHTML = facData.traslados[i].importe; break;
			}
			row.appendChild(col);
		}
		dummyDoc.getElementById("fac_addTraslado").appendChild(row);
	}
	//Fill Retenidos
	var classes = ["fac_tb_center","fac_tb_right"];
	for(i = 0;i < facData.retenciones.length;i++){
		var row = dummyDoc.createElement("tr");
		for(j = 0;j < 2;j++){
			var col = dummyDoc.createElement("td");
			col.className = classes[j];
			switch(j){
				case 0: col.innerHTML = facData.retenciones[i].impuesto; break;
				case 1: col.innerHTML = facData.retenciones[i].importe; break;
			}
			row.appendChild(col);
		}
		dummyDoc.getElementById("fac_addRetencion").appendChild(row);
	}
	//Varos generales
	dummyDoc.getElementById("fac_subtotal").innerHTML = facData.subTotal;
	dummyDoc.getElementById("fac_descuento").innerHTML = facData.descuento;
	dummyDoc.getElementById("fac_trasladados").innerHTML = facData.totalImpuestosTrasladados;
	dummyDoc.getElementById("fac_retenidos").innerHTML = facData.totalImpuestosRetenidos;
	dummyDoc.getElementById("fac_total").innerHTML = facData.total;
	
	return dummyDoc;
}

function callPage(){
	if(window.location.href.indexOf(".xml") != -1){
		var jsoned = JSON.parse('{"action":"get_php","method":"POST","url":"","data":[]}');
		jsoned.url = chrome.extension.getURL("/SrcHTML/fac_template.html");
		chrome.extension.sendMessage(jsoned,function(response){
			var dummyDoc = document.implementation.createHTMLDocument("dummy");
			dummyDoc.documentElement.innerHTML = response.answer.replace(/[\t\r\n]/g,"");
			dummyDoc = setData(dummyDoc, getData());

			var win = window.open("", "Vista de Factura", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=850, height=900");
			win.document.documentElement.innerHTML = dummyDoc.documentElement.innerHTML;
		});
	}
}

callPage();
