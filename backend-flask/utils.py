import openai
from openai import OpenAI
from dotenv import load_dotenv
import os
import spacy
import json
from sklearn.metrics.pairwise import cosine_similarity

# Load environment variables from .env file
load_dotenv()

# Access API key using os.getenv
api_key = os.getenv("OPENAI_API_KEY")

# print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
# print(api_key)

# Set API key
os.environ["OPENAI_API_KEY"] = api_key

# Use OpenAI
client = OpenAI()

# generate top 20 hashtags of each profile and insert to the influencer_hashtags(totally 25 hashtags per each influencer)

def generate_openai(prompt, content):
    messages = [
        {"role": "user", "content": prompt},
        {"role": "assistant", "content": content}
    ]
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo-16k",
        messages=messages
    )

    return completion.choices[0].message.content
    
def embedded_vec(prompt):
    json_respond = client.embeddings.create(
    model="text-embedding-ada-002",
    input= prompt,
    encoding_format="float"
    )

    json_response = json_respond.json()

    # Load JSON
    response_data = json.loads(json_response)

    # Extract embedding values
    embedding_values = response_data['data'][0]['embedding']

    # Save embedding values to a list
    embedding_list = list(embedding_values)

    # Print or use the embedding list as needed
    # print("Embedding List:", embedding_list)
    return embedding_list

def parse_follower_count(follower):
    if 'k' in follower:
        return int(float(follower.replace('k', '')) * 1000)
    elif 'm' in follower:
        return int(float(follower.replace('m', '')) * 1000000)
    else:
        return int(follower)
    
# spacy.cli.download('en_core_web_md')
# nlp = spacy.load("en_core_web_md")

def ranking(product_hashtags, influencer_hashtags, influencer_followers, influencer_names, socketio):

    product_embedded_vec = embedded_vec(product_hashtags)
    influencer_embedded_data = []

    num_influencers = len(influencer_names)
    for i in range(num_influencers):
        influencer_embedded_vec = embedded_vec(influencer_hashtags[i])
        influencer_embedded_data.append(influencer_embedded_vec)

    similarity_values = []
    for i in range(num_influencers):
        vector1 = [product_embedded_vec]
        vector2 = [influencer_embedded_data[i]]

        # Calculate cosine similarity
        similarity = cosine_similarity(vector1, vector2)

        # The result is a 2D array, get the value at [0, 0]
        cosine_similarity_value = similarity[0][0]

        print("Cosine Similarity:", cosine_similarity_value)
        socketio.emit('log_history', {'data': "Cosine Similarity:" + str(cosine_similarity_value)})
        similarity_values.append(cosine_similarity_value)

    score_influencer_followers = []
    max_followers_numeric = parse_follower_count(max(influencer_followers, key=parse_follower_count))

    for follower in influencer_followers:
        numeric_follower = parse_follower_count(follower)
        score_influencer_followers.append(numeric_follower / max_followers_numeric)

    weight1 = 0.7
    weight2 = 0.3
    
    print(f"Number of influencers: {num_influencers}")
    socketio.emit('log_history', {'data': f"Number of influencers: {num_influencers}"})
    print(f"Length of score_influencer_followers: {len(score_influencer_followers)}")
    socketio.emit('log_history', {'data': f"Length of score_influencer_followers: {len(score_influencer_followers)}"})

    influencer_score = []
    for i in range(num_influencers):
        similarity_value = similarity_values[i]
        follower_score = score_influencer_followers[i]

        # print(f"Type of similarity_values[{i}]: {type(similarity_value)}")
        # print(f"Type of score_influencer_followers[{i}]: {type(follower_score)}")
        print(f"similarity value: {similarity_value}, follower score: {follower_score}")
        socketio.emit('log_history', {'data': f"similarity value: {similarity_value}, follower score: {follower_score}"})
        tp = weight1 * similarity_value + weight2 * follower_score
        print("final score --->", tp)
        socketio.emit('log_history', {'data': "final score --->"+ str(tp)})
        influencer_score.append((tp, i))

    influencer_final_score = sorted(influencer_score, key=lambda x: (-x[0], x[1]))
    final_ranking = []

    for score, i in influencer_final_score:
        print(f"Influencer {i + 1}: {influencer_names[i]} ---> {score}")
        socketio.emit('log_history', {'data': f"Influencer {i + 1}: {influencer_names[i]} ---> {score}"})
        final_ranking.append(influencer_names[i])
    
    return final_ranking

def reason_generating(prompt, product_detail, influencer_detail):
    print("generating reason of ranking...")
    reason = ""
    # prompt = "These are product detail and one influencer detail of my influencer pool. This influencer is detected as top matched with my product. Give me the summarized reason."

    content = []
    content = 'Product detail:\n' + product_detail + 'Influencer detail:\n' + influencer_detail
    reason = generate_openai(prompt, content)
    
    print("Reason generating successed!!")
    return reason

def email_generating(prompt, product_detail, influencer_detail):
    print("generating email by AI assistant...")
    # prompt = "Please generate an introductory short email for a collaboration opportunity with an influencer.\n**Influencer's Name:** {influencer_name}\n**Writer Information:**\n- **Writer Name:** {writer_name}\n- **Writer Company Name:** {writer_company_name}\n- **Writer Company Introduction:** \n{writer_company_introduction}\n**Product Information:**\n{product}\n**Email Purpose:**\nWe are reaching out to  {influencer_name} to explore a collaboration opportunity. We aim to have {influencer_name} feature our latest product in their video content. The email should be persuasive but natural, avoiding spam triggers. Please ensure the product link is included in the content for the influencer to access more details easily.\n**Email Structure:**\n1. Brief introduction of {writer_name} and {writer_company_name}, be short and concise, use between 45 and 58 words in this item.\n2. Introduction of the latest product, highlighting key features using a list, be short concise, use between 45 and 58 words in this item..\n3. A suggestion for collaboration and incorporating the product into the influencer's content.\n4. Offering to send a sample for hands-on experience.\n5. Expressing gratitude and anticipation for potential collaboration.\n6. Closing with an invitation to reply for more details or with shipping information.\n**Note:** Keep the email concise, use between 234 and 289 words in total.\n\nWe hope to establish cooperation with this influencer and let him recommend our products in the video. Please rewrite this email in English based on understanding our purpose. Please make minor changes to the part of the email related to product introduction, if there are links or pictures in the email. Please keep this link or image. Please note that: Minimize the possibility of being judged as spam, such as avoiding aggressive marketing language, all caps,excessive punctuation,or spammy subject lines."
    content = []
    content = 'Product detail: \n' + product_detail + 'Influencer detail: \n' + influencer_detail
    generated_email = generate_openai(prompt, content)  
    return generated_email

def email_split(email_string):
    # Split the email by lines
    lines = email_string.split('\n')

    # # Initialize variables to store the subject and content
    subject = ""
    content = ""

    # Iterate through the lines to extract subject and content
    for line in lines:
        if line.startswith("Subject:"):
            subject = line[len("Subject:"):].strip()
        else:
            content += line + "\n"

    # Remove leading and trailing whitespace from content
    content = content.strip()

    # Print the extracted subject and content
    # print("Subject:", subject)
    # print("\nContent:", content)
    return subject, content