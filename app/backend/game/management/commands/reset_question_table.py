# Create a Django management command to reset the table
# Save this as game/management/commands/reset_question_table.py

from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Resets the game_question table structure'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Drop the table
            self.stdout.write('Dropping game_question table...')
            cursor.execute("DROP TABLE IF EXISTS game_question")
            
            # Force Django to recreate it with migrations
            self.stdout.write('Table dropped. Run migrations to recreate it.')

# Then run it with:
# python manage.py reset_question_table
# python manage.py migrate