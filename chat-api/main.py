import chat
from flask import Flask, request

app = Flask(__name__)

@app.route('/<key>', methods=['POST'])
def handle_request(key):
    text = request.data.decode('utf-8')
    response = chat.ask(key, text)

    return response

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3000)