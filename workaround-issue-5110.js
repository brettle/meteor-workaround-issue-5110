// Workaround Meteor issue #5110 by closing the login dropdown when
// the error reason thrown when adding a service is detected.

"use strict";
/* globals Accounts, WorkaroundIssue5110: true */

function WorkaroundIssue5110Constructor() {
  var self = this;
  self._ignoredMessages = {};
  if (! Package['accounts-ui-unstyled']) {
    return;
  }

  var albs = Accounts._loginButtonsSession;
  if (! albs || typeof(albs.errorMessage) !== 'function' ||
    typeof(albs.closeDropdown) !== 'function') {
    throw new Error("brettle:workaround-issue-5110 is not compatible with " +
      "installed version of accounts-ui-unstyled");
  }
  var origErrorMessage = albs.errorMessage;
  albs.errorMessage = function (message) {
    if (self._ignoredMessages[message]) {
      return albs.closeDropdown();
    }
    return origErrorMessage.apply(albs, arguments);
  };
}

_.extend(WorkaroundIssue5110Constructor.prototype, {
  addIgnoredMessage: function (msg) {
    var self = this;
    self._ignoredMessages[msg] = true;
  },

  removeIgnoredMessage: function (msg) {
    var self = this;
    delete self._ignoredMessages[msg];
  }

});

WorkaroundIssue5110 = new WorkaroundIssue5110Constructor();
