import sys
import os
from datetime import datetime
import pytesseract
from PIL import Image

def extract_text(image_path):
    return pytesseract.image_to_string(Image.open(image_path))

def generate_markdown(name, date, text, image_filename):
    return f"""# Profile: {name}

- **Name:** {name}
- **Date of Encounter:** {date}
- **Profile screenshot:** ![profile]({image_filename})

## Extracted Profile Text
{text}

## Analysis
- **Interests/Personality:** 
- **First Impressions:** 
- **What attracted me:** 
- **Potential compatibility:** 
- **Notable patterns or details:** 

## My Actions
- [ ] Liked
- [ ] Matched
- [ ] Messaged

## My Notes
- 
"""

def main():
    image_path = sys.argv[1]
    image_filename = os.path.basename(image_path)
    now = datetime.now().strftime("%Y-%m-%d")
    text = extract_text(image_path)
    
    # Try to extract a name (naive: first word before a newline)
    name = text.split('\n')[0].strip() or "unknown"
    md = generate_markdown(name, now, text, f"../images/{image_filename}")
    output_path = f"profiles/{name.lower().replace(' ', '_')}_{now}.md"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md)
    print(f"Created {output_path}")

if __name__ == "__main__":
    main()
