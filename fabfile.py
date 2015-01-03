# -*- encoding: utf-8 -*-
from __future__ import unicode_literals

import os

import configparser
from fabric.context_managers import cd
from fabric.decorators import task
from fabric.api import env
from fabric.operations import put, run, local
from fabric.utils import abort
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


def create_tmp_if_doesnt_exist():
    if not os.path.isdir(".tmp"):
        os.mkdir(".tmp")


@task()
def build_app():
    local("grunt")


@task()
def grunt_clean():
    local("grunt clean")


@task(alias='app')
def deploy_app():
    """Deploy app"""
    create_tmp_if_doesnt_exist()

    current_path = os.path.dirname(os.path.realpath(__file__))
    dist_path = os.path.join(current_path, DIST_DIRECTORY_NAME)

    if not os.path.isdir(dist_path) or not os.listdir(dist_path):
        abort("Dist path doesn't exist or dist directory is empty")

    create_zip_archive(dist_path, os.path.join(".tmp", DIST_ZIP_FILENAME))

    run("mkdir -p {0}".format(APP_BASE_DIR))
    put(os.path.join(".tmp", DIST_ZIP_FILENAME), APP_BASE_DIR)

    with cd(APP_BASE_DIR):
        run("unzip -o {0}".format(DIST_ZIP_FILENAME))
        run("rm {0}".format(DIST_ZIP_FILENAME))

    grunt_clean()


@task(alias='landing')
def deploy_landing_page():
    """Deploy landing page"""
    create_tmp_if_doesnt_exist()

    current_path = os.path.dirname(os.path.realpath(__file__))
    dist_path = os.path.join(current_path, "landing_page")

    create_zip_archive(dist_path, ".tmp/landing_page.zip")

    put(".tmp/landing_page.zip", "/var/www/gtasksapp_com/www/")

    with cd("/var/www/gtasksapp_com/www/"):
        run("unzip -o {0}".format("landing_page.zip"))
        run("rm {0}".format("landing_page.zip"))

    grunt_clean()


@task(alias='all')
def deploy_all():
    """Deploy all"""
    build_app()
    deploy_app()
    deploy_landing_page()