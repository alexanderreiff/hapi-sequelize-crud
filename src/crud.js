import joi from 'joi';
import error from './error';
import _ from 'lodash';

let prefix;

export default (server, model, options) => {
  prefix = options.prefix;

//   list(server, model);
  get(server, model);
  scope(server, model);
  create(server, model);
  destroy(server, model);
  destroyScope(server, model);
  update(server, model);
}

/*
export const list = (server, model) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${model._plural}`,

    @error
    async handler(request, reply) {
      if (request.query.include)
        var include = [request.models[request.query.include]];

      let where = _.omit(request.query, 'include');

      for (const key of Object.keys(where)) {
        try {
          where[key] = JSON.parse(where[key]);
        } catch (e) {
          //
        }
      }

      let list = await model.findAll({
        where, include
      });

      reply(list);
    }
  });
}
*/

export const get = (server, model) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${model._plural}/{id?}`,

    @error
    async handler(request, reply) {
      if (request.query.include)
        var include = [request.models[request.query.include]];

      let where = request.params.id ? { id : request.params.id } : _.omit(request.query, 'include');

      for (const key of Object.keys(where)) {
        try {
          where[key] = JSON.parse(where[key]);
        } catch (e) {
          //
        }
      }

      let instance = await model[request.params.id ? 'findOne' : 'findAll']({ where, include });

      reply(instance);
    },
    config: {
      validate: {
        params: joi.object().keys({
          id: joi.number().integer()
        })
      }
    }
  })
}

export const scope = (server, model) => {
  let scopes = Object.keys(model.options.scopes);

  server.route({
    method: 'GET',
    path: `${prefix}/${model._plural}/{scope}`,

    @error
    async handler(request, reply) {
      if (request.query.include)
        var include = [request.models[request.query.include]];

      let where = _.omit(request.query, 'include');

      for (const key of Object.keys(where)) {
        try {
          where[key] = JSON.parse(where[key]);
        } catch (e) {
          //
        }
      }

      let list = await model.scope(request.params.scope).findAll({ include, where });

      reply(list);
    },
    config: {
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes)
        })
      }
    }
  });
}

export const create = (server, model) => {
  server.route({
    method: 'POST',
    path: `${prefix}/${model._plural}`,

    @error
    async handler(request, reply) {
      let instance = await model.create(request.payload);

      reply(instance);
    }
  })
}

export const destroy = (server, model) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${model._plural}/{id?}`,

    @error
    async handler(request, reply) {
      let where = request.params.id ? { id : request.params.id } : request.query;

      for (const key of Object.keys(where)) {
        try {
          where[key] = JSON.parse(where[key]);
        } catch (e) {
          //
        }
      }

      let list = await model.findAll({ where });

      await* list.map(instance => instance.destroy());

      reply(list.length === 1 ? list[0] : list);
    }
  })
}

export const destroyScope = (server, model) => {
  let scopes = Object.keys(model.options.scopes);

  server.route({
    method: 'DELETE',
    path: `${prefix}/${model._plural}/{scope}`,

    @error
    async handler(request, reply) {
      if (request.query.include)
        var include = [request.models[request.query.include]];

      let where = _.omit(request.query, 'include');

      for (const key of Object.keys(where)) {
        try {
          where[key] = JSON.parse(where[key]);
        } catch (e) {
          //
        }
      }

      let list = await model.scope(request.params.scope).findAll({ include, where });

      await* list.map(instance => instance.destroy());

      reply(list);
    },
    config: {
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes)
        })
      }
    }
  });
}

export const update = (server, model) => {
  server.route({
    method: 'PUT',
    path: `${prefix}/${model._plural}/{id}`,

    @error
    async handler(request, reply) {
      let instance = await model.findOne({
        where: {
          id: request.params.id
        }
      });

      await instance.update(request.payload);

      reply(instance);
    }
  })
}

import * as associations from './associations/index';
export { associations };
