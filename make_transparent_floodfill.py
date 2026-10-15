import os
from PIL import Image

def process_image(img_path):
    try:
        # Load original JPG
        img = Image.open(img_path).convert("RGBA")
        width, height = img.size

        # Create a boolean mask for visited pixels
        visited = set()
        
        # We consider a pixel "background" if it's very close to white
        def is_white(c):
            return c[0] > 230 and c[1] > 230 and c[2] > 230
            
        # BFS from the corners
        queue = []
        corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        for c in corners:
            if is_white(img.getpixel(c)):
                queue.append(c)
                visited.add(c)
                
        pixels = img.load()
        
        # Directions: up, down, left, right
        dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        
        while queue:
            x, y = queue.pop(0)
            # Make the pixel transparent
            pixels[x, y] = (255, 255, 255, 0)
            
            for dx, dy in dirs:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        if is_white(pixels[nx, ny]):
                            queue.append((nx, ny))
                            
        new_path = img_path.replace('.jpg', '.png')
        img.save(new_path, "PNG")
        print(f"Successfully flood-filled {new_path}")
    except Exception as e:
        print(f"Failed to process {img_path}: {e}")

apps = ['customer', 'restaurant', 'rider']
for app in apps:
    for i in range(1, 4):
        img_path = f"apps/{app}/assets/images/slide{i}.jpg"
        if os.path.exists(img_path):
            process_image(img_path)
