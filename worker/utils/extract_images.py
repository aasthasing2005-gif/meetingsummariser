import os
import cv2

def extract_keyframes(meeting_id, video_path=None):
    """
    Extracts slide-like frames or important images from a meeting video.
    Returns a list of URLs (served by backend/public/images).
    """
    output_dir = "../backend/public/images"
    os.makedirs(output_dir, exist_ok=True)

    image_urls = []

    if not video_path or not os.path.exists(video_path):
        print("🎞️ No video file found — skipping image extraction.")
        return image_urls

    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    step = fps * 10  # every 10 seconds

    frame_no = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_no % step == 0:
            img_name = f"{meeting_id}_frame_{frame_no}.jpg"
            img_path = os.path.join(output_dir, img_name)
            cv2.imwrite(img_path, frame)
            image_urls.append(f"http://localhost:5000/images/{img_name}")
        frame_no += 1

    cap.release()
    print(f"🖼️ Extracted {len(image_urls)} keyframes.")
    return image_urls
