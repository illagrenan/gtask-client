# GTasks Client #

**Homepage: [https://www.gtasksapp.com/](https://www.gtasksapp.com/ "GTasks Client Homepage")**

## Build ##

1. Install npm dependencies: `$ npm install`.
2. Run Grunt: `$ grunt`.
3. Open `dist/` folder.

## Deploy ##

:information_source: If you want to run this app on your own server, you neeed to get a Google API Key: [https://code.google.com/apis/console/](https://code.google.com/apis/console/ "Google Developers Console").

1) Create [virtualenvironment](http://docs.python-guide.org/en/latest/dev/virtualenvs/ "Python Guide: Virtual Environments"): `mkvirtualenv gtask_client`.
2) Install [pip](https://pip.pypa.io/en/latest/ "pip") requirements: `$ pip install -r requirements.txt`.
3) Create `deploy.ini`.

```
│	...
│	bower.json
│	deploy.ini
|	^^^^^^^^^^
│	fabfile.py
│	...
```

4) Example configuration:

```config
[remote]
host : 80.xxx.xxx.xx
user : username
key_filename : ~/.ssh/id_rsa
```

5) Run [Fabric](http://fabric.readthedocs.org/) task `deploy`.


```bash
$ fab deploy
```

## License ##

The MIT License (MIT)

Copyright © 2014&ndash;2015 Vašek Dohnal (@illagrenan)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.