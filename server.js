//==================================================================================================

//  d888b  db       .d88b.  d8888b.  .d8b.  db      .d8888. 
// 88' Y8b 88      .8P  Y8. 88  `8D d8' `8b 88      88'  YP 
// 88      88      88    88 88oooY' 88ooo88 88      `8bo.   
// 88  ooo 88      88    88 88~~~b. 88~~~88 88        `Y8b. 
// 88. ~8~ 88      `8b  d8' 88   8D 88   88 88      db   8D 
//  Y888P  Y88888P  `Y88P'  Y8888P' YP   YP Y88888P `8888Y' 

//==================================================================================================
const express = require('express')
const app = express()
const cors = require('cors');
//const path = require('path');
require('dotenv').config();
const portNr = process.env.SERVER_PORT;
const timeOut = process.env.SERVER_TIMEOUT;
const unrealPort = process.env.UNREAL_PORT;

const axios = require('axios');
//const { read } = require('fs');

const objectPath1 = "/Game/PeetieLevels/UEDPIE_0_00_VirtualSet.00_VirtualSet:PersistentLevel.ChromakeyController";
const objectPath2 = "/Game/PeetieLevels/UEDPIE_0_00_VirtualSet.00_VirtualSet:PersistentLevel.VRTSwitcher_2";

//==================================================================================================
          
// .88b  d88.  .d8b.  d888888b d8b   db     db   db d888888b .88b  d88. db      
// 88'YbdP`88 d8' `8b   `88'   888o  88     88   88 `~~88~~' 88'YbdP`88 88      
// 88  88  88 88ooo88    88    88V8o 88     88ooo88    88    88  88  88 88      
// 88  88  88 88~~~88    88    88 V8o88     88~~~88    88    88  88  88 88      
// 88  88  88 88   88   .88.   88  V888     88   88    88    88  88  88 88
// YP  YP  YP YP   YP Y888888P VP   V8P     YP   YP    YP    YP  YP  YP Y88888P 
                                                                           
//==================================================================================================
                                                 
app.use(express.json()); 			//JSON parser
app.use(express.static('public'));  //Root directory for client
app.use(cors({origin:true,credentials: true}));	//Needed to allow React apps to put data
 
const message = `
	<h2>This is the Unreal RemoteAPI middleware server on port ${portNr}</h2>
	<h3>Please run the UnrealChromaReact server to use it.</h3>
`
//Get main client code
app.get('/', (req, res) => {
	res.send(message);
})

//==================================================================================================

// .d8888. d88888b d888888b     db    db  .d8b.  db      db    db d88888b 
// 88'  YP 88'     `~~88~~'     88    88 d8' `8b 88      88    88 88'     
// `8bo.   88ooooo    88        Y8    8P 88ooo88 88      88    88 88ooooo 
//   `Y8b. 88~~~~~    88        `8b  d8' 88~~~88 88      88    88 88~~~~~ 
// db   8D 88.        88         `8bd8'  88   88 88booo. 88b  d88 88.     
// `8888Y' Y88888P    YP           YP    YP   YP Y88888P ~Y8888P' Y88888P 
                                                                      
//==================================================================================================
        

//PUT a value (float,bool,color) to the ChromakeyController
app.post('/SetValue', (req, res) => {
	const jParam = req.body;  
	//console.log("JSON params = ", jParam);
	const svr = GetUnrealServerName(jParam.unrealServer)
	const putUri = `http://${svr}:${unrealPort}/remote/object/call`;

	let funcType = "";
	switch(jParam.type) {
		case 0: funcType = "SetChromakeyFloatValue"; break;
		case 1: funcType = "SetChromakeyBoolValue";  break;
		case 2: funcType = "SetChromakeyColorValue"; break;
	}
	const pparam = {
		"objectPath" : objectPath1
		,"functionName" : funcType
		,"parameters" : {"CamNr": jParam.camNr, "Index": jParam.index, "Value": jParam.value}
		,"generateTransaction" : false 
	};
//		console.log("URI =",putUri,"req =",pparam);
	if(funcType.length<10) {
		res.status(200).json({"Status":"ERROR in body. Nothing sent to Unreal."});
	} else {
		axios.put(putUri, pparam, { timeout: timeOut })
		.then(response => {
			res.status(200).json({"Status":"OK"}); 
		})
		.catch(error => {
			if (error.response) {
				res.status(error.response.status).json(error.response.data);
			} else if (error.request) {
				res.status(400).json({errorMessage:error.code});
			} else {
				res.status(400).json(error);
			}
		});
	}
})

