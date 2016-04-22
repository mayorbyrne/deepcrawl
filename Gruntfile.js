module.exports = function (grunt) {

  var jsFiles = [
    'schemas/**/*.js',
    'test/**/*.js',
    '*.js'
  ];

  grunt.initConfig({
    eslint: {
      js: {
        src: jsFiles
      }
    },
    jsbeautifier: {
      modify: {
        src: jsFiles,
        options: {
          config: './.jsbeautifyrc'
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
