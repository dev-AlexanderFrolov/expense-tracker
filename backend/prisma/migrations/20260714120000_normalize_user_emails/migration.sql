-- Normalize existing emails to lowercase
UPDATE "users" SET email = LOWER(email);

-- Replace case-sensitive unique index with case-insensitive one
DROP INDEX "users_email_key";
CREATE UNIQUE INDEX "users_email_key" ON "users" (LOWER(email));
