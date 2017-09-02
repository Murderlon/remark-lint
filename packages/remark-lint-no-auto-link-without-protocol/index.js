/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module no-auto-link-without-protocol
 * @fileoverview
 *   Warn for angle-bracketed links without protocol.
 *
 *   ## Fix
 *
 *   [`remark-stringify`](https://github.com/wooorm/remark/tree/master/packages/remark-stringify)
 *   adds a protocol where needed.
 *
 *   See [Using remark to fix your markdown](https://github.com/wooorm/remark-lint/tree/formatting#using-remark-to-fix-your-markdown)
 *   on how to automatically fix warnings for this rule.
 *
 * @example {"name": "valid.md"}
 *
 *   <http://www.example.com>
 *   <mailto:foo@bar.com>
 *
 *   Most markdown vendors don’t recognize the following as a link:
 *   <www.example.com>
 *
 * @example {"name": "invalid.md", "label": "input"}
 *
 *   <foo@bar.com>
 *
 * @example {"name": "invalid.md", "label": "output"}
 *
 *   1:1-1:14: All automatic links must start with a protocol
 */

'use strict';

var rule = require('unified-lint-rule');
var visit = require('unist-util-visit');
var position = require('unist-util-position');
var generated = require('unist-util-generated');
var toString = require('mdast-util-to-string');

module.exports = rule('remark-lint:no-auto-link-without-protocol', noAutoLinkWithoutProtocol);

var start = position.start;
var end = position.end;

/* Protocol expression. See:
 * http://en.wikipedia.org/wiki/URI_scheme#Generic_syntax */
var PROTOCOL = /^[a-z][a-z+.-]+:\/?/i;

function noAutoLinkWithoutProtocol(ast, file) {
  visit(ast, 'link', visitor);

  function visitor(node) {
    var head = start(node.children[0]).column;
    var tail = end(node.children[node.children.length - 1]).column;
    var initial = start(node).column;
    var final = end(node).column;

    if (generated(node)) {
      return;
    }

    if (initial === head - 1 && final === tail + 1 && !PROTOCOL.test(toString(node))) {
      file.message('All automatic links must start with a protocol', node);
    }
  }
}
