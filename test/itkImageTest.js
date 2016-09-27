const path = require('path');
const assert = require('chai').assert;

const itk = require(path.resolve(__dirname, '..', 'dist', 'itk.js'));

describe('Image', function() {
  describe('#dimension', function() {
    it('should have the same dimension passed to the constructor', function() {
      let image = new itk.Image(2);
      assert.equal(image.dimension, 2);

      image = new itk.Image(3);
      assert.equal(image.dimension, 3);
    });
  });
});
