const tfWafi = require('@tensorflow/tfjs-node');
const metadataDefenses1Wafi = require('../models/tm-defenses-1/metadata.json');
const metadataDefenses2Wafi = require('../models/tm-defenses-2/metadata.json');
const metadataResources1Wafi = require('../models/tm-resources-1/metadata.json');
const labelsDefenses1Wafi = metadataDefenses1Wafi.labels;
const labelsDefenses2Wafi = metadataDefenses2Wafi.labels;
const labelsResources1Wafi = metadataResources1Wafi.labels;
let tmDefensesModel1Wafi, tmDefensesModel2Wafi, tmResourcesModel1Wafi;
const RESOURCES_MODEL_LOCATION_WAFI = `file://${__dirname}/../models/tm-resources-1/model.json`;
const DEFENSES_MODEL_1_LOCATION_WAFI = `file://${__dirname}/../models/tm-defenses-1/model.json`;
const DEFENSES_MODEL_2_LOCATION_WAFI = `file://${__dirname}/../models/tm-defenses-2/model.json`;

async function initAIModelWafi() {
    tmDefensesModel1Wafi = await tfWafi.loadLayersModel(DEFENSES_MODEL_1_LOCATION_WAFI);
    tmDefensesModel2Wafi = await tfWafi.loadLayersModel(DEFENSES_MODEL_2_LOCATION_WAFI);
    tmResourcesModel1Wafi = await tfWafi.loadLayersModel(RESOURCES_MODEL_LOCATION_WAFI);
    
    // Pemanasan model agar prediksi pertama lebih cepat
    const dummyTensorWafi = tfWafi.zeros([1, 224, 224, 3]);
    const warmupResultWafi = tmDefensesModel1Wafi.predict(dummyTensorWafi);
    await warmupResultWafi.data();
    warmupResultWafi.dispose();
    
    const warmupResult2Wafi = tmDefensesModel2Wafi.predict(dummyTensorWafi);
    await warmupResult2Wafi.data();
    warmupResult2Wafi.dispose();
    
    const warmupResult3Wafi = tmResourcesModel1Wafi.predict(dummyTensorWafi);
    await warmupResult3Wafi.data();
    warmupResult3Wafi.dispose();
    
    dummyTensorWafi.dispose();
}

async function predictWafi(imageWafi, modelTypeWafi) {
    if (modelTypeWafi === 2) {
        return tmDefensesModel2Wafi.predict(imageWafi);
    } else if (modelTypeWafi === 3) {
        return tmResourcesModel1Wafi.predict(imageWafi);
    }
    return tmDefensesModel1Wafi.predict(imageWafi);
}

async function getTopKClassesWafi(logitsWafi, modelTypeWafi) {
    let labelsWafi = labelsDefenses1Wafi;
    if (modelTypeWafi === 2) {
        labelsWafi = labelsDefenses2Wafi;
    } else if (modelTypeWafi === 3) {
        labelsWafi = labelsResources1Wafi;
    }
    
    const argMaxWafi = tfWafi.tidy(() => logitsWafi.argMax(1));
    const indexWafi = (await argMaxWafi.data())[0];
    const valueWafi = (await logitsWafi.max().data())[0];
    argMaxWafi.dispose();
    
    return [{ className: labelsWafi[indexWafi], probability: valueWafi }];
}

module.exports = { initAIModelWafi, predictWafi, getTopKClassesWafi };
