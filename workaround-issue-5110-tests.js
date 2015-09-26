/* globals Accounts, renderToDiv, clickElement, DomUtils, AccountsAddService,
   WorkaroundIssue5110
 */
"use strict";

if (Meteor.isServer) {
  var attemptCallbackStopper;
  Meteor.methods({
    removeUser: function (email) {
      Meteor.users.remove({
        'emails[0].address': email
      });
    },
    addAttemptCallback: function (msg) {
      attemptCallbackStopper = Accounts.validateLoginAttempt(function () {
        if (msg) {
          throw new Meteor.Error(Accounts.LoginCancelledError.numericError,
            msg);
        }
        return true;
      });
    },
    removeAttemptCallback: function () {
      if (attemptCallbackStopper) {
        attemptCallbackStopper.stop();
      }
      attemptCallbackStopper = undefined;
    }
  });
}

if (Meteor.isClient) {
  Tinytest.add(
    'brettle:workaround-issue-5110 - unit test',
    function (test) {
      var albs = Accounts._loginButtonsSession;
      var closeDropdown = albs.closeDropdown;
      var closeDropdownCalls = 0, expectedCloseDropdownCalls = 0;
      Accounts._loginButtonsSession.closeDropdown = function (/* arguments */) {
        closeDropdownCalls++;
        return closeDropdown.apply(Accounts._loginButtonsSession, arguments);
      };
      albs.errorMessage('Message to ignore');
      test.equal(closeDropdownCalls, expectedCloseDropdownCalls,
        'before addIgnoredMessage()'
      );

      WorkaroundIssue5110.addIgnoredMessage('Message to ignore');
      albs.errorMessage('Message to ignore');
      expectedCloseDropdownCalls++;
      test.equal(closeDropdownCalls, expectedCloseDropdownCalls,
        'after addIgnoredMessage()'
      );

      WorkaroundIssue5110.removeIgnoredMessage('Message to ignore');
      albs.errorMessage('Message to ignore');
      test.equal(closeDropdownCalls, expectedCloseDropdownCalls,
        'after removeIgnoredMessage()');
    }
  );

  Tinytest.addAsync(
    'brettle:workaround-issue-5110 - acceptance test',
    function (test, done) {
      var loginFailureStopper;
      var div;
      WorkaroundIssue5110.addIgnoredMessage("message to ignore");
      Meteor.logout(function (error) {
        test.isUndefined(error, 'Unexpected error during logout');
        removeUser();
      });
      function removeUser() {
        Meteor.call('removeUser', 'testuser5110@example.com', function (error) {
          test.isUndefined(error, 'Unexpected error in removeUser');
          addAttemptCallback();
        });        
      }
      function addAttemptCallback() {
        Meteor.call('addAttemptCallback',
          "message to ignore",
          function (error) {
            test.isUndefined(error, 'Unexpected error in addAttemptCallback');
            createUser();
          }
        );
      }
      function createUser() {
        div = renderToDiv(Template.loginButtons);
        document.body.appendChild(div);
        Tracker.flush();
        clickElement(div.querySelector('#login-sign-in-link'));
        Tracker.flush();
        var signUpLink = div.querySelector('#signup-link');
        if (signUpLink) {
          clickElement(signUpLink);
        }
        DomUtils.setElementValue(div.querySelector('#login-email'),
          'testuser5110@example.com');
        DomUtils.setElementValue(div.querySelector('#login-password'),
          'password');
        clickElement(div.querySelector('#login-buttons-password'));
        loginFailureStopper = Accounts.onLoginFailure(updatePage);
      }
      function updatePage() {
        loginFailureStopper.stop();
        Tracker.flush();
        Meteor.setTimeout(checkDropdown, 0);
      }
      function checkDropdown() {
        var errorMessageElem = div.querySelector('.error-message');
        test.isNull(errorMessageElem, 'There should not be an error message');
        var loginDropdownListElem = div.querySelector('#login-dropdown-list');
        test.isNull(loginDropdownListElem, 'The dropdown should be closed');
        cleanUp();
      }
      function cleanUp() {
        document.body.removeChild(div);
        WorkaroundIssue5110.removeIgnoredMessage("message to ignore");
        Meteor.call('removeAttemptCallback', function (error) {
          test.isUndefined(error, 'Unexpected error in removeAttemptCallback');
          done();
        });
      }
    }
  );
}
