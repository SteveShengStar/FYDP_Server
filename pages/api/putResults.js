const {spawn} = require('child_process');

const data = require("../../backend/data/index");
var formidable = require('formidable')

export default async (req, res) => {
    if (req.method === 'POST') {

        await data.initIfNotStarted();

        try {
            // TODO: Do some error checking here.
            var form = new formidable.IncomingForm({ keepExtensions: true });
            var fields = {}

            form.parse(req)
                .on('fileBegin', (name, file) => {
                    // Set the local directory path for storing this uploaded file
                    file.path = 'resources/static/assets/uploads/' + name
                    fields.fileName = file.path
                })
                .on('field', (name, value) => {
                    // Collect name/value pairs inside "fields" object
                    fields[name] = value
                })
                .on('end', () => {
                    var modelAccuracy;
                    const {fileName, mlModelName, trainPercent, testPercent, ...params} = fields;
                    

                    const {maxIter, dual, C} = params;
                    Object.keys(params).map(function (key, index) { 
                        params[key] = parseInt(params[key]);            // Cast parameters to integers
                    });                                                 // Makes it type-compatible to store inside the DB
                    var startTime = new Date();
                    const py_process = spawn('python', ['ml_model.py', fields.fileName, testPercent, maxIter, dual, C]) // Spawn new child process to call the python script
                    

                    // Collect data from Python Script stdout stream
                    py_process.stdout.on('data', function (accuracyScore) {
                        console.log('Pipe data from python script ...');
                        modelAccuracy = parseFloat(parseFloat(accuracyScore.toString()).toFixed(3));
                    });

                    py_process.on('close', (code) => {
                        console.log(`child process close all stdio with code ${code}`);

                        // var endTime = new Date();
                        // var timeDiff = endTime - startTime; //in ms
                        
                        // timeDiff /= 1000;           // strip the ms
                        // console.log("timeDiff")
                        // console.log(timeDiff)
                        
                        // let date = new Date();
                        let paramsCopy = [];
                        Object.keys(params).map(function (key, index) {
                            paramsCopy.push({
                                name: key,
                                value: params[key]
                            })
                        });

                        let dataToStore = 
                            {
                                fileName: fileName, 
                                date: date,
                                mlModelName: mlModelName, 
                                parameterValues: paramsCopy, 
                                trainTestSplit: {
                                    train: parseFloat(trainPercent), 
                                    test: parseFloat(testPercent)
                                }, 
                                accuracy: modelAccuracy
                            }
                        console.log("dataToStore")
                        console.log(dataToStore)
                        
                        try {
                            data.results.putAll(dataToStore);

                            res.setHeader('Content-Type', 'application/json');
                            res.statusCode = 200;
                            res.end( JSON.stringify({message: "Success."}) );
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