from mongoengine import Document
from mongoengine import DateTimeField, StringField, ReferenceField, ListField, IntField

class Influencers(Document):
    name = StringField(max_length=60, required=True, unique=True)
    userid = StringField(max_length=20, required=True, unique=True)
    platform = StringField(max_length=60)
    country = StringField(max_length=60)
    hashtag = StringField()
    profile = StringField()
    follower = StringField(max_length=20)
    total_video = IntField(default=0)
    recent_30video_view = StringField(max_length=20)
    recent_30video_like = StringField(max_length=20)
    recent_30video_comment = StringField(max_length=20)
    title_last_10video = StringField()
    profile_last_10video = StringField()
    total_hashtag = ListField()

class Models(Document):
    name = StringField(max_length=60, required=True, unique=True)
    prompt1 = StringField()
    prompt2 = StringField()
    prompt3 = StringField()
    description = StringField()

class Products(Document):
    title = StringField()
    detail = StringField()

