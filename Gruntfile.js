module.exports = function(grunt) {
    'use strict';

    //load all grunt tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    // grunt.loadNpmTasks('connect-livereload');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-wrap');
    grunt.loadNpmTasks('grunt-notify');
    //define tasks
    grunt.registerTask('server', ['connect:server', 'watch']);

    var baseFile = ['src/$.js',
        'src/event.js',
        'src/SmartTrigger_for_Model.js',

        'src/Model.v5.core.js',
        'src/Model.v5.base.js',
        'src/Model.v5.$scope.js',
        'src/Model.v5.ArrayModel.js',
        'src/Model.v5.Proxy.js',
        'src/_ArrayModel.js',
        'src/Model.extend.js',
        'src/registerAttribute.js',
        'src/View.js',
        'src/ViewModel.js',
        'src/Handle.js',
        'src/baseViewParser.js',
        'src/registerHandle/*.js',
        'src/registerTrigger/*.js',
        'src/registerAttributeHandle/*.js',
        'src/templateParse.v1.js',

        'src/registerHandle.js',
        'src/export.js',

        //自动监听变动的的拓展类
        'src/modelExtendsClass/Observer.js',
    ],
        debugFile = baseFile.slice();
    debugFile.unshift('src/plugins.js')
    //grunt config
    grunt.initConfig({
        //======== 配置相关 ========
        pkg: grunt.file.readJSON('package.json'),
        src: '',
        //文件合并
        concat: {
        	//调试版本，
            debug: {
                src: debugFile,
                dest: 'build/jSouper.debug.js'
            },
            //无压缩发布版本
            common: {
                src: baseFile,
                dest: 'build/jSouper.js'
            }
        },
        wrap: {
        	//大闭包包裹
            basic: {
                src: ['build/jSouper.js'],
                dest: 'build/jSouper.js',
                options: {
                    wrapper: ['!(function jSouper(global) {\n', '\n}(this));']
                }
            }
        },
        uglify: {
            options: {
                beautify: false
            },
            my_target: {
                files: {
                    'build/jSouper.min.js': ['build/jSouper.js']
                }
            }
        },
        //======== 开发相关 ========
        //开启服务
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                // hostname: 'localhost',
                hostname: '0.0.0.0',
                middleware: function(connect, options) {
                    return [
                        require('connect-livereload')({
                            port: Number('<%= watch.options.livereload %>')
                        }),
                        connect.static(options.base),
                    ];
                }
            },
            server: {
                options: {
                    // keepalive: true,
                    base: '<%= src %>',
                }
            }
        },

        watch: {
            options: {
                livereload: 35729
            },
            doc: {
                files: ['doc/**']
            },
            js: {
                files: ['src/*.js', 'src/**/*.js'],
                tasks: ['concat', 'wrap', 'uglify'] //,'closure-compiler'
            }
        }


    });
};
