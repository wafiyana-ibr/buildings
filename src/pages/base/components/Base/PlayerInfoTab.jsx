import React, { useEffect, useState } from 'react'
import getLeagueName from '@/helpers/getLeagueName'
import getLeagueIcon from '@/helpers/getLeagueIcon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tooltip'
import LoadingState from '@/components/base/LoadingState'
const PlayerInfoTab = ({ playerData }) => {

  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {

    if (!playerData) {
      setIsLoading(true)
      return
    }
    setIsLoading(false)
  }, [playerData]);

  return (
    <>
      <div className="p-6 mb-6 rounded-xl border border-white/40">
        {!playerData  && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-white text-center">
            <p>Sorry, API Clash of Clans Developer is Busy Now</p>
          </div>
        )}
        {isLoading ? <LoadingState /> : (

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} />
              Player Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center flex-wrap gap-4 bg-white/5 rounded-xl p-4 border border-white/10 shadow-inner">
                <div className="relative">
                  <img
                    src={`${import.meta.env.VITE_ASSETS_URL}/th/th-${playerData.townHallLevel}${playerData?.townHallWeaponLevel && playerData.townHallWeaponLevel !== 1 ? `-${playerData.townHallWeaponLevel}` : ""}.png`}
                    alt={`TH ${playerData.townHallLevel}`}
                    className="w-20 h-20 rounded-lg shadow-md"
                    data-tooltip-id="player-tooltip"
                    data-tooltip-content={`Town Hall Level ${playerData.townHallLevel}${playerData.townHallWeaponLevel > 0 ? ` with Weapon Level ${playerData.townHallWeaponLevel}` : ""}`}
                  />
                  <span
                    className="absolute -bottom-2 -right-2 px-2 py-0.5 text-xs font-bold bg-gray-900/80 text-white rounded-full border border-white/20"
                    data-tooltip-id="player-tooltip"
                    data-tooltip-content={`Town Hall Level ${playerData.townHallLevel}${playerData.townHallWeaponLevel > 0 ? ` with Weapon Level ${playerData.townHallWeaponLevel}` : ""}`}
                  >
                    TH {playerData.townHallLevel}
                    {playerData.townHallWeaponLevel > 0 && (
                      <span className="ml-1 font-normal text-yellow-400">
                        Lv.{playerData.townHallWeaponLevel}
                      </span>
                    )}
                  </span>
                </div>

                <div>
                  {/* Player Name and id */}
                  <div className="flex items-center gap-2">
                    <h1
                      className="font-bold text-2xl"
                      data-tooltip-id="player-tooltip"
                      data-tooltip-content="Player Name"
                    >{playerData.name}</h1>
                    <div
                      className="relative p-1 rounded-full bg-blue-400/70 border border-blue-500/50"
                      data-tooltip-id="player-tooltip"
                      data-tooltip-content={`Experience Level ${playerData.expLevel}`}
                    >
                      <img
                        src={`${import.meta.env.VITE_ASSETS_URL}/xp/xp.png`}
                        alt="XP Level"
                        className="w-8 h-8"
                      />
                      <span
                        className="absolute inset-0 flex items-center justify-center font-medium font-clash-regular! text-xs"
                        style={{
                          textShadow:
                            "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                        }}
                      >
                        {playerData.expLevel}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-xs text-white/70 font-mono"
                    data-tooltip-id="player-tooltip"
                    data-tooltip-content="Player Tag (Unique Identifier)"
                  >{playerData.tag}</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* LABELS */}
                    {playerData.labels.map((label, index) => (
                      <span
                        key={label.id}
                        className={`flex items-center gap-2 rounded-xl px-2 py-1 text-sm text-white hover:scale-105 transition-transform border 
        ${index % 5 === 0
                            ? "bg-purple-600/30 border-purple-500/30"
                            : index % 5 === 1
                              ? "bg-teal-600/30 border-teal-400/30"
                              : index % 5 === 2
                                ? "bg-yellow-600/30 border-yellow-400/30"
                                : index % 5 === 3
                                  ? "bg-rose-600/30 border-rose-400/30"
                                  : "bg-blue-600/30 border-blue-400/30"
                          }`}
                        data-tooltip-id="player-tooltip"
                        data-tooltip-content={`Player Label: ${label.name}`}
                      >
                        <img
                          src={label.icon.url}
                          alt={label.name}
                          className="w-6 h-6 border border-white/30 rounded-md p-0.5 bg-black/30"
                        />
                        <span className="hidden sm:inline">{label.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clan Info - Right Side */}
              <div className="flex flex-wrap items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10 shadow-inner">
                <div className="relative ">
                  <img
                    src={playerData?.clan?.badge?.url ?? `${import.meta.env.VITE_ASSETS_URL}/noclan/noclan.png`}
                    alt={playerData?.clan?.name ?? "No Clan"}
                    className="w-20 h-20 shadow-md rounded-lg p-1"
                    data-tooltip-id="player-tooltip"
                    data-tooltip-content={playerData?.clan ? `Clan Badge: ${playerData.clan.name}` : "Player is not in a clan"}
                  />
                  {playerData?.clan && (<span
                    className="absolute -bottom-2 -right-2 px-2 py-0.5 text-xs font-bold bg-gray-900/80 text-white rounded-full border border-white/20"
                    data-tooltip-id="player-tooltip"
                    data-tooltip-content={`Clan Level ${playerData.clan.level}`}
                  >
                    <span className="ml-1 font-bold">
                      Lv.{playerData.clan.level}
                    </span>
                  </span>)}
                </div>

                <div className="flex flex-col">
                  {playerData.clan ? (
                    <>
                      <div className="flex gap-2 items-center">
                        <h2
                          className="font-bold text-xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
                          data-tooltip-id="player-tooltip"
                          data-tooltip-content="Clan Name"
                        >{playerData.clan.name}</h2>
                      </div>
                      <span
                        className="text-xs text-white/70 font-mono"
                        data-tooltip-id="player-tooltip"
                        data-tooltip-content="Clan Tag (Unique Identifier)"
                      >{playerData.clan.tag}</span>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Role */}
                        <span
                          className="flex items-center gap-2 rounded-full px-2.5 py-1 text-sm text-white hover:scale-105 transition-transform bg-purple-600/30 border border-purple-500/30"
                          data-tooltip-id="player-tooltip"
                          data-tooltip-content={`Player's role in the clan`}
                        >
                          As {playerData.role.toLowerCase().replace(playerData.role[0], playerData.role[0].toUpperCase())}
                        </span>

                        {/* Donations */}
                        <div
                          className="flex items-center gap-2 px-2.5 py-1 text-sm text-white bg-green-600/30 border border-green-500/30 rounded-full hover:scale-105 transition-transform"
                          data-tooltip-id="player-tooltip"
                          data-tooltip-content={`Troops donated this season: ${playerData.donations}`}
                        >
                          <img className="w-4 h-4" src={`${import.meta.env.VITE_ASSETS_URL}/cc/cc.png`} alt="Clan Castle" />
                          {playerData.donations}
                        </div>

                        {/* Received */}
                        <div
                          className="flex items-center gap-2 px-2.5 py-1 text-sm text-white bg-rose-600/30 border border-rose-500/30 rounded-full hover:scale-105 transition-transform"
                          data-tooltip-id="player-tooltip"
                          data-tooltip-content={`Troops received this season: ${playerData.received}`}
                        >
                          📥 {playerData.received}
                        </div>

                        {/* Capital Gold */}
                        <span
                          className="flex items-center gap-2 px-2.5 py-1 text-sm text-white bg-amber-600/30 border border-amber-500/30 rounded-full hover:scale-105 transition-transform"
                          data-tooltip-id="player-tooltip"
                          data-tooltip-content={`Total Capital Gold contributed: ${playerData.clanCapitalContributions}`}
                        >
                          <img className="w-4 h-4" src={`${import.meta.env.VITE_ASSETS_URL}/goldcapital/goldcapital.png`} alt="Capital Gold" />
                          {playerData.clanCapitalContributions}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-white/70 text-lg font-medium">No Clan</span>
                      <span className="text-white/50 text-xs mt-1">Player is not in a clan</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr className="my-4 border-white/50" />

            {/* Combined Colorful Statistics & Donations */}
            <div className="flex flex-col gap-3">
              <h3 className="text-white/80 font-semibold text-sm uppercase tracking-wider px-1">Player Statistics</h3>
              <div className="flex flex-wrap gap-2">
                {/* Trophy Stats - Blue Theme */}
                <span
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-white hover:scale-105 transition-transform border bg-blue-600/30 border-blue-500/30"
                  data-tooltip-id="player-tooltip"
                  data-tooltip-content={`Current League: ${playerData.league.name} (${playerData.trophies} trophies)`}
                >
                  <img
                    className="w-6 h-6"
                    src={playerData.league.icon.url}
                    alt={playerData.league.name}
                  />
                  Current: {playerData.trophies}
                  <img
                    className="w-5 h-5"
                    src={`${import.meta.env.VITE_ASSETS_URL}/trophy/trophy.png`}
                    alt="Trophy Clash of clans"
                  />
                </span>

                <span
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-white hover:scale-105 transition-transform border bg-indigo-600/30 border-indigo-500/30"
                  data-tooltip-id="player-tooltip"
                  data-tooltip-content={`Best League: ${getLeagueName(playerData.bestTrophies)} (${playerData.bestTrophies} trophies)`}
                >
                  <img
                    className="w-6 h-6"
                    src={getLeagueIcon(playerData.bestTrophies)}
                    alt={getLeagueName(playerData.bestTrophies)}
                  />
                  Best: {playerData.bestTrophies}
                  <img
                    className="w-5 h-5"
                    src={`${import.meta.env.VITE_ASSETS_URL}/trophy/trophy.png`}
                    alt="Trophy Clash of clans"
                  />
                </span>

                {/* Battle Stats - Red/Green Theme */}
                <span
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-white hover:scale-105 transition-transform border bg-red-600/30 border-red-500/30"
                  data-tooltip-id="player-tooltip"
                  data-tooltip-content={`Attack wins this season: ${playerData.attackWins}`}
                >
                  ⚔️ Att Won: {playerData.attackWins}
                </span>

                <span
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-white hover:scale-105 transition-transform border bg-green-600/30 border-green-500/30"
                  data-tooltip-id="player-tooltip"
                  data-tooltip-content={`Defense wins this season: ${playerData.defenseWins}`}
                >
                  🛡️ Def Won: {playerData.defenseWins}
                </span>

                {/* War Stats - Yellow Theme */}
                <span
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-white hover:scale-105 transition-transform border bg-yellow-600/30 border-yellow-500/30"
                  data-tooltip-id="player-tooltip"
                  data-tooltip-content={`Total stars earned in wars: ${playerData.warStars}`}
                >
                  <span className="font-semibold text-yellow-400">⭐</span>
                  War Stars: {playerData.warStars}
                </span>

                <span
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-white hover:scale-105 transition-transform border ${playerData.warOptedIn ? 'bg-lime-600/30 border-lime-500/30' : 'bg-rose-600/30 border-rose-500/30'}`}
                  data-tooltip-id="player-tooltip"
                  data-tooltip-content={playerData.warOptedIn ? "Player is set to participate in clan wars" : "Player is set to not participate in clan wars"}
                >
                  <FontAwesomeIcon icon={faGear} className={`text-${playerData.warOptedIn ? 'lime-400' : 'red-400'}`} />
                  War: {playerData.warOptedIn ? "Opted In" : "Opted Out"}
                </span>
              </div>
            </div>
          </div>)}
      </div>
      <Tooltip id="player-tooltip" className="z-50 max-w-xs" />
    </>
  )
}

export default PlayerInfoTab;