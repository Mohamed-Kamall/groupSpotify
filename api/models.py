from django.db import models

import string
import random

def generate_unique_code():
    length = 6
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        if Room.objects.filter(code=code).count() == 0:
            break
    return code




class Room(models.Model):
    code = models.CharField(max_length=8,unique=True,default=generate_unique_code)
    host = models.CharField(max_length=50,unique=True)
    guest_can_pause = models.BooleanField(null=False,default=False)
    vote_to_skip = models.IntegerField(null=False,default=1)
    creates_at = models.DateField(auto_now_add=True)
    current_song = models.CharField(max_length=50, null=True)