# brettle:workaround-issue-5110

[![Build Status](https://travis-ci.org/brettle/meteor-workaround-issue-5110.svg?branch=master)](https://travis-ci.org/brettle/meteor-workaround-issue-5110)

Workaround [Meteor issue #5110](https://github.com/meteor/meteor/issues/5100) so
that `accounts-ui-unstyled` (and derived packages) ignores some errors thrown
during login.

## Installation

```sh
meteor add brettle:workaround-issue-5110
```

## Usage

Call `WorkaroundIssue5110.addIgnoredMessage(message)` to add `message` to the
list of ignored messages. Whenever `accounts-ui-unstyled` would display
`message` as an error, it will instead close the dropdown. Call
`WorkaroundIssue5110.removeIgnoredMessage(message)` to remove the message from
the list of ignored messages.

## How it Works

It overrides `Accounts._loginButtonsSession.errorMessage`.
