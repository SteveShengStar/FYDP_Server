const data = require("../../backend/data/index");

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        await data.initIfNotStarted();

        try {
            const result = await data.results.getAll();
            
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({message: "Successfully retrieved the data.", result: result})); 
        } catch(error) {
            console.log(error);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end( JSON.stringify({message: "An error occurred while retrieving the data."}) );
        }
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 404;
        res.end( JSON.stringify({message: "Endpoint could not be found."}) );
    }
};