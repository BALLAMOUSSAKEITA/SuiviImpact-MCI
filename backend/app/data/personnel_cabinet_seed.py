"""Données initiales du personnel — liste de présence Conseil de Cabinet (14.08.2026)."""

from __future__ import annotations

from typing import TypedDict


class PersonnelSeed(TypedDict):
    num_ordre: int
    nom_complet: str
    fonction: str
    contact: str | None
    email: str | None
    categorie: str


PERSONNEL_CABINET_SEED: list[PersonnelSeed] = [
    # Cabinet
    {"num_ordre": 1, "nom_complet": "Aboubacar KOUROUMA", "fonction": "Ministre", "contact": None, "email": "ministre.commerce@gouvernement.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 2, "nom_complet": "M. Bamba OLIANO", "fonction": "Secrétaire Général", "contact": "627 53 97 75", "email": "sg.commerce@gouvernement.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 3, "nom_complet": "Mme Bintou DOUNO", "fonction": "Secrétaire Générale", "contact": "664 22 29 59", "email": "sg.mipme@gouvernement.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 4, "nom_complet": "M Francis MASSOMA", "fonction": "Chef de Cabinet", "contact": "620 71 10 72", "email": "chefcab.commerce@gouvernement.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 5, "nom_complet": "M Abdoulaye DIALLO", "fonction": "Chef de Cabinet", "contact": "611 31 46 42", "email": "chefcabinet@mipme.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 6, "nom_complet": "M Samba BOKOUM", "fonction": "Conseiller Principal", "contact": "628 68 31 36", "email": "cpl@mic.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 7, "nom_complet": "Mme Koumba Madeleine MILLIMOUNO", "fonction": "Conseiller Juridique", "contact": "621 89 22 57", "email": "cjuriq@mic.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 8, "nom_complet": "M Ousmane Madany DIALLO", "fonction": "Conseiller Chargé des Questions Commerciales et de la Qualité", "contact": "621 79 30 61", "email": "ccommercial@mic.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 9, "nom_complet": "Mme Diana KOUYATE", "fonction": "Conseillère Chargée des PME et du Contenu Local", "contact": None, "email": "cpmecl@mic.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 10, "nom_complet": "M Ahmed Tahirou BANGOURA", "fonction": "Conseiller Chargé des Questions Industrielles", "contact": "610 21 94 86", "email": "ccqi@mic.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 11, "nom_complet": "M Mamadou DIALLO", "fonction": "Conseiller Chargé de Mission", "contact": "623 27 38 41", "email": "ccmission@mic.gov.gn", "categorie": "Cabinet"},
    {"num_ordre": 12, "nom_complet": "Mme Sougoulé Djéné KEIRA", "fonction": "Secrétaire Générale CCIAG", "contact": "620 71 74 35", "email": "sgchambre@mic.gov.gn", "categorie": "Cabinet"},
    # Directions nationales
    {"num_ordre": 15, "nom_complet": "M Mohamed TRAORE", "fonction": "Directeur National du Commerce Intérieur et de Concurrence (DNCIC)", "contact": "628 08 69 77", "email": "dncic@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 16, "nom_complet": "Mme Saran DIABY", "fonction": "Directrice Nationale Adjointe du Commerce Intérieur et de la Concurrence (DNA-CIC)", "contact": "620 88 45 00", "email": "dnacic@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 17, "nom_complet": "Mme Diaka KABA", "fonction": "Directrice Nationale du Commerce Extérieur et de la Compétitivité (DNCEC)", "contact": "623 79 40 07", "email": "dncec@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 18, "nom_complet": "Mme Kadiatou DEKA CAMARA", "fonction": "Directrice Nationale Adjointe du Commerce Extérieur et de la Compétitivité (DNA-CEC)", "contact": "622 90 62 63", "email": "dnacec@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 19, "nom_complet": "M Boubacar DIALLO", "fonction": "Directeur National de l'Industrie (DNI)", "contact": "628 06 64 68", "email": "dni@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 20, "nom_complet": "M Ibrahima Talibé CAMARA", "fonction": "Directeur National Adjoint de l'Industrie (DNAI)", "contact": "623 34 38 21", "email": "dnai@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 21, "nom_complet": "M Mamadou Diao DIALLO", "fonction": "Directeur National des PME et du Contenu local (DNPME-CL)", "contact": "627 48 64 32", "email": "dnpmecI@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 22, "nom_complet": "M Seydouba Camara", "fonction": "Directeur National Adjoint des PME et du Contenu local (DNAPME-CL)", "contact": "622 33 63 43", "email": "dnapmeci@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 23, "nom_complet": "Dr Tadé Karine DIALLO", "fonction": "Directrice Nationale de la Promotion du Secteur Privé (DNPSP)", "contact": "623 06 09 46", "email": "dnpsp@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 24, "nom_complet": "M Sanoussy KABA", "fonction": "Directeur National Adjoint de la Promotion du Secteur Privé (DNAPSP)", "contact": "628 11 31 13", "email": "dnapsp@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 25, "nom_complet": "M Mandjou KANTE", "fonction": "Directeur National du Partenariat Public et Privé (DNPPP)", "contact": "628 91 48 19", "email": "dnppp@mic.gov.gn", "categorie": "Directions nationales"},
    {"num_ordre": 26, "nom_complet": "M Gouraissy BARRY", "fonction": "Directeur National Adjoint du Partenariat Public Privé (DNAPPP)", "contact": "622 17 74 50", "email": "dnappp@mic.gov.gn", "categorie": "Directions nationales"},
    # Services rattachés
    {"num_ordre": 27, "nom_complet": "M Jean Claude TRAORE", "fonction": "Directeur Général DDI-DDE", "contact": "626 93 81 44", "email": "dgddie@mic.gov.gn", "categorie": "Services rattachés"},
    {"num_ordre": 28, "nom_complet": "M Fodé Mohamed FOFANA", "fonction": "Directeur Général Adjoint DDI-DDE", "contact": "624 62 90 79", "email": "dgasdie@mcipme.gov.gn", "categorie": "Services rattachés"},
    {"num_ordre": 29, "nom_complet": "M Bénoit DELAMOU", "fonction": "Directeur Général SPI", "contact": "623 30 70 62", "email": "dgspi@mcipme.gov.gn", "categorie": "Services rattachés"},
    {"num_ordre": 30, "nom_complet": "M Karim SANGARE", "fonction": "Directeur Général Adjoint SPI", "contact": "628 60 51 10", "email": "Karimsangare86@gmail.com", "categorie": "Services rattachés"},
    {"num_ordre": 31, "nom_complet": "Moussa KANE", "fonction": "Directeur Général ONCP", "contact": "620 18 19 50", "email": "dgoncp@mcipme.gov.gn", "categorie": "Services rattachés"},
    {"num_ordre": 32, "nom_complet": "Mamadou Aliou Tanou BAH", "fonction": "Directeur Général Adjoint ONCP", "contact": "621 09 51 46", "email": "dgaoncp@mcipme.gov.gn", "categorie": "Services rattachés"},
    {"num_ordre": 33, "nom_complet": "Mme Aissatou BARRY", "fonction": "Directrice Générale 3AE", "contact": "625 64 64 64", "email": "dg@3ae.gov.gn", "categorie": "Services rattachés"},
    {"num_ordre": 34, "nom_complet": "M Amadou Cherif HAIDARA", "fonction": "Directeur Général Adjoint 3AE", "contact": "620 25 38 83", "email": "dga@3ae.gov.gn", "categorie": "Services rattachés"},
    # Organismes publics autonomes
    {"num_ordre": 35, "nom_complet": "M Mohamed Kadiatou SYLLA", "fonction": "Directeur Général ONCQ", "contact": "628 52 75 36", "email": "dgoncq@mcipme.gov.gn", "categorie": "Organismes publics autonomes"},
    {"num_ordre": 36, "nom_complet": "M Kéléty TOURE", "fonction": "Directeur Général Adjoint ONCQ", "contact": "628 43 54 15", "email": "dgaoncq@mcipme.gov.gn", "categorie": "Organismes publics autonomes"},
    {"num_ordre": 37, "nom_complet": "M Djoumé SANGARE", "fonction": "Directeur Général IGNM", "contact": "622 32 46 30", "email": "djoumsanga@gmail.com", "categorie": "Organismes publics autonomes"},
    {"num_ordre": 39, "nom_complet": "M Pépé Pascale KOROPOGUI", "fonction": "Directeur Général Adjoint IGNM", "contact": "622 29 20 67", "email": "pepepascalk92@gmail.com", "categorie": "Organismes publics autonomes"},
    {"num_ordre": 40, "nom_complet": "M Djiba KEITA", "fonction": "Directeur Général CPTI", "contact": "625 69 78 92", "email": "djibacamira@gmail.com", "categorie": "Organismes publics autonomes"},
    {"num_ordre": 41, "nom_complet": "M Alhassane TOURE", "fonction": "Directeur Général Adjoint CPTI", "contact": "613 01 62 87", "email": "alhassanetoure907@gmail.com", "categorie": "Organismes publics autonomes"},
    {"num_ordre": 42, "nom_complet": "M Mamady DIOUBATE", "fonction": "Directeur Général FODIP", "contact": "623 87 91 76", "email": "dg@fodip.gov.gn", "categorie": "Organismes publics autonomes"},
    {"num_ordre": 43, "nom_complet": "M Mamadou BARRY", "fonction": "Directeur Général Adjoint FODIP", "contact": "622 23 53 94", "email": "dga@fodip.gov.gn", "categorie": "Organismes publics autonomes"},
    {"num_ordre": 44, "nom_complet": "M Facély CONDE", "fonction": "Directeur Général AGESPI", "contact": "622 57 11 90", "email": "dgagespi@gov.gn", "categorie": "Organismes publics autonomes"},
    {"num_ordre": 45, "nom_complet": "M Thié Koto DORE", "fonction": "Directeur Général Adjoint AGESPI", "contact": None, "email": None, "categorie": "Organismes publics autonomes"},
    # Services d'appui
    {"num_ordre": 46, "nom_complet": "M Fodé Salifou SYLLA", "fonction": "Inspecteur Général", "contact": "627 41 86 09", "email": "fodesalifsylla3@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 47, "nom_complet": "M Mory DIALLO", "fonction": "Inspecteur Général Adjoint", "contact": "628 98 02 09", "email": "mory1diallo224@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 48, "nom_complet": "M Cheick Abdoul SAMOURA", "fonction": "Inspecteur Général Adjoint", "contact": "628 27 48 12", "email": "isa@mic.gov.gn", "categorie": "Services d'appui"},
    {"num_ordre": 49, "nom_complet": "Mme Bintou Hary KEITA", "fonction": "Directrice Générale BSD", "contact": "626 46 18 56", "email": "dgbsd@mcipme.gov.gn", "categorie": "Services d'appui"},
    {"num_ordre": 50, "nom_complet": "M Ousmane Bodié BARRY", "fonction": "Directeur Général Adjoint BSD", "contact": "622 37 20 32", "email": "dgabsd@commerce.gov.gn", "categorie": "Services d'appui"},
    {"num_ordre": 51, "nom_complet": "M Joseph Gougna GOUAVOGUI", "fonction": "Directeur Général Adjoint BSD", "contact": "626 90 45 64", "email": "josephgouavogui@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 52, "nom_complet": "M Sekou Simon TOURE", "fonction": "Chef de Division DRH", "contact": "622 33 97 96", "email": "Simonpi44@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 53, "nom_complet": "Mme Gnaipou Marie Madeleine CECE", "fonction": "Cheffe de Division DRH", "contact": "622 15 42 02", "email": "gnepoumarie@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 54, "nom_complet": "M Aboubacar SOUMAH", "fonction": "Chef de Division des Affaires financières", "contact": "626 66 14 39", "email": "Soumaha977@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 55, "nom_complet": "Lopez Faya Yombouno", "fonction": "Chef de Service Communication et Relations Publiques", "contact": "623 46 00 35", "email": "scrp@mic.gov.gn", "categorie": "Services d'appui"},
    {"num_ordre": 56, "nom_complet": "Mme Habi CISSE", "fonction": "Contrôleur Financier", "contact": "621 83 46 06", "email": None, "categorie": "Services d'appui"},
    {"num_ordre": 57, "nom_complet": "Mme Seny DRAMOU", "fonction": "Cheffe Services Genres et Equités", "contact": "628 98 25 89", "email": "senyange2009@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 58, "nom_complet": "M Thierno Amadou BARRY", "fonction": "Personne responsable des Passations des Marchés Publics", "contact": "620 42 99 40", "email": "Thamadoub90@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 59, "nom_complet": "M Djiba FOFANA", "fonction": "Chef Service Centre des Ressources Documentaires", "contact": "629 04 03 02", "email": "djibafofana308@yahoo.com", "categorie": "Services d'appui"},
    {"num_ordre": 60, "nom_complet": "M Djiba DABO", "fonction": "Chef Service Modernisation SI (Intérim)", "contact": "628 91 30 82", "email": "Dabss45@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 61, "nom_complet": "Mme Fanta KABA", "fonction": "Cheffe Service accueil et information", "contact": "624 08 02 48", "email": "timdolard88@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 62, "nom_complet": "M Amadou Tidiane DIALLO", "fonction": "Chef Service santé, hygiène et sécurité", "contact": "626 14 37 93", "email": "tidjoblac@gmail.com", "categorie": "Services d'appui"},
    {"num_ordre": 63, "nom_complet": "Mme Fatoumata GHARE", "fonction": "Cheffe Service Secrétariat Central", "contact": "628 40 95 28", "email": "fatoumataghare@gmail.com", "categorie": "Services d'appui"},
    # Coordinateurs
    {"num_ordre": 64, "nom_complet": "Mme Tenin KEIRA", "fonction": "Cheffe Compta Matières et Matériel", "contact": "623 61 25 35", "email": None, "categorie": "Coordinateurs de programmes et projets"},
    {"num_ordre": 65, "nom_complet": "M Aboubacar Sidiki KABA", "fonction": "Coordinateur National du CFC", "contact": "628 85 36 59", "email": "aboubacarsididi3kaba@gmail.com", "categorie": "Coordinateurs de programmes et projets"},
    {"num_ordre": 66, "nom_complet": "M Mohamed Kalifa CAMARA", "fonction": "Chef de Projet Renforcement Capacités ONCQ", "contact": "628 77 61 92", "email": "camaramohamedkalifa@ymail.com", "categorie": "Coordinateurs de programmes et projets"},
    {"num_ordre": 67, "nom_complet": "M Ansoumane KEITA", "fonction": "Coordinateur Projet Compétitivité Chaîne de Valeur Miel", "contact": "622 84 67 25", "email": "kansouman@gmail.com", "categorie": "Coordinateurs de programmes et projets"},
    {"num_ordre": 68, "nom_complet": "M Sékou M'bemba CHERIF", "fonction": "Coordinateur PDCVA-G", "contact": "627 22 30 35", "email": "pdcvaguinee@gmail.com", "categorie": "Coordinateurs de programmes et projets"},
    {"num_ordre": 69, "nom_complet": "M Mamadou Diouhaya BALDE", "fonction": "D.O CAPME", "contact": None, "email": None, "categorie": "Coordinateurs de programmes et projets"},
    {"num_ordre": 71, "nom_complet": "M Oumar KAKE", "fonction": "Coordinateur PAZIF", "contact": None, "email": None, "categorie": "Coordinateurs de programmes et projets"},
    {"num_ordre": 72, "nom_complet": "M Mamoudou MARA", "fonction": "Directeur Général FGPE", "contact": "626 27 77 80", "email": "mamadou.mara@fgpeguinee.com", "categorie": "Coordinateurs de programmes et projets"},
    {"num_ordre": 73, "nom_complet": "M Alhassane BARRY", "fonction": "Directeur Général Adjoint FGPE", "contact": "621 96 01 65", "email": "alhassane.barry@fgpeguinee.com", "categorie": "Coordinateurs de programmes et projets"},
    # Secrétaires / assistants
    {"num_ordre": 74, "nom_complet": "M Mohamed Saliou BANGOURA", "fonction": "Assistant Technique de Madame la Ministre", "contact": "628 98 41 24", "email": None, "categorie": "Secrétaires et assistants"},
    {"num_ordre": 76, "nom_complet": "M Aboubacar Sidiki DOUMBOUYA", "fonction": "Assistant Technique et Administratif du SG", "contact": "623 86 09 63", "email": "abousd01@gmail.com", "categorie": "Secrétaires et assistants"},
    {"num_ordre": 77, "nom_complet": "Mme Mariama CONDE", "fonction": "Secrétaire Particulière du Secrétaire Général", "contact": None, "email": None, "categorie": "Secrétaires et assistants"},
    {"num_ordre": 78, "nom_complet": "Mme Mariama Cire Djibril CAMARA", "fonction": "Secrétaire Particulière du Chef de Cabinet", "contact": "626 41 84 89", "email": "atech.cc@mic.gov.gn", "categorie": "Secrétaires et assistants"},
    {"num_ordre": 79, "nom_complet": "M Issa Oury DIALLO", "fonction": "Assistant Technique et Administratif du Chef de Cabinet", "contact": "622 41 50 68", "email": "atech.cc@mic.gov.gn", "categorie": "Secrétaires et assistants"},
    # Syndicat
    {"num_ordre": 81, "nom_complet": "M Morlaye SOUMAH", "fonction": "Secrétaire Général du Syndicat", "contact": "622 75 88 30", "email": "morlayeyayasoumah@yahoo.fr", "categorie": "Syndicat"},
    # Inspection régionale
    {"num_ordre": 82, "nom_complet": "M Bakary CAMARA", "fonction": "Inspecteur régional Commerce, Industrie et PME Conakry", "contact": "620 59 79 10", "email": "Sbakary4@gmail.com", "categorie": "Inspection régionale de Conakry"},
    # Directions communales
    {"num_ordre": 83, "nom_complet": "Mme Djenabou CONDE", "fonction": "Directrice Communale de Kaloum", "contact": "622 62 63 95", "email": "dcckaloum@gmail.com", "categorie": "Directions communales"},
    {"num_ordre": 84, "nom_complet": "M Faira MARA", "fonction": "Directeur Communal de Matoto", "contact": "628 14 34 57", "email": "Marafaira82@gmail.com", "categorie": "Directions communales"},
    {"num_ordre": 85, "nom_complet": "M Aboubacar FOFANA", "fonction": "Directeur Communal de Matam", "contact": "628 23 12 20", "email": "Koniakaden30@gmail.com", "categorie": "Directions communales"},
    {"num_ordre": 86, "nom_complet": "Mme Hawa DORE", "fonction": "Directrice Communale de Ratoma", "contact": "623 01 49 61", "email": "Hawakanalydore0@gmail.com", "categorie": "Directions communales"},
    {"num_ordre": 87, "nom_complet": "M Almamy NABE", "fonction": "Directeur Préfectoral Industrie et Commerce Coyah", "contact": "624 39 68 40", "email": "Almamynabe85@gmail.com", "categorie": "Directions communales"},
    {"num_ordre": 88, "nom_complet": "M SYLLA", "fonction": "Directeur Communal de Dubreka", "contact": "621 44 86 54", "email": None, "categorie": "Directions communales"},
    {"num_ordre": 89, "nom_complet": "M Nkaye Sy SAVANE", "fonction": "Directeur Communal de Dixinn", "contact": "625 24 38 48", "email": "Nkaye2312@gmail.com", "categorie": "Directions communales"},
]


def seed_presence_codes() -> dict[int, str]:
    """Codes aléatoires stables pour l'import initial (reproductibles)."""
    from app.services.presence_codes import generate_unique_codes

    codes = generate_unique_codes(len(PERSONNEL_CABINET_SEED), seed=20260814)
    return {row["num_ordre"]: code for row, code in zip(PERSONNEL_CABINET_SEED, codes, strict=True)}

