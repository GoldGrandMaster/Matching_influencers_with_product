from flask import Flask, request, Response, stream_with_context
from pymongo import MongoClient
import models, utils
import mongoengine
import json
import re
import time
import requests

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

@app.route('/get_data_influencers', methods=['POST'])
def get_data_influencers():
    data = request.get_json()
    rowsPerpage = data["rowsPerPage"]
    page = data["page"]
    searchword = data["searchword"]
    collection = influencer_collection

    regex = re.compile(f'.*{searchword}.*', re.IGNORECASE)

    results = collection.find({'$or': [{key: {'$regex': regex}} for key in collection.find_one()]}).skip(rowsPerpage * page).limit(rowsPerpage)
    
    result_list = [json_util.dumps(document) for document in results]
    #result_list = [json_util.loads(document) for document in result_list]

    return jsonify({'data': result_list, 'count': collection.count_documents({'$or': [{key: {'$regex': regex}} for key in collection.find_one()]})})

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
def ai_write_email(): 
    data = request.get_json()
    jobID = data['jobID']
    senderName = data['senderName']
    companyName = data['companyName']
    companyIntro = data['companyIntro']
    print(jobID)
    print(senderName)
    model = models.InfluencerMatchings.objects(id=data['jobID']).first()
    # print(model.influencerList[0].influencer.name)
    product_data = []
    influencer_data = []

    for product in model.products:
        print(product)
        temp = models.Products.objects(asin=product).first()
        product_data.append({
            "title": temp.title,
            "detail": temp.detail,
            "link": temp.link
        })
    print(product_data[0])


    for reason_influencer_id in model.influencerList:
        influencer_data.append({
            "id": reason_influencer_id.influencer.id,
            "influencer": reason_influencer_id.influencer.name,
            "followers": reason_influencer_id.influencer.follower,
            "country": reason_influencer_id.influencer.country,
            "email": reason_influencer_id.influencer.email,
            "reason": reason_influencer_id.reason
        })
    # print(influencer_data)
    print(influencer_data[0])
    product_detail = ''
    # products = data['products']
    # extraData = data['data']
    for ele in product_data:
        product_detail = product_detail + 'Title:\n' + ele['title'] + '\n' + 'Product Link:\n' + ele['link'] + '\n' + 'Detail:\n' + ele['detail'] + '\n\n'

    print(product_detail)
    prompt = "Please generate an introductory short email for a collaboration opportunity with an influencer. **Influencer's Name:** {influencer_name} **Writer Information:** - **Writer Name:** {writer_name} - **Writer Company Name:** {writer_company_name} - **Writer Company Introduction:** {writer_company_introduction} **Product Information:** {product} **Email Purpose:** We are reaching out to  {influencer_name} to explore a collaboration opportunity. We aim to have {influencer_name} feature our latest product in their video content. The email should be persuasive but natural, avoiding spam triggers. Please ensure the product link is included in the content for the influencer to access more details easily. **Email Structure:** 1. Brief introduction of {writer_name} and {writer_company_name}, be short and concise, use between 45 and 58 words in this item. 2. Introduction of the latest product, highlighting key features using a list, be short concise, use between 45 and 58 words in this item.. 3. A suggestion for collabora"
    prompt = prompt.replace("{writer_name}", senderName)
    prompt = prompt.replace("{writer_company_name}", companyName)
    prompt = prompt.replace("{writer_company_introduction}", companyIntro)
    email_list = []
    for ele in influencer_data:
        content = utils.email_generating(
            prompt,
            product_detail,
            str(ele)
        )
        email = models.Emails(
            influencerId = ele['id'],
            emailContent = content,
            reason = ele['reason']
        )
        email.save()
        email_list.append(email.id)

    writing_emails = models.WritingEmails(
        language = 'English',
        senderName = senderName,
        companyName = companyName,
        companyDesc = companyIntro,
        emailRemark = 'emailRemark',
        influencerJobId = jobID,
        callbackUrl = 'callbackUrl',
        emails = email_list
    )
    writing_emails.save()
    # subject, content = utils.email_split(email)
    # # print(subject)
    # # print(content)
    return jsonify({
        'jobID': str(writing_emails.id)
    })
    # return "AI write successfully"

