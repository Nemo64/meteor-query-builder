// The collection will be extended with:
// - query()
// - addFilter()
// - defaultFilters()
// - filters()
// - _queryBuilderfilter
_.extend(Meteor.Collection.prototype, {
  /**
   * Creates a Query instance
   *
   * @param {Object=} cond
   */
  query: function (cond) {
    var query = new Query(this);
    if (cond != null) {
      query.condition(cond);
    }
    return query;
  },
  
  /**
   * Adds a filter to the filter list for the current collection
   */
  addFilter: function (name, isDefault, value) {
    if (! _.isObject(this._queryBuilderFilter)) {
      this._queryBuilderFilter = {};
    }
    var correctType = _.isFunction(value) || _.isObject(value);
    if (! correctType) {
      var msg = "A filter must be an object or a function, got " + typeof value;
      throw new Error(msg);
    }
    
    this._queryBuilderFilter[name] = {
      isDefault: !!isDefault,
      value: value
    };
  },
  
  /**
   * shortcut for addFilter with default true
   */
  defaultFilters: function (obj) {
    _.each(obj, function (value, name) {
      this.addFilter(name, true, value);
    }, this);
  },
  
  /**
   * shortcut for addFilter with default false
   */
  filters: function (obj) {
    _.each(obj, function (value, name) {
      this.addFilter(name, false, value);
    }, this);
  }
  
});

/**
 * @constructor
 * @param {Meteor.Collection} collection
 */
Query = function (collection) {
  this._collection = collection;
  this._filterMod = {/* filterName: { enabled: boolean, args: [] } */};
  this._conditions = [];
};

/**
 * This little function converts a condition into a query object
 *
 * @param {Object|string} cond
 * @return {Object}
 */
Query._objectCondition = function (cond) {
  if (_.isString(cond) || (cond instanceof Meteor.Collection.ObjectID)) {
    return { _id: cond };
  } else if (_.isObject(cond)) {
    return cond;
  } else {
    return null;
  }
};

_.extend(Query.prototype, {
  /**
   * enables or disables a filter.
   * If the secound parameter is an array the values will
   * be applied as arguments to the filter function (if it is a function)
   * 
   * @param {string} name
   * @param {boolean} enable
   * @param {boolean|Array} args
   */
  filter: function (name, enable, args) {
    if (args != null && !_.isArray(args)) {
      throw new Error("filter arguments must be an array, got " + typeof args);
    }
    this._filterMod[name] = { enabled: enable, args: args || [] };
    if (! this._getFilters().hasOwnProperty(name)) {
      console.warn("The filter '" + name + "' does not exist", this._collection);
    }
  },
  
  /**
   * Gets all filters for the current collection.
   *
   * @private
   * @returns {!Object.<string, Object>}
   */
  _getFilters: function () {
    if (! _.isObject(this._collection._queryBuilderFilter)) {
      this._collection._queryBuilderFilter = {};
    }
    return this._collection._queryBuilderFilter;
  },
  
  /**
   * Builds the query and returns it!
   * Outside of #execute this is mostly usefull for tests and debugging.
   *
   * @returns {!Object.<string, *>}
   */
  build: function () {
    var conditions = _.clone(this._conditions);
    
    // apply all filter conditions
    _.each(this._getFilters(), function (filter, name) {
      var isEnabled = filter.isDefault;
      var args = [];
      if (this._filterMod.hasOwnProperty(name)) {
        var mod = this._filterMod[name];
        isEnabled = mod.enabled;
        args = mod.args;
      }
      if (isEnabled) {
        // TODO the callback probably wants some parameters
        var cond = filter.value;
        if (_.isFunction(filter.value)) {
          cond = cond.apply(this, args);
        }
        cond = Query._objectCondition(cond);
        if (cond != null) {
          conditions.push(cond);
        }
      }
    }, this);
    
    var selector = {};
    if (conditions.length == 1) {
      selector = conditions[0];
    } else if (conditions.length > 1) {
      selector.$and = conditions;
    }
    return selector;
  },
  
  /**
   * Executes the query with the #find method on the collection.
   *
   * @param {Object.<string, *>} options
   */
  execute: function (options) {
    var selector = this.build();
    return this._collection.find(selector, options);
  },
  
  /**
   * Adds a condition to the query.
   * Conditions are normal selectors like you know them from mongo.
   * eg: query.condition({ name: "Max" });
   * or: query.condition("mongoIdString");
   *
   * @param {Object.<string, *>|string} rawCond
   */
  condition: function (rawCond) {
    var cond = Query._objectCondition(rawCond);
    if (cond == null) {
      throw new Error("Unknown condition type " + rawCond);
    }
    this._conditions.push(cond);
  }
});
