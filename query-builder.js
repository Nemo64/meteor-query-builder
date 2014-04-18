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
  this._filterMod = {/* filterName: boolean */};
  this._conditions = [];
};

/**
 * This little function converts a condition into a query object
 *
 * @param {Object|string} cond
 * @return {Object}
 */
Query._objectCondition = function (cond) {
  if (_.isString(cond)) {
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
   * @param {boolean|Array} args
   */
  filter: function (name, args) {
    this._filterMod[name] = args;
    // XXX should there be a warning if the filter does not exist?
  },
  
  /**
   * Gets all filters for the current collection.
   *
   * @private
   * @returns {Object.<string, Object>}
   */
  _getFilters: function () {
    var filters = this._collection._queryBuilderFilter;
    return _.isObject(filters) ? filters : {};
  },
  
  /**
   * Executes the query with the #find method on the collection.
   *
   * @param {Object.<string, *>} options
   */
  execute: function (options) {
    var conditions = _.clone(this._conditions);
    
    // applie all filter conditions
    _.each(this._getFilters(), function (filter, name) {
      var isEnabled = filter.isDefault;
      var args = [];
      if (this._filterMod.hasOwnProperty(name)) {
        var mod = this._filterMod[name];
        isEnabled = mod ? true : false;
        if (_.isArray(mod)) {
          args = mod;
        }
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
    if (conditions.length > 0) {
      selector.$and = conditions;
    }
    return this._collection.find(selector, options);
  },
  
  /**
   * Adds a condition to the query.
   * Conditions are normal selectors like you know them from mongo.
   * eg: query.condition({ name: "Max" });
   * or: query.condition("mongoIdString");
   *
   * @param {Object.<string, *>|string} cond
   */
  condition: function (cond) {
    cond = Query._objectCondition(cond);
    if (cond == null) {
      throw new Error("Unknown condition type " + typeof cond);
    }
    this._conditions.push(cond);
  }
});
