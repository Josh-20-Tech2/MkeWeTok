import re
html = open('c:\\Users\\MTP\\OneDrive\\Desktop\\tok\\index.html', encoding='utf-8').read()
tags = re.findall(r'<\s*(/?)\s*([a-zA-Z0-9]+)([^>]*)>', html)
stack = []
self_closing = {'meta', 'link', 'br', 'hr', 'img', 'input'}
errors = []
for close, tag, attrs in tags:
    tag = tag.lower()
    if tag in self_closing:
        continue
    if close.startswith('/'):
        if not stack or stack[-1] != tag:
            errors.append('Close ' + tag + ' without matching open, stack=' + str(stack))
        else:
            stack.pop()
    else:
        stack.append(tag)
if stack:
    errors.append('Unclosed: ' + str(stack))
if errors:
    print('ERRORS FOUND:')
    for e in errors:
        print(' ', e)
else:
    print('OK - all HTML tags balanced')
print('Open tags remaining:', stack)
# Check key elements present
for key in ['<title>', '<body>', '<script', 'bootstrap', 'translateBtn', 'speakText', 'translateText', 'languageSelect', 'viewport']:
    print(key + ':', 'FOUND' if key in html else 'MISSING')
