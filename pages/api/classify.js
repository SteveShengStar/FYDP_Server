const {spawn} = require('child_process');

const data = require("../../backend/data/index");
var formidable = require('formidable')

export default async (req, res) => {

    if (req.method === 'POST') {
        await data.initIfNotStarted();
        try {
            var form = new formidable.IncomingForm({ keepExtensions: true });
            var fields = {}
            var resultsFileName;
            let py_process;

            form.parse(req)
                .on('fileBegin', (name, file) => {      // Set the local directory path for storing this uploaded file
                    file.path = 'resources/static/assets/uploads/classify/' + file.name
                    console.log(name)
                    fields[name] = file.path
                })
                .on('field', (name, value) => {         // Collect name/value pairs inside "fields" object
                    fields[name] = value
                })
                .on('end', () => {
                    console.log(fields)
                    
                    py_process = 
                        spawn('python', ['classify.py', fields.uploadFileName, fields.modelFileName])
                        
                    py_process.stdout.on('data', function (fileName) {
                        console.log('Pipe data from python script ...');
                        console.log("FileName")
                        console.log(fileName.toString());
                        resultsFileName = fileName.toString();
                    });
                    py_process.on('close', (code) => {
                        console.log(`child process close all stdio with code ${code}`);
                        
                        res.setHeader('Content-Type', 'application/json');
                        res.statusCode = 200;
                        res.end( JSON.stringify({message: "Successully classified the data. Results are available at: " + resultsFileName}) );
                    })
                });
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end( JSON.stringify({message: "An error occurred while classifying the data."}) );
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