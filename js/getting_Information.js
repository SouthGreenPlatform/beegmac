/**
 * Get a Token.
 * @async
 * @function
 * @param {string} stringUserName - The User Name.
 * @param {string} stringPassword - The Password.
 * @param {string} urlEndPoint - The brapi endpoint.
 */
async function getToken(stringUserName, stringPassword, urlEndPoint){
	let myURL = urlEndPoint + "/" + URL_TOKEN, tokenString="";
	let body = {username : stringUserName, password : stringPassword};
	body = JSON.stringify(body);
	try {
    	let resp = await fetch(myURL,{method: "POST",body: body, headers: {'Content-Type': 'application/json'}});
    	if (resp.status>199 && resp.status<300){
		tokenString = await resp.json();
		return tokenString.access_token;
		}else{return tokenString;}
	}
	catch(err) {
	    handleErrors('Impossible to take one tokenUrl: ' + err.message);
	}
}

/**
 * Check the map coming from the url.
 * @async
 * @function
 * @param {string} brapiEndPoint - The brapi endpoint.
 * @param {string} mapDbId - The Password.
 */
async function urlMapIdIsOk(brapiEndPoint, mapDbId){
    try {
        await fetch(brapiEndPoint + "/" + URL_MAPS + "/" + mapDbId);
    } catch (err) {
        handleErrors("Incorrect map id in Url : " + mapDbId);
        return false;
    }
	return true;
}

/**
 * Check the brapiEndPoint coming from the url.
 * @async
 * @function
 * @param {string} brapiEndPoint - The brapi endpoint.
 */
async function urlBrapiEndPointIsOk(brapiEndPoint){
	try{
        let reponse = await fetch(brapiEndPoint + "/" + URL_CALLS);
        if(!reponse.ok){
            handleErrors("Bad BrAPI end point in Url : " + brapiEndPoint);
            return false;
		}
    }catch(err){
		handleErrors("Bad BrAPI end point in Url : " + brapiEndPoint);
		return false;
	}
	return true;
}

/**
 * Get the list of calls implemented by the passed brapi endpoint 
 * @async
 * @function
 * @param {urlWithAuth} urlWithToken - The Url
 */
async function getCalls(urlWithToken){
        let myURL1 = urlWithToken.url + "/" + URL_CALLS;
        let myHeaders1 = new Headers();
        let Authorization = urlWithToken.token==='' ? '' : "Bearer " + urlWithToken.tokenUrl1;
        myHeaders1 = {Authorization};
		try{
			let resp1 = await fetch(myURL1, myHeaders1);
			resp1 = await resp1.json();
			return resp1.result.data;
		}catch(err){
			handleErrors('Bad Url : ' + urlWithToken.url);
		}

}

/**
 * Return the list of maps for a given url
 * @async
 * @function
 * @param {array} argumentsArray - Array containing the parameters required by the function
 */
async function readMaps(argumentsArray){
	let myURL = argumentsArray.urlEndPoint + "/" + URL_MAPS;
	let foundMaps = [];
	let myInit = returnInit(argumentsArray.token);
    try {
    	let resp = await fetch(myURL, myInit);
    	resp = await resp.json();
		resp.result.data.forEach(function(element){foundMaps.push(element);});
		return foundMaps;
	}
	catch(err) {
	     handleErrors('impossible to load call maps: ' + err.message);
	}  
}

/**
 * Return the list of studies for a given url
 * @async
 * @function
 * @param {array} argumentsArray - Array containing the parameters required by the function
 */
async function readStudyList(argumentsArray){
	let myURL = argumentsArray.urlEndPoint + "/" + URL_STUDIES + "?studyType=genotype";
	let foundStudies = new Array();
	let myInit = returnInit(argumentsArray.token);
    try {
    	let resp = await fetch(myURL, myInit);
    	resp = await resp.json();
		resp.result.data.forEach(function(element){foundStudies.push(element);});
		return foundStudies;
	}
	catch(err) {
	     handleErrors('impossible to load call studies: ' + err.message);
	}    
}

