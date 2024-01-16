from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['MetajointCorp']
collection = db['influencers']

# Get the _id of the 79th and 998th document
start_document = collection.find().sort('_id', 1).skip(78).limit(1).next()  # 79th document
end_document = collection.find().sort('_id', 1).skip(998).limit(1).next()  # 998th document

# Delete documents from 79th to 998th
result = collection.delete_many({'_id': {'$gt': start_document['_id'], '$lte': end_document['_id']}})

print(f'Documents deleted: {result.deleted_count}')
