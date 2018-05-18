/**
 * Launch export of allelematrix
 * @function
 * @async
 */
async function exportMatrix(){
    $('#AbortExport').show();
    exportIsAbort=false;
    let sentMarkerProfiles = $("#MarkersProfils option:selected").map(function(){return $(this).val().split(",");}).get();
    sentMarkerProfiles = removeAll(sentMarkerProfiles, "");
    let sentMarkers = selectedMarkers;
    //console.log(sentMarkers);
    let isAnExport= true, askedPage = undefined;
    let argumentsArray = {sentMarkers, sentMarkerProfiles, clientPageSize, isAnExport, askedPage};
    argumentsArray = setArgumentArray("allelematrix-search",argumentsArray);
    let link = await getMatrix(argumentsArray);
    //console.log(link);
    argumentsArray.asynchid = link.metadata.status[0].message;
    //console.log(argumentsArray.asynchid);
    argumentsArray = setArgumentArray('allelematrix-search/status', argumentsArray);
    await getExportStatus(argumentsArray);
}
/**
 * Launch export of germplasm details
 * @function
 * @async
 */
async function ExportDetailsGermplasms(){
    let jsonHmap = [],  argumentsArray;
    let selectedGermplasms = $("#Germplasms option:selected").map(function(){return $(this).text().split(",");}).get();
    let l = Ladda.create( document.querySelector( '#ExportGermplasmsDetails'));
    let step = (1/(selectedGermplasms.length/100)), avancement = 0;
    try
    {
    	argumentsArray = setArgumentArray(URL_GERMPLASM_SEARCH);
    }
    catch (err)
    {
    	console.log(err.message);
    }
    exportGermplasmsIsAbort=false;
    $('#AbortExportGermplasmsDetails').show();
    l.start();
    l.setProgress( avancement );
    selectedGermplasms = removeAll(selectedGermplasms, "");
    //console.log(selectedGermplasms);
    if(argumentsArray != null && argumentsArray.urlEndPoint!=='' && argumentsArray.urlEndPoint!==undefined && argumentsArray.urlEndPoint!==null){
        for(let i=0; i<selectedGermplasms.length; i){
            if(exportGermplasmsIsAbort===false){
                let j;
                let germplasmIdArray=[];
                for(j=i; j<i+100; j++){
                    germplasmIdArray.push(selectedGermplasms[j]);
                }
                i=j;
                argumentsArray.germplasmIdArray = germplasmIdArray;
                let resp = await getGermplasmsDetails(argumentsArray);
                //console.log(resp);
                avancement += step;
                l.setProgress(avancement);
                //console.log(step);
                //console.log(avancement);
                for(let j=0; j<resp.result.data.length; j++){
                    jsonHmap[resp.result.data[j].germplasmDbId]=resp.result.data[j];
                }
            }else{
                l.setProgress(1);
                l.stop();
                $('#AbortExportGermplasmsDetails').hide();
                return;
            }
        }
    }
    l.setProgress(1);
    //console.log(jsonHmap);
    let fieldTab = getFieldFormJson(jsonHmap);
    //console.log(fieldTab);
    let tsvString = buildTsvString(jsonHmap, selectedGermplasms, fieldTab);
    download($('#selectionMap').find('option:selected').val()+'_germplasms.tsv',tsvString);
    $('#AbortExportGermplasmsDetails').hide();
    l.stop();
}

/**
 * Generate field Tab from Json-Hmap
 * @function
 * @param {Array} HMap - Json-Hmap
 */
function getFieldFormJson(HMap){
    let fieldTab = [];
    Object.keys(HMap).forEach(function(element){
        for(let key in HMap[element]){
            if(!isInArray(fieldTab,key) && key !== 'germplasmDbId'){
                if(HMap[element][key]!==null && HMap[element][key]!==undefined && HMap[element][key]!==''){
                    fieldTab[key]=true;
                }else{
                    fieldTab[key]=false;
                }
            }else{
                if(fieldTab[key]===false && (HMap[element][key]!==null && HMap[element][key]!==undefined && HMap[element][key]!=='')){
                    fieldTab[key]=true;
                }
            }
        }
    });
    //console.log(fieldTab);
    return fieldTab;
}

/**
 * Generate Tsv String
 * @function
 * @param {Array} HMap - Json-Hmap
 * @param {Array} selectedGermplasms - The selected Germplasms
 * @param {Array} fieldTab - Fields of the futur file
 */
function buildTsvString(jsonHmap, selectedGermplasms, fieldTab){
    let tsvString ='';
    let tempstring = 'germplasmDbId \tmarkerprofileDbId \t';
    Object.keys(fieldTab).forEach(function (element){
       if(fieldTab[element]===true){
           tempstring += element + '\t';
       }
    });
    tempstring+='\n';
    selectedGermplasms.forEach(function (element){
        tsvString+=cpyResp[element][0].germplasmDbId + "\t";
        if(cpyResp[element].length===1){
            tsvString+=cpyResp[element][0].markerprofileDbId;
        }else{
            cpyResp[element].forEach(function(element2){
                tsvString+=element2.markerprofileDbId + ' ; ';
            });
        }
        tsvString+='\t';
        Object.keys(fieldTab).forEach(function (element2){
            if(fieldTab[element2]===true){
                if(jsonHmap[element]!== null && jsonHmap[element]!==undefined){
                    if(jsonHmap[element][element2]!==null && jsonHmap[element][element2]!== undefined){
                        tsvString+= jsonHmap[element][element2] + '\t'
                    }else{
                        tsvString+='\t';
                    }
                }
            }
        });
        tsvString+='\n';
    });
    tsvString = tempstring + tsvString;
    return tsvString;
}


/**
 * Generate Tsv String
 * @exports Germplasms details
 * @function
 * @param {Strint} filename - Name of the futur file
 * @param {String} tsvData- The string to encoded in the tsv file
 */
function download(filename, tsvData) {
    let blob = new Blob([tsvData], {type: 'text/tsv'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        let elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

async function exportMarkerDetails() {
    if($('#Markers').html()!==""){
        selectedMarkers = $('#Markers').find('option:selected').map(function(){return $(this).val();}).get();
    }
    //console.log(selectedMarkers);
    let tsvString = new StringBuffer();
    tsvString.append('MarkerDbId\tLinkage Group\tLocation\n');
    for(let i=0; i<selectedMarkers.length; i++){
        tsvString.append(selectedMarkers[i] + '\t' + markerDetailsHmap[selectedMarkers[i]].split(':')[0] + '\t' + markerDetailsHmap[selectedMarkers[i]].split(':')[1] + '\n');
    }
    download($('#selectionMap').find('option:selected').val()+'_marker.tsv',tsvString.toString());
}
