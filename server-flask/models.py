from mongoengine import Document, EmbeddedDocument,EmbeddedDocumentField, CASCADE
from mongoengine import DateTimeField, StringField, ReferenceField, ListField, IntField, BooleanField

class Influencers(Document):
    name = StringField(max_length=60, required=True)
    userid = StringField(max_length=60, required=True, unique=True)
    email = StringField()
    platform = StringField(max_length=60)
    country = StringField(max_length=60)
    hashtag = ListField()
    profile = StringField()
    follower = IntField(default=0)
    total_video = IntField(default=0)
    recent_30video_view = IntField(default=0)
    recent_30video_like = IntField(default=0)
    recent_30video_comment = IntField(default=0)
    title_last_10video = ListField()
    profile_last_10video = ListField()
    saleVideo = ListField()
    total_hashtag = ListField()

class Products(Document):
    sku = StringField(max_length=20)
    country = StringField()
    platform = StringField()
    asin = StringField(max_length=20, required=True, unique=True)
    title = StringField()
    link = StringField()
    sample = IntField()
    detail = StringField()

class ReasonInfluencer(Document):
    influencer = ReferenceField(Influencers, reverse_delete_rule=CASCADE)
    reason = StringField()

class InfluencerMatchings(Document):
    products = ListField(StringField())
    platform = StringField()
    limitMailbox = BooleanField()
    nation = StringField()
    minFollowerCount = IntField()
    maxFollowerCount = IntField()
    callbackUrl = StringField()
    matchedCount = IntField()
    influencerList = ListField(ReferenceField(ReasonInfluencer, reverse_delete_rule=CASCADE))

class Emails(Document):
    influencerId = ReferenceField(Influencers, reverse_delete_rule=CASCADE)
    emailContent = StringField()
    reason = StringField()

class WritingEmails(Document):
    language = StringField()
    senderName = StringField()
    companyName = StringField()
    companyDesc = StringField()
    emailRemark = StringField()
    influencerJobId = ReferenceField(InfluencerMatchings)
    callbackUrl = StringField()
    emails = ListField(ReferenceField(Emails, reverse_delete_rule=CASCADE))
    title = StringField()
    emailContent = StringField()
