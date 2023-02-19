FROM python:3.11.2-slim-bullseye
RUN pip config set global.index-url https://mirrors.ustc.edu.cn/pypi/web/simple
RUN pip3 install revChatGPT
RUN pip3 install pysocks
RUN pip3 install flask
COPY . /root/chatgpt
WORKDIR /root/chatgpt
CMD python3 /root/chatgpt/main.py
