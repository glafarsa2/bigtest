var errorProps = [
  'description',
  'fileName',
  'lineNumber',
  'message',
  'name',
  'number',
  'stack'
];

export default function assert(bool, text) {
  if (typeof bool === 'string' && !text) {
    throw new MirageError(bool);
  }

  if (!bool) {
    throw new MirageError(text || "Assertion failed");
  }
}

/**
  Copied from ember-metal/error
*/
export function MirageError() {
  var tmp = Error.apply(this, arguments);

  for (var idx = 0; idx < errorProps.length; idx++) {
    let prop = errorProps[idx];

    if (['description', 'message', 'stack'].indexOf(prop) > -1) {
      this[prop] = `Mirage: ${tmp[prop]}`;
    } else {
      this[prop] = tmp[prop];
    }
  }
}

MirageError.prototype = Object.create(Error.prototype);
