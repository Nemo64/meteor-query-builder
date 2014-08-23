# Meteor QueryBuilder package

This package will help you create reusable queries by defining them as filters
which can be enabled or disabled for a query!

This way you avoid messy queries all over your project and changes in your
collections (like adding user restrictions) are very easy.

[View API Documentation on GitHub](https://github.com/Nemo64/meteor-query-builder#api)

## Examples
### soft-delete
```JavaScript
// both/collections/person.js
Person = new Meteor.Collection('person');

// define query additions that are always added to every query
Person.defaultFilters({
  softDelete: { deletedAt: null }
});
```
Think now of a list of all users you application has:
```JavaScript
// client/views/person/person_index.js
Template.PersonIndex.persons = function () {
  return Person.query().execute({ limit: 100 });
  // executes Person.find({ deletedAt: null }, { limit: 100 });
}
```
But now you are an admin and want to see deleted users:
```JavaScript
// client/views/person/person_admin_index.js
Template.PersonAdminIndex.persons = function () {
  var query = Person.query();
  query.filter('softDelete', false); // disable for this query
  return query.execute({ limit: 100 });
  // executes Person.find({}, { limit: 100 });
}
```
Now you want to search a person (not admin anymore):
```JavaScript
// client/views/person/person_search_index.js
Template.PersonSearchIndex.persons = function () {
  var query = Person.query({ name: "Max" });
  
  // you could disable/enable filters here
  
  return query.execute();
  // executes Person.find({ $and: [{ name: "Max" }, { deletedAt: null }] });
}
```
### normal filters
```JavaScript
// both/collections/person.js
Person = new Meteor.Collection('person');

// these filters are enabled by default
Person.defaultFilters({
  softDelete: { deletedAt: null }
});

// these filters are disabled by default
Person.filters({
  employedAt: function (company) {
    return { employedAt: company._id };
  }
  // heads up: normal filters can be simple object too
  // but in this example the filter is a function
});
```
```JavaScript
// client/views/company/company_person_index.js
Template.CompanyPersonIndex.persons = function (company) {
  var query = Person.query();
  query.filter('employedAt', true, [company]);
  return query.execute();
  // executes Person.find({
  //   $and: [{ employedAt: "[company id]" }, { deletedAt: null }]
  // });
}
```

## API
The following methods are the ones you should use.
There are more methods available if you study the source,
but only those listed here are safe to use and won't change in the near future.
Methods you shouldn't use are marked with an `_` prefix on there names.

All methods described here are available on both the client and the server
so there is no restriction to it unless told otherwise.

## `Collection` methods
These methods are added to the meteors Collection prototype
so they are available on every collection you have in your app.

#### `collection.filters(methods)`
Adds filters to the collection which are by default disabled.
Calling this method more then once will add the new filters, not replace them.
However, if a filter is defined that already exists, it will be overwritten.
##### Arguments
- **methods** Object <br>
  Dictionary whose keys are filter names and values are functions
  or [Mongo Selectors (object or string)](http://docs.meteor.com/#selectors).

#### `collection.defaultFilters(methods)`
The same as [filter](#collectionfiltersmethods) but by default enabled.

#### `collection.query([selector])`
Creates a [Query](#query) object to build the query with.
##### Arguments
- **selector** [Mongo Selector (object or string)](http://docs.meteor.com/#selectors) <br>
  This argument is exactly the same as the one on the
  [find](http://docs.meteor.com/#find) method of meteor.


## `Query` object
This object abstracts the query sent to the [find](http://docs.meteor.com/#find) method.
It can be created with the collection method [query](#collectionqueryselector)
and can be executed with the properly named method [execute](#queryexecuteoptions)

#### `Query.execute([options])`
Builds the query and passes it to the [find](http://docs.meteor.com/#find) method.
The option parameter is the same as the one of find.
##### Arguments
- **Options** Object <br>
  This argument is exactly the same as the one on the
  [find](http://docs.meteor.com/#find) method of meteor.

#### `Query.filter(name, enable, [args])`
This method can change which filter will be used for that query.
If the name of the filter does not exist a warning will be given though `console.warn`
##### Arguments
- **name** String <br>
  The name of the filter which should be enabled or disabled.
- **enable** Boolean <br>
  A boolean to enable or disable this filter.
- **args** Array <br>
  These values will be passed to the filter function (if it is a function).
  It will be ignored if *enable* is `false`.

#### `Query.condition(selector)`
Adds another selector to the query. It will be executed just like a filter (with an `$and`).
##### Arguments
- **selector** [Mongo Selector (object or string)](http://docs.meteor.com/#selectors) <br>
  This argument is exactly the same as the one on the [find](http://docs.meteor.com/#find) method of meteor.


## Contributing and Feedback
Every kind of Contributing and/or Feedback is welcome. If an issue or a pull request isn't what you need you can contact me at cheat2000-git [at] yahoo.de or talk about it on [google groups](https://groups.google.com/d/topic/meteor-talk/dkgLpPppOFU/discussion)
