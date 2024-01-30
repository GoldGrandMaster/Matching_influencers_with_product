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
    user = StringField(max_length=60, required=True, unique=True)
    influencer_hashtag_gen = StringField()
    buyer_persona_gen = StringField()
    persona_hashtag_gen = StringField()
    reason_gen = StringField()
    email_write = StringField()
    email_rewrite = StringField()
    description = StringField()

class Products(Document):
    asin = StringField(max_length=20, required=True, unique=True)
    link = StringField()
    category = StringField()
    title = StringField()
    detail = StringField()

