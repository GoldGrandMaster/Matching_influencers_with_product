from flask import Flask, request, Response, stream_with_context
from pymongo import MongoClient
import models, utils
import mongoengine
import json
import re
import time

from flask_cors import CORS
from flask import jsonify

from bson import json_util

app = Flask(__name__)
CORS(app)

# Set up MongoDB connection 
client = MongoClient('mongodb://localhost:27017/') 
db = client['MetajointCorp'] 
influencer_collection = db['influencers'] 
product_collection = db['products']
model_collection = db['models']
history = ''
is_history_sent = False

# Set up the default MongoDB connection for Flask-MongoEngine
mongoengine.connect('MetajointCorp', host='mongodb://localhost:27017/')

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/add_data', methods=['POST']) 
def add_data(): 
    # Get data from request 
    data = request.json 
  
    # Insert data into MongoDB 
    model_collection.insert_one(data) 
  
    return 'Model Data added to MongoDB'

@app.route('/add_data_influencers', methods=['POST']) 
def add_data_influencers(): 
    # Get data from request 
    if request.method == "POST":
        data = request.get_json()
        print(data)
        newData = models.Influencers(**data).save()
        return 'Influencer Data added to MongoDB'
    else:
        data = models.Influencers().get()
        return jsonify(data)

@app.route('/get_data_influencers', methods=['GET'])
def get_data_influencers():
    collection = influencer_collection
    data = list(collection.find())
    # Convert ObjectId to string before JSON serialization
    data_str = json_util.dumps(data)
    return data_str

@app.route('/delete_data_influencers', methods=['DELETE'])
def delete_data_influencers():
    data = request.get_json()
    _id = data["_id"]
    print(_id)
    influencer = models.Influencers.objects.get(id=_id)
    print(influencer)
    influencer.delete()
    return "Influencer Data deleted"

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

@app.route('/gen_hashtags', methods=['GET'])
def get_hashtags():
    collection = influencer_collection
    data = list(collection.find())
    # Convert ObjectId to string before JSON serialization
    influencer_profiles = [d["profile"] for d in data]
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

    return "Model run successed"

@app.route('/add_data_products', methods=['POST']) 
def add_data_products(): 
    # Get data from request 
    data = request.json 
  
    # Insert data into MongoDB
    product_collection.insert_one(data) 
  
    return 'Product Data added to MongoDB'

def event_stream():
    while True:
        time.sleep(1)  # Delay for demonstration; adjust as needed
        global history
        global is_history_sent
        is_history_sent = True
        yield history

@app.route('/history')
def stream():
    return Response(event_stream(), content_type='text/event-stream')

@app.route('/run', methods=['POST']) 
def run(): 
    if request.method == "POST":
        global history
        global is_history_sent
        history = ''
        data = request.get_json()
        product_detail = data['productdetails']
        model_name = data['curModel']
        print(product_detail)
        # history.append(str(product_detail))
        history += str(product_detail) + '\n'
        is_history_sent = False
        
        model_data = model_collection.find_one({"name": model_name})

        persona = utils.generate_openai(model_data['prompt2'], product_detail)
        print(persona)
        # history.append(str(persona))

        product_hashtags_temp = utils.generate_openai(model_data['prompt3'], persona)
        print(product_hashtags_temp)
        # history.append(str(product_hashtags_temp))

        product_hashtags = re.findall(r'#\w+', product_hashtags_temp)
        print(product_hashtags)
        # history.append(str(product_hashtags))

        product_hashtags = [word[1:] for word in product_hashtags]
        print(product_hashtags)

        # Fetch influencer hashtags and followers
        influencer_data = list(influencer_collection.find({}, {"total_hashtag": 1, "follower": 1, "name": 1, "_id": 0}))

        # Separate hashtags, followers, and names into their own lists
        influencer_hashtags = []
        influencer_followers = []
        influencer_names = []
        for influencer in influencer_data:
            hashtags = influencer.get('total_hashtag', [])
            influencer_hashtags.extend(hashtags)

            follower = influencer.get('follower', "")
            if follower:
                influencer_followers.append(follower)

            name = influencer.get('name', "")
            if name:
                influencer_names.append(name)

        ranking = utils.ranking(product_hashtags, influencer_hashtags, influencer_followers, influencer_names)
        return [{'name': rank, 'reason': 'This ranking is calculated by followers of influencers and cosine similarity of hashtags between influencers and product'} for rank in ranking]
    else:
        return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
  