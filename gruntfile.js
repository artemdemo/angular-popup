module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development: {
                options: {
                    compress: false,
                    optimization: 2
                },
                files: {
                    "popup/angular.popup.css": "less/angular.popup.less"
                }
            }
        },
        jshint: {
            all: ['popup/angular.popup.js'],
            options: {
                globals: {
                    _: false,
                    $: false,
                    jasmine: false,
                    describe: false,
                    it: false,
                    expect: false,
                    beforeEach: false
                },
                browser: true,
                devel: true
            }
        },
        uglify: {
            options: {
                banner: '/**!\n' +
                        ' * <%= pkg.name %> \n' +
                        ' * version: <%= pkg.version %>\n' +
                        ' * date: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                        ' * url: <%= pkg.repository.url %>\n' +
                        ' * \n' +
                        ' */\n'
            },
            my_target: {
                files: {
                    'popup/angular.popup.min.js': ['popup/angular.popup.js']
                }
            }
        },
        watch: {
            styles: {
                files: [
                    'less/*.less'
                ],
                tasks: ['less'],
                options: {
                    nospawn: true
                }
            },
            scripts: {
                files: ['popup/*.js'],
                tasks: ['jshint'],
                options: {
                    spawn: false
                }
            }
        },
        jsdoc : {
            dist : {
                src: ['popup/angular.popup.js'],
                options: {
                    destination: 'doc'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-jsdoc');

    // Default tasks
    grunt.registerTask('default', ['less', 'uglify', 'jshint', 'watch']);
    grunt.registerTask('doc', ['jsdoc']);
};