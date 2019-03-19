function uploadImage(url){
    	return new Promise(function (resolve, reject) {
	          	fetch(url,{
		              method:"get",
		              mode:"cors",

		              // headers:{
		              	  // 'Accept': 'image/png',
		                  // "Content-Type": "image/png"
		              		// "Access-Control-Allow-Origin":"*"
		              // }
		              // body:"name=luwenjing&age=22"
	          	})
		        .then(function (response){
		            return resolve(response.blob());
		        })
		        .catch(function(err){
		            console.log("Fetch错误:"+err);
		            return reject(err);
		        });
    	});
    }