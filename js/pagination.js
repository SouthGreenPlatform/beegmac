/**
 * Advance one page in the matrix
 * @function
 */
function nextPage(){
    if (startIndex+clientPageSize<sizeOfResquestedMatrix){
        startIndex += clientPageSize;
        launchMatrixRequest(startIndex);
    }else{
        startIndex=parseInt(clientPageSize)*(totalPage-1);
        launchMatrixRequest(startIndex);
    }
}

/**
 * Moves one page backwards in the matrix
 * @function
 */
function prevPage(){
    if(startIndex-clientPageSize>=0){
        startIndex -= clientPageSize;
        launchMatrixRequest(startIndex);
    }else{
        startIndex = 0;
        launchMatrixRequest(startIndex)
    }
}

/**
 * Set the page size too another value
 * @function
 */
function setCustomPageSize(){
    if (parseInt($('#customPageSize').val())<5000){
        clientPageSize=parseInt($('#customPageSize').val())
    }else{
        clientPageSize=5000;
        $('#customPageSize').val(5000);
    }
}

/**
 * Set the index too another value
 * @function
 */
function setCustomIndex(){
    startIndex = parseInt($('#customIndex').val()-1)*clientPageSize;
    if(startIndex>=0 && startIndex<=totalPage*clientPageSize){
        launchMatrixRequest(startIndex);
    }else if(startIndex<0){
        startIndex=0;
        launchMatrixRequest(0);
    }else if(startIndex>totalPage*clientPageSize){
        startIndex = (selectedMarkers.length*selectedMarkersProfils.length)-(clientPageSize);
        launchMatrixRequest(startIndex);
    }
}