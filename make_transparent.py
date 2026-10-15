import os
from PIL import Image

def process_image(img_path):
    try:
        img = Image.open(img_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Change all white (also shades of whites)
            # to transparent
            if item[0] > 230 and item[1] > 230 and item[2] > 230:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        new_path = img_path.replace('.jpg', '.png')
        img.save(new_path, "PNG")
        print(f"Processed {new_path}")
    except Exception as e:
        print(f"Failed to process {img_path}: {e}")

apps = ['customer', 'restaurant', 'rider']
for app in apps:
    for i in range(1, 4):
        img_path = f"apps/{app}/assets/images/slide{i}.jpg"
        if os.path.exists(img_path):
            process_image(img_path)
