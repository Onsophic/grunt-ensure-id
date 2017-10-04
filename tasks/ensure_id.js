/*
 * grunt-ensure-id
 * https://github.com/ezraroi/grunt-ensure-id
 *
 * Copyright (c) 2015 Roi Ezra
 * Licensed under the MIT license.
 */

'use strict';
var htmlparser = require("htmlparser2");
module.exports = function(grunt) {

    grunt.registerMultiTask('ensure_id', 'Ensures that all specified html elements has id attribute', checkHtml);

    function checkHtml() {
        /* jshint validthis: true */
        var options = this.options({
            elements : ['button', 'a', 'input', 'select']
        });

        var currentFile, hasError = false, currentLine, index = 0;
        var parser = new htmlparser.Parser({
            onopentag: parseOpenTag
        }, {decodeEntities: true});
        grunt.log.debug('Found ' + this.files.length + ' file groups to check');
        this.files.forEach(function(f) {
            f.src.filter(filterNonExistingFiles).map(parseFile);
        });
        parser.end();
        if (hasError) {
            grunt.log.warn('----------------------------------------------');
            grunt.log.warn('finished check with '+ index +' errors');
            grunt.log.warn('----------------------------------------------');
            grunt.fail.warn('Elements found with missing attribute!');
        }

        function filterNonExistingFiles(filepath) {
            if (!grunt.file.exists(filepath)) {
                grunt.log.warn('Source file "' + filepath + '" not found.');
                return false;
            } else {
                return true;
            }
        }

        function parseFile(filepath) {
            grunt.log.debug('Checking file: ' + filepath);
            currentFile = filepath;
            var lines = grunt.file.read(filepath);
            parser.parseComplete(lines);

            //lines.split('\n').forEach(function(line) {
            //      currentLine = line.replace('\r', '');
            //      parser.parseComplete(currentLine);
            //      index++;
            //  });
            grunt.log.debug('Finished file: ' + filepath);
        }

        function parseOpenTag(name, attribs){
            if (options.elements.indexOf(name) !== -1) {
                var hasMandatoryAttribute = false;
                options.checks.forEach(function(check) {
                    if (attribs.hasOwnProperty(check)) {
                        hasMandatoryAttribute = true;
                    }

                });
                if (!hasMandatoryAttribute) {
                    grunt.log.warn(currentFile + ' Line ' + index + ': (' + name + ') ' + currentLine);
                    index++;
                    hasError = true;
                }
            }
        }
    }
};
