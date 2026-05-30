from fastapi import APIRouter, HTTPException
from app.services.geo_service import GeoService, region_cases

router = APIRouter()

@router.get("/regions")
async def get_regions():
    return {"regions": GeoService.get_all_regions()}

@router.get("/regions/{region}")
async def get_region(region: str):
    result = GeoService.get_region(region)
    if not result:
        raise HTTPException(status_code=404, detail=f"Region '{region}' non trouvee")
    return result

@router.get("/map")
async def get_map_data():
    """Données pour la carte épidémiologique — latitude/longitude + cas."""
    return {"points": GeoService.get_map_data()}

@router.get("/stats")
async def get_stats():
    return {
        "total_cases_tracked": sum(region_cases.values()),
        "regions_affected": len(set(k.split(":")[0] for k in region_cases)),
        "hotspots": region_cases
    }
