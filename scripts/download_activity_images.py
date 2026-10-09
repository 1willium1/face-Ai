import os
import requests
import hashlib
from urllib.parse import urlparse

# List of image URLs extracted from the gallery
image_urls = [
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9660_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9634_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9639_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9642_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9664_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9645_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9647_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9643_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9656_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9649_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9652_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9653_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9668_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9667_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9672_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9671_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9675_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9676_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9681_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9678_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9683_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9685_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9687_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9689_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9693_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9692_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9701_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9658_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9706_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9704_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9694_resize.JPG",
    "https://www.dusit.ac.th/home/wp-content/gallery/22-11-66-ae-e0b8aae0b896e0b8b2-e0b980e0b8a5e0b987e0b881/AP7A9696_resize.JPG"
]

output_dir = r"c:\Users\Windows 11\OneDrive - Suan Dusit University\เดสก์ท็อป\งานจารย์วิชา\ปี2เทอม1\DR.Witcha\backend\training_data\wichcha_chimploy"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

print(f"Starting download of {len(image_urls)} images to {output_dir}")

for i, url in enumerate(image_urls):
    try:
        response = requests.get(url, stream=True, timeout=10)
        if response.status_code == 200:
            # Generate a filename using activity ID and index or hash
            ext = os.path.splitext(urlparse(url).path)[1]
            if not ext:
                ext = ".jpg"
            
            filename = f"wichcha_activity_1182313_{i+1}{ext}"
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Downloaded: {filename}")
        else:
            print(f"Failed to download {url}: Status {response.status_code}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

print("Download complete.")
