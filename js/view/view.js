/**
 * insert matrix in result table
 * @function
 * @param {Array} firstinformations - array containing the maps and studies that were found
 */
function setup_select_tag(){
	let htmlStringBuffer = new StringBuffer();
    if ($_GET("mapDbId")===null || grpTabFromUrlHasChanged) {
    	htmlStringBuffer.append('<option value="">---Select one---</option>\n');
        for(let i=0; i<firstInformation.length; i++)
            for(let j=0; j<firstInformation[i].map.length; j++)
            	htmlStringBuffer.append('<option '+/*id="'+i+'_'+j+'" */'value="' + i+'_'+firstInformation[i].map[j].mapDbId + '">' + firstInformation[i].map[j].name + '</option>\n');
        $('#selectionMap').html(htmlStringBuffer.toString());
    }
    else {
    	isMapIdInUrl=true;
    	htmlStringBuffer.append('<option '+/* id="0" */'value="0_' + firstInformation[0].map + '" selected>' + firstInformation[0].map + '</option>\n');
        $('#selectionMap').html(htmlStringBuffer.toString());
    	$('#selectionMap').change();
    }
    //console.log(htmlString);
    selectStudies();
}


/**
 * Set html of studies widget
 * @function
 */
function selectStudies(){
	setEmptyTheFields();
    let selectedMapDbId =$('#selectionMap').find('option:selected').val();
    let groupIndex = selectedMapDbId.substring(0, selectedMapDbId.indexOf("_"));
    if (groupIndex == "")
    	return;
    $('select#selectionStudies').html('');
	let htmlStringBuffer = new StringBuffer();
	htmlStringBuffer.append('<option value="">---Select one---</option>\n');
    for(let i=0; i<firstInformation.length; i++){
        if(parseInt(groupIndex) === i){
            for(let j=0; j<firstInformation[i].studies.length; j++){
            	//console.log(firstInformation[i].studies[j]);
            	htmlStringBuffer.append('<option id="'+i+'" value="' + firstInformation[i].studies[j].studyDbId + '">' + firstInformation[i].studies[j].name + '</option>\n');
            }
        }/*else if(selectedMapDbId === firstInformation[i].map){
            for(let j=0; j<firstInformation[i].studies.length; j++){
                //console.log(firstInformation[i].studies[j]);
            	htmlStringBuffer.append('<option id="'+i+'" value="' + firstInformation[i].studies[j].studyDbId + '">' + firstInformation[i].studies[j].name + '</option>\n');
            }
		}*/
    }
    $('#selectionStudies').html(htmlStringBuffer.toString());
    if($("#selectionStudies option").length===2){
        $($('#selectionStudies option')[1]).prop('selected', true);
        launch_selection();
    }
}

/**
 * Set empty all fields
 * @function
 */
function setEmptyTheFields(){
	$("#MarkersProfils").html("");
	$("#typeMarker").html("");
	$("#chromosome").html("");
	$("#Markers").html("");
	$('#Germplasms').html("");
	$('#labelGermplasms').hide();
    $('#markerProfileLabel').hide();
    $('#typeLabel').hide();
    $('#chromosomeLabel').hide();
    $('#markersLabel').hide();
    $('#topMarkerDiv').hide();
    $('#topTypeDiv').hide();
    enmptResultTab();
}

/**
 * Set Empty Marker field
 * @function
 */
function setEmptyMarkerSelect() {
	$('#Markers').html("");
    $('#markersLabel').hide();
}

/**
 * Set up html of Germplasms widget
 * @function
 * @param {Array} response - array of marker profile
 */
function setUpGermplasms(response){
	let htmlStringBuffer = new StringBuffer();
	Object.keys(response).forEach(function(element){
        let valueString = "";
        for (let i = 0; i < response[element].length; i++) {
			valueString+=response[element][i].markerprofileDbId + ",";
		}
        htmlStringBuffer.append('<option selected value="'+valueString+'">'+element+'</option>\n');
	});
	$('select#Germplasms').html(htmlStringBuffer.toString());
	updateSelection('labelGermplasms','Germplasms');
}

/**
 * Set up html of Markers Profils widget
 * @function
 */
function setUpMarkerProfils(){
    let selectedGermplasms = $("select#Germplasms option:selected").map(function () {
        return $(this).val().split(",");
    }).get();
    selectedGermplasms=removeAll(selectedGermplasms,"");
	let htmlStringBuffer = new StringBuffer();
	selectedGermplasms.forEach(function(element){
		htmlStringBuffer.append('<option selected value="'+element+'">'+element+'</option>\n');
	});
	$('#MarkersProfils').html(htmlStringBuffer.toString());
    updateSelection('markerProfileLabel','MarkersProfils');
	if ($('#MarkersProfils>option').length===$('#Germplasms>option:selected').length){
		$('#MarkersProfils').attr("disabled", true);
	}else{
		$('#MarkersProfils').attr("disabled", false);
	}
}

/**
 * Set up Html of LinkageGroup and MarkersType widget
 * @function
 * @param {Array} arrayOfLinkageGroup - array Of LinkageGroup
 * @param {Array} arrayOfMarkersType - array Of MarkersType
 */
