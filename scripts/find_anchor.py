with open('modelos.html', 'r', encoding='utf-8') as f:
    text = f.read()
idx = text.find('id="casa-l"')
print('casa-l found at:', idx)
search_from = idx + 100
sub = text[search_from:search_from+1500]
print(repr(sub[:800]))
