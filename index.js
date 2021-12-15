const fs = require('fs')
const convert = require('xml-js');
const js2xmlparser = require("js2xmlparser");
const typeOfLoad =  process.argv[2];
let sourceFile = process.argv[3];

fs.readFile("config/"+typeOfLoad+".json", 'utf8', function (err,config) {
	
	fs.readFile(sourceFile, 'utf8', function (err,data) {
  let result =  convert.xml2json(data, {compact: true, spaces: 4});
  const convertedResults = {};
  const configGroup = JSON.parse(config);
  const destinationExtention = configGroup.file_type;
  if(sourceFile.indexOf("\\") !== -1){
	  sourceFile = sourceFile.split("\\")[sourceFile.split("\\").length -1];
  }
  let destinationFileName = sourceFile.replace("."+destinationExtention,"")+"_converted_"+new Date().getTime()+"."+destinationExtention;
  const fields_to_remove = configGroup.fields_to_remove;
  const fields_to_add_dummy = configGroup.fields_to_add_dummy;
  const resultJson = JSON.parse(result);
  let transformedfile = removeFileds(fields_to_remove,resultJson);
  transformedfile = addFileds(fields_to_add_dummy,resultJson);
 //console.log(resultJson['customer-list']);
	/**fs.writeFile("test123.json",transformedfile, 'utf8', function (err) {
     if (err) return console.log(err);
  });**/

  
   fs.writeFile("output/"+destinationFileName, convert.json2xml(transformedfile, {compact: true, spaces: 4}), 'utf8', function (err) {
     if (err) return console.log(err);
  });
  

  
  
});
})

function addFileds(fields_to_add,result){
	const converted_results = {};
	for ( const i in fields_to_add){
		let root_node = fields_to_add[i].root_node;
		let array_node = fields_to_add[i].array_node;
		let path = fields_to_add[i].path;
		let pathVal = fields_to_add[i].value;
		let evalScript = "arrayNode";
		let attributeName = "";
		let attributeValue = "";
		path.split("/").forEach(pathVal => {
			if(pathVal.indexOf("ARRAY@") === -1){
				evalScript = evalScript+"['"+pathVal+"']"
			}else{
				var attributeVals = pathVal.replace("ARRAY@","").split("=");
				attributeName = attributeVals[0];
				attributeValue = attributeVals[1];
			}
			
		});
		var eles = 	result[root_node][array_node];
		for(var ele in eles){
			var arrayNode = eles[ele];
			//console.log(arrayNode);
			var arrayNodeAttr = eval(evalScript);
			var newObj = {};
			newObj["_text"] = pathVal;
			newObj["_attributes"] = {attributeName: attributeValue};
			arrayNodeAttr.push(newObj);

		}
		

	}
	return JSON.stringify(result);
	
}
function removeFileds(fields_to_remove,result){
	const converted_results = {};
	for ( const i in fields_to_remove){
		let root_node = fields_to_remove[i].root_node;
		let array_node = fields_to_remove[i].array_node;
		let path = fields_to_remove[i].path;
		let evalScript = "arrayNode";
		let attributeName = "";
		let attributeValue = "";
		path.split("/").forEach(pathVal => {
			if(pathVal.indexOf("ARRAY@") === -1){
				evalScript = evalScript+"['"+pathVal+"']"
			}else{
				var attributeVals = pathVal.replace("ARRAY@","").split("=");
				attributeName = attributeVals[0];
				attributeValue = attributeVals[1];
			}
			
		});
		var eles = 	result[root_node][array_node];
		for(var ele in eles){
			var arrayNode = eles[ele];
			//console.log(arrayNode);
			var arrayNodeAttr = eval(evalScript)
			for (var attrib in arrayNodeAttr){

				if(arrayNodeAttr[attrib]["_attributes"][attributeName] === attributeValue){
	
					arrayNodeAttr.splice(attrib,1);
				}
			}
			
		}
		

	}
	return JSON.stringify(result);
	
}




