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
    for ele in products:
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

    # Fetch influencer hashtags and followers
    influencer_data = list(influencer_collection.find({}, {
        "total_hashtag": 1,
        "follower": 1,
        "name": 1,
        "profile": 1,
        "_id": 0
    }))
    
    # Separate hashtags, followers, and names into their own lists
    influencer_hashtags = []
    influencer_followers = []
    influencer_names = []
    influencer_profiles = []
    for influencer in influencer_data:
        hashtags = influencer.get('total_hashtag', [])
        influencer_hashtags.extend(hashtags)

        follower = influencer.get('follower', "")
        if follower:
            influencer_followers.append(follower)

        name = influencer.get('name', "")
        if name:
            influencer_names.append(name)

        profile = influencer.get('profile', "")
        if profile:
            influencer_profiles.append(profile)

    rankinglist_influencer = utils.ranking(product_hashtags, influencer_hashtags, influencer_followers, influencer_names)
    return [{
        'name': rank
    } for rank in rankinglist_influencer]
    return 'success run!!'

@socketio.on('connect')
def on_connect():
    print('Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)
  