/**
 * Return the list of Marker Profile for a given url
 * @async
 * @function
 * @param {array} argumentsArray - Array containing the parameters required by the function
 */
async function getmarkerprofileDbId(argumentsArray){
    let myURL = argumentsArray.askedPage===undefined ? argumentsArray.urlEndPoint + "/" + URL_MARKER_PROFILES + "?studyDbId=" + argumentsArray.selectedStudy : argumentsArray.urlEndPoint + "/" + URL_MARKER_PROFILES +"?page="+argumentsArray.askedPage + "&studyDbId=" + argumentsArray.selectedStudy;
	let myInit = returnInit(argumentsArray.token);
	try {
		let resp = await fetch(myURL, myInit);
    	resp = await resp.json();
    	//console.log(resp);
		return resp;
	}
	catch(err) {
	     handleErrors('impossible to load call Maker Profile: ' + err.message);
	} 
}

/**
 * Return the list of Marker for a given url
 * @async
 * @function
 * @param {array} argumentsArray - Array containing the parameters required by the function
 */
async function getMarkers(argumentsArray){
    let myURL = argumentsArray.askedPage===undefined ? argumentsArray.urlEndPoint + "/" + URL_MARKERS : argumentsArray.urlEndPoint + "/" + URL_MARKERS;

	let jsonBody = { "page" : argumentsArray.askedPage };
    if (argumentsArray.askedType !== undefined && argumentsArray.askedType !== null)
    	jsonBody['type'] = argumentsArray.askedType;
	if (argumentsArray.pageSize !== undefined && argumentsArray.pageSize !== null)
		jsonBody['pageSize'] = argumentsArray.pageSize;
	
	let myHeaders = new Headers();
	if(argumentsArray.token!==""){
		myHeaders = {
			'Content-Type':'application/json',
			'Authorization': 'Bearer '+argumentsArray.token
		};
	}else {
		myHeaders = {
			'Content-Type':'application/json'
		};
	}

	try {
		//console.log(myURL);
		let resp = await fetch(myURL,{method: "POST",body: JSON.stringify(jsonBody), headers: myHeaders});
    	resp = await resp.json();
		return resp;	
	}
	catch(err) {
	     handleErrors('impossible to load call Marker: ' + err.message);
	} 
}

/**
 * Return the details for a given map
 * @async
 * @function
 * @param {array} argumentsArray - Array containing the parameters required by the function
 */
async function getMapDetails(argumentsArray){
	let myURL=argumentsArray.urlEndPoint+"/"+URL_MAPS+"/"+argumentsArray.selectedMap;
	let myInit = returnInit(argumentsArray.token);
	try {
		let resp = await fetch(myURL, myInit);
		resp = await resp.json();
		return resp;
	}
	catch(err) {
	     handleErrors('unable to get map details: ' + err.message);
	} 
}

/**
 * Return the list of Marker Position for a given url
 * @async
 * @function
 * @param {array} argumentsArray - Array containing the parameters required by the function
 */
async function getMarkersPosition(argumentsArray){
    let myURL = '';
    if(argumentsArray.askedPage===undefined){
    	myURL = argumentsArray.urlEndPoint+"/"+URL_MAPS+"/"+argumentsArray.selectedMap+"/positions";
    	if(argumentsArray.selectedLKG!==undefined){
            myURL += '?linkageGroupName=' + argumentsArray.selectedLKG;
		}
	}else{
    	myURL = argumentsArray.urlEndPoint+"/"+URL_MAPS+"/"+argumentsArray.selectedMap+"/positions?page="+argumentsArray.askedPage;
        if(argumentsArray.selectedLKG!==undefined){
            myURL += '&linkageGroupName=' + argumentsArray.selectedLKG;
        }
    }
    let myInit = returnInit(argumentsArray.token);
	//console.log(myURL);
	try {
		let resp = await fetch(myURL, myInit);
		resp = await resp.json();
		return resp;
	}
	catch(err) {
	     handleErrors('impossible to load call ' + URL_MAPS + ': ' + err.message);
	}
}