@app.route('/get_emails', methods=['POST'])
def get_emails():
    data = request.get_json()
    jobID = data['jobID']
    writing_email = models.WritingEmails.objects(id=jobID).first()

    products = writing_email.influencerJobId.products
    product_list = []
    for ele in products:
        temp = models.Products.objects(asin=ele).first()
        product_list.append({
            "sku": temp.sku,
            "country": temp.country,
            "channel": temp.platform,
            "asin": temp.asin,
            "detail": temp.detail,
            "link": temp.link,
            "sample": temp.sample
        })

    influencer_list = []
    for ele in writing_email.emails:
        # temp = models.Emails.objects(id=ele).first()
        influencer = ele.influencerId
        subject, content = utils.email_split(ele.emailContent)
        influencer_list.append({
            "name": influencer.name,
            "follower": influencer.follower,
            "country": influencer.country,
            "email": influencer.email,
            "reason": ele.reason,
            "prompt": '---',
            "emailContent": {
                "subject": subject,
                "content": content
            }
        })


    return jsonify({
        "products": product_list,
        "influencers": influencer_list,
        'influencerjobID': str(writing_email.influencerJobId.id)
    })

@app.route('/ai_rewrite_email', methods=['POST']) 
def ai_rewrite_email(): 
    data = request.get_json()
    jobID = data['jobID']
    title = data['title']
    mailContent = data['mailContent']
    language = data['language']
    prompt = data['prompt']
    print(jobID)
    model = models.InfluencerMatchings.objects(id=data['jobID']).first()
    # print(model.influencerList[0].influencer.name)
    product_data = []
    influencer_data = []

    for product in model.products:
        print(product)
        temp = models.Products.objects(asin=product).first()
        product_data.append({
            "title": temp.title,
            "detail": temp.detail,
            "link": temp.link
        })
    print(product_data[0])


    for reason_influencer_id in model.influencerList:
        influencer_data.append({
            "id": reason_influencer_id.influencer.id,
            "influencer": reason_influencer_id.influencer.name,
            "followers": reason_influencer_id.influencer.follower,
            "country": reason_influencer_id.influencer.country,
            "email": reason_influencer_id.influencer.email,
            "reason": reason_influencer_id.reason
        })
    # print(influencer_data)
    print(influencer_data[0])
    product_detail = ''
    # products = data['products']
    # extraData = data['data']
    for ele in product_data:
        product_detail = product_detail + 'Title:\n' + ele['title'] + '\n' + 'Product Link:\n' + ele['link'] + '\n' + 'Detail:\n' + ele['detail'] + '\n\n'

    print(product_detail)
    
    preEmail = 'Subject:\n' + title + '\n' + 'Content:\n' + mailContent
    email_list = []
    for ele in influencer_data:
        content = utils.email_regenerating(
            prompt,
            product_detail,
            str(ele),
            preEmail
        )
        email = models.Emails(
            influencerId = ele['id'],
            emailContent = content,
            reason = ele['reason']
        )
        email.save()
        email_list.append(email.id)

    writing_emails = models.WritingEmails(
        title = title,
        emailContent = mailContent,
        language = language,
        emailRemark = 'remark',
        influencerJobId = jobID,
        emails = email_list
    )
    writing_emails.save()
    # subject, content = utils.email_split(email)
    # # print(subject)
    # # print(content)
    return jsonify({
        'jobID': str(writing_emails.id)
    })
    # return "AI write successfully"

