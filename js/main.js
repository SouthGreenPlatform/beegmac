

async function init(){
	await setVisibleField();
	if (window !== top){
		$('#title').hide();
	}
}

async function setVisibleField() {
	$('#mainForm').hide();
	$('#secondForm').hide();
	$('#resulttable').hide();
	$('#loadingScreen').hide();
	$('#ErrorMessage').hide();
	$('#topMarkerDiv').hide();
	$('#topTypeDiv').hide();
	$('#AbortExport').hide();
	$('#AbortExportGermplasmsDetails').hide();
    $('#groupManager').hide();
    if($_GET("manage") === 'false'){
        $('#advancedMode').hide();
    }
	if ($_GET("baseUrl") !== null) {
		let temp = $_GET("baseUrl").split(';');
		for (let i = 0; i < temp.length; i++) {
			groupTab[i] = temp[i].split(',');
		}
		for (let i = 0; i < groupTab.length; i++){
			for (let j = 0; j < groupTab[i].length; j++) {
				groupTab[i][j] = await urlWithAuth.staticConstructor2(groupTab[i][j]);
				if (groupTab[i][j].url===undefined) {
					groupTab[i].splice(j, 1);
					if(groupTab[i].length>0){
                        j--;
					}
				}
			}
            if(groupTab[i].length===0){
                groupTab.splice(i, 1);
                if(i!==groupTab.length){
                    i--;
                }
            }
		}
		if (groupTab.length > 0) {
			$('#urltoget').hide();
			$('#labelUse2Url').hide();
			$('#loginForm').hide();
			isEndPointInUrl = true;
			fillWidget(groupTab);
		}
		if ($_GET("auth") === "true" && groupTab.length===1) {
			$('#loginForm').show();
			auth = true;
		}
		if (isEndPointInUrl && auth !== true) {
			$('#Submit1').hide();
			await login();
		}
	}
}

async function generateGroupTab(caller) {
	grpTabFromUrlHasChanged=true;
	isMapIdInUrl=false;
	groupTab=[];
	let groups = $(caller).parent().children();
	for(let i=2; i<groups.length;i++){
		let urls = $(groups[i]).children();
		for(let j=3; j<urls.length;j++){
			if(undefined ===groupTab[i-2]){groupTab[i-2]=[];}
			let tempUrl = await urlWithAuth.staticConstructor(urls[j].children[0].value,urls[j].children[1].value,urls[j].children[2].value);
			if(tempUrl.token!==undefined){
                groupTab[i-2].push(tempUrl);
				$(urls[j].children[3]).hide(100);
                $(urls[j].children[4]).show(100);
                $(urls[j].children[5]).hide(100);
			}else{
                $(urls[j].children[3]).hide(100);
                $(urls[j].children[4]).hide(100);
                $(urls[j].children[5]).show(100);
			}
		}
	}
	// console.log(groupTab);
	login();
}

async function login(){
	// console.log(groupTab);
	if((groupTab.length===0 && !$('#advancedMode input').is(':checked'))){
		let tempGroup =[];
		tempGroup.push(await urlWithAuth.staticConstructor($("#urltoget").val(),$("#UserId").val(),$("#Password").val()));
		groupTab.push(tempGroup);
	}else if(groupTab.length===1 && auth=== true){
        await groupTab[0][0].reconect($('#UserId').val(),$('#Password').val());
	}
	// }
    // console.log(groupTab);
    $('#toAnimate').addClass('animated fadeIn');
    appInit();
}

async function appInit() {
	let argumentsArray = groupTab;
	if(await checkRequiredCallsAvailability(argumentsArray)){
		await getFirstInformation(argumentsArray);
        setup_select_tag(firstInformation);
        setMainFormVisible();
	}
}

