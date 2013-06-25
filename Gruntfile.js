var path = require('path');

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    //Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dirs: {
            docs: 'docs',
            src: 'src',
            test: 'test',
            tools: 'tools'
        },
        files: {
            srcBlob: '<%= dirs.src %>/**/*.js',
            testBlob: '<%= dirs.test %>/**/*.js'
        },
        jshint: {
            all: ['<%= files.srcBlob %>', '<%= files.testBlob %>'],
            options: {
                /* Enforcement options */
                bitwise: false,     //allow bitwise operators
                camelcase: false,   //must use camelCase or UPPER_CASE
                curly: false,       //one line conditionals w/o braces are allowed
                eqeqeq: true,       //must use === if possible
                forin: false,       //forin loops much check hasOwnProperty
                immed: true,        //self-calling functions must be wrapped in parens
                latedef: true,      //can't use a variable until it is defined
                newcap: true,       //ctor names must be Captialized
                noarg: true,        //arguments.caller/callee are deprecated, disallow
                noempty: true,      //warn about empty blocks
                nonew: true,        //no using `new Constructor();` without saving the value (no using only side-effects)
                plusplus: false,    //you can use unary increment and decrement operators
                quotmark: true,     //quotes must be consistent
                unused: true,       //warn about declared but not used variables
                strict: false,      //do not require functions to be run in strict-mode
                trailing: true,     //help prevent weird whitespace errors in multi-line strings using \ 
                maxlen: 120,        //no line should be longer than 120 characters

                /* Relaxing Options */
                boss: true,         //do not warn about the use of assignments in cases where comparisons are expected

                /* Environments */
                browser: true,      //this runs in a browser :)
                devel: false,       //warn about using console.log and the like
                jquery: true,       //this uses jquery
                node: false,        //no node support
                worker: true,       //web-workers are used

                /* Globals */
                undef: true,
                globals: {
                    /* For tests */
                    QUnit: false,
                    Q: false,

                    /* Globals used in code */
                    PIXI: false,
                    TWEEN: false,
                    requirejs: false,
                    require: false,
                    define: false,
                    $: false,
                    gf: false
                }
            }
        },
        connect: {
            qunit: {
                options: {
                    port: grunt.option('port-test') || 9002,
                    base: './test/'
                }
            },
            serve: {
                options: {
                    port: grunt.option('port-test') || 9002,
                    base: './',
                    keepalive: true
                }
            }
        },
        qunit: {
            all: {
                options: {
                    urls: ['http://localhost:' + (grunt.option('port-test') || 9002) + '/test/index.html']
                }
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: '<%= dirs.src %>',
                    outdir: '<%= dirs.docs %>'
                }
            }
        }
    });

    //Load tasks
    grunt.registerTask('default', ['jshint', 'test']);
    grunt.registerTask('test', ['connect:qunit', 'qunit']);
    grunt.registerTask('docs', ['yuidoc']);
    grunt.registerTask('serve', ['connect:serve']);
    grunt.registerTask('server', ['connect:serve']);
};