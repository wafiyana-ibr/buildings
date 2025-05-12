import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faSpinner, faExclamationTriangle, faBuilding,
  faShield, faHome, faBomb, faCheck,
  faSave, faSearch
} from "@fortawesome/free-solid-svg-icons";
import { baseAPI, objectAPI } from "@/api/dbAPI";
import { Tooltip } from "react-tooltip";
import { useAuth } from "@/hooks/useAuth";
import { processBuildingsWafi } from "@/utils/processBuildingsWafi";
import CocIcon from '@/components/CocIcon';

// Mendefinisikan konfigurasi tab untuk mode pengeditan
const TABS = {
  defenses: {
    name: "Defenses",
    icon: faShield,
    minTH: 1,
  },
  traps: {
    name: "Traps",
    icon: faBomb,
    minTH: 3,
  },
  resources: {
    name: "Resources",
    icon: faHome,
    minTH: 1,
  },
  army: {
    name: "Army",
    icon: faBuilding,
    minTH: 1,
  },
};

const BaseEdit = () => {
  const { id } = useParams();
  const tag = id.startsWith('#') ? id : `#${id}`;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const urlAssets = import.meta.env.VITE_ASSETS_URL || 'http://localhost:3000/assets';
  // Manajemen state
  const [isLoading, setIsLoading] = useState(true); // Status loading
  const [isSaving, setIsSaving] = useState(false); // Status sedang menyimpan
  const [saveSuccess, setSaveSuccess] = useState(false); // Status berhasil disimpan
  const [error, setError] = useState(null); // Pesan error
  const [base, setBase] = useState(null); // Data base
  const [dbObjectData, setDbObjectData] = useState([]); // Data objek dari database
  const [processedObjectData, setProcessedObjectData] = useState(null); // Data objek yang sudah diproses
  const [activeTab, setActiveTab] = useState("defenses"); // Tab yang aktif
  const [editedBuildings, setEditedBuildings] = useState({}); // Bangunan yang telah diedit
  const [searchTerm, setSearchTerm] = useState(""); // Kata kunci pencarian

  // Fungsi untuk mendapatkan nama tab dari URL hash
  const getTabFromHash = () => {
    const hash = location.hash.replace('#', '').toLowerCase();
    return hash && TABS[hash] ? hash : 'defenses';
  };
  const BuildingImage = ({ src, alt, size = "w-8 h-8" }) => {
    return (<img
      src={src}
      alt={alt}
      className={`${size} object-contain`}
      onError={(e) => {
        e.target.onerror = null;
      }}
    />)
  };
  // Memperbarui URL hash saat tab berubah
  const updateUrlHash = (tabName) => {
    if (typeof window !== 'undefined') {
      window.location.hash = tabName;
    }
  };

  // Handler untuk klik tab - memperbarui tab aktif dan URL hash
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    updateUrlHash(tabName);
  };

  // Menetapkan tab aktif berdasarkan URL hash
  useEffect(() => {
    setActiveTab(getTabFromHash());
  }, [location.hash]);

  // Mengambil data base dan bangunan dari server
  useEffect(() => {
    const fetchBaseAndBuildingData = async () => {
      setIsLoading(true);
      try {
        // Mengambil data base
        const baseData = await baseAPI.getUserBaseByTag(user.id, tag);

        // Jika data base ada, ambil data objek
        if (baseData && baseData.wafi_id) {
          try {
            // Mencoba mendapatkan objek yang sudah ada
            let objectsData = [];
            try {
              objectsData = await objectAPI.getObject(baseData.wafi_id);
            } catch (objFetchError) {
              objectsData = [];
            }

            // Memperbarui state base terlebih dahulu
            setBase(baseData);
            setDbObjectData(objectsData);
          } catch (objError) {
            console.error("Error saat memproses data objek:", objError);
            setBase(baseData);
            setDbObjectData([]);
          }
        } else {
          setError("Data base tidak ditemukan atau tidak valid");
        }
      } catch (err) {
        console.error("Error saat mengambil data:", err);
        setError(err.response?.data?.message || "Gagal mengambil data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.id && tag) {
      fetchBaseAndBuildingData();
    }
  }, [user, tag]);

  // Memproses data bangunan ketika base dan dbObjectData tersedia
  useEffect(() => {
    if (base && base.wafi_th_level) {
      // Menetapkan ulang processedObjectData ke struktur kosong terlebih dahulu
      const emptyProcessedData = {
        Defenses: {},
        Traps: {},
        Resources: {},
        Army: {},
      };

      setProcessedObjectData(emptyProcessedData);

      if (Array.isArray(dbObjectData) && dbObjectData.length > 0) {
        try {
          const processedData = processBuildingsWafi(dbObjectData, base.wafi_th_level);
          setProcessedObjectData(processedData);
        } catch (err) {
          console.error("Error saat memproses data bangunan:", err);
        }
      }
    }
  }, [base, dbObjectData]);
  const getBuildingImageUrl = (buildingName, level) => {
    const normalizedName = buildingName
      .toLowerCase()
      .replace(/[']/g, '')
      .replace(/\s+/g, '-');

    const displayLevel = level > 0 ? level : 1;
    return `${urlAssets}/${normalizedName}/${normalizedName}-${displayLevel}.png`;
  };
  // Menangani pembaruan level bangunan
  const handleUpdateLevel = (objectId, newLevel) => {
    // Mencari bangunan berdasarkan wafi_id
    const building = dbObjectData.find(b => b.wafi_id === objectId);
    if (!building) {
      console.error("Bangunan tidak ditemukan dengan ID:", objectId);
      return;
    }

    // Melacak bangunan yang diedit dan level barunya
    setEditedBuildings(prev => ({
      ...prev,
      [objectId]: newLevel
    }));
    console.log(editedBuildings)

    // Memperbarui state lokal untuk umpan balik UI langsung
    setDbObjectData(prevData =>
      prevData.map(obj =>
        obj.wafi_id === objectId ? { ...obj, wafi_level: newLevel } : obj
      )
    );
  };

  // Menangani perubahan input untuk level bangunan
  const handleInputChange = (objectId, value) => {
    // Parsing nilai input menjadi angka
    let newLevel = parseInt(value, 10);
    if (value === '') newLevel = 0;

    // Jika nilainya bukan angka valid, jangan perbarui
    if (isNaN(newLevel)) return;

    handleUpdateLevel(objectId, newLevel);
  };

  // Add new function to set all buildings in current category to specific level
  const handleSetAllInCategory = (levelType) => {
    // Get all buildings from current tab
    const currentTabBuildings = getCurrentTabBuildings();
    const updatedEditedBuildings = { ...editedBuildings };
    let buildingsUpdated = 0;

    // Process all building types in current category
    Object.values(currentTabBuildings).forEach(buildings => {
      buildings.forEach(building => {
        const levelToSet = levelType === 'max' ? building.wafi_max_level_th : 0;
        
        // Only update if the level is different
        if (building.wafi_level !== levelToSet) {
          updatedEditedBuildings[building.wafi_obj_id] = levelToSet;
          buildingsUpdated++;
          
          setDbObjectData(prevData => {
            return prevData.map(obj =>
              obj.wafi_id === building.wafi_obj_id
                ? { ...obj, wafi_level: levelToSet }
                : obj
            );
          });
        }
      });
    });

    // Update editedBuildings state if any changes were made
    if (buildingsUpdated > 0) {
      setEditedBuildings(updatedEditedBuildings);
    }
  };

  const handleBulkLevelUpdate = (buildings, levelToSet) => {
    // Membuat salinan dari editedBuildings untuk diperbarui
    const updatedEditedBuildings = { ...editedBuildings };

    // Memperbarui setiap bangunan dengan tipe yang sama
    buildings.forEach(building => {
      // Periksa apakah level akan berubah dari nilai saat ini

      if (building.wafi_level !== levelToSet) {

        updatedEditedBuildings[building.wafi_obj_id] = levelToSet;
        setDbObjectData(prevData => {
          const updatedData = prevData.map(obj =>
            obj.wafi_id === building.wafi_obj_id
              ? { ...obj, wafi_level: levelToSet }
              : obj
          );
          return updatedData;
        });
      }
    });

    // Perbarui state editedBuildings
    setEditedBuildings(updatedEditedBuildings);
  };

  const handleSaveChanges = async () => {
    if (Object.keys(editedBuildings).length === 0) {
      return; // Tidak ada perubahan untuk disimpan
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Menyiapkan array pembaruan
      const updates = Object.entries(editedBuildings).map(([objectId, level]) => ({
        objectId,
        level
      }));

      // Memanggil API pembaruan batch
      await Promise.all(updates.map(update =>
        objectAPI.updateObjectLevel(update.objectId, update.level)
      ));

      setSaveSuccess(true);
      setEditedBuildings({}); // Membersihkan bangunan yang diedit setelah berhasil disimpan

      // Menampilkan pesan sukses sebentar sebelum mengalihkan
      setTimeout(() => {
        navigate(`/base/${id}`);
      }, 1500);
    } catch (err) {
      console.error("Error saat menyimpan perubahan:", err);
      setError("Gagal menyimpan perubahan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Fungsi filter untuk pencarian
  const getFilteredBuildingsForTab = (tabName) => {
    if (!processedObjectData || !processedObjectData[tabName]) {
      return {};
    }

    if (!searchTerm) {
      return processedObjectData[tabName];
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = {};

    Object.entries(processedObjectData[tabName]).forEach(([buildingName, buildings]) => {
      if (buildingName.toLowerCase().includes(searchLower)) {
        filtered[buildingName] = buildings;
      }
    });

    return filtered;
  };

  // Mendapatkan bangunan untuk tab saat ini
  const getCurrentTabBuildings = () => {
    if (!processedObjectData) return {};

    switch (activeTab) {
      case "defenses": return getFilteredBuildingsForTab("Defenses");
      case "traps": return getFilteredBuildingsForTab("Traps");
      case "resources": return getFilteredBuildingsForTab("Resources");
      case "army": return getFilteredBuildingsForTab("Army");
      default: return {};
    }
  };

  // Status loading - ditampilkan saat data sedang dimuat
  if (isLoading) {
    return (
      <div className="my-20 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/base/${id}`)}
            className="flex items-center gap-2 text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Kembali</span>
          </button>
        </div>
        <div className="text-center py-10">
          <FontAwesomeIcon icon={faSpinner} spin className="text-white text-4xl mb-4" />
          <p>Memuat data base...</p>
        </div>
      </div>
    );
  }

  // Status error - ditampilkan jika terjadi kesalahan saat mengambil data
  if (error) {
    return (
      <div className="my-20 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/base/${id}`)}
            className="flex items-center gap-2 text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Kembali</span>
          </button>
        </div>
        <div className="text-center py-10">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 text-4xl mb-4" />
          <h2 className="text-xl font-bold">Error Saat Memuat Data</h2>
          <p className="text-white/70 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-22 sm:my-26 p-4 bg-white/10 rounded-lg border border-white/20 text-white">
      {/* Header dengan tombol kembali dan tombol simpan perubahan */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/base/${id}`)}
          className="flex items-center gap-2 text-white/70 hover:text-white"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Kembali ke Base</span>
        </button>

        <button
          onClick={handleSaveChanges}
          disabled={Object.keys(editedBuildings).length === 0 || isSaving}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg ${Object.keys(editedBuildings).length === 0 || isSaving
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {isSaving ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} />
              <span>Simpan Perubahan{Object.keys(editedBuildings).length > 0 ? ` (${Object.keys(editedBuildings).length})` : ''}</span>
            </>
          )}
        </button>
      </div>

      {/* Informasi base */}
      {base && (
        <div className="mb-6 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-white">
          <div className="flex items-center">
            <div className="mr-3">
              <img
                src={`${import.meta.env.VITE_ASSETS_URL}/th/th-${base.wafi_th_level}.png`}
                alt={`Clash of Clans TH-${base.wafi_th_level}`}
                className="w-12 h-12"
              />
            </div>
            <div>
              <h2 className="font-bold text-xl">{base.wafi_name}</h2>
              <p className="text-sm text-white/70">#{base.wafi_tag} • TH{base.wafi_th_level}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pesan sukses - ditampilkan setelah perubahan berhasil disimpan */}
      {saveSuccess && (
        <div className="bg-green-500/20 text-green-400 p-4 rounded-lg mb-4 flex items-center">
          <FontAwesomeIcon icon={faCheck} className="mr-2" />
          <span>Perubahan berhasil disimpan! Mengalihkan ke halaman base...</span>
        </div>
      )}

      {/* Kotak pencarian untuk memfilter bangunan */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FontAwesomeIcon icon={faSearch} className="text-white/50" />
        </div>
        <input
          type="text"
          placeholder="Cari bangunan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white/10 border border-white/20 text-white rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* Navigasi Tab */}
      <div className="flex space-x-1 mb-6 bg-white/5 p-1 rounded-lg overflow-x-auto">
        {Object.entries(TABS).map(([key, tab]) => {
          // Hanya tampilkan tab jika persyaratan level TH terpenuhi
          if (base && tab.minTH > base.wafi_th_level) return null;

          return (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className={`flex items-center gap-2 justify-center px-3 py-2 rounded-md transition-all ${activeTab === key
                ? "bg-yellow-400 text-gray-900 font-medium"
                : "hover:bg-white/10 text-white/70 hover:text-white"
                }`}
              data-tooltip-id="tab-tooltip"
              data-tooltip-content={tab.name}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-lg" />
              <span className="hidden lg:block">{tab.name}</span>
            </button>
          );
        })}

        <Tooltip id="tab-tooltip" className="z-50" />
      </div>

      {/* Tombol untuk mengatur semua bangunan di kategori saat ini ke level 0 atau level maksimum */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleSetAllInCategory('min')}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Set All to 0
        </button>
        <button
          onClick={() => handleSetAllInCategory('max')}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Set All to Max
        </button>
      </div>

      {/* Grid Bangunan - Tampilan utama untuk mengedit level bangunan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(getCurrentTabBuildings()).map(([buildingName, buildings]) => {
          // Mendapatkan gambar bangunan

          const normalizedName = buildingName
            .toLowerCase()
            .replace(/[']/g, '')
            .replace(/\s+/g, '-');
          const maxLevel = buildings[0]?.wafi_max_level_th || 1;
          let buildingImageSrc = `${urlAssets}/${normalizedName}/${normalizedName}-${maxLevel}.png`;
          if (buildingName === 'Town Hall Weapon') {
            buildingImageSrc = `${urlAssets}/th/th-${base.wafi_th_level}-${maxLevel}.png`;
          }
          // Mendapatkan jenis biaya untuk kode warna
          const costType = buildings[0]?.wafi_cost_type || 'gold';

          return (
            <div key={buildingName} className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
              {/* Header kartu bangunan */}
              <div className="bg-white/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={buildingImageSrc}
                    alt={buildingName}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-white">{buildingName}</h3>
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <CocIcon iconName={costType} />
                      <span>Level Maksimal: {maxLevel}</span>
                    </div>
                  </div>
                </div>
                <span className="bg-white/10 px-2 py-1 rounded text-xs">
                  {buildings.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <button
                  onClick={() => handleBulkLevelUpdate(buildings, 0)}
                  className="px-3 py-2 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 transition-colors"
                >
                  0
                </button>
                {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
                  <button
                    key={level}
                    onClick={() => handleBulkLevelUpdate(buildings, level)}
                    className="px-3 py-2 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {level}
                  </button>
                ))}
              </div>
              {/* Daftar instance bangunan dengan kontrol level */}
              <div className="p-3 space-y-3">
                {buildings.map((building, idx) => {
                  const isEdited = editedBuildings[building.wafi_obj_id] !== undefined;
                  return (
                    <div key={idx} className={`flex items-center justify-between p-2 rounded ${isEdited ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                      <BuildingImage
                        size={"w-10 h-10"}
                        src={buildingName === "Town Hall Weapon" ? `${urlAssets}/th/th-${base.wafi_th_level}-${building.wafi_level === 0 ? 1 : building.wafi_level}.png` : getBuildingImageUrl(buildingName, building.wafi_level || 1)}
                        alt={`${buildingName} Lv.${building.wafi_level}`}
                      />

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {/* Kontrol slider untuk menyesuaikan level */}
                          <input
                            type="range"
                            min="0"
                            max={building.wafi_max_level_th}
                            value={building.wafi_level || 0}
                            onChange={(e) => handleUpdateLevel(building.wafi_obj_id, parseInt(e.target.value, 10))}
                            className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                          />

                          {/* Input numerik untuk entri langsung */}
                          <input
                            type="number"
                            min="0"
                            max={building.wafi_max_level_th}
                            value={building.wafi_level || 0}
                            onChange={(e) => handleInputChange(building.wafi_obj_id, e.target.value)}
                            className={`w-12 h-7 text-center font-medium rounded bg-white/20 border border-white/30 focus:outline-none focus:ring-1 focus:ring-yellow-400 ${isEdited ? 'text-yellow-400 border-yellow-400' : 'text-white'}`}
                          />
                        </div>

                        {/* Tampilkan level maksimal */}
                        <div className="text-xs text-white/60">
                          / {building.wafi_max_level_th}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tombol simpan mengambang untuk akses mudah - muncul saat ada perubahan */}
      {Object.keys(editedBuildings).length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full shadow-lg flex items-center gap-2 transition-colors"
          >
            {isSaving ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            <span>Simpan {Object.keys(editedBuildings).length} Perubahan</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BaseEdit;
