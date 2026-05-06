from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("todos", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE todos_todo
            ADD COLUMN IF NOT EXISTS owner_id bigint;

            UPDATE todos_todo
            SET owner_id = (
                SELECT id FROM auth_user ORDER BY id ASC LIMIT 1
            )
            WHERE owner_id IS NULL;

            CREATE INDEX IF NOT EXISTS todos_todo_owner_id_idx
            ON todos_todo(owner_id);

            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'todos_todo_owner_id_fk'
                ) THEN
                    ALTER TABLE todos_todo
                    ADD CONSTRAINT todos_todo_owner_id_fk
                    FOREIGN KEY (owner_id)
                    REFERENCES auth_user(id)
                    DEFERRABLE INITIALLY DEFERRED;
                END IF;
            END $$;

            ALTER TABLE todos_todo
            ALTER COLUMN owner_id SET NOT NULL;
            """,
            reverse_sql="""
            ALTER TABLE todos_todo
            DROP CONSTRAINT IF EXISTS todos_todo_owner_id_fk;

            DROP INDEX IF EXISTS todos_todo_owner_id_idx;

            ALTER TABLE todos_todo
            DROP COLUMN IF EXISTS owner_id;
            """,
        ),
    ]
