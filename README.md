email-analytics
===============

[![Build Status](https://travis-ci.org/benfoxall/email-analytics.svg)](https://travis-ci.org/benfoxall/email-analytics)


## submitting data

* `GET /keys` - get all keys
* `GET /data/:key` - get list of datapoints for a key
* `POST /set/:key  ({"value":42})` - set the current value for a key
* `POST /clear/:key` - remove all content for a key


### Python
```python
import urllib2, urllib, base64

path='http://email-stats.herokuapp.com/set/python'
data=urllib.urlencode([('value','15')])

req=urllib2.Request(path, data)
req.add_header("Content-type", "application/x-www-form-urlencoded")

# if auth variables are set
user = 'USERNAME'
passwd = 'PASSWORD'
auth = urllib2.HTTPBasicAuthHandler()
auth.add_password(
        realm='Authorization Required',
        uri='http://email-stats.herokuapp.com',
        user='%s'%user,
        passwd=passwd
        )
opener = urllib2.build_opener(auth)
urllib2.install_opener(opener)


page=urllib2.urlopen(req).read()
print page
```


### Bash/curl
```bash
# auth
curl --user user:passwd -H "Content-Type: application/json" -d '{"value":"70"}' http://email-stats.herokuapp.com/set/curl

# no auth
curl -H "Content-Type: application/json" -d '{"value":"70"}' http://email-stats.herokuapp.com/set/curl

# clear data
curl -H "Content-Type: application/json" -d '{"value":"70"}' http://email-stats.herokuapp.com/clear/curl

```