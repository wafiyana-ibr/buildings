const getLeagueIcon = (trophies) => {
    if (trophies >= 5000) return "http://localhost:3000/assets/league/legend.png";
    if (trophies >= 4700) return "http://localhost:3000/assets/league/titan_1.png";
    if (trophies >= 4400) return "http://localhost:3000/assets/league/titan_2.png";
    if (trophies >= 4100) return "http://localhost:3000/assets/league/titan_3.png";
    if (trophies >= 3800) return "http://localhost:3000/assets/league/champion_1.png";
    if (trophies >= 3500) return "http://localhost:3000/assets/league/champion_2.png";
    if (trophies >= 3200) return "http://localhost:3000/assets/league/champion_3.png";
    if (trophies >= 3000) return "http://localhost:3000/assets/league/master_1.png";
    if (trophies >= 2800) return "http://localhost:3000/assets/league/master_2.png";
    if (trophies >= 2600) return "http://localhost:3000/assets/league/master_3.png";
    if (trophies >= 2400) return "http://localhost:3000/assets/league/crystal_1.png";
    if (trophies >= 2200) return "http://localhost:3000/assets/league/crystal_2.png";
    if (trophies >= 2000) return "http://localhost:3000/assets/league/crystal_3.png";
    if (trophies >= 1800) return "http://localhost:3000/assets/league/gold_1.png";
    if (trophies >= 1600) return "http://localhost:3000/assets/league/gold_2.png";
    if (trophies >= 1400) return "http://localhost:3000/assets/league/gold_3.png";
    if (trophies >= 1200) return "http://localhost:3000/assets/league/silver_1.png";
    if (trophies >= 1000) return "http://localhost:3000/assets/league/silver_2.png";
    if (trophies >= 800) return "http://localhost:3000/assets/league/silver_3.png";
    if (trophies >= 600) return "http://localhost:3000/assets/league/bronze_1.png";
    if (trophies >= 500) return "http://localhost:3000/assets/league/bronze_2.png";
    if (trophies >= 400) return "http://localhost:3000/assets/league/bronze_3.png";
    if (trophies >= 0) return "http://localhost:3000/assets/league/unrank.png";
    return "http://localhost:3000/assets/league/unrank.png";
};

export default getLeagueIcon;