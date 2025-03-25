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

from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Question, PlayerResponse
import random

@api_view(['GET'])
def get_question(request):
    """Get a random question with all necessary data for the game"""
    questions = list(Question.objects.all())
    if not questions:
        return Response({'error': 'No questions available'}, status=404)
    
    question = random.choice(questions)
    return Response({
        'id': question.id,
        'snippet': question.snippet,
        'is_real': question.is_real,
        'source': question.source,
        'headlines': [
            question.headline1,
            question.headline2,
            question.headline3,
            question.headline4,
        ],
        'correct_headline': question.correct_headline
    })

@api_view(['POST'])
def submit_answer(request):
    """Submit and validate an answer"""
    try:
        question_id = request.data.get('question_id')
        selected_headline = request.data.get('selected_headline')
        
        if not question_id or selected_headline is None:
            return Response({'error': 'Missing question_id or selected_headline'}, status=400)
            
        question = Question.objects.get(id=question_id)
        
        # Determine if answer is correct
        if question.is_real:
            is_correct = (selected_headline == question.correct_headline)
            correct_answer = question.correct_headline
        else:
            is_correct = (selected_headline == "No valid headline - this is fake news")
            correct_answer = "No valid headline - this is fake news"
        
        # Save player response
        PlayerResponse.objects.create(
            question=question,
            user_answer=selected_headline,
            is_correct=is_correct
        )
        
        return Response({
            'is_correct': is_correct,
            'correct_answer': correct_answer,
            'feedback': 'Correct!' if is_correct else f'Incorrect. The correct answer was: "{correct_answer}"'
        })
        
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)