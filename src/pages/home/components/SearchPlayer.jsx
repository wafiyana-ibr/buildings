import React, { useState, useRef } from "react";
import { getPlayer } from "../../../api/cocAPI";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faUser, faStar, faArrowUp, faGem, faUsers, faSearch, faHistory } from "@fortawesome/free-solid-svg-icons";
import { baseAPI } from "../../../api/dbAPI";
import { useAuth } from "../../../hooks/useAuth";
import SearchClan from "./SearchClan";
import getTownhallIcon from "@/helpers/getTownhallIcon";
import getLeagueIcon from "@/helpers/getLeagueIcon";

const SearchPlayer = () => {
  const [activeTab, setActiveTab] = useState("player");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [error, setError] = useState(null);
  const [playerHistories, setPlayerHistories] = useState(() => {
    return JSON.parse(localStorage.getItem("playerHistories")) || [];
  });
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setError(null);
    setPlayerData(null);
    setIsLoading(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (value.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        handleSearchSubmit(value);
      }, 100);
    } else {
      setPlayerData(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = async (value) => {
    setIsLoading(true);
    setPlayerData(null);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const data = await getPlayer(
        value,
        abortControllerRef.current.signal
      );
      setPlayerData(data);
      setPlayerHistories((prev) => {
        const newHistory = [...prev];
        if (!newHistory.find((p) => p.tag === data.tag)) {
          if (newHistory.length >= 3) {
            newHistory.pop();
          }
          newHistory.unshift({ name: data.name, tag: data.tag });
          localStorage.setItem("playerHistories", JSON.stringify(newHistory));
        }
        return newHistory;
      });
    } catch (err) {
      if (err.name === "AbortError") {
        setIsLoading(false);
        return;
      }
      console.error("API Error:", err);

      if (err.response) {
        if (err.response.status === 404) {
          setError("Player not found. Please ensure the player tag is correct.");
          setPlayerData(null);
        } else if (err.response.status === 403) {
          setError("Access denied. The API key might be invalid.");
        } else {
          setError(
            `Error: ${err.response.status} - ${err.response.data?.message || "An error occurred"
            }`
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBase = async () => {
    // Check the town hall level before proceeding
    if (playerData.townHallLevel <= 2 || playerData.townHallLevel >= 16) {
      setError("Sorry, we currently only support Town Hall levels 3 to 15.");
      return;
    }

    if (!user) {
      // Store player data in localStorage before redirecting
      localStorage.setItem("pendingBaseAdd", JSON.stringify({
        tag: playerData.tag,
        name: playerData.name || 'Unnamed Base',
        townHallLevel: playerData.townHallLevel || 1
      }));

      navigate("/sign-in", {
        state: {
          redirectUrl: "/base",
          message: "Please log in first to add a base",
          pendingBaseAdd: true
        }
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await baseAPI.findOrSaveBase(user.id, {
        tag: playerData.tag,
        name: playerData.name || 'Unnamed Base',
        townHallLevel: playerData.townHallLevel || 1
      });
      navigate("/base");
    } catch (error) {
      console.error("Error managing base:", error);
      setError(`Failed to add or update base: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = (tag) => {
    setPlayerHistories((prev) => {
      const newHistory = prev.filter((p) => p.tag !== tag);
      localStorage.setItem("playerHistories", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto">
      {/* Tab Buttons */}
      <div className="flex mb-6 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        <button
          className={`flex-1 py-3.5 text-center font-medium transition-all duration-300 ${activeTab === "player"
              ? "bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-white"
              : "text-white/70 hover:bg-white/10"
            }`}
          onClick={() => handleTabChange("player")}
        >
          <span className="flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faUser} />
            Search Players
          </span>
        </button>
        <button
          className={`flex-1 py-3.5 text-center font-medium transition-all duration-300 ${activeTab === "clan"
              ? "bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-white"
              : "text-white/70 hover:bg-white/10"
            }`}
          onClick={() => handleTabChange("clan")}
        >
          <span className="flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faUsers} />
            Search Clans
          </span>
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "player" ? (
        <>
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl flex items-center border border-white/20 relative overflow-hidden group transition-all focus-within:border-yellow-400/50 focus-within:shadow-md focus-within:shadow-yellow-400/20">
            <FontAwesomeIcon icon={faSearch} className="text-yellow-400 text-lg ml-4" />
            <input
              value={search}
              onChange={handleSearchChange}
              type="text"
              placeholder="Enter Player Tag (e.g., #ABC123XYZ)"
              className="w-full bg-transparent text-white placeholder-white/70 outline-none px-4 py-3.5"
            />
            {search && (
              <button
                className="absolute right-4 text-white/50 hover:text-white/80 transition-colors"
                onClick={() => {
                  setSearch("");
                }}
              >
                <FontAwesomeIcon
                  icon={faCircleXmark}
                  className="text-xl"
                />
              </button>
            )}
          </div>

          {playerHistories.length > 0 && (
            <div className="mt-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl p-5 border border-white/20 text-white relative">
              <div className="absolute -top-3 left-3 rounded-full px-3 py-1 text-xs bg-yellow-500 text-gray-900 font-semibold flex items-center gap-1">
                <FontAwesomeIcon icon={faHistory} />
                Search History
              </div>

              <div className="flex flex-wrap gap-3 mt-2">
                {playerHistories.map((playerHistory, index) => (
                  <div className="relative group/item" key={index}>
                    <button
                      key={playerHistory.tag}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg px-3 py-2 transition-all duration-300 flex flex-col items-start hover:border-yellow-400/30"
                      onClick={() => {
                        setSearch(playerHistory.tag);
                        handleSearchSubmit(playerHistory.tag);
                      }}
                    >
                      <span className="font-semibold text-yellow-400">{playerHistory.name}</span>
                      <span className="text-xs text-white/60">{playerHistory.tag}</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteHistory(playerHistory.tag);
                      }}
                      className="absolute -top-2 -right-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"
                    >
                      <FontAwesomeIcon
                        icon={faCircleXmark}
                        className="text-lg text-red-400 bg-gray-900 rounded-full p-0.5"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="mt-6 py-4 flex justify-center items-center bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-t-2 border-r-2 border-yellow-400 rounded-full animate-spin"></div>
                <span className="text-white/80">Searching for player...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-gradient-to-r from-red-500/10 to-red-500/5 backdrop-blur-md rounded-xl p-4 border border-red-500/20 text-white">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {playerData && (
            <div className="mt-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 text-white transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  {/* Town Hall Image */}
                  <div className="relative">
                    <div className="p-1 bg-white/10 rounded-lg border border-white/20">
                      <img
                        src={getTownhallIcon(playerData.townHallLevel || 1)}
                        alt={`TH${playerData.townHallLevel || 1}`}
                        className="w-16 h-16"
                      />
                    </div>
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 text-xs font-bold bg-gray-900/80 text-white rounded-full border border-white/20">
                      TH {playerData.townHallLevel}
                    </span>
                  </div>

                  <div className="min-w-0">
                    {/* Player Name with Experience Level */}
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold truncate">{playerData.name}</h2>
                      {/* League Icon with tooltip */}
                      <div className="flex items-center gap-1">
                        <img
                          src={playerData.league ? playerData.league.icon.url : getLeagueIcon(playerData.trophies)}
                          alt={playerData.league ? playerData.league.name : "League"}
                          className="w-6 h-6"
                          title={playerData.league ? playerData.league.name : "League"}
                        />
                      </div>
                    </div>

                    {/* Player tag and exp level */}
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <span className="text-white/70 truncate">{playerData.tag}</span>
                      <div className="relative p-1 rounded-full bg-blue-400/70 border border-blue-500/50" title="Experience Level">
                        <img
                          src={`${import.meta.env.VITE_ASSETS_URL}/xp/xp.png`}
                          alt="XP Level"
                          className="w-5 h-5"
                        />
                        <span className="absolute inset-0 flex items-center justify-center font-medium text-xs"
                          style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
                          {playerData.expLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Base Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={handleAddBase}
                    className={`btn ${playerData.townHallLevel <= 2 || playerData.townHallLevel >= 16
                        ? "bg-gray-600/80 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      } text-white py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-md transition-all duration-300 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    disabled={isLoading || playerData.townHallLevel <= 2 || playerData.townHallLevel >= 16}
                    title={
                      playerData.townHallLevel <= 2 || playerData.townHallLevel >= 16
                        ? "Unsupported Town Hall level (3-15 only)"
                        : ""
                    }
                  >
                    <FontAwesomeIcon icon={faUser} />
                    {isLoading
                      ? "Saving..."
                      : playerData.townHallLevel <= 2 || playerData.townHallLevel >= 16
                        ? "Unsupported TH Level"
                        : user
                          ? "Add Base"
                          : "Sign in to Add Base"
                    }
                  </button>
                </div>
              </div>

              {/* Add a warning message when TH level is not supported */}
              {(playerData.townHallLevel <= 2 || playerData.townHallLevel >= 16) && (
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-400 text-sm text-center">
                  Sorry, we currently only support Town Hall levels 3 to 15.
                </div>
              )}

              {/* Stats Section */}
              <div className="mt-6 grid grid-cols-1 gap-4">
                <h3 className="text-white/90 font-semibold text-sm uppercase tracking-wider px-1 flex items-center">
                  <span className="w-8 h-0.5 bg-yellow-400/50 mr-2"></span>
                  Player Statistics
                </h3>

                {/* Colorful Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Trophy Stats */}
                  <div className="flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-white bg-gradient-to-br from-blue-600/30 to-blue-800/20 border border-blue-500/30 hover:from-blue-600/40 hover:to-blue-800/30 transition-colors">
                    <img
                      className="w-7 h-7 mb-1"
                      src={`${import.meta.env.VITE_ASSETS_URL}/trophy/trophy.png`}
                      alt="Trophy"
                    />
                    <span className="font-semibold">{playerData.trophies}</span>
                    <span className="text-xs text-white/70">Trophies</span>
                  </div>

                  {/* Best Trophies */}
                  <div className="flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-white bg-gradient-to-br from-indigo-600/30 to-indigo-800/20 border border-indigo-500/30 hover:from-indigo-600/40 hover:to-indigo-800/30 transition-colors">
                    <FontAwesomeIcon icon={faArrowUp} className="text-indigo-300 text-xl mb-1" />
                    <span className="font-semibold">{playerData.bestTrophies}</span>
                    <span className="text-xs text-white/70">Best Trophies</span>
                  </div>

                  {/* War Stars */}
                  <div className="flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-white bg-gradient-to-br from-yellow-600/30 to-yellow-800/20 border border-yellow-500/30 hover:from-yellow-600/40 hover:to-yellow-800/30 transition-colors">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xl mb-1" />
                    <span className="font-semibold">{playerData.warStars}</span>
                    <span className="text-xs text-white/70">War Stars</span>
                  </div>

                  {/* Attack Wins */}
                  <div className="flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-white bg-gradient-to-br from-red-600/30 to-red-800/20 border border-red-500/30 hover:from-red-600/40 hover:to-red-800/30 transition-colors">
                    <FontAwesomeIcon icon={faGem} className="text-red-400 text-xl mb-1" />
                    <span className="font-semibold">{playerData.attackWins || 0}</span>
                    <span className="text-xs text-white/70">Attack Wins</span>
                  </div>
                </div>

                {/* Clan Info */}
                {playerData.clan && (
                  <div className="mt-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <img
                        src={playerData.clan.badge.url}
                        alt={playerData.clan.name}
                        className="w-12 h-12"
                      />
                      <div>
                        <div className="font-semibold text-lg">{playerData.clan.name}</div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-white/70">{playerData.clan.tag}</span>
                          {playerData.clan.clanLevel && (
                            <span className="bg-purple-500/30 text-white rounded-full px-2 py-0.5 text-xs font-medium">
                              Level {playerData.clan.clanLevel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <SearchClan />
      )}
    </div>
  );
};

export default SearchPlayer;
