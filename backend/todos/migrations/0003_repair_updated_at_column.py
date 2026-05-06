from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("todos", "0002_repair_owner_id_column"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE todos_todo
            ADD COLUMN IF NOT EXISTS updated_at timestamptz;

            UPDATE todos_todo
            SET updated_at = created_at
            WHERE updated_at IS NULL;

            ALTER TABLE todos_todo
            ALTER COLUMN updated_at SET NOT NULL;
            """,
            reverse_sql="""
            ALTER TABLE todos_todo
            DROP COLUMN IF EXISTS updated_at;
            """,
        ),
    ]
