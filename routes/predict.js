// Import modul yang diperlukan
const expressWafi = require('express');
const { processPredictionWafi } = require('../helpers/imageProcessing'); // Asumsikan path ini benar
const axiosWafi = require('axios');
const canvasWafi = require('canvas');
const fsWafi = require('fs');
const dotenvWafi = require('dotenv');

// Muat variabel lingkungan dari file .env
dotenvWafi.config();

// Buat instance router Express
const routerWafi = expressWafi.Router();

// Ambil variabel lingkungan yang diperlukan
const { ROBOFLOW_API_URL_DEFENSES_WAFI, ROBOFLOW_API_URL_RESOURCES_WAFI, ROBOFLOW_API_KEY_WAFI } = process.env;

/**
 * Memproses gambar menggunakan Roboflow API untuk deteksi objek.
 *
 * Langkah-langkah:
 * 1. Periksa apakah `imagePathWafi` (path file gambar) ada. Jika tidak, kembalikan array kosong.
 * 2. Baca file gambar dari `imagePathWafi` dan encode menjadi base64.
 * 3. Kirim permintaan POST ke `apiUrlWafi` (URL API Roboflow) dengan:
 * - Metode: POST
 * - URL: `apiUrlWafi`
 * - Parameter query: `api_key` dengan nilai dari `ROBOFLOW_API_KEY_WAFI`.
 * - Body request: Data gambar base64.
 * - Header: `Content-Type` diatur ke `application/x-www-form-urlencoded`.
 * 4. Jika permintaan berhasil dan respons memiliki data prediksi (`responseWafi.data.predictions`):
 * - Filter prediksi berdasarkan `classesToIncludeWafi` jika array ini tidak kosong DAN `confidenceThresholdWafi` jika nilai ini lebih dari 0.
 * - Muat gambar asli dari `imagePathWafi` menggunakan `canvasWafi.loadImage`.
 * - Panggil fungsi `processPredictionWafi` untuk memproses lebih lanjut prediksi dengan gambar asli dan `groupWafi`.
 * - Urutkan hasil prediksi berdasarkan `building_name`.
 * - Kembalikan array prediksi yang telah diproses dan diurutkan.
 * 5. Jika terjadi error selama proses (pembacaan file, permintaan API), catat error ke konsol dan kembalikan array kosong.
 *
 * @param   {string} imagePathWafi - Path ke file gambar yang akan diproses.
 * @param   {string} apiUrlWafi - URL API Roboflow untuk pemrosesan gambar.
 * @param   {number} [confidenceThresholdWafi=0] - Ambang batas kepercayaan diri untuk memfilter prediksi.
 * @param   {number} [groupWafi=null] - ID kelompok untuk pemrosesan prediksi lebih lanjut.
 * @param   {string[]} [classesToIncludeWafi=[]] - Array kelas objek yang ingin disertakan dalam prediksi. Jika kosong, semua kelas akan dipertimbangkan.
 * @returns {Promise<Array<object>>} Promise yang resolve dengan array objek prediksi yang telah diproses dan diurutkan, atau array kosong jika terjadi error atau tidak ada gambar.
 */
