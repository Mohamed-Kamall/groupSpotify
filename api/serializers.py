from django.db import models
from django.db.models import fields
from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class RoomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model= Room
        fields = ( 'guest_can_pause','vote_to_skip')

class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])
    class Meta:
        model= Room
        fields = ( 'guest_can_pause','vote_to_skip','code')