//==================================================================================================

//  .o88b.  .d8b.  db      db      d88888b db    db d8b   db  .o88b. d888888b d888888b  .d88b.  d8b   db 
// d8P  Y8 d8' `8b 88      88      88'     88    88 888o  88 d8P  Y8 `~~88~~'   `88'   .8P  Y8. 888o  88 
// 8P      88ooo88 88      88      88ooo   88    88 88V8o 88 8P         88       88    88    88 88V8o 88 
// 8b      88~~~88 88      88      88~~~   88    88 88 V8o88 8b         88       88    88    88 88 V8o88 
// Y8b  d8 88   88 88      88      88      88b  d88 88  V888 Y8b  d8    88      .88.   `8b  d8' 88  V888 
//  `Y88P' YP   YP Y88888P Y88888P YP      ~Y8888P' VP   V8P  `Y88P'    YP    Y888888P  `Y88P'  VP   V8P 
                                                                                                        
//==================================================================================================

//Call other functions in the ChromakeyController
app.post('/CallFunction', (req, res) => {
	const jParam = req.body;  
//	console.log("CallFunction JSON params = ", jParam);
	const svr = GetUnrealServerName(jParam.unrealServer)
	const putUri = `http://${svr}:${unrealPort}/remote/object/call`;
	var pparam;
	var funcType = "";
	switch(jParam.type) {
		case 0: funcType = "CopyParametersFromMasterCam"; break;
		case 1: funcType = "SetDefaultValues"; break;
		case 2: funcType = "SwitchSource"; break;
	}
	if(jParam.type==2) { //Send to VRTSwitcher
		pparam = {
			"objectPath" : objectPath2
			,"functionName" : funcType
			,"parameters" : {"SourceID": jParam.camNr-1} //VRTSwitcher uses 0-based camNrs
			,"generateTransaction" : true 
		};
	} else { //Send to ChromakeyController
		pparam = {
			"objectPath" : objectPath1
			,"functionName" : funcType
			,"parameters" : {"CamNr": jParam.camNr} //ChromakeyController uses 1-based camNrs
			,"generateTransaction" : false
		};
	}
	console.log("CallFunction URI =",putUri,"\nreq =",pparam);
	if(funcType.length<10) {
		res.status(200).json({"Status":"ERROR in body. Nothing sent to Unreal."});
	} else {
		axios.put(putUri, pparam, { timeout: timeOut })
		.then(response => {
			res.status(200).json({"Status":"OK"}); 
		})
		.catch(error => {
			if (error.response) {
				res.status(error.response.status).json(error.response.data);
			} else if (error.request) {
				res.status(400).json({errorMessage:error.code});
			} else {
				res.status(400).json(error);
			}
		});
	}
})

app.post('/CallFunction2', (req, res) => {
	const jParam = req.body;  
//	console.log("CallFunction JSON params = ", jParam);
	const svr = GetUnrealServerName(jParam.unrealServer)
	const putUri = `http://${svr}:${unrealPort}/remote/object/call`;
	var pparam;
	var funcType = "";
	switch(jParam.type) {
		case 0: funcType = "SetAllParametersToAllCams"; break;
	}
	pparam = {
		"objectPath" : objectPath1
		,"functionName" : funcType
		,"parameters" : jParam.data //the data object
		,"generateTransaction" : false
	};
	console.log("CallFunction URI =",putUri,"\nreq =",pparam);
	if(funcType.length<10) {
		res.status(200).json({"Status":"ERROR in body. Nothing sent to Unreal."});
	} else {
		axios.put(putUri, pparam, { timeout: timeOut })
		.then(response => {
			res.status(200).json({"Status":"OK"}); 
		})
		.catch(error => {
			if (error.response) {
				res.status(error.response.status).json(error.response.data);
			} else if (error.request) {
				res.status(400).json({errorMessage:error.code});
			} else {
				res.status(400).json(error);
			}
		});
	}
})

