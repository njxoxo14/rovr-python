import cgi
import jinja2
import os
import urllib
import webapp2

from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.ext.webapp.util import login_required
from webapp2_extras import json

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class DogWalker(ndb.Model):
    email = ndb.StringProperty()
    name = ndb.StringProperty()
    def to_json(self):
        return {
            'id': self.key.id(),
            'email': self.email,
            'name': self.name
        }

class DogOwner(ndb.Model):
    email = ndb.StringProperty()
    name = ndb.StringProperty()
    def to_json(self):
        return {
            'id': self.key.id(),
            'email': self.email,
            'name': self.name
        }

class WalkRequest(ndb.Model):
    dog_walker = ndb.IntegerProperty()
    dog_owner = ndb.IntegerProperty()
    date = ndb.StringProperty()
    def to_json(self):
        return {
            'id': self.key.id(),
            'owner': self.dog_owner,
            'walker': self.dog_walker,
            'date': self.date
        }

class CreateOwner(webapp2.RequestHandler):
    def post(self):
        user = users.get_current_user()
        requested_name = self.request.get('name')
        owner = DogOwner(email=user.email(),name=requested_name)
        owner.put()
        return self.response.out.write(owner.key.id())

class CreateWalker(webapp2.RequestHandler):
    def post(self):
        user = users.get_current_user()
        requested_name = self.request.get('name')
        walker = DogWalker(email=user.email(),name=requested_name)
        walker.put()
        return self.response.out.write(walker.key.id())

class CreateRequest(webapp2.RequestHandler):
    def post(self):
        # Search for the account that is linked to currently logged in user.
        accounts = DogOwner.query(DogOwner.email == users.get_current_user().email())
        id = None
        for account in accounts:
          id = account.key.id()
        request = WalkRequest(
                dog_walker=int(self.request.get('walker')),
                dog_owner=int(id),
                date=self.request.get('date'))
        request.put()
        return self.response.out.write(request.key.id())

class DeleteRequest(webapp2.RequestHandler):
    def post(self):
        request_id = int(self.request.get('id'))
        request = WalkRequest.get_by_id(request_id)
        request.key.delete();
        return self.response.out.write(request_id)

class GetAllData(webapp2.RequestHandler):
    @login_required
    def get(self):
        walkers = DogWalker.query(DogOwner.email == users.get_current_user().email())
        id = None
        for account in walkers:
          id = account.key.id()
        self.response.headers['Content-Type'] = 'application/json'
        data = {
            'owners': [owner.to_json() for owner in DogOwner.query()],
            'walkers': [walker.to_json() for walker in DogWalker.query()],
            'requests': [request.to_json() for request in WalkRequest.query()],
            'user_id': id,
        }
        return self.response.out.write(json.encode(data))

class Greet(webapp2.RequestHandler):
    @login_required
    def get(self):
        # Default template is greet / make account.
        template = JINJA_ENVIRONMENT.get_template('index.html')

        # Grab current user.
        user = users.get_current_user()

        # Create template object
        params = {
            'nickname': user.nickname()
        }

        # If they are already registered as owner, change to owner template.
        for owner in DogOwner.query(DogOwner.email == users.get_current_user().email()):
            params['nickname'] = owner.name
            template = JINJA_ENVIRONMENT.get_template('owner.html')

        # If they are already registered as walker, change to walker template.
        for walker in DogWalker.query(DogWalker.email == users.get_current_user().email()):
            params['nickname'] = walker.name
            template = JINJA_ENVIRONMENT.get_template('walker.html')

        # Render the correct template.
        self.response.write(template.render(params))

app = webapp2.WSGIApplication([
    ('/create/walker', CreateWalker),
    ('/create/owner', CreateOwner),
    ('/create/request', CreateRequest),
    ('/delete/request', DeleteRequest),
    ('/get', GetAllData),
    ('/', Greet),
])