/**
 * Return the data matrix for a given marker list/ marker profile list
 * @async
 * @function
 * @param {array} argumentsArray - Array containing the parameters required by the function
 */
async function getMatrix(argumentsArray){
    try {
		let myURL = argumentsArray.askedPage===undefined ? argumentsArray.urlEndPoint + "/" +URL_ALLELE_MATRIX : argumentsArray.urlEndPoint + "/" +URL_ALLELE_MATRIX;
		let matrixJson = {
				"pageSize" : argumentsArray.clientPageSize,
				"page" : argumentsArray.askedPage,
				"markerprofileDbId" : argumentsArray.sentMarkerProfiles,
				"markerDbId" : argumentsArray.sentMarkers,
				"unknownString" : "",
				"sepUnphased" : argumentsArray.isAnExport ? "/" : " / ",
				"sepPhased" : argumentsArray.isAnExport ? "/" : " / ",
				"expandHomozygotes" : true,
				"format" : argumentsArray.isAnExport ? "tsv" : "json"
		}
		let myHeaders = new Headers();
		if(argumentsArray.token!==""){
			myHeaders = {
				'Content-Type':'application/json',
				'Authorization': 'Bearer '+argumentsArray.token
			};
		}else {
			myHeaders = {
				'Content-Type':'application/json'
			};
		}
    	let resp = await fetch(myURL,{method: "POST",body: JSON.stringify(matrixJson), headers: myHeaders});
		resp = await resp.json();
		return resp;
	}
	catch(err) {
	     handleErrors('impossible to call ' + URL_ALLELE_MATRIX + ': '+ err.message);
	}
}

/**
 * Function responsible for exporting the matrix
 * @async
 * @exports allelematrix
 * @function
 * @param {array} argumentsArray - Array containing the parameters required by the function
 */
async function getExportStatus(argumentsArray){
    let l = Ladda.create( document.querySelector( '#Export'));
    try {
        l.start();
		let myURL = argumentsArray.urlEndPoint + "/" + URL_ALLELE_MATRIX + "/status/" + argumentsArray.asynchid;
		let myInit = returnInit(argumentsArray.token);
		let resp = await fetch(myURL, myInit);
		resp = await resp.json();
		//console.log(resp);
		//console.log(argumentsArray.asynchid);
		//console.log(myURL);
		while(resp.metadata.status[0].message==="INPROCESS" && exportIsAbort===false){
			//console.log(myURL);
			//console.log(resp.metadata.status[0].message);
			resp = await fetch(myURL, myInit);
			resp = await resp.json();
			//console.log(resp.metadata.pagination.currentPage);
			l.setProgress(resp.metadata.pagination.currentPage/100);
			//console.log(resp.metadata.pagination.currentPage/100);
			await sleep(1500);
		}
		if(exportIsAbort===false && resp.metadata.status[0].message!=="FAILED"){
            //console.log(resp);
            l.setProgress(1);
            window.location = resp.metadata.datafiles[0];
		}
	}
	catch(err) {
		handleErrors('unable to export data');
	}
    $('#AbortExport').hide();
    l.stop();
}

/**
 * Return the details for a given Germplasms
 * @async
 * @function
 * @param {array} argumentsArray - Array containing the parameters required by the function
 */
async function getGermplasmsDetails(argumentsArray){
    try{
        let myURL = argumentsArray.urlEndPoint + "/" + URL_GERMPLASM_SEARCH;
        let temp = {germplasmDbIds : argumentsArray.germplasmIdArray};
        let myHeaders = new Headers();
        temp = JSON.stringify(temp);
        if(argumentsArray.token!==""){
            myHeaders = {'Authorization': 'Bearer '+argumentsArray.token,
                'Content-Type': 'application/json'
            };
        }else {
            myHeaders = {
                'Content-Type': 'application/json'
            };
        }
        let resp = await fetch(myURL,{method: "POST",body: temp, headers: myHeaders});
        return await resp.json();
	}catch (err){
		handleErrors('unable to export data');
	}

}

