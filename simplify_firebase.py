import os

api_dir = 'pages/api'
files = [f for f in os.listdir(api_dir) if f.endswith('.js')]

# Standard service account block
new_init = """  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });"""

for filename in files:
    filepath = os.path.join(api_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    start_found = -1
    end_found = -1
    
    for i in range(len(lines)):
        if 'const serviceAccount = {' in lines[i]:
            start_found = i
        if 'admin.initializeApp({' in lines[i]:
            # find the end of app.initializeApp
            for j in range(i, len(lines)):
                if '  });' in lines[j]:
                    end_found = j
                    break
            break
            
    if start_found != -1 and end_found != -1:
        # Reconstruct the file with the simplified init
        new_lines = lines[:start_found] + [new_init + '\n'] + lines[end_found + 1:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Simplified {filename}")
    else:
        print(f"Skipped {filename} (no init found)")
