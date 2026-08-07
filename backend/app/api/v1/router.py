from fastapi import APIRouter

from app.api.v1 import (
    archive,
    auth,
    exports,
    health,
    indicateurs,
    missions,
    plan_action,
    planification,
    ppm,
    projets,
    recommandations,
    stats,
    suivi,
    users,
    workflow,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(plan_action.router, tags=["plan-action"])
api_router.include_router(planification.router, tags=["planification"])
api_router.include_router(suivi.router, tags=["suivi"])
api_router.include_router(recommandations.router, tags=["recommandations"])
api_router.include_router(missions.router, tags=["missions"])
api_router.include_router(ppm.router, tags=["ppm"])
api_router.include_router(projets.router, tags=["projets"])
api_router.include_router(indicateurs.router, tags=["indicateurs"])
api_router.include_router(stats.router, tags=["stats"])
api_router.include_router(exports.router, tags=["exports"])
api_router.include_router(archive.router, tags=["archive"])
api_router.include_router(workflow.router, tags=["workflow"])
