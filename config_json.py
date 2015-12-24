import json

with open("config.txt") as f:
    data = f.read()
    i = json.loads(data)
    print type(i)
    for x,y in i.iteritems():
        if x == "systems":
            print x + ":" + json.loads(y)
        else:
            print x + ":" + y
