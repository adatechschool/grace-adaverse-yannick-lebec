-- Remplace :id par l'identifiant du projet à publier
UPDATE student_projects
SET published_at = NOW()
WHERE id = :id;
