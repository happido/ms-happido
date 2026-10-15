import os
import glob

files_to_update = [
    "backend/src/index.ts",
    "apps/customer/src/utils/api.ts",
    "apps/restaurant/src/utils/api.ts",
    "apps/rider/src/utils/api.ts",
    "apps/restaurant/src/app/index.tsx",
    "apps/rider/src/app/_layout.tsx",
    "apps/rider/src/app/index.tsx",
    "apps/customer/src/app/_layout.tsx",
    "apps/customer/src/app/map.tsx",
    "apps/customer/src/app/login.tsx",
    "apps/superadmin/src/app/page.tsx",
]

for file_path in files_to_update:
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        
        # Replace occurrences of 5000 with 5005
        # The environment variable fallback in backend is process.env.PORT || 5000
        # The API URLs are http://localhost:5000
        new_content = content.replace("5000", "5005")
        
        if new_content != content:
            with open(file_path, "w") as f:
                f.write(new_content)
            print(f"Updated {file_path}")
    else:
        print(f"File not found: {file_path}")
