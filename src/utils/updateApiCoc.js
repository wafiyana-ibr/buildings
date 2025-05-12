import { baseAPI, objectAPI } from '@/api/dbAPI';

/**
 * Update base dan data bangunan dari API CoC atau data dummy
 * @param {Object} baseId - ID Base dari database
 * @param {Object} playerData - Data dari API CoC atau data dummy pemain
 * @returns {Promise<Object>} Hasil dengan status keberhasilan dan pesan
 */
export const updateBaseFromApiData = async (baseId, playerData) => {
    try {
        // Validasi data pemain
        if (!playerData?.tag || !playerData?.townHallLevel) {
            throw new Error("Data pemain tidak valid. Beberapa kolom wajib tidak ditemukan.");
        }

        // Validasi ID base
        if (!baseId) {
            throw new Error("ID Base tidak ditemukan. Tidak dapat memperbarui base.");
        }

        // Ambil level Town Hall baru
        const newTownHallLevel = parseInt(playerData.townHallLevel);

        // Simpan atau perbarui data base
        const baseResult = await baseAPI.updateBase(baseId, {
            tag: playerData.tag,
            name: playerData.name || 'Base Tanpa Nama',
            thLevel: newTownHallLevel
        });

        // Ekstrak level bangunan dari data pemain
        const buildingsToUpdate = [];
        
        // 1. Perbarui Town Hall Weapon jika diperlukan
        if (newTownHallLevel >= 12) {
            buildingsToUpdate.push({
                name: "Town Hall Weapon",
                level: playerData.townHallWeaponLevel || 0,
            });
        }

        // 2. Ekstrak level bangunan dari data pasukan
        if (playerData.troops && Array.isArray(playerData.troops)) {
            // Barracks: Ambil level tertinggi dari pasukan desa rumah yang menggunakan Barracks
            const barracksLevel = playerData.troops
                .filter(tr => tr.village === 'home' && tr.unlockBuilding === 'Barracks' && tr.upgradeTime !== 0)
                .reduce((highest, troop) => Math.max(highest, troop.unlockBuildingLevel || 0), 0);

            if (barracksLevel > 0) {
                buildingsToUpdate.push({
                    name: "Barracks",
                    level: barracksLevel
                });
            }

            // Dark Barracks: Ambil level tertinggi dari pasukan yang menggunakan Dark Barracks
            const darkBarracksLevel = playerData.troops
                .filter(tr => tr.village === 'home' && tr.unlockBuilding === 'Dark Barracks' && tr.upgradeTime !== 0)
                .reduce((highest, troop) => Math.max(highest, troop.unlockBuildingLevel || 0), 0);

            if (darkBarracksLevel > 0) {
                buildingsToUpdate.push({
                    name: "Dark Barracks",
                    level: darkBarracksLevel
                });
            }

            // Spell Factory
            const spellFactoryLevel = playerData.spells
                .filter(tr => tr.village === 'home' && tr.unlockBuilding === 'Spell Factory')
                .reduce((highest, troop) => Math.max(highest, troop.unlockBuildingLevel || 0), 0);

            if (spellFactoryLevel > 0) {
                buildingsToUpdate.push({
                    name: "Spell Factory",
                    level: spellFactoryLevel
                });
            }

            // Dark Spell Factory
            const darkSpellFactoryLevel = playerData.spells
                .filter(tr => tr.village === 'home' && tr.unlockBuilding === 'Dark Spell Factory')
                .reduce((highest, troop) => Math.max(highest, troop.unlockBuildingLevel || 0), 0);

            if (darkSpellFactoryLevel > 0) {
                buildingsToUpdate.push({
                    name: "Dark Spell Factory",
                    level: darkSpellFactoryLevel
                });
            }

            // Workshop
            const workshopLevel = playerData.troops
                .filter(tr => tr.village === 'home' && tr.unlockBuilding === 'Workshop')
                .reduce((highest, troop) => Math.max(highest, troop.unlockBuildingLevel || 0), 0);

            if (workshopLevel > 0) {
                buildingsToUpdate.push({
                    name: "Workshop",
                    level: workshopLevel
                });
            }
            
            // Blacksmith
            const blacksmithLevel = playerData.heroEquipment
                .filter(tr => tr.village === 'home' && tr.unlockBuilding === 'Blacksmith')
                .reduce((highest, troop) => Math.max(highest, troop.unlockBuildingLevel || 0), 0);
            
            if (blacksmithLevel > 0) {
                buildingsToUpdate.push({
                    name: "Blacksmith",
                    level: blacksmithLevel
                });
            }
            
            // Pet House
            const petHouseLevel = playerData.troops
                .filter(tr => tr.village === 'home' && tr.unlockBuilding === 'Pet House')
                .reduce((highest, troop) => Math.max(highest, troop.unlockBuildingLevel || 0), 0);

            if (petHouseLevel > 0) {
                buildingsToUpdate.push({
                    name: "Pet House",
                    level: petHouseLevel
                });
            }
        }

        // 3. Ambil level Clan Castle dari prestasi
        if (playerData.achievements && Array.isArray(playerData.achievements)) {
            const clanCastleAchievement = playerData.achievements.find(a => a.name === "Empire Builder");
            if (clanCastleAchievement && clanCastleAchievement.value > 0) {
                buildingsToUpdate.push({
                    name: "Clan Castle",
                    level: clanCastleAchievement.value
                });
            }
        }

        // Membuat/memperbarui semua objek bangunan
        let objectResult = null;
        if (buildingsToUpdate.length > 0) {
            objectResult = await objectAPI.createOrUpdateObjects(baseId, buildingsToUpdate);
        }

        return {
            success: true,
            message: 'Base berhasil diperbarui dari API!',
            baseResult,
            objectResult,
            buildingsUpdated: buildingsToUpdate.length
        };

    } catch (error) {
        return {
            success: false,
            message: `Error pembaruan: ${error.message}`,
            error
        };
    }
};

export default updateBaseFromApiData;