async function getFirstInformation(){
	$('#loadingModal').removeClass("fade");
	$('#loadingModal').modal({ backdrop: 'static', keyboard: false });
    $('#loadingModal').addClass("fade");
	try{
    	firstInformation=[];
        let argumentsArray =[];
        bindCall2Url(groupTab, ALL_CALLS);
        setMainBadgeText('Getting study list');
        if($_GET("mapDbId")!==null && !grpTabFromUrlHasChanged){
            $('#selectionMap').hide();
            $('#labelSelectionMap').hide();
            for(let i=0; i<groupTab.length;i++){
                argumentsArray = {urlEndPoint : call2UrlTab[i]['studies-search'].split(';')[0], token : call2UrlTab[i]['studies-search'].split(';')[1]};
                let tempStudies = await readStudyList(argumentsArray);
                let tempMap = $_GET("mapDbId");
                firstInformation[i]={map : tempMap, studies : tempStudies};
            }
        }else{
            $('#selectionMap').show();
            $('#labelSelectionMap').show();
            for(let i=0; i<groupTab.length;i++){
                argumentsArray = {urlEndPoint : call2UrlTab[i]['studies-search'].split(';')[0], token : call2UrlTab[i]['studies-search'].split(';')[1]};
                let tempStudies = await readStudyList(argumentsArray);
                argumentsArray = {urlEndPoint : call2UrlTab[i]['maps'].split(';')[0], token : call2UrlTab[i]['maps'].split(';')[1]};
                setMainBadgeText('Getting map list');
                let tempMap = await readMaps(argumentsArray);
                firstInformation[i]={map : tempMap, studies : tempStudies};
            }
        }
    }catch (err){
        handleErrors('Unable to load map / study information')
    }
    $('#loadingModal').modal('hide');
}

