from django.http import response
from django.shortcuts import render, redirect

from .credentials import *
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room
from .models import Vote

class AuthURL(APIView):
    def get(self,request,format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        url = Request('GET','https://accounts.spotify.com/authorize',params={
            'scope' : scopes ,
            'response_type' : 'code',
            'redirect_uri' : REDIRECT_URI,
            'client_id' : CLIENT_ID
        }).prepare().url
        return Response({'url':url},status=status.HTTP_200_OK) 

def spotify_callback(request):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token',data={
        'grant_type' : 'authorization_code',
        'code' : code,
        'redirect_uri' : REDIRECT_URI,
        'client_id' : CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    }).json()

    print(response)

    access_token = response.get('access_token')
    token_type= response.get('token_type')
    error= response.get('error')
    expires_in= response.get('expires_in')
    refresh_token= response.get('refresh_token')

    

    if not request.session.exists(request.session.session_key):
        request.session.create()

    token_generator(request.session.session_key,refresh_token,access_token,expires_in,token_type)

    return redirect('frontend:')


class IsAuthenticated(APIView):
    def get(self,request,format=None):
        is_auth = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status':is_auth},status=status.HTTP_200_OK)


class Current_Song(APIView):
    def get(self,request,format=None):
        room_code = self.request.session.get('roomCode')
        rooms = Room.objects.filter(code=room_code)
        if rooms.exists():
            room = rooms[0]
        else:
            return Response({},status=status.HTTP_404_NOT_FOUND)
        host = room.host
        
        endpoint = 'player/currently-playing'
        response = exexute_spotify_API_call(host,endpoint)

        if 'error' in response or not 'item' in response:
            return Response({},status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        title = item.get('name')
        duration = item.get('duration_ms')
        progress = response.get("progress_ms")
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""
        artists=[]

        for i,artist in enumerate(item.get('artists')):
            if i>0:
                artist_string+=", "
            artists.append(artist.get('name'))
            name = artist.get('name')
            artist_string+=name
            
        
        myresponse = get_lyrics(artists,title)
        votes = len(Vote.objects.filter(room=room, song_id=song_id))
        song={
            'title' : title,
            'artist' : artist_string,
            'duration' : duration,
            'time' : progress,
            'album_cover' : album_cover,
            'id' : song_id,
            'is_playing' : is_playing,
            'votes' : votes,
            'votes_required': room.vote_to_skip,
            'lyrics' : myresponse.get('lyrics')
        }
        self.update_room_song(room, song_id)

        return Response(song,status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room).delete()


class PlaySong(APIView):
    def put(self,response,format=None):
        room_code = self.request.session.get('roomCode')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({},status=status.HTTP_204_NO_CONTENT)
        return Response({},status=status.HTTP_403_FORBIDDEN)

class PauseSong(APIView):
    def put(self,response,format=None):
        room_code = self.request.session.get('roomCode')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({},status=status.HTTP_204_NO_CONTENT)
        return Response({},status=status.HTTP_403_FORBIDDEN)



class SkipSong(APIView):
    def post(self,request,format=None):
        room_code = self.request.session.get('roomCode')
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.vote_to_skip

        if self.request.session.session_key == room.host or len(votes) + 1 >= votes_needed:
            votes.delete()
            skip_song(room.host)
        else:
            vote = Vote(user=self.request.session.session_key,
                        room=room, song_id=room.current_song)
            vote.save()

        return Response({},status=status.HTTP_204_NO_CONTENT)


