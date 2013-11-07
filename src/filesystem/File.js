/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $ */

define(function (require, exports, module) {
    "use strict";
    
    var FileSystemEntry     = require("filesystem/FileSystemEntry");
    
    
    /*
     * @constructor
     * Model for a File.
     *
     * This class should *not* be instantiated directly. Use FileSystem.getFileForPath,
     * FileSystem.resolve, or Directory.getContents to create an instance of this class.
     *
     * See the FileSystem class for more details.
     *
     * @param {!string} fullPath The full path for this File.
     * @param {!FileSystem} fileSystem The file system associated with this File.
     */
    function File(fullPath, fileSystem) {
        this._isFile = true;
        FileSystemEntry.call(this, fullPath, fileSystem);
    }
    
    File.prototype = Object.create(FileSystemEntry.prototype);
    File.prototype.constructor = File;
    File.prototype.parentClass = FileSystemEntry.prototype;
    
    /**
     * Contents of this file.
     */
    File.prototype._contents = null;
    
    /**
     * Read a file as text. 
     *
     * @param {string=} encoding Encoding for reading. Defaults to UTF-8.
     * @param {function (?string, string=, FileSystemStats=)} callback Callback that is passed the
     *              error code, the file's contents, and the file's new stats.
     */
    File.prototype.readAsText = function (encoding, callback) {
        if (typeof (encoding) === "function") {
            callback = encoding;
            encoding = null;
        }
        
        this._impl.readFile(this._path, encoding ? {encoding: encoding} : {}, function (err, data, stat) {
            if (!err) {
                this._stat = stat;
                // this._contents = data;
            }
            callback(err, data, stat);
        }.bind(this));
    };
    
    /**
     * Write a file.
     *
     * @param {string} data Data to write.
     * @param {string=} encoding Encoding for data. Defaults to UTF-8.
     * @param {!function (?string, FileSystemStats=)=} callback Callback that is passed the
     *              error code and the file's new stats if the write is sucessful.
     */
    File.prototype.write = function (data, encoding, callback) {
        if (typeof (encoding) === "function") {
            callback = encoding;
            encoding = "utf8";
        }
        
        callback = callback || function () {};
        
        this._fileSystem._beginWrite();
        
        this._impl.writeFile(this._path, data, encoding ? {encoding: encoding} : {}, function (err, stat) {
            try {
                if (!err) {
                    this._stat = stat;
                    // this._contents = data;
                }
                callback(err, stat);
            } catch (ex) {
                console.warn("Unhandled exception in callback: ", ex);
            } finally {
                this._fileSystem._endWrite();  // unblock generic change events
            }
        }.bind(this));
    };
    
    // Export this class
    module.exports = File;
});
