UPDATE contacts
SET info = $1
WHERE id = $2
RETURNING *