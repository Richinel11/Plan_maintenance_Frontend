import urllib.request, json, urllib.error

body = b'{"username":"richie", "password":"richie"}'
try:
    req = urllib.request.Request('http://localhost:8002/users/login/', data=body, headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    token = data.get('access', '')
    print('Login OK, token prefix:', token[:30])

    req2 = urllib.request.Request('http://localhost:8002/references/', headers={'Authorization': 'Bearer ' + token})
    res2 = urllib.request.urlopen(req2)
    refs = json.loads(res2.read())
    refs_list = refs.get('results', refs) if isinstance(refs, dict) else refs
    print('Nb references:', len(refs_list))
    if refs_list:
        first_id = refs_list[0]['id']
        print('Premiere reference:', json.dumps(refs_list[0], ensure_ascii=False, indent=2))
        req3 = urllib.request.Request(f'http://localhost:8002/references/{first_id}/', headers={'Authorization': 'Bearer ' + token})
        res3 = urllib.request.urlopen(req3)
        detail = json.loads(res3.read())
        print('Details reference avec items:', json.dumps(detail, ensure_ascii=False, indent=2))
except urllib.error.HTTPError as e:
    print('HTTPError', e.code, e.read().decode())
except Exception as e:
    print('Error:', e)
