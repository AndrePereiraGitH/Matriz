PRAGMA defer_foreign_keys=ON;

CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tasks_status_check" CHECK ("status" IN ('TODO', 'IN_PROGRESS', 'DONE')),
    CONSTRAINT "tasks_priority_check" CHECK ("priority" IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_tasks" (
    "id",
    "project_id",
    "title",
    "description",
    "status",
    "priority",
    "created_at",
    "updated_at"
)
SELECT
    "id",
    "project_id",
    "title",
    "description",
    "status",
    "priority",
    "created_at",
    "updated_at"
FROM "tasks";

DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";

CREATE INDEX "tasks_project_id_idx" ON "tasks"("project_id");
CREATE INDEX "tasks_status_priority_idx" ON "tasks"("status", "priority");
