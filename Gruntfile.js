module.exports = function (grunt) {

  var jsFiles = [
      'schemas/**/*.js',
      'test/**/*.js',
      '*.js'
    ];

  grunt.initConfig({
    watch: {
      scripts: {
        files: jsFiles,
        tasks: ['eslint']
      }
    },
    eslint: {
      js: {
        src: jsFiles,
        options: {
          configFile: './config/.eslintrc'
        }
      }
    },
    jsbeautifier: {
      modify: {
        src: jsFiles,
        options: {
          config: './config/.jsbeautifyrc'
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['./test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('clean', [
    'jsbeautifier:modify',
    'eslint:js'
  ]);

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('default', [
    'eslint:js',
    'clean',
    'test'
  ]);
};
