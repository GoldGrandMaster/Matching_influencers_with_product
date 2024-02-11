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

# @app.route('/add_data', methods=['POST']) 
# def add_data(): 
#     # Get data from request 
#     data = request.json 
  
#     # Insert data into MongoDB 
#     model_collection.insert_one(data) 
  
#     return 'Model Data added to MongoDB'

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

@app.route('/find_profile', methods=['POST'])
def get_influencer():
    _name = request.json.get("name")
    collection = influencer_collection
    influencers = models.Influencers.objects(name=_name)

    result = [profile.to_json() for profile in influencers]
    return json_util.dumps(result[0])

@app.route('/delete_data_influencers', methods=['DELETE'])
def delete_data_influencers():
    data = request.get_json()
    _id = data["_id"]
    print(_id)
    influencer = models.Influencers.objects.get(id=_id)
    print(influencer)
    influencer.delete()
    return "Influencer Data deleted"

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

@app.route('/add_data_models', methods=['POST']) 
def add_data_models(): 
    if request.method == "POST":
        data = request.get_json()
        print(data)
        newData = models.Models(**data).save()
        return 'Model Data added to MongoDB'
    else:
        data = models.Models().get()
        return jsonify(data)

@app.route('/update_data_models', methods=['POST'])
def update_data_models():
    if request.method == "POST":
        try:
            data = request.get_json()  # Get JSON data from the request
            model = models.Models.objects(id=data["_id"]).first()  # Retrieve the existing product

            if not model:
                return jsonify({'error': 'Model not found'}), 404

            # Update the product fields with the new data
            for key, value in data["data"].items():
                setattr(model, key, value)

            model.save()  # Save the updated product
            return jsonify({'message': 'Model updated successfully', 'model': str(model)}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/get_data_models', methods=['GET'])
def get_data_models():
    collection = model_collection
    data = list(collection.find())
    data_str = json_util.dumps(data)
    return data_str

@app.route('/delete_data_models', methods=['DELETE'])
def delete_data_models():
    data = request.get_json()
    _id = data["_id"]
    model = models.Models.objects.get(id=_id)
    model.delete()
    return "Model Data deleted"


influencer_profiles = []
influencer_hashtags = []
influencer_names = []
influencer_followers = []

@app.route('/gen_hashtags', methods=['GET'])
def get_hashtags():
            
    collection = influencer_collection
    data = list(collection.find())
    # Convert ObjectId to string before JSON serialization
    influencer_profiles = [d["profile"] for d in data]
    influencer_names = [d["name"] for d in data]
    influencer_followers = [d["follower"] for d in data]
    hashtags = [d["hashtag"] for d in data]
    hashtags_prompt = "Give me top 20 hashtags of this influencer profile. I need only exactly 20 hashtags as answer."
    num_influencers = len(influencer_profiles)

    influencer_hashtags = []
    for i in range(num_influencers):
        tags_list = [tag.strip('#') for tag in hashtags[i].split(', ')]
        influencer_hashtags.append(tags_list)
    print(len(influencer_hashtags[0]))
    print(influencer_hashtags)

    for i in range(num_influencers):
        print('----------------------------------------------')
        print(i)
        while True:
            respond = utils.generate_openai(hashtags_prompt, influencer_profiles[i])

            hashtags_list = [word.strip("#") for word in respond.split() if word.startswith("#")]
            if(len(hashtags_list) == 20):
                influencer_hashtags[i].extend(hashtags_list)
                break
    
    for index, document in enumerate(models.Influencers.objects):
        new_field_name = 'total_hashtag'
        
        document[new_field_name] = influencer_hashtags[index]
        
        document.save()

    # # Fetch influencer hashtags and followers
    # influencer_data = list(influencer_collection.find({}, {
    #     "total_hashtag": 1,
    #     "follower": 1,
    #     "name": 1,
    #     "_id": 0
    # }))

    # # Separate hashtags, followers, and names into their own lists
    # influencer_hashtags = []
    # influencer_followers = []
    # influencer_names = []
    # for influencer in influencer_data:
    #     hashtags = influencer.get('total_hashtag', [])
    #     influencer_hashtags.extend(hashtags)

    #     follower = influencer.get('follower', "")
    #     if follower:
    #         influencer_followers.append(follower)

    #     name = influencer.get('name', "")
    #     if name:
    #         influencer_names.append(name)
    return  "generated success"


@app.route('/run', methods=['POST']) 
def run(): 
    if request.method == "POST":
        data = request.get_json()
        # product_detail = data['productdetails']
        # print(product_detail)
        product_detail = ''
        products = data['products']
        for ele in products:
            product_data = product_collection.find_one({"asin": ele})
            product_detail = product_detail + 'Title:\n' + product_data['title'] + '\n' + 'Detail:\n' + product_data['detail'] + '\n\n'
            # print(product_data)
            # print('---------------------')

        print(product_detail)
        model_user = data['curModel']
        socketio.emit('log_history', {'data': product_detail})
        
        print('@@@@@@@@@@@@@@@')
        model_data = model_collection.find_one({"user": model_user})
        # print(model_data['influencer_hashtag_gen'])

        persona = utils.generate_openai(model_data['buyer_persona_gen'], product_detail)
        print(persona)
        socketio.emit('log_history', {'data': persona})
        # history.append(str(persona))

        product_hashtags_temp = utils.generate_openai(model_data['persona_hashtag_gen'], persona)
        print(product_hashtags_temp)
        socketio.emit('log_history', {'data': product_hashtags_temp})
        # history.append(str(product_hashtags_temp))

        product_hashtags = re.findall(r'#\w+', product_hashtags_temp)
        print(product_hashtags)
        socketio.emit('log_history', {'data': product_hashtags})
        # history.append(str(product_hashtags))

        product_hashtags = [word[1:] for word in product_hashtags]
        print(product_hashtags)
        socketio.emit('log_history', {'data': product_hashtags})

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

        ranking = utils.ranking(product_hashtags, influencer_hashtags, influencer_followers, influencer_names, socketio)
        return [{
            'name': rank
        } for rank in ranking]
    else:
        return jsonify(data)

@app.route('/generate_email', methods=['POST']) 
def email_generating(): 
    data = request.get_json()
    influencer_name = data['name']
    product_detail = ''
    products = data['products']
    extraData = data['data']
    for ele in products:
        product_data = product_collection.find_one({"asin": ele})
        product_detail = product_detail + 'Title:\n' + product_data['title'] + '\n' + 'Detail:\n' + product_data['detail'] + '\n\n'

    model_user = data['curModel']
    model_data = model_collection.find_one({"user": model_user})
    prompt = model_data['email_write']
    prompt = prompt.replace("{writer_name}",extraData["senderName"])
    prompt = prompt.replace("{writer_company_name}",extraData["companyName"])
    prompt = prompt.replace("{writer_company_introduction}",extraData["companyIntro"])
    influencer_data = influencer_collection.find_one({"name": influencer_name})
    email = utils.email_generating(
        prompt,
        product_detail,
        str(influencer_data))
    print(email)
    subject, content = utils.email_split(email)
    # print(subject)
    # print(content)
    return jsonify({
        'subject': subject,
        'content': content
    })

@app.route('/regenerate_email', methods=['POST']) 
def email_regenerating(): 
    data = request.get_json()
    influencer_name = data['name']
    product_detail = ''
    products = data['products']
    prevData = data['prevData']
    for ele in products:
        product_data = product_collection.find_one({"asin": ele})
        product_detail = product_detail + 'Title:\n' + product_data['title'] + '\n' + 'Detail:\n' + product_data['detail'] + '\n\n'

    prevDataDetail = 'Subject: ' + prevData["subject"] + '\n' + prevData["message"]
    model_user = data['curModel']
    model_data = model_collection.find_one({"user": model_user})
    prompt = model_data['email_rewrite']
    
    influencer_data = influencer_collection.find_one({"name": influencer_name})
    email = utils.email_regenerating(
        prompt,
        product_detail,
        str(influencer_data),
        prevDataDetail)
    print(email)
    subject, content = utils.email_split(email)
    # print(subject)
    # print(content)
    return jsonify({
        'subject': subject,
        'content': content
    })

@app.route('/generate_reason', methods=['POST'])
def reason_generating():
    data = request.get_json()
    product_detail = ''
    products = data['product']
    for ele in products:
        product_data = product_collection.find_one({"asin": ele})
        product_detail = product_detail + 'Title:\n' + product_data['title'] + '\n' + 'Detail:\n' + product_data['detail'] + '\n\n'

    influencer_name = data['name']
    influencer_data = influencer_collection.find_one({"name": influencer_name})

    model_user = data['curModel']
    model_data = model_collection.find_one({"user": model_user})
    prompt = model_data['reason_gen']
    
    reason = utils.reason_generating(
        prompt,
        product_detail,
        str(influencer_data))
    return jsonify(reason)

@socketio.on('connect')
def on_connect():
    print('Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)
  