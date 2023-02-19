import os
import json

from revChatGPT.V1 import Chatbot

# Construct the path to the config file
home_dir = os.path.expanduser("~")
config_path = os.path.join(home_dir, ".config", "revChatGPT", "config.json")

# Open the config file and load the data into a variable
with open(config_path) as f:
    chatConfig = json.load(f)

chatbot = Chatbot(config=chatConfig)
conversations = {}

if os.path.exists("conversation.json"):
    with open("conversation.json", "r") as f:
        json_string = f.read()
        conversations = json.loads(json_string)
        for key in conversations:
            conversations[key]["waiting"] = False
        print("Loaded conversations:")
        print(conversations)

def ask(key, text):
    conversationId = None
    parentId = None
    if key in conversations:
        if conversations[key]['waiting']:
            return "<Another answer is still generating...>"
        conversationId = conversations[key]["conversation_id"]
        parentId = conversations[key]["parent_id"]
    else:
        conversations[key] = {
            "waiting": True,
            "conversationId": None,
            "parentId": None
        }
    conversations[key]["waiting"] = True

    print("Generating for session ", conversationId)

    answer = {}
    try:
        for data in chatbot.ask(text, conversationId, parentId):
            answer = data
        if "message" in answer:
            conversations[key]["conversation_id"] = answer["conversation_id"]
            conversations[key]["parent_id"] = answer["parent_id"]

            json_string = json.dumps(conversations)
            with open("conversation.json", "w") as f:
                f.write(json_string)
            print("Generated ", answer["conversation_id"])
            answer = answer["message"]
        else:
            answer = "<Empty Response, Maybe hit rate limit>"
            
    except Exception as e:
        print("Failed to ask.", e )
        answer = "<Internal Error> " + str(e)

        
    conversations[key]["waiting"] = False

    return answer

    