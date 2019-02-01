const {buildTree} = require('../');
const {tokenize} = require('excel-formula-tokenizer');
const {deepStrictEqual} = require('assert');
const builder = require('../lib/node-builder');

describe('operators', function() {
  describe('precendence', function() {
    it('1 + 2 >= 3 - 4', function() {
      const tree = buildTree(tokenize('1 + 2 >= 3 - 4'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '>=',
          builder.binaryExpression('+', builder.number(1), builder.number(2)),
          builder.binaryExpression('-', builder.number(3), builder.number(4)),
        ),
      );
    });

    it('1 + 2 & "a"', function() {
      const tree = buildTree(tokenize('1 + 2 & "a"'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '&',
          builder.binaryExpression('+', builder.number(1), builder.number(2)),
          builder.text('a'),
        ),
      );
    });

    it('1 + 2 * 3', function() {
      const tree = buildTree(tokenize('1 + 2 * 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '+',
          builder.number(1),
          builder.binaryExpression('*', builder.number(2), builder.number(3)),
        ),
      );
    });

    it('1 * 2 ^ 3', function() {
      const tree = buildTree(tokenize('1 * 2 ^ 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '*',
          builder.number(1),
          builder.binaryExpression('^', builder.number(2), builder.number(3)),
        ),
      );
    });

    it('(1 * 2) ^ 3', function() {
      const tree = buildTree(tokenize('(1 * 2) ^ 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '^',
          builder.binaryExpression('*', builder.number(1), builder.number(2)),
          builder.number(3),
        ),
      );
    });
  });

  // everything is left associative
  describe('associativity', function() {
    it('1 + 2 + 3', function() {
      const tree = buildTree(tokenize('1 + 2 + 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '+',
          builder.binaryExpression('+', builder.number(1), builder.number(2)),
          builder.number(3),
        ),
      );
    });

    it('1 + (2 + 3)', function() {
      const tree = buildTree(tokenize('1 + (2 + 3)'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '+',
          builder.number(1),
          builder.binaryExpression('+', builder.number(2), builder.number(3)),
        ),
      );
    });

    it('1 / 2 / 3', function() {
      const tree = buildTree(tokenize('1 / 2 / 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '/',
          builder.binaryExpression('/', builder.number(1), builder.number(2)),
          builder.number(3),
        ),
      );
    });

    it('1 + SUM(A2:A23)', function() {
      const tree = buildTree(tokenize('1 + SUM(A2:A23)'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '+',
          builder.number(1),
          builder.functionCall(
            'SUM',
            builder.cellRange(
              builder.cell('A2', 'relative'),
              builder.cell('A23', 'relative'),
            ),
          ),
        ),
      );
    });
  });
});
