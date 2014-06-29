#!/usr/bin/python

import httplib2

from apiclient.discovery import build
from oauth2client.client import flow_from_clientsecrets
from oauth2client.file import Storage
from oauth2client.tools import run


# Path to the client_secret.json file downloaded from the Developer Console
CLIENT_SECRET_FILE = 'secret.json'

# Check https://developers.google.com/gmail/api/auth/scopes for all available scopes
OAUTH_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'

# Location of the credentials storage file
STORAGE = Storage('gmail.storage')

# Start the OAuth flow to retrieve credentials
flow = flow_from_clientsecrets(CLIENT_SECRET_FILE, scope=OAUTH_SCOPE)
http = httplib2.Http()

# Try to retrieve credentials from storage or run the flow to generate them
credentials = STORAGE.get()
if credentials is None or credentials.invalid:
  credentials = run(flow, STORAGE, http=http)

# Authorize the httplib2.Http object with our credentials
http = credentials.authorize(http)

# Build the Gmail service from discovery
gmail_service = build('gmail', 'v1', http=http)

### example query:
#
# Retrieve a page of threads
# threads = gmail_service.users().threads().list(userId='me').execute()

# # Print id and snippet for each thread
# if threads['threads']:
#   for thread in threads['threads']:
#     print '%s: %s' % (thread['id'], thread['snippet'])


response = gmail_service.users().messages().list(userId='me', q='label:inbox').execute()

print 'inbox', response['resultSizeEstimate']

response = gmail_service.users().messages().list(userId='me', q='label:inbox is:unread').execute()

print 'inbox unread', response['resultSizeEstimate']


# spam was a bit easier to test

response = gmail_service.users().messages().list(userId='me', q='in:spam').execute()

print 'spam', response['resultSizeEstimate']


response = gmail_service.users().messages().list(userId='me', q='in:spam is:unread').execute()

print 'unread spam', response['resultSizeEstimate']