@app.route('/get_rewrite_emails', methods=['POST'])
def get_rewrite_emails():
    data = request.get_json()
    jobID = data['jobID']
    rewriting_email = models.ReWritingEmails.objects(id=jobID).first()

    products = rewriting_email.influencerJobId.products
    product_list = []
    for ele in products:
        temp = models.Products.objects(asin=ele).first()
        product_list.append({
            "sku": temp.sku,
            "country": temp.country,
            "channel": temp.platform,
            "asin": temp.asin,
            "detail": temp.detail,
            "link": temp.link,
            "sample": temp.sample
        })

    influencer_list = []
    for ele in rewriting_email.emails:
        # temp = models.Emails.objects(id=ele).first()
        influencer = ele.influencerId
        subject, content = utils.email_split(ele.emailContent)
        influencer_list.append({
            "name": influencer.name,
            "follower": influencer.follower,
            "country": influencer.country,
            "email": influencer.email,
            "reason": ele.reason,
            "prompt": '---',
            "emailContent": {
                "subject": subject,
                "content": content
            }
        })


    return jsonify({
        "products": product_list,
        "influencers": influencer_list,
        'influencerjobID': str(rewriting_email.influencerJobId.id)
    })

@app.route('/request_influencer_data', methods=['GET'])
def request_influencer_data():
    params = {
        'grant_type': 'client_credentials',
        'client_id': 'a7BYBTySB4h4CVTRP_JZQ',
        'client_secret': 'vd5zejJegOPqtWidcWgGAo4GGTc5WAmrNzgiCBF1qQIhnJZrcJNoAyHuBFVVDUS5DYQAo8mJH2BHmjDKN2ielrCN12GUx82HCAcVa3ulBbbuuxUZs9p8_Cl9OlwxAv7k'
    }
    response = requests.get("https://terra.chinamade.com/auth/oauth2/client_token", params=params)
    if response.status_code == 200:
        response_json = response.json()
        client_token = response_json["data"]["client_token"]
        print(client_token)

        headers = {
            'X-REQUEST-ID': "123123",
            'Content-Type': 'application/json',
            'X-APPLICATION-NAME': 'ai-model2',
            'X-ACCESS-TOKEN': client_token
        }

        pageNo = int(len(models.Influencers.objects()) / 100)
        pagesize = 100
        print("Influencer data uploading...")
        while True:
            url = "https://terra.chinamade.com/store/malls/fishpond/forai/pages/{}/pagesize/{}".format(pageNo, pagesize)
            res = requests.get(url, headers=headers)
            if res.status_code == 401:
                response = requests.get("https://terra.chinamade.com/auth/oauth2/client_token", params=params)
                if response.status_code == 200:
                    response_json = response.json()
                    client_token = response_json["data"]["client_token"]
                    headers = {
                        'X-REQUEST-ID': "123123",
                        'Content-Type': 'application/json',
                        'X-APPLICATION-NAME': 'ai-model2',
                        'X-ACCESS-TOKEN': client_token
                    }
                    url = "https://terra.chinamade.com/store/malls/fishpond/forai/pages/{}/pagesize/{}".format(pageNo, pagesize)
                    res = requests.get(url, headers=headers)
            res_json = res.json()
            # print(res_json)
            influencers = res_json['data']['influencers']
            for influencer in influencers:
                if len(models.Influencers.objects(userid=influencer['influencerId'])) == 0:
                    new_influencer = models.Influencers(
                        name = influencer["influencerName"],
                        userid = influencer["influencerId"],
                        email = "",
                        platform = influencer["platforms"],
                        country = influencer["country"],
                        hashtag = influencer["hastags"],
                        profile = influencer["influencerProfile"],
                        follower = influencer["followersQty"],
                        total_video = influencer["totalVideosQty"],
                        recent_30video_view = influencer["last30VideosViewsQty"],
                        recent_30video_like = influencer["last30VideosLikesQty"],
                        recent_30video_comment = influencer["last30VideosCommentsQty"],
                        title_last_10video = influencer["last30VideosTitle"],
                        profile_last_10video = influencer["last30VideosProflle"],
                        saleVideo = influencer["saleVideo"],
                        total_hashtag = [],
                    )
                    new_influencer.save()
            if res_json['data']['hasNext'] is False:
                break
            pageNo = pageNo + 1
        return jsonify({'success': True})
    else:
        print(f'Error: {response.status_code}')
        return jsonify({'success': False})

@socketio.on('connect')
def on_connect():
    print('Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)
  