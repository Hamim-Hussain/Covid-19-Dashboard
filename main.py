from flask import Flask
from flask_restful import Api, Resource

app= Flask(__name__)
api= Api(app)

names={"tim":{"age":19, "gender":"male"},
       "bill":{"age":22, "gender":"male"}}
#Define a resource
class HelloWorld(Resource):
    def get(self, name):
        return names[name]
    
     
#register this as a resource, and make it acessible through url="/helloworld"
#Root of the resource
api.add_resource(HelloWorld, "/helloworld/<string:name>/<int:test>")
    
if __name__=="__main__":
    app.run(debug=True)
