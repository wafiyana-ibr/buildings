import dataBuildings from "@/pages/base/dataBuildings";

const getMaxLevelByThWafi = (lvlsWafi, thLevelWafi) => lvlsWafi
    .filter(levelWafi => levelWafi.th <= thLevelWafi)
    .sort((aWafi, bWafi) => bWafi.lv - aWafi.lv)[0];

/**
 * Memproses data bangunan dari database dan mengkategorikannya ke dalam kategori masing-masing
 * @param {Array} buildingsWafi - Array objek bangunan dari database
 * @param {Number} thLevelWafi - Level Town Hall
 * @returns {Object} Objek bangunan yang sudah dikategorikan dengan kategori sebagai kunci dan tipe bangunan sebagai sub-kunci
 */
export const processBuildingsWafi = (buildingsWafi, thLevelWafi) => {
    // Inisialisasi objek hasil dengan semua kategori menggunakan objek kosong
    const groupedBuildingsWafi = {
        Defenses: {},
        Traps: {},
        Resources: {},
        Army: {},
        Walls: {}
    };

    // Periksa apakah data input valid
    if (!buildingsWafi || !Array.isArray(buildingsWafi) || buildingsWafi.length === 0) {
        return groupedBuildingsWafi;
    }

    // Proses setiap bangunan dari database
    buildingsWafi.forEach((buildingWafi) => {
        // Validasi properti bangunan
        if (!buildingWafi || !buildingWafi.wafi_name) {
            return; // Lewati jika data bangunan tidak valid
        }

        let lvlsWafi = [];

        // Mencari level bangunan yang sesuai dengan level Town Hall
        if (buildingWafi.wafi_name && buildingWafi.wafi_name.includes("Wall")) {
            const wallDataWafi = dataBuildings.find(dataBuildingWafi =>
                dataBuildingWafi.name === "Wall"
            );

            if (wallDataWafi) {
                lvlsWafi = wallDataWafi.lvls.filter(levelWafi =>
                    levelWafi.th <= thLevelWafi
                );

                // Inisialisasi kategori Walls jika belum ada
                if (!groupedBuildingsWafi.Walls["Wall"]) {
                    groupedBuildingsWafi.Walls["Wall"] = [];
                }

                groupedBuildingsWafi.Walls["Wall"].push({
                    wafi_obj_id: buildingWafi.wafi_id,
                    wafi_type_id: buildingWafi.wafi_type_id,
                    wafi_level: parseInt(buildingWafi.wafi_name.split(" ")[1]) || 0,
                    wafi_name: buildingWafi.wafi_name,
                    wafi_max_level_th: lvlsWafi.length > 0 ? Math.max(...lvlsWafi.map(level => level.lv)) : 1,
                    wafi_wall_count: buildingWafi.wafi_level || 0,
                    wafi_lvls: lvlsWafi,
                    wafi_category_name: "Walls",
                    wafi_cost_type: 'gold',
                    wafi_wall_count_max: lvlsWafi.sort((a, b) => b.th - a.th).find(level => level.th <= thLevelWafi)?.n || 0,
                });
            }
            return; // Lewati pemrosesan lebih lanjut untuk Wall
        }

        // Cari data level untuk bangunan ini
        const dataBuildingMatchWafi = dataBuildings.find(dataBuildingWafi =>
            dataBuildingWafi.name === buildingWafi.wafi_name
        );

        if (dataBuildingMatchWafi) {
            lvlsWafi = dataBuildingMatchWafi.lvls.filter(levelWafi =>
                levelWafi.th <= thLevelWafi
            );
        }

        // Dapatkan kategori dan tipe biaya
        const costTypeWafi = dataBuildingMatchWafi?.ct || 'gold';
        const categoryWafi = buildingWafi.wafi_category_name;

        // Periksa kategori yang valid
        if (!categoryWafi || !groupedBuildingsWafi[categoryWafi]) {
            // Jika kategori tidak valid, tambahkan ke Defenses sebagai fallback
            const fallbackCategory = "Defenses";

            if (!groupedBuildingsWafi[fallbackCategory][buildingWafi.wafi_name]) {
                groupedBuildingsWafi[fallbackCategory][buildingWafi.wafi_name] = [];
            }

            groupedBuildingsWafi[fallbackCategory][buildingWafi.wafi_name].push({
                wafi_obj_id: buildingWafi.wafi_id,
                wafi_type_id: buildingWafi.wafi_type_id,
                wafi_name: buildingWafi.wafi_name,
                wafi_level: buildingWafi.wafi_level || 0,
                wafi_max_level_th: lvlsWafi.length > 0 ? getMaxLevelByThWafi(lvlsWafi, thLevelWafi)?.lv || 1 : 1,
                wafi_lvls: lvlsWafi,
                wafi_category_name: fallbackCategory,
                wafi_cost_type: costTypeWafi,
            });
            return;
        }

        // Buat objek bangunan dengan properti langsung dari database
        const buildingObjWafi = {
            wafi_obj_id: buildingWafi.wafi_id,
            wafi_type_id: buildingWafi.wafi_type_id,
            wafi_name: buildingWafi.wafi_name,
            wafi_level: buildingWafi.wafi_level || 0,
            wafi_max_level_th: lvlsWafi.length > 0 ? getMaxLevelByThWafi(lvlsWafi, thLevelWafi)?.lv || 1 : 1,
            wafi_lvls: lvlsWafi,
            wafi_category_name: categoryWafi,
            wafi_cost_type: costTypeWafi,
        };

        // Inisialisasi tipe bangunan dalam kategori jika belum ada
        if (!groupedBuildingsWafi[categoryWafi][buildingWafi.wafi_name]) {
            groupedBuildingsWafi[categoryWafi][buildingWafi.wafi_name] = [];
        }

        // Tambahkan instance bangunan ke kelompok berdasarkan nama
        groupedBuildingsWafi[categoryWafi][buildingWafi.wafi_name].push(buildingObjWafi);
    });

    return groupedBuildingsWafi;
};

export default processBuildingsWafi;