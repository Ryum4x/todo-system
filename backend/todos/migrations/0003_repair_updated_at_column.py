from django.db import migrations


def repair_updated_at_column(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            """
            ALTER TABLE todos_todo
            ADD COLUMN IF NOT EXISTS updated_at timestamptz;

            UPDATE todos_todo
            SET updated_at = created_at
            WHERE updated_at IS NULL;

            ALTER TABLE todos_todo
            ALTER COLUMN updated_at SET NOT NULL;
            """
        )


def reverse_repair_updated_at_column(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            """
            ALTER TABLE todos_todo
            DROP COLUMN IF EXISTS updated_at;
            """
        )


class Migration(migrations.Migration):
    dependencies = [
        ("todos", "0002_repair_owner_id_column"),
    ]

    operations = [
        migrations.RunPython(repair_updated_at_column, reverse_repair_updated_at_column),
    ]
