Package.describe({
  summary: "helper to create reusable and extendable collection queries"
});

Package.on_use(function (api) {
  api.use(['underscore', 'mongo-livedata']);
  api.add_files(['query-builder.js']);
});

Package.on_test(function (api) {
  api.use(['query-builder', 'tinytest']);
  api.add_files(['query-builder-test.js']);
});