const processImageWafi = async (imagePathWafi, apiUrlWafi, confidenceThresholdWafi = 0, groupWafi = null, classesToIncludeWafi = []) => {
    // Jika path gambar tidak ada, kembalikan array kosong
    if (!imagePathWafi) return [];
    try {
        // Baca file gambar dan encode ke base64
        const imageBase64Wafi = fsWafi.readFileSync(imagePathWafi, { encoding: 'base64' });

        // Kirim permintaan ke Roboflow API
        const responseWafi = await axiosWafi({
            method: 'POST',
            url: apiUrlWafi,
            params: { api_key: ROBOFLOW_API_KEY_WAFI },
            data: imageBase64Wafi,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        // Periksa apakah respons berisi prediksi
        if (responseWafi.data && responseWafi.data.predictions) {
            let predictionsWafi = responseWafi.data.predictions;

            // Filter prediksi berdasarkan kelas yang diizinkan dan ambang batas kepercayaan
            if (classesToIncludeWafi.length > 0) {
                predictionsWafi = predictionsWafi.filter(p => classesToIncludeWafi.includes(p.class) && p.confidence > confidenceThresholdWafi);
            } else if (confidenceThresholdWafi > 0) {
                // Filter hanya berdasarkan ambang batas kepercayaan jika tidak ada kelas spesifik
                predictionsWafi = predictionsWafi.filter(p => p.confidence > confidenceThresholdWafi);
            }

            // Jika tidak ada prediksi setelah filter, kembalikan array kosong
            if (predictionsWafi.length === 0) return [];

            // Muat gambar asli menggunakan canvas
            const originalImageWafi = await canvasWafi.loadImage(imagePathWafi);

            // Proses prediksi lebih lanjut (misalnya, analisis warna, dll.)
            const processedPredictionsWafi = await processPredictionWafi(originalImageWafi, predictionsWafi, groupWafi);

            // Urutkan hasil berdasarkan nama bangunan
            return processedPredictionsWafi.sort((a, b) => a.building_name.localeCompare(b.building_name));
        }
        // Jika tidak ada prediksi dalam respons, kembalikan array kosong
        return [];
    } catch (errorWafi) {
        // Tangani error saat pemrosesan gambar
        console.error(`Error processing image (${apiUrlWafi}) for path ${imagePathWafi}:`, errorWafi.message);
        // Kembalikan array kosong jika terjadi error
        return [];
    }
};

// Definisikan route POST untuk endpoint root '/'
routerWafi.post('/', async (reqWafi, resWafi) => {
    try {
        // Ambil path gambar dari body request
        const defensesImageWafi = reqWafi.body.defensesImage;
        const resourcesImageWafi = reqWafi.body.resourcesImage;

        // Validasi: setidaknya satu gambar harus ada
        if (!defensesImageWafi && !resourcesImageWafi) {
            return resWafi.status(400).send('At least one image file is required.');
        }

        // Definisikan kelas pertahanan untuk masing-masing grup
        const defenseClassesGroup1Wafi = ['Air Defense', 'Air Sweeper', 'Bomb Tower', 'Inferno Tower', 'Eagle Artillery', 'Hidden Tesla', 'Spell Tower', 'X-Bow'];
        const defenseClassesGroup2Wafi = ['Cannon', 'Archer Tower', 'Mortar', 'Wizard Tower', 'Scattershot', 'Monolith'];

        // Buat array untuk menyimpan promise pemrosesan gambar
        const promisesWafi = [];

        // Tambahkan promise untuk pemrosesan gambar pertahanan jika ada
        if (defensesImageWafi?.path) {
            // Promise untuk grup 1 pertahanan
            promisesWafi.push(processImageWafi(
                defensesImageWafi.path,
                ROBOFLOW_API_URL_DEFENSES_WAFI,
                0.5, // Confidence threshold
                1,    // Group ID
                defenseClassesGroup1Wafi
            ));
            // Promise untuk grup 2 pertahanan
            promisesWafi.push(processImageWafi(
                defensesImageWafi.path,
                ROBOFLOW_API_URL_DEFENSES_WAFI,
                0.5, // Confidence threshold
                2,    // Group ID
                defenseClassesGroup2Wafi
            ));
        }

        // Tambahkan promise untuk pemrosesan gambar sumber daya jika ada
        if (resourcesImageWafi?.path) {
            promisesWafi.push(processImageWafi(
                resourcesImageWafi.path,
                ROBOFLOW_API_URL_RESOURCES_WAFI,
                0.7, // Confidence threshold
                3     // Group ID
                // Tidak ada classesToIncludeWafi, proses semua kelas di atas threshold
            ));
        }

        // Jalankan semua promise secara paralel dan tunggu hasilnya
        const resultsArrayWafi = await Promise.all(promisesWafi);

        // Gabungkan hasil dari semua promise menjadi satu array
        // resultsArrayWafi akan menjadi array dari array, misal: [[...group1], [...group2], [...resources]]
        const combinedResultsWafi = resultsArrayWafi.flat(); // Menggunakan flat() untuk menggabungkan sub-array

        // Kirim hasil gabungan sebagai respons JSON
        resWafi.json(combinedResultsWafi);

    } catch (errorWafi) {
        // Tangani error pada level route handler
        console.error('Error in POST / route:', errorWafi.message);
        resWafi.status(500).send(`Server Error: ${errorWafi.message}`);
    }
});

// Ekspor router untuk digunakan di aplikasi Express utama
module.exports = routerWafi;
