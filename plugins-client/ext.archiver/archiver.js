/**
 * Archiver Plugin for Cloud9 IDE
 * 
 * Is used to extract archives (tar.gz,7z and zip). Inteded to be used when importing
 * projects to Cloud9
 * 
 * @copyright 2015, SAT, FH Technikum Wien
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */
 
define(function(require, exports, module) {

/* Define variables linking to core modules */
var ext = require("core/ext");
var ide = require("core/ide");

/* Define variables linking to client modules (extensions) */
var menus = require("ext/menus/menus");
var commands = require("ext/commands/commands");
var c9console = require("ext/console/console");
var fs = require("ext/filesystem/filesystem");
var markup = require("text!ext/archiver/archiver.xml");

var archive = false;

/* Begin declaring module */
module.exports = ext.register("ext/archiver/archiver", {
    name     : "Archiver",
    dev      : "SAT",
    alone    : true,
    deps     : [],
    type     : ext.GENERAL,
    markup   : markup,

    nodes : [],

    /* Init function (required) */ 
    init : function(){
        var _self = this;
        this.winArchiver = winArchiver;
        this.errormsgarchiver = errormsgarchiver;

        /* EventListener for IDE messages */
        ide.addEventListener("socketMessage", function(e){
            /* Checks for the end of the archiving process */
             if(e.message.type == "npm-module-exit" && archive == true){
                /* Update tree */
                require("ext/tree/tree").refresh();
                archive = false;
             }
        });
    
/* Add event Listener for the context menu */
mnuCtxTree.addEventListener("afterrender", function(){
                _self.nodes.push(
                    mnuCtxTree.insertBefore(new apf.item({
                        id : "mnuCtxTreeExtract",
                        match : "[file]",
                        visible : "{trFiles.selected.getAttribute('type')=='file'}",
                        caption : "Extract",
                        onclick : function(){
                            ext.initExtension(_self);
                            /* Get the path of the selected archive file */
                            var archivePath = trFiles.selected.getAttribute("path");
                            
                            archivePath = archivePath.replace("/workspace/","");
                            
                            /* Set archive flag */
                            archive = true;

                            /* Replaces the "." and the following characters 
                               Check the file suffixes for supported archive types*/
                            var suffix = archivePath.match(/\..*/,'');
                            var workdir = archivePath.match(/^.*\/(?=[^\/]*$)/);
                            if(workdir == null) workdir = ".";
                            if(suffix != null && archivePath.match(/\..*/,'').indexOf(".zip") > -1)c9console.evalInputCommand("unzip "+ archivePath+" -d "+workdir);
                            else if(suffix != null && archivePath.match(/\..*/,'').indexOf(".tar.gz") > -1)c9console.evalInputCommand("tar -xzf "+ archivePath+" -C "+workdir);
                            else if(suffix != null && archivePath.match(/\..*/,'').indexOf(".7z") > -1)c9console.evalInputCommand("7z e -o"+workdir+ " " + archivePath);
                            else{
                                _self.errormsgarchiver.setValue("The target archive type is not supported!<br> Please use one of the following archive types \".zip, .tar.gz, .7z\".");
                                _self.winArchiver.setTitle("Error: Archive type is not supported!");
                                _self.winArchiver.show();
                            }
                        }
                    }), itemCtxTreeNewFile),
                    mnuCtxTree.insertBefore(new apf.divider({
                        visible : "{mnuCtxTreeExtract.visible}"
                    }), itemCtxTreeNewFile)
                );
            });

    },
    /* hook function (optional) Is called when extension registers itself. When defined use "ext.initExtension(this);" to register extension */
    hook : function(){
        var _self = this;
        ext.initExtension(this);
    },
    /* Required: Used when enabled/disabled from windows menu */
    enable : function(){
        this.nodes.each(function(item){
            item.enable();
        });
    },

    disable : function(){
        this.nodes.each(function(item){
            item.disable();
        });
    },
    /* Required: Used when diabled in the extension manager */
    destroy : function(){
        this.nodes.each(function(item){
            item.destroy(true, true);
        });
        this.nodes = [];
    },

    /* Function that simply closes the window */
     closeArchiverWindow : function(){
        this.winArchiver.hide();
     },
    
});

});
