from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Question, PlayerResponse
import random

@api_view(['GET'])
def real_or_fake_question(request):
    question = random.choice(Question.objects.all())
    return Response({
        'id': question.id,  # Include the question ID
        'snippet': question.snippet
    })

@api_view(['POST'])
def real_or_fake_answer(request):
    answer = request.data.get('answer')
    question_id = request.data.get('question_id')
    
    # Get the specific question by ID
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=404)
    
    is_correct = (answer == ('real' if question.is_real else 'fake'))
    PlayerResponse.objects.create(
        question=question,
        user_answer=answer,
        is_correct=is_correct
    )
    feedback = 'Correct!' if is_correct else f'Incorrect. It was {"real" if question.is_real else "fake"}.'
    return Response({ 'feedback': feedback })

@api_view(['GET'])
def guess_headline_question(request):
    question = random.choice(Question.objects.all())
    return Response({
        'id': question.id,
        'snippet': question.snippet,
        'source': question.source,
        'headlines': question.headline_options,
        'correct_headline': question.correct_headline
    })

@api_view(['POST'])
def guess_headline_answer(request):
    answer = request.data.get('selected_headline')
    question_id = request.data.get('question_id')

    # Get the specific question by ID
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=404)
    
    correct_answer = question.correct_headline
    if answer == correct_answer:
        return Response({'feedback': '✅ Correct!', 'is_correct': True})
    else:
        return Response({'feedback': f'❌ Incorrect! The correct headline was: {correct_answer}.', 'is_correct': False})


@api_view(['GET'])
def guess_source_question(request):
    question = random.choice(Question.objects.all())
    return Response({
        'id': question.id,
        'snippet': question.snippet,
        'source_options': question.source_options
    })


@api_view(['POST'])
def guess_source_answer(request):
    answer = request.data.get('answer')
    question_id = request.data.get('question_id')

    # Get the specific question by ID
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=404)
    
    correct_answer = question.source
    if answer == correct_answer:
        return Response({'feedback': '✅ Correct!'})
    else:
        return Response({'feedback': f'❌ Incorrect! The correct source was {correct_answer}.'})

