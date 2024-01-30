from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['MetajointCorp']
# collection = db['influencers']

# # Get the _id of the 79th and 998th document
# start_document = collection.find().sort('_id', 1).skip(78).limit(1).next()  # 79th document
# end_document = collection.find().sort('_id', 1).skip(998).limit(1).next()  # 998th document

# # Delete documents from 79th to 998th
# result = collection.delete_many({'_id': {'$gt': start_document['_id'], '$lte': end_document['_id']}})

# print(f'Documents deleted: {result.deleted_count}')

collection = db['products']

import csv

# Define lists for each column
asins = []
product_images = []
titles = []
details = []

import csv


# Open and read the CSV file
with open('products_sample.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    
    for row in reader:
        product_data = {
            'asin': row['asin'],
            'title': row['Title'],
            'link': row['Product Image'],
            'detail': row['Detail']
        }
        try:
            collection.insert_one(product_data)
        except DuplicateKeyError:  # Corrected exception handling
            print(f"Duplicate entry for ASIN: {row['asin']}")
