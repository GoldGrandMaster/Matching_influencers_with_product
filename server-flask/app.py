from flask import Flask, request, Response, stream_with_context
from pymongo import MongoClient
import models, utils
import mongoengine
import json
import re
import time

from flask_cors import CORS
from flask import jsonify
from flask_socketio import SocketIO

from bson import json_util

app = Flask(__name__)
CORS(app)

# Set up MongoDB connection 
client = MongoClient('mongodb://localhost:27017/') 
db = client['MetajointCorp'] 
influencer_collection = db['influencers'] 
product_collection = db['products']
model_collection = db['models']
socketio = SocketIO(app, cors_allowed_origins="*")

# Set up the default MongoDB connection for Flask-MongoEngine
mongoengine.connect('MetajointCorp', host='mongodb://localhost:27017/')

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/add_data_products', methods=['POST']) 
def add_data_products(): 
    if request.method == "POST":
        data = request.get_json()
        print(data)
        newData = models.Products(**data).save()
        return 'Product Data added to MongoDB'
    else:
        data = models.Products().get()
        return jsonify(data)

@app.route('/update_data_products', methods=['POST'])
def update_data_products():
    if request.method == "POST":
        try:
            data = request.get_json()  # Get JSON data from the request
            model = models.Products.objects(id=data["_id"]).first()  # Retrieve the existing product

            if not model:
                return jsonify({'error': 'Product not found'}), 404

            # Update the product fields with the new data
            for key, value in data["data"].items():
                setattr(model, key, value)

            model.save()  # Save the updated product
            return jsonify({'message': 'Product updated successfully', 'product': str(model)}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/get_data_products', methods=['GET'])
def get_data_products():
    collection = product_collection
    data = list(collection.find())
    data_str = json_util.dumps(data)
    return data_str

@app.route('/delete_data_products', methods=['DELETE'])
def delete_data_products():
    data = request.get_json()
    _id = data["_id"]
    model = models.Products.objects.get(id=_id)
    model.delete()
    return "Product Data deleted"

@app.route('/add_data_influencers', methods=['POST']) 
def add_data_influencers(): 
    # Get data from request 
    if request.method == "POST":
        data = request.get_json()
        newData = models.Influencers(**data).save()
        return 'Influencer Data added to MongoDB'
    else:
        data = models.Influencers().get()
        return jsonify(data)
    
@app.route('/update_data_influencers', methods=['POST'])
def update_data_influencers():
    if request.method == "POST":
        try:
            data = request.get_json()  # Get JSON data from the request
            model = models.Influencers.objects(id=data["_id"]).first()  # Retrieve the existing product

            if not model:
                return jsonify({'error': 'Influencer not found'}), 404

            # Update the product fields with the new data
            for key, value in data["data"].items():
                setattr(model, key, value)

            model.save()  # Save the updated product
            return jsonify({'message': 'Influencer updated successfully', 'influencer': str(model)}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/get_data_influencers', methods=['GET'])
def get_data_influencers():
    collection = influencer_collection
    data = list(collection.find())
    # Convert ObjectId to string before JSON serialization
    data_str = json_util.dumps(data)
    return data_str

@app.route('/get_country', methods=['GET'])
def get_country():
    countries = influencer_collection.distinct("country")
    return jsonify(countries)

@app.route('/delete_data_influencers', methods=['DELETE'])
def delete_data_influencers():
    data = request.get_json()
    _id = data["_id"]
    print(_id)
    influencer = models.Influencers.objects.get(id=_id)
    print(influencer)
    influencer.delete()
    return "Influencer Data deleted"

@app.route('/run', methods=['POST'])
def run():
    data = request.get_json()
    print(data)

    product_detail = ''
    products = data['products']
    # product_asin_list = []
    for ele in products:
        # product_asin_list.append(str(ele))
        product_data = product_collection.find_one({"asin": ele})
        product_detail = product_detail + 'Title:\n' + product_data['title'] + '\n' + 'Detail:\n' + product_data['detail'] + '\n\n'
    print(product_detail)

    prompt_BuyerPersonaGen = 'Below is my products my business sales. Give me top 5 buyer personas of my products.'
    persona = utils.generate_openai(prompt_BuyerPersonaGen, product_detail)
    print(persona)

    prompt_PersonaHashtagGen = 'This is buyer personas of my product. Give me the top 5 hashtags of each buyer persona.'
    product_hashtags_temp = utils.generate_openai(prompt_PersonaHashtagGen, persona)
    print(product_hashtags_temp)

    product_hashtags = re.findall(r'#\w+', product_hashtags_temp)
    print(product_hashtags)

    product_hashtags = [word[1:] for word in product_hashtags]
    print(product_hashtags)

    filterfield = data['filterFields']
    print(filterfield)
    platform_filter = filterfield['platform']
    email_filter = filterfield['email']
    country_filter = filterfield['country']
    follower_filter = filterfield['followers']
    # Fetch influencer datas
    influencer_data = list(influencer_collection.find({}, {
        "total_hashtag": 1,
        "follower": 1,
        "name": 1,
        "profile": 1,
        "platform": 1,
        "email": 1,
        "country": 1,
        "_id": 0
    }))
    
    # Separate hashtags, followers, and names into their own lists
    influencer_hashtags = []
    influencer_followers = []
    influencer_names = []
    influencer_profiles = []
    for influencer in influencer_data:
        platform = influencer.get('platform', "").lower()
        if platform_filter != 'nolimit':
            if platform_filter != platform:
                continue

        email = influencer.get('email', "")
        if email_filter != 'nolimit':
            if not email:
                continue

        country = influencer.get('country', "")
        if country_filter != 'All':
            if country_filter != country:
                continue

        follower = utils.parse_follower_count(influencer.get('follower', ""))
        if follower_filter == 1:
            if follower > 100:
                continue
        elif follower_filter == 2:
            if follower <= 100 or follower > 500:
                continue
        elif follower_filter == 3:
            if follower <= 500 or follower > 1000:
                continue
        elif follower_filter == 4:
            if follower <= 1000:
                continue

        hashtags = influencer.get('total_hashtag', [])
        influencer_hashtags.extend(hashtags)

        if follower:
            influencer_followers.append(follower)

        name = influencer.get('name', "")
        if name:
            influencer_names.append(name)

        # profile = influencer.get('profile', "")
        # if profile:
        #     influencer_profiles.append(profile)

    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    print(len(influencer_names))
    if len(influencer_names) == 0:
        print('No suitable influencer was found, please try again.')
        return jsonify({"notfound": True})

    rankinglist_influencer = utils.ranking(product_hashtags, influencer_hashtags, influencer_followers, influencer_names)

    prompt_ReasonGen = 'These are product detail and one influencer detail of my influencer pool. This influencer is detected as top matched with my product. Give me the summarized reason. I only need the reason.'
    reasonlist_influencer = []

    print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    for name in rankinglist_influencer:
        influencer_data = models.Influencers.objects(name=name).first()

        reason = utils.reason_generating(
            prompt_ReasonGen,
            product_detail,
            str(influencer_data))
        
        Reason_Influencer = models.ReasonInfluencer(
            influencer = influencer_data,
            reason = reason
        )
        Reason_Influencer.save()
        reasonlist_influencer.append(Reason_Influencer)

    job = models.InfluencerMatchings(
        products = products,
        platform = 'platform',
        limitMailbox = True,
        nation = 'nation',
        minFollowerCount = 0,
        maxFollowerCount = 0,
        callbackUrl = 'callbackUrl',
        matchedCount = min(2000, len(influencer_names)),  # Initialize with 0 or any default value
        influencerList = reasonlist_influencer
    )

    job.save()
    return jsonify({"jobID": str(job.id)})

@app.route('/get_influencer_matching_result', methods=['POST'])
def get_influencer_matching_result():
    print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    data = request.get_json()
    model = models.InfluencerMatchings.objects(id=data['jobID']).first()
    # print(model.influencerList[0].influencer.name)
    product_data = []
    influencer_data = []

    for product in model.products:
        print(product)
        temp = models.Products.objects(asin=product).first()
        product_data.append({
            "title": temp.title,
            "SKU": temp.sku,
            "link": temp.link
        })
    # print(product_data)


    for reason_influencer_id in model.influencerList:
        influencer_data.append({
            "influencer": reason_influencer_id.influencer.name,
            "followers": reason_influencer_id.influencer.follower,
            "country": reason_influencer_id.influencer.country,
            "email": reason_influencer_id.influencer.email,
            "reason": reason_influencer_id.reason
        })
    # print(influencer_data)
    # print(influencer_data[0])
    
    return jsonify({
        "product_data": product_data,
        "influencer_data": influencer_data
    })
    return 'success'

@app.route('/ai_write_email', methods=['POST']) 
def email_generating(): 
    # data = request.get_json()
    # jobID = data['jobID']
    # senderName = data['senderName']
    # companyName = data['comopanyName']
    # companyIntro = data['companyIntro']
    # print(jobID)
    # product_detail = ''
    # products = data['products']
    # extraData = data['data']
    # for ele in products:
    #     product_data = product_collection.find_one({"asin": ele})
    #     product_detail = product_detail + 'Title:\n' + product_data['title'] + '\n' + 'Detail:\n' + product_data['detail'] + '\n\n'

    # model_user = data['curModel']
    # model_data = model_collection.find_one({"user": model_user})
    # prompt = model_data['email_write']
    # prompt = prompt.replace("{writer_name}",extraData["senderName"])
    # prompt = prompt.replace("{writer_company_name}",extraData["companyName"])
    # prompt = prompt.replace("{writer_company_introduction}",extraData["companyIntro"])
    # influencer_data = influencer_collection.find_one({"name": influencer_name})
    # email = utils.email_generating(
    #     prompt,
    #     product_detail,
    #     str(influencer_data))
    # print(email)
    # subject, content = utils.email_split(email)
    # # print(subject)
    # # print(content)
    # return jsonify({
    #     'subject': subject,
    #     'content': content
    # })
    return "AI write successfully"

@socketio.on('connect')
def on_connect():
    print('Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)
  