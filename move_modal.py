import sys

try:
    with open('c:/Users/Youssef/Desktop/Pc-en/dashboard/pages/dashboard.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if '{/* Custom Modal replacing daisyUI dialog */}' in line:
            start_idx = i
        if '              </div>' in line and ')}' in lines[max(0, i-1)]:
            # Note: )} is on the next line or same line?
            pass
            
    # better search logic:
    for i in range(len(lines)):
        if '{/* Custom Modal replacing daisyUI dialog */}' in lines[i]:
            start_idx = i
            break
            
    if start_idx != -1:
        # find the end of modal which is )}
        for i in range(start_idx, len(lines)):
            if '            )}' in lines[i]:
                end_idx = i
                break
                
    if start_idx != -1 and end_idx != -1:
        modal_lines = lines[start_idx:end_idx+1]
        del lines[start_idx:end_idx+1]
        
        for i in range(len(modal_lines)):
            if 'bg-background' in modal_lines[i] and 'glass-card' in modal_lines[i]:
                modal_lines[i] = modal_lines[i].replace('bg-background', 'bg-[#0b0f19] shadow-2xl')

        insert_idx = -1
        for i in range(len(lines)):
            if '      </div>' in lines[i] and '    </div>' in lines[i+1] and '  );' in lines[i+2]:
                insert_idx = i + 1
                break
        
        if insert_idx == -1:
            for i in range(len(lines)):
                if 'export async function getServerSideProps' in lines[i]:
                    insert_idx = i - 3
                    break
                    
        if insert_idx != -1:
            lines = lines[:insert_idx] + ['\n'] + modal_lines + ['\n'] + lines[insert_idx:]
            with open('c:/Users/Youssef/Desktop/Pc-en/dashboard/pages/dashboard.js', 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("Successfully moved modal!")
        else:
            print("Could not find insert pos")
    else:
        print("Could not find modal start/end")

except Exception as e:
    print(f"Error: {e}")
