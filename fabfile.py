# -*- encoding: utf-8 -*-
from __future__ import unicode_literals

import os

import configparser

from fabric.context_managers import cd
from fabric.decorators import task
from fabric.api import env
from fabric.operations import put, run
from zip_dir.utils import create_zip_archive


ini_parser = configparser.ConfigParser()

# Example of "deploy.ini"
# =======================
# [remote]
# host : 80.xxx.xxx.xx
# user : john
# key_filename : ~/.ssh/id_rsa.private

ini_parser.read("deploy.ini")
remote_section = ini_parser["remote"]

env.hosts = [remote_section["host"]]
env.user = remote_section["user"]
env.key_filename = os.path.normpath(remote_section["key_filename"])

APP_BASE_DIR = '/var/www/gtasksapp_com/www/app'
DIST_ZIP_FILENAME = "dist.zip"
DIST_DIRECTORY_NAME = "dist"


@task(alias='d')
def deploy():
    current_path = os.path.dirname(os.path.realpath(__file__))
    dist_path = os.path.join(current_path, DIST_DIRECTORY_NAME)

    create_zip_archive(dist_path, DIST_ZIP_FILENAME)

    run("mkdir -p {0}".format(APP_BASE_DIR))
    put(DIST_ZIP_FILENAME, APP_BASE_DIR)

    with cd(APP_BASE_DIR):
        run("unzip -o {0}".format(DIST_ZIP_FILENAME))
        run("rm {0}".format(DIST_ZIP_FILENAME))

    os.remove(DIST_ZIP_FILENAME)

@task(alias='l')
def landing():
    current_path = os.path.dirname(os.path.realpath(__file__))
    dist_path = os.path.join(current_path, "landing_page")

    create_zip_archive(dist_path, ".tmp/landing_page.zip")

    put(".tmp/landing_page.zip", "/var/www/gtasksapp_com/www/")

    with cd("/var/www/gtasksapp_com/www/"):
        run("unzip -o {0}".format("landing_page.zip"))
        run("rm {0}".format("landing_page.zip"))

    os.remove(".tmp/landing_page.zip")