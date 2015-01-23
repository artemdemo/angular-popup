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
        uglify: {
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
            }
        }
    });

    //Loading less plugin
    grunt.loadNpmTasks('grunt-contrib-less');
    //Loading watcher
    grunt.loadNpmTasks('grunt-contrib-watch')
    //Loading uglify plugin
    grunt.loadNpmTasks('grunt-contrib-uglify');


    // Default task(s).
    grunt.registerTask('default', ['less', 'uglify', 'watch']);
};