import re
with open(r'C:\Workspace\concasaya\blog\pozos-septicos-colombia-legalidad-requisitos.html', encoding='utf-8') as f:
    h = f.read()
# Regex que solo cuenta aperturas (con atributos o sin ellos)
def count_tag(text, tag):
    open_re = re.compile(r'<' + tag + r'(?:\s|>)')
    close_re = re.compile(r'</' + tag + r'>')
    return len(open_re.findall(text)), len(close_re.findall(text))
for tag in ['section','article','div','ul','li','p','h2','h3','header','footer','main','nav','a','span','button']:
    o, c = count_tag(h, tag)
    status = 'OK' if o == c else f'!!! MISMATCH (open={o}, close={c})'
    print(f'  <{tag}>: {o} aperturas, {c} cierres -> {status}')
