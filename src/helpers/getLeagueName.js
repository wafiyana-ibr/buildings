const getLeagueName = (trophies) => {
    if (trophies >= 5000) return "Legend League";
    if (trophies >= 4700) return "Titan League I";
    if (trophies >= 4400) return "Titan League II";
    if (trophies >= 4100) return "Titan League III";
    if (trophies >= 3800) return "Champion League I";
    if (trophies >= 3500) return "Champion League II";
    if (trophies >= 3200) return "Champion League III";
    if (trophies >= 3000) return "Master League I";
    if (trophies >= 2800) return "Master League II";
    if (trophies >= 2600) return "Master League III";
    if (trophies >= 2400) return "Crystal League I";
    if (trophies >= 2200) return "Crystal League II";
    if (trophies >= 2000) return "Crystal League III";
    if (trophies >= 1800) return "Gold League I";
    if (trophies >= 1600) return "Gold League II";
    if (trophies >= 1400) return "Gold League III";
    if (trophies >= 1200) return "Silver League I";
    if (trophies >= 1000) return "Silver League II";
    if (trophies >= 800) return "Silver League III";
    if (trophies >= 600) return "Bronze League I";
    if (trophies >= 500) return "Bronze League II";
    if (trophies >= 400) return "Bronze League III";
    if (trophies >= 0) return "Unranked";
    return "Unranked";
};

export default getLeagueName;
