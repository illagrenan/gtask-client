module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        yeoman: {
            app: 'app',
            dist: 'dist'
        },

        clean: ["dist", '.tmp'],

        copy: {
            main: {

                expand: true,
                cwd: 'app/',
                src: [
                    'index.html',
                    'img/**',
                    'favicons/**',
                    'bower_components/paper-*/*.{css,js,html}',
                    'bower_components/core-*/*.{css,js,html}',
                    'bower_components/polymer/*.{css,js,html}'
                ],
                dest: 'dist/'
            },
            foo: {
                cwd: 'app/', // set working folder / root to copy
                expand: true, // required when using cwd
                flatten: true,
                src: [
                    "bower_components/font-awesome/fonts/**",
                    "bower_components/bootstrap/fonts/**"
                ],
                dest: 'dist/fonts',
                filter: 'isFile'
            }
        },

        rev: {
            files: {
                src: ['dist/**/*.{js,css}', '!dist/bower_components/**']
            }
        },

        useminPrepare: {
            html: 'app/index.html'
        },

        usemin: {
            html: ['dist/index.html']
        },

        uglify: {
            options: {
                report: 'min',
                mangle: false
            }
        },
        htmlmin: {
            deploy: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: '{,*/}*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        ngtemplates: {
            app: {
                cwd: 'app',
                expand: true,
                src: "partials/**/*.html",
                dest: ".tmp/templates.js",
                options: {
                    usemin: 'dist/js/gtask.min.js', // <~~ This came from the <!-- build:js --> block
                    module: "gTodo",
                    htmlmin: '<%= htmlmin.app %>',
                    url: function (url) {
                        return url.replace('app/', '');
                    }
                }
            }
        },
        vulcanize: {
            default: {
                options: {
                    abspath: "",
                    strip: true
                },
                files: {
                    'dist/index.html': 'app/index.html'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-rev');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-vulcanize');

    // Tell Grunt what to do when we type "grunt" into the terminal
    grunt.registerTask('default', [
        'clean',
        'copy',
        // 'vulcanize',
        'useminPrepare',
        'ngtemplates',
        'concat',
        'uglify',
        'cssmin',
        'rev',
        'usemin',
        'htmlmin:deploy'
    ]);

};