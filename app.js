var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');

const jsonFormator = require('./routes/data-api/jsonFormator');
var bodyParser = require('body-parser');
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

const fs = require('fs');
const path = require('path');

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 3030));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(req, res) {

    console.log("variable data passed to the index", req.query.node_id);

    var fileDataPath = (req.query.node_id)? "/public/chart-data/"+ req.query.node_id +"-file.json" : "";
    console.log("json file location",fileDataPath);

    res.render('pages/index',{
									message: "",
									error:"",
									chartDataPath: fileDataPath
								}
	);
});

// app.use(fileUpload());

/*app.post('/chart', function(req, res) {
	console.log('**** Inside /chart api');
	
	if (!req.files){
		res.render('pages/index', { 
			message: "",
			error:"No files were uploaded",
			chartDataPath: ''
		});
	}
	
	let employeedataFile = req.files.employeedata;
	console.log('**** employeedataFile name', employeedataFile.name);
	var excelPath = 'public/chart-data/'+employeedataFile.name;
	
	//deleteAllFiles('public/chart-data/');
	
	console.log('++++++++++++++++++++++ employeedataFile.name:' + employeedataFile.name);
	
	employeedataFile.mv(excelPath, function(err) {
		
		if (err){
			res.render('pages/index', 
					{
						message: "",
						error:"Failed to upload employeedata " +employeedataFile.name,
						chartDataPath: ""
					});
		}
		
		res.render('pages/index', 
				{
					message: "Employeedata "+employeedataFile.name+" uploaded successfully!",
					error:"",
					chartDataPath: excelPath
				});
	});
});*/

/*function deleteAllFiles(directory){
	
	fs.readdir(directory, (err, files) => {
		if (err) throw error;

		for (const file of files) {
			fs.unlink(path.join(directory, file), err => {
				if (err) throw error;
			});
		}
	});
}*/


var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './upload/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

var uploadHandler = multer({ //multer settings
    storage: storage,
    fileFilter : function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');


/** API path that will upload the files */
app.post('/upload', function(req, res) {
    var exceltojson;
    uploadHandler(req,res,function(err){
        if(err){
            console.log(err);
            res.json({error_code:1,err_desc:err});
            return;
        }
        /** Multer gives us file info in req.file object */
        if(!req.file){
            res.json({error_code:1,err_desc:"No file passed"});
            return;
        }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        console.log(req.file.path);
        try {
            exceltojson({
                input: req.file.path,
                output:  null, //since we don't need output.json
                lowerCaseHeaders:true
            }, function(err,result){
                if(err) {
                    console.log(err)
                    return res.json({error_code:1,err_desc:err, data: null});
                }
                jsonFormator(result, function (jsonData) {
                    var datenow = Date.now();
                    var fileDataPath = '/public/chart-data/'+datenow +'-file.json';
                    fs.writeFile(__dirname+fileDataPath, JSON.stringify(jsonData), function (err, data) {
                        if(err){
                            return console.log(err.message);
                        }
                        /*res.render('pages/index',{
                                message: "",
                                error:"",
                                chartDataPath: fileDataPath
                            }
                        );*/

                        if (fs.existsSync(__dirname+fileDataPath)) {
                            console.log('Found file');
                            res.redirect('/?node_id=' + datenow);
                        }
                        else{
                            console.log("file is not written yet");
                            res.json({error_code:1,err_desc:"file is yet to write"})
                        }
                    } );


                });
                // res.json({error_code:0,err_desc:null, data: result});
            });
        } catch (e){
            console.log(err)
            res.json({error_code:1,err_desc:"Corrupted excel file"});
        }
    })

});



app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


























