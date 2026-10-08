/* Copyright (c) 2026 Richard Rodger and other contributors, MIT License */
'use strict'

// A small plugin written in the style Seneca 4 expects: a definition
// function with a single options parameter that uses `this` as the
// Seneca instance, plain default options (a Gubu shape), an errors map
// and exports. The tests validate it and load it into Seneca.

module.exports = sample

function sample(options) {
  const seneca = this

  seneca.add('role:sample,cmd:greet', function (msg, reply) {
    const name = null == msg.name ? options.name : msg.name

    if ('' === name) {
      // seneca.error builds the error from the errors map below.
      return reply(
        seneca.error('empty_name', { pattern: 'role:sample,cmd:greet' }),
      )
    }

    reply({ greeting: options.greeting + ', ' + name + options.punctuation })
  })

  return {
    exports: {
      greeting: options.greeting,
    },
  }
}

// Defaults double as the validation shape: each value fixes the type of
// the option, so `greeting: 123` is rejected when the plugin loads.
sample.defaults = {
  greeting: 'Hello',
  name: 'World',
  punctuation: '!',
}

sample.errors = {
  empty_name: 'The name for <%=pattern%> must not be empty.',
}
