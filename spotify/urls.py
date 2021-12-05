from django.urls import path
from .views import *

urlpatterns = [
    path('auth-url',AuthURL.as_view()),
    path('redirect',spotify_callback),
    path('is-auth',IsAuthenticated.as_view()),
    path('current-song',Current_Song.as_view()),
    path('pause-song',PlaySong.as_view()),
    path('play-song',PauseSong.as_view()),
    path('skip-song',SkipSong.as_view()),
    
]
