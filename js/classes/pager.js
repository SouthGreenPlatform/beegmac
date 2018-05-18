/**
 * urlWithAuth's class
 * @class
 */
class PaginationManager{
       /**
     * pager's constructor
     * @function
     * @generator
     * @param {Integer} showProgress
     */
    constructor(showProgress){
		this.showProgress=showProgress;
    }

	getEvolutionOfPagination(){
		return this.evolutionOfPagination;
	}

	setEvolutionOfPagination(newValue){
		this.evolutionOfPagination=newValue;
	}

    /**
     * return the resp array
     * @async
     * @function
     * @param {Function} function_to_launch - function to launch
	 * @param {Array} argumentsArray - arguments Array
     */
	async pager(function_to_launch, argumentsArray){
		try{
			if (this.showProgress == true)
			{
				this.setEvolutionOfPagination(0);
				this.updateEvolution();
			}
			let arrayOfResp = [];
			argumentsArray.askedPage=0;
			let resp = await function_to_launch(argumentsArray);
            argumentsArray.askedPage++;
			let totalPages = resp.metadata.pagination.totalPages;
			let currentPage = resp.metadata.pagination.currentPage;
			arrayOfResp.push(resp.result.data);
			if (this.showProgress == true)
			{
//				console.log(currentPage + " / " + totalPages + " -> " + Math.round((currentPage+1)/(totalPages)*100));
				this.setEvolutionOfPagination(Math.round((currentPage+1)/(totalPages)*100));
				this.updateEvolution();
			}

			while(argumentsArray.askedPage <= totalPages-1){
				resp = await function_to_launch(argumentsArray);
				if (this.showProgress == true)
				{
//					console.log(argumentsArray.askedPage + " / " + totalPages + " -> " + Math.round((argumentsArray.askedPage+1)/(totalPages)*100));
					this.setEvolutionOfPagination(Math.round((argumentsArray.askedPage+1)/(totalPages)*100));
					this.updateEvolution();
				}
				argumentsArray.askedPage++;
				arrayOfResp.push(resp.result.data);
			}
		    return arrayOfResp;
		}catch(err){
			handleErrors(err);
		}
	}

    /**
     * return the first page
     * @async
     * @function
     * @param {Function} function_to_launch - function to launch
     * @param {Array} argumentsArray - arguments Array
     */
	async getFirstPage(function_to_launch, argumentsArray){
        try{
        	if (this.showProgress == true)
        	{
            	this.setEvolutionOfPagination(0);
                this.updateEvolution();
        	}
            argumentsArray.askedPage=0;
            let resp = await function_to_launch(argumentsArray);
        	if (this.showProgress == true)
        	{
	            this.setEvolutionOfPagination(100);
	            this.updateEvolution();
        	}
            return resp;
        }catch (err){
            handleErrors();
        }

	}

    /**
     * return true if the type liste is a complete list
     * @async
     * @function
     * @param {Function} function_to_launch - function to launch
     * @param {Array} argumentsArray - arguments Array
	 * @param {Array} arrayOfMarkersType - array Of MarkersType
	 * @param {Array} overallCount - overall count
     */
	async isCompleteTypeList(function_to_launch, argumentsArray,arrayOfMarkersType,overallCount){
		let count = 0, currentNumber = 0 , max = 0, resp=null;
        try{
        	if (this.showProgress == true)
        	{
        		this.setEvolutionOfPagination(0);
        		this.updateEvolution();
            }
            argumentsArray.askedPage=0;
		    for(let i=0; i<arrayOfMarkersType.length;i++){
		    	if(arrayOfMarkersType[i]!== undefined && arrayOfMarkersType[i]!== null && arrayOfMarkersType[i]!==''){
		    		argumentsArray.askedType=arrayOfMarkersType[i];
                    resp = await function_to_launch(argumentsArray);
                	if (this.showProgress == true)
                	{
	                    this.setEvolutionOfPagination(Math.round(((i+2)/(arrayOfMarkersType.length))*100));
	                    this.updateEvolution();
                	}
                    currentNumber = resp.metadata.pagination.totalCount;
                    if(currentNumber>max){
                    	max=currentNumber;
                    	mostPresentType =arrayOfMarkersType[i];
                    }
                    count += currentNumber;
				}
            }
        	if (this.showProgress == true)
        	{
	            this.setEvolutionOfPagination(100);
				this.updateEvolution();
        	}
            return overallCount === count;
		}catch(err){
			handleErrors(err);
		}
	}

    /**
     * update Evolution of pagination
     * @function
     */
	updateEvolution(){
		if (this.showProgress == true)
			setProgressBarValue(this.getEvolutionOfPagination());
	}
}
