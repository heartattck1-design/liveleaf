#! /usr/bin/sh
. .venv/bin/activate

export FLASK_APP=migrate.py

cd app

flask db init
flask db upgrade