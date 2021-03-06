/*
 * jQuery Table of Content Generator for Markdown v1.0
 *
 * https://github.com/dafi/tocmd-generator
 * Examples and documentation at: https://github.com/dafi/tocmd-generator
 *
 * Requires: jQuery v1.7+
 *
 * Copyright (c) 2013 Davide Ficano
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function($) {
    // var toggleHTML = '<span class="toctoggle">[<a id="toctogglelink" class="internal" href="#">%2</a>]</span><h2>%1</h2>';
    var toggleHTML = '<h2>%1</h2>';
    var tocContainerHTML = '%1<ul>%2</ul>';

    function createLevelHTML(anchorId, tocLevel, tocSection, tocNumber, tocText, tocInner) {
        var link = '<a href="#%1">%3</a>%4'
            .replace('%1', anchorId)
            .replace('%2', tocNumber)
            .replace('%3', tocText)
            .replace('%4', tocInner ? tocInner : '');
        return '<li class="toclevel-%1 tocsection-%2">%3</li>\n'
            .replace('%1', tocLevel)
            .replace('%2', tocSection)
            .replace('%3', link);
    }

    $.fn.toc = function(settings) {
        var config = {
            renderIn: 'self',
            anchorPrefix: 'tocAnchor-',
            showAlways: false,
            minItemsToShowToc: 2,
            saveShowStatus: true,
            contentsText: 'Contents:',
            hideText: 'hide',
            showText: 'show',
            showCollapsed: false};

        if (settings) {
            $.extend(config, settings);
        }

        var tocHTML = '';
        var tocLevel = 1;
        var tocSection = 1;
        var itemNumber = 1;

        var tocContainer = $(this);
        var usedAnchors = {};

        function fixAnchorId(el, extra) {
            var anchorId = $(el).attr('id');
            if (!anchorId) {
                anchorId = $(el).text().toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");
            }
            if (usedAnchors[anchorId]) {
                anchorId += extra;
            }
            usedAnchors[anchorId] = true;
            $(el).attr('id', anchorId);
            return anchorId;
        }

        tocContainer.find('h2').each(function() {
            var levelHTML = '';
            var innerSection = 0;
            var h2 = $(this);

            h2.nextUntil('h2').filter('h3').each(function() {
                ++innerSection;
                var anchorId = fixAnchorId(this, tocLevel + '-' + tocSection + '-' + innerSection);
                levelHTML += createLevelHTML(anchorId,
                    tocLevel + 1,
                    tocSection + innerSection,
                    itemNumber + '.' + innerSection,
                    $(this).text());
            });
            if (levelHTML) {
                levelHTML = '<ul>' + levelHTML + '</ul>\n';
            }
            var anchorId = fixAnchorId(this, tocLevel + '-' + tocSection);
            tocHTML += createLevelHTML(anchorId,
                tocLevel,
                tocSection,
                itemNumber,
                h2.text(),
                levelHTML);

            tocSection += 1 + innerSection;
            ++itemNumber;
        });

        // for convenience itemNumber starts from 1
        // so we decrement it to obtain the index count
        var tocIndexCount = itemNumber - 1;

        var show = config.showAlways ? true : config.minItemsToShowToc <= tocIndexCount;

        // check if cookie plugin is present otherwise doesn't try to save
        if (config.saveShowStatus && typeof($.cookie) == "undefined") {
            config.saveShowStatus = false;
        }

        if (show && tocHTML) {
            var replacedToggleHTML = toggleHTML
                .replace('%1', config.contentsText)
                .replace('%2', config.hideText);
            var replacedTocContainer = tocContainerHTML
                .replace('%1', replacedToggleHTML)
                .replace('%2', tocHTML);

            // Renders in default or specificed path
            if (config.renderIn != 'self') {
                $(config.renderIn).html(replacedTocContainer);
            } else {
                tocContainer.prepend(replacedTocContainer);
            }

            $('#toctogglelink').click(function() {
                var ul = $($('#toc ul')[0]);

                if (ul.is(':visible')) {
                    ul.hide();
                    $(this).text(config.showText);
                    if (config.saveShowStatus) {
                        $.cookie('toc-hide', '1', { expires: 365, path: '/' });
                    }
                    $('#toc').addClass('tochidden');
                } else {
                    ul.show();
                    $(this).text(config.hideText);
                    if (config.saveShowStatus) {
                        $.removeCookie('toc-hide', { path: '/' });
                    }
                    $('#toc').removeClass('tochidden');
                }
                return false;
            });

            if (config.saveShowStatus && $.cookie('toc-hide')) {
                var ul = $($('#toc ul')[0]);

                ul.hide();
                $('#toctogglelink').text(config.showText);
                $('#toc').addClass('tochidden');
            }

            if (config.showCollapsed) {
                $('#toctogglelink').click();
            }
        }
        return this;
    }
})(jQuery);
