from google.appengine.ext import ndb
from webapp2_extras import json
import cgi
import urllib
import webapp2

class DogWalker(ndb.Model):
    name = ndb.StringProperty()
    def to_json(self):
        return {
            'id': self.key.id(),
            'name': self.name
        }

class DogOwner(ndb.Model):
    name = ndb.StringProperty()
    def to_json(self):
        return {
            'id': self.key.id(),
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
        requested_name = self.request.get('name')
        owner = DogOwner(name=requested_name)
        owner.put()
        return self.response.out.write(owner.key.id())

class CreateWalker(webapp2.RequestHandler):
    def post(self):
        requested_name = self.request.get('name')
        walker = DogWalker(name=requested_name)
        walker.put()
        return self.response.out.write(walker.key.id())

class CreateRequest(webapp2.RequestHandler):
    def post(self):
        request = WalkRequest(
                dog_walker=int(self.request.get('walker')),
                dog_owner=int(self.request.get('owner')),
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
    def get(self):
        self.response.headers['Content-Type'] = 'application/json'
        data = {
            'owners': [owner.to_json() for owner in DogOwner.query()],
            'walkers': [walker.to_json() for walker in DogWalker.query()],
            'requests': [request.to_json() for request in WalkRequest.query()],
        }
        return self.response.out.write(json.encode(data))


app = webapp2.WSGIApplication([
    ('/create/walker', CreateWalker),
    ('/create/owner', CreateOwner),
    ('/create/request', CreateRequest),
    ('/delete/request', DeleteRequest),
    ('/get', GetAllData),
])
