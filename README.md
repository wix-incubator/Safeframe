========================================================
  DeviantArt's IAB SafeFrames Implementation
========================================================

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

======================================
Browser Support
======================================

This library should work on all modern browsers, but it will not work on
Interenet Explorer versions prior to version 9.

======================================
Files and Directories
======================================

  /src
        This contains the actual javascript and HTML source required
		
  /dist
        This contains the production ready code that we use on our site.

  /demos
        This contains various demo pages, that load the [demos/guest.html][demos/guest.html]
        in an iframe and demonstrate various features and functionality.


=======================================
LICENCE
=======================================

Copyright (c) 2017, DeviantArt Inc.
All rights reserved.

See [LICENSE.md](LICENSE.md)
