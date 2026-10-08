/* The plugin from the tutorial: a definition function with a single
   options parameter, default options that double as the validation
   shape, an errors map and an export. */
'use strict'

module.exports = shop

function shop(options) {
  const seneca = this

  seneca.add('role:shop,cmd:total', function (msg, reply) {
    if ('number' !== typeof msg.net) {
      return reply(seneca.error('invalid_net', { net: msg.net }))
    }

    const total = Math.round(msg.net * (1 + options.tax) * 100) / 100

    reply({
      net: msg.net,
      tax: options.tax,
      total: total,
      currency: options.currency,
    })
  })

  return {
    exports: {
      currency: options.currency,
    },
  }
}

shop.defaults = {
  currency: 'EUR',
  tax: 0.2,
}

shop.errors = {
  invalid_net: 'The net amount must be a number, not <%=net%>.',
}
