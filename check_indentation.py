import tokenize
import token
import io

def check_indentation(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    for i, line in enumerate(lines, start=1):
        # Check for "try:" statements followed by unindented lines
        if line.strip() == 'try:' or line.lstrip().startswith('try:'):
            if i < len(lines):  # Make sure there's a next line to check
                next_line = lines[i]
                if next_line and not next_line.startswith(' ') and not next_line.startswith('\t'):
                    print(f"Possible indentation error on line {i+1}: after 'try:' statement on line {i}")
    
    # Check for other potential indentation issues
    for i, line in enumerate(lines, start=1):
        try:
            # Skip empty lines
            if not line.strip() or line.strip().startswith('#'):
                continue
                
            # Check if line starts with uncommon indentation
            leading_spaces = len(line) - len(line.lstrip())
            if leading_spaces % 4 != 0 and leading_spaces != 0:
                print(f"Unusual indentation detected on line {i}: {leading_spaces} spaces")
                print(f"Line content: {line}")
        except Exception as e:
            print(f"Error checking line {i}: {e}")

if __name__ == "__main__":
    check_indentation("backend/app.py") 