
from django.db.models import query
from django.http.response import JsonResponse
from rest_framework.fields import SlugField
from .serializers import RoomSerializer ,RoomCreateSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework import generics, serializers, status
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

class RoomViewList(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'roomCode'

    def get(self , request , format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if room.exists():
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data,status=status.HTTP_200_OK)
            return Response({'Room_not_Found':'invalid Room code'},status=status.HTTP_404_NOT_FOUND)

        return Response({'bad_request':'parameter not found'},status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    lookup_url_kwarg = 'roomCode'

    def post(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result=[0]
                self.request.session['roomCode'] = code
                return Response({'message':'Room joined successfully!'},status=status.HTTP_200_OK)
            return Response({'Bad request':'invalid room code'},status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad request':' invalid post data...'},status=status.HTTP_400_BAD_REQUEST)
        



class RoomApiViewCreate(APIView):
    serializer_class = RoomCreateSerializer

    def post(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            vote_to_skip = serializer.data.get('vote_to_skip')
            host = self.request.session.session_key
            querySet = Room.objects.filter(host=host)
            if querySet.exists():
                room = querySet[0]
                room.guest_can_pause = guest_can_pause
                room.vote_to_skip = vote_to_skip
                room.save(update_fields = ['guest_can_pause','vote_to_skip'])
                self.request.session['roomCode'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

            else:
                room = Room(host=host ,guest_can_pause=guest_can_pause ,vote_to_skip=vote_to_skip)
                room.save()
                self.request.session['roomCode'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response({'Bad request':'invalid post data...'},status=status.HTTP_400_BAD_REQUEST)

    
class UserInRoom(APIView):
    def get(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code':self.request.session.get('roomCode')
        }
        return JsonResponse(data,status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self,request,format=None):
        if 'roomCode' in self.request.session:
            self.request.session.pop('roomCode')
            host_id = self.request.session.session_key
            rooms = Room.objects.filter(host=host_id)
            if len(rooms) > 0 :
                room = rooms[0]
                room.delete()
        return Response({'message':'success'},status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer
    def patch(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            vote_to_skip = serializer.data.get('vote_to_skip')
            code = serializer.data.get('code')
            query_set = Room.objects.filter(code=code)
            if not query_set.exists():
                return Response({'message':'room not found'},status=status.HTTP_404_NOT_FOUND)
            room = query_set[0]
            room.guest_can_pause = guest_can_pause
            room.vote_to_skip = vote_to_skip
            room.save(update_fields = ['guest_can_pause','vote_to_skip'])
            return Response(RoomSerializer(room).data,status=status.HTTP_200_OK)

        return Response({'bad request':'invalid data'},status=status.HTTP_400_BAD_REQUEST)