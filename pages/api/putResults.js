const {spawn} = require('child_process');

const data = require("../../backend/data/index");
var formidable = require('formidable')

const formatDateTimeString = (date) => {
    let dateString = date.toDateString().split(" ").join("_");
    let timeString = date.getHours().toString() + "h-" + date.getMinutes().toString() + "m-" + date.getSeconds().toString() + "s"
    return dateString + "__" + timeString
}

export default async (req, res) => {

    if (req.method === 'POST') {
        await data.initIfNotStarted();
        try {
            // TODO: Do some error checking here.

            var form = new formidable.IncomingForm({ keepExtensions: true });
            var fields = {fileNames: []}
            var date;
            form.multiples = true;
            
            form.parse(req)
                .on('fileBegin', (name, file) => {      // Set the local directory path for storing this uploaded file
                    file.path = 'resources/static/assets/uploads/train/' + file.name
                    fields.fileNames.unshift(file.path)
                })
                .on('field', (name, value) => {         // Collect name/value pairs inside "fields" object
                    fields[name] = value
                })
                .on('end', () => {
                    var modelAccuracy;
                    const {fileNames, mlModelName, trainPercent, testPercent, ...params} = fields;
                    let py_process;
                    
                    Object.keys(params).map(function (key, index) { 
                        params[key] = parseInt(params[key]);            // Cast parameters to integers
                    });                                                 // Makes it type-compatible to store inside the DB
                    // var startTime = new Date();  // This line is used for profiling
                    date = new Date();              // Get the current date to generate a timestamp for the generated CSV file

                    switch(mlModelName) {           // Spawn new child process to call the python script
                        case "svm":
                            py_process = spawn('python', ['svm_model.py', fields.fileNames.join(","), testPercent, params.maxIter, params.dual, params.C, formatDateTimeString(date)]) 
                            break;
                        case "naive_bayes":         // Use Gaussian Naive Bayes model By default
                            py_process = spawn('python', ['nbayes_model.py', fields.fileNames.join(","), testPercent, params.varSmoothing, formatDateTimeString(date)]) 
                            break;
                        default:                    // Use Gaussian Naive Bayes model By default          
                            py_process = spawn('python', ['nbayes_model.py', fields.fileNames.join(","), testPercent, params.varSmoothing, formatDateTimeString(date)]) 
                    }


                    // Collect data from Python Script stdout stream
                    py_process.stdout.on('data', function (accuracyScore) {
                        console.log('Pipe data from python script ...');
                        modelAccuracy = parseFloat(parseFloat(accuracyScore.toString()).toFixed(3));
                    });
                    py_process.on('close', (code) => {
                        console.log(`child process close all stdio with code ${code}`);

                        // var endTime = new Date();    // This is used for profiling
                        // var timeDiff = endTime - startTime; //in ms
                        // timeDiff /= 1000;           // convert to seconds
                        // console.log("timeDiff")
                        // console.log(timeDiff)

                        let paramsCopy = [];
                        Object.keys(params).map(function (key, index) {
                            paramsCopy.push({
                                name: key,
                                value: params[key]
                            })
                        });

                        let dataToStore = 
                            {
                                fileNames: fileNames, 
                                date: date,
                                mlModelName: mlModelName, 
                                parameterValues: paramsCopy, 
                                trainTestSplit: {
                                    train: parseFloat(trainPercent), 
                                    test: parseFloat(testPercent)
                                }, 
                                accuracy: modelAccuracy
                            }
                        console.log(dataToStore)
                        
                        try {
                            data.results.putAll(dataToStore);
                            let dataToSend = {...dataToStore, date: formatDateTimeString(date)}

                            res.setHeader('Content-Type', 'application/json');
                            res.statusCode = 200;
                            res.end( JSON.stringify({message: "Successully stored the training results.", body: dataToSend}) );
                        } catch(e) {
                            res.setHeader('Content-Type', 'application/json');
                            res.statusCode = 500;
                            res.end( JSON.stringify({message: "An error occurred while trying to store the data.", error: error.message}) );
                        }
                    });
                });
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end( JSON.stringify({message: "An error occurred while trying to store the data."}) );
        }
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 404;
        res.end( JSON.stringify({message: "Endpoint could not be found."}) );
    }
}
export const config = {
    api: {
        bodyParser: false,
    },
};