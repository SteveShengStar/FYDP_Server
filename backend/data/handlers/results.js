const TrainingResults = require('../schema/TrainingResults');
const results = {};

/**
 * Return all ML training results.
 */
results.getAll = async (filter = {}) => {
    return await TrainingResults.find(filter).exec();
};

/**
 * Insert a new entry into ML Training results table.
 */
results.putAll = async (data) => {
    return TrainingResults.create(data);
};
module.exports = results;