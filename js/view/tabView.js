/**
 * fill result table
 * @function
 * @param {Array} sentMarkers - Matrix marker list
 * @param {Array} sentMarkerProfiles - Matrix marker-profil list
 * @param {Array} response - The response to getMatrix function
 */
function fill_result_table(sentMarkers,sentMarkerProfiles,response) {
    $('table').show();
    let htmlString="";
    console.log(sentMarkers);
    console.log(sentMarkerProfiles);
    for(let i=0;i<sentMarkerProfiles.length;i++){
        for(let j=0;j<sentMarkers.length;j++){
            htmlString += '<tr><td>'+sentMarkers[j]+'</td><td>'+markerDetailsHmap[sentMarkers[j]]+'</td><td>'+response[sentMarkerProfiles[i]]+'</td><td>'+sentMarkerProfiles[i]+'</td><td id="'+(sentMarkers[j]+sentMarkerProfiles[i]).hashCode()+'"></td></tr>';
        }
    }
    $("#resulttable").find("> tbody").html(htmlString);
}

/**
 * Remove missing data from result tab
 * @function
 * @param {Array} sentMarkers - Matrix marker list
 * @param {Array} sentMarkerProfiles - Matrix marker-profil list
 */
function cleanTab(sentMarkers,sentMarkerProfiles){
    for(let i=0;i<sentMarkerProfiles.length;i++){
        for(let j=0;j<sentMarkers.length;j++){
            let id = '#' + (sentMarkers[j]+sentMarkerProfiles[i]).hashCode();
            let temp = $(id);
            if(temp.text()===''){
                temp.parent().remove();
            }
        }
    }
}

/**
 * insert matrix in result table
 * @function
 * @param {Array} sentMarkers - Matrix marker list
 * @param {Array} sentMarkerProfiles - Matrix marker-profil list
 * @param {Array} response - The response to getMatrix function
 */
function insetMatrixInResultTable(matrix){
    for(let i=0; i<matrix.length;i++){
        matrix[i].forEach(function (element) {
            let tempString = (element[0]+element[1]).hashCode();
            $('#'+tempString).text(element[2]);
        });
    }
}

/**
 * Set result table empty
 * @function
 */
function  enmptResultTab(){
    $('tbody').html('');
}
