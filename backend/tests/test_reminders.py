from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.models.ministre import MINISTRE_PARAMETRAGE_ID, MinistreParametrage
from app.models.plan_action import Activite, Objectif
from app.models.tache import NotificationEmail, Tache, TacheStatut
from app.services.email_service import build_activite_retard_email
from app.services.reminder_service import check_activite_delays_and_notify


@pytest.mark.asyncio
async def test_build_activite_retard_email_lists_pending_tasks():
    sujet, texte, html = build_activite_retard_email(
        activite_code="PAO-001",
        activite_description="Sensibilisation MPME",
        date_fin="2026-03-31",
        taches_non_validees=[
            ("Atelier régional", "M. Diallo", "25"),
            ("Rapport trimestriel", "Mme Camara", "50"),
        ],
    )

    assert "PAO-001" in sujet
    assert "Atelier régional" in texte
    assert "Rapport trimestriel" in texte
    assert "BSD" in texte
    assert "Atelier régional" in html


@pytest.mark.asyncio
async def test_check_activite_delays_sends_to_ministre_and_directeur(db_session):
    objectif = Objectif(code="OC-RET", description="Objectif retard")
    db_session.add(objectif)
    await db_session.flush()

    activite = Activite(
        objectif_id=objectif.id,
        code="PAO-RET",
        description="Activité en retard test",
        date_fin=date.today() - timedelta(days=1),
        email_responsable="directeur@mipme.gov.gn",
        email_ministre="ministre@mipme.gov.gn",
    )
    db_session.add(activite)
    await db_session.flush()

    db_session.add(
        Tache(
            activite_id=activite.id,
            trimestre=1,
            annee=2026,
            description="Tâche non validée",
            responsable="Agent BSD",
            ponderation=Decimal("25"),
            statut=TacheStatut.EN_COURS,
        )
    )
    await db_session.commit()

    sent: list[dict] = []

    async def fake_send(destinataires, sujet, corps_texte, corps_html, *, cc=None):
        sent.append(
            {
                "to": destinataires if isinstance(destinataires, list) else [destinataires],
                "cc": cc or [],
                "sujet": sujet,
            }
        )
        assert "Tâche non validée" in corps_texte
        assert "BSD" in corps_texte
        return True

    with patch("app.services.reminder_service.get_bsd_cc_emails", return_value=["bsd@mipme.gov.gn"]):
        stats = await check_activite_delays_and_notify(
            db_session,
            today=date.today(),
            send_email_fn=fake_send,
        )

    assert stats["activites_notifiees"] == 1
    assert stats["emails_envoyes"] == 3
    assert len(sent) == 1
    assert set(sent[0]["to"]) == {
        "directeur@mipme.gov.gn",
        "ministre@mipme.gov.gn",
    }
    assert sent[0]["cc"] == ["bsd@mipme.gov.gn"]

    notifs = (
        await db_session.execute(
            select(NotificationEmail).where(NotificationEmail.activite_id == activite.id)
        )
    ).scalars().all()
    assert len(notifs) == 3
    assert sum(1 for n in notifs if n.en_copie) == 1


@pytest.mark.asyncio
async def test_check_activite_delays_skips_when_all_tasks_terminees(db_session):
    objectif = Objectif(code="OC-OK", description="Objectif OK")
    db_session.add(objectif)
    await db_session.flush()

    activite = Activite(
        objectif_id=objectif.id,
        code="PAO-OK",
        description="Activité terminée",
        date_fin=date.today() - timedelta(days=1),
        email_responsable="directeur@mipme.gov.gn",
        email_ministre="ministre@mipme.gov.gn",
    )
    db_session.add(activite)
    await db_session.flush()

    db_session.add(
        Tache(
            activite_id=activite.id,
            trimestre=1,
            annee=2026,
            description="Tâche validée",
            responsable="Agent BSD",
            ponderation=Decimal("100"),
            statut=TacheStatut.TERMINEE,
        )
    )
    await db_session.commit()

    async def fake_send(*args, **kwargs) -> bool:
        raise AssertionError("Aucun e-mail ne devrait être envoyé")

    stats = await check_activite_delays_and_notify(
        db_session,
        today=date.today(),
        send_email_fn=fake_send,
    )

    assert stats["activites_notifiees"] == 0
    assert stats["emails_envoyes"] == 0