async function launch_selection(){
	setEmptyMarkerSelect();
    $('#topTypeDiv').hide();
    setDisabled(true);
	if ($("#selectionStudies").find("option:selected").text()==="---Select one---") {
		setEmptyTheFields();
	}
	else
		try
		{
			$('#loadingModal').modal({ backdrop: 'static', keyboard: false });
			setMainBadgeText('Getting selected map and study');
			if(!isMapIdInUrl){
				selectedMap = $('#selectionMap').find('option:selected').val();
	            currentGroupId = selectedMap.substring(0, selectedMap.indexOf("_"));
				selectedMap = selectedMap.substring(selectedMap.indexOf("_") + 1);
			}
			else
				selectedMap=$_GET("mapDbId");
            setMainBadgeText('Selected map : '+selectedMap);
			let arrayOfLinkageGroup=[],  arrayMarkers=[];
			selectedStudy = $('#selectionStudies').find('option:selected').val();
	        setMainBadgeText('Selected study '+selectedStudy);
			let paginationManager = new PaginationManager();
	        let paginationManagerWithProgress = new PaginationManager(true);
			let argumentsArray = {selectedStudy, selectedMap};
			argumentsArray["pageSize"] = 10000;	// number of variants to check // distinct types in
	        argumentsArray = setArgumentArray(URL_MARKER_PROFILES,argumentsArray);
			let askedType=null;
			setMainBadgeText('Loading marker profiles');
	        await paginationManager.pager(getmarkerprofileDbId,argumentsArray).then(function(markerprofiles){
				setMainBadgeText('Indexing marker profiles');
	        	response = getMarkerProfileHmap(markerprofiles);
	            setMainBadgeText('Building widget contents');
				setUpGermplasms(response);
				setUpMarkerProfils(response);
				cpyResp = response;
				response=reversHmap(response);
			});
	        argumentsArray = setArgumentArray(URL_MAP_DETAILS,argumentsArray);
	        setMainBadgeText("Loading map details ...");
			let mapDetails = await getMapDetails(argumentsArray);
			mapDetails.result.data.forEach(function(element){
				arrayOfLinkageGroup.push(element.linkageGroupName);
			});
	        argumentsArray = setArgumentArray(URL_MARKERS,argumentsArray);
	        setMainBadgeText('Building marker type list');
	        let markerSample = await paginationManager.getFirstPage(getMarkers,argumentsArray);
	        arrayOfMarkersType = getTypeList([markerSample.result.data]);
	        setMainBadgeText('Checking if marker type list is complete');
	        if(! await paginationManager.isCompleteTypeList(getMarkers,argumentsArray,arrayOfMarkersType,markerSample.metadata.pagination.totalCount)){
	            // console.log('incomplete');
	            $('#topTypeDiv').show();
	        }else{
	            // console.log('complete');
	            argumentsArray = {selectedStudy, selectedMap, askedType, pageSize : undefined};
	            argumentsArray = setArgumentArray(URL_MARKERS,argumentsArray);
	            for(let i=0 ; i<arrayOfMarkersType.length; i++){
	            	if(arrayOfMarkersType[i]!== mostPresentType){
	            		setMainBadgeText('Loading ' + arrayOfMarkersType[i] + ' markers');
	            		argumentsArray.askedType=arrayOfMarkersType[i];
	                    arrayMarkers.push(await paginationManagerWithProgress.pager(getMarkers,argumentsArray));
					}
				}
	            hmapsType = setHmapType(arrayOfMarkersType,arrayMarkers);
	        }
	        if(arrayMarkers.length===0 && arrayOfMarkersType.length<=1){
	        	setProgressBarValue(100);
			}
	        let arrayMarkerCount = 0;
	        for (let i=0; i<mapDetails.result.data.length; i++)
	        	arrayMarkerCount += mapDetails.result.data[i].markerCount;
			if(arrayOfLinkageGroup.length>100 || arrayMarkerCount<100000){
				setMainBadgeText('Loading positions... (please be patient)');
	            argumentsArray = setArgumentArray(URL_MAP_POSITIONS,argumentsArray);
	            arrayMarkers = await paginationManagerWithProgress.pager(getMarkersPosition,argumentsArray);
			}else{
				arrayMarkers=[];
				let tempArray=[];
				setMainBadgeText('Loading positions for each linkage group... (please be patient)');
				for(let i=0; i<arrayOfLinkageGroup.length;i++){
					let argumentsArray = {selectedStudy, selectedMap, selectedLKG: arrayOfLinkageGroup[i]};
	                argumentsArray = setArgumentArray(URL_MAP_POSITIONS,argumentsArray);
	                tempArray = await paginationManager.pager(getMarkersPosition, argumentsArray);
	                for(let p=0; p<tempArray.length;p++){
	                    arrayMarkers=arrayMarkers.concat(tempArray[p]);
					}
	                setProgressBarValue(parseInt((i+1)*100/arrayOfLinkageGroup.length));
				}
	            arrayMarkers = [arrayMarkers];
			}
	        setMainBadgeText('Indexing markers');
	        setLocalStorage(arrayMarkers);
	        setMainBadgeText('Indexing linkage groups');
	        setHmapLinkageGroup(arrayOfLinkageGroup, arrayMarkers);
	        setMainBadgeText('Building widget contents');
			setUpLinkageGroupAndMarkersType(arrayOfLinkageGroup,arrayOfMarkersType);
		}
		catch (err)
		{
			handleErrors(err.message);
		}
	await sleep(1000);
    $('#loadingModal').modal('hide');
    setDisabled(false);
}

function selectionMarkers(){
	let selectedType = $("#typeMarker").val();
	let selectedLinkageGroup = $("#chromosome").val();
	// console.log(selectedLinkageGroup);
	if((selectedType.length!==0 && selectedLinkageGroup.length!==0)||(selectedLinkageGroup.length!==0 && $("#typeMarker>option").length===0)){
		selectedMarkers=[];
		for(let i=0; i<selectedLinkageGroup.length;i++){
			selectedMarkers = selectedMarkers.concat(hmapsLinkageGroup[selectedLinkageGroup[i]]);	
		}
		if(selectedType.length!==0){
            selectedMarkers = compareOrSubtract(selectedType);
		}else{
			handleErrors('No type are selected');
		}
        setupMarkersId(selectedMarkers);
    }
}

function compareOrSubtract(selectedType){
	if(isInArray(selectedType, mostPresentType)){
        let set = new Set(selectedType);
		let unselectedType = [...new Set([...arrayOfMarkersType].filter(x => !set.has(x)))];
		for(let i=0; i<unselectedType.length; i++){
			let tempSet = new Set(hmapsType[unselectedType[i]]);
			selectedMarkers = [...new Set([...selectedMarkers].filter(x => !tempSet.has(x)))];
		}
		return selectedMarkers
	}else{
        let intersection = [];
        for(let i=0; i<selectedType.length; i++){
        	intersection = intersection.concat(array_big_intersect(selectedMarkers, hmapsType[selectedType[i]]));
		}
		return intersection;
	}
}

