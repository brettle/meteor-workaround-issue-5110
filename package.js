"use strict";

Package.describe({
  name: 'brettle:workaround-issue-5110',
  version: '0.0.2',
  summary:
    'Workaround Meteor issue 5110 by making account-ui-unstyled ignore some ' +
    'error messages.',
  git: 'https://github.com/brettle/meteor-workaround-issue-5110.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.4');
  api.use('underscore', 'client');
  api.use('accounts-base', 'client');
  api.use('accounts-ui-unstyled', 'client', { weak: true });
  api.use('tracker', 'client');
  api.export('WorkaroundIssue5110');
  api.addFiles('workaround-issue-5110.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('test-helpers');
  api.use('templating');
  api.use('tracker');
  api.use('accounts-base');
  api.use('accounts-password');
  api.use('accounts-ui');
  api.use('brettle:workaround-issue-5110');
  api.addFiles('workaround-issue-5110-tests.js');
});
