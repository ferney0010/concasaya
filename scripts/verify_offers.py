import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all offer blocks (non-greedy)
pattern = re.compile(r'"offers":\s*\{[^{}]*"url":\s*"[^"]+"\s*\}', re.DOTALL)
matches = pattern.findall(content)
print(f'Total offers encontrados: {len(matches)}')
with_price = 0
without_price = 0
for m in matches:
    if '"price"' in m:
        with_price += 1
    else:
        without_price += 1
        print(f'  SIN PRICE: {m[:200]}')
print(f'Con price: {with_price}')
print(f'Sin price: {without_price}')
