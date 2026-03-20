import os
from PIL import Image

INPUT_DIR = "assets"
OUTPUT_DIR = "assets-optimized"
MAX_SIZE = (500, 500)  # resize bounds

os.makedirs(OUTPUT_DIR, exist_ok=True)

def process_gif(input_path, output_path):
    try:
        img = Image.open(input_path)
        frames = []

        for frame in range(img.n_frames):
            img.seek(frame)
            frame_img = img.copy().convert("RGB")
            frame_img.thumbnail(MAX_SIZE)
            frames.append(frame_img)

        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            optimize=True,
            duration=img.info.get("duration", 100),
            loop=0
        )

        print(f"Processed: {input_path}")

    except Exception as e:
        print(f"Error processing {input_path}: {e}")


for root, _, files in os.walk(INPUT_DIR):
    for file in files:
        if file.lower().endswith(".gif"):
            input_path = os.path.join(root, file)
            rel_path = os.path.relpath(input_path, INPUT_DIR)
            output_path = os.path.join(OUTPUT_DIR, rel_path)

            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            process_gif(input_path, output_path)
