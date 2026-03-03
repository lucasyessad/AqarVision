/* ------------------------------------------------------------------------------
   PROJET      : INEO
   APPLICATION : MIG_V5
   OBJET       : Mise a jour flag_ecart_explique dans ORT_ECART_DETAILS_V4_V5
   AUTEUR      : UFLULY
   DATE        : 03/03/2026

   DESCRIPTION :
     Passe flag_ecart_explique a 1 pour tous les ecarts (STRUCTURE et DONNEES)
     qui sont deja justifies dans ORT_ECART_JUSTIF_V4_V5.

     Cle de jointure :
       type_verif + nom_table_v4 + nom_table_v5
       + nom_colonne_v4 (ISNULL) + nom_colonne_v5 (ISNULL)
       + type_ecart

     Ce script est appele en ETAPE 6 du bat MIGV5_COMPARE_V4_V5,
     apres l'execution des deux procedures de comparaison.
   ------------------------------------------------------------------------------ */
SET NOCOUNT ON;

UPDATE E
SET    E.flag_ecart_explique = 1
FROM   dbo.ORT_ECART_DETAILS_V4_V5   E
WHERE  E.flag_ecart_explique = 0
  AND  EXISTS (
    SELECT 1
    FROM   dbo.ORT_ECART_JUSTIF_V4_V5 J
    WHERE  J.type_verif                = E.type_verif
      AND  J.nom_table_v4              = E.nom_table_v4
      AND  J.nom_table_v5              = E.nom_table_v5
      AND  ISNULL(J.nom_colonne_v4,'') = ISNULL(E.nom_colonne_v4,'')
      AND  ISNULL(J.nom_colonne_v5,'') = ISNULL(E.nom_colonne_v5,'')
      AND  J.type_ecart                = E.type_ecart
);

PRINT 'flag_ecart_explique mis a jour : '
    + CAST(@@ROWCOUNT AS VARCHAR) + ' ecart(s) marque(s) comme explique(s).';
GO
