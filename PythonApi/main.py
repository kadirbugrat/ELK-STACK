import logging
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import logging
from pymongo import MongoClient


app = FastAPI()

# MongoDB Config
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["pythonDB"]
users_collection = db["users"]

class User(BaseModel):
    name: str
    email: str

class UserInDB(User):
    id: int

# In-memory database
users_db = []
current_id = 1

# Logging Configuration 
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "message": record.getMessage(),
            "level": record.levelname,
            "time": self.formatTime(record, self.datefmt),
            "name": record.name,
        }
        return json.dumps(log_data)

# Logger
logger = logging.getLogger("api_logger")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()  # Logları terminale yazdırmak için
handler.setFormatter(logging.Formatter('%(message)s'))
logger.addHandler(handler)

# Elasticsearch configurations
ELASTICSEARCH_URL = "http://localhost:9200"  # Updated URL
HEADERS = {"Content-Type": "application/json"}

# def log_to_elasticsearch(log_data):
#     response = requests.post(f"{ELASTICSEARCH_URL}/api-logs/_doc", headers=HEADERS, data=json.dumps(log_data))
#     response.raise_for_status()

def log_to_elasticsearch(log_data):
    index_name = f"api-logs-{datetime.now().strftime('%Y.%m')}"
    response = requests.post(f"{ELASTICSEARCH_URL}/{index_name}/_doc", headers=HEADERS, data=json.dumps(log_data))
    response.raise_for_status()

# API Endpoints
@app.get("/")
async def read_root():
    log_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "endpoint": "/",
        "message": "Root endpoint called rmooooooooooo",
        "status": "success"
    }
    logger.info(json.dumps(log_data))
    log_to_elasticsearch(log_data)
    return {"message": "Hello, World!"}
    

@app.get("/api/users")
async def fetch_users():
    try:
        users = list(users_collection.find({}, {"_id": 0}))
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "endpoint": "/api/users",
            "method": "GET",
            "message": "Users FETCHED!"
        }
        logger.info(json.dumps(log_data))
        log_to_elasticsearch(log_data)
        return users
    except Exception as e:
        logger.error(f"Error in fetch_users: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/api/users")
async def register_user(user: User):
    global current_id
    try:
        user_in_db = UserInDB(id=users_collection.count_documents({}) + 1, **user.dict())
        users_collection.insert_one(user_in_db.dict())
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "endpoint": "/api/users",
            "method": "POST",
            "message": f"User with ID {user_in_db.id} is REGISTERED!"
        }
        logger.info(json.dumps(log_data))
        log_to_elasticsearch(log_data)
        current_id += 1
        return {"id": user_in_db.id}
    except Exception as e:
        logger.error(f"Error in register_user: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int):
    try:
        global users_db
        result = users_collection.delete_one({"id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "endpoint": f"/api/users/{user_id}",
            "method": "DELETE",
            "message": f"User with ID {user_id} is DELETED"
        }
        logger.info(json.dumps(log_data))
        log_to_elasticsearch(log_data)
        return {"message": "User DELETED"}
    except Exception as e:
        logger.error(f"Error in delete_user: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

