import { objectAPI } from "@/api/dbAPI";
import dataBuildings from "@/pages/base/dataBuildings";
import updateBaseFromApiData from "@/utils/updateApiCoc";

/**
 * Fungsi untuk inisialisasi bangunan ketika user pertama kali membuat akun
 * Membuat semua bangunan yang tersedia pada level Town Hall tertentu dengan level awal 0
 * @param {number} baseIdWafi - ID Base dari user
 * @param {number} thLevelWafi - Level Town Hall user
 * @param {Object} playerData - Data pemain dari API (opsional)
 */
export const initializeBuildingUtilsWafi = async (baseIdWafi, thLevelWafi, playerData) => {
    try {
        // Validasi parameter yang diberikan
        if (!baseIdWafi || !thLevelWafi) {
            return false;
        }

        // Array untuk menyimpan semua instance bangunan yang akan dibuat
        const allBuildingInstancesWafi = [];

        // Memproses setiap jenis bangunan dari data
        dataBuildings.forEach((buildingWafi) => {
            // Mencari jumlah bangunan yang tersedia untuk level TH ini
            const levelInfoWafi = buildingWafi.lvls
                .sort((a, b) => b.th - a.th)
                .find(levelWafi => levelWafi.th <= thLevelWafi);

            // Mendapatkan jumlah bangunan yang tersedia, default 0 jika tidak ada
            const availableCountWafi = levelInfoWafi?.n || 0;

            // Lewati jika tidak ada bangunan yang tersedia
            if (availableCountWafi <= 0) return;
            if (
                buildingWafi.name === "Town Hall Weapon" || 
                buildingWafi.name === "Blacksmith" || 
                buildingWafi.name === "Spell Factory" || 
                buildingWafi.name === "Dark Spell Factory" || 
                buildingWafi.name === "Clan Castle" || 
                buildingWafi.name === "Pet House" || 
                buildingWafi.name === "Barracks" || 
                buildingWafi.name === "Dark Barracks" || 
                buildingWafi.name === "Workshop"
            ) return;

            // Penanganan khusus untuk Wall
            if (buildingWafi.name === "Wall") {
                for (let iWafi = 0; iWafi <= levelInfoWafi.th; iWafi++) {
                    allBuildingInstancesWafi.push({
                        name: `Wall ${iWafi + 1}`,
                        level: 0,
                    });
                }
                return;
            }

            // Untuk bangunan non-Wall, buat instance sejumlah yang tersedia
            for (let iWafi = 0; iWafi < availableCountWafi; iWafi++) {
                allBuildingInstancesWafi.push({
                    name: buildingWafi.name,
                    level: 0
                });
            }
        });

        // Proses data pemain jika tersedia
        try {
            if (playerData) {
                await updateBaseFromApiData(baseIdWafi, playerData);
            }
        } catch (errorWafi) {
            // Lanjutkan meskipun ada error saat memproses data pemain
        }

        // Kirim data ke API untuk disimpan di database
        try {
            await objectAPI.initObject(baseIdWafi, allBuildingInstancesWafi);
            return allBuildingInstancesWafi;
        } catch (apiError) {
            return false;
        }

    } catch (errorWafi) {
        return false;
    }
};

// Export objek default untuk kompatibilitas dengan kode lama
export default { initializeBuildingUtilsWafi };