import os

api_dir = 'pages/api'
files = [f for f in os.listdir(api_dir) if f.endswith('.js')]

for filename in files:
    filepath = os.path.join(api_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'FIREBASE_UNIVERSE_DOMAINL' in content:
        new_content = content.replace('FIREBASE_UNIVERSE_DOMAINL', 'FIREBASE_UNIVERSE_DOMAIN')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filename}")
