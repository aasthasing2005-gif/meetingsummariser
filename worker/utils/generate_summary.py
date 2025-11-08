import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found! Please set it in your .env file or environment variables.")

def list_models():
    """
    Fetches the list of available models from the Gemini API.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def generate_summary_json(transcript: str) -> dict:
    """
    Generates a summary of the meeting transcript using the Gemini API.
    """
    if not transcript.strip():
        return {"summary": "", "action_items": [], "decisions": [], "important_images": []}

    # Verify available models
    models = list_models()
    print("Available Models:", models)

    # Check if the desired model is available
    model_name = "gemini-1.5-flash"
    available_models = [model["name"] for model in models.get("models", [])]
    if model_name not in available_models:
        raise ValueError(f"❌ Model '{model_name}' not found in available models: {available_models}")

    prompt = f"""
    You are an intelligent meeting summarizer.
    Summarize the following meeting transcript into strictly valid JSON with keys:
    summary (string), action_items (list of objects: text, owner, due), 
    decisions (list of strings), important_images (list of URLs if mentioned).
    Transcript:
    {transcript}
    """

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        }

        headers = {"Content-Type": "application/json"}
        resp = requests.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

        # Parse the response
        text_output = data["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(text_output)
        print("🧠 Gemini summary generated.")
        return parsed

    except Exception as e:
        print(f"⚠️ Gemini parsing error: {e}")
        return {
            "summary": "",
            "action_items": [],
            "decisions": [],
            "important_images": [],
        }