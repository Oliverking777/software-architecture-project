import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Données géographiques du Cameroun
# Structure : region -> { district -> { lat, lon } }
GEO_DATA = {
    "littoral": {
        "douala 1":  {"lat": 4.0483, "lon": 9.7043, "population": 500000},
        "douala 2":  {"lat": 4.0500, "lon": 9.7200, "population": 450000},
        "douala 3":  {"lat": 4.0600, "lon": 9.7500, "population": 420000},
    },
    "centre": {
        "yaounde 1": {"lat": 3.8480, "lon": 11.5021, "population": 600000},
        "yaounde 2": {"lat": 3.8700, "lon": 11.5200, "population": 580000},
    },
    "nord": {
        "garoua":    {"lat": 9.3019, "lon": 13.3986, "population": 300000},
        "guider":    {"lat": 9.9333, "lon": 13.9500, "population": 120000},
    },
    "ouest": {
        "bafoussam": {"lat": 5.4781, "lon": 10.4176, "population": 350000},
        "bangangte": {"lat": 5.1500, "lon": 10.5200, "population": 80000},
    },
    "sud-ouest": {
        "buea":      {"lat": 4.1527, "lon": 9.2416, "population": 200000},
        "limbe":     {"lat": 4.0167, "lon": 9.2000, "population": 180000},
    },
    "adamaoua": {
        "ngaoundere": {"lat": 7.3167, "lon": 13.5833, "population": 250000},
    },
    "est": {
        "bertoua":   {"lat": 4.5833, "lon": 13.6833, "population": 150000},
    },
    "nord-ouest": {
        "bamenda":   {"lat": 5.9597, "lon": 10.1456, "population": 400000},
    },
    "sud": {
        "ebolowa":   {"lat": 2.9000, "lon": 11.1500, "population": 100000},
    },
    "extreme-nord": {
        "maroua":    {"lat": 10.5900, "lon": 14.3200, "population": 350000},
    },
}

# Compteurs de cas par région (alimentés par RabbitMQ)
region_cases: dict = {}

class GeoService:

    @staticmethod
    def get_all_regions():
        result = []
        for region, districts in GEO_DATA.items():
            total_cases = sum(
                region_cases.get(f"{region}:{d}", 0)
                for d in districts
            )
            result.append({
                "region": region,
                "districts": list(districts.keys()),
                "total_cases": total_cases,
                "coordinates": {
                    "lat": list(districts.values())[0]["lat"],
                    "lon": list(districts.values())[0]["lon"],
                }
            })
        return result

    @staticmethod
    def get_region(region: str):
        region = region.lower().strip()
        if region not in GEO_DATA:
            return None
        districts = GEO_DATA[region]
        result = []
        for district, info in districts.items():
            cases = region_cases.get(f"{region}:{district}", 0)
            result.append({
                "district": district,
                "latitude": info["lat"],
                "longitude": info["lon"],
                "population": info["population"],
                "cases": cases,
                "incidence_rate": round(cases / info["population"] * 100000, 2)
            })
        return {"region": region, "districts": result}

    @staticmethod
    def get_map_data():
        """Retourne les données pour la carte épidémiologique."""
        points = []
        for region, districts in GEO_DATA.items():
            for district, info in districts.items():
                cases = region_cases.get(f"{region}:{district}", 0)
                if cases > 0:
                    points.append({
                        "region": region,
                        "district": district,
                        "lat": info["lat"],
                        "lon": info["lon"],
                        "cases": cases,
                        "severity": "high" if cases >= 10 else "medium" if cases >= 5 else "low"
                    })
        return points

    @staticmethod
    def record_case(region: str, district: Optional[str] = None):
        region = region.lower().strip()
        district = (district or "").lower().strip()
        key = f"{region}:{district}" if district else region
        region_cases[key] = region_cases.get(key, 0) + 1
        logger.info(f"Cas enregistre : {key} -> {region_cases[key]}")
