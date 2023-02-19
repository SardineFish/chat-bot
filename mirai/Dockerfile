FROM openjdk:17-alpine
RUN apk add curl
RUN curl https://github.com/iTXTech/mcl-installer/releases/download/ce4ab47/mcl-installer-ce4ab47-linux-amd64-musl -o /root/mcl-installer
RUN chmod 755 /root/mcl-installer
WORKDIR /root
CMD /root/mcl-installer