function getRequestParameter(){
    enmptResultTab();
	selectedMarkersProfils=null;
    startIndex=0;
	$('#customIndex').val(1);
	// console.log($('#customIndex').val());
    $('#secondForm').show();
    if($('#MarkersProfils').is('[disabled=disabled]')){
        selectedMarkersProfils = $("#Germplasms option:selected").map(function(){return $(this).val().split(",");}).get();
        selectedMarkersProfils = removeAll(selectedMarkersProfils, "");
    }else{
        selectedMarkersProfils = $("#MarkersProfils option:selected").map(function(){return $(this).val();}).get();
	}
	if($('#Markers').html()!==""){
		selectedMarkers = $('#Markers').find('option:selected').map(function(){return $(this).val();}).get();
	}
	if(selectedMarkers.length!==0 && selectedMarkersProfils.length!==0){
		$('#nbResult').text("RESULT : " + (selectedMarkers.length*selectedMarkersProfils.length) + " records found");
		launchMatrixRequest(0);
	}else{
		handleErrors("You must specify markers and germplasmes");
	}	
}

function launchMatrixRequest(index){
	sizeOfResquestedMatrix = selectedMarkers.length*selectedMarkersProfils.length;
	totalPage = Math.floor(1+(sizeOfResquestedMatrix)/clientPageSize);
	$('#pageNumber').text("/" + totalPage);
	$('#customIndex').val(Math.floor(startIndex/clientPageSize)+1);
	if (index < sizeOfResquestedMatrix){
		let sentMarkers = [], sentMarkerProfiles = [];
		let paginationManager = new PaginationManager(true);
		let isAnExport= false;
		if (selectedMarkers.length*selectedMarkers.length<clientPageSize){
			sentMarkers = selectedMarkers;
			sentMarkerProfiles = selectedMarkersProfils;
			let argumentsArray = {sentMarkers, sentMarkerProfiles, clientPageSize, isAnExport};
            argumentsArray = setArgumentArray(URL_ALLELE_MATRIX,argumentsArray);
			paginationManager.pager(getMatrix,argumentsArray).then(function(matrix){
                fill_result_table(sentMarkers,sentMarkerProfiles,response);
                insetMatrixInResultTable(matrix);
			});
		}else{
			let count =0 ,rest = index%selectedMarkers.length ,quotient = Math.trunc(index/selectedMarkers.length);
			while(count<clientPageSize && index <= sizeOfResquestedMatrix){
				if(selectedMarkers[rest]!==null && !isInArray(sentMarkers, selectedMarkers[rest])){
					sentMarkers.push(selectedMarkers[rest]);
				}
				if (!isInArray(sentMarkerProfiles, selectedMarkersProfils[quotient]) && selectedMarkersProfils[quotient]!==null ){
					sentMarkerProfiles.push(selectedMarkersProfils[quotient]);
				}
				index++;
				count++;
				rest = index%selectedMarkers.length;
				quotient = Math.trunc(index/selectedMarkers.length);
			}
            sentMarkerProfiles = removeAll(sentMarkerProfiles, undefined);
			// console.log(sentMarkerProfiles);
			let argumentsArray = {sentMarkers,sentMarkerProfiles, clientPageSize};
            argumentsArray = setArgumentArray(URL_ALLELE_MATRIX,argumentsArray);
			paginationManager.pager(getMatrix,argumentsArray).then(function(matrix){
				fill_result_table(sentMarkers,sentMarkerProfiles,response);
                insetMatrixInResultTable(matrix);
                if(!$('#missingData').prop('checked')){
					cleanTab(sentMarkers,sentMarkerProfiles);
                }
			});
		}
	}else{
		startIndex = parseInt(clientPageSize)*(totalPage-1);
        launchMatrixRequest(startIndex);
	}
}

