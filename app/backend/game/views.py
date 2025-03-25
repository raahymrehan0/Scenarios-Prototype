from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Question, PlayerResponse
import random

@api_view(['GET'])
def headline_get_question(request):
    """Get the next question in sequence"""
    question_id = request.GET.get('question_id')
    
    try:
        if question_id:
            # Get the next question after the specified ID
            question = Question.objects.filter(id__gt=question_id).order_by('id').first()
            if not question:
                return Response({'error': 'No more questions'}, status=404)
        else:
            # Get the first question
            question = Question.objects.order_by('id').first()
            if not question:
                return Response({'error': 'No questions available'}, status=404)
        
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
            'correct_headline': question.correct_headline,
            'total_questions': Question.objects.count()
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def headline_get_question(request):
    """Get the next question in sequence with validation"""
    question_id = request.GET.get('question_id')
    
    try:
        if question_id:
            # Get the next valid question after the specified ID
            questions = Question.objects.filter(id__gt=question_id).order_by('id')
        else:
            # Get the first valid question
            questions = Question.objects.order_by('id')
        
        # Find the next question that has a valid correct headline
        question = None
        for q in questions:
            if q.correct_headline and q.correct_headline.strip():
                question = q
                break
        
        if not question:
            return Response({'error': 'No valid questions available'}, status=404)
        
        # Verify the correct headline exists in the options
        headlines = [
            q.headline1,
            q.headline2,
            q.headline3,
            q.headline4
        ]
        
        if question.correct_headline not in headlines:
            # If correct headline is missing, add it and remove a random incorrect one
            headlines.pop(random.randint(0, 3))
            headlines.append(question.correct_headline)
        
        return Response({
            'id': question.id,
            'snippet': question.snippet,
            'is_real': question.is_real,
            'source': question.source,
            'headlines': headlines,
            'correct_headline': question.correct_headline,
            'total_questions': Question.objects.count()
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)