@pytest.mark.asyncio
async def test_check_activite_delays_uses_ministre_parametrage_fallback(db_session):
    objectif = Objectif(code="OC-FB", description="Objectif fallback")
    db_session.add(objectif)
    await db_session.flush()

    activite = Activite(
        objectif_id=objectif.id,
        code="PAO-FB",
        description="Activité fallback ministre",
        date_fin=date.today() - timedelta(days=2),
        email_responsable="directeur@mipme.gov.gn",
    )
    db_session.add(activite)
    db_session.add(
        MinistreParametrage(
            id=MINISTRE_PARAMETRAGE_ID,
            prenom="Min",
            nom="Istre",
            email="ministre.param@mipme.gov.gn",
        )
    )
    await db_session.flush()

    db_session.add(
        Tache(
            activite_id=activite.id,
            trimestre=1,
            annee=2026,
            description="Tâche en attente",
            responsable="Agent BSD",
            ponderation=Decimal("30"),
            statut=TacheStatut.EN_RETARD,
        )
    )
    await db_session.commit()

    sent_to: list[str] = []

    async def fake_send(destinataires, sujet, corps_texte, corps_html, *, cc=None):
        to_list = destinataires if isinstance(destinataires, list) else [destinataires]
        sent_to.extend(to_list)
        return True

    stats = await check_activite_delays_and_notify(
        db_session,
        today=date.today(),
        send_email_fn=fake_send,
    )

    assert stats["activites_notifiees"] == 1
    assert "ministre.param@mipme.gov.gn" in sent_to


@pytest.mark.asyncio
async def test_check_activite_delays_does_not_resend_same_day(db_session):
    objectif = Objectif(code="OC-DUP", description="Objectif doublon")
    db_session.add(objectif)
    await db_session.flush()

    activite = Activite(
        objectif_id=objectif.id,
        code="PAO-DUP",
        description="Activité doublon",
        date_fin=date.today() - timedelta(days=1),
        email_responsable="directeur@mipme.gov.gn",
        email_ministre="ministre@mipme.gov.gn",
    )
    db_session.add(activite)
    await db_session.flush()

    db_session.add(
        Tache(
            activite_id=activite.id,
            trimestre=1,
            annee=2026,
            description="Tâche en cours",
            responsable="Agent BSD",
            ponderation=Decimal("40"),
            statut=TacheStatut.EN_COURS,
        )
    )
    await db_session.commit()

    calls = 0

    async def fake_send(*args, **kwargs) -> bool:
        nonlocal calls
        calls += 1
        return True

    await check_activite_delays_and_notify(
        db_session,
        today=date.today(),
        send_email_fn=fake_send,
    )
    await check_activite_delays_and_notify(
        db_session,
        today=date.today(),
        send_email_fn=fake_send,
    )

    assert calls == 1


@pytest.mark.asyncio
async def test_check_activite_delays_force_resends_same_day(db_session):
    objectif = Objectif(code="OC-FRC", description="Objectif force")
    db_session.add(objectif)
    await db_session.flush()

    activite = Activite(
        objectif_id=objectif.id,
        code="PAO-FRC",
        description="Activité force",
        date_fin=date.today() - timedelta(days=1),
        email_responsable="directeur@mipme.gov.gn",
        email_ministre="ministre@mipme.gov.gn",
    )
    db_session.add(activite)
    await db_session.flush()

    db_session.add(
        Tache(
            activite_id=activite.id,
            trimestre=1,
            annee=2026,
            description="Tâche en cours",
            responsable="Agent BSD",
            ponderation=Decimal("40"),
            statut=TacheStatut.EN_COURS,
        )
    )
    await db_session.commit()

    calls = 0

    async def fake_send(*args, **kwargs) -> bool:
        nonlocal calls
        calls += 1
        return True

    await check_activite_delays_and_notify(
        db_session,
        today=date.today(),
        send_email_fn=fake_send,
    )
    await check_activite_delays_and_notify(
        db_session,
        today=date.today(),
        force=True,
        send_email_fn=fake_send,
    )

    assert calls == 2


@pytest.mark.asyncio
async def test_notifications_api_list_and_trigger(client: AsyncClient, auth_headers: dict[str, str]):
    trigger = await client.post(
        "/api/v1/notifications/rappels-activites?force=true",
        headers=auth_headers,
    )
    assert trigger.status_code == 200
    assert "activites_notifiees" in trigger.json()

    listing = await client.get("/api/v1/notifications", headers=auth_headers)
    assert listing.status_code == 200
    assert isinstance(listing.json(), list)
