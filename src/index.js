/**
 * Jdigi
 *
 * Copyright 2014, Bob Jamison
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


/* global angular: false */

import {Digi} from "./digi";
import {Tuner} from "./tuner";


var app = angular.module('JdigiApp', ['ui.bootstrap']);


app.controller("MainController", ['$scope', function ($scope) {
    var digi = new Digi();
    $scope.digi = digi;
    digi.start();

    $scope.toolbar = {
        get tx() {
            return digi.getTxMode();
        },
        set tx(v) {
            digi.setTxMode(v);
        },
        get afc() {
            return digi.getUseAfc();
        },
        set afc(v) {
            digi.setUseAfc(v);
        },
        get qrz() {
            return digi.getUseQrz();
        },
        set qrz(v) {
            digi.setUseQrz(v);
        }
    };

    $scope.modes = digi.modes;
    $scope.changeMode = function (mode) {
        digi.setMode(mode);
    };
}]);


app.directive("jdigiTuner", function () {
    return {
        restrict: "E",
        replace: true,
        template: "<canvas class='jdigi-tuner' width='800px' height='250px' />",
        link: function (scope, elem, attrs) {
            var canvas = elem[0];
            var tuner = new Tuner(scope.digi, canvas);
            scope.digi.tuner = tuner;
        }
    };
});

app.directive("jdigiOutput", function () {
    return {
        restrict: "E",
        replace: true,
        template: "<textarea class='jdigi-output' readonly='true'/>",
        link: function (scope, elem, attrs) {
            var textArea = elem;
            var outtext = {
                clear: function () {
                    textArea.val("");
                },
                puttext: function (str) {
                    var txt = textArea.val() + str;
                    textArea.val(txt);
                    var ta = textArea[0];
                    ta.scrollTop = ta.scrollHeight - ta.clientHeight;
                }
            };
            scope.digi.outtext = outtext;
        }
    };
});


app.directive("jdigiInput", function () {
    return {
        restrict: "E",
        replace: true,
        template: "<textarea class='jdigi-input'/>",
        link: function (scope, elem, attrs) {
            var textArea = elem;
            var intext = {
                clear: function () {
                    textArea.val("");
                },
                puttext: function (str) {
                    var txt = textArea.val() + str;
                    textArea.val(txt);
                    var ta = textArea[0];
                    ta.scrollTop = ta.scrollHeight - ta.clientHeight;
                }
            };
            scope.digi.intext = intext;
        }
    };
});

/**
 * This is the status bar, where messages will be displayed briefly
 */
app.directive("jdigiStatus", function () {
    return {
        restrict: "E",
        replace: true,
        template: "<p class='jdigi-status'/>",
        link: function (scope, elem, attrs) {
            var field = elem;

            function clear() {
                field.html("");
            }

            var timeout = 0;

            function statout(str) {
                //console.log("setting status: " + str);
                field.html(str);
                clearTimeout(timeout);
                timeout = setTimeout(clear, 10000);
            }

            scope.digi.status = function (str) {
                statout(str);
            };
            scope.digi.error = function (str) {
                statout("error: " + str);
            };
        }//link
    };
});