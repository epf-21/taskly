CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "tasks_title_trgm_idx" ON "tasks" USING GIN ("title" gin_trgm_ops);

CREATE INDEX "tasks_description_trgm_idx" ON "tasks" USING GIN ("description" gin_trgm_ops);
