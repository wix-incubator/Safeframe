DeviantArt's IAB SafeFrames Implementation
==========================================

SafeFrames is a specification that allows a publishing website 
to display advertising content in a way that does not allow
for advertisements to compromise the security or integrity
of the publisher's site and content.

SafeFrames allows advertisers to obtain data, such as 
viewability and take advantage of advanced features such
as expansion, at the publisher's discretion.

Also view:
 * [IAB SafeFrame Site](http://www.iab.net/safeframe)
 * [Live SafeFrame Samples and Tools](http://safeframes.net/)

This implementation should be compliant with the [IAB SafeFrames v1.1
Draft](https://www.iab.com/wp-content/uploads/2014/08/SafeFrames_v1.1_final.pdf).

On DeviantArt we use server side rendering of the iframes, and the parts of the
spec related to client-side rendering are missing from this implementation.

Browser Support
===============
This library should work on all modern browsers, but it will not work on
Interenet Explorer versions prior to version 9.

Files and Directories
=====================

  * `/src` This folder contains the actual javascript and HTML source required
  * `/dist` This folder contains the production ready code that we use on our site.
  * `/demos` This folder contains various demo pages, that load the [demos/visibility.html](demos/visibility.html) in an iframe and demonstrate various features and functionality.
  * `/test` This folder contains the automated tests files.

Security
========
This implementation uses a simple secret key to pass configuration between the host and the guest. It was never meant to provide a buletproof cryptographic security, but it is a handy feature to have. The key is kept in the `secret.key` file, which is regenerated on every build. To prevent it from being committed to the repo, please tell your git config to ignore any working directory changes for this file and always use the index version:
`git update-index --skip-worktree secret.key`

LICENCE
=======

Copyright (c) 2017, DeviantArt Inc.
All rights reserved.

See [LICENSE.md](LICENSE.md)
