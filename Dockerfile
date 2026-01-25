
FROM python:3.10-slim


ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


WORKDIR /code


RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev

COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt


COPY . /code/