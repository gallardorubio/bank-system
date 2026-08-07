import os
from dotenv import load_dotenv

load_dotenv()

KAFKA_HOST = os.getenv("KAFKA_HOST")
KAFKA_PORT = os.getenv("KAFKA_PORT")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID")
BOOTSTRAP_SERVERS = f"{KAFKA_HOST}:{KAFKA_PORT}"