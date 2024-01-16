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
    print("Embedding List:", embedding_list)
    return embedding_list

def parse_follower_count(follower):
    if 'k' in follower:
        return int(float(follower.replace('k', '')) * 1000)
    elif 'm' in follower:
        return int(float(follower.replace('m', '')) * 1000000)
    else:
        return int(follower)
    
def ranking(product_hashtags, influencer_hashtags, influencer_followers, influencer_names):
    spacy.cli.download('en_core_web_md')
    nlp = spacy.load("en_core_web_md")

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
        similarity_values.append(cosine_similarity_value)

    score_influencer_followers = []
    max_followers_numeric = parse_follower_count(max(influencer_followers, key=parse_follower_count))

    for follower in influencer_followers:
        numeric_follower = parse_follower_count(follower)
        score_influencer_followers.append(numeric_follower / max_followers_numeric)

    weight1 = 0.7
    weight2 = 0.3
    
    print(f"Number of influencers: {num_influencers}")
    print(f"Length of score_influencer_followers: {len(score_influencer_followers)}")

    influencer_score = []
    for i in range(num_influencers):
        similarity_value = similarity_values[i]
        follower_score = score_influencer_followers[i]

        # print(f"Type of similarity_values[{i}]: {type(similarity_value)}")
        # print(f"Type of score_influencer_followers[{i}]: {type(follower_score)}")
        print(f"similarity value: {similarity_value}, follower score: {follower_score}")
        tp = weight1 * similarity_value + weight2 * follower_score
        print("final score --->", tp)
        influencer_score.append((tp, i))

    influencer_final_score = sorted(influencer_score, key=lambda x: (-x[0], x[1]))
    final_ranking = []

    for score, i in influencer_final_score:
        print(f"Influencer {i + 1}: {influencer_names[i]} ---> {score}")
        final_ranking.append(influencer_names[i])
    
    return final_ranking