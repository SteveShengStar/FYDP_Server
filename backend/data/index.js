const mongoose = require('mongoose');

let config = {};
config = require('./config.json');

const data = {};
data.connected = false;

data.initIfNotStarted = async () => {
    if (!data.connected) {
        await data.init();
    }
};

data.init = async () => {
    if (!config.url) {
        throw new Error('No URL found in config.');
    }
    try {
        await mongoose.connect(config.url, {
            useCreateIndex: true,
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log("The connection was established.")
    } catch (error) {
        console.log("An error occurred.")
        console.log(error)
    }

    data.connected = true;

    console.log(`Connected to: ${config.url}`);
};

data.close = async () => {
    data.connected = false;
    await mongoose.disconnect();
};

data.results = require('./handlers/results');
module.exports = data;