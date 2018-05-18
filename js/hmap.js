/**
 * Generate germplasmDbId to markerprofileDbID Hmap
 * @function
 * @param {Array} markerprofiles - Array of germplasm
 */
function getMarkerProfileHmap(markerprofiles){
    let hmap=[], alreadyTreated = [];
    for (let i = 0; i < markerprofiles.length; i++) {
        for (let j = 0; j < markerprofiles[i].length; j++) {
            if(!isInArray(alreadyTreated, markerprofiles[i][j].germplasmDbId)){
                alreadyTreated.push(markerprofiles[i][j].germplasmDbId);
                hmap[markerprofiles[i][j].germplasmDbId]=[];
                hmap[markerprofiles[i][j].germplasmDbId].push(markerprofiles[i][j]);
            }else{
                hmap[markerprofiles[i][j].germplasmDbId].push(markerprofiles[i][j]);
            }
        }
    }
    return hmap;
}


/**
 * Revers any hmap;
 * @function
 * @param {Array} hMap- The current Hmap.
 */
function reversHmap(hMap){
    let newHMap = [];
    Object.keys(hMap).forEach(function(element){
        for(let i=0; i<hMap[element].length;i++){
            newHMap[hMap[element][i].markerprofileDbId]=element;
        }
    });
    return newHMap;
}

/**
 * Generate call to url hmap
 * @function
 * @param {Array} resp - result of getCall function
 * @param {Array} calls - Url tab
 */
function bindCall2Url(resp, calls) {
    call2UrlTab=[];
    //console.log(resp);
    for(let i=0; i<resp.length; i++){
        let hmapCall2Url=[];
        for(let j=0; j<resp[i].length;j++) {
            /*for(let k=0; k<calls.length; k++){
                if (isInArray(resp[i][j].callsImplemented, calls[k])) {
                    hmapCall2Url[calls[k]] = resp[i][j].url + ';' + resp[i][j].token;
                }
            }*/
            calls.forEach(function (element) {
                if (isInArray(resp[i][j].callsImplemented, element)) {
                    hmapCall2Url[element] = resp[i][j].url + ';' + resp[i][j].token;
                }
            });
        }
        call2UrlTab.push(hmapCall2Url);
    }
}

/**
 * Generate LinkageGroup to Marker Hmap
 * @function
 * @param {Array} arrayOfLinkageGroup - All LinkageGroup
 * @param {Array} arrayMarkers - All Markers
 */
function setHmapLinkageGroup(arrayOfLinkageGroup, arrayMarkers){
    hmapsLinkageGroup=[];
    for(let i =0; i<arrayOfLinkageGroup.length; i++){
        hmapsLinkageGroup[arrayOfLinkageGroup[i]]=[];
    }
    for (let i = 0; i < arrayMarkers.length; i++) {
        for (let j = 0; j < arrayMarkers[i].length; j++) {
            hmapsLinkageGroup[arrayMarkers[i][j].linkageGroupName].push(arrayMarkers[i][j].markerDbId);
        }
    }
}

/**
 * Generate Type to Marker Hmap
 * @function
 * @param {Array} arrayOfMarkersType - All Marker Type
 * @param {Array} arrayMarkers - All Markers
 */
function setHmapType(arrayOfMarkersType,arrayMarkers){
    hmapsType = [];
    for(let i =0; i<arrayOfMarkersType.length; i++){
        hmapsType[arrayOfMarkersType[i]]=[];
    }
    for (let i = 0; i < arrayMarkers.length; i++) {
        for (let j = 0; j < arrayMarkers[i].length; j++) {
            for (let k = 0; k < arrayMarkers[i][j].length; k++) {
                hmapsType[arrayMarkers[i][j][k].type].push(arrayMarkers[i][j][k].markerDbId);
            }
        }
    }
    //console.log(hmapsType);
    return hmapsType;
}

function setLocalStorage(arrayMarkers) {
    for(let j=0; j<arrayMarkers.length;j++){
        for(let i=0; i<arrayMarkers[j].length; i++){
            markerDetailsHmap[arrayMarkers[j][i].markerDbId] = arrayMarkers[j][i].linkageGroupName + ':' + arrayMarkers[j][i].location;
        }
    }
}