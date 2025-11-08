import numpy as np
from sentence_transformers import SentenceTransformer

def calculate_urgency(transcript: str) -> float:
    """
    Compute urgency score based on semantic variation and speaking rate.
    Returns a float (0-10 range approx).
    """
    words = transcript.split()
    word_count = len(words)
    duration = max(1.0, word_count / 2.5)  # ~2.5 words/sec
    speaking_rate = word_count / duration

    # Compute semantic variation
    sbert = SentenceTransformer("all-MiniLM-L6-v2")
    chunks = [transcript[i:i + 800] for i in range(0, len(transcript), 800)]
    embs = sbert.encode(chunks)
    semantic_var = float(np.std(embs))

    urgency = semantic_var + (speaking_rate / 10.0)
    urgency = round(max(0.0, urgency), 2)

    print(f"⚡ Urgency Score: {urgency}")
    return urgency