//==================================================================================================

//  d888b  d88888b d888888b  .d8b.  db      db      db    db  .d8b.  db      db    db d88888b .d8888. 
// 88' Y8b 88'     `~~88~~' d8' `8b 88      88      88    88 d8' `8b 88      88    88 88'     88'  YP 
// 88      88ooooo    88    88ooo88 88      88      Y8    8P 88ooo88 88      88    88 88ooooo `8bo.   
// 88  ooo 88~~~~~    88    88~~~88 88      88      `8b  d8' 88~~~88 88      88    88 88~~~~~   `Y8b. 
// 88. ~8~ 88.        88    88   88 88      88       `8bd8'  88   88 88      88b  d88 88.     db   8D 
//  Y888P  Y88888P    YP    YP   YP Y88888P Y88888P    YP    YP   YP Y88888P ~Y8888P' Y88888P `8888Y' 
                                                                                                   
//==================================================================================================
                                                                                                                                                                                                                                                                                                                  
//PUT a command to the ChromakeyController to receive all values from all cams
//This is called by the polling timer or after some actions
app.post('/GetAllValues', (req, res) => {
	const jParam = req.body;  
	// console.log("POST GetAllValues JSON params = ", jParam);
	const svr = GetUnrealServerName(jParam.unrealServer)
	const putUri = `http://${svr}:${unrealPort}/remote/object/call`;
	const pparam = {
		"objectPath" : objectPath1
		,"functionName" : "GetAllParamsFromAllCams"
		,"generateTransaction" : false 
	};
	console.log("GetAllValues URI =",putUri);//,"req =",pparam);
	axios.put(putUri, pparam, { timeout: timeOut })
	.then(response => {
//		console.log("Response data received from Unreal at",svr);
//		console.log(response.data);
		res.status(200).json(response.data);
	})
	.catch(error => {
//		console.log("====== START =============================================");  
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
//			console.log(error.response);	//This is a VERY long structure

//	This data contains the response from unreal when it is not in play mode
//			console.log(error.response.data); 
			res.status(error.response.status).json(error.response.data);
		} else if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			console.log("Connect failed to Unreal at",svr,"with error code",error.code);
			res.status(400).json({errorMessage:error.code});
		} else {
			// Something happened in setting up the request that triggered an Error
//			console.log('No error.request', error);
			console.log("Failed to connect unreal at",svr);
			res.status(400).json(error);
		}
//		console.log("error.response:",error.response," error.errno:",error.errno);
//		console.log("ERROR status: ",error.response.status," Message:",error.response.data);
//console.log("======  END  =============================================");  
	});
})

//==================================================================================================

// .d8888. d88888b d8888b. db    db d88888b d8888b. 
// 88'  YP 88'     88  `8D 88    88 88'     88  `8D 
// `8bo.   88ooooo 88oobY' Y8    8P 88ooooo 88oobY' 
//   `Y8b. 88~~~~~ 88`8b   `8b  d8' 88~~~~~ 88`8b   
// db   8D 88.     88 `88.  `8bd8'  88.     88 `88. 
// `8888Y' Y88888P 88   YD    YP    Y88888P 88   YD 
                                                 
//==================================================================================================
//===== Main server listener ================
app.listen(portNr, () => {
  console.log(`UnrealChromaControl Server listening on port ${portNr}`);
})

function GetUnrealServerName(unreal) {
	switch(unreal) {
		case 1: return process.env.UNREAL_URL1;
		case 2: return process.env.UNREAL_URL2;
		case 3: return process.env.UNREAL_URL3;
		default: return "localhost";
	}
}