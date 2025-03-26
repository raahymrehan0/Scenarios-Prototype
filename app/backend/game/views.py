from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Question, PlayerResponse
import random
from django.conf import settings
import json
import os
import uuid

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
    feedback = '✅ Correct!' if is_correct else f'❌ Incorrect. It was {"real" if question.is_real else "fake"}.'
    return Response({ 'feedback': feedback })


# Path to the articles.json file
ARTICLES_PATH = os.path.join(settings.BASE_DIR, 'articles.json')


# GET: Serve one random question (article with choices)
@api_view(['GET'])
def guess_source_question(request):
    try:
        with open(ARTICLES_PATH, 'r') as f:
            articles = json.load(f)
    except Exception as e:
        return Response({'error': f'Failed to load articles: {str(e)}'}, status=500)

    if not articles:
        return Response({'error': 'No articles available.'}, status=404)

    # Get article and article id
    article = random.choice(articles)
    article['id'] = article["id"]
    # this doesn't work, probably not set up properly in django config
    request.session['current_question_id'] = article['id']
    request.session['current_answer'] = article['answer']

    return Response({
        'id': article['id'],
        'title': article.get('title', ''),
        'content': article['content'],
        'choices': article['choices']
    })


# POST: Submit answer and get feedback
@api_view(['POST'])
def guess_source_answer(request):
    user_answer = request.data.get('answer')
    question_id = request.data.get('question_id')

    try:
        with open(ARTICLES_PATH, 'r') as f:
            articles = json.load(f)
    except Exception as e:
        return Response({'error': f'Failed to load articles: {str(e)}'}, status=500)

    if not articles:
        return Response({'error': 'No articles available.'}, status=404)

    for article in articles:
        if article["id"] == question_id: 
            correct_answer = article["answer"]

    print(correct_answer)
    #print(saved_question_id)

    #if not correct_answer or question_id != saved_question_id:
    if not correct_answer:
        return Response({'feedback': 'Invalid or expired question.'}, status=400)

    if user_answer == correct_answer:
        return Response({'feedback': '✅ Correct!'})
    else:
        return Response({'feedback': f'❌ Incorrect! The correct source was {correct_answer}.'})

