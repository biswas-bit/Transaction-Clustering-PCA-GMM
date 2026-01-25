FROM Python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /CODE

RUN apt-get update && apy-get install -y --no-install-recommends gcc python3-dev

COPY requirements.txt /CODE/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /CODE/