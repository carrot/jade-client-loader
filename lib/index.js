const jade = require('jade')
const Joi = require('joi')

module.exports = function (source) {
  this.cacheable && this.cacheable(true)

  const _opts = (this.options ? this.options.jade : {}) || {}
  const schema = Joi.object().keys({
    filename: Joi.string().default(this.resourcePath),
    pretty: Joi.boolean().default(true),
    doctype: Joi.string(),
    self: Joi.boolean(),
    debug: Joi.boolean(),
    compileDebug: Joi.boolean(),
    cache: Joi.boolean(),
    compiler: Joi.func(),
    parser: Joi.func(),
    globals: Joi.array().single(),
    locals: Joi.object()
  })

  // validate options
  const validated = Joi.validate(_opts, schema)
  if (validated.error) { throw validated.error }
  const opts = validated.value

  // compile the template to a function
  const tpl = jade.compileClientWithDependenciesTracked(source, opts)

  // add all dependencies to webpack
  tpl.dependencies.map(this.addDependency.bind(this))

  // require jade helpers, export the template itself
  return `var jade = require('jade/runtime'); module.exports = ${tpl.body}`
}
