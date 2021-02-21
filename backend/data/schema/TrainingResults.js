const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const Parameter = new Schema({
    name: {
        type: String,
        //required: true,
    },
    value: {
        type: Number,
        //required: true,
    },
})

const TrainingData = new Schema({
    fileName: {
        type: String,
        //required: true
    },
    date: {
        type: Date
    },
    mlModelName: {
        type: String,
        //required: true
    },
    parameterValues: {
        type: [Parameter]
    },
    trainTestSplit: {
        train: {
            type: Number
        },
        test: {
            type: Number
        }
    },
    accuracy: {
        type: Number
    }
});
TrainingData.plugin(uniqueValidator);

let TrainingResults;
try {
    TrainingResults = mongoose.connection.model('Result');
} catch (e) {
    TrainingResults = mongoose.model('Result', TrainingData);
}
module.exports = TrainingResults;