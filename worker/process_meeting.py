import sys, os, json
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Import helper modules
from utils.extract_images import extract_keyframes
from utils.detect_urgency import calculate_urgency
from utils.generate_summary import generate_summary_json

# Load environment variables
load_dotenv()

# Database setup
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("❌ MONGO_URI not found! Please set it in your .env file.")

client = MongoClient(MONGO_URI)
db = client["meetgist"]
meetings = db["meetings"]

if len(sys.argv) < 2:
    print("❌ Usage: python process_meeting.py <meeting_id>")
    sys.exit(1)

mid = sys.argv[1]
meeting = meetings.find_one({"_id": ObjectId(mid)})

if not meeting:
    print("❌ Meeting not found")
    sys.exit(1)

transcript = meeting.get("transcript", "")
if not transcript:
    print("⚠️ No transcript found for this meeting.")
    sys.exit(0)

print(f"📘 Processing meeting ID: {mid}")

try:
    # --- Step 1: Extract important images (if video available) ---
    important_images = extract_keyframes(meeting_id=mid)

    # --- Step 2: Calculate urgency score (semantic + prosody heuristic) ---
    urgency_score = calculate_urgency(transcript)

    # --- Step 3: Summarize meeting and extract key info ---
    summary_data = generate_summary_json(transcript)

    # --- Step 4: Save results back to MongoDB ---
    meetings.update_one(
        {"_id": ObjectId(mid)},
        {
            "$set": {
                "summary": summary_data.get("summary", ""),
                "actionItems": [
                    ai.get("text") if isinstance(ai, dict) else ai
                    for ai in summary_data.get("action_items", [])
                ],
                "importantImages": summary_data.get("important_images", important_images),
                "urgencyScore": urgency_score,
                "status": "completed",
            }
        },
    )

    print(f"✅ Meeting {mid} processed successfully!")

except Exception as e:
    print(f"❌ Error processing meeting ID {mid}: {e}")
    sys.exit(1)