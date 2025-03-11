from django.db import models

class Question(models.Model):
    snippet = models.TextField()
    is_real = models.BooleanField()
    source = models.CharField(max_length=255)
    headline = models.CharField(max_length=255)
    correct_headline = models.CharField(max_length=255)

class PlayerResponse(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user_answer = models.CharField(max_length=50)
    is_correct = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)