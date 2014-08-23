Package.describe({
  summary: "helper to create reusable and extendable collection queries/selectors",
  version: "1.1.0",
  git: "https://github.com/Nemo64/meteor-query-builder.git"
});

Package.on_use(function (api) {
  api.versionsFrom("METEOR-CORE@0.9.0-atm");
  api.use(['underscore', 'mongo-livedata']);
  api.add_files(['query-builder.js']);
});

Package.on_test(function (api) {
  api.use(["nemo64:query-builder", 'tinytest']);
  api.add_files(['query-builder-test.js']);
});
