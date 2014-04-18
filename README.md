# Meteor QueryBuilder package

This package will help you create reusable queries by defining them as filters which can be enabled or disabled for a query!

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
  // executes Person.find({ deletedAt: null });
}
```
But now you are an admin and want to see deleted users:
```JavaScript
// client/views/person/person_admin_index.js
Template.PersonAdminIndex.persons = function () {
  var query = Person.query();
  query.filter('softDelete', false); // disable for this query
  return query.execute({ limit: 100 });
  // executes Person.find({});
}
```
Now you want to search a person (not admin anymore):
```JavaScript
// client/views/person/person_search_index.js
Template.PersonSearchIndex.persons = function () {
  var query = Person.query({ name: "Max" });
  
  // you could disable/enable filters here
  
  return query.execute({ limit: 100 });
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
  query.filter('employedAt', [company]);
  return query.execute({ limit: 100 });
  // executes Person.find({ $and: [{ employedAt: "[company id]" }, { deletedAt: null }] });
}
```

## API
coming soon...
