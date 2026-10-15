import os
from rembg import remove

def process_image(img_path):
    try:
        with open(img_path, 'rb') as i:
            input_data = i.read()
        
        output_data = remove(input_data)
        
        new_path = img_path.replace('.jpg', '.png')
        with open(new_path, 'wb') as o:
            o.write(output_data)
            
        print(f"Processed {new_path}")
    except Exception as e:
        print(f"Failed to process {img_path}: {e}")
    
apps = ['customer', 'restaurant', 'rider']
for app in apps:
    for i in range(1, 4):
        img_path = f"apps/{app}/assets/images/slide{i}.jpg"
        if os.path.exists(img_path):
            process_image(img_path)
