const tfWafi = require('@tensorflow/tfjs-node');
const canvasWafi = require('canvas');
const fsWafi = require('fs');
require('dotenv').config();
const { getTopKClassesWafi, predictWafi } = require('./modelLoader');
async function processImageWafi(canvasObjWafi) {
    return tfWafi.tidy(() => {
        const inputImageWafi = tfWafi.browser.fromPixels(canvasObjWafi);
        return inputImageWafi.expandDims(0).toFloat().div(127).sub(1);
    });
}

async function processPredictionWafi(originalImageWafi, predictionsWafi, modelTypeWafi) {
    const predictionsResultsWafi = [];
    for (const predictionWafi of predictionsWafi) {
        if (predictionWafi.class === 'Blacksmith') continue; // Skip Blacksmith
        let zoomFactorWafi = 1.15;
        if (predictionWafi.class === 'Builder-s Hut') {
            predictionWafi.class = 'Builder\'s Hut';
        }
        if (predictionWafi.class === 'Army Camp') {
            zoomFactorWafi = 1.3;
        }
        if (predictionWafi.class === 'Elixir Collector' || predictionWafi.class === 'Dark Elixir Drill' || predictionWafi.class === 'Builder\'s Hut' || predictionWafi.class === 'Laboratory' || predictionWafi.class === 'Gold Storage' || predictionWafi.class === 'Elixir Storage' || predictionWafi.class === 'Dark Elixir Storage' || predictionWafi.class === 'Hero Hall' || predictionWafi.class === 'Mortar') {
            zoomFactorWafi = 1.2;
        }
        if (predictionWafi.class === 'Gold Mine') {
            zoomFactorWafi = 1.1;
        }
        if (predictionWafi.class === 'Elixir Collector' || predictionWafi.class === 'Elixir Storage' || predictionWafi.class === 'Dark Elixir Storage') {
            zoomFactorWafi = 1.1;
        }
        if (predictionWafi.class === 'Builder\'s Hut') {
            zoomFactorWafi = 0.95;
        }
        const xWafi = Math.round(predictionWafi.x - predictionWafi.width / 2);
        const yWafi = Math.round(predictionWafi.y - predictionWafi.height / 2);
        const widthWafi = Math.round(predictionWafi.width);
        const heightWafi = Math.round(predictionWafi.height);

        const maxDimensionWafi = Math.max(widthWafi, heightWafi) * zoomFactorWafi;
        const cropWidthWafi = maxDimensionWafi;
        const cropHeightWafi = maxDimensionWafi;

        const x1Wafi = Math.max(0, xWafi - (cropWidthWafi - widthWafi) / 2);
        const y1Wafi = Math.max(0, yWafi - (cropHeightWafi - heightWafi) / 2);
        const x2Wafi = Math.min(originalImageWafi.width, x1Wafi + cropWidthWafi);
        const y2Wafi = Math.min(originalImageWafi.height, y1Wafi + cropHeightWafi);

        const zoomCanvasWafi = canvasWafi.createCanvas(224, 224);
        const zoomCtxWafi = zoomCanvasWafi.getContext('2d', { alpha: false }); // Disable alpha for speed

        zoomCtxWafi.drawImage(
            originalImageWafi,
            x1Wafi, y1Wafi, x2Wafi - x1Wafi, y2Wafi - y1Wafi,
            0, 0, 224, 224
        );


        const batchedImageWafi = await processImageWafi(zoomCanvasWafi);
        const logitsWafi = await predictWafi(batchedImageWafi, modelTypeWafi);
        const resultsWafi = await getTopKClassesWafi(logitsWafi, modelTypeWafi);

        batchedImageWafi.dispose();
        logitsWafi.dispose();
        const timestampWafi = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const filenameWafi = `scanResults/${Math.floor(Math.random() * 1000000)}_${predictionWafi.class.replace(" ", "-")}_${timestampWafi}.jpeg`;
        fsWafi.writeFileSync('public/' + filenameWafi, zoomCanvasWafi.toBuffer("image/jpeg", { quality: 0.2 }));
        const bestPredictionWafi = parseInt(resultsWafi[0].className.split('-').pop()) || 0;
        const confidenceWafi = resultsWafi[0].probability;
        predictionsResultsWafi.push({
            image: `${process.env.SERVER_URL}/${filenameWafi}`,
            building_name: predictionWafi.class,
            level: bestPredictionWafi,
            roboflow_confidence: confidenceWafi,
            tm_confidence: resultsWafi[0].probability,
            tm_class: resultsWafi[0].className,
        });
    }
    return predictionsResultsWafi;
}

module.exports = { processImageWafi, processPredictionWafi };
