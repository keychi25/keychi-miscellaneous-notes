---
title: 'FastAPIでMongoDBを使用する'
date: '2020-12-22'
tags: 'FastAPI MongoDB Docker pymongo'
---

本記事は[東京学芸大学 櫨山研究室 Advent Calendar 2020](https://qiita.com/advent-calendar/2020/hazelab)の 22 日目の記事になります．

# はじめに

みなさんは[FastAPI](https://fastapi.tiangolo.com/)を使用していますか？？
python の Web フレームワークでは Django, Flask などがよく使用されますが，今回は FastAPI についての記事になります．
RDS との接続は SQLAlchemy（Mysql）という ORM が document で紹介されていますが今回は[MongoDB](https://www.mongodb.com/cloud/atlas/lp/try2?utm_source=google&utm_campaign=gs_apac_japan_search_brand_atlas_desktop&utm_term=mongodb&utm_medium=cpc_paid_search&utm_ad=e&utm_ad_campaign_id=2030069966&gclid=CjwKCAiArIH_BRB2EiwALfbH1B7_Wj8fN_A_RaBQdHa6VZJ7xxET_wBs3N2b464W_9721_ROKzkNlxoCIRAQAvD_BwE)との接続を[pymongo](https://pymongo.readthedocs.io/en/stable/)で行い，CRUD 操作を行っていきます．
確認は MongoDB を GUI 操作できる mongo express，FastAPI の自動生成ドキュメント(Swagger UI)で確認していきます．
実行は Docker での構築になります．GitHub は[こちら](https://github.com/keychi25/fastApi-mongo)から．

# 開発環境

- MacOs:Mac mini (2018) macOS Big Sur ver.11.1
- Docker：20.10.0
- docker-compose:1.27.4
- MongoDB:4.2

# 1 準備

## 1.1 ディレクトリ構成

```console
.
├── Makefile
├── README.md
├── docker
│   ├── docker-compose.yml
│   ├── fast_api
│   │   └── Dockerfile
│   ├── mongo-express
│   │   └── Dockerfile
│   ├── mongo_db
│   │   ├── Dockerfile
│   │   ├── configdb
│   │   ├── db
│   │   └── mongo-init.js
│   └── wait-for-it.sh
└── fast_api
    ├── Makefile
    ├── __init__.py
    ├── __pycache__
    ├── app.py
    ├── database.py
    ├── requirements.txt
    ├── routers
    │   ├── __init__.py
    │   ├── __pycache__
    │   └── posts.py
    ├── sample-json
    │   ├── sample.json
    │   └── update.json
    └── tests
        ├── __pycache__
        └── test_initial.py
```

docker ディレクトリに，`docker-compose.yml`とそれぞれの`Dockerfile`を配置します．mongo の db データなどもここに配置します．
また，`docker-compose`での実行はルートディレクトリの`Makefile`で行います．

## 1.2 ファイルの準備

それぞれのファイルの中身は以下になります．

#### Makefile

```make:Makefile
.PHONY: setup
setup:
	docker-compose -f docker/docker-compose.yml build
	$(MAKE) install

.PHONY: install
install:
	docker-compose -f docker/docker-compose.yml run --rm fast_api make setup

.PHONY: start
start:
	docker-compose -f docker/docker-compose.yml up --remove-orphans

.PHONY: start.background
start.background:
	docker-compose -f docker/docker-compose.yml up -d --remove-orphans

.PHONY: stop
stop:
	docker-compose -f docker/docker-compose.yml down

.PHONY: pytest
pytest:
	docker-compose -f docker/docker-compose.yml run --rm fast_api make test
```

```make:fast_api/Makefile
# pipでの依存関係の解決 (.pipディレクトリに依存関係を全て入れる)
setup:
	pip3 install --upgrade pip
	pip3 install -r requirements.txt -t ./.pip

test:
	python -m pytest -v
```

使用コマンドは以下になります．

- `setup`でパッケージの取得
- `start`でアプリケーションを実行
- `start.background`でバックグラウンドでアプリケーションを実行
- `stop`でアプリケーションを停止
- `pytest`で pytest の実行

#### Dockerfile(3 つ)

##### FastAPI

```Docker:docker/fast_api/Dockerfile
FROM python:3.7-alpine # alpineで軽量化

ENV LANG C.UTF-8
ENV TZ Asia/Tokyo

RUN apk add --update --no-cache make bash gcc g++ tzdata git\
  && pip install --upgrade pip \
  && pip install uvicorn==0.11.8

ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH /app/.pip

ADD docker/wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh
```

##### MongoDB

```Docker:docker/mongo_db/Dockerfile
FROM mongo:4.2
```

##### mongo express

```Docker:docker/mongo_express/Dockerfile
FROM mongo-express

ADD wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin//wait-for-it.sh
```

#### docker-compose.yml

```yml:docker/docker-compose.yml
version: "3.7"

services:
  fast_api:
    container_name: fast_api
    build:
      context: ../.
      dockerfile: ./docker/fast_api/Dockerfile
    working_dir: /app
    volumes:
      - ../fast_api:/app:cached
    ports:
      - 8000:8000
    tty: true
    environment:
      MONGO_DATABASE_NAME: mongodb
      MONGO_DATABASE_USER: root
      MONGO_DATABASE_PASSWORD: root
      MONGO_DATABASE_CONTAINER_NAME: mongo_db
      MONGO_DATABASE_PORT: 27017

    command: wait-for-it.sh mongo_db:27017 --timeout=30 -- uvicorn app:app --reload --host 0.0.0.0 --port 8000
    networks:
      - fastapi-mongo-network

  mongodb:
    container_name: mongo_db
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: root
    build:
      context: .
      dockerfile: ./mongo_db/Dockerfile
    ports:
      - 27017:27017
    tty: true
    volumes:
      - ./mongo_db/db:/data/db
      - ./mongo_db/configdb:/data/configdb
      - ./mongo_db/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js
    networks:
      - fastapi-mongo-network

  mongo-express:
    container_name: mongo_express
    build:
      context: .
      dockerfile: ./mongo-express/Dockerfile
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: root
      ME_CONFIG_MONGODB_SERVER: mongo_db
    ports:
      - 8081:8081
    tty: true
    command: wait-for-it.sh mongo_db:27017 --timeout=30 -- node app
    restart: unless-stopped
    networks:
      - fastapi-mongo-network

networks:
  fastapi-mongo-network:
    driver: bridge
```

#### wait-for-it.sh

[こちら](https://github.com/vishnubob/wait-for-it)から拝借しています．
他のコンテナの起動を待ってから起動ができます(depend on は順序だけ)．

#### requirements.txt

```sh:fast_api/requirements.txt
aiofiles==0.6.0
fastapi==0.61.1
pymongo==3.11.0
pytest==6.1.0
python-dateutil==2.8.1
setuptools==49.2.0
uvicorn==0.11
```

必要なパッケージを記述します．

#### app.py

```python:fast_api/app.py
import uvicorn
from fastapi import FastAPI
from routers import posts

app = FastAPI(prefix="/")

app.include_router(posts.router, prefix="/post") # routingを階層的にし読み込む

@app.get('/')
def get_hello():
    return {'message': 'Hello from FastAPI Server!'}

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

アプリケーションの起動を行います．Flask では Buleprint を使用し，ルーティングを階層的にしていましたが，FastAPI では`include_router`を使用し，ルーティングの追加ができます．

#### posts.py

```python:routers/posts.py

from fastapi import APIRouter, Body

from bson.objectid import ObjectId
from bson.json_util import dumps, loads

from database import db

router = APIRouter()
@router.post('')
def create_post(body=Body(...)):
    """postの作成

    ----------
    Parameters:

    body: body
        任意のjson
    """
    post = body['payload']
    db.posts.insert(post)
    return {'post': "ok"}

@router.get('')
def read_post():
    """postの取得

    ----------
    Parameters:

    なし
    """
    db_post = db.posts.find_one()
    return {'item': dumps(db_post)}

@router.get('/{id}')
def read_post_by_id(id: str):
    """postの取得(id)

    ----------
    Parameters:

    id: str
        オブジェクトID
    """
    db_post = db.posts.find_one({'_id': ObjectId(id)})
    print(db_post)
    return {'item': dumps(db_post)}

@router.put('')
def update_post(body=Body(...)):
    """postの更新(id)

    ----------
    Parameters:

    body: body
        任意のjson
    """
    post = body['payload']
    _id = post['_id']
    title = post['title']
    text = post['text']
    db.posts.update_one(
        {'_id': ObjectId(_id)},
        {'$set':
            {
                "title": title, 'text': text
            }
        }
    )
    return {'update': "ok"}

@router.delete('/')
def delete_post_by_id(id: str):
    """postの削除(id)

    ----------
    Parameters:

    id: str
        オブジェクトID
    """
    db.posts.delete_one(
        {'_id': ObjectId(id)}
    )
    return {'delete': "ok"}
```

posts の CRUD を記述します．今回は確認だけなのでエラーハンドリングは行っていません 🙇‍♂️
書き方は Flask 似ていて自分自身はとても書きやすい印象です．
Swagger UI で docs が参照できるので記述しておくと良いです(書き方になれていません．．．)!
注意点としては，MongoDB から取得したオブジェクトはそのままでは json 形式にできないので，dumps を行っています．それぞれ好きな形にしてもらえればと思います．

#### database.py

```python:fast_api/database.py
import os
from pymongo import MongoClient

MONGO_DATABASE_NAME = os.environ.get("MONGO_DATABASE_NAME")  # mongodb
MONGO_DATABASE_USER = os.environ.get("MONGO_DATABASE_USER")  # root
MONGO_DATABASE_PASSWORD = os.environ.get("MONGO_DATABASE_PASSWORD")  # root
MONGO_DATABASE_CONTAINER_NAME = os.environ.get(
    "MONGO_DATABASE_CONTAINER_NAME")  # mongo_db
MONGO_DATABASE_PORT = int(os.environ.get("MONGO_DATABASE_PORT"))  # 27017

DATABASE_URL = "%s://%s:%s@%s:%d" % (
    MONGO_DATABASE_NAME, MONGO_DATABASE_USER, MONGO_DATABASE_PASSWORD, MONGO_DATABASE_CONTAINER_NAME, MONGO_DATABASE_PORT)

client = MongoClient(DATABASE_URL)
db = client.first_test  #database名がfirst_test
```

MongoDB との接続の設定を記述します．それぞれの環境変数は`docker-composer.yml`で設定しています．
MongoDB は NoSQL なので，作成されていないものは勝手に作成してくれます．
pymongo を使用することにより簡単に記述することができます．
使用するデータベース名は以下でしています．

```python:fast_api/database.py
db = client.first_test  #database名がfirst_test
```

# 2 アプリケーションの実行

以下の順番でコマンドをうち,アプリケーションを起動してください．
今回は

1. Create
2. Read (id 無/有)
3. Update
4. Delete

の順番で進めていきます．

```console:console
$ make setup
$ make start
```

`http://localhost:8000/docs`にアクセスし Swagger UI を確認します．
![スクリーンショット 2020-12-22 12.14.59.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/273450/de359264-803d-5e43-cd82-00d855194d00.png)

# 3. CRUD 操作

## 3.1 Create

### API 実行

以下の`fast_api/sample-json/sample.json`をコピーし Request body に入れ Execute します．

```json:fast_api/sample-json/sample.json
{
  "payload":{
    "title" : "初投稿！",
    "text" : "hogehoge"
  }
}
```

![スクリーンショット 2020-12-22 12.18.50.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/273450/14669d37-5e66-3032-3a96-f32b8aecb295.png)

### MongoDB の確認

`http://localhost:8081`にアクセスし MngoDB を確認します．
[first_test] → [posts] → [作成されてた post]の順に進むと以下のような Document が作成されていると思います．

![スクリーンショット 2020-12-22 12.24.11.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/273450/ffba9e0b-3f85-f0c2-f19e-6fb29aa88709.png)

## 3.2 Read(id 無/有)

### id 無しの場合

![スクリーンショット 2020-12-22 12.27.36.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/273450/d8a4a14a-63e4-c4b2-404f-5932f127d37d.png)

### id 有りの場合

[さきほど作成した post](## 2.1 Create)のオブジェクト ID（投稿確認時は`5fe1661f03100427fb1e8cd3`)を引数に実行します．

![スクリーンショット 2020-12-22 12.29.03.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/273450/e1d8911e-e99b-3ffc-39f8-87c872967384.png)

## 3.3 Update

同じくオブジェクト ID（投稿確認時は`5fe1661f03100427fb1e8cd3`)を引数に実行しますが，今回は json の中に入れて実行していきますので，`fast_api/sample-json/update.json`の`_id`の部分を変更して実行します．

```json:fast_api/sample-json/update.json
{
  "payload":{
    "_id" : "5fe1661f03100427fb1e8cd3",
    "title" : "投稿の編集",
    "text" : "fugefuge"
  }
}
```

![スクリーンショット 2020-12-22 12.36.21.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/273450/31ba3375-e99d-9763-1522-a60c55cad8a9.png)

mongo express の方で変更されているかを確認します．

![スクリーンショット 2020-12-22 12.37.06.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/273450/947f1374-9efa-b0bd-01a8-c0f262a8152e.png)

## 3.4 Delete

同じくオブジェクト ID（投稿確認時は`5fe1661f03100427fb1e8cd3`)を引数に実行します

![スクリーンショット 2020-12-22 12.38.13.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/273450/156c0cab-db04-a974-0d5e-a8dacb5af85d.png)

mongo express の方で削除されているかを確認します．

![スクリーンショット 2020-12-22 12.38.52.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/273450/641ea396-21d6-3c84-9237-b59a0c6d0f19.png)

# おわり

本記事では FastAPI で MongoDB を使用し CRUD 操作について扱いました．
参考になれば幸いです．
