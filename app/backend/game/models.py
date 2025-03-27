from django.db import models

class Question(models.Model):
    snippet = models.TextField()
    is_real = models.BooleanField()
    source = models.CharField(max_length=255)  # The correct source
    headline = models.CharField(max_length=255)  # The actual headline
    correct_headline = models.CharField(max_length=255)  # For fake news, this is "No valid headline - this is fake news"
    # New fields for the other games
    headline_options = models.JSONField(default=list)  # List of 4 headline options including the correct one
    source_options = models.JSONField(default=list)  # List of 4 source options including the correct one
    
    def __str__(self):
        return f"{self.headline} - {'Real' if self.is_real else 'Fake'}"

class PlayerResponse(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user_answer = models.CharField(max_length=50)
    is_correct = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)