const fs = require("fs");
const csv = require("fast-csv");

const data = require("../../backend/data/index");

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        await data.initIfNotStarted();
        try {
            // if (req.body.fileName == undefined) {
            //     return res.status(400).send("Please upload a CSV file!");
            // }

            //let resultRows = [];
            // console.log(req.body.file);
            // res.status(200).end();
            // return
            //let path = __dirname + "/resources/static/assets/uploads/" + req.body.fileName;
            
            
            await data.results.putAll(req.body.map(e => {
                return {...e, date: new Date()}
            }));

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({message: "Successfully stored the data!"}));


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
            //                         "Uploaded the file successfully: " + req.body.fileName,
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