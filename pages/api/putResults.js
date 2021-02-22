const fs = require("fs");
// const csv = require("fast-csv");
const csv = require('csv-parser');
const {spawn} = require('child_process');



const data = require("../../backend/data/index");
var formidable = require('formidable')

export default async (req, res) => {
    if (req.method === 'POST') {

        await data.initIfNotStarted();
        try {
            // Do some error checking here.
            // console.log("__filename")
            // console.log(module.path)
            // res.setHeader('Content-Type', 'application/json');
            // res.statusCode = 200;
            // res.end(JSON.stringify({message: "Good"}));
            // return

            var form = new formidable.IncomingForm({ keepExtensions: true });

            // form.parse(req, function(err, fields, files) {
            //     if (err) {
            //         console.error(err.message);

            //         res.setHeader('Content-Type', 'application/json');
            //         res.statusCode = 500;
            //         res.end( JSON.stringify({message: "An error occurred while uploading the file."}) );
                    
            //         return;
            //     }

            //     console.log("fields")
            //     console.log(fields)

            //     console.log("files")
            //     console.log(files)

            //     res.setHeader('Content-Type', 'application/json');
            //     res.statusCode = 200;
            //     res.end(JSON.stringify({message: "Good"}));

            //     return;
            // });

            form.parse(req)
                .on('fileBegin', (name, file) => {
                    file.path = 'resources/static/assets/uploads/' + file.name
                })
                .on('file', (name, file) => {
                    var dataToSend;
                    // Spawn new child process to call the python script
                    const python = spawn('python', ['python1.py']);
                    // Collect data from Script
                    python.stdout.on('data', function (data) {
                        console.log('Pipe data from python script ...');
                        dataToSend = data.toString();
                    });

                    // in close event we are sure that stream from child process is closed
                    python.on('close', (code) => {
                        console.log(dataToSend)
                        console.log(`child process close all stdio with code ${code}`);
                    // send data to browser
                    })



                    // Reading the file (version 1)
                    // fs.createReadStream(file.path)
                    //     .pipe(csv())
                    //     .on('data', (row) => {
                    //         console.log(row);
                    //     })
                    //     .on('end', () => {
                    //         console.log('CSV file successfully processed');
                    //     });
                    // console.log('Uploaded file: ', name, file)


                    // Reading the file (version 2)
                    // const data = fs.readFileSync(file.path);
                    // data.readFileSync("");
                    // fs.writeFileSync(`resources/static/assets/uploads/${file.name}`, data);
                    // fs.unlinkSync(file.path);
                })
                .on('end', () => {
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    res.end(JSON.stringify({message: "Good"}));
                })






            // let resultRows = [];
            // let path = __dirname + "/resources/static/assets/uploads/" + req.body.fileName;
            
            
            // await data.results.putAll(req.body.map(e => {
            //     return {...e, date: new Date()}
            // }));

            // res.setHeader('Content-Type', 'application/json');
            // res.statusCode = 200;
            // res.end(JSON.stringify({message: "Successfully stored the data!"}));


            // fs.createReadStream(path)
            //     .pipe(csv.parse({ headers: true }))
            //     .on("error", (error) => {
            //         throw error.message;
            //     })
            //     .on("data", (row) => {
            //         resultRows.push(row);
            //     })
            //     .on("end", () => {
            //         results.putAll(resultRows)
            //             .then(() => {
            //                 res.status(200).send({
            //                     message:
            //                         "Uploaded the file successfully: ", //+ req.body.fileName,
            //                 });
            //             })
            //             .catch((error) => {
            //                 res.status(500).send({
            //                     message: "Fail to import data into database!",
            //                     error: error.message,
            //                 });
            //             });
            //     });
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