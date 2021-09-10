# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask, request, send_file, abort
from os.path import exists
 
# Flask constructor takes the name of
# current module (__name__) as argument.
app = Flask(__name__)
 
# The route() function of the Flask class is a decorator,
# which tells the application which URL should call
# the associated function.
@app.route('/')
# ‘/’ URL is bound with hello_world() function.
def hello_world():
    return send_file("part1.html")
 
@app.route('/<path:path>')
def send_js(path):
    if exists(path):
        return send_file(path)
    return "False"
    

# main driver function
if __name__ == '__main__':
 
    # run() method of Flask class runs the application
    # on the local development server.
    app.run()