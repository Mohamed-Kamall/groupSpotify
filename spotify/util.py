from django.conf import ENVIRONMENT_VARIABLE
from django.http import response
import rest_framework
from .models import SpotifyToken
from datetime import timedelta
from django.utils import timezone
from .credentials import *
from requests import Request, post,put,get

BASE_URL = 'https://api.spotify.com/v1/me/'

def get_user_token(session_id):
    user_token = SpotifyToken.objects.filter(user=session_id)
    if user_token.exists():
        return user_token[0]
    else:
        return None

def token_generator(session_id,refresh_token,access_token,expires_in,token_type):
    token = get_user_token(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if token:
        token.access_token = access_token
        token.refresh_token = refresh_token
        token.token_type = token_type
        token.expires_in = expires_in
        token.save(update_fields = ['refresh_token','access_token','expires_in','token_type'])
    else:
        Token = SpotifyToken(user=session_id,access_token=access_token,refresh_token=refresh_token,token_type=token_type,expires_in=expires_in)
        Token.save()

def is_spotify_authenticated(session_id):
    token = get_user_token(session_id)
    if token:
        expirey = token.expires_in
        if expirey <= timezone.now():
            refresh_spotify_token(session_id)

        return True
    
    return False

def refresh_spotify_token(session_id):
    refresh_token = get_user_token(session_id).refresh_token

    response = post('https://accounts.spotify.com/api/token',data={
        'grant_type' : 'refresh_token',
        'refresh_token' : refresh_token,
        'client_id' : CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()
    
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    token_generator(session_id,refresh_token,access_token,expires_in,token_type)


def exexute_spotify_API_call(session_id,endpoint,post_=False,put_=False):
    token = get_user_token(session_id)
    header = {'Content-Type': 'application/json',
               'Authorization': "Bearer " + token.access_token}
    
    if post_:
        post(BASE_URL+endpoint,headers=header)
    if put_:
        put(BASE_URL+endpoint,headers=header)
    response = get(BASE_URL + endpoint,{},headers=header)
    
    try:
        return response.json()
    except:
        return {'error':'could not resolve the request'}


def play_song(session_id):
    return exexute_spotify_API_call(session_id,'player/play',put_=True)

def pause_song(session_id):
    return exexute_spotify_API_call(session_id,'player/pause',put_=True)



def get_lyrics(artists,title):
    for artist in artists:
        myresponse = get('https://api.lyrics.ovh/v1/'+artist+'/'+title)
        try:
            return myresponse.json()
        except:
            return{'error':'error with lyrics'}


def skip_song(session_id):
    exexute_spotify_API_call(session_id,'player/next',post_=True)