function setUpLinkageGroupAndMarkersType(arrayOfLinkageGroup,arrayOfMarkersType){
	arrayOfLinkageGroup.sort(sortAlphaNum);
	let htmlStringBuffer = new StringBuffer();
    arrayOfLinkageGroup.forEach(function(element){
    	htmlStringBuffer.append('<option value="' + element+ '">' + element+ '</option>');
    });
    $('select#chromosome').html(htmlStringBuffer.toString());
    updateSelection('chromosomeLabel','chromosome');
    htmlStringBuffer = new StringBuffer();
    arrayOfMarkersType.forEach(function(element){
    	htmlStringBuffer.append('<option selected value="' + element+ '">' + element+ '</option>');
    });
    $('select#typeMarker').html(htmlStringBuffer.toString());
}

/**
 * Set up Html of Marker widget
 * @function
 * @param {Array} arrayMarkersIds - array of MarkersIds
 */
function setupMarkersId(arrayMarkersIds){
	if (arrayMarkersIds.length<=10000) {
		$('#Markers').show();
		$('#numberOfMarkers').hide();
		$('#labelToHide').show();
        $('#markersLabel').show();
        $('#topMarkerDiv').hide();
        let htmlStringBuffer = new StringBuffer();
		arrayMarkersIds.forEach(function(element){
			htmlStringBuffer.append('<option selected value="'+element+'">'+element+'</option>\n');
		});
		$('#Markers').html(htmlStringBuffer.toString());
        updateSelection('markersLabel','Markers');
	}else{
		$('#Markers').html("");
		$('#markersLabel').hide();
		$('#numberOfMarkers').html(arrayMarkersIds.length);
		$('#numberOfMarkers').show();
		$('#topMarkerDiv').show();
	}
}

/**
 * update the label of the current select
 * @function
 * @param {Array} idLabel - selected label
 * @param {Array} idSelect - selected select
 */
function updateSelection(idLabel, idSelect){
	let nbSelectionOption = $('#'+idSelect+" option:selected").map(function(){return $(this).val().split(",");}).get();
	nbSelectionOption = removeAll(nbSelectionOption, "");
	nbSelectionOption=nbSelectionOption.length;
	let nbOption = $('#'+idSelect+" option").map(function(){return $(this).val().split(",");}).get();
	nbOption = removeAll(nbOption,"");
	nbOption=nbOption.length;
	$('#'+idLabel).text(nbSelectionOption + ' / ' + nbOption);
	if(nbSelectionOption === 0){
        $('#'+idLabel).hide();
    }else{
        $('#'+idLabel).show();
    }

}

/**
 * Handle Errors
 * @function
 * @param {Error} err - current error
 */
async function handleErrors(err) {
	if (typeof err === "string"){
		$('#ErrorMessage').show();
	    $('#ErrorMessage').text(err);
	    console.log(err);
	    await sleep(3000);
	    $('#ErrorMessage').hide();
	}else{
	    if($('#ErrorMessage').is())
		$('#ErrorMessage').show();
	    $('#ErrorMessage').text(err.message);
	    console.log(err.message);
	    await sleep(3000);
	    $('#ErrorMessage').hide();
	}
}

/**
 * Set html object disabled or undisabled
 * @function
 * @param {Boolean} bool - true or false
 */
function setDisabled(bool){
    $('#selectionMap').prop('disabled', bool);
    $('#selectionStudies').prop('disabled', bool);
    $('#Search').prop('disabled', bool);
    $('#Export').prop('disabled', bool);
    $('#ExportGermplasmsTsv').prop('disabled', bool);
    $('#ExportGermplasmsDetails').prop('disabled', bool);
    $('#ExportMarkerDetails').prop('disabled', bool);
}

function setMainFormVisible(){
    $('#mainForm').show();
	if($('#Use2Url').is(':checked')){
		$('#ExportGermplasmsDetails').attr("disabled", true);
	}else{
        $('#ExportGermplasmsDetails').attr("disabled", false);
	}
}

async function isInAdvancedMode(bool) {
    if(bool){
        if(isEndPointInUrl){
            $('#groupManager').show();
        }else{
            if($('#urltoget').val()!=="" && $('#Password').val()!=="" && $('#UserId').val()!==""){
                urlSaver = await urlWithAuth.staticConstructor($('#urltoget').val(),$('#UserId').val(),$('#Password').val());
            }
            $('#urltoget').hide();
            $('#urltoget').val('');
            $('#loginForm').hide();
            $('#UserId').val('');
            $('#Password').val('');
            $('#Submit1').hide();
            $('#groupManager').show();
        }
    }else{
        if(isEndPointInUrl){
            $('#groupManager').hide();
        }else{
            $('#urltoget').show();
            $('#loginForm').show();
            $('#Submit1').show();
            $('#groupManager').hide();
            $('#urltoget').val(urlSaver.url);
            $('#UserId').val(urlSaver.userName);
            $('#Password').val(urlSaver.pswrd);
        }
    }
}

function setProgressBarValue(value, progressBarText, text) {
	let progressBar = $('#loadingModalContainer div.progress-bar');
	//console.log(value + "%");
    if(value!==0){
        $(progressBar).css('width', (value > 100 ? 100 : value) + '%');
        if(progressBarText!== undefined && progressBarText!==""){
            $(progressBar).text(value + '% (' + progressBarText + ")");
        }else{
            $(progressBar).text(value + '%');
        }
        if(text!== undefined && text!==""){
            $('#mainBadge').text(text);
        }
    }else {
        $(progressBar).replaceWith('<div class="progress-bar bg-dark" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>');
    }
}

function setMainBadgeText(text) {
    if(text!== undefined && text!==""){
        $('#mainBadge').text(text);
        setProgressBarValue(0);
    }
}