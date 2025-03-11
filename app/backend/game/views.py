from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Question, PlayerResponse
import random

@api_view(['GET'])
def real_or_fake_question(request):
    question = random.choice(Question.objects.all())
    return Response({
        'snippet': question.snippet
    })

@api_view(['POST'])
def real_or_fake_answer(request):
    answer = request.data.get('answer')
    # For prototype, fetch random question (in production, use IDs)
    question = random.choice(Question.objects.all())
    is_correct = (answer == ('real' if question.is_real else 'fake'))
    PlayerResponse.objects.create(
        question=question,
        user_answer=answer,
        is_correct=is_correct
    )
    feedback = 'Correct!' if is_correct else f'Incorrect. It was {"real" if question.is_real else "fake"}.'
    return Response({ 'feedback': feedback })