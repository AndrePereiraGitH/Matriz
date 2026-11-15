ALTER TABLE "projects"
ADD COLUMN "owner_id" TEXT REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "projects_owner_id_idx" ON "projects"("owner